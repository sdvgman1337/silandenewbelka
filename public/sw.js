const APP_SHELL_CACHE = 'silande-quest-shell-v2';
const MAP_TILES_CACHE = 'silande-quest-tiles-v2';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  'https://cdn.jsdelivr.net/npm/ol@v10.3.1/ol.css',
  'https://cdn.jsdelivr.net/npm/ol@v10.3.1/dist/ol.js',
  'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js'
];

// Преобразование координат lat/lng в номера тайлов XYZ для предкэширования квадрата базы «Силандэ»
function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

function buildSilandeTileUrls() {
  // Квадрат территории базы отдыха «Силандэ» и озера Силандэ
  const minLat = 60.3785;
  const maxLat = 60.3855;
  const minLon = 30.2635;
  const maxLon = 30.2745;
  const zooms = [15, 16, 17];
  const urls = [];

  for (const z of zooms) {
    const xMin = lon2tile(minLon, z);
    const xMax = lon2tile(maxLon, z);
    const yMin = lat2tile(maxLat, z); // В проекции Web Mercator север имеет меньший Y
    const yMax = lat2tile(minLat, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        urls.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
        urls.push(
          `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
        );
      }
    }
  }
  return urls;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(async (cache) => {
      for (const assetUrl of CORE_ASSETS) {
        try {
          await cache.add(new Request(assetUrl, { mode: 'cors' }));
        } catch (err) {
          // Пропускаем отдельный ресурс, если сеть временно недоступна
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== APP_SHELL_CACHE && key !== MAP_TILES_CACHE) {
            return caches.delete(key);
          }
          return undefined;
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'PRECACHE_SILANDE_TILES') return;

  event.waitUntil(
    (async () => {
      const tileCache = await caches.open(MAP_TILES_CACHE);
      const urls = buildSilandeTileUrls();
      let cachedCount = 0;

      for (const url of urls) {
        try {
          const existing = await tileCache.match(url);
          if (!existing) {
            const response = await fetch(url, { mode: 'cors' });
            if (response.ok || response.type === 'opaque') {
              await tileCache.put(url, response.clone());
            }
          }
          cachedCount++;
        } catch (err) {
          // Продолжаем при одиночных сбоях сети
        }
      }

      const clients = await self.clients.matchAll();
      for (const client of clients) {
        client.postMessage({
          type: 'SILANDE_TILES_PRECACHED',
          cachedCount,
          totalCount: urls.length
        });
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Кэширование тайлов карты (OpenStreetMap и спутниковые снимки Esri) по стратегии CacheFirst
  const isMapTile =
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('arcgisonline.com');

  if (isMapTile) {
    event.respondWith(
      caches.open(MAP_TILES_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // Навигационные запросы и статика приложения
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then(async (networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.origin === self.location.origin ||
              url.hostname.includes('jsdelivr.net') ||
              url.hostname.includes('googleapis.com') ||
              url.hostname.includes('gstatic.com'))
          ) {
            const cache = await caches.open(APP_SHELL_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
