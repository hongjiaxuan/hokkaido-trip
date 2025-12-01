// 修改版本號來觸發更新 (目前是 v3.0)
const CACHE_NAME = 'hokkaido-trip-v3.0';

// 這裡把 index.html 會用到的外部資源(CSS/Fonts)都加進去
// 這樣離線時，版面才不會跑掉
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.jpg', 
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 安裝事件：下載檔案並強制接管
self.addEventListener('install', event => {
  // skipWaiting 會讓新 Service Worker 不用等待舊的關閉就直接進入 active 狀態
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 啟動事件：清理舊快取 (關鍵步驟！)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 如果發現快取名稱不是現在的 v3.0，就把它刪掉
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('刪除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 讓新的 Service Worker 立即控制所有頁面
  return self.clients.claim();
});

// 攔截請求：有快取讀快取，沒快取上網抓
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果快取有，就回傳快取
        if (response) {
          return response;
        }
        // 如果快取沒有，就去網路抓
        return fetch(event.request);
      })
  );
});