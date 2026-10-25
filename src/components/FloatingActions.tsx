// A small floating cluster pinned to the bottom-right of the screen, for
// long printable pages (the gift booklet, the family list) where the
// real Back/Print controls live at the very top -- scrolling down to
// read a page meant you had to scroll all the way back up just to print
// it or leave. Reported directly. Hidden while actually printing.
export function FloatingActions({ onBack, onPrint }: { onBack: () => void; onPrint: () => void }) {
  return (
    <div
      className="no-print"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 10,
      }}
    >
      <button
        type="button"
        onClick={onPrint}
        className="btn-primary"
        style={{ boxShadow: "0 2px 10px rgba(43,37,34,0.25)" }}
      >
        🖨 Print
      </button>
      <button
        type="button"
        onClick={onBack}
        className="btn-secondary"
        style={{ background: "var(--linen)", boxShadow: "0 2px 10px rgba(43,37,34,0.2)" }}
      >
        ← Back
      </button>
    </div>
  );
}
