/**
 * Görüntü Eşleştirme Modülü
 * İstemci tarafında çoklu ölçek template matching
 */

class ImageMatcher {
    constructor() {
        this.worker = null;
        this.isProcessing = false;
        this.defaultScales = [0.5, 0.75, 1.0, 1.25];
        this.defaultThreshold = 0.6;
        this.maxImageSize = 2000;
        this.minImageSize = 800;
    }

    /**
     * Ana eşleştirme fonksiyonu
     * @param {ImageData} referenceImage - Referans görsel
     * @param {ImageData} targetImage - Hedef görsel
     * @param {Object} selection - Seçim koordinatları {x, y, width, height}
     * @param {Object} options - Eşleştirme seçenekleri
     * @returns {Promise<Object>} Eşleştirme sonucu
     */
    async match(referenceImage, targetImage, selection, options = {}) {
        if (this.isProcessing) {
            throw new Error('Eşleştirme işlemi zaten devam ediyor');
        }

        this.isProcessing = true;

        try {
            const {
                scales = this.defaultScales,
                threshold = this.defaultThreshold,
                targetSize = 1200,
                enableRotation = false
            } = options;

            // Görselleri işle
            const processedRef = await this.preprocessImage(referenceImage, targetSize);
            const processedTarget = await this.preprocessImage(targetImage, targetSize);

            // Seçimi normalize et
            const normalizedSelection = this.normalizeSelection(selection, referenceImage, processedRef);

            // Template çıkar
            const template = this.extractTemplate(processedRef, normalizedSelection);

            // Çoklu ölçek eşleştirme
            const results = await this.multiScaleMatch(processedTarget, template, scales, threshold);

            // En iyi sonucu seç
            const bestResult = this.selectBestResult(results);

            return {
                success: true,
                match: bestResult,
                template: template,
                processedTarget: processedTarget,
                scales: scales,
                processingTime: bestResult.processingTime
            };

        } catch (error) {
            console.error('Eşleştirme hatası:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Görsel ön işleme
     * @param {ImageData} imageData - Ham görsel verisi
     * @param {number} targetSize - Hedef boyut
     * @returns {Promise<ImageData>} İşlenmiş görsel
     */
    async preprocessImage(imageData, targetSize) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Boyut hesapla
            const { width, height } = this.calculateOptimalSize(
                imageData.width, 
                imageData.height, 
                targetSize
            );

            canvas.width = width;
            canvas.height = height;

            // Görseli çiz
            ctx.drawImage(imageData, 0, 0, width, height);

            // Gri ton dönüşümü
            const imageDataProcessed = ctx.getImageData(0, 0, width, height);
            const grayData = this.convertToGrayscale(imageDataProcessed);

            resolve(grayData);
        });
    }

    /**
     * Optimal boyut hesaplama
     * @param {number} width - Orijinal genişlik
     * @param {number} height - Orijinal yükseklik
     * @param {number} targetSize - Hedef boyut
     * @returns {Object} Yeni boyutlar
     */
    calculateOptimalSize(width, height, targetSize) {
        const aspectRatio = width / height;
        
        if (width > height) {
            return {
                width: Math.min(targetSize, width),
                height: Math.min(targetSize / aspectRatio, height)
            };
        } else {
            return {
                width: Math.min(targetSize * aspectRatio, width),
                height: Math.min(targetSize, height)
            };
        }
    }

    /**
     * Gri ton dönüşümü
     * @param {ImageData} imageData - Renkli görsel
     * @returns {ImageData} Gri ton görsel
     */
    convertToGrayscale(imageData) {
        const data = imageData.data;
        const grayData = new Uint8ClampedArray(data.length);
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(
                0.299 * data[i] +     // Red
                0.587 * data[i + 1] + // Green
                0.114 * data[i + 2]   // Blue
            );
            
            grayData[i] = gray;     // Red
            grayData[i + 1] = gray; // Green
            grayData[i + 2] = gray; // Blue
            grayData[i + 3] = data[i + 3]; // Alpha
        }
        
        return new ImageData(grayData, imageData.width, imageData.height);
    }

    /**
     * Seçimi normalize et
     * @param {Object} selection - Orijinal seçim
     * @param {ImageData} originalImage - Orijinal görsel
     * @param {ImageData} processedImage - İşlenmiş görsel
     * @returns {Object} Normalize edilmiş seçim
     */
    normalizeSelection(selection, originalImage, processedImage) {
        const scaleX = processedImage.width / originalImage.width;
        const scaleY = processedImage.height / originalImage.height;

        return {
            x: Math.round(selection.x * scaleX),
            y: Math.round(selection.y * scaleY),
            width: Math.round(selection.width * scaleX),
            height: Math.round(selection.height * scaleY)
        };
    }

    /**
     * Template çıkarma
     * @param {ImageData} image - Kaynak görsel
     * @param {Object} selection - Seçim koordinatları
     * @returns {ImageData} Template
     */
    extractTemplate(image, selection) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = selection.width;
        canvas.height = selection.height;
        
        ctx.putImageData(image, -selection.x, -selection.y);
        
        return ctx.getImageData(0, 0, selection.width, selection.height);
    }

    /**
     * Çoklu ölçek eşleştirme
     * @param {ImageData} targetImage - Hedef görsel
     * @param {ImageData} template - Template
     * @param {Array} scales - Ölçek listesi
     * @param {number} threshold - Eşik değeri
     * @returns {Promise<Array>} Sonuç listesi
     */
    async multiScaleMatch(targetImage, template, scales, threshold) {
        const results = [];
        const startTime = performance.now();

        for (let i = 0; i < scales.length; i++) {
            const scale = scales[i];
            const progress = ((i + 1) / scales.length) * 100;
            
            // Progress callback
            if (this.onProgress) {
                this.onProgress(progress, `Ölçek ${scale.toFixed(2)}x işleniyor...`);
            }

            try {
                const result = await this.matchAtScale(targetImage, template, scale, threshold);
                if (result) {
                    results.push({
                        ...result,
                        scale: scale,
                        processingTime: performance.now() - startTime
                    });
                }
            } catch (error) {
                console.warn(`Ölçek ${scale} hatası:`, error);
            }
        }

        return results;
    }

    /**
     * Belirli ölçekte eşleştirme
     * @param {ImageData} targetImage - Hedef görsel
     * @param {ImageData} template - Template
     * @param {number} scale - Ölçek
     * @param {number} threshold - Eşik değeri
     * @returns {Promise<Object|null>} Eşleştirme sonucu
     */
    async matchAtScale(targetImage, template, scale, threshold) {
        return new Promise((resolve) => {
            // Template'i ölçekle
            const scaledTemplate = this.scaleImageData(template, scale);
            
            // Template çok küçük veya çok büyükse atla
            if (scaledTemplate.width < 10 || scaledTemplate.height < 10 ||
                scaledTemplate.width > targetImage.width || scaledTemplate.height > targetImage.height) {
                resolve(null);
                return;
            }

            // Template matching
            const result = this.templateMatch(targetImage, scaledTemplate);
            
            if (result.score >= threshold) {
                resolve({
                    x: Math.round(result.x / scale),
                    y: Math.round(result.y / scale),
                    width: Math.round(scaledTemplate.width / scale),
                    height: Math.round(scaledTemplate.height / scale),
                    score: result.score,
                    scale: scale
                });
            } else {
                resolve(null);
            }
        });
    }

    /**
     * Görsel ölçekleme
     * @param {ImageData} imageData - Kaynak görsel
     * @param {number} scale - Ölçek faktörü
     * @returns {ImageData} Ölçeklenmiş görsel
     */
    scaleImageData(imageData, scale) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const newWidth = Math.round(imageData.width * scale);
        const newHeight = Math.round(imageData.height * scale);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Görseli çiz ve ölçekle
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        tempCtx.putImageData(imageData, 0, 0);
        
        ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
        
        return ctx.getImageData(0, 0, newWidth, newHeight);
    }

    /**
     * Template matching algoritması
     * @param {ImageData} image - Hedef görsel
     * @param {ImageData} template - Template
     * @returns {Object} Eşleştirme sonucu
     */
    templateMatch(image, template) {
        const imageData = image.data;
        const templateData = template.data;
        
        const imageWidth = image.width;
        const imageHeight = image.height;
        const templateWidth = template.width;
        const templateHeight = template.height;
        
        let bestScore = -1;
        let bestX = 0;
        let bestY = 0;
        
        // Normalized Cross Correlation
        for (let y = 0; y <= imageHeight - templateHeight; y++) {
            for (let x = 0; x <= imageWidth - templateWidth; x++) {
                const score = this.calculateNCC(imageData, templateData, x, y, 
                    imageWidth, templateWidth, templateHeight);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestX = x;
                    bestY = y;
                }
            }
        }
        
        return {
            x: bestX,
            y: bestY,
            score: bestScore
        };
    }

    /**
     * Normalized Cross Correlation hesaplama
     * @param {Uint8ClampedArray} imageData - Hedef görsel verisi
     * @param {Uint8ClampedArray} templateData - Template verisi
     * @param {number} x - X koordinatı
     * @param {number} y - Y koordinatı
     * @param {number} imageWidth - Hedef görsel genişliği
     * @param {number} templateWidth - Template genişliği
     * @param {number} templateHeight - Template yüksekliği
     * @returns {number} NCC skoru
     */
    calculateNCC(imageData, templateData, x, y, imageWidth, templateWidth, templateHeight) {
        let sum1 = 0, sum2 = 0, sum3 = 0;
        let count = 0;
        
        for (let ty = 0; ty < templateHeight; ty++) {
            for (let tx = 0; tx < templateWidth; tx++) {
                const imageIndex = ((y + ty) * imageWidth + (x + tx)) * 4;
                const templateIndex = (ty * templateWidth + tx) * 4;
                
                const imagePixel = imageData[imageIndex]; // Gri ton için sadece R kanalı
                const templatePixel = templateData[templateIndex];
                
                sum1 += imagePixel * templatePixel;
                sum2 += imagePixel * imagePixel;
                sum3 += templatePixel * templatePixel;
                count++;
            }
        }
        
        if (count === 0 || sum2 === 0 || sum3 === 0) {
            return 0;
        }
        
        return sum1 / Math.sqrt(sum2 * sum3);
    }

    /**
     * En iyi sonucu seç
     * @param {Array} results - Sonuç listesi
     * @returns {Object} En iyi sonuç
     */
    selectBestResult(results) {
        if (results.length === 0) {
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                score: 0,
                scale: 1.0,
                processingTime: 0
            };
        }
        
        return results.reduce((best, current) => 
            current.score > best.score ? current : best
        );
    }

    /**
     * Progress callback ayarla
     * @param {Function} callback - Progress callback fonksiyonu
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * İşlemi iptal et
     */
    cancel() {
        this.isProcessing = false;
    }

    /**
     * Bellek temizleme
     */
    cleanup() {
        this.cancel();
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

// Web Worker için template matching (büyük görseller için)
class ImageMatcherWorker {
    constructor() {
        this.worker = null;
        this.isSupported = typeof Worker !== 'undefined';
    }

    /**
     * Worker ile eşleştirme
     * @param {ImageData} targetImage - Hedef görsel
     * @param {ImageData} template - Template
     * @param {number} scale - Ölçek
     * @returns {Promise<Object>} Sonuç
     */
    async matchWithWorker(targetImage, template, scale) {
        if (!this.isSupported) {
            throw new Error('Web Worker desteklenmiyor');
        }

        return new Promise((resolve, reject) => {
            if (!this.worker) {
                this.worker = new Worker('js/image-matcher-worker.js');
            }

            const messageId = Date.now() + Math.random();
            
            const handleMessage = (event) => {
                if (event.data.id === messageId) {
                    this.worker.removeEventListener('message', handleMessage);
                    if (event.data.error) {
                        reject(new Error(event.data.error));
                    } else {
                        resolve(event.data.result);
                    }
                }
            };

            this.worker.addEventListener('message', handleMessage);
            
            this.worker.postMessage({
                id: messageId,
                targetImage: targetImage,
                template: template,
                scale: scale
            });
        });
    }

    /**
     * Worker'ı temizle
     */
    cleanup() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImageMatcher, ImageMatcherWorker };
}
