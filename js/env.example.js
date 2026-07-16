/* Kurenai OS — env.example.js
   Cloud-sync configuration TEMPLATE. Copy this file to js/env.local.js and
   fill in the real values from your Supabase project (Dashboard → Settings
   → API). js/env.local.js is gitignored and must NEVER be committed.

   The publishable (anon) key is safe to expose to the browser — Row-Level
   Security on the Supabase tables is the actual security boundary. The
   secret / service-role key must never appear anywhere in this app.

   Without js/env.local.js the app runs exactly as before: fully local,
   cloud sync simply stays unconfigured. */
window.KOS_ENV = {
  SUPABASE_URL: "https://<project-ref>.supabase.co",
  SUPABASE_ANON_KEY: "<publishable-or-anon-key>"
};
