/* 오프라인 실행용 서비스 워커 — 두 앱을 함께 담당합니다.
   · opic_ih_daily_english.html (매일 영어)
   · hackers_toeic_vocab_30.html (토익 보카)
   페이지가 자체 완결형이라 한 번만 받아두면 비행기 모드에서도 열립니다.
   내용을 고쳐 배포할 때는 CACHE 버전을 올리세요. */
const CACHE = 'hackers-toeic-v4';

/* 앱 껍데기 — 설치할 때 미리 받아둡니다. */
const SHELLS = [
  './opic_ih_daily_english.html',
  './hackers_toeic_vocab_30.html'
];
const ASSETS = SHELLS.concat([
  './manifest.webmanifest',
  './manifest-toeic.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons-toeic/icon-180.png',
  './icons-toeic/icon-192.png',
  './icons-toeic/icon-512.png',
  './icons-toeic/icon-maskable-512.png'
]);

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

/* 오프라인일 때 돌려줄 앱 껍데기를 요청 주소에서 고릅니다. */
function shellFor(url) {
  return url.indexOf('hackers_toeic_vocab_30') >= 0 ? SHELLS[1] : SHELLS[0];
}

/* 네트워크 우선, 실패하면 캐시 — 배포본이 바뀌면 다음 실행에 바로 반영되고
   오프라인일 때는 마지막으로 받아둔 버전으로 열립니다.
   토익 보카가 쓰는 CDN 폰트처럼 다른 출처의 파일도 받아둔 적이 있으면 그대로 씁니다. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      })
      .catch(function () {
        return caches.match(e.request).then(function (hit) {
          if (hit) return hit;
          if (e.request.mode === 'navigate') return caches.match(shellFor(e.request.url));
          return Response.error();
        });
      })
  );
});
