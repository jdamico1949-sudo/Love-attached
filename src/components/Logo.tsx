export function LogoMark({ size = 40, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={(size * 64) / 72} viewBox="0 0 72 64" fill="none" role="img" aria-label="Love Attached" style={{ color }}>
      <path d="M32 14 H62 a4 4 0 0 1 4 4 V46 a4 4 0 0 1 -4 4 H32 L18 32 Z" stroke="currentColor" strokeWidth={3.2} strokeLinejoin="round" />
      <circle cx={29} cy={32} r={3} stroke="currentColor" strokeWidth={2.6} />
      <path d="M26 32 C 17 32, 12 29, 12 23" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M12 23 C 4 17, 5 8, 12 11.5 C 19 8, 20 17, 12 23 Z" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <span style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: size, color: "var(--ink)" }}>
      Love <span style={{ fontStyle: "italic", color: "var(--rose)" }}>Attached</span>
    </span>
  );
}

export function LogoLockup({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <LogoMark size={size} color="var(--rose)" />
      <Wordmark size={size * 0.75} />
    </div>
  );
}
