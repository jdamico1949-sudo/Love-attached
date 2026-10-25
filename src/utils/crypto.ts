// AES-256-GCM with a key derived from the password via PBKDF2-SHA-256,
// 310,000 iterations -- the same approach (and iteration count) Answer
// Key uses for its own password-protected backups, for consistency.
// The password itself is never stored; only a random salt is, since the
// salt isn't secret and is needed again to re-derive the same key next
// time the correct password is entered. There is no recovery path if
// the password is lost -- that's the point of real encryption.
const PBKDF2_ITERATIONS = 310000;

export function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface Encrypted {
  iv: ArrayBufferLike;
  ciphertext: ArrayBuffer;
}

export async function encryptBytes(key: CryptoKey, plaintext: BufferSource): Promise<Encrypted> {
  const iv = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, plaintext);
  return { iv: iv.buffer, ciphertext };
}

// Throws (an authentication failure, built into GCM) if `key` is wrong
// for this ciphertext -- this is what a wrong password is detected by,
// no separate check needed.
export async function decryptBytes(key: CryptoKey, enc: Encrypted): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(enc.iv) as BufferSource }, key, enc.ciphertext);
}

export async function encryptJSON(key: CryptoKey, data: unknown): Promise<Encrypted> {
  return encryptBytes(key, new TextEncoder().encode(JSON.stringify(data)));
}

export async function decryptJSON<T>(key: CryptoKey, enc: Encrypted): Promise<T> {
  const plaintext = await decryptBytes(key, enc);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

export interface EncryptedBlob extends Encrypted {
  type: string;
}

export async function encryptBlob(key: CryptoKey, blob: Blob): Promise<EncryptedBlob> {
  const buf = await blob.arrayBuffer();
  const enc = await encryptBytes(key, buf);
  return { ...enc, type: blob.type };
}

export async function decryptBlob(key: CryptoKey, enc: EncryptedBlob): Promise<Blob> {
  const buf = await decryptBytes(key, enc);
  return new Blob([buf], { type: enc.type });
}
