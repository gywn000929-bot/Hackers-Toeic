/* 오프라인 실행용 서비스 워커 — '영어 공부방' 한 앱을 담당합니다.
   · index.html                  홈
   · opic_ih_daily_english.html  매일 영어
   · hackers_toeic_vocab_30.html 토익 보카
   페이지가 자체 완결형이라 한 번만 받아두면 비행기 모드에서도 열립니다.
   내용을 고쳐 배포할 때는 CACHE 버전을 올리세요. */
const CACHE = 'english-room-v12';

/* 앱 껍데기 — 설치할 때 미리 받아둡니다. */
const HOME = './index.html';
const SHELLS = [
  HOME,
  './opic_ih_daily_english.html',
  './hackers_toeic_vocab_30.html'
];
const ASSETS = SHELLS.concat([
  './',
  './manifest.webmanifest',
  './fonts/PretendardVariable.woff2',
  './icons-app/icon-180.png',
  './icons-app/icon-192.png',
  './icons-app/icon-512.png',
  './icons-app/icon-maskable-512.png',
  './icons/icon-192.png',
  './icons-toeic/icon-192.png'
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

/* 오프라인일 때 돌려줄 화면을 요청 주소에서 고릅니다. */
function shellFor(url) {
  if (url.indexOf('hackers_toeic_vocab_30') >= 0) return SHELLS[2];
  if (url.indexOf('opic_ih_daily_english') >= 0) return SHELLS[1];
  return HOME;
}

/* 네트워크 우선, 실패하면 캐시 — 배포본이 바뀌면 다음 실행에 바로 반영되고
   오프라인일 때는 마지막으로 받아둔 버전으로 열립니다. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  /* 화면(HTML)은 브라우저 HTTP 캐시를 건너뛰고 받아옵니다.
     GitHub Pages 가 max-age=600 을 붙여 주기 때문에, 그냥 fetch 하면
     10분 지난 사본이 돌아와 새 버전이 늦게 반영됩니다. */
  var isPage = e.request.mode === 'navigate' ||
               (e.request.destination === 'document') ||
               /\.html($|\?)/.test(e.request.url) ||
               /\/$/.test(new URL(e.request.url).pathname);
  var netReq = e.request;
  if (isPage) {
    try { netReq = new Request(e.request, { cache: 'reload' }); } catch (err) {}
  }

  e.respondWith(
    fetch(netReq)
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
