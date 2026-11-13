// Nikah Pakka - privacy-first offline app shell service worker.
const CACHE_NAME = 'nikah-pakka-static-v2';
const OWNED_CACHE_PREFIX = 'nikah-pakka-static-';
const LEGACY_CACHE_NAME = 'nikah-pakka-v1';
const APP_SHELL = ['/','/index.html','/manifest.json','/icon.svg'];
const STATIC_EXTENSIONS = /\\.(?:js|mjs|css|svg|png|jpe?g|webp|ico|woff2?)$/i;

function isSameOrigin(request, url) {
  return url.origin === self.location.origin
    && request.method === 'GET'
    && !request.headers.has('authorization')
    && !request.headers.has('range');
}

function isStaticAssetRequest(request, url) {
  if (!isSameOrigin(request, url) || url.search || url.hash) return false;
  return APP_SHELL.includes(url.pathname)
    || (url.pathname.startsWith('/assets/') && STATIC_EXTENSIONS.test(url.pathname));
}

function isNavigationRequest(request, url) {
  return isSameOrigin(request, url)
    && request.mode === 'navigate'
    && !url.search
    && !url.hash;
}

function isSafeStaticResponse(response, url) {
  if (!response || response.status !== 200 || response.type !== 'basic' || response.redirected) {
    return false;
  }
  const cacheControl = response.headers.get('cache-control') || '';
  if (/\\b(?:private|no-store)\\b/i.test(cacheControl)) return false;

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (APP_SHELL.includes(url.pathname)) return contentType.includes('text/html')
    || contentType.includes('application/manifest+json')
    || contentType.includes('image/svg+xml');
  return /^(?:text\\/javascript|application\\/javascript|text\\/css|image\\/(?:svg\\+xml|png|jpeg|webp|x-icon)|font\\/|application\\/font)/.test(contentType);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key === LEGACY_CACHE_NAME || (key.startsWith(OWNED_CACHE_PREFIX) && key !== CACHE_NAME))
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  const staticAsset = isStaticAssetRequest(request, url);
  const navigation = isNavigationRequest(request, url);
  // All API, Firebase, authenticated, cross-origin, query-string and non-GET
  // requests bypass this worker and are never read from or written to Cache Storage.
  if (!staticAsset && !navigation) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (staticAsset && isSafeStaticResponse(response, url)) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cache = await caches.open(CACHE_NAME);
      if (staticAsset) {
        const cachedAsset = await cache.match(request);
        if (cachedAsset) return cachedAsset;
      }
      if (navigation) {
        const shell = await cache.match('/index.html') || await cache.match('/');
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
