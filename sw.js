const CACHE_NAME = 'benzconfig-cache-v2';

const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/res/logo_about.svg',
    '/res/icon.png'
];

// Установка
self.addEventListener('install', event => {
    self.skipWaiting(); // сразу активировать новый SW
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Fetch: сначала кэш, потом сеть
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
