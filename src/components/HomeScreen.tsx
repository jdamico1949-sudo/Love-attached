import { useStore } from "../store";
import { LogoLockup } from "./Logo";

export function HomeScreen({
  onAdd,
  onSummary,
  onBooklet,
  onFamilyList,
  onFinalize,
  onHowItWorks,
}: {
  onAdd: () => void;
  onSummary: () => void;
  onBooklet: () => void;
  onFamilyList: () => void;
  onFinalize: () => void;
  onHowItWorks: () => void;
}) {
  const { state } = useStore();
  const count = state.treasures.length;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 20px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <LogoLockup />
      </header>

      {state.finalization.finalizedAt && (
        <div className="card" style={{ background: "var(--blush)", borderColor: "var(--rose)", marginBottom: 20 }}>
          <strong style={{ color: "var(--rose)" }}>Finalized</strong> on{" "}
          {new Date(state.finalization.finalizedAt).toLocaleDateString()} — signed {state.finalization.signedName}.
        </div>
      )}

      <div className="card" style={{ textAlign: "center", padding: "36px 24px", marginBottom: 20 }}>
        <p style={{ color: "var(--stone)", marginBottom: 20, fontSize: 16 }}>
          {count === 0 ? "You haven't added a treasure yet." : `You've added ${count} treasure${count === 1 ? "" : "s"} so far.`}
        </p>
        <button type="button" className="btn-primary" style={{ fontSize: 17, padding: "16px 32px" }} onClick={onAdd}>
          + Add a treasure
        </button>
      </div>

      <button
        type="button"
        onClick={onSummary}
        className="card"
        style={{ width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}
      >
        <span>
          <strong style={{ display: "block", fontSize: 16 }}>View your treasures</strong>
          <span style={{ color: "var(--stone)", fontSize: 14 }}>See everyone's gifts, and check for anything still missing a home</span>
        </span>
        <span style={{ color: "var(--rose)", fontWeight: 700, fontSize: 18 }}>→</span>
      </button>

      {count > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, marginBottom: 14 }}>When you're ready</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn-secondary" onClick={onBooklet}>
              Print a gift booklet
            </button>
            <button type="button" className="btn-secondary" onClick={onFamilyList}>
              Print the family list
            </button>
            <button type="button" className="btn-primary" onClick={onFinalize}>
              {state.finalization.finalizedAt ? "Unlock to make a change" : "Make it official"}
            </button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: "center", marginTop: 40 }}>
        <button type="button" className="btn-plain" onClick={onHowItWorks}>
          How it works
        </button>
      </footer>
    </div>
  );
}
