const CACHE = "lm-v1";
const PRECACHE = [
  "/explore/learning-music/",
  "/explore/learning-music/beats/",
  "/explore/learning-music/notes-scales/",
  "/explore/learning-music/chords/",
  "/explore/learning-music/basslines/",
  "/explore/learning-music/melodies/",
  "/explore/learning-music/song-structure/",
  "/js/vendor/tone-15.5.66.js",
  "/js/explore-learning-music-shared.js",
  "/js/explore-learning-music-audio.js",
  "/js/explore-learning-music.js",
  "/js/explore-learning-music-lessons.js",
  "/css/reset.css",
  "/css/explore-learning-music.css",
  "/css/explore-learning-music-lessons.css",
  "/img/learning-music/bird.svg",
];

const PRECACHE_PATHS = new Set(PRECACHE);

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(function (cache) {
        return Promise.all(
          PRECACHE.map(function (url) {
            return cache.add(url).catch(function () {
              void 0;
            });
          })
        );
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (names) {
        return Promise.all(
          names
            .filter(function (name) {
              return name !== CACHE;
            })
            .map(function (name) {
              return caches.delete(name);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!PRECACHE_PATHS.has(url.pathname)) return;
  event.respondWith(
    fetch(request)
      .then(function (response) {
        const copy = response.clone();
        caches
          .open(CACHE)
          .then(function (cache) {
            return cache.put(request, copy);
          })
          .catch(function () {
            void 0;
          });
        return response;
      })
      .catch(function () {
        return caches.match(request);
      })
  );
});
