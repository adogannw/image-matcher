/**
 * Test Modülü
 * Uygulama testleri ve doğrulama
 */

class TestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
        this.isRunning = false;
    }

    /**
     * Test ekle
     * @param {string} name - Test adı
     * @param {Function} testFunction - Test fonksiyonu
     */
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Tüm testleri çalıştır
     * @returns {Promise<Array>} Test sonuçları
     */
    async runAllTests() {
        if (this.isRunning) {
            throw new Error('Testler zaten çalışıyor');
        }

        this.isRunning = true;
        this.results = [];

        console.log('🧪 Testler başlatılıyor...');

        for (const test of this.tests) {
            try {
                console.log(`⏳ ${test.name} çalıştırılıyor...`);
                const startTime = performance.now();
                
                await test.testFunction();
                
                const endTime = performance.now();
                const duration = endTime - startTime;

                this.results.push({
                    name: test.name,
                    status: 'PASS',
                    duration: duration,
                    error: null
                });

                console.log(`✅ ${test.name} geçti (${duration.toFixed(2)}ms)`);

            } catch (error) {
                this.results.push({
                    name: test.name,
                    status: 'FAIL',
                    duration: 0,
                    error: error.message
                });

                console.error(`❌ ${test.name} başarısız:`, error.message);
            }
        }

        this.isRunning = false;
        this.printSummary();
        return this.results;
    }

    /**
     * Test özetini yazdır
     */
    printSummary() {
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const total = this.results.length;

        console.log('\n📊 Test Özeti:');
        console.log(`✅ Geçen: ${passed}`);
        console.log(`❌ Başarısız: ${failed}`);
        console.log(`📈 Toplam: ${total}`);
        console.log(`🎯 Başarı Oranı: ${((passed / total) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ Başarısız Testler:');
            this.results
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
        }
    }

    /**
     * Test sonuçlarını HTML olarak döndür
     * @returns {string} HTML raporu
     */
    generateHTMLReport() {
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const total = this.results.length;

        let html = `
            <div class="test-report">
                <h2>🧪 Test Raporu</h2>
                <div class="test-summary">
                    <div class="summary-item">
                        <span class="label">Toplam Test:</span>
                        <span class="value">${total}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Geçen:</span>
                        <span class="value success">${passed}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Başarısız:</span>
                        <span class="value error">${failed}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Başarı Oranı:</span>
                        <span class="value">${((passed / total) * 100).toFixed(1)}%</span>
                    </div>
                </div>
                <div class="test-details">
        `;

        this.results.forEach(result => {
            const statusClass = result.status === 'PASS' ? 'success' : 'error';
            const statusIcon = result.status === 'PASS' ? '✅' : '❌';
            
            html += `
                <div class="test-result ${statusClass}">
                    <div class="test-header">
                        <span class="test-icon">${statusIcon}</span>
                        <span class="test-name">${result.name}</span>
                        <span class="test-duration">${result.duration.toFixed(2)}ms</span>
                    </div>
                    ${result.error ? `<div class="test-error">${result.error}</div>` : ''}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }
}

/**
 * Uygulama testleri
 */
class AppTests {
    constructor() {
        this.testSuite = new TestSuite();
        this.setupTests();
    }

    /**
     * Testleri ayarla
     */
    setupTests() {
        // Temel fonksiyonellik testleri
        this.testSuite.addTest('ImageMatcher Sınıfı Yüklendi', () => {
            if (typeof ImageMatcher === 'undefined') {
                throw new Error('ImageMatcher sınıfı yüklenmedi');
            }
        });

        this.testSuite.addTest('UIController Sınıfı Yüklendi', () => {
            if (typeof UIController === 'undefined') {
                throw new Error('UIController sınıfı yüklenmedi');
            }
        });

        this.testSuite.addTest('AccessibilityManager Sınıfı Yüklendi', () => {
            if (typeof AccessibilityManager === 'undefined') {
                throw new Error('AccessibilityManager sınıfı yüklenmedi');
            }
        });

        // DOM elementleri testleri
        this.testSuite.addTest('Gerekli DOM Elementleri Mevcut', () => {
            const requiredElements = [
                'ref-file', 'target-file', 'selection-canvas', 
                'result-canvas', 'settings-panel'
            ];

            requiredElements.forEach(id => {
                const element = document.getElementById(id);
                if (!element) {
                    throw new Error(`Element bulunamadı: ${id}`);
                }
            });
        });

        // ImageMatcher testleri
        this.testSuite.addTest('ImageMatcher Örneği Oluşturulabilir', () => {
            const matcher = new ImageMatcher();
            if (!matcher) {
                throw new Error('ImageMatcher örneği oluşturulamadı');
            }
        });

        this.testSuite.addTest('ImageMatcher Varsayılan Ayarları', () => {
            const matcher = new ImageMatcher();
            
            if (!Array.isArray(matcher.defaultScales)) {
                throw new Error('defaultScales bir array değil');
            }
            
            if (matcher.defaultScales.length === 0) {
                throw new Error('defaultScales boş');
            }
            
            if (typeof matcher.defaultThreshold !== 'number') {
                throw new Error('defaultThreshold bir sayı değil');
            }
        });

        // Görsel işleme testleri
        this.testSuite.addTest('Görsel Boyut Hesaplama', () => {
            const matcher = new ImageMatcher();
            
            const result = matcher.calculateOptimalSize(1000, 800, 1200);
            
            if (typeof result.width !== 'number' || typeof result.height !== 'number') {
                throw new Error('Boyut hesaplama sonucu geçersiz');
            }
            
            if (result.width <= 0 || result.height <= 0) {
                throw new Error('Boyut değerleri pozitif olmalı');
            }
        });

        this.testSuite.addTest('Gri Ton Dönüşümü', () => {
            const matcher = new ImageMatcher();
            
            // Test ImageData oluştur
            const testData = new ImageData(10, 10);
            for (let i = 0; i < testData.data.length; i += 4) {
                testData.data[i] = 100;     // Red
                testData.data[i + 1] = 150; // Green
                testData.data[i + 2] = 200; // Blue
                testData.data[i + 3] = 255; // Alpha
            }
            
            const grayData = matcher.convertToGrayscale(testData);
            
            if (!grayData || grayData.data.length !== testData.data.length) {
                throw new Error('Gri ton dönüşümü başarısız');
            }
        });

        // UI testleri
        this.testSuite.addTest('UIController Örneği Oluşturulabilir', () => {
            const controller = new UIController();
            if (!controller) {
                throw new Error('UIController örneği oluşturulamadı');
            }
        });

        this.testSuite.addTest('Görsel Boyut Hesaplama (UI)', () => {
            const controller = new UIController();
            
            const result = controller.calculateDisplaySize(1000, 800, 400, 300);
            
            if (typeof result.width !== 'number' || typeof result.height !== 'number') {
                throw new Error('UI boyut hesaplama sonucu geçersiz');
            }
            
            if (result.width <= 0 || result.height <= 0) {
                throw new Error('UI boyut değerleri pozitif olmalı');
            }
        });

        // Erişilebilirlik testleri
        this.testSuite.addTest('AccessibilityManager Örneği Oluşturulabilir', () => {
            const a11y = new AccessibilityManager();
            if (!a11y) {
                throw new Error('AccessibilityManager örneği oluşturulamadı');
            }
        });

        this.testSuite.addTest('Odaklanabilir Elementler Bulunabilir', () => {
            const a11y = new AccessibilityManager();
            const focusableElements = a11y.getFocusableElements();
            
            if (!Array.isArray(focusableElements)) {
                throw new Error('Odaklanabilir elementler array değil');
            }
        });

        // PWA testleri
        this.testSuite.addTest('Service Worker Desteği', () => {
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Worker desteklenmiyor');
            }
        });

        this.testSuite.addTest('Manifest Desteği', () => {
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (!manifestLink) {
                throw new Error('Manifest link bulunamadı');
            }
        });

        // Performans testleri
        this.testSuite.addTest('Template Matching Performansı', async () => {
            const matcher = new ImageMatcher();
            
            // Küçük test görselleri oluştur
            const testImage = this.createTestImageData(100, 100);
            const testTemplate = this.createTestImageData(20, 20);
            
            const startTime = performance.now();
            
            try {
                const result = matcher.templateMatch(testImage, testTemplate);
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                if (duration > 1000) { // 1 saniyeden fazla
                    throw new Error(`Template matching çok yavaş: ${duration.toFixed(2)}ms`);
                }
                
                if (typeof result.score !== 'number') {
                    throw new Error('Template matching sonucu geçersiz');
                }
                
            } catch (error) {
                throw new Error(`Template matching hatası: ${error.message}`);
            }
        });

        // Bellek testleri
        this.testSuite.addTest('Bellek Kullanımı', () => {
            if ('memory' in performance) {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                
                if (usedMB > 100) { // 100MB'dan fazla
                    console.warn(`Yüksek bellek kullanımı: ${usedMB.toFixed(2)}MB`);
                }
            }
        });
    }

    /**
     * Test görseli oluştur
     * @param {number} width - Genişlik
     * @param {number} height - Yükseklik
     * @returns {ImageData} Test görseli
     */
    createTestImageData(width, height) {
        const imageData = new ImageData(width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Basit bir desen oluştur
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            
            data[i] = (x + y) % 256;     // Red
            data[i + 1] = (x * y) % 256; // Green
            data[i + 2] = (x - y + 256) % 256; // Blue
            data[i + 3] = 255;           // Alpha
        }
        
        return imageData;
    }

    /**
     * Tüm testleri çalıştır
     * @returns {Promise<Array>} Test sonuçları
     */
    async runAllTests() {
        return await this.testSuite.runAllTests();
    }

    /**
     * Test raporunu göster
     */
    showTestReport() {
        const report = this.testSuite.generateHTMLReport();
        
        // Modal oluştur
        const modal = document.createElement('div');
        modal.className = 'test-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 2rem;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        `;
        
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0;">Test Raporu</h2>
                <button onclick="this.closest('.test-modal').remove()" style="
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 0.25rem;
                    cursor: pointer;
                ">Kapat</button>
            </div>
            ${report}
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
}

// Test butonu ekle (geliştirme modunda)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        const testButton = document.createElement('button');
        testButton.textContent = '🧪 Testleri Çalıştır';
        testButton.style.cssText = `
            position: fixed;
            bottom: 1rem;
            left: 1rem;
            background: #059669;
            color: white;
            border: none;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            z-index: 1000;
            font-size: 0.875rem;
        `;
        
        testButton.addEventListener('click', async () => {
            const appTests = new AppTests();
            await appTests.runAllTests();
            appTests.showTestReport();
        });
        
        document.body.appendChild(testButton);
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestSuite, AppTests };
}
