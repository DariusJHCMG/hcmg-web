// HCMG Portal Service Worker
// Minimal SW — just enough for PWA installability + offline shell caching

const CACHE = "hcmg-portal-v1";

// App shell routes to pre-cache
const SHELL = [
  "/portal",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first strategy — always try network, fall back to cache
self.addEventListener("fetch", (event) => {
  // Only handle same-origin GET requests
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache successful HTML + static asset responses
        if (res.ok && (
          res.headers.get("content-type")?.includes("text/html") ||
          event.request.url.match(/\.(js|css|png|svg|woff2?)$/)
        )) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
