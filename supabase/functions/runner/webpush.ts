/* Kurenai OS — runner/webpush.ts
   Web Push with nothing but WebCrypto (docs/server-runner-plan.md §5,
   decision E): the payload encrypted to the browser's keys (RFC 8291,
   aes128gcm, RFC 8188) and the request signed with VAPID (RFC 8292,
   ES256). No push library and no third party in the path; the private key
   is a function secret only.

   Runs unchanged in Deno and in Node (smoke97 decrypts what it makes). */

const enc = new TextEncoder();

export function b64u(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function unb64u(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function concat(...parts: Uint8Array[]): Uint8Array {
  const n = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}
/* HKDF with one block of output, which is all RFC 8291 needs */
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const prk = await hmac(salt, ikm);
  return (await hmac(prk, concat(info, new Uint8Array([1])))).slice(0, len);
}

/* ---- RFC 8291: encrypt a payload to one subscription ---- */
export async function encrypt(
  payload: Uint8Array, p256dh: string, authSecret: string,
  fixed?: { salt?: Uint8Array; keys?: CryptoKeyPair },
): Promise<Uint8Array> {
  const uaPublic = unb64u(p256dh), auth = unb64u(authSecret);
  const local = fixed?.keys ?? await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]) as CryptoKeyPair;
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", local.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, local.privateKey, 256));
  const ikm = await hkdf(auth, ecdh, concat(enc.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const salt = fixed?.salt ?? crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  /* one record: the payload, then the last-record delimiter 0x02 */
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, concat(payload, new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]);   // 4096
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, ct);
}

/* ---- RFC 8292: the VAPID header for one push service ---- */
export async function vapidHeader(endpoint: string, publicKey: string, privateKey: string, subject: string, now = Date.now()): Promise<string> {
  const pub = unb64u(publicKey);
  const jwk = { kty: "EC", crv: "P-256", d: privateKey, x: b64u(pub.slice(1, 33)), y: b64u(pub.slice(33, 65)), ext: true };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 3600, sub: subject })));
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(head + "." + body)));
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${publicKey}`;
}

export type Sub = { endpoint: string; p256dh: string; auth: string };
export type Vapid = { publicKey: string; privateKey: string; subject: string };

/* send one notification; resolves to the push service's status */
export async function send(sub: Sub, message: unknown, vapid: Vapid, opts: { ttl?: number; topic?: string } = {}): Promise<number> {
  const body = await encrypt(enc.encode(JSON.stringify(message)), sub.p256dh, sub.auth);
  const headers: Record<string, string> = {
    "Content-Encoding": "aes128gcm",
    "Content-Type": "application/octet-stream",
    "TTL": String(opts.ttl ?? 6 * 3600),
    "Urgency": "normal",
    "Authorization": await vapidHeader(sub.endpoint, vapid.publicKey, vapid.privateKey, vapid.subject),
  };
  /* a topic replaces an undelivered push with the same one (≤ 32 url-safe chars) */
  if (opts.topic) headers["Topic"] = opts.topic.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32);
  const res = await fetch(sub.endpoint, { method: "POST", headers, body });
  try { await res.arrayBuffer(); } catch { /* the body is never needed */ }
  return res.status;
}
