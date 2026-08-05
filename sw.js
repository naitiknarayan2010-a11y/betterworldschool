// Better World School — Service Worker
// Bump CACHE_NAME any time you want to force all installed devices to
// drop old cached files (rarely needed — this SW already avoids staleness
// by always preferring the network for your main HTML file).
const CACHE_NAME = 'bws-shell-v1';

// Only the app "shell" — icons and manifest — are cached. The HTML itself
// is deliberately NOT pre-cached here, so every online visit always loads
// your latest deployed code from Netlify, never a stuck old version.
const SHELL_FILES = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // activate the new SW immediately, don't wait around
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Navigation requests (loading the page itself): ALWAYS try the network
  // first. Only fall back to a cached copy if the device is truly offline.
  // This is the important part — it prevents the app from ever getting
  // stuck showing an old version while you're actively updating it.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Shell assets (icons, manifest): cache-first, since these rarely change.
  if (SHELL_FILES.some((f) => req.url.endsWith(f.replace('./', '')))) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // Everything else (Firebase calls, external links, etc.): just pass
  // through to the network untouched — never intercept live data.
});
