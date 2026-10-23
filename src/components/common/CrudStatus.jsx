import { useTranslation } from "react-i18next";

export default function CrudStatus({ isLoading, error, actionError, onRetry, onDismiss }) {
  const { t } = useTranslation();
  if (isLoading) return <div className="crud-loading">{t("common.loading")}</div>;
  if (error) {
    return <div className="crud-banner crud-banner-error" role="alert"><span>{error.message || t("common.requestFailed")}</span><button type="button" onClick={onRetry}>{t("common.retry")}</button></div>;
  }
  if (actionError) {
    return <div className="crud-banner crud-banner-error" role="alert"><span>{actionError}</span><button type="button" onClick={onDismiss}>{t("common.dismiss")}</button></div>;
  }
  return null;
}
