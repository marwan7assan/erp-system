import {
  FaSearch,
  FaBell,
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
} from "react-icons/fa";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const searchablePages = useMemo(() => [
    ["/", t("sidebar.dashboard")],
    ["/sales", t("sidebar.sales")],
    ["/purchases", t("sidebar.purchases")],
    ["/inventory", t("sidebar.inventory")],
    ["/customers", t("sidebar.customers")],
    ["/suppliers", t("sidebar.suppliers")],
    ["/employees", t("sidebar.employees")],
    ["/accounting", t("sidebar.accounting")],
    ["/reports", t("sidebar.reports")],
    ["/settings", t("sidebar.settings")],
  ], [t]);
  const searchResults = search.trim()
    ? searchablePages.filter(([, label]) => label.toLowerCase().includes(search.trim().toLowerCase()))
    : [];

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchResults[0]) {
      navigate(searchResults[0][0]);
      setSearch("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <form className="navbar-search" onSubmit={handleSearchSubmit} role="search">
        <FaSearch />
        <input
          type="text"
          placeholder={t("navbar.search")}
          aria-label={t("navbar.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="global-search-results" role="listbox">
            {searchResults.map(([path, label]) => (
              <button key={path} type="button" onClick={() => { navigate(path); setSearch(""); }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="navbar-actions">
        <button
          className="notification-btn"
          type="button"
          title={t("navbar.notifications")}
        >
          <FaBell />
        </button>

        <div className="profile">
          <FaUserCircle className="profile-icon" />

          <div className="profile-info">
            <strong>{user?.name || t("navbar.admin")}</strong>
            <span>{user?.role || t("navbar.administrator")}</span>
          </div>

          <FaChevronDown className="profile-arrow" />
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          title={t("navbar.logout")}
          type="button"
        >
          <FaSignOutAlt />
          <span>{t("navbar.logout")}</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
