#!/usr/bin/env node
/* tools/gen_vapid.mjs — a VAPID key pair for closed-app delivery
   (docs/server-runner-plan.md §8). Run it ONCE:

     node tools/gen_vapid.mjs

   The PUBLIC key goes in js/env.local.js (VAPID_PUBLIC_KEY) and in the
   function secrets; the PRIVATE key goes ONLY in the function secrets
   (supabase secrets set VAPID_PRIVATE_KEY=…). Nothing is written to disk,
   and a new pair invalidates every existing subscription. */
const s = globalThis.crypto.subtle;
const b64u = (b) => Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const kp = await s.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const pub = new Uint8Array(await s.exportKey("raw", kp.publicKey));
const jwk = await s.exportKey("jwk", kp.privateKey);
console.log("VAPID_PUBLIC_KEY=" + b64u(pub));
console.log("VAPID_PRIVATE_KEY=" + jwk.d);
