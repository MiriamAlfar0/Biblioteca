const CACHE_NAME = 'biblioteca-cache-v1';

const urlsToCache = [
    '/',
    '/img/biblioteca.jpg',
  ];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Caché abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }

        if (event.request.method === 'POST') {
          // Si es una solicitud POST, no intentes cachearla
          return fetch(event.request);
        }

        return fetch(event.request)
          .then(function(response) {
            // Cachea la respuesta solo si es una solicitud GET exitosa
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(function(error) {
            console.error('Error en la solicitud:', error);
          });
      })
  );
});
