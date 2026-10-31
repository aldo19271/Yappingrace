// JWT HS256 minimal memakai WebCrypto (kompatibel dengan paket jsonwebtoken di Vercel).
const enc = new TextEncoder();
const dec = new TextDecoder();

function b64u(bytes) {
  let s = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64u(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function signToken(payload, secret, ttlSeconds) {
  const header = b64u(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Math.floor(Date.now() / 1000);
  const body = b64u(enc.encode(JSON.stringify({ ...payload, iat: now, exp: now + ttlSeconds })));
  const data = `${header}.${body}`;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(data));
  return `${data}.${b64u(sig)}`;
}

export async function verifyToken(token, secret) {
  try {
    if (!token || !secret) return null;
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      fromB64u(parts[2]),
      enc.encode(`${parts[0]}.${parts[1]}`),
    );
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(fromB64u(parts[1])));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
