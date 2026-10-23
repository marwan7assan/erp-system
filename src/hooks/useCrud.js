import { useCallback, useEffect, useState } from "react";
import { USE_API } from "../config/dataSource";
import i18n from "../i18n";

const listFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  return response?.items || response?.data || response?.results || [];
};

const itemFromResponse = (response) => response?.item || response?.data || response;

export default function useCrud(initialItems = [], initialForm = {}, createId, resourceApi) {
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(Boolean(USE_API && resourceApi));
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultCreateId = useCallback((currentItems) => {
    if (!currentItems || currentItems.length === 0) return 1001;
    const firstId = currentItems[0]?.id;
    if (typeof firstId === "number") {
      return Math.max(...currentItems.map((item) => Number(item.id) || 0)) + 1;
    }
    const match = String(firstId).match(/^([A-Za-z]+-?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const maxNum = Math.max(
        ...currentItems.map((item) => {
          const m = String(item.id).match(/^([A-Za-z]+-?)(\d+)$/);
          return m ? parseInt(m[2], 10) : 0;
        })
      );
      const digits = match[2].length;
      return `${prefix}${String(maxNum + 1).padStart(digits, "0")}`;
    }
    return Date.now();
  }, []);

  const generateId = createId || defaultCreateId;

  const reload = useCallback(async () => {
    if (!USE_API || !resourceApi) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await resourceApi.list();
      setItems(listFromResponse(response));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setIsLoading(false);
    }
  }, [resourceApi]);

  useEffect(() => {
    let active = true;
    if (!USE_API || !resourceApi) return undefined;
    reload().catch(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [reload, resourceApi]);

  const clearError = useCallback(() => setActionError(null), []);

  const remove = useCallback(async (id) => {
    setActionError(null);
    try {
      if (USE_API && resourceApi) await resourceApi.remove(id);
      setItems((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (removeError) {
      setActionError(removeError?.message || i18n.t("common.requestFailed"));
      return false;
    }
  }, [resourceApi]);

  /* Keep the local mock path synchronous in behavior while exposing one async save API. */
  const resetForm = useCallback(() => {
    setFormData(initialForm);
    setEditingItem(null);
  }, [initialForm]);

  const handleFormChange = useCallback((e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  }, []);

  const add = useCallback(
    async (item) => {
      if (USE_API && resourceApi) {
        const created = itemFromResponse(await resourceApi.create(item));
        setItems((current) => [created, ...current]);
        return created;
      }
      const id = generateId(items);
      const newItem = { ...item, id };
      setItems((current) => [newItem, ...current]);
      return newItem;
    },
    [generateId, items, resourceApi]
  );

  const update = useCallback(async (id, changes) => {
    if (USE_API && resourceApi) {
      const updated = itemFromResponse(await resourceApi.update(id, changes));
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
      return updated;
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes, id } : item))
    );
  }, [resourceApi]);

  /* The remaining modal helpers stay below the data actions for stable hook references. */
  const openCreateModal = useCallback(() => {
    resetForm();
    setActionError(null);
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((item) => {
    setEditingItem(item);
    setFormData(item);
    setActionError(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setActionError(null);
    resetForm();
  }, [resetForm]);

  const save = useCallback(async (payload, fallbackMessage = i18n.t("common.requestFailed")) => {
    setIsSaving(true);
    setActionError(null);
    try {
      if (editingItem) await update(editingItem.id, payload);
      else await add(payload);
      closeModal();
      return true;
    } catch (saveError) {
      setActionError(saveError?.message || fallbackMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [add, closeModal, editingItem, update]);

  const searchAndFilter = useCallback(
    (search, filter, matchesSearch, matchesFilter = (item) => item.status === filter) =>
      items.filter(
        (item) =>
          matchesSearch(item, search) &&
          (filter === "all" || filter === "All" || matchesFilter(item))
      ),
    [items]
  );

  return {
    items,
    setItems,
    formData,
    setFormData,
    handleFormChange,
    editingItem,
    setEditingItem,
    isModalOpen,
    setIsModalOpen,
    openCreateModal,
    openEditModal,
    closeModal,
    add,
    update,
    save,
    remove,
    resetForm,
    searchAndFilter,
    reload,
    clearError,
    isLoading,
    error,
    isSaving,
    actionError,
  };
}
