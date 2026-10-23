import { FaGlobe } from "react-icons/fa";
import useLanguage from "../../hooks/useLanguage";

function AuthLanguageToggle() {
  const { language, changeLanguage } = useLanguage();

  return <button type="button" className="auth-language-toggle" onClick={changeLanguage}>
    <FaGlobe /> {language === "en" ? "العربية" : "English"}
  </button>;
}

export default AuthLanguageToggle;
