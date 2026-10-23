import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaUserTie,
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaBuilding,
  FaPhone,
} from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import useCrud from "../../hooks/useCrud";
import { initialEmployees } from "../../data/mockdata";
import { employeesApi } from "../../services/api";
import CrudStatus from "../../components/common/CrudStatus";
import FormError from "../../components/common/FormError";

const emptyEmployeeForm = {
  name: "",
  role: "",
  department: "Operations",
  email: "",
  phone: "",
  salary: 12000,
  joinDate: new Date().toISOString().split("T")[0],
  status: "active",
};

function Employees() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    items: employees,
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
  } = useCrud(initialEmployees, emptyEmployeeForm, undefined, employeesApi);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;

    if (editingItem) {
      update(editingItem.id, {
        name: formData.name,
        role: formData.role,
        department: formData.department,
        email: formData.email,
        phone: formData.phone,
        salary: Number(formData.salary),
        joinDate: formData.joinDate,
        status: formData.status,
      });
    } else {
      add({
        name: formData.name,
        role: formData.role,
        department: formData.department,
        email: formData.email,
        phone: formData.phone,
        salary: Number(formData.salary),
        joinDate: formData.joinDate,
        status: formData.status,
      });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm(t("common.confirmDelete"))) {
      remove(id);
    }
  };

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))),
    [employees]
  );

  const filteredEmployees = useMemo(
    () => employees.filter((emp) => {
      const s = search.toLowerCase();
      const matchesSearch =
        emp.name.toLowerCase().includes(s) ||
        emp.role.toLowerCase().includes(s) ||
        emp.email.toLowerCase().includes(s) ||
        emp.id.toLowerCase().includes(s) ||
        emp.phone.includes(s);

      const matchesDept = deptFilter === "all" || emp.department === deptFilter;
      const matchesStatus =
        statusFilter === "all" || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    }),
    [employees, search, deptFilter, statusFilter]
  );

  const totalPayroll = useMemo(
    () => employees.reduce((sum, e) => sum + e.salary, 0),
    [employees]
  );
  const activeStaff = useMemo(
    () => employees.filter((e) => e.status === "active").length,
    [employees]
  );

  return (
    <div className="page-container">
      {/* Header */}
      <PageHeader
        title={t("employees.title")}
        subtitle={t("employees.subtitle")}
        action={
          <button className="primary-btn" onClick={openCreateModal}>
            <FaPlus />
            <span>{t("employees.addEmployee")}</span>
          </button>
        }
      />
      <CrudStatus isLoading={isLoading} error={error} actionError={actionError} onRetry={reload} onDismiss={clearError} />

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<FaUserTie />}
          label={t("employees.totalEmployees")}
          value={employees.length}
        />
        <StatCard
          icon={<FaCheckCircle />}
          label={t("employees.activeEmployees")}
          value={activeStaff}
        />
        <StatCard
          icon={<FaBuilding />}
          label={t("employees.departments")}
          value={departments.length}
        />
        <StatCard
          icon={<FaMoneyBillWave />}
          label={t("employees.totalPayroll")}
          value={`${totalPayroll.toLocaleString()} ${t("common.currency")}`}
        />
      </div>

      {/* Table Card */}
      <div className="content-card">
        <div className="table-toolbar">
          <div className="table-search">
            <label htmlFor="employees-search" className="sr-only">
              {t("employees.search")}
            </label>
            <FaSearch />
            <input
              id="employees-search"
              type="text"
              placeholder={t("employees.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-filters">
            <label htmlFor="dept-filter" className="sr-only">
              {t("employees.filters.all")}
            </label>
            <select
              id="dept-filter"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">{t("employees.filters.all")}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <label htmlFor="emp-status-filter" className="sr-only">
              {t("employees.filters.statusAll")}
            </label>
            <select
              id="emp-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t("employees.filters.statusAll")}</option>
              <option value="active">{t("employees.status.active")}</option>
              <option value="onLeave">{t("employees.status.onLeave")}</option>
              <option value="inactive">{t("employees.status.inactive")}</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("employees.table.id")}</th>
                <th>{t("employees.table.employee")}</th>
                <th>{t("employees.table.role")}</th>
                <th>{t("employees.table.department")}</th>
                <th>{t("employees.table.contact")}</th>
                <th>{t("employees.table.salary")}</th>
                <th>{t("employees.table.joinDate")}</th>
                <th>{t("employees.table.status")}</th>
                <th>{t("employees.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <strong>{emp.id}</strong>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-circle">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="user-cell-info">
                          <strong>{emp.name}</strong>
                          <span>{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{emp.role}</td>
                    <td>
                      <span className="dept-badge">
                        {emp.department}
                      </span>
                    </td>
                    <td>
                      <span className="phone-cell">
                        <FaPhone />
                        {emp.phone}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {emp.salary.toLocaleString()} {t("common.currency")}
                      </strong>
                    </td>
                    <td>{emp.joinDate}</td>
                    <td>
                      <StatusBadge status={emp.status}>
                        {emp.status === "active" && (
                          <>
                            <FaCheckCircle />
                            {t("employees.status.active")}
                          </>
                        )}
                        {emp.status === "onLeave" && (
                          <>
                            <FaClock />
                            {t("employees.status.onLeave")}
                          </>
                        )}
                        {emp.status === "inactive" && (
                          <>
                            <FaClock />
                            {t("employees.status.inactive")}
                          </>
                        )}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title={t("common.edit")}
                          onClick={() => openEditModal(emp)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(emp.id)}
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
                  <td colSpan="9" className="empty-table">
                    {t("employees.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <Modal
          title={editingItem ? t("common.edit") : t("employees.modal.title")}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="employee-name">
                    {t("employees.modal.name")}
                  </label>
                  <input
                    id="employee-name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employee-role">
                    {t("employees.modal.role")}
                  </label>
                  <input
                    id="employee-role"
                    type="text"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employee-department">
                    {t("employees.modal.department")}
                  </label>
                  <select
                    id="employee-department"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                  >
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="IT">IT</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="employee-email">
                    {t("employees.modal.email")}
                  </label>
                  <input
                    id="employee-email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employee-phone">
                    {t("employees.modal.phone")}
                  </label>
                  <input
                    id="employee-phone"
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employee-salary">
                    {t("employees.modal.salary")}
                  </label>
                  <input
                    id="employee-salary"
                    type="number"
                    name="salary"
                    min="0"
                    required
                    value={formData.salary}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employee-join-date">
                    {t("employees.modal.joinDate")}
                  </label>
                  <input
                    id="employee-join-date"
                    type="date"
                    name="joinDate"
                    required
                    value={formData.joinDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employee-status">
                    {t("employees.modal.status")}
                  </label>
                  <select
                    id="employee-status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="active">{t("employees.status.active")}</option>
                    <option value="onLeave">{t("employees.status.onLeave")}</option>
                    <option value="inactive">{t("employees.status.inactive")}</option>
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
                {editingItem ? t("common.save") : t("employees.modal.submit")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Employees;
