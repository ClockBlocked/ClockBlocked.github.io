'use strict';

/* ============================================
   STRICT SVG-ONLY CACHE SERVICE WORKER
   ============================================ */

const CACHE_VERSION = 'svg-cache-v1';
const SVG_CACHE = `svg-assets::${CACHE_VERSION}`;

// Only cache same-origin SVG files
function isCacheableSVG(request) {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);

  return (
    url.origin === self.location.origin &&
    url.pathname.toLowerCase().endsWith('.svg')
  );
}

/* ============================================
   INSTALL — Activate Immediately
   ============================================ */
self.addEventListener('install', event => {
  self.skipWaiting();
});

/* ============================================
   ACTIVATE — Clean Old SVG Caches
   ============================================ */
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key => key.startsWith('svg-assets::') && key !== SVG_CACHE)
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

/* ============================================
   FETCH HANDLER
   ============================================ */
self.addEventListener('fetch', event => {

  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  /* ---------------------------
     SVG — Cache First Strategy
     --------------------------- */
  if (isCacheableSVG(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SVG_CACHE);
        const cached = await cache.match(request);

        if (cached) {
          return cached;
        }

        try {
          const networkResponse = await fetch(request);

          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            cache.put(request, networkResponse.clone());
          }

          return networkResponse;

        } catch (err) {
          // No network and no cache
          return new Response('', { status: 504 });
        }
      })()
    );

    return;
  }

  /* ---------------------------
     EVERYTHING ELSE — STRICT NETWORK FIRST
     --------------------------- */
  event.respondWith(
    (async () => {
      try {
        // Always go to network.
        return await fetch(request);
      } catch (err) {
        // DO NOT FALL BACK TO CACHE.
        // We explicitly refuse cached HTML/JS/CSS.
        return new Response('', {
          status: 503,
          statusText: 'Offline - Network Required'
        });
      }
    })()
  );
});