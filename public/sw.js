const CACHE = 'nerv-pwa-v4';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Устанавливаем и кэшируем статику
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Очищаем старые кэши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Стратегия: Stale-while-revalidate для статики, Network-first для страниц
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/sound/');
  const isImage = event.request.destination === 'image';
  const isPage = event.request.mode === 'navigate';
  const isApi = url.pathname.startsWith('/api/');

  // API — не кэшируем
  if (isApi) return;

  // Статика и изображения — Cache-first
  if (isStatic || isImage) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Страницы — Network-first с fallback на кэш
  if (isPage) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => {
          // Если нет в кэше — показываем главную
          return cached || caches.match('/');
        }))
    );
    return;
  }

  // Всё остальное — Network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push-уведомления
self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || 'НЕРВ';
  const options = {
    body: data.body || 'Новое уведомление',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const existing = clientList.find((client) => client.url === url);
      if (existing) {
        existing.focus();
      } else {
        clients.openWindow(url);
      }
    })
  );
});
