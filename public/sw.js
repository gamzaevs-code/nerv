const CACHE = 'nerv-pwa-v2';
const ASSETS = ['/', '/manifest.json', '/icon.svg', '/icons/icon-192.svg', '/icons/icon-512.svg'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      if (event.request.url.includes('/_next/static/') || event.request.destination === 'image') {
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match('/')))
  );
});
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Нерв', body: 'Новое уведомление', url: '/' };
  event.waitUntil(self.registration.showNotification(data.title || 'Нерв', {
    body: data.body || '',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    data: { url: data.url || '/' },
  }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});
