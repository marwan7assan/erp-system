import { FaGlobe } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routers/AppRoutes";
import useLanguage from "./hooks/useLanguage";
import { useTranslation } from "react-i18next";

function LanguageFloatBtn() {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <button className="global-lang-btn" onClick={changeLanguage} title={t("common.changeLanguage")}>
      <FaGlobe />
      {language === "en" ? "العربية" : "English"}
    </button>
  );
}

function App() {
  const { pathname } = useLocation();
  // On ForgotPassword, AuthLanguageToggle is rendered at the top, so hide the floating button to ensure only one language button appears.
  const isForgotPasswordPage = pathname === "/forgot-password";

  return (
    <>
      <AppRoutes />
      {!isForgotPasswordPage && <LanguageFloatBtn />}
    </>
  );
}

export default App;
