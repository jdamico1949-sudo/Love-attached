import { useState } from "react";
import { useStore } from "../store";
import { LogoLockup } from "./Logo";
import { ConfirmDialog } from "./ConfirmDialog";

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
  const { state, setFinalization } = useStore();
  const [confirmUnlock, setConfirmUnlock] = useState(false);
  const count = state.treasures.length;
  const everFinalized = !!state.finalization.finalizedAt;
  const locked = everFinalized && state.finalization.locked;

  function confirmAndUnlock() {
    setFinalization({ locked: false });
    setConfirmUnlock(false);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 20px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <LogoLockup />
      </header>

      {locked && (
        <div className="card" style={{ background: "var(--blush)", borderColor: "var(--rose)", marginBottom: 20 }}>
          <strong style={{ color: "var(--rose)" }}>🔒 Locked</strong> — finalized{" "}
          {new Date(state.finalization.finalizedAt!).toLocaleDateString()}, signed {state.finalization.signedName}.
          Unlock it to add or edit.
        </div>
      )}
      {!locked && everFinalized && (
        <div className="card" style={{ marginBottom: 20 }}>
          Finalized {new Date(state.finalization.finalizedAt!).toLocaleDateString()}, signed{" "}
          {state.finalization.signedName}, and now unlocked for editing. Tap "Make it official" below when you're
          ready to lock it again.
        </div>
      )}

      {locked ? (
        <div className="card" style={{ textAlign: "center", padding: "36px 24px", marginBottom: 20 }}>
          <p style={{ color: "var(--stone)", marginBottom: 20, fontSize: 16 }}>
            Your list is locked, so nothing can be added or edited by accident.
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: 17, padding: "16px 32px" }}
            onClick={() => setConfirmUnlock(true)}
          >
            🔓 Unlock to add or edit
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}

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
            {!locked && (
              <button type="button" className="btn-primary" onClick={onFinalize}>
                Make it official
              </button>
            )}
          </div>
        </div>
      )}

      <footer style={{ textAlign: "center", marginTop: 40 }}>
        <button type="button" className="btn-plain" onClick={onHowItWorks}>
          How it works
        </button>
      </footer>

      <ConfirmDialog
        open={confirmUnlock}
        title="Unlock to make changes?"
        body="This un-finalizes your list until you finalize it again. You'll be able to add or edit right away."
        confirmLabel="Unlock"
        onConfirm={confirmAndUnlock}
        onCancel={() => setConfirmUnlock(false)}
      />
    </div>
  );
}
