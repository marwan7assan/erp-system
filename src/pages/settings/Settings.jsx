import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBuilding,
  FaGlobe,
  FaShieldAlt,
  FaBell,
  FaCheckCircle,
  FaSave,
} from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import useLanguage from "../../hooks/useLanguage";
import { authApi } from "../../services/api";
import { USE_API } from "../../config/dataSource";

function Settings() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [savedSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("erp.settings") || "{}");
    } catch {
      return {};
    }
  });
  const [activeTab, setActiveTab] = useState("general");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passwordState, setPasswordState] = useState({ error: "", success: false, submitting: false });
  const saveTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Form states
  const [generalForm, setGeneralForm] = useState({
    companyName:
      savedSettings.generalForm?.companyName || "Al-Amal Integrated Solutions",
    companyEmail:
      savedSettings.generalForm?.companyEmail || "management@alamal-erp.eg",
    phone: savedSettings.generalForm?.phone || "+20 2 2765 4321",
    currency: savedSettings.generalForm?.currency || "EGP",
    taxNumber: savedSettings.generalForm?.taxNumber || "987-654-321",
    address:
      savedSettings.generalForm?.address ||
      "Building 45, Smart Village, Giza, Egypt",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: savedSettings.notifications?.emailAlerts ?? true,
    stockAlerts: savedSettings.notifications?.stockAlerts ?? true,
    orderAlerts: savedSettings.notifications?.orderAlerts ?? false,
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: savedSettings.securityForm?.twoFactor ?? true,
  });

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(
      "erp.settings",
      JSON.stringify({
        generalForm,
        notifications,
        securityForm: { twoFactor: securityForm.twoFactor },
      })
    );
    window.dispatchEvent(new Event("erp:settings-updated"));
    setSavedSuccess(true);
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = securityForm;
    if (!currentPassword || !newPassword || !confirmPassword) return setPasswordState({ error: t("settings.security.passwordRequired"), success: false, submitting: false });
    if (newPassword.length < 8) return setPasswordState({ error: t("settings.security.passwordTooShort"), success: false, submitting: false });
    if (newPassword !== confirmPassword) return setPasswordState({ error: t("settings.security.passwordsNoMatch"), success: false, submitting: false });
    if (currentPassword === newPassword) return setPasswordState({ error: t("settings.security.passwordMustDiffer"), success: false, submitting: false });
    setPasswordState({ error: "", success: false, submitting: true });
    try {
      if (USE_API) await authApi.changePassword(currentPassword, newPassword);
      setSecurityForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setPasswordState({ error: "", success: true, submitting: false });
    } catch (error) {
      setPasswordState({ error: error.message, success: false, submitting: false });
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        action={
          <button className="primary-btn" onClick={handleSave}>
            <FaSave />
            <span>{t("settings.saveChanges")}</span>
          </button>
        }
      />

      {savedSuccess && (
        <div className="toast-success">
          <FaCheckCircle />
          <span>{t("settings.savedSuccess")}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <FaBuilding />
          <span>{t("settings.tabs.general")}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "localization" ? "active" : ""}`}
          onClick={() => setActiveTab("localization")}
        >
          <FaGlobe />
          <span>{t("settings.tabs.localization")}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <FaShieldAlt />
          <span>{t("settings.tabs.security")}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          <FaBell />
          <span>{t("settings.tabs.notifications")}</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="content-card">
        {/* General Profile */}
        {activeTab === "general" && (
          <div className="settings-section">
            <h3>{t("settings.tabs.general")}</h3>
            <p className="section-desc">{t("settings.subtitle")}</p>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="company-name">
                    {t("settings.general.companyName")}
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    name="companyName"
                    value={generalForm.companyName}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company-email">
                    {t("settings.general.companyEmail")}
                  </label>
                  <input
                    id="company-email"
                    type="email"
                    name="companyEmail"
                    value={generalForm.companyEmail}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company-phone">
                    {t("settings.general.phone")}
                  </label>
                  <input
                    id="company-phone"
                    type="text"
                    name="phone"
                    value={generalForm.phone}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company-currency">
                    {t("settings.general.currency")}
                  </label>
                  <select
                    id="company-currency"
                    name="currency"
                    value={generalForm.currency}
                    onChange={handleGeneralChange}
                  >
                    <option value="EGP">EGP - Egyptian Pound</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="company-tax-number">
                    {t("settings.general.taxNumber")}
                  </label>
                  <input
                    id="company-tax-number"
                    type="text"
                    name="taxNumber"
                    value={generalForm.taxNumber}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="company-address">
                    {t("settings.general.address")}
                  </label>
                  <textarea
                    id="company-address"
                    rows="3"
                    name="address"
                    value={generalForm.address}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Localization */}
        {activeTab === "localization" && (
          <div className="settings-section">
            <h3>{t("settings.tabs.localization")}</h3>
            <p className="section-desc">
              Manage language preferences, timezones, and calendar formats.
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="settings-language">
                  {t("settings.localization.language")}
                </label>
                <select
                  id="settings-language"
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                >
                  <option value="ar">{t("settings.localization.arabic")}</option>
                  <option value="en">{t("settings.localization.english")}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="settings-timezone">
                  {t("settings.localization.timezone")}
                </label>
                <select id="settings-timezone" defaultValue="Africa/Cairo">
                  <option value="Africa/Cairo">(GMT+02:00) Cairo, Egypt</option>
                  <option value="Asia/Riyadh">
                    (GMT+03:00) Riyadh, Saudi Arabia
                  </option>
                  <option value="Asia/Dubai">(GMT+04:00) Dubai, UAE</option>
                  <option value="UTC">(GMT+00:00) UTC Standard</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="settings-date-format">
                  {t("settings.localization.dateFormat")}
                </label>
                <select id="settings-date-format" defaultValue="YYYY-MM-DD">
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-22)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (22/09/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (09/22/2026)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="settings-section">
            <h3>{t("settings.tabs.security")}</h3>
            <p className="section-desc">
              Update administrative credentials and enforce authentication protocols.
            </p>

            <form onSubmit={handlePasswordChange}>
            <div className="form-grid form-grid-spaced">
              <div className="form-group full-width">
                <label htmlFor="security-current-password">
                  {t("settings.security.currentPassword")}
                </label>
                <input
                  id="security-current-password"
                  type="password"
                  value={securityForm.currentPassword}
                  onChange={(e) =>
                    setSecurityForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label htmlFor="security-new-password">
                  {t("settings.security.newPassword")}
                </label>
                <input
                  id="security-new-password"
                  type="password"
                  value={securityForm.newPassword}
                  onChange={(e) =>
                    setSecurityForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label htmlFor="security-confirm-password">
                  {t("settings.security.confirmNewPassword")}
                </label>
                <input
                  id="security-confirm-password"
                  type="password"
                  value={securityForm.confirmPassword}
                  onChange={(e) =>
                    setSecurityForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>

            {passwordState.error && <div className="form-error" role="alert">{passwordState.error}</div>}
            {passwordState.success && <div className="toast-success"><FaCheckCircle />{t("settings.security.passwordUpdated")}</div>}
            <button className="primary-btn" type="submit" disabled={passwordState.submitting}>
              {passwordState.submitting && <span className="button-spinner" />}
              {t("settings.security.updatePassword")}
            </button>
            </form>

            <div className="toggle-group">
              <div className="toggle-info">
                <h4>{t("settings.security.twoFactor")}</h4>
                <span>{t("settings.security.twoFactorDesc")}</span>
              </div>
              <label htmlFor="security-two-factor" className="switch">
                <input
                  id="security-two-factor"
                  type="checkbox"
                  checked={securityForm.twoFactor}
                  onChange={() =>
                    setSecurityForm((prev) => ({
                      ...prev,
                      twoFactor: !prev.twoFactor,
                    }))
                  }
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="settings-section">
            <h3>{t("settings.tabs.notifications")}</h3>
            <p className="section-desc">
              Choose which alerts and reports are dispatched automatically.
            </p>

            <div className="toggle-group">
              <div className="toggle-info">
                <h4>{t("settings.notifications.emailAlerts")}</h4>
                <span>{t("settings.notifications.emailAlertsDesc")}</span>
              </div>
              <label htmlFor="notif-email-alerts" className="switch">
                <input
                  id="notif-email-alerts"
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={() => handleToggleNotification("emailAlerts")}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-group">
              <div className="toggle-info">
                <h4>{t("settings.notifications.stockAlerts")}</h4>
                <span>{t("settings.notifications.stockAlertsDesc")}</span>
              </div>
              <label htmlFor="notif-stock-alerts" className="switch">
                <input
                  id="notif-stock-alerts"
                  type="checkbox"
                  checked={notifications.stockAlerts}
                  onChange={() => handleToggleNotification("stockAlerts")}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-group">
              <div className="toggle-info">
                <h4>{t("settings.notifications.orderAlerts")}</h4>
                <span>{t("settings.notifications.orderAlertsDesc")}</span>
              </div>
              <label htmlFor="notif-order-alerts" className="switch">
                <input
                  id="notif-order-alerts"
                  type="checkbox"
                  checked={notifications.orderAlerts}
                  onChange={() => handleToggleNotification("orderAlerts")}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
