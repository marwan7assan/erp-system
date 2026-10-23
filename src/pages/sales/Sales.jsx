import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaClock,
  FaTimes,
} from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import useCrud from "../../hooks/useCrud";
import { initialSales } from "../../data/mockdata";
import { salesApi } from "../../services/api";
import CrudStatus from "../../components/common/CrudStatus";
import FormError from "../../components/common/FormError";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import useConfirmDelete from "../../hooks/useConfirmDelete";

const emptySaleForm = {
  customer: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  status: "completed",
};

function Sales() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    items: sales,
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
  } = useCrud(initialSales, emptySaleForm, undefined, salesApi);
  const { pendingId, requestDelete, cancelDelete, confirmDelete } = useConfirmDelete(remove);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.amount) return;

    await save({ customer: formData.customer, amount: Number(formData.amount), date: formData.date, status: formData.status });
  };

  const filteredSales = useMemo(
    () => searchAndFilter(
      search,
      statusFilter,
      (sale, q) =>
        sale.customer.toLowerCase().includes(q.toLowerCase()) ||
        sale.id.toString().includes(q),
      (sale) => sale.status === statusFilter
    ),
    [search, statusFilter, searchAndFilter]
  );

  const totalSales = useMemo(
    () => sales
      .filter((sale) => sale.status === "completed")
      .reduce((total, sale) => total + sale.amount, 0),
    [sales]
  );

  const completedCount = useMemo(
    () => sales.filter((s) => s.status === "completed").length,
    [sales]
  );

  return (
    <div className="page-container">
      <PageHeader
        title={t("sales.title")}
        subtitle={t("sales.subtitle")}
        action={
          <button className="primary-btn" onClick={openCreateModal}>
            <FaPlus />
            <span>{t("sales.addSale")}</span>
          </button>
        }
      />

      {/* Summary */}
        <CrudStatus isLoading={isLoading} error={error} actionError={actionError} onRetry={reload} onDismiss={clearError} />
        <div className="stats-grid">
        <StatCard
          icon={<FaFileInvoiceDollar />}
          label={t("sales.totalSales")}
          value={`${totalSales.toLocaleString()} ${t("common.currency")}`}
        />
        <StatCard
          icon={<FaFileInvoiceDollar />}
          label={t("sales.totalInvoices")}
          value={sales.length}
        />
        <StatCard
          icon={<FaCheckCircle />}
          label={t("sales.completed")}
          value={completedCount}
        />
      </div>

      {/* Table */}
      <div className="content-card">
        <div className="table-toolbar">
          <div className="table-search">
            <label htmlFor="sales-search" className="sr-only">
              {t("sales.search")}
            </label>
            <FaSearch />
            <input
              id="sales-search"
              type="text"
              placeholder={t("sales.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label htmlFor="sales-filter" className="sr-only">
            {t("sales.filters.all")}
          </label>
          <select
            id="sales-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("sales.filters.all")}</option>
            <option value="completed">{t("sales.filters.completed")}</option>
            <option value="pending">{t("sales.filters.pending")}</option>
            <option value="cancelled">{t("sales.filters.cancelled")}</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("sales.table.invoice")}</th>
                <th>{t("sales.table.customer")}</th>
                <th>{t("sales.table.date")}</th>
                <th>{t("sales.table.amount")}</th>
                <th>{t("sales.table.status")}</th>
                <th>{t("sales.table.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <strong>#{sale.id}</strong>
                  </td>
                  <td>{sale.customer}</td>
                  <td>{sale.date}</td>
                  <td>
                    {sale.amount.toLocaleString()} {t("common.currency")}
                  </td>
                  <td>
                    <StatusBadge status={sale.status}>
                      {sale.status === "completed" && (
                        <>
                          <FaCheckCircle />
                          {t("sales.status.completed")}
                        </>
                      )}
                      {sale.status === "pending" && (
                        <>
                          <FaClock />
                          {t("sales.status.pending")}
                        </>
                      )}
                      {sale.status === "cancelled" && (
                        <>
                          <FaTimes />
                          {t("sales.status.cancelled")}
                        </>
                      )}
                    </StatusBadge>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="edit-btn"
                        title={t("common.edit")}
                        onClick={() => openEditModal(sale)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        title={t("common.delete")}
                        onClick={() => requestDelete(sale.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">
                    {t("sales.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Sale Modal */}
      {isModalOpen && (
        <Modal
          title={editingItem ? t("common.edit") : t("sales.modal.title")}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="sales-customer">{t("sales.modal.customer")}</label>
                  <input
                    id="sales-customer"
                    type="text"
                    name="customer"
                    required
                    value={formData.customer}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sales-amount">{t("sales.modal.amount")}</label>
                  <input
                    id="sales-amount"
                    type="number"
                    name="amount"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sales-date">{t("sales.modal.date")}</label>
                  <input
                    id="sales-date"
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="sales-status">{t("sales.modal.status")}</label>
                  <select
                    id="sales-status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="completed">{t("sales.status.completed")}</option>
                    <option value="pending">{t("sales.status.pending")}</option>
                    <option value="cancelled">{t("sales.status.cancelled")}</option>
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
                {isSaving ? <><span className="button-spinner" />{t("common.loading")}</> : (editingItem ? t("common.save") : t("sales.modal.submit"))}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {pendingId !== null && <ConfirmDialog onConfirm={confirmDelete} onClose={cancelDelete} />}
    </div>
  );
}

export default Sales;
