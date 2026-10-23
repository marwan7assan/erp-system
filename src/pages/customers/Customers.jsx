import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import useCrud from "../../hooks/useCrud";
import { initialCustomers } from "../../data/mockdata";
import { customersApi } from "../../services/api";
import CrudStatus from "../../components/common/CrudStatus";
import FormError from "../../components/common/FormError";

const emptyCustomerForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  status: "active",
};

function Customers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    items: customers,
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
  } = useCrud(initialCustomers, emptyCustomerForm, undefined, customersApi);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    await save({
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        orders: 0,
      });
  };

  const handleDelete = (id) => {
    if (window.confirm(t("common.confirmDelete"))) {
      remove(id);
    }
  };

  const filteredCustomers = useMemo(
    () => searchAndFilter(
      search,
      statusFilter,
      (customer, q) => {
        const qLower = q.toLowerCase();
        return (
          customer.name.toLowerCase().includes(qLower) ||
          customer.email.toLowerCase().includes(qLower) ||
          customer.company.toLowerCase().includes(qLower) ||
          customer.phone.includes(q)
        );
      },
      (customer) => customer.status === statusFilter
    ),
    [search, statusFilter, searchAndFilter]
  );

  const activeCustomers = useMemo(
    () => customers.filter(
      (customer) => customer.status === "active"
    ).length,
    [customers]
  );

  const totalOrders = useMemo(
    () => customers.reduce(
      (total, customer) => total + (customer.orders || 0),
      0
    ),
    [customers]
  );

  return (
    <div className="page-container">
      <PageHeader
        title={t("customers.title")}
        subtitle={t("customers.subtitle")}
        action={
          <button className="primary-btn" onClick={openCreateModal}>
            <FaPlus />
            <span>{t("customers.addCustomer")}</span>
          </button>
        }
      />
      <CrudStatus isLoading={isLoading} error={error} actionError={actionError} onRetry={reload} onDismiss={clearError} />

      {/* Summary */}
      <div className="stats-grid">
        <StatCard
          icon={<FaUsers />}
          label={t("customers.totalCustomers")}
          value={customers.length}
        />
        <StatCard
          icon={<FaCheckCircle />}
          label={t("customers.activeCustomers")}
          value={activeCustomers}
        />
        <StatCard
          icon={<FaUsers />}
          label={t("customers.totalOrders")}
          value={totalOrders}
        />
      </div>

      {/* Customers Table */}
      <div className="content-card">
        <div className="table-toolbar">
          <div className="table-search">
            <label htmlFor="customers-search" className="sr-only">
              {t("customers.search")}
            </label>
            <FaSearch />
            <input
              id="customers-search"
              type="text"
              placeholder={t("customers.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label htmlFor="customers-filter" className="sr-only">
            {t("customers.filters.all")}
          </label>
          <select
            id="customers-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("customers.filters.all")}</option>
            <option value="active">{t("customers.status.active")}</option>
            <option value="inactive">{t("customers.status.inactive")}</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("customers.table.customer")}</th>
                <th>{t("customers.table.company")}</th>
                <th>{t("customers.table.contact")}</th>
                <th>{t("customers.table.orders")}</th>
                <th>{t("customers.table.status")}</th>
                <th>{t("customers.table.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar-circle">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="user-cell-info">
                        <strong>{customer.name}</strong>
                        <span>#{customer.id}</span>
                      </div>
                    </div>
                  </td>

                  <td>{customer.company}</td>

                  <td>
                    <div className="customer-contact">
                      <span>
                        <FaEnvelope />
                        {customer.email}
                      </span>
                      <span>
                        <FaPhone />
                        {customer.phone}
                      </span>
                    </div>
                  </td>

                  <td>
                    <strong>{customer.orders}</strong>
                  </td>

                  <td>
                    <StatusBadge status={customer.status}>
                      {customer.status === "active" ? (
                        <>
                          <FaCheckCircle />
                          {t("customers.status.active")}
                        </>
                      ) : (
                        <>
                          <FaClock />
                          {t("customers.status.inactive")}
                        </>
                      )}
                    </StatusBadge>
                  </td>

                  <td>
                    <div className="action-btns">
                      <button
                        className="edit-btn"
                        title={t("common.edit")}
                        onClick={() => openEditModal(customer)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        title={t("common.delete")}
                        onClick={() => handleDelete(customer.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">
                    {t("customers.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <Modal
          title={editingItem ? t("common.edit") : t("customers.modal.title")}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="customer-name">
                    {t("customers.modal.name")}
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="customer-company">
                    {t("customers.modal.company")}
                  </label>
                  <input
                    id="customer-company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-email">
                    {t("customers.modal.email")}
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-phone">
                    {t("customers.modal.phone")}
                  </label>
                  <input
                    id="customer-phone"
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="customer-status">
                    {t("customers.modal.status")}
                  </label>
                  <select
                    id="customer-status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="active">
                      {t("customers.status.active")}
                    </option>
                    <option value="inactive">
                      {t("customers.status.inactive")}
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
                {isSaving ? <><span className="button-spinner" />{t("common.loading")}</> : (editingItem ? t("common.save") : t("customers.modal.submit"))}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Customers;
