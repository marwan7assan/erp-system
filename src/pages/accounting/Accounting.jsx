import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaArrowUp,
  FaArrowDown,
  FaMoneyCheckAlt,
  FaClock,
  FaCheckCircle,
  FaWallet,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import useCrud from "../../hooks/useCrud";
import {
  initialTransactions,
  monthlyFinancialData,
} from "../../data/mockdata";
import { transactionsApi } from "../../services/api";
import CrudStatus from "../../components/common/CrudStatus";
import FormError from "../../components/common/FormError";
import { chartTheme, successColor, dangerColor } from "../../theme/colors";

const emptyTransactionForm = {
  description: "",
  category: "General Revenue",
  type: "income",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  status: "paid",
};

function Accounting() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    items: transactions,
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
  } = useCrud(initialTransactions, emptyTransactionForm, undefined, transactionsApi);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    if (editingItem) {
      update(editingItem.id, {
        description: formData.description,
        category: formData.category,
        type: formData.type,
        amount: Number(formData.amount),
        date: formData.date,
        status: formData.status,
      });
    } else {
      add({
        description: formData.description,
        category: formData.category,
        type: formData.type,
        amount: Number(formData.amount),
        date: formData.date,
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

  const filteredTransactions = useMemo(
    () => transactions.filter((tx) => {
      const s = search.toLowerCase();
      const matchesSearch =
        tx.description.toLowerCase().includes(s) ||
        tx.category.toLowerCase().includes(s) ||
        tx.id.toLowerCase().includes(s);

      const matchesType = typeFilter === "all" || tx.type === typeFilter;
      return matchesSearch && matchesType;
    }),
    [transactions, search, typeFilter]
  );

  const totalRevenue = useMemo(
    () => transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () => transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const netProfit = useMemo(
    () => totalRevenue - totalExpenses,
    [totalRevenue, totalExpenses]
  );
  const pendingCount = useMemo(
    () => transactions.filter((tx) => tx.status === "pending").length,
    [transactions]
  );

  return (
    <div className="page-container">
      {/* Header */}
      <PageHeader
        title={t("accounting.title")}
        subtitle={t("accounting.subtitle")}
        action={
          <button className="primary-btn" onClick={openCreateModal}>
            <FaPlus />
            <span>{t("accounting.addTransaction")}</span>
          </button>
        }
      />
      <CrudStatus isLoading={isLoading} error={error} actionError={actionError} onRetry={reload} onDismiss={clearError} />

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <FaArrowUp />
          </div>
          <div>
            <span>{t("accounting.totalRevenue")}</span>
            <strong className="text-success">
              +{totalRevenue.toLocaleString()} {t("common.currency")}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-danger">
            <FaArrowDown />
          </div>
          <div>
            <span>{t("accounting.totalExpenses")}</span>
            <strong className="text-danger">
              -{totalExpenses.toLocaleString()} {t("common.currency")}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaWallet />
          </div>
          <div>
            <span>{t("accounting.netProfit")}</span>
            <strong className={netProfit >= 0 ? "text-success" : "text-danger"}>
              {netProfit.toLocaleString()} {t("common.currency")}
            </strong>
          </div>
        </div>

        <StatCard
          icon={<FaMoneyCheckAlt />}
          label={t("accounting.pendingInvoices")}
          value={pendingCount}
        />
      </div>

      {/* Chart Section */}
      <div className="content-card">
        <div className="chart-card-title">
          <h3>{t("accounting.revenueVsExpenses")}</h3>
        </div>
        <div className="chart-container-290">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyFinancialData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
              <XAxis dataKey="month" stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip
                formatter={(value) => `${value.toLocaleString()} ${t("common.currency")}`}
                contentStyle={{
                  background: chartTheme.tooltipBg,
                  borderRadius: "8px",
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                }}
              />
              <Legend />
              <Bar
                dataKey="income"
                name={t("accounting.types.income")}
                fill={successColor}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name={t("accounting.types.expense")}
                fill={dangerColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="content-card">
        <div className="table-toolbar">
          <div className="table-search">
            <label htmlFor="accounting-search" className="sr-only">
              {t("accounting.search")}
            </label>
            <FaSearch />
            <input
              id="accounting-search"
              type="text"
              placeholder={t("accounting.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label htmlFor="accounting-type-filter" className="sr-only">
            {t("accounting.filters.all")}
          </label>
          <select
            id="accounting-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">{t("accounting.filters.all")}</option>
            <option value="income">{t("accounting.filters.income")}</option>
            <option value="expense">{t("accounting.filters.expense")}</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("accounting.table.id")}</th>
                <th>{t("accounting.table.description")}</th>
                <th>{t("accounting.table.category")}</th>
                <th>{t("accounting.table.type")}</th>
                <th>{t("accounting.table.amount")}</th>
                <th>{t("accounting.table.date")}</th>
                <th>{t("accounting.table.status")}</th>
                <th>{t("accounting.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <strong>{tx.id}</strong>
                    </td>
                    <td>
                      <strong>{tx.description}</strong>
                    </td>
                    <td>{tx.category}</td>
                    <td>
                      <StatusBadge status={tx.type}>
                        {tx.type === "income" ? (
                          <>
                            <FaArrowUp />
                            {t("accounting.types.income")}
                          </>
                        ) : (
                          <>
                            <FaArrowDown />
                            {t("accounting.types.expense")}
                          </>
                        )}
                      </StatusBadge>
                    </td>
                    <td>
                      <strong className={tx.type === "income" ? "text-success" : "text-danger"}>
                        {tx.type === "income" ? "+" : "-"}
                        {tx.amount.toLocaleString()} {t("common.currency")}
                      </strong>
                    </td>
                    <td>{tx.date}</td>
                    <td>
                      <StatusBadge status={tx.status}>
                        {tx.status === "paid" ? (
                          <>
                            <FaCheckCircle />
                            {t("accounting.status.paid")}
                          </>
                        ) : (
                          <>
                            <FaClock />
                            {t("accounting.status.pending")}
                          </>
                        )}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title={t("common.edit")}
                          onClick={() => openEditModal(tx)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(tx.id)}
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
                    {t("accounting.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <Modal
          title={editingItem ? t("common.edit") : t("accounting.modal.title")}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="tx-description">
                    {t("accounting.modal.description")}
                  </label>
                  <input
                    id="tx-description"
                    type="text"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tx-category">
                    {t("accounting.modal.category")}
                  </label>
                  <input
                    id="tx-category"
                    type="text"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tx-type">
                    {t("accounting.modal.type")}
                  </label>
                  <select
                    id="tx-type"
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                  >
                    <option value="income">{t("accounting.types.income")}</option>
                    <option value="expense">{t("accounting.types.expense")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tx-amount">
                    {t("accounting.modal.amount")}
                  </label>
                  <input
                    id="tx-amount"
                    type="number"
                    name="amount"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tx-date">
                    {t("accounting.modal.date")}
                  </label>
                  <input
                    id="tx-date"
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="tx-status">
                    {t("accounting.modal.status")}
                  </label>
                  <select
                    id="tx-status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="paid">{t("accounting.status.paid")}</option>
                    <option value="pending">{t("accounting.status.pending")}</option>
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
                {editingItem ? t("common.save") : t("accounting.modal.submit")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Accounting;
