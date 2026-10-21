/* Kurenai OS — github-token/jwt.ts
   The GitHub App's own JWT (RS256, nine minutes), signed with WebCrypto
   from the App's private key. Pure, so Node holds it in smoke98. */

/* ---- the App's JWT (RS256), from a PKCS#1 or PKCS#8 PEM ---- */
function b64u(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function derLen(n: number): Uint8Array {
  if (n < 128) return new Uint8Array([n]);
  const b: number[] = [];
  while (n > 0) { b.unshift(n & 0xff); n >>= 8; }
  return new Uint8Array([0x80 | b.length, ...b]);
}
function der(tag: number, body: Uint8Array): Uint8Array {
  const l = derLen(body.length);
  const out = new Uint8Array(1 + l.length + body.length);
  out[0] = tag; out.set(l, 1); out.set(body, 1 + l.length);
  return out;
}
function cat(...a: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(a.reduce((n, x) => n + x.length, 0));
  let o = 0;
  for (const x of a) { out.set(x, o); o += x.length; }
  return out;
}
/* GitHub hands out PKCS#1 ("BEGIN RSA PRIVATE KEY"); WebCrypto takes
   PKCS#8, which wraps it: SEQUENCE { 0, rsaEncryption, OCTET STRING } */
export function pkcs8(pem: string): Uint8Array {
  const body = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const raw = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  if (/BEGIN PRIVATE KEY/.test(pem)) return raw;
  const version = new Uint8Array([0x02, 0x01, 0x00]);
  const alg = der(0x30, new Uint8Array([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00]));
  return der(0x30, cat(version, alg, der(0x04, raw)));
}
export async function appJwt(appId: string, pem: string, now = Date.now()): Promise<string> {
  const key = await crypto.subtle.importKey("pkcs8", pkcs8(pem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const enc = new TextEncoder();
  const iat = Math.floor(now / 1000) - 60;
  const head = b64u(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const body = b64u(enc.encode(JSON.stringify({ iat, exp: iat + 540, iss: appId })));
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(head + "." + body)));
  return `${head}.${body}.${b64u(sig)}`;
}
