// Runs once, the moment a password is first set (LockScreen's "create"
// step): finds any data saved before encryption existed -- plain state,
// plain blobs -- and re-saves it encrypted under the new key, so setting
// a password doesn't throw away whatever was already added. A fresh
// install simply has nothing to find here.
import type { AppState } from "../types";
import { putBlob, readLegacyPlainBlob, readLegacyPlainState, saveState } from "./db";

function collectBlobIds(state: AppState): string[] {
  const ids: string[] = [];
  for (const t of state.treasures) {
    for (const p of t.photos) ids.push(p.id);
    if (t.story.audioId) ids.push(t.story.audioId);
    if (t.note.audioId) ids.push(t.note.audioId);
  }
  return ids;
}

// Call this AFTER setEncryptionKey() has been called with the freshly
// created key, so saveState/putBlob can actually write.
export async function migrateLegacyDataIfAny(): Promise<void> {
  const legacy = await readLegacyPlainState<AppState>();
  if (!legacy) return;

  for (const id of collectBlobIds(legacy)) {
    const blob = await readLegacyPlainBlob(id);
    if (blob) await putBlob(id, blob);
  }
  await saveState(legacy);
}
