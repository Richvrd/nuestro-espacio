const SECRET_KEY = process.env.CAPSULE_SECRET_KEY!;

async function getKey(): Promise<CryptoKey> {
  const raw = Buffer.from(SECRET_KEY, 'hex');
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptMessage(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const ivB64 = Buffer.from(iv).toString('base64');
  const ctB64 = Buffer.from(cipherBuffer).toString('base64');
  return `${ivB64}:${ctB64}`;
}

export async function decryptMessage(ciphertext: string): Promise<string> {
  const key = await getKey();
  const [ivB64, ctB64] = ciphertext.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(plainBuffer);
}
