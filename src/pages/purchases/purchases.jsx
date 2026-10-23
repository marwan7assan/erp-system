import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import useCrud from "../../hooks/useCrud";
import { initialPurchases } from "../../data/mockdata.js";
import { purchasesApi } from "../../services/api";
import CrudStatus from "../../components/common/CrudStatus";
import FormError from "../../components/common/FormError";

const emptyPurchaseForm = {
  supplier: "",
  product: "",
  quantity: 1,
  amount: "",
  date: new Date().toISOString().split("T")[0],
  status: "pending",
};

function Purchases() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    items: purchases,
    formData,
    handleFormChange,
    editingItem,
    isModalOpen,
    openCreateModal,
    openEditModal,
    closeModal,
    remove,
    save,
    isLoading,
    error,
    isSaving,
    actionError,
    clearError,
    reload,
    searchAndFilter,
  } = useCrud(initialPurchases, emptyPurchaseForm, undefined, purchasesApi);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier || !formData.product || !formData.amount) return;

    await save({
        supplier: formData.supplier,
        product: formData.product,
        quantity: Number(formData.quantity),
        amount: Number(formData.amount),
        date: formData.date,
        status: formData.status,
      });
  };

  const handleDelete = (id) => {
    if (window.confirm(t("common.confirmDelete"))) remove(id);
  };

  const filteredPurchases = useMemo(
    () => searchAndFilter(
      search,
      statusFilter,
      (purchase, q) =>
        purchase.id.toLowerCase().includes(q.toLowerCase()) ||
        purchase.supplier.toLowerCase().includes(q.toLowerCase()) ||
        purchase.product.toLowerCase().includes(q.toLowerCase()),
      (purchase) => purchase.status === statusFilter
    ),
    [search, statusFilter, searchAndFilter]
  );

  const totalPurchases = useMemo(
    () => purchases.reduce(
      (total, purchase) => total + purchase.amount,
      0
    ),
    [purchases]
  );

  const completedPurchases = useMemo(
    () => purchases.filter(
      (purchase) => purchase.status === "completed"
    ).length,
    [purchases]
  );

  const pendingPurchases = useMemo(
    () => purchases.filter(
      (purchase) => purchase.status === "pending"
    ).length,
    [purchases]
  );

  const getStatusText = (status) => {
    if (status === "completed") return t("purchases.status.completed");
    if (status === "pending") return t("purchases.status.pending");
    return t("purchases.status.cancelled");
  };

  const getStatusIcon = (status) => {
    if (status === "completed") return <FaCheckCircle />;
    if (status === "pending") return <FaClock />;
    return <FaTimesCircle />;
  };

  return (
    <div className="page-container">
      <PageHeader
        title={t("purchases.title")}
        subtitle={t("purchases.subtitle")}
        action={
          <button className="primary-btn" onClick={openCreateModal}>
            <FaPlus />
            <span>{t("purchases.addPurchase")}</span>
          </button>
        }
      />
      <CrudStatus isLoading={isLoading} error={error} actionError={actionError} onRetry={reload} onDismiss={clearError} />

      <div className="stats-grid">
        <StatCard
          icon={<FaShoppingBag />}
          label={t("purchases.totalPurchases")}
          value={`${totalPurchases.toLocaleString()} ${t("common.currency")}`}
        />
        <StatCard
          icon={<FaCheckCircle />}
          label={t("purchases.completed")}
          value={completedPurchases}
        />
        <StatCard
          icon={<FaClock />}
          label={t("purchases.pending")}
          value={pendingPurchases}
        />
        <StatCard
          icon={<FaShoppingBag />}
          label={t("purchases.totalOrders")}
          value={purchases.length}
        />
      </div>

      <div className="content-card">
        <div className="table-toolbar">
          <div className="table-search">
            <label htmlFor="purchases-search" className="sr-only">
              {t("purchases.search")}
            </label>
            <FaSearch />
            <input
              id="purchases-search"
              type="text"
              placeholder={t("purchases.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label htmlFor="purchases-filter" className="sr-only">
            {t("purchases.filters.all")}
          </label>
          <select
            id="purchases-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("purchases.filters.all")}</option>
            <option value="completed">{t("purchases.status.completed")}</option>
            <option value="pending">{t("purchases.status.pending")}</option>
            <option value="cancelled">{t("purchases.status.cancelled")}</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("purchases.table.id")}</th>
                <th>{t("purchases.table.supplier")}</th>
                <th>{t("purchases.table.product")}</th>
                <th>{t("purchases.table.quantity")}</th>
                <th>{t("purchases.table.amount")}</th>
                <th>{t("purchases.table.date")}</th>
                <th>{t("purchases.table.status")}</th>
                <th>{t("purchases.table.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>
                      <strong>{purchase.id}</strong>
                    </td>
                    <td>{purchase.supplier}</td>
                    <td>{purchase.product}</td>
                    <td>{purchase.quantity}</td>
                    <td>
                      {purchase.amount.toLocaleString()} {t("common.currency")}
                    </td>
                    <td>{purchase.date}</td>
                    <td>
                      <StatusBadge status={purchase.status}>
                        {getStatusIcon(purchase.status)}
                        {getStatusText(purchase.status)}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(purchase)}
                          title={t("common.edit")}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(purchase.id)}
                          title={t("common.delete")}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-table">
                    {t("purchases.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Purchase Modal */}
      {isModalOpen && (
        <Modal
          title={editingItem ? t("common.edit") : t("purchases.modal.title")}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="purchases-supplier">
                    {t("purchases.modal.supplier")}
                  </label>
                  <input
                    id="purchases-supplier"
                    type="text"
                    name="supplier"
                    required
                    value={formData.supplier}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="purchases-product">
                    {t("purchases.modal.product")}
                  </label>
                  <input
                    id="purchases-product"
                    type="text"
                    name="product"
                    required
                    value={formData.product}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="purchases-quantity">
                    {t("purchases.modal.quantity")}
                  </label>
                  <input
                    id="purchases-quantity"
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="purchases-amount">
                    {t("purchases.modal.amount")}
                  </label>
                  <input
                    id="purchases-amount"
                    type="number"
                    name="amount"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="purchases-date">
                    {t("purchases.modal.date")}
                  </label>
                  <input
                    id="purchases-date"
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="purchases-status">
                    {t("purchases.modal.status")}
                  </label>
                  <select
                    id="purchases-status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="completed">
                      {t("purchases.status.completed")}
                    </option>
                    <option value="pending">
                      {t("purchases.status.pending")}
                    </option>
                    <option value="cancelled">
                      {t("purchases.status.cancelled")}
                    </option>
                  </select>
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
                {isSaving ? <><span className="button-spinner" />{t("common.loading")}</> : (editingItem ? t("common.save") : t("purchases.modal.submit"))}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Purchases;
