// IndexedDB wrapper: one store for the app's structured data (treasures,
// people, finalization as a single JSON record), one store for binary
// blobs (photos and voice recordings), and one small "meta" store for
// the encryption salt -- the one piece of password-derived setup that
// has to be readable *before* a password is entered. Both the state
// record and every blob are stored AES-256-GCM encrypted; see
// ../utils/crypto.ts. Nothing here can read or write anything until
// setEncryptionKey() has been called with a key derived from the
// correct password (LockScreen does this once, after it verifies the
// password itself by successfully decrypting the state with it).
import { decryptBlob, decryptJSON, encryptBlob, encryptJSON, type Encrypted, type EncryptedBlob } from "../utils/crypto";

const DB_NAME = "love-attached";
const DB_VERSION = 1;
const STATE_STORE = "state";
const BLOB_STORE = "blobs";
const META_STORE = "meta";
const STATE_KEY = "app";
const SALT_KEY = "salt";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STATE_STORE)) db.createObjectStore(STATE_STORE);
      if (!db.objectStoreNames.contains(BLOB_STORE)) db.createObjectStore(BLOB_STORE);
      if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
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

// --- Salt: the one thing readable before a key exists -------------------

export async function getSalt(): Promise<Uint8Array | null> {
  const v = await withStore<ArrayBuffer | undefined>(META_STORE, "readonly", (s) => s.get(SALT_KEY));
  return v ? new Uint8Array(v) : null;
}

export async function setSalt(salt: Uint8Array): Promise<void> {
  await withStore(META_STORE, "readwrite", (s) => s.put(salt.buffer, SALT_KEY));
}

// --- Encryption key: held in memory only, for the life of the tab -------

let encryptionKey: CryptoKey | null = null;

export function setEncryptionKey(key: CryptoKey): void {
  encryptionKey = key;
}

export function hasEncryptionKey(): boolean {
  return encryptionKey !== null;
}

function requireKey(): CryptoKey {
  if (!encryptionKey) throw new Error("Locked: no encryption key set yet");
  return encryptionKey;
}

// --- Legacy (pre-encryption) data, read raw for one-time migration ------

export async function readLegacyPlainState<T>(): Promise<T | null> {
  const raw = await withStore<unknown>(STATE_STORE, "readonly", (s) => s.get(STATE_KEY));
  if (raw && typeof raw === "object" && "treasures" in raw) return raw as T;
  return null;
}

export async function readLegacyPlainBlob(id: string): Promise<Blob | null> {
  const raw = await withStore<unknown>(BLOB_STORE, "readonly", (s) => s.get(id));
  return raw instanceof Blob ? raw : null;
}

// --- State (encrypted) ---------------------------------------------------

export async function loadState<T>(fallback: T): Promise<T> {
  const key = requireKey();
  const record = await withStore<Encrypted | undefined>(STATE_STORE, "readonly", (s) => s.get(STATE_KEY));
  if (!record) return fallback;
  return decryptJSON<T>(key, record);
}

export async function saveState<T>(value: T): Promise<void> {
  const key = requireKey();
  const enc = await encryptJSON(key, value);
  await withStore(STATE_STORE, "readwrite", (s) => s.put(enc, STATE_KEY));
}

// --- Blobs (encrypted) ----------------------------------------------------

export async function putBlob(id: string, blob: Blob): Promise<void> {
  const key = requireKey();
  const enc = await encryptBlob(key, blob);
  await withStore(BLOB_STORE, "readwrite", (s) => s.put(enc, id));
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  const key = requireKey();
  const record = await withStore<EncryptedBlob | undefined>(BLOB_STORE, "readonly", (s) => s.get(id));
  if (!record) return undefined;
  return decryptBlob(key, record);
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
