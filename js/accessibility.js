/**
 * Erişilebilirlik Modülü
 * Klavye navigasyonu, screen reader desteği ve erişilebilirlik özellikleri
 */

class AccessibilityManager {
    constructor() {
        this.isEnabled = true;
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        this.announcements = [];
        
        this.init();
    }

    /**
     * Erişilebilirlik yöneticisini başlat
     */
    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupHighContrastMode();
        this.setupReducedMotion();
        this.setupFocusManagement();
        
        console.log('Erişilebilirlik yöneticisi başlatıldı');
    }

    /**
     * Klavye navigasyonu ayarla
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            if (!this.isEnabled) return;
            
            // Tab navigasyonu
            if (event.key === 'Tab') {
                this.handleTabNavigation(event);
            }
            
            // Escape tuşu
            if (event.key === 'Escape') {
                this.handleEscapeKey(event);
            }
            
            // Enter ve Space tuşları
            if (event.key === 'Enter' || event.key === ' ') {
                this.handleActivationKey(event);
            }
            
            // Ok tuşları (seçim modunda)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                this.handleArrowKeys(event);
            }
        });
    }

    /**
     * Tab navigasyonu işle
     * @param {KeyboardEvent} event - Klavye eventi
     */
    handleTabNavigation(event) {
        const focusableElements = this.getFocusableElements();
        
        if (focusableElements.length === 0) return;
        
        if (event.shiftKey) {
            // Shift+Tab - geriye doğru
            this.currentFocusIndex = this.currentFocusIndex > 0 
                ? this.currentFocusIndex - 1 
                : focusableElements.length - 1;
        } else {
            // Tab - ileriye doğru
            this.currentFocusIndex = this.currentFocusIndex < focusableElements.length - 1 
                ? this.currentFocusIndex + 1 
                : 0;
        }
        
        focusableElements[this.currentFocusIndex].focus();
        event.preventDefault();
    }

    /**
     * Escape tuşu işle
     * @param {KeyboardEvent} event - Klavye eventi
     */
    handleEscapeKey(event) {
        // Modal'ları kapat
        const modals = document.querySelectorAll('.modal, .settings-panel.open');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
                modal.classList.remove('open');
                this.announce('Modal kapatıldı');
            }
        });
        
        // Seçimi temizle
        if (window.uiController && window.uiController.selection) {
            window.uiController.clearSelection();
            this.announce('Seçim temizlendi');
        }
    }

    /**
     * Aktivasyon tuşları işle
     * @param {KeyboardEvent} event - Klavye eventi
     */
    handleActivationKey(event) {
        const target = event.target;
        
        // Button elementleri
        if (target.tagName === 'BUTTON' || target.role === 'button') {
            target.click();
            event.preventDefault();
        }
        
        // Checkbox elementleri
        if (target.type === 'checkbox') {
            target.checked = !target.checked;
            target.dispatchEvent(new Event('change'));
            event.preventDefault();
        }
        
        // Link elementleri
        if (target.tagName === 'A') {
            target.click();
            event.preventDefault();
        }
    }

    /**
     * Ok tuşları işle
     * @param {KeyboardEvent} event - Klavye eventi
     */
    handleArrowKeys(event) {
        // Sadece seçim modunda çalış
        if (!window.uiController || !window.uiController.keyboardMode) return;
        
        const canvas = document.getElementById('selection-canvas');
        if (!canvas || document.activeElement !== canvas) return;
        
        // Ok tuşları seçim için kullanılıyor
        event.preventDefault();
        
        // UI Controller'daki klavye seçim fonksiyonunu çağır
        if (window.uiController.handleKeyboardSelection) {
            window.uiController.handleKeyboardSelection(event);
        }
    }

    /**
     * Screen reader desteği ayarla
     */
    setupScreenReaderSupport() {
        // Live region oluştur
        this.createLiveRegion();
        
        // Görsel alternatif metinleri
        this.setupImageAltTexts();
        
        // Form etiketleri
        this.setupFormLabels();
        
        // Durum değişikliklerini duyur
        this.setupStatusAnnouncements();
    }

    /**
     * Live region oluştur
     */
    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
    }

    /**
     * Görsel alternatif metinleri ayarla
     */
    setupImageAltTexts() {
        const images = document.querySelectorAll('img, canvas[role="img"]');
        images.forEach((img, index) => {
            if (!img.getAttribute('aria-label') && !img.alt) {
                img.setAttribute('aria-label', `Görsel ${index + 1}`);
            }
        });
    }

    /**
     * Form etiketleri ayarla
     */
    setupFormLabels() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label) {
                    input.setAttribute('aria-labelledby', label.id || `label-${input.id}`);
                }
            }
        });
    }

    /**
     * Durum duyuruları ayarla
     */
    setupStatusAnnouncements() {
        // Progress değişikliklerini duyur
        const progressBar = document.getElementById('progress-fill');
        if (progressBar) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const width = progressBar.style.width;
                        if (width) {
                            const percent = parseInt(width);
                            this.announce(`İlerleme: %${percent}`);
                        }
                    }
                });
            });
            observer.observe(progressBar, { attributes: true });
        }
    }

    /**
     * Yüksek kontrast modu ayarla
     */
    setupHighContrastMode() {
        // Sistem yüksek kontrast modunu algıla
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
            this.announce('Yüksek kontrast modu aktif');
        }
        
        // Dinamik değişiklikleri dinle
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
                this.announce('Yüksek kontrast modu aktif');
            } else {
                document.body.classList.remove('high-contrast');
                this.announce('Yüksek kontrast modu deaktif');
            }
        });
    }

    /**
     * Azaltılmış hareket ayarla
     */
    setupReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            this.announce('Azaltılmış hareket modu aktif');
        }
        
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
                this.announce('Azaltılmış hareket modu aktif');
            } else {
                document.body.classList.remove('reduced-motion');
                this.announce('Azaltılmış hareket modu deaktif');
            }
        });
    }

    /**
     * Focus yönetimi ayarla
     */
    setupFocusManagement() {
        // Focus görünürlüğünü artır
        document.addEventListener('focusin', (event) => {
            event.target.classList.add('focus-visible');
        });
        
        document.addEventListener('focusout', (event) => {
            event.target.classList.remove('focus-visible');
        });
        
        // Modal açıldığında focus'u yönet
        this.setupModalFocusManagement();
    }

    /**
     * Modal focus yönetimi
     */
    setupModalFocusManagement() {
        const modals = document.querySelectorAll('.modal, .settings-panel');
        modals.forEach(modal => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (modal.classList.contains('open')) {
                            this.trapFocus(modal);
                        } else {
                            this.releaseFocus(modal);
                        }
                    }
                });
            });
            observer.observe(modal, { attributes: true });
        });
    }

    /**
     * Focus'u modal içinde hapset
     * @param {HTMLElement} modal - Modal element
     */
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            }
        });
        
        firstElement.focus();
    }

    /**
     * Focus hapsini serbest bırak
     * @param {HTMLElement} modal - Modal element
     */
    releaseFocus(modal) {
        // Focus'u modal açılmadan önceki elemente döndür
        const previousElement = modal.dataset.previousFocus;
        if (previousElement) {
            const element = document.getElementById(previousElement);
            if (element) {
                element.focus();
            }
        }
    }

    /**
     * Odaklanabilir elementleri al
     * @returns {Array} Odaklanabilir elementler
     */
    getFocusableElements() {
        return Array.from(document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(element => {
            return element.offsetParent !== null; // Görünür elementler
        });
    }

    /**
     * Duyuru yap
     * @param {string} message - Duyuru mesajı
     */
    announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Mesajı temizle
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
        
        console.log('Screen reader duyurusu:', message);
    }

    /**
     * Erişilebilirlik durumunu kontrol et
     * @returns {Object} Erişilebilirlik durumu
     */
    getAccessibilityStatus() {
        return {
            isEnabled: this.isEnabled,
            highContrast: document.body.classList.contains('high-contrast'),
            reducedMotion: document.body.classList.contains('reduced-motion'),
            focusableElements: this.getFocusableElements().length,
            hasLiveRegion: !!document.getElementById('live-region')
        };
    }

    /**
     * Erişilebilirlik raporu oluştur
     * @returns {Object} Erişilebilirlik raporu
     */
    generateAccessibilityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            status: this.getAccessibilityStatus(),
            issues: [],
            recommendations: []
        };
        
        // Eksik alt metinleri kontrol et
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt]), canvas[role="img"]:not([aria-label])');
        if (imagesWithoutAlt.length > 0) {
            report.issues.push(`${imagesWithoutAlt.length} görselde alternatif metin eksik`);
        }
        
        // Eksik form etiketleri
        const inputsWithoutLabel = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        if (inputsWithoutLabel.length > 0) {
            report.issues.push(`${inputsWithoutLabel.length} form elemanında etiket eksik`);
        }
        
        // Kontrast kontrolü
        const lowContrastElements = this.checkContrast();
        if (lowContrastElements.length > 0) {
            report.issues.push(`${lowContrastElements.length} elementte düşük kontrast`);
        }
        
        return report;
    }

    /**
     * Kontrast kontrolü
     * @returns {Array} Düşük kontrast elementleri
     */
    checkContrast() {
        const elements = document.querySelectorAll('*');
        const lowContrastElements = [];
        
        elements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            // Basit kontrast kontrolü (gerçek uygulamada daha gelişmiş algoritma kullanılabilir)
            if (color && backgroundColor && color !== backgroundColor) {
                // Kontrast oranı hesaplama burada yapılabilir
                // Şimdilik basit bir kontrol
                if (color.includes('gray') && backgroundColor.includes('gray')) {
                    lowContrastElements.push(element);
                }
            }
        });
        
        return lowContrastElements;
    }

    /**
     * Erişilebilirlik modunu aç/kapat
     * @param {boolean} enabled - Aktif mi
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (enabled) {
            document.body.classList.add('accessibility-enabled');
            this.announce('Erişilebilirlik özellikleri aktif');
        } else {
            document.body.classList.remove('accessibility-enabled');
            this.announce('Erişilebilirlik özellikleri deaktif');
        }
    }
}

// Global erişim için
window.AccessibilityManager = AccessibilityManager;

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
