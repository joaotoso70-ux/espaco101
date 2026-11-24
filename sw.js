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
      title: '',
      body: 'Novo Agendamento\nUm novo horário foi marcado na agenda.'
    };

    try {
      const resp = await fetch(GAS_URL + '?acao=ultima_notificacao&t=' + Date.now(), {
        redirect: 'follow',
        cache: 'no-store'
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && typeof json.body === 'string') data = json;
      }
    } catch (e) {}

    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      client.postMessage({ type: 'PUSH_RECEIVED', data });
    }

    const ua = (self.navigator && self.navigator.userAgent) ? self.navigator.userAgent : '';
    const isAndroid = /Android/i.test(ua);

    // Só coloca título no Android. No iPhone vai sempre vazio.
    const tituloFinal = isAndroid ? (data.title || 'Espaço 101') : '';

    return self.registration.showNotification(tituloFinal, {
      body: data.body,
      icon: './logo.png',
      badge: './logo.png',
      silent: false,
      vibrate: [250, 100, 250],
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
