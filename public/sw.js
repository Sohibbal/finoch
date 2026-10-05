// Finoch PWA Service Worker (v2) - Resilient Offline Shell & Offline-Ready
const CACHE_NAME = "finoch-shell-v2";

const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/simulator",
  "/goals",
  "/copilot",
  "/insights",
  "/profile",
  "/onboarding",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install Event: Non-blocking asset pre-caching
// Uses Promise.allSettled so a redirect or missing asset never aborts installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { cache: "reload" });
            if (response && response.ok) {
              await cache.put(asset, response);
            }
          } catch (err) {
            console.warn(`[Finoch SW] Skipped caching non-critical asset: ${asset}`, err);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up outdated caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[Finoch SW] Removing old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Skip non-http/https requests (e.g. chrome-extension://)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Skip API routes from service worker cache (handled by IndexedDB + sync queue)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 1. Navigation requests: Network-first, fall back to cached page or root shell "/"
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const pathnameMatch = await caches.match(url.pathname);
          if (pathnameMatch) {
            return pathnameMatch;
          }
          const rootFallback = await caches.match("/");
          if (rootFallback) {
            return rootFallback;
          }
          return new Response("Aplikasi sedang offline. Silakan buka kembali saat terhubung.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        })
    );
    return;
  }

  // 2. Static assets & media (JS, CSS, images, fonts): Stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);

      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => null);

      // Return cached version immediately if available (stale-while-revalidate)
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not cached, await the network response
      const networkResponse = await fetchPromise;
      if (networkResponse) {
        return networkResponse;
      }

      // Fallback matching by URL pathname
      const fallbackResponse = await cache.match(url.pathname);
      if (fallbackResponse) {
        return fallbackResponse;
      }

      return new Response("Resource offline tidak tersedia", {
        status: 504,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    })
  );
});
