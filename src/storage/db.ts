// Minimal IndexedDB wrapper: one store for the app's structured data
// (treasures, people, finalization as a single JSON record), one store
// for binary blobs (photos and voice recordings), kept separate so the
// JSON record never balloons with base64 image/audio data.
const DB_NAME = "love-attached";
const DB_VERSION = 1;
const STATE_STORE = "state";
const BLOB_STORE = "blobs";
const STATE_KEY = "app";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STATE_STORE)) db.createObjectStore(STATE_STORE);
      if (!db.objectStoreNames.contains(BLOB_STORE)) db.createObjectStore(BLOB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadState<T>(fallback: T): Promise<T> {
  try {
    const value = await withStore<T | undefined>(STATE_STORE, "readonly", (s) => s.get(STATE_KEY));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function saveState<T>(value: T): Promise<void> {
  await withStore(STATE_STORE, "readwrite", (s) => s.put(value, STATE_KEY));
}

export async function putBlob(id: string, blob: Blob): Promise<void> {
  await withStore(BLOB_STORE, "readwrite", (s) => s.put(blob, id));
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  return withStore<Blob | undefined>(BLOB_STORE, "readonly", (s) => s.get(id));
}

export async function deleteBlob(id: string): Promise<void> {
  await withStore(BLOB_STORE, "readwrite", (s) => s.delete(id));
}

// Object URLs are cached per blob id for the life of the tab, since
// creating a new one on every render would leak memory.
const urlCache = new Map<string, string>();

export async function getBlobUrl(id: string | null | undefined): Promise<string | null> {
  if (!id) return null;
  if (urlCache.has(id)) return urlCache.get(id)!;
  const blob = await getBlob(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}
