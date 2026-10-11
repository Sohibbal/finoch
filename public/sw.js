// Finoch PWA Service Worker (v3) - Resilient Offline Shell & Full Route Precache
const CACHE_NAME = "finoch-shell-v4";

const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/wallets",
  "/budget",
  "/streak",
  "/audit",
  "/debts",
  "/bills",
  "/split-bill",
  "/wishlist",
  "/reports",
  "/meal-calc",
  "/ukt-savings",
  "/simulator",
  "/goals",
  "/copilot",
  "/insights",
  "/profile",
  "/onboarding",
  "/manifest.webmanifest",
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
          if (shouldDeleteCache(key)) {
            console.log(`[Finoch SW] Removing old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Keep model/runtime caches and unrelated applications intact.
function shouldDeleteCache(name) {
  return /^(finoch|voicash)-shell-v\d+$/.test(name) && name !== CACHE_NAME;
}

function getFetchStrategy(request, origin) {
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== origin ||
      url.pathname === "/api" || url.pathname.startsWith("/api/")) return "bypass";
  if (request.mode === "navigate" || url.searchParams.has("_rsc") ||
      request.headers.get("RSC") === "1") return "network-first";
  if (["/_next/static/", "/icons/", "/fonts/", "/wasm/"].some(prefix => url.pathname.startsWith(prefix)) ||
      /^\/[^/]+\.(svg|png|ico)$/.test(url.pathname)) return "cache-first";
  return "bypass";
}

self.addEventListener("fetch", (event) => {
  const strategy = getFetchStrategy(event.request, self.location.origin);
  if (strategy === "bypass") return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const isNavigation = event.request.mode === "navigate";
    const isWasm = new URL(event.request.url).pathname.startsWith("/wasm/");
    const assetCache = isWasm ? await caches.open("finoch-whisper-wasm") : cache;
    if (strategy === "cache-first") {
      const cached = await assetCache.match(event.request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(event.request);
      // RSC payloads are deployment-specific: never persist them or use HTML fallbacks.
      if (response.ok && (strategy === "cache-first" || isNavigation)) {
        await assetCache.put(event.request, response.clone());
      }
      return response;
    } catch {
      if (isNavigation) {
        for (const key of [event.request, new URL(event.request.url).pathname, "/dashboard", "/"]) {
          const cached = await cache.match(key);
          if (cached) return cached;
        }
      }
      return new Response("Resource offline tidak tersedia", { status: 503 });
    }
  })());
});
