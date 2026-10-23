import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaBoxes,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import useCrud from "../../hooks/useCrud";
import {
  initialProducts,
  getProductStockStatus as getInventoryStatus,
} from "../../data/mockdata";
import { inventoryApi } from "../../services/api";
import CrudStatus from "../../components/common/CrudStatus";
import FormError from "../../components/common/FormError";

export { getInventoryStatus };

const emptyProductForm = {
  name: "",
  sku: "",
  category: "Electronics",
  price: "",
  stock: 10,
};

function Inventory() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    items: products,
    formData,
    handleFormChange,
    editingItem,
    isModalOpen,
    openCreateModal,
    openEditModal,
    closeModal,
    save,
    isLoading,
    error,
    isSaving,
    actionError,
    clearError,
    reload,
    remove,
    searchAndFilter,
  } = useCrud(initialProducts, emptyProductForm, undefined, inventoryApi);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    await save({
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });
  };

  const handleDelete = (id) => {
    if (window.confirm(t("common.confirmDelete"))) {
      remove(id);
    }
  };

  const filteredProducts = useMemo(
    () => searchAndFilter(
      search,
      statusFilter,
      (product, q) => {
        const qLower = q.toLowerCase();
        return (
          product.name.toLowerCase().includes(qLower) ||
          product.sku.toLowerCase().includes(qLower) ||
          product.category.toLowerCase().includes(qLower)
        );
      },
      (product) => getInventoryStatus(product.stock) === statusFilter
    ),
    [search, statusFilter, searchAndFilter]
  );

  const { totalProducts, totalStock, lowStock, outOfStock } = useMemo(() => ({
    totalProducts: products.length,
    totalStock: products.reduce((total, product) => total + product.stock, 0),
    lowStock: products.filter((product) => getInventoryStatus(product.stock) === "lowStock").length,
    outOfStock: products.filter((product) => getInventoryStatus(product.stock) === "outOfStock").length,
  }), [products]);

  return (
    <div className="page-container">
      <PageHeader
        title={t("inventory.title")}
        subtitle={t("inventory.subtitle")}
        action={
          <button className="primary-btn" onClick={openCreateModal}>
            <FaPlus />
            <span>{t("inventory.addProduct")}</span>
          </button>
        }
      />
      <CrudStatus isLoading={isLoading} error={error} actionError={actionError} onRetry={reload} onDismiss={clearError} />

      {/* Summary */}
      <div className="stats-grid">
        <StatCard
          icon={<FaBoxes />}
          label={t("inventory.totalProducts")}
          value={totalProducts}
        />
        <StatCard
          icon={<FaBoxes />}
          label={t("inventory.totalStock")}
          value={totalStock}
        />
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <FaExclamationTriangle />
          </div>
          <div>
            <span>{t("inventory.lowStock")}</span>
            <strong className="text-warning">{lowStock}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-danger">
            <FaTimesCircle />
          </div>
          <div>
            <span>{t("inventory.outOfStock")}</span>
            <strong className="text-danger">{outOfStock}</strong>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="content-card">
        <div className="table-toolbar">
          <div className="table-search">
            <label htmlFor="inventory-search" className="sr-only">
              {t("inventory.search")}
            </label>
            <FaSearch />
            <input
              id="inventory-search"
              type="text"
              placeholder={t("inventory.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label htmlFor="inventory-filter" className="sr-only">
            {t("inventory.filters.all")}
          </label>
          <select
            id="inventory-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("inventory.filters.all")}</option>
            <option value="inStock">{t("inventory.status.inStock")}</option>
            <option value="lowStock">{t("inventory.status.lowStock")}</option>
            <option value="outOfStock">{t("inventory.status.outOfStock")}</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("inventory.table.product")}</th>
                <th>{t("inventory.table.sku")}</th>
                <th>{t("inventory.table.category")}</th>
                <th>{t("inventory.table.price")}</th>
                <th>{t("inventory.table.stock")}</th>
                <th>{t("inventory.table.status")}</th>
                <th>{t("inventory.table.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const status = getInventoryStatus(product.stock);
                return (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>
                      <code className="sku-code">{product.sku}</code>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <strong>
                        {product.price.toLocaleString()} {t("common.currency")}
                      </strong>
                    </td>
                    <td>{product.stock}</td>
                    <td>
                      <StatusBadge status={status}>
                        {status === "inStock" && (
                          <>
                            <FaCheckCircle />
                            {t("inventory.status.inStock")}
                          </>
                        )}
                        {status === "lowStock" && (
                          <>
                            <FaExclamationTriangle />
                            {t("inventory.status.lowStock")}
                          </>
                        )}
                        {status === "outOfStock" && (
                          <>
                            <FaTimesCircle />
                            {t("inventory.status.outOfStock")}
                          </>
                        )}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title={t("common.edit")}
                          onClick={() => openEditModal(product)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          title={t("common.delete")}
                          onClick={() => handleDelete(product.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-table">
                    {t("inventory.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <Modal
          title={editingItem ? t("common.edit") : t("inventory.modal.title")}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="inventory-name">{t("inventory.modal.name")}</label>
                  <input
                    id="inventory-name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inventory-sku">{t("inventory.modal.sku")}</label>
                  <input
                    id="inventory-sku"
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inventory-category">
                    {t("inventory.modal.category")}
                  </label>
                  <input
                    id="inventory-category"
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inventory-price">
                    {t("inventory.modal.price")}
                  </label>
                  <input
                    id="inventory-price"
                    type="number"
                    name="price"
                    min="1"
                    required
                    value={formData.price}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inventory-stock">
                    {t("inventory.modal.stock")}
                  </label>
                  <input
                    id="inventory-stock"
                    type="number"
                    name="stock"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>

            <FormError message={actionError} />
            <div className="modal-footer">
              <button
                type="button"
                className="secondary-btn"
                onClick={closeModal}
              >
                {t("common.cancel")}
              </button>
              <button type="submit" className="primary-btn" disabled={isSaving}>
                {isSaving ? <><span className="button-spinner" />{t("common.loading")}</> : (editingItem ? t("common.save") : t("inventory.modal.submit"))}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Inventory;
