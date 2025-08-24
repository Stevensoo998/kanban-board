import React, { useEffect, useState } from "react";
export default function ConfirmDialog({
  open,
  title = "Delete card",
  message = "Are you sure?",
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}) {
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) setClosing(false);
  }, [open]);
  if (!open) return null;

  function requestClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose?.();
    }, 160);
  }
  function handleBackdrop(e) {
    if (e.target.getAttribute("data-backdrop")) requestClose();
  }
  function onKeyDown(e) {
    if (e.key === "Escape") requestClose();
  }

  return (
    <div
      className="modal__backdrop"
      data-backdrop
      data-closing={closing ? "true" : undefined}
      onClick={handleBackdrop}
      onKeyDown={onKeyDown}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal" data-closing={closing ? "true" : undefined}>
        <header className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button
            className="btn btn--ghost"
            onClick={requestClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="modal__body">
          <p className="muted" style={{ margin: 0 }}>
            {message}
          </p>
        </div>

        <footer className="modal__footer">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={requestClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => {
              onConfirm?.();
              requestClose();
            }}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
