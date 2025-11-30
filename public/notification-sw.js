/* Basit bildirim service worker'ı: bildirime tıklandığında uygulama sekmesine odaklanır */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      if (clientList.length > 0) {
        const client = clientList[0];
        if (client.focus) {
          await client.focus();
        }
      } else if (self.clients.openWindow) {
        await self.clients.openWindow('/');
      }
    })(),
  );
});
