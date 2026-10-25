import { useEffect, useState } from "react";
import type { Photo } from "../types";
import { getBlobUrl, putBlob, deleteBlob } from "../storage/db";
import { newId } from "../utils/id";

export function PhotoPicker({ photos, onChange }: { photos: Photo[]; onChange: (photos: Photo[]) => void }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(photos.map((p) => getBlobUrl(p.id).then((url) => [p.id, url] as const))).then((pairs) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      pairs.forEach(([id, url]) => {
        if (url) next[id] = url;
      });
      setUrls(next);
    });
    return () => {
      cancelled = true;
    };
  }, [photos]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const added: Photo[] = [];
    try {
      for (const file of Array.from(files)) {
        const id = newId();
        await putBlob(id, file);
        added.push({ id, isMain: false });
      }
    } catch {
      setError(
        added.length > 0
          ? "Only some of those photos saved — you can add the rest again."
          : "That photo couldn't be saved. Try again, or try a different photo."
      );
      if (added.length === 0) return;
    }
    const next = [...photos, ...added];
    if (!next.some((p) => p.isMain) && next.length > 0) next[0].isMain = true;
    onChange(next);
  }

  function setMain(id: string) {
    onChange(photos.map((p) => ({ ...p, isMain: p.id === id })));
  }

  async function remove(id: string) {
    await deleteBlob(id);
    const next = photos.filter((p) => p.id !== id);
    if (!next.some((p) => p.isMain) && next.length > 0) next[0].isMain = true;
    onChange(next);
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
        {photos.map((p) => (
          <div key={p.id} style={{ position: "relative", width: 96, height: 96 }}>
            {urls[p.id] && (
              <img
                src={urls[p.id]}
                alt=""
                style={{
                  width: 96,
                  height: 96,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: p.isMain ? "3px solid var(--rose)" : "1px solid var(--line)",
                }}
              />
            )}
            <button
              type="button"
              onClick={() => remove(p.id)}
              aria-label="Remove photo"
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "var(--ink)",
                color: "#fff",
                border: "none",
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ×
            </button>
            {!p.isMain && (
              <button
                type="button"
                onClick={() => setMain(p.id)}
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  right: 4,
                  fontSize: 11,
                  background: "rgba(43,37,34,0.7)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "2px 4px",
                }}
              >
                Make main
              </button>
            )}
          </div>
        ))}
        <label
          style={{
            width: 96,
            height: 96,
            border: "2px dashed var(--line)",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--rose)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          <CameraIcon />
          Add photo
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      {error && <p style={{ color: "#A33", fontSize: 13, margin: 0 }}>{error}</p>}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ marginBottom: 4 }}>
      <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx={12} cy={13} r={3.3} />
    </svg>
  );
}
