import { useEffect, useId, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Modal({ title, children, onClose }) {
  const contentRef = useRef(null);
  const titleId = useId();
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const timer = setTimeout(() => {
      const focusable = contentRef.current?.querySelector("input, select, textarea");
      focusable?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id={titleId}>{title}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <FaTimes />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
