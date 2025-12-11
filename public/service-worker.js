self.addEventListener("install", () => {
  console.log("Service worker installed.");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("Service worker activated.");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
