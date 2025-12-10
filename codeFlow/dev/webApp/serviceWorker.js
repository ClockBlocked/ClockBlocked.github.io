const CACHE_NAME = 'GHSystem';
const OFFLINE_URL = '/unPlugged.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/primary.js',
  '/styles.css',
  '/fonts.css',
  
  // Essential icons only - pick the most important ones
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/favicon.ico',
  
  // Critical Windows icons
  '/icons/windows11/SmallTile.scale-100.png',
  '/icons/windows11/Square150x150Logo.scale-100.png',
  '/icons/windows11/Square44x44Logo.scale-100.png',
  
  // Critical Android icons
  '/icons/android/android-launchericon-192-192.png',
  '/icons/android/android-launchericon-512-512.png',
  
  // Critical iOS icons
  '/icons/ios/180.png',
  '/icons/ios/152.png',
  '/icons/ios/120.png',
  
  // Libraries
  'https://cdn.tailwindcss.com',
  'https://preline.co/assets/css/main.min.css',
  'https://preline.co/assets/js/hs-ui.bundle.js',
  'https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/material-darker.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/javascript/javascript.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/css/css.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/htmlmixed/htmlmixed.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/markdown/markdown.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/python/python.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/php/php.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/sql/sql.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/yaml/yaml.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/matchbrackets.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/selection/active-line.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js',
  'https://unpkg.com/@floating-ui/dom@1.5.4/dist/floating-ui.dom.umd.min.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  
  // Fallback page
  OFFLINE_URL
];

// Install Banner
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Cache failed:', error);
        // Don't fail installation if some assets can't be cached
        return self.skipWaiting();
      })
  );
});

// Clean-ups
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Cache-first Fetch
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  // Cache-first for icons and static assets
  if (url.pathname.includes('/icons/') || 
      url.pathname.includes('/screenshots/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.ttf')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              // Don't cache external resources unless they're from our CDN
              if (!url.hostname.includes('localhost') && 
                  !url.hostname.includes('127.0.0.1') &&
                  !url.hostname.includes('cdn.tailwindcss.com') &&
                  !url.hostname.includes('preline.co') &&
                  !url.hostname.includes('cdnjs.cloudflare.com') &&
                  !url.hostname.includes('fonts.googleapis.com') &&
                  !url.hostname.includes('unpkg.com') &&
                  !url.hostname.includes('cdn.jsdelivr.net')) {
                return response;
              }
              
              // Cache the response
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            })
            .catch(() => {
              // For icons, return a placeholder if not cached
              if (url.pathname.includes('/icons/')) {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#22272e"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#8b949e" font-family="sans-serif">GC</text></svg>',
                  {
                    headers: { 'Content-Type': 'image/svg+xml' }
                  }
                );
              }
              return new Response('Not found', { status: 404 });
            });
        })
    );
    
    return;
  }
  
  // Network-first for HTML and JavaScript
  if (url.pathname.endsWith('.html') || 
      url.pathname.endsWith('.js') ||
      url.pathname === '/' ||
      url.pathname.includes('/?') ||
      url.pathname.includes('.php')) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If it's a page request and no cache, show offline page
              if (event.request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
              }
              
              return new Response('Network error', { 
                status: 408,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
    );
    
    return;
  }
  
  // Default: try cache, then network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            return new Response('Offline', { 
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});


////////////////////////////////////////////////////////////
//////////////////////////////  S Y N C I N G  /// 1 ///////
// Background
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-repository-changes') {
    event.waitUntil(syncRepositoryChanges());
  }
});

// Periodic
self.addEventListener('periodicsync', event => {
  console.log('[Service Worker] Periodic sync:', event.tag);
  
  if (event.tag === 'update-assets') {
    event.waitUntil(updateCachedAssets());
  }
});



////////////////////////////////////////////////////////////
//////////////////////////  N O T I F I C A T I O N S  /////
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received:', event);
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'GitDev', body: 'New notification' };
  }
  
  const title = data.title || 'GitDev';
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/android/icon-192x192.png',
    badge: '/icons/android/android-launchericon-96-96.png',
    tag: data.tag || 'github-clone-notification',
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'open' || event.action === '') {
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(clientList => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data || '/');
        }
      })
    );
  }
});
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    event.ports[0].postMessage({
      type: 'CACHE_INFO',
      cacheName: CACHE_NAME,
      assets: PRECACHE_ASSETS
    });
  }
});




////////////////////////////////////////////////////////////
////////////////////////////////  S Y N C I N G  /// 2 /////
function openRepositoryDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('github-clone-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create object store for pending changes
      if (!db.objectStoreNames.contains('pending-changes')) {
        const store = db.createObjectStore('pending-changes', {
          keyPath: 'id',
          autoIncrement: true
        });
        
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('repository', 'repository');
      }
    };
  });
}

async function syncRepositoryChanges() {
  try {
    // Get pending changes from IndexedDB
    const db = await openRepositoryDB();
    const changes = await getPendingChanges(db);
    
    if (changes.length === 0) {
      console.log('[Service Worker] No pending changes to sync');
      return;
    }
    
    // Send changes to server (if you had a backend)
    // For now, just mark them as synced
    await markChangesAsSynced(db, changes);
    
    console.log(`[Service Worker] Synced ${changes.length} changes`);
    
    // Show notification
    self.registration.showNotification('Changes Synced', {
      body: `Successfully synced ${changes.length} changes`,
      icon: '/icons/icon-192x192.png',
      tag: 'sync-complete',
      data: { count: changes.length }
    });
    
    // Notify all clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        count: changes.length
      });
    });
    
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}
async function updateCachedAssets() {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    for (const asset of PRECACHE_ASSETS) {
      try {
        // Skip external URLs if they're not from trusted sources
        if (asset.startsWith('http') && 
            !asset.includes('cdn.tailwindcss.com') &&
            !asset.includes('preline.co') &&
            !asset.includes('cdnjs.cloudflare.com') &&
            !asset.includes('fonts.googleapis.com') &&
            !asset.includes('unpkg.com') &&
            !asset.includes('cdn.jsdelivr.net')) {
          continue;
        }
        
        const response = await fetch(asset);
        if (response.ok) {
          await cache.put(asset, response);
          console.log(`[Service Worker] Updated: ${asset}`);
        }
      } catch (error) {
        console.log(`[Service Worker] Failed to update: ${asset}`, error);
      }
    }
    
    // Notify clients about update
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_UPDATED',
        message: 'Assets have been updated'
      });
    });
    
  } catch (error) {
    console.error('[Service Worker] Asset update failed:', error);
  }
}

// Update Sync Status
async function getPendingChanges(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-changes', 'readonly');
    const store = transaction.objectStore('pending-changes');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
async function markChangesAsSynced(db, changes) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-changes', 'readwrite');
    const store = transaction.objectStore('pending-changes');
    
    changes.forEach(change => {
      store.delete(change.id);
    });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}