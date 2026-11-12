/* Service worker de Hardware y Redes para Todos.
   Estrategia: shell precargado, navegación network-first y recursos cache-first. */
const CACHE = "hyr-shell-v3";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./computadoraa.glb"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("hyr-") && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          cache.put("./index.html", response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    const refresh = fetch(request).then(async (response) => {
      if (response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    });

    if (cached) {
      event.waitUntil(refresh.catch(() => undefined));
      return cached;
    }

    try {
      return await refresh;
    } catch {
      return Response.error();
    }
  })());
});
