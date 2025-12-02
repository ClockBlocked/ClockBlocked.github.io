// Service Worker for Offline Support
const CACHE_NAME = 'gist-clone-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/storage.js',
    '/editor.js',
    '/components.js',
    '/router.js',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/codemirror.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/theme/dracula.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/codemirror.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Strategy: Cache First, Fallback to Network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/');
                        }
                    });
            })
    );
});

// Background Sync for offline data
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-snippets') {
        event.waitUntil(syncSnippets());
    }
});

async function syncSnippets() {
    console.log('Syncing snippets in background...');
    
    // Get pending snippets from IndexedDB
    const db = await openDatabase();
    const pendingSnippets = await getPendingSnippets(db);
    
    // Try to sync each pending snippet
    for (const snippet of pendingSnippets) {
        try {
            // Here you would typically send to a server
            // For now, we'll just mark as synced
            await markSnippetAsSynced(db, snippet.id);
            console.log(`Synced snippet: ${snippet.title}`);
        } catch (error) {
            console.error('Failed to sync snippet:', error);
        }
    }
}

// Push Notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icon.png',
        badge: '/badge.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url
        },
        actions: [
            {
                action: 'view',
                title: 'View'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Helper functions for IndexedDB
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('gist-clone-db', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function getPendingSnippets(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['snippets'], 'readonly');
        const store = transaction.objectStore('snippets');
        const index = store.index('synced');
        
        const request = index.getAll(IDBKeyRange.only(false));
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function markSnippetAsSynced(db, snippetId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['snippets'], 'readwrite');
        const store = transaction.objectStore('snippets');
        
        const request = store.get(snippetId);
        
        request.onsuccess = () => {
            const snippet = request.result;
            snippet.synced = true;
            snippet.syncedAt = new Date().toISOString();
            
            const updateRequest = store.put(snippet);
            
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Periodic Sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'update-content') {
            event.waitUntil(updateContent());
        }
    });
}

async function updateContent() {
    console.log('Periodic sync: updating content');
    // Update cached assets
    const cache = await caches.open(CACHE_NAME);
    const requests = ASSETS_TO_CACHE.map(url => new Request(url));
    
    const responses = await Promise.all(
        requests.map(request => fetch(request).catch(() => null))
    );
    
    responses.forEach((response, index) => {
        if (response && response.ok) {
            cache.put(requests[index], response);
        }
    });
}