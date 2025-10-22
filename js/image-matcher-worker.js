/**
 * Image Matcher Web Worker
 * Mobil cihazlarda ana thread'i bloklamamak için
 */

// Worker mesaj dinleyicisi
self.addEventListener('message', function(e) {
    const { id, targetImage, template, scale, threshold } = e.data;
    
    try {
        const result = performTemplateMatch(targetImage, template, scale, threshold);
        
        self.postMessage({
            id: id,
            result: result
        });
    } catch (error) {
        self.postMessage({
            id: id,
            error: error.message
        });
    }
});

/**
 * Template matching algoritması
 * @param {ImageData} image - Hedef görsel
 * @param {ImageData} template - Template
 * @param {number} scale - Ölçek
 * @param {number} threshold - Eşik değeri
 * @returns {Object} Eşleştirme sonucu
 */
function performTemplateMatch(image, template, scale, threshold) {
    const startTime = performance.now();
    
    // Template'i ölçekle
    const scaledTemplate = scaleImageData(template, scale);
    
    // Template çok küçük veya çok büyükse atla
    if (scaledTemplate.width < 10 || scaledTemplate.height < 10 ||
        scaledTemplate.width > image.width || scaledTemplate.height > image.height) {
        return null;
    }

    // Template matching
    const result = templateMatch(image, scaledTemplate);
    
    if (result.score >= threshold) {
        return {
            x: Math.round(result.x / scale),
            y: Math.round(result.y / scale),
            width: Math.round(scaledTemplate.width / scale),
            height: Math.round(scaledTemplate.height / scale),
            score: result.score,
            scale: scale,
            processingTime: performance.now() - startTime
        };
    } else {
        return null;
    }
}

/**
 * Görsel ölçekleme
 * @param {ImageData} imageData - Kaynak görsel
 * @param {number} scale - Ölçek faktörü
 * @returns {ImageData} Ölçeklenmiş görsel
 */
function scaleImageData(imageData, scale) {
    const canvas = new OffscreenCanvas(
        Math.round(imageData.width * scale),
        Math.round(imageData.height * scale)
    );
    const ctx = canvas.getContext('2d');
    
    // Görseli çiz ve ölçekle
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Template matching algoritması
 * @param {ImageData} image - Hedef görsel
 * @param {ImageData} template - Template
 * @returns {Object} Eşleştirme sonucu
 */
function templateMatch(image, template) {
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
            const score = calculateNCC(imageData, templateData, x, y, 
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
function calculateNCC(imageData, templateData, x, y, imageWidth, templateWidth, templateHeight) {
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
