import { useState } from "react";
import { LogoMark } from "./Logo";

export function WelcomeScreen({
  onContinue,
  skipChecked,
}: {
  onContinue: (skipNextTime: boolean) => void;
  skipChecked: boolean;
}) {
  const [skip, setSkip] = useState(skipChecked);
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 20px 60px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "var(--rose)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogoMark size={40} color="var(--linen)" />
        </div>
      </div>
      <h1 style={{ fontSize: 30, marginBottom: 18 }}>Welcome to Love Attached</h1>
      <p style={{ color: "var(--stone)", fontSize: 18, marginBottom: 28, textAlign: "left" }}>
        You have treasures you want to pass on to the people you love. Love Attached helps make sure each one goes to
        the right person, along with its story and a note from you.
      </p>

      <div style={{ display: "grid", gap: 20, marginBottom: 28, textAlign: "left" }}>
        <Step icon={<CameraIcon />} title="Snap" body="a photo of something you treasure." />
        <Step
          icon={<MicIcon />}
          title="Tell"
          body="its story. Just tap the microphone and talk; we'll write it down for you."
        />
        <Step icon={<GiftIcon />} title="Give" body="it to someone whenever you're ready, with a note in your own voice." />
      </div>

      <p style={{ color: "var(--stone)", fontSize: 16, marginBottom: 28, textAlign: "left" }}>
        There's no rush. Add one treasure today and come back anytime. When you're ready, print a booklet for each
        person and finalize your list so your wishes are clear.
      </p>

      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: "var(--stone)", marginBottom: 24, cursor: "pointer" }}>
        <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} style={{ width: "auto" }} />
        I've read this — skip this page next time
      </label>

      <button
        type="button"
        className="btn-primary"
        style={{ fontSize: 18, padding: "16px 32px" }}
        onClick={() => onContinue(skip)}
      >
        Continue
      </button>
    </div>
  );
}

function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div
        style={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: "50%",
          background: "var(--blush)",
          color: "var(--rose)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <p style={{ margin: 0, paddingTop: 10 }}>
        <strong>{title}</strong> {body}
      </p>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx={12} cy={13} r={3.3} />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-14 0M12 18v3" strokeLinecap="round" />
    </svg>
  );
}
function GiftIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x={3} y={9} width={18} height={11} rx={1.5} />
      <path d="M3 13h18M12 9v11" />
      <path d="M8 9c-1.7 0-3-1.1-3-2.5S6.3 4 8 4c1.9 0 3.3 2 4 3.5C12.7 6 14.1 4 16 4c1.7 0 3 1.1 3 2.5S17.7 9 16 9" />
    </svg>
  );
}
