import { useEffect, useState } from "react";
import type { Person, Treasure } from "../types";
import { getBlobUrl } from "../storage/db";
import { treasureStatus } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

export function TreasureCard({
  treasure,
  people,
  onOpen,
  onDelete,
}: {
  treasure: Treasure;
  people: Person[];
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const main = treasure.photos.find((p) => p.isMain) || treasure.photos[0];
  const status = treasureStatus(treasure);
  const recipient = treasure.recipient.personId ? people.find((p) => p.id === treasure.recipient.personId) : null;
  const displayName = treasure.name || "this treasure";

  useEffect(() => {
    getBlobUrl(main?.id).then(setUrl);
  }, [main?.id]);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", padding: 0, overflow: "hidden" }}>
      <button
        type="button"
        onClick={onOpen}
        style={{
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          background: "none",
          border: "none",
          padding: 18,
          paddingBottom: 0,
          font: "inherit",
          color: "inherit",
        }}
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

      <button
        type="button"
        onClick={() => setConfirmingDelete(true)}
        aria-label={`Delete ${displayName}`}
        title={`Delete ${displayName}`}
        style={{
          alignSelf: "flex-end",
          background: "none",
          border: "none",
          color: "var(--stone)",
          fontSize: 13,
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        🗑 Delete
      </button>

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete ${displayName}?`}
        body="This removes it, its photos, and its recording for good. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmingDelete(false);
          onDelete();
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
