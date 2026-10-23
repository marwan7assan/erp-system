import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaTruck,
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaBoxes,
  FaPhone,
} from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import useCrud from "../../hooks/useCrud";
import { initialSuppliers } from "../../data/mockdata";
import { suppliersApi } from "../../services/api";
import CrudStatus from "../../components/common/CrudStatus";
import FormError from "../../components/common/FormError";

const emptySupplierForm = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  category: "General Supply",
  balance: 0,
  status: "active",
};

function Suppliers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    items: suppliers,
    formData,
    handleFormChange,
    editingItem,
    isModalOpen,
    openCreateModal,
    openEditModal,
    closeModal,
    add,
    update,
    remove,
    isLoading,
    error,
    actionError,
    clearError,
    reload,
    searchAndFilter,
  } = useCrud(initialSuppliers, emptySupplierForm, undefined, suppliersApi);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    if (editingItem) {
      update(editingItem.id, {
        name: formData.name,
        contact: formData.contact,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        balance: Number(formData.balance),
        status: formData.status,
      });
    } else {
      add({
        name: formData.name,
        contact: formData.contact,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        balance: Number(formData.balance),
        status: formData.status,
        orders: 0,
      });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm(t("common.confirmDelete"))) {
      remove(id);
    }
  };

  const filteredSuppliers = useMemo(
    () => searchAndFilter(
      search,
      statusFilter,
      (supplier, q) => {
        const s = q.toLowerCase();
        return (
          supplier.name.toLowerCase().includes(s) ||
          supplier.contact.toLowerCase().includes(s) ||
          supplier.category.toLowerCase().includes(s) ||
          supplier.phone.includes(s) ||
          supplier.id.toLowerCase().includes(s)
        );
      },
      (supplier) => supplier.status === statusFilter
    ),
    [search, statusFilter, searchAndFilter]
  );

  const { totalBalance, activeCount, totalOrders } = useMemo(() => ({
    totalBalance: suppliers.reduce((sum, item) => sum + item.balance, 0),
    activeCount: suppliers.filter((supplier) => supplier.status === "active").length,
    totalOrders: suppliers.reduce((sum, item) => sum + (item.orders || 0), 0),
  }), [suppliers]);

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title={t("suppliers.title")}
        subtitle={t("suppliers.subtitle")}
        action={
          <button className="primary-btn" onClick={openCreateModal}>
            <FaPlus />
            <span>{t("suppliers.addSupplier")}</span>
          </button>
        }
      />
      <CrudStatus isLoading={isLoading} error={error} actionError={actionError} onRetry={reload} onDismiss={clearError} />

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<FaTruck />}
          label={t("suppliers.totalSuppliers")}
          value={suppliers.length}
        />
        <StatCard
          icon={<FaCheckCircle />}
          label={t("suppliers.activeSuppliers")}
          value={activeCount}
        />
        <StatCard
          icon={<FaMoneyBillWave />}
          label={t("suppliers.totalBalance")}
          value={`${totalBalance.toLocaleString()} ${t("common.currency")}`}
        />
        <StatCard
          icon={<FaBoxes />}
          label={t("suppliers.totalOrders")}
          value={totalOrders}
        />
      </div>

      {/* Main Table Card */}
      <div className="content-card">
        <div className="table-toolbar">
          <div className="table-search">
            <label htmlFor="suppliers-search" className="sr-only">
              {t("suppliers.search")}
            </label>
            <FaSearch />
            <input
              id="suppliers-search"
              type="text"
              placeholder={t("suppliers.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label htmlFor="suppliers-filter" className="sr-only">
            {t("suppliers.filters.all")}
          </label>
          <select
            id="suppliers-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("suppliers.filters.all")}</option>
            <option value="active">{t("suppliers.filters.active")}</option>
            <option value="inactive">{t("suppliers.filters.inactive")}</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("suppliers.table.id")}</th>
                <th>{t("suppliers.table.supplier")}</th>
                <th>{t("suppliers.table.contact")}</th>
                <th>{t("suppliers.table.category")}</th>
                <th>{t("suppliers.table.phone")}</th>
                <th>{t("suppliers.table.balance")}</th>
                <th>{t("suppliers.table.status")}</th>
                <th>{t("suppliers.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <strong>{supplier.id}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{supplier.name}</strong>
                        <div className="text-secondary-sm">
                          {supplier.email}
                        </div>
                      </div>
                    </td>
                    <td>{supplier.contact}</td>
                    <td>{supplier.category}</td>
                    <td>
                      <span className="phone-cell">
                        <FaPhone />
                        {supplier.phone}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {supplier.balance.toLocaleString()} {t("common.currency")}
                      </strong>
                    </td>
                    <td>
                      <StatusBadge status={supplier.status}>
                        {supplier.status === "active" ? (
                          <>
                            <FaCheckCircle />
                            {t("suppliers.status.active")}
                          </>
                        ) : (
                          <>
                            <FaClock />
                            {t("suppliers.status.inactive")}
                          </>
                        )}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title={t("common.edit")}
                          onClick={() => openEditModal(supplier)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(supplier.id)}
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
                    {t("suppliers.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <Modal
          title={editingItem ? t("common.edit") : t("suppliers.modal.title")}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="supplier-name">
                    {t("suppliers.modal.name")}
                  </label>
                  <input
                    id="supplier-name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supplier-contact">
                    {t("suppliers.modal.contact")}
                  </label>
                  <input
                    id="supplier-contact"
                    type="text"
                    name="contact"
                    required
                    value={formData.contact}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supplier-category">
                    {t("suppliers.modal.category")}
                  </label>
                  <input
                    id="supplier-category"
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supplier-phone">
                    {t("suppliers.modal.phone")}
                  </label>
                  <input
                    id="supplier-phone"
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supplier-email">
                    {t("suppliers.modal.email")}
                  </label>
                  <input
                    id="supplier-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supplier-balance">
                    {t("suppliers.modal.balance")}
                  </label>
                  <input
                    id="supplier-balance"
                    type="number"
                    name="balance"
                    min="0"
                    value={formData.balance}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="supplier-status">
                    {t("suppliers.modal.status")}
                  </label>
                  <select
                    id="supplier-status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="active">{t("suppliers.status.active")}</option>
                    <option value="inactive">{t("suppliers.status.inactive")}</option>
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
              <button type="submit" className="primary-btn">
                {editingItem ? t("common.save") : t("suppliers.modal.submit")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Suppliers;
