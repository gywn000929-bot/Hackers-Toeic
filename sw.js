/* 오프라인 실행용 서비스 워커.
   페이지 자체가 자체 완결형이라 한 번만 받아두면 비행기 모드에서도 열립니다.
   내용을 고쳐 배포할 때는 CACHE 버전을 올리세요. */
const CACHE = 'opic-ih-1000-v3';
const ASSETS = [
  './opic_ih_daily_english.html',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* 네트워크 우선, 실패하면 캐시 — 배포본이 바뀌면 다음 실행에 바로 반영되고
   오프라인일 때는 마지막으로 받아둔 버전으로 열립니다. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (res) {
        if (res && res.ok && new URL(e.request.url).origin === self.location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      })
      .catch(function () {
        return caches.match(e.request).then(function (hit) {
          return hit || caches.match('./opic_ih_daily_english.html');
        });
      })
  );
});
