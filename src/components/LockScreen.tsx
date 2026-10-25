import { useEffect, useState } from "react";
import { deriveKey, randomBytes } from "../utils/crypto";
import { getSalt, loadState, setEncryptionKey, setSalt } from "../storage/db";
import { migrateLegacyDataIfAny } from "../storage/migrate";
import { LogoMark } from "./Logo";

type Mode = "checking" | "create" | "enter";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [mode, setMode] = useState<Mode>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSalt().then((salt) => setMode(salt ? "enter" : "create"));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 4) {
      setError("Please use at least 4 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those two don't match.");
      return;
    }
    setBusy(true);
    try {
      const salt = randomBytes(16);
      const key = await deriveKey(password, salt);
      setEncryptionKey(key);
      await setSalt(salt);
      await migrateLegacyDataIfAny();
      onUnlock();
    } catch {
      setError("Something went wrong setting that up. Please try again.");
      setBusy(false);
    }
  }

  async function handleEnter(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const salt = await getSalt();
      if (!salt) throw new Error("no salt");
      const key = await deriveKey(password, salt);
      setEncryptionKey(key);
      await loadState(null); // throws if the password is wrong (GCM auth failure)
      onUnlock();
    } catch {
      setError("That password doesn't match. Try again.");
      setBusy(false);
    }
  }

  if (mode === "checking") return null;

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "60px 20px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "var(--rose)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogoMark size={36} color="var(--linen)" />
        </div>
      </div>

      {mode === "create" ? (
        <form onSubmit={handleCreate} className="card">
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Set a password</h2>
          <p style={{ color: "var(--stone)", fontSize: 14, marginBottom: 18 }}>
            This encrypts everything you add — treasures, photos, and recordings — right on this device.
          </p>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{ marginBottom: 14 }}
          />
          <label>Confirm password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <p style={{ color: "#A33", fontSize: 13, marginTop: 14, marginBottom: 4 }}>
            There's no way to recover this if it's forgotten — the data is locked with it. Write it down somewhere
            safe.
          </p>
          {error && <p style={{ color: "#A33", fontSize: 13, marginTop: 8 }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 16 }} disabled={busy}>
            {busy ? "Setting up…" : "Set password & continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleEnter} className="card">
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: "var(--stone)", fontSize: 14, marginBottom: 18 }}>Enter your password to unlock.</p>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p style={{ color: "#A33", fontSize: 13, marginTop: 8 }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 16 }} disabled={busy}>
            {busy ? "Unlocking…" : "Unlock"}
          </button>
        </form>
      )}
    </div>
  );
}
