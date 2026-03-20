const CACHE = 'redalert-v1';
const ASSETS = [
  '/redalert-map/',
  '/redalert-map/index.html',
  '/redalert-map/js/app.js',
  '/redalert-map/manifest.json'
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', e => {
  // Never intercept ESP32 API calls — always go to network
  if (e.request.url.includes('192.168.') || e.request.url.includes('192.168.4.1')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  self.registration.showNotification(data.title || 'Red Alert!', {
    body: data.body || 'Rocket alert active',
    icon: '/redalert-map/icons/icon-192.png',
    badge: '/redalert-map/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'redalert',
    renotify: true
  });
});
