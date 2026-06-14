const CACHE_NAME = 'fifa-stream-cache-v2'; // ভার্সন পরিবর্তন করা হয়েছে
const urlsToCache = [
  './',
  './fifa.html',
  './manifest.json'
];

// Service Worker ইন্সটল করা এবং সাথে সাথে ফোর্স অ্যাক্টিভ করা
self.addEventListener('install', event => {
  self.skipWaiting(); // ব্রাউজারের অপেক্ষায় না থেকে সাথে সাথে আপডেট করবে
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache v2');
        return cache.addAll(urlsToCache);
      })
  );
});

// পুরোনো ক্যাশ ডিলিট করে নতুন ভার্সন আপডেট করা এবং ক্লায়েন্ট কন্ট্রোল নেওয়া
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim()); // পেজ রিলোড ছাড়াই নতুন সার্ভিস ওয়ার্কার কাজ শুরু করবে
  
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// নেটওয়ার্ক রিকোয়েস্ট হ্যান্ডেল করা (Network First Strategy)
self.addEventListener('fetch', event => {
  // লাইভ স্ট্রিমিং ফাইল (.m3u8 এবং .ts) ক্যাশ করবে না, সরাসরি সার্ভার থেকে আনবে
  if (event.request.url.includes('.m3u8') || event.request.url.includes('.ts')) {
    return; // ব্রাউজারের ডিফল্ট নিয়মে ফেচ হতে দেবে
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // নেটওয়ার্ক থেকে নতুন ডাটা পেলে সেটাই রিটার্ন করবে
        return response;
      })
      .catch(() => {
        // ইন্টারনেট না থাকলে বা রিকোয়েস্ট ফেইল করলে তখন ক্যাশ থেকে দেখাবে
        return caches.match(event.request);
      })
  );
});