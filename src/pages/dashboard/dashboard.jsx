import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  dashboardSalesData,
  dashboardRecentOrders,
  dashboardTrends,
  initialSales,
  initialCustomers,
  initialProducts,
  getProductStockStatus,
} from "../../data/mockdata";
import { chartTheme, chartColors } from "../../theme/colors";

function Dashboard() {
  const { t } = useTranslation();

  const stats = useMemo(() => [
    {
      title: t("dashboard.stats.totalSales"),
      value: `${initialSales.filter((sale) => sale.status === "completed").reduce((sum, sale) => sum + sale.amount, 0).toLocaleString()} ${t("common.currency")}`,
      change: dashboardTrends.sales,
      icon: <FaDollarSign />,
      positive: true,
    },
    {
      title: t("dashboard.stats.customers"),
      value: initialCustomers.length.toLocaleString(),
      change: dashboardTrends.customers,
      icon: <FaUsers />,
      positive: true,
    },
    {
      title: t("dashboard.stats.products"),
      value: initialProducts.length.toLocaleString(),
      change: dashboardTrends.products,
      icon: <FaBoxOpen />,
      positive: true,
    },
    {
      title: t("dashboard.stats.orders"),
      value: initialSales.length.toLocaleString(),
      change: dashboardTrends.orders,
      icon: <FaShoppingCart />,
      positive: false,
    },
  ], [t]);

  const recentOrders = useMemo(() => [...initialSales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4), []);

  const lowStockProducts = useMemo(
    () => initialProducts.filter((product) => product.stock <= 10).slice(0, 5),
    []
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.subtitle")}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-top">
              <div className="stat-icon">{stat.icon}</div>

              <span
                className={`stat-change ${
                  stat.positive ? "positive" : "negative"
                }`}
              >
                {stat.positive ? <FaArrowUp /> : <FaArrowDown />}
                {stat.change}
              </span>
            </div>

            <h2>{stat.value}</h2>
            <p>{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="dashboard-grid">
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <h3>{t("dashboard.salesOverview")}</h3>
              <p>{t("dashboard.salesSubtitle")}</p>
            </div>
          </div>

          <div className="chart-container" style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardSalesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartTheme.grid}
                />
                <XAxis dataKey="month" stroke={chartTheme.axis} />
                <YAxis stroke={chartTheme.axis} />
                <Tooltip
                  formatter={(v) =>
                    `${v.toLocaleString()} ${t("common.currency")}`
                  }
                  contentStyle={{
                    background: chartTheme.tooltipBg,
                    borderRadius: "8px",
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                  }}
                />
                <Bar dataKey="sales" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>{t("dashboard.recentOrders")}</h3>
              <p>{t("dashboard.recentOrdersSubtitle")}</p>
            </div>
          </div>

          <div className="orders-list">
            {(recentOrders.length ? recentOrders : dashboardRecentOrders).map((order) => (
              <div className="order-item" key={order.id}>
                <div>
                  <strong>{t("dashboard.orderLabel")} {order.id}</strong>
                  <span>{order.customer}</span>
                </div>
                <div>
                  <strong>
                    {order.amount.toLocaleString()} {t("common.currency")}
                  </strong>
                  <span className={`status ${order.status}`}>
                    {t(`purchases.status.${order.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock */}
      <div className="dashboard-card" style={{ marginTop: "24px" }}>
        <div className="card-header">
          <div>
            <h3>{t("dashboard.lowStockProducts")}</h3>
            <p>{t("dashboard.lowStockSubtitle")}</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("dashboard.table.product")}</th>
                <th>{t("dashboard.table.category")}</th>
                <th>{t("dashboard.table.stock")}</th>
                <th>{t("dashboard.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => {
                const status = getProductStockStatus(p.stock);
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`status-badge ${status === "lowStock" ? "low-stock" : status === "outOfStock" ? "out-of-stock" : "in-stock"}`}>
                        {t(`inventory.status.${status}`)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
