/**
 * Service Worker
 * Çevrimdışı çalışma ve önbellekleme
 */

const CACHE_NAME = 'image-matcher-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Önbelleğe alınacak statik dosyalar
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/ui-controller.js',
    '/js/image-matcher.js',
    '/manifest.json',
    // Test görselleri
    '/test-images/sample1.jpg',
    '/test-images/sample2.jpg',
    '/test-images/sample3.jpg'
];

// Önbelleğe alınmayacak dosyalar
const EXCLUDE_FROM_CACHE = [
    '/api/',
    '/sw.js'
];

/**
 * Service Worker yükleme
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker yükleniyor...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Statik dosyalar önbelleğe alınıyor...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker yüklendi');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker yükleme hatası:', error);
            })
    );
});

/**
 * Service Worker aktivasyon
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker aktifleştiriliyor...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Eski cache siliniyor:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker aktifleştirildi');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch olayları
 */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Sadece GET isteklerini işle
    if (request.method !== 'GET') {
        return;
    }
    
    // Önbelleğe alınmayacak dosyalar
    if (EXCLUDE_FROM_CACHE.some(pattern => url.pathname.startsWith(pattern))) {
        return;
    }
    
    // Görsel dosyaları için özel strateji
    if (isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
        return;
    }
    
    // HTML sayfaları için strateji
    if (isHTMLRequest(request)) {
        event.respondWith(handleHTMLRequest(request));
        return;
    }
    
    // Diğer statik dosyalar için strateji
    event.respondWith(handleStaticRequest(request));
});

/**
 * Görsel isteklerini işle
 * @param {Request} request - İstek
 * @returns {Promise<Response>} Yanıt
 */
async function handleImageRequest(request) {
    try {
        // Önce cache'den kontrol et
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Ağdan yükle
        const networkResponse = await fetch(request);
        
        // Başarılı ise cache'e ekle
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.warn('Görsel yükleme hatası:', error);
        
        // Fallback görsel döndür
        return new Response(
            createFallbackImage(),
            {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
}

/**
 * HTML isteklerini işle
 * @param {Request} request - İstek
 * @returns {Promise<Response>} Yanıt
 */
async function handleHTMLRequest(request) {
    try {
        // Önce ağdan yükle
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.warn('HTML yükleme hatası:', error);
        
        // Cache'den döndür
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback HTML döndür
        return new Response(createFallbackHTML(), {
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        });
    }
}

/**
 * Statik dosya isteklerini işle
 * @param {Request} request - İstek
 * @returns {Promise<Response>} Yanıt
 */
async function handleStaticRequest(request) {
    try {
        // Önce cache'den kontrol et
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Ağdan yükle
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.warn('Statik dosya yükleme hatası:', error);
        
        // 404 döndür
        return new Response('Dosya bulunamadı', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

/**
 * Görsel isteği mi kontrol et
 * @param {Request} request - İstek
 * @returns {boolean} Görsel isteği mi
 */
function isImageRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();
    
    return pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/);
}

/**
 * HTML isteği mi kontrol et
 * @param {Request} request - İstek
 * @returns {boolean} HTML isteği mi
 */
function isHTMLRequest(request) {
    const accept = request.headers.get('Accept') || '';
    return accept.includes('text/html');
}

/**
 * Fallback görsel oluştur
 * @returns {string} SVG görsel
 */
function createFallbackImage() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
            <rect width="400" height="300" fill="#f8fafc"/>
            <rect x="50" y="50" width="300" height="200" fill="#e2e8f0" rx="8"/>
            <text x="200" y="150" font-size="24" text-anchor="middle" fill="#64748b">
                Görsel yüklenemedi
            </text>
            <text x="200" y="180" font-size="16" text-anchor="middle" fill="#94a3b8">
                Çevrimdışı mod
            </text>
        </svg>
    `;
}

/**
 * Fallback HTML oluştur
 * @returns {string} HTML içerik
 */
function createFallbackHTML() {
    return `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Çevrimdışı - Görüntü Eşleştirici</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: #f8fafc;
                    color: #1e293b;
                }
                .container {
                    text-align: center;
                    padding: 2rem;
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                    max-width: 400px;
                }
                h1 { color: #2563eb; margin-bottom: 1rem; }
                p { color: #64748b; margin-bottom: 1.5rem; }
                button {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                }
                button:hover { background: #1d4ed8; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔍 Görüntü Eşleştirici</h1>
                <p>Şu anda çevrimdışısınız. İnternet bağlantınızı kontrol edin ve tekrar deneyin.</p>
                <button onclick="window.location.reload()">Yeniden Dene</button>
            </div>
        </body>
        </html>
    `;
}

/**
 * Background sync (gelecekte kullanım için)
 */
self.addEventListener('sync', (event) => {
    console.log('Background sync:', event.tag);
    
    if (event.tag === 'image-processing') {
        event.waitUntil(handleBackgroundSync());
    }
});

/**
 * Background sync işlemi
 */
async function handleBackgroundSync() {
    console.log('Background sync işlemi başlatılıyor...');
    // Gelecekte offline işlemler için kullanılabilir
}

/**
 * Push notification (gelecekte kullanım için)
 */
self.addEventListener('push', (event) => {
    console.log('Push notification alındı:', event);
    
    const options = {
        body: 'Görüntü Eşleştirici güncellemesi mevcut',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'image-matcher-update',
        actions: [
            {
                action: 'update',
                title: 'Güncelle'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Görüntü Eşleştirici', options)
    );
});

/**
 * Notification click
 */
self.addEventListener('notificationclick', (event) => {
    console.log('Notification tıklandı:', event);
    
    event.notification.close();
    
    if (event.action === 'update') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Message handling
 */
self.addEventListener('message', (event) => {
    console.log('Service Worker mesajı alındı:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
});

console.log('Service Worker yüklendi:', CACHE_NAME);
