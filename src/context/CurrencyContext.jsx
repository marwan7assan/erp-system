import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

const CurrencyContext = createContext(null);

const CURRENCY_MAP = {
  ar: {
    EGP: "ج.م",
    USD: "$",
    EUR: "€",
    SAR: "ر.س",
  },
  en: {
    EGP: "EGP",
    USD: "USD",
    EUR: "EUR",
    SAR: "SAR",
  },
};

export const getCurrencySymbol = (code = "EGP", lang = "en") => {
  const languageKey = lang === "ar" ? "ar" : "en";
  return CURRENCY_MAP[languageKey][code] || code;
};

const getStoredCurrency = () => {
  try {
    const raw = localStorage.getItem("erp.settings");
    if (!raw) return "EGP";
    const parsed = JSON.parse(raw);
    return parsed.generalForm?.currency || "EGP";
  } catch {
    return "EGP";
  }
};

export function CurrencyProvider({ children }) {
  const { i18n } = useTranslation();
  const [currencyCode, setCurrencyCode] = useState(getStoredCurrency);

  const syncCurrency = useCallback(() => {
    const currentCode = getStoredCurrency();
    setCurrencyCode(currentCode);

    // Sync with i18n common.currency so any t("common.currency") across app reflects it
    const enLabel = getCurrencySymbol(currentCode, "en");
    const arLabel = getCurrencySymbol(currentCode, "ar");
    i18n.addResource("en", "translation", "common.currency", enLabel);
    i18n.addResource("ar", "translation", "common.currency", arLabel);
  }, [i18n]);

  useEffect(() => {
    syncCurrency();

    const handleStorage = () => syncCurrency();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("erp:settings-updated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("erp:settings-updated", handleStorage);
    };
  }, [syncCurrency]);

  const currency = getCurrencySymbol(currencyCode, i18n.language);

  const formatCurrency = useCallback(
    (amount) => {
      const num = Number(amount) || 0;
      return `${num.toLocaleString()} ${currency}`;
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currencyCode,
        currency,
        formatCurrency,
        setCurrencyCode,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    const code = getStoredCurrency();
    return {
      currencyCode: code,
      currency: code === "EGP" ? "EGP" : code,
      formatCurrency: (amount) => `${Number(amount || 0).toLocaleString()} ${code}`,
    };
  }
  return context;
}

