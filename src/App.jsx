import { FaGlobe } from "react-icons/fa";
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
  return (
    <>
      <AppRoutes />
      <LanguageFloatBtn />
    </>
  );
}

export default App;
