// HCMG Service Worker v5
// Static-assets-only cache + push notifications
// HTML pages are NEVER cached — always fetched fresh from network

const CACHE = "hcmg-v5";

// Only pre-cache true static assets — NOT HTML pages
const SHELL = [
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

// ── Message — SKIP_WAITING from PwaInit ───────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Activate — purge ALL old caches ───────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Only handle same-origin GET requests
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) return;

  const url = new URL(event.request.url);

  // Never intercept API routes
  if (url.pathname.startsWith("/api/")) return;

  // HTML navigation requests — always network-first, never cache
  // Fall back to /offline only when truly offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/offline").then((r) => r ?? Response.error())
      )
    );
    return;
  }

  // Static assets (js, css, images, fonts) — cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Everything else — network only
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
        for (const client of clients) {
          if ("focus" in client) {
            client.focus();
            client.postMessage({ type: "NOTIFICATION_CLICK", url: targetUrl });
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
