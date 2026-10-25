import { useEffect, useState } from "react";
import type { Person, Treasure } from "../types";
import { getBlobUrl } from "../storage/db";
import { treasureStatus } from "../types";

export function TreasureCard({
  treasure,
  people,
  onOpen,
}: {
  treasure: Treasure;
  people: Person[];
  onOpen: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const main = treasure.photos.find((p) => p.isMain) || treasure.photos[0];
  const status = treasureStatus(treasure);
  const recipient = treasure.recipient.personId ? people.find((p) => p.id === treasure.recipient.personId) : null;

  useEffect(() => {
    getBlobUrl(main?.id).then(setUrl);
  }, [main?.id]);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="card"
      style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 10, width: "100%" }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 8,
          background: "var(--blush)",
          overflow: "hidden",
        }}
      >
        {url && <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <strong style={{ fontSize: 17, color: "var(--ink)" }}>{treasure.name || "Untitled treasure"}</strong>
      {status === "placed" && treasure.recipient.type === "person" && (
        <span style={{ fontSize: 14, color: "var(--stone)" }}>For {recipient?.name || "someone"}</span>
      )}
      {status === "placed" && treasure.recipient.type !== "person" && (
        <span style={{ fontSize: 14, color: "var(--stone)" }}>
          {treasure.recipient.type === "donate" ? "To be donated" : "To be sold"}
        </span>
      )}
      <span
        style={{
          alignSelf: "flex-start",
          fontSize: 12,
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: 999,
          background: status === "placed" ? "var(--blush)" : "var(--line)",
          color: status === "placed" ? "var(--rose)" : "var(--stone)",
        }}
      >
        {status === "placed" ? "Has a home" : "Still deciding"}
      </span>
    </button>
  );
}
