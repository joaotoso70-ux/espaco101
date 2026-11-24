const GAS_URL = "https://script.google.com/macros/s/AKfycby2LVsIAlXthCBCUUXSfU-7KAx8p_PLwUJkTfOZz5ad5xohc8lhdFU0ZpAiR7Qs-lz6/exec";

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let data = {
      title: 'Espaço 101',
      body: 'Nova atualização na agenda!'
    };

    try {
      const resp = await fetch(GAS_URL + '?acao=ultima_notificacao&t=' + Date.now());
      if (resp.ok) {
        data = await resp.json();
      }
    } catch (e) {}

    return self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://i.ibb.co/m5WybQcx/logo-espaco-101-original.png',
      badge: 'https://i.ibb.co/m5WybQcx/logo-espaco-101-original.png',
      vibrate: [200, 100, 200],
      tag: 'espaco101-' + Date.now(),
      renotify: true,
      data: { url: self.registration.scope }
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(event.notification.data.url || './');
    })
  );
});
