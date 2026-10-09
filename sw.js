/* Better World School — service worker
   Goal: when you upload new code to Netlify, installed apps pick it up on the next
   open/refresh. No uninstall or reinstall needed.

   How:
   - The app page (index.html) is fetched NETWORK-FIRST, so a refresh always gets the newest code.
     The cached copy is only a fallback when the phone is offline or the network is very slow.
   - Same-origin files (icons, manifest) are served from cache and quietly refreshed.
   - Firebase, Google Fonts and every other website are never touched by this worker.
   - A new sw.js activates immediately (skipWaiting + clients.claim) and removes old caches.

   You do NOT have to edit this file for normal updates. Changing VERSION is optional. */
const VERSION = 'bws-1';
const CACHE = 'bws-cache-' + VERSION;
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const NETWORK_TIMEOUT_MS = 5000;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(CORE.map(u => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(request, fallbackUrl) {
  const fresh = fetch(request, { cache: 'no-store' }).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(fallbackUrl, copy)); }
    return res;
  });
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), NETWORK_TIMEOUT_MS));
  return Promise.race([fresh, timeout]).catch(() =>
    caches.match(fallbackUrl).then(hit => hit || fresh)   // cached copy if we have one, else keep waiting for the network
  );
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE).then(cache =>
    cache.match(request).then(hit => {
      const refresh = fetch(request).then(res => { if (res && res.ok) cache.put(request, res.clone()); return res; }).catch(() => null);
      return hit || refresh.then(res => res || Response.error());
    })
  );
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // Firebase, fonts, imgbb… go straight to the network
  if (url.pathname.endsWith('/sw.js')) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    event.respondWith(networkFirst(req, './index.html'));
    return;
  }
  event.respondWith(staleWhileRevalidate(req));
});
