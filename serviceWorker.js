// sw.js - Advanced Service Worker with Intelligent Caching & Lazy Loading
const CACHE_VERSION = 'v1.2.0';
const CACHE_PREFIX = 'music-player';

// Dynamic cache names based on content type
const CACHE_NAMES = {
  static: `${CACHE_PREFIX}-static-${CACHE_VERSION}`,
  dynamic: `${CACHE_PREFIX}-dynamic-${CACHE_VERSION}`,
  images: `${CACHE_PREFIX}-images-${CACHE_VERSION}`,
  audio: `${CACHE_PREFIX}-audio-${CACHE_VERSION}`,
  maps: `${CACHE_PREFIX}-maps-${CACHE_VERSION}`,
  fonts: `${CACHE_PREFIX}-fonts-${CACHE_VERSION}`,
  api: `${CACHE_PREFIX}-api-${CACHE_VERSION}`
};

// Static assets to cache immediately on install
const STATIC_ASSETS = [
//  '/',
  '../index.html',
//  '../siteScripts/global.js',
//  '/musicPlayer.css',
  '/manifest.json'
];

// Map.js specific resources (lazy-loaded)
const MAP_RESOURCES = [
  '/map.js'
];

// Cache size limits to prevent storage bloat
const CACHE_LIMITS = {
  images: 50,
  dynamic: 100,
  audio: 30,
  maps: 20,
  api: 50
};

// Cache strategies enum
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Resource type detection and strategy mapping
const RESOURCE_PATTERNS = [
  {
    pattern: /\.(js|css)$/,
    cache: CACHE_NAMES.static,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
  },
  {
    pattern: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
    cache: CACHE_NAMES.images,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  {
    pattern: /\.(mp3|wav|ogg|m4a|flac)$/,
    cache: CACHE_NAMES.audio,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  {
    pattern: /\.(woff|woff2|ttf|eot)$/,
    cache: CACHE_NAMES.fonts,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
  },
  {
    pattern: /\/map\.js$/,
    cache: CACHE_NAMES.maps,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
  },
  {
    pattern: /\/api\//,
    cache: CACHE_NAMES.api,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 5 * 60 * 1000 // 5 minutes
  }
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAMES.static);
        await cache.addAll(STATIC_ASSETS);
        console.log('[SW] Static assets cached successfully');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('[SW] Installation failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    (async () => {
      try {
        // Get all cache names
        const cacheNames = await caches.keys();
        
        // Delete old caches
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith(CACHE_PREFIX) && !Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        
        // Claim all clients
        await self.clients.claim();
        console.log('[SW] Service worker activated and claimed clients');
      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

// Fetch event - intelligent caching with strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Detect resource type and apply appropriate strategy
  const resourceConfig = detectResourceType(url.pathname);
  
  event.respondWith(
    handleRequest(request, resourceConfig)
  );
});

// Detect resource type and return configuration
function detectResourceType(pathname) {
  for (const config of RESOURCE_PATTERNS) {
    if (config.pattern.test(pathname)) {
      return config;
    }
  }
  
  // Default configuration for HTML and unknown types
  return {
    cache: CACHE_NAMES.dynamic,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST
  };
}

// Handle request with appropriate caching strategy
async function handleRequest(request, config) {
  const { cache: cacheName, strategy, maxAge } = config;
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName, maxAge);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request, cacheName);
    
    default:
      return networkFirst(request, cacheName);
  }
}

// Cache-first strategy with maxAge support
async function cacheFirst(request, cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is expired
      if (maxAge) {
        const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'));
        const now = new Date();
        
        if (now - cachedDate > maxAge) {
          console.log('[SW] Cache expired, fetching new:', request.url);
          return fetchAndCache(request, cache);
        }
      }
      
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    return fetchAndCache(request, cache);
  } catch (error) {
    console.error('[SW] Cache-first error:', error);
    return fetch(request);
  }
}

// Network-first strategy with cache fallback
async function networkFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Clone response before caching
        const responseToCache = networkResponse.clone();
        await cacheResponse(cache, request, responseToCache);
        console.log('[SW] Network response cached:', request.url);
      }
      
      return networkResponse;
    } catch (networkError) {
      console.log('[SW] Network failed, trying cache:', request.url);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        console.log('[SW] Serving stale cache:', request.url);
        return cachedResponse;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('[SW] Network-first error:', error);
    return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Fetch in background
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        cacheResponse(cache, request, responseToCache);
      }
      return networkResponse;
    }).catch(error => {
      console.error('[SW] Background fetch failed:', error);
      return null;
    });
    
    // Return cached response immediately if available
    if (cachedResponse) {
      console.log('[SW] Serving stale, revalidating:', request.url);
      return cachedResponse;
    }
    
    // Wait for network if no cache
    console.log('[SW] No cache, waiting for network:', request.url);
    return fetchPromise;
  } catch (error) {
    console.error('[SW] Stale-while-revalidate error:', error);
    return fetch(request);
  }
}

// Cache-only strategy
async function cacheOnly(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache only:', request.url);
      return cachedResponse;
    }
    
    return new Response('Not found in cache', { status: 404, statusText: 'Not Found' });
  } catch (error) {
    console.error('[SW] Cache-only error:', error);
    return new Response('Cache error', { status: 500, statusText: 'Internal Server Error' });
  }
}

// Helper: Fetch and cache response
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cacheResponse(cache, request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

// Helper: Cache response with metadata
async function cacheResponse(cache, request, response) {
  try {
    // Add cache date header
    const headers = new Headers(response.headers);
    headers.set('sw-cached-date', new Date().toISOString());
    
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
    
    await cache.put(request, modifiedResponse);
    
    // Enforce cache size limits
    const cacheName = await getCacheName(cache);
    if (cacheName) {
      await enforceCacheLimit(cacheName);
    }
  } catch (error) {
    console.error('[SW] Cache put error:', error);
  }
}

// Helper: Get cache name from cache object
async function getCacheName(cache) {
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    const openedCache = await caches.open(name);
    if (openedCache === cache) {
      return name;
    }
  }
  return null;
}

// Helper: Enforce cache size limits
async function enforceCacheLimit(cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    // Determine limit based on cache name
    let limit = CACHE_LIMITS.dynamic;
    
    if (cacheName.includes('images')) {
      limit = CACHE_LIMITS.images;
    } else if (cacheName.includes('audio')) {
      limit = CACHE_LIMITS.audio;
    } else if (cacheName.includes('maps')) {
      limit = CACHE_LIMITS.maps;
    } else if (cacheName.includes('api')) {
      limit = CACHE_LIMITS.api;
    }
    
    if (keys.length > limit) {
      console.log(`[SW] Cache limit exceeded for ${cacheName}, removing oldest entries`);
      
      // Remove oldest entries (FIFO)
      const toDelete = keys.slice(0, keys.length - limit);
      await Promise.all(toDelete.map(key => cache.delete(key)));
      
      console.log(`[SW] Removed ${toDelete.length} entries from ${cacheName}`);
    }
  } catch (error) {
    console.error('[SW] Cache limit enforcement error:', error);
  }
}

// Message event - handle commands from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CACHE_URLS':
      cacheUrls(payload.urls, payload.cacheName || CACHE_NAMES.dynamic)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch(error => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
    
    case 'CLEAR_CACHE':
      clearCache(payload.cacheName)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch(error => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
    
    case 'CLEAR_ALL_CACHES':
      clearAllCaches()
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch(error => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
    
    case 'GET_CACHE_SIZE':
      getCacheSize()
        .then(size => {
          event.ports[0].postMessage({ success: true, size });
        })
        .catch(error => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
    
    case 'LAZY_LOAD_MAP':
      lazyLoadMapResources()
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch(error => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
    
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Cache multiple URLs
async function cacheUrls(urls, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    await Promise.all(
      urls.map(url => {
        return fetch(url).then(response => {
          if (response.ok) {
            return cache.put(url, response);
          }
        }).catch(error => {
          console.error(`[SW] Failed to cache ${url}:`, error);
        });
      })
    );
    console.log(`[SW] Cached ${urls.length} URLs to ${cacheName}`);
  } catch (error) {
    console.error('[SW] Cache URLs error:', error);
    throw error;
  }
}

// Clear specific cache
async function clearCache(cacheName) {
  try {
    const deleted = await caches.delete(cacheName);
    console.log(`[SW] Cache ${cacheName} ${deleted ? 'deleted' : 'not found'}`);
  } catch (error) {
    console.error('[SW] Clear cache error:', error);
    throw error;
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Clear all caches error:', error);
    throw error;
  }
}

// Get total cache size estimate
async function getCacheSize() {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: (estimate.usage / estimate.quota * 100).toFixed(2)
      };
    }
    return null;
  } catch (error) {
    console.error('[SW] Get cache size error:', error);
    throw error;
  }
}

// Lazy load map.js resources
async function lazyLoadMapResources() {
  try {
    const cache = await caches.open(CACHE_NAMES.maps);
    await Promise.all(
      MAP_RESOURCES.map(url => {
        return fetch(url).then(response => {
          if (response.ok) {
            return cache.put(url, response);
          }
        }).catch(error => {
          console.error(`[SW] Failed to lazy load ${url}:`, error);
        });
      })
    );
    console.log('[SW] Map resources lazy loaded');
  } catch (error) {
    console.error('[SW] Lazy load map resources error:', error);
    throw error;
  }
}

// Periodic cache cleanup (runs every hour)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(performCacheCleanup());
  }
});

// Perform cache cleanup
async function performCacheCleanup() {
  try {
    console.log('[SW] Performing periodic cache cleanup...');
    
    // Clean up expired entries in all caches
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      if (cacheName.startsWith(CACHE_PREFIX)) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          
          if (response) {
            const cachedDate = new Date(response.headers.get('sw-cached-date'));
            const now = new Date();
            
            // Find maxAge for this resource type
            const resourceConfig = detectResourceType(new URL(request.url).pathname);
            const maxAge = resourceConfig.maxAge;
            
            if (maxAge && (now - cachedDate > maxAge)) {
              console.log('[SW] Removing expired cache entry:', request.url);
              await cache.delete(request);
            }
          }
        }
      }
    }
    
    console.log('[SW] Cache cleanup completed');
  } catch (error) {
    console.error('[SW] Cache cleanup error:', error);
  }
}

// Push notification support (optional)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Background sync support
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Sync data function
async function syncData() {
  try {
    console.log('[SW] Syncing data...');
    // Implement your sync logic here
    // This could sync music player state, playlists, etc.
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}

console.log('[SW] Service worker script loaded');
