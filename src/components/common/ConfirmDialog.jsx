import Modal from "./Modal";
import { useTranslation } from "react-i18next";

export default function ConfirmDialog({ onConfirm, onClose }) {
  const { t } = useTranslation();
  return <Modal title={t("common.delete")} onClose={onClose}>
    <div className="modal-body"><p className="confirm-dialog-message">{t("common.confirmDelete")}</p></div>
    <div className="modal-footer">
      <button type="button" className="secondary-btn" onClick={onClose}>{t("common.cancel")}</button>
      <button type="button" className="delete-btn confirm-delete-btn" onClick={onConfirm}>{t("common.delete")}</button>
    </div>
  </Modal>;
}
