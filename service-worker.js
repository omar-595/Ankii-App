const cacheName = 'desktop-app-cache-v1';
const assetsToCache = [
    'index.html',
    'Timer.html',
    'noty.html',
    'list.html',
    'css/styles.css',
    'css/Timer.css',
    'css/noty.css',
    'css/list.css',
    'css/all.min.css',
    'script.js',
    'list.js',
    'noty.js',
    'manifest.json',
    'icon/icon.jpg'
];

// تثبيت Service Worker وتخزين الأصول في الكاش
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(assetsToCache);
        })
    );
});

// الاستجابة لطلبات الشبكة
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
