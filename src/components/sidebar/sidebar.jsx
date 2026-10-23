import { NavLink } from "react-router-dom";
import {
  FaBars,
  FaBoxes,
  FaCalculator,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaCog,
  FaShoppingBag,
  FaShoppingCart,
  FaTachometerAlt,
  FaTruck,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ isCollapsed, onToggle }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const menuGroups = [
    {
      title: "overview",
      items: [{ name: "dashboard", path: "/", icon: <FaTachometerAlt /> }],
    },
    {
      title: "operations",
      items: [
        { name: "sales", path: "/sales", icon: <FaShoppingCart /> },
        { name: "purchases", path: "/purchases", icon: <FaShoppingBag /> },
        { name: "inventory", path: "/inventory", icon: <FaBoxes /> },
      ],
    },
    {
      title: "directory",
      items: [
        { name: "customers", path: "/customers", icon: <FaUsers /> },
        { name: "suppliers", path: "/suppliers", icon: <FaTruck /> },
        { name: "employees", path: "/employees", icon: <FaUserTie /> },
      ],
    },
    {
      title: "financial",
      items: [
        { name: "accounting", path: "/accounting", icon: <FaCalculator /> },
        { name: "reports", path: "/reports", icon: <FaChartBar /> },
      ],
    },
    {
      title: "system",
      items: [{ name: "settings", path: "/settings", icon: <FaCog /> }],
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="logo-icon">E</div>
          <div className="sidebar-brand">
            <h2>ERP System</h2>
            <span>{t("sidebar.workspace")}</span>
          </div>
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={onToggle}
          title={isCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
        >
          <FaBars />
          <span>{isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}</span>
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuGroups.map((group) => (
          <div className="sidebar-group" key={group.title}>
            <p className="menu-title">{t(`sidebar.${group.title}`)}</p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                title={isCollapsed ? t(`sidebar.${item.name}`) : undefined}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " active" : ""}`
                }
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">
                  {t(`sidebar.${item.name}`)}
                </span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user?.name || t("navbar.admin")}</strong>
            <span>
              <FaCircle /> {t("sidebar.online")}
            </span>
          </div>
        </div>
        <p>
          ERP System <span>v1.0.0</span>
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
