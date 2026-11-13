import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const source = fs.readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8');

function createWorker({ fetchImpl = async () => new Response('network', {
  status: 200,
  headers: { 'content-type': 'application/javascript', 'cache-control': 'public, max-age=3600' }
}), initialCaches = {} } = {}) {
  const handlers = {};
  const stores = new Map(Object.entries(initialCaches).map(([name, entries]) => [name, new Map(entries)]));
  const cache = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      addAll: async (urls) => {
        for (const url of urls) entries.set(url, new Response('shell', { headers: { 'content-type': 'text/html' } }));
      },
      put: async (request, response) => entries.set(typeof request === 'string' ? request : request.url, response),
      match: async (request) => entries.get(typeof request === 'string' ? request : request.url),
    };
  };
  const context = {
    URL,
    Response,
    fetch: fetchImpl,
    self: {
      location: { origin: 'https://nikah-pakka.example' },
      clients: { claim: async () => {} },
      skipWaiting: async () => {},
      addEventListener: (name, callback) => { handlers[name] = callback; },
    },
    caches: {
      open: async (name) => cache(name),
      keys: async () => [...stores.keys()],
      delete: async (name) => stores.delete(name),
    },
    console,
  };
  vm.runInNewContext(source, context);
  return { handlers, stores };
}

async function dispatchFetch(worker, request) {
  let responsePromise;
  worker.handlers.fetch({
    request,
    respondWith: (promise) => { responsePromise = Promise.resolve(promise); },
  });
  return responsePromise;
}

test('only approved same-origin static assets are cached', async () => {
  const worker = createWorker();
  const request = new Request('https://nikah-pakka.example/assets/app.js');
  const response = await dispatchFetch(worker, request);
  assert.equal(response.status, 200);
  assert.equal(worker.stores.get('nikah-pakka-static-v2').has(request.url), true);
});

test('Firebase and cross-origin requests bypass the service worker cache', async () => {
  let fetchCount = 0;
  const worker = createWorker({ fetchImpl: async () => {
    fetchCount += 1;
    return new Response('private', { headers: { 'content-type': 'application/json' } });
  }});
  const firebaseRequest = new Request('https://firestore.googleapis.com/v1/projects/demo/databases/(default)/documents/users/u1');
  assert.equal(await dispatchFetch(worker, firebaseRequest), undefined);
  assert.equal(fetchCount, 0);
  assert.equal(worker.stores.has('nikah-pakka-static-v2'), false);
});

test('query-string, authorization and API requests are not cached', async () => {
  const worker = createWorker();
  const requests = [
    new Request('https://nikah-pakka.example/assets/app.js?token=secret'),
    new Request('https://nikah-pakka.example/assets/app.js', { headers: { authorization: 'Bearer secret' } }),
    new Request('https://nikah-pakka.example/api/private-profile'),
  ];
  for (const request of requests) {
    assert.equal(await dispatchFetch(worker, request), undefined);
  }
  assert.equal(worker.stores.has('nikah-pakka-static-v2'), false);
});

test('private and no-store static responses are not cached', async () => {
  const worker = createWorker({ fetchImpl: async () => new Response('private', {
    headers: { 'content-type': 'application/javascript', 'cache-control': 'private, no-store' }
  })});
  const request = new Request('https://nikah-pakka.example/assets/app.js');
  await dispatchFetch(worker, request);
  const staticCache = worker.stores.get('nikah-pakka-static-v2');
  assert.equal(staticCache?.has(request.url) ?? false, false);
});

test('offline navigation falls back only to the application shell', async () => {
  const worker = createWorker({ fetchImpl: async () => { throw new Error('offline'); } });
  const shellCache = new Map([['/index.html', new Response('app shell', { headers: { 'content-type': 'text/html' } })]]);
  worker.stores.set('nikah-pakka-static-v2', shellCache);
  const request = { url: 'https://nikah-pakka.example/member/private-route', method: 'GET', mode: 'navigate', headers: new Headers() };
  const response = await dispatchFetch(worker, request);
  assert.equal(await response.text(), 'app shell');
  assert.equal(shellCache.has(request.url), false);
});

test('activation deletes only this app old caches and preserves unrelated caches', async () => {
  const worker = createWorker({ initialCaches: {
    'nikah-pakka-v1': [],
    'nikah-pakka-static-v1': [],
    'nikah-pakka-static-v2': [],
    'another-app-cache': [],
  }});
  let activation;
  worker.handlers.activate({ waitUntil: (promise) => { activation = promise; } });
  await activation;
  assert.deepEqual([...worker.stores.keys()].sort(), ['another-app-cache', 'nikah-pakka-static-v2'].sort());
});
