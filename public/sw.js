// HCMG Service Worker v2
// Network-first caching + offline fallback + web push notifications

const CACHE = "hcmg-v2";

// App shell — pre-cached on install
const SHELL = [
  "/offline",
  "/portal",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// ── Activate — purge old caches ────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch — network-first, fallback to cache, fallback to /offline ─────────
self.addEventListener("fetch", (event) => {
  // Only handle same-origin GET requests
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) return;

  // Never cache API routes or auth endpoints — always network only
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;

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
      .catch(() =>
        caches.match(event.request).then((cached) =>
          cached ?? caches.match("/offline")
        )
      )
  );
});

// ── Push — receive and display notification ────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "HCMG", body: event.data.text(), url: "/portal" };
  }

  const { title = "HCMG", body = "", icon, url = "/portal", badge } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  icon  ?? "/icons/icon-192.png",
      badge: badge ?? "/icons/icon-192.png",
      data:  { url },
      vibrate: [200, 100, 200],
    })
  );
});

// ── Notification click — open or focus the app ─────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/portal";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // If app is already open, focus it and navigate
        for (const client of clients) {
          if ("focus" in client) {
            client.focus();
            client.postMessage({ type: "NOTIFICATION_CLICK", url: targetUrl });
            return;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
