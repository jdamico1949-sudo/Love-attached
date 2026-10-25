import { useStore } from "../store";
import { useBlobUrl } from "../utils/useBlobUrl";
import type { Treasure } from "../types";
import { LogoMark } from "./Logo";
import { useState } from "react";

export function GiftBookletPage({ onBack }: { onBack: () => void }) {
  const { state } = useStore();
  const peopleWithTreasures = state.people.filter((p) =>
    state.treasures.some((t) => t.recipient.type === "person" && t.recipient.personId === p.id)
  );
  const [personId, setPersonId] = useState<string>(peopleWithTreasures[0]?.id || "");

  const person = state.people.find((p) => p.id === personId);
  const treasures = state.treasures.filter((t) => t.recipient.type === "person" && t.recipient.personId === personId);
  const finalizedAt = state.finalization.finalizedAt;

  return (
    <div>
      <div className="no-print" style={{ maxWidth: 640, margin: "0 auto", padding: 20 }}>
        <button type="button" className="btn-plain" onClick={onBack} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <h2 style={{ marginBottom: 16 }}>Gift booklet</h2>
        {peopleWithTreasures.length === 0 ? (
          <p style={{ color: "var(--stone)" }}>No treasures have a person chosen yet.</p>
        ) : (
          <>
            <label>Whose booklet?</label>
            <select value={personId} onChange={(e) => setPersonId(e.target.value)} style={{ marginBottom: 20 }}>
              {peopleWithTreasures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <br />
            <button type="button" className="btn-primary" onClick={() => window.print()}>
              Print this booklet
            </button>
          </>
        )}
      </div>

      {person && (
        <div className="booklet-print">
          <CoverPage personName={person.name} signedAs={state.lastSignedAs} treasureCount={treasures.length} finalizedAt={finalizedAt} />
          {treasures.map((t, i) => (
            <TreasurePage key={t.id} treasure={t} personName={person.name} pageNum={i + 2} totalPages={treasures.length + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function CoverPage({
  personName,
  signedAs,
  treasureCount,
  finalizedAt,
}: {
  personName: string;
  signedAs: string;
  treasureCount: number;
  finalizedAt: string | null;
}) {
  const fromLine = signedAs ? `Treasures from ${signedAs.replace(/^love,?\s*/i, "")}` : "Treasures for you";
  return (
    <div className="booklet-page" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <LogoMark size={36} color="var(--rose)" />
      <h1 style={{ fontSize: 42, marginTop: 24 }}>
        For <span style={{ fontStyle: "italic", color: "var(--rose)" }}>{personName}</span>
      </h1>
      <p style={{ fontSize: 18, color: "var(--stone)", marginTop: 8 }}>{fromLine}</p>
      <p style={{ marginTop: 40, color: "var(--stone)" }}>{treasureCount} treasure{treasureCount === 1 ? "" : "s"} inside</p>
      {finalizedAt && (
        <p style={{ position: "absolute", bottom: 40, fontSize: 13, color: "var(--stone)" }}>
          Finalized {new Date(finalizedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function TreasurePage({
  treasure,
  personName,
  pageNum,
  totalPages,
}: {
  treasure: Treasure;
  personName: string;
  pageNum: number;
  totalPages: number;
}) {
  const main = treasure.photos.find((p) => p.isMain) || treasure.photos[0];
  const url = useBlobUrl(main?.id);

  return (
    <div className="booklet-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "var(--stone)",
          borderBottom: "1px solid var(--line)",
          paddingBottom: 8,
          marginBottom: 16,
        }}
      >
        <span>For {personName}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <LogoMark size={14} color="var(--rose)" /> Love Attached
        </span>
      </div>

      {url && (
        <img
          src={url}
          alt=""
          style={{ width: "100%", height: "4.2in", objectFit: "cover", borderRadius: 10, marginBottom: 16 }}
        />
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--rose)", letterSpacing: 0.5 }}>
          {treasure.category}
        </div>
        <h2 style={{ fontSize: 26 }}>{treasure.name}</h2>
        {treasure.provenance && <p style={{ fontStyle: "italic", color: "var(--stone)" }}>{treasure.provenance}</p>}
      </div>

      {treasure.story.text && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--stone)", letterSpacing: 0.5, marginBottom: 6 }}>
            The story
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>{treasure.story.text}</p>
        </div>
      )}

      {treasure.note.text && (
        <div className="card" style={{ background: "#fff" }}>
          <p style={{ fontFamily: "var(--font-hand)", fontSize: 18, whiteSpace: "pre-wrap", margin: 0 }}>
            {treasure.note.text}
          </p>
          {treasure.signedAs && (
            <p style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "var(--rose)", textAlign: "right", marginTop: 10, marginBottom: 0 }}>
              {treasure.signedAs}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "0.4in",
          left: "0.6in",
          right: "0.6in",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--stone)",
          borderTop: "1px solid var(--line)",
          paddingTop: 6,
        }}
      >
        <span>From {treasure.signedAs || "Grandma"}</span>
        <span>
          Page {pageNum} of {totalPages}
        </span>
      </div>
    </div>
  );
}
