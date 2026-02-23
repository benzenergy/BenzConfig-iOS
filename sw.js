const CACHE_NAME = 'benzconfig-cache-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/res/logo_about.svg',
    '/res/icon.png'
];

// Установка SW и кэширование
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Активация
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// Перехват запросов
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
