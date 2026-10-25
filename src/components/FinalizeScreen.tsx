import { useState } from "react";
import { useStore } from "../store";
import { todayIso } from "../utils/id";

export function FinalizeScreen({ onBack }: { onBack: () => void }) {
  const { state, setFinalization } = useStore();
  const [name, setName] = useState(state.finalization.signedName);
  const finalized = !!state.finalization.finalizedAt;

  function finalize() {
    setFinalization({ finalizedAt: todayIso(), signedName: name.trim(), locked: true });
  }

  function unlock() {
    setFinalization({ locked: false });
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
      <button type="button" className="btn-plain" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Back
      </button>

      {finalized && state.finalization.locked ? (
        <div className="card">
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>This list is finalized</h2>
          <p style={{ color: "var(--stone)", marginBottom: 16 }}>
            Finalized {new Date(state.finalization.finalizedAt!).toLocaleDateString()}, signed{" "}
            {state.finalization.signedName || "—"}.
          </p>
          <p style={{ color: "var(--stone)", fontSize: 14, marginBottom: 20 }}>
            This isn't a lock on the device — anyone using it could still unlock and change things. It's there so you
            don't change the list by accident once you've told your attorney about it.
          </p>
          <button type="button" className="btn-secondary" onClick={unlock}>
            Unlock to make a change
          </button>
        </div>
      ) : (
        <div className="card">
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Make it official</h2>
          <p style={{ color: "var(--stone)", marginBottom: 20 }}>
            Finalize, date, and sign to help ensure your wishes are carried out (consult with your attorney).
          </p>
          <label>Your full name, as a signature</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kathleen D'Amico" />
          <p style={{ color: "var(--stone)", fontSize: 13, marginTop: 16, marginBottom: 20 }}>
            Many states let a will refer to a dated, signed list like this one. Rules vary, so ask your attorney how
            to connect it to your will.
          </p>
          <button type="button" className="btn-primary" onClick={finalize} disabled={!name.trim()}>
            Finalize and sign
          </button>
        </div>
      )}
    </div>
  );
}
