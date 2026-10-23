
const CACHE_NAME = "success-coaching-v1";

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install: cache essential app files.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_FILES)
    )
  );

  self.skipWaiting();
});

// Activate: remove older versions of this app's cache.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) =>
            key.startsWith("success-coaching-") &&
            key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Serve cached app files when available.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Do not intercept backend requests.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      if (event.request.mode === "navigate") {
        const home = await caches.match("/index.html");
        if (home) return home;
      }

      return new Response("You are offline. Please reconnect.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    })
  );
});
