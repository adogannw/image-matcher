/**
 * Ana Uygulama
 * Uygulama başlatma ve koordinasyon
 */

class ImageMatcherApp {
    constructor() {
        this.imageMatcher = null;
        this.uiController = null;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Uygulamayı başlat
     */
    async init() {
        try {
            // DOM yüklenene kadar bekle
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Uygulama başlatma hatası:', error);
            this.showCriticalError('Uygulama başlatılamadı. Sayfayı yenileyin.');
        }
    }

    /**
     * Uygulamayı başlat
     */
    async initializeApp() {
        try {
            // Progress callback ayarla
            this.setupProgressCallback();
            
            // Accessibility Manager'ı başlat
            this.accessibilityManager = new AccessibilityManager();
            
            // UI Controller'ı başlat
            this.uiController = new UIController();
            
            // Image Matcher'ı başlat
            this.imageMatcher = new ImageMatcher();
            
            // Global erişim için window'a ekle
            window.imageMatcher = this.imageMatcher;
            window.uiController = this.uiController;
            
            // Service Worker'ı kaydet
            await this.registerServiceWorker();
            
            // PWA install prompt'u hazırla
            this.setupPWAInstall();
            
            // Ayarları kaydetme event'ini bağla
            this.setupSettingsSave();
            
            this.isInitialized = true;
            console.log('Görüntü Eşleştirici uygulaması başlatıldı');
            
        } catch (error) {
            console.error('Uygulama başlatma hatası:', error);
            this.showCriticalError('Uygulama başlatılamadı. Sayfayı yenileyin.');
        }
    }

    /**
     * Progress callback ayarla
     */
    setupProgressCallback() {
        // ImageMatcher progress callback'i UI Controller'a yönlendir
        const originalProgressCallback = ImageMatcher.prototype.setProgressCallback;
        ImageMatcher.prototype.setProgressCallback = function(callback) {
            this.onProgress = (percent, text) => {
                if (window.uiController) {
                    window.uiController.showProgress(percent, text);
                }
                if (callback) {
                    callback(percent, text);
                }
            };
        };
    }

    /**
     * Service Worker kaydet
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker kaydedildi:', registration);
                
                // Güncelleme kontrolü
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
            } catch (error) {
                console.warn('Service Worker kaydedilemedi:', error);
            }
        }
    }

    /**
     * PWA install prompt ayarla
     */
    setupPWAInstall() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Install butonu göster
            this.showInstallButton(deferredPrompt);
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA yüklendi');
            this.hideInstallButton();
        });
    }

    /**
     * Install butonu göster
     * @param {Event} deferredPrompt - Install prompt event
     */
    showInstallButton(deferredPrompt) {
        const installButton = document.createElement('button');
        installButton.textContent = '📱 Uygulamayı Yükle';
        installButton.className = 'install-button';
        installButton.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
        `;
        
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('Install seçimi:', outcome);
                deferredPrompt = null;
                installButton.remove();
            }
        });
        
        document.body.appendChild(installButton);
    }

    /**
     * Install butonunu gizle
     */
    hideInstallButton() {
        const installButton = document.querySelector('.install-button');
        if (installButton) {
            installButton.remove();
        }
    }

    /**
     * Güncelleme bildirimi göster
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 1rem;
                right: 1rem;
                background: var(--success-color);
                color: white;
                padding: 1rem;
                border-radius: 0.5rem;
                box-shadow: var(--shadow-lg);
                z-index: 1001;
                max-width: 300px;
            ">
                <h4>Güncelleme Mevcut</h4>
                <p>Yeni sürüm indirildi. Sayfayı yenileyin.</p>
                <button onclick="window.location.reload()" style="
                    background: white;
                    color: var(--success-color);
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    margin-top: 0.5rem;
                ">Yenile</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 10000);
    }

    /**
     * Ayarları kaydetme event'ini bağla
     */
    setupSettingsSave() {
        // Ayarlar değiştiğinde otomatik kaydet
        const settingsInputs = document.querySelectorAll('#settings-panel input, #settings-panel select');
        settingsInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (this.uiController) {
                    this.uiController.saveSettings();
                }
            });
        });
    }

    /**
     * Kritik hata göster
     * @param {string} message - Hata mesajı
     */
    showCriticalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-size: 1.2rem;
            text-align: center;
            padding: 2rem;
        `;
        errorDiv.innerHTML = `
            <div>
                <h2>❌ Kritik Hata</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()" style="
                    background: var(--error-color);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    cursor: pointer;
                    margin-top: 1rem;
                ">Sayfayı Yenile</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    /**
     * Uygulamayı temizle
     */
    cleanup() {
        if (this.imageMatcher) {
            this.imageMatcher.cleanup();
        }
        
        if (this.uiController) {
            this.uiController.saveSettings();
        }
    }
}

// Uygulamayı başlat
const app = new ImageMatcherApp();

// Sayfa kapatılırken temizlik yap
window.addEventListener('beforeunload', () => {
    app.cleanup();
});

// Hata yakalama
window.addEventListener('error', (event) => {
    console.error('Global hata:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Yakalanmamış Promise hatası:', event.reason);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageMatcherApp;
}
