import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export default function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback((language) => {
    const nextLanguage = typeof language === "string" ? language : (i18n.language === "en" ? "ar" : "en");
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
  }, [i18n]);

  return { language: i18n.language, changeLanguage };
}
