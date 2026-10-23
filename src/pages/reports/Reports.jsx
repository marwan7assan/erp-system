import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FaFilePdf,
  FaFileCsv,
  FaPrint,
  FaArrowUp,
  FaPercentage,
  FaShoppingBag,
  FaCheckCircle,
  FaMoneyBillWave,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { downloadCsv, downloadPdf } from "../../utils/reportExport";
import {
  reportsPerformanceByYear,
  expenseCategoryData,
} from "../../data/mockdata";
import { chartColors, chartTheme } from "../../theme/colors";

function Reports() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState("2026");
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const performanceData =
    reportsPerformanceByYear[selectedYear] ||
    reportsPerformanceByYear["2026"];

  const handleExport = (type) => {
    if (type === "PDF") downloadPdf(performanceData, selectedYear);
    else downloadCsv(performanceData, selectedYear);

    setToastMessage(t("reports.downloadSuccess", { type, year: selectedYear }));

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>{t("reports.title")}</h1>
          <p>{t("reports.subtitle")}</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="secondary-btn"
            onClick={() => handleExport("PDF")}
            title={t("reports.exportPdf")}
            type="button"
          >
            <FaFilePdf className="report-export-icon report-export-icon--danger" />
            <span>{t("reports.exportPdf")}</span>
          </button>

          <button
            className="secondary-btn"
            onClick={() => handleExport("CSV")}
            title={t("reports.exportCsv")}
            type="button"
          >
            <FaFileCsv className="report-export-icon report-export-icon--success" />
            <span>{t("reports.exportCsv")}</span>
          </button>

          <button
            className="primary-btn"
            onClick={() => window.print()}
            title={t("reports.print")}
            type="button"
          >
            <FaPrint />
            <span>{t("reports.print")}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="toast-success">
          <FaCheckCircle />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon stat-icon--primary"
          >
            <FaPercentage />
          </div>
          <div>
            <span>{t("reports.kpis.operatingMargin")}</span>
            <strong>36.4%</strong>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon stat-icon--warning"
          >
            <FaShoppingBag />
          </div>
          <div>
            <span>{t("reports.kpis.avgOrder")}</span>
            <strong>14,250 {t("common.currency")}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon stat-icon--success"
          >
            <FaCheckCircle />
          </div>
          <div>
            <span>{t("reports.kpis.fulfillmentRate")}</span>
            <strong>98.2%</strong>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon stat-icon--primary"
          >
            <FaMoneyBillWave />
          </div>
          <div>
            <span>{t("reports.kpis.cashFlow")}</span>
            <strong>+94,000 {t("common.currency")}</strong>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="reports-grid">
        {/* Sales vs Purchases Area Chart */}
        <div className="content-card">
          <div className="chart-card-title">
            <h3>{t("reports.revenueTrends")}</h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="report-year-select"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performanceData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="purchasesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[1]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartColors[1]} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartTheme.grid}
                />
                <XAxis dataKey="month" stroke={chartTheme.axis} />
                <YAxis stroke={chartTheme.axis} />
                <Tooltip
                  formatter={(val) =>
                    `${val.toLocaleString()} ${t("common.currency")}`
                  }
                  contentStyle={{
                    background: chartTheme.tooltipBg,
                    borderRadius: "8px",
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name={t("reports.table.sales")}
                  stroke={chartColors[0]}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  name={t("reports.table.purchases")}
                  stroke={chartColors[1]}
                  fillOpacity={1}
                  fill="url(#purchasesGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operating Expenses Breakdown Bar Chart */}
        <div className="content-card">
          <div className="chart-card-title">
            <h3>{t("reports.expenseBreakdown")}</h3>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenseCategoryData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={chartTheme.grid}
                />
                <XAxis type="number" stroke={chartTheme.axis} />
                <YAxis
                  dataKey="category"
                  type="category"
                  stroke={chartTheme.axisText}
                  width={90}
                />
                <Tooltip
                  formatter={(val) =>
                    `${val.toLocaleString()} ${t("common.currency")}`
                  }
                  contentStyle={{
                    background: chartTheme.tooltipBg,
                    borderRadius: "8px",
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                  }}
                />
                <Bar
                  dataKey="amount"
                  name={t("reports.table.expenses")}
                  fill={chartColors[0]}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="content-card">
        <div className="chart-card-title">
          <h3>{t("reports.monthlySummary")}</h3>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("reports.table.month")}</th>
                <th>{t("reports.table.sales")}</th>
                <th>{t("reports.table.purchases")}</th>
                <th>{t("reports.table.expenses")}</th>
                <th>{t("reports.table.netProfit")}</th>
                <th>{t("reports.table.growth")}</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((row) => (
                <tr key={row.month}>
                  <td>
                    <strong>
                      {row.month} {selectedYear}
                    </strong>
                  </td>
                  <td>
                    {row.sales.toLocaleString()} {t("common.currency")}
                  </td>
                  <td>
                    {row.purchases.toLocaleString()} {t("common.currency")}
                  </td>
                  <td>
                    {row.expenses.toLocaleString()} {t("common.currency")}
                  </td>
                  <td>
                    <strong className="text-success">
                      +{row.net.toLocaleString()} {t("common.currency")}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`growth-value ${row.growth.startsWith("+") ? "growth-value--positive" : "growth-value--negative"}`}
                    >
                      {row.growth.startsWith("+") && (
                        <FaArrowUp style={{ fontSize: "10px" }} />
                      )}
                      {row.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
