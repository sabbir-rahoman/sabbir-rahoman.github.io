const CACHE_NAME = 'fifa-stream-cache-v1';
const urlsToCache = [
  './',
  './fifa.html',
  './manifest.json'
];

// Service Worker ইন্সটল করা এবং ফাইলগুলো ক্যাশ করা
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// নেটওয়ার্ক রিকোয়েস্ট হ্যান্ডেল করা
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // ক্যাশে থাকলে ক্যাশ থেকে দেখাবে, না থাকলে নেটওয়ার্ক থেকে আনবে
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// পুরোনো ক্যাশ ডিলিট করে নতুন ভার্সন আপডেট করা
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});