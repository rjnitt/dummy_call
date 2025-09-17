// Service Worker for Escape Call Assistant PWA

const CACHE_NAME = 'escape-call-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache.map(url => {
                    return new Request(url, { cache: 'reload' });
                }));
            })
            .catch((error) => {
                console.log('Cache addAll failed:', error);
            })
    );

    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

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
        })
    );

    // Become available to all pages
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Handle API requests differently (always try network first)
    if (requestUrl.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    return response;
                })
                .catch((error) => {
                    console.log('API request failed:', error);
                    // Return a custom offline response for API calls
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: 'offline',
                            message: 'App is offline. Please try again when connected.'
                        }),
                        {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                })
        );
        return;
    }

    // For all other requests, try cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response as we need to put it in cache and return it
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, return offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for failed API calls (if browser supports it)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');

        event.waitUntil(
            // Retry failed API calls here
            retryFailedCalls()
        );
    }
});

async function retryFailedCalls() {
    // Implementation for retrying failed calls when back online
    // This would typically involve reading from IndexedDB or localStorage
    console.log('Retrying failed calls...');
}

// Push notification handling (for future expansion)
self.addEventListener('push', (event) => {
    const options = {
        body: 'Your scheduled escape call is about to be placed',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'cancel',
                title: 'Cancel Call',
                icon: '/icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Escape Call Assistant', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Notification click received.');

    event.notification.close();

    if (event.action === 'cancel') {
        // Handle cancel action
        console.log('User cancelled the call');
    } else {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for communication with main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
