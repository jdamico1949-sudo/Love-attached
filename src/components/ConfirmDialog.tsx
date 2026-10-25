// A plain in-app confirm dialog -- never the browser's confirm()/alert(),
// which look jarring in a standalone/PWA window and can be suppressed by
// the OS. Used anywhere an action needs a yes/no before it happens.
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43,37,34,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: 420, width: "100%", background: "var(--linen)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 20, marginBottom: 10 }}>{title}</h3>
        {body && <p style={{ color: "var(--stone)", marginBottom: 18 }}>{body}</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" className="btn-plain" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn-primary"
            style={danger ? { background: "#A33" } : undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
