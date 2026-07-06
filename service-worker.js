// Bump this version any time index.html/manifest/icons change,
// so returning visitors get the update instead of a stale cached copy.
const CACHE_NAME = "bw-school-shell-v1";

const APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Cache the app shell up front so the app can open offline.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Clean up old caches when a new service worker takes over.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle our own same-origin app-shell files.
  // Everything else (Firebase, gstatic, fonts) goes straight to the network
  // so live data is never served stale.
  const url = new URL(req.url);
  const isOwnOrigin = url.origin === self.location.origin;

  if (req.method !== "GET" || !isOwnOrigin) {
    return; // let the browser handle it normally
  }

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        // Keep the cached shell fresh whenever we're online.
        const clone = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return networkRes;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
  );
});
