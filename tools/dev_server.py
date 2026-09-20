#!/usr/bin/env python3
"""Static dev server for KurenaiOS: python3 tools/dev_server.py [port]

Identical to `python3 -m http.server` except every response carries
`Cache-Control: no-store`. Without it Chrome's heuristic HTTP cache (the
default server sends only Last-Modified) keeps handing the service worker
stale copies of edited files, and a change can take several reloads to
appear. Production (Cloudflare Pages) sets its own headers; this file is a
development convenience only and is not deployed."""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_message(self, fmt, *args):  # keep the log to one line per request
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer.allow_reuse_address = True
    with ThreadingHTTPServer(("", port), NoCacheHandler) as httpd:
        print("Serving with Cache-Control: no-store on port %d" % port)
        httpd.serve_forever()
