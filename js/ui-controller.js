/**
 * UI Kontrolcüsü
 * Kullanıcı arayüzü etkileşimlerini yönetir
 */

class UIController {
    constructor() {
        this.currentStep = 'upload';
        this.referenceImage = null;
        this.targetImage = null;
        this.selection = null;
        this.isSelecting = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.keyboardMode = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
    }

    /**
     * DOM elementlerini başlat
     */
    initializeElements() {
        // Step containers
        this.steps = {
            upload: document.getElementById('step-upload'),
            selection: document.getElementById('step-selection'),
            'target-upload': document.getElementById('step-target-upload'),
            matching: document.getElementById('step-matching')
        };

        // Upload elements
        this.refFileInput = document.getElementById('ref-file');
        this.targetFileInput = document.getElementById('target-file');
        this.refPreview = document.getElementById('ref-preview');
        this.targetPreview = document.getElementById('target-preview');
        this.refCanvas = document.getElementById('ref-canvas');
        this.targetCanvas = document.getElementById('target-canvas');

        // Selection elements
        this.selectionCanvas = document.getElementById('selection-canvas');
        this.selectionRect = document.getElementById('selection-rect');
        this.selectionInfo = document.getElementById('selection-info');
        this.selectionStart = document.getElementById('selection-start');
        this.selectionEnd = document.getElementById('selection-end');
        this.selectionSize = document.getElementById('selection-size');
        this.selectionArea = document.getElementById('selection-area');
        this.keyboardModeCheckbox = document.getElementById('keyboard-mode');
        this.clearSelectionBtn = document.getElementById('clear-selection');
        this.autoSelectBtn = document.getElementById('auto-select');
        this.selectAllBtn = document.getElementById('select-all');
        this.proceedToTargetBtn = document.getElementById('proceed-to-target');
        this.startMatchingBtn = document.getElementById('start-matching');

        // Matching elements
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.resultContainer = document.getElementById('result-container');
        this.resultCanvas = document.getElementById('result-canvas');
        this.detailScore = document.getElementById('detail-score');
        this.detailCount = document.getElementById('detail-count');
        this.detailTime = document.getElementById('detail-time');
        this.similaritySlider = document.getElementById('similarity-slider');
        this.similarityValue = document.getElementById('similarity-value');
        this.filterMatchesBtn = document.getElementById('filter-matches');
        this.downloadBtn = document.getElementById('download-result');
        this.newMatchBtn = document.getElementById('new-match');

        // Settings elements
        this.settingsPanel = document.getElementById('settings-panel');
        this.settingsToggle = document.getElementById('settings-toggle');
        this.targetSizeSlider = document.getElementById('target-size');
        this.targetSizeValue = document.getElementById('target-size-value');
        this.scaleCountSlider = document.getElementById('scale-count');
        this.scaleCountValue = document.getElementById('scale-count-value');
        this.thresholdSlider = document.getElementById('threshold');
        this.thresholdValue = document.getElementById('threshold-value');
        this.rotationCheckbox = document.getElementById('rotation-support');
        this.apiModeCheckbox = document.getElementById('api-mode');
        this.apiSettings = document.getElementById('api-settings');
        this.apiUrlInput = document.getElementById('api-url');

        // Message elements
        this.statusMessages = document.getElementById('status-messages');
        this.errorMessages = document.getElementById('error-messages');
    }

    /**
     * Event listener'ları bağla
     */
    bindEvents() {
        // File upload events
        this.refFileInput.addEventListener('change', (e) => this.handleFileUpload(e, 'reference'));
        this.targetFileInput.addEventListener('change', (e) => this.handleFileUpload(e, 'target'));

        // Drag and drop events
        this.bindDragAndDrop();

        // Selection events
        this.selectionCanvas.addEventListener('mousedown', (e) => this.startSelection(e));
        this.selectionCanvas.addEventListener('mousemove', (e) => this.updateSelection(e));
        this.selectionCanvas.addEventListener('mouseup', (e) => this.endSelection(e));
        this.selectionCanvas.addEventListener('touchstart', (e) => this.startSelection(e));
        this.selectionCanvas.addEventListener('touchmove', (e) => this.updateSelection(e));
        this.selectionCanvas.addEventListener('touchend', (e) => this.endSelection(e));

        // Keyboard events
        this.selectionCanvas.addEventListener('keydown', (e) => this.handleKeyboardSelection(e));
        this.keyboardModeCheckbox.addEventListener('change', (e) => this.toggleKeyboardMode(e.target.checked));

        // Control buttons
        this.clearSelectionBtn.addEventListener('click', () => this.clearSelection());
        this.autoSelectBtn.addEventListener('click', () => this.autoSelect());
        this.selectAllBtn.addEventListener('click', () => this.selectAll());
        this.proceedToTargetBtn.addEventListener('click', () => this.proceedToTargetUpload());
        this.startMatchingBtn.addEventListener('click', () => this.startMatching());

        // Result buttons
        this.downloadBtn.addEventListener('click', () => this.downloadResult());
        this.newMatchBtn.addEventListener('click', () => this.startNewMatch());
        
        // Similarity controls
        this.similaritySlider.addEventListener('input', (e) => {
            this.similarityValue.textContent = `${e.target.value}%`;
        });
        this.filterMatchesBtn.addEventListener('click', () => this.filterMatches());

        // Settings events
        this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        this.targetSizeSlider.addEventListener('input', (e) => this.updateTargetSize(e.target.value));
        this.scaleCountSlider.addEventListener('input', (e) => this.updateScaleCount(e.target.value));
        this.thresholdSlider.addEventListener('input', (e) => this.updateThreshold(e.target.value));
        this.apiModeCheckbox.addEventListener('change', (e) => this.toggleApiMode(e.target.checked));

        // Prevent default drag behaviors
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    /**
     * Drag and drop desteği
     */
    bindDragAndDrop() {
        const uploadAreas = document.querySelectorAll('.upload-area');
        
        uploadAreas.forEach(area => {
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('dragover');
            });

            area.addEventListener('dragleave', () => {
                area.classList.remove('dragover');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const file = files[0];
                    if (file.type.startsWith('image/')) {
                        const isReference = area.id === 'ref-upload';
                        this.handleFileUpload({ target: { files: [file] } }, isReference ? 'reference' : 'target');
                    }
                }
            });
        });
    }

    /**
     * Dosya yükleme işlemi
     * @param {Event} event - File input event
     * @param {string} type - 'reference' veya 'target'
     */
    async handleFileUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            this.showStatus(`${type === 'reference' ? 'Referans' : 'Hedef'} görsel yükleniyor...`);
            
            const image = await this.loadImage(file);
            
            if (type === 'reference') {
                this.referenceImage = image;
                this.displayImage(image, this.refCanvas, this.refPreview);
                this.updateImageInfo(image, 'ref-info');
                this.showStep('selection');
                this.setupSelectionCanvas();
                this.showStatus('Referans görsel yüklendi. Eşleştirilecek bölgeyi seçin.');
            } else {
                this.targetImage = image;
                this.displayImage(image, this.targetCanvas, this.targetPreview);
                this.updateImageInfo(image, 'target-info');
                this.startMatchingBtn.disabled = false;
                this.showStatus('Hedef görsel yüklendi. Eşleştirmeyi başlatabilirsiniz.');
            }

            this.hideStatus();

        } catch (error) {
            this.showError(`Görsel yükleme hatası: ${error.message}`);
        }
    }

    /**
     * Görsel yükleme
     * @param {File} file - Dosya
     * @returns {Promise<HTMLImageElement>} Yüklenen görsel
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Geçersiz görsel dosyası'));
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Görseli canvas'a çiz
     * @param {HTMLImageElement} image - Görsel
     * @param {HTMLCanvasElement} canvas - Canvas
     * @param {HTMLElement} preview - Preview container
     */
    displayImage(image, canvas, preview) {
        const maxWidth = 400;
        const maxHeight = 300;
        
        let { width, height } = this.calculateDisplaySize(
            image.width, 
            image.height, 
            maxWidth, 
            maxHeight
        );

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        
        preview.style.display = 'block';
    }

    /**
     * Görsel bilgilerini güncelle
     * @param {HTMLImageElement} image - Görsel
     * @param {string} infoId - Info element ID
     */
    updateImageInfo(image, infoId) {
        const info = document.getElementById(infoId);
        info.textContent = `${image.width}×${image.height}px`;
    }

    /**
     * Görüntü boyutunu hesapla
     * @param {number} width - Orijinal genişlik
     * @param {number} height - Orijinal yükseklik
     * @param {number} maxWidth - Maksimum genişlik
     * @param {number} maxHeight - Maksimum yükseklik
     * @returns {Object} Yeni boyutlar
     */
    calculateDisplaySize(width, height, maxWidth, maxHeight) {
        const aspectRatio = width / height;
        
        // Orijinal oranları koruyarak boyutları hesapla
        let newWidth = width;
        let newHeight = height;
        
        // Genişlik sınırını kontrol et
        if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
        }
        
        // Yükseklik sınırını kontrol et
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }
        
        return {
            width: Math.round(newWidth),
            height: Math.round(newHeight)
        };
    }

    /**
     * Yükleme tamamlanma kontrolü
     */
    /**
     * Hedef görsel yükleme adımına geç
     */
    proceedToTargetUpload() {
        console.log('proceedToTargetUpload çağrıldı, selection:', this.selection);
        if (this.selection) {
            this.showStep('target-upload');
        } else {
            this.showError('Önce bir bölge seçmelisiniz.');
        }
    }

    /**
     * Seçim canvas'ını hazırla
     */
    setupSelectionCanvas() {
        const canvas = this.selectionCanvas;
        const image = this.referenceImage;
        
        if (!canvas || !image) {
            console.error('Canvas veya image bulunamadı:', { canvas, image });
            return;
        }
        
        const maxWidth = 600;
        const maxHeight = 400;
        
        const { width, height } = this.calculateDisplaySize(
            image.width, 
            image.height, 
            maxWidth, 
            maxHeight
        );

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        
        // Canvas'ı görünür yap
        canvas.style.display = 'block';
        
        console.log('Selection canvas hazırlandı:', { width, height, imageSize: { width: image.width, height: image.height } });
        
        // Canvas'a odak ver
        canvas.focus();
    }

    /**
     * Seçim başlatma
     * @param {Event} event - Mouse/touch event
     */
    startSelection(event) {
        if (this.keyboardMode) return;
        
        if (!this.referenceImage) {
            console.error('Reference image bulunamadı');
            return;
        }
        
        event.preventDefault();
        this.isSelecting = true;
        
        const rect = this.selectionCanvas.getBoundingClientRect();
        const scaleX = this.referenceImage.width / this.selectionCanvas.width;
        const scaleY = this.referenceImage.height / this.selectionCanvas.height;
        
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        this.selectionStart = {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
        
        this.selectionEnd = { ...this.selectionStart };
        this.updateSelectionDisplay();
    }

    /**
     * Seçim güncelleme
     * @param {Event} event - Mouse/touch event
     */
    updateSelection(event) {
        if (!this.isSelecting || this.keyboardMode) return;
        
        event.preventDefault();
        
        const rect = this.selectionCanvas.getBoundingClientRect();
        const scaleX = this.referenceImage.width / this.selectionCanvas.width;
        const scaleY = this.referenceImage.height / this.selectionCanvas.height;
        
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        this.selectionEnd = {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
        
        this.updateSelectionDisplay();
    }

    /**
     * Seçim bitirme
     * @param {Event} event - Mouse/touch event
     */
    endSelection(event) {
        if (!this.isSelecting || this.keyboardMode) return;
        
        event.preventDefault();
        this.isSelecting = false;
        
        this.finalizeSelection();
    }

    /**
     * Klavye ile seçim
     * @param {KeyboardEvent} event - Klavye event
     */
    handleKeyboardSelection(event) {
        if (!this.keyboardMode) return;
        
        const step = 10;
        const rect = this.selectionCanvas.getBoundingClientRect();
        const scaleX = this.referenceImage.width / this.selectionCanvas.width;
        const scaleY = this.referenceImage.height / this.selectionCanvas.height;
        
        if (!this.selectionStart) {
            this.selectionStart = {
                x: this.referenceImage.width / 2,
                y: this.referenceImage.height / 2
            };
            this.selectionEnd = { ...this.selectionStart };
        }
        
        switch (event.key) {
            case 'ArrowLeft':
                this.selectionEnd.x = Math.max(0, this.selectionEnd.x - step);
                break;
            case 'ArrowRight':
                this.selectionEnd.x = Math.min(this.referenceImage.width, this.selectionEnd.x + step);
                break;
            case 'ArrowUp':
                this.selectionEnd.y = Math.max(0, this.selectionEnd.y - step);
                break;
            case 'ArrowDown':
                this.selectionEnd.y = Math.min(this.referenceImage.height, this.selectionEnd.y + step);
                break;
            case 'Enter':
            case ' ':
                this.finalizeSelection();
                return;
            default:
                return;
        }
        
        event.preventDefault();
        this.updateSelectionDisplay();
    }

    /**
     * Seçim görüntüsünü güncelle
     */
    updateSelectionDisplay() {
        if (!this.selectionStart || !this.selectionEnd) return;
        
        const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
        const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
        const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
        const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
        
        const scaleX = this.selectionCanvas.width / this.referenceImage.width;
        const scaleY = this.selectionCanvas.height / this.referenceImage.height;
        
        this.selectionRect.style.left = `${x * scaleX}px`;
        this.selectionRect.style.top = `${y * scaleY}px`;
        this.selectionRect.style.width = `${width * scaleX}px`;
        this.selectionRect.style.height = `${height * scaleY}px`;
        
        // Detaylı bilgi güncelle
        this.selectionStart.textContent = `${Math.round(x)}, ${Math.round(y)}`;
        this.selectionEnd.textContent = `${Math.round(x + width)}, ${Math.round(y + height)}`;
        this.selectionSize.textContent = `${Math.round(width)} × ${Math.round(height)}`;
        this.selectionArea.textContent = `${Math.round(width * height)} px²`;
    }

    /**
     * Seçimi tamamla
     */
    finalizeSelection() {
        console.log('finalizeSelection çağrıldı:', { selectionStart: this.selectionStart, selectionEnd: this.selectionEnd });
        
        if (!this.selectionStart || !this.selectionEnd) {
            console.log('Selection start veya end bulunamadı');
            return;
        }
        
        const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
        const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
        const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
        const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
        
        console.log('Seçim boyutları:', { x, y, width, height });
        
        if (width < 20 || height < 20) {
            this.showError('Seçim çok küçük. En az 20×20 piksel seçin.');
            return;
        }
        
        if (width > this.referenceImage.width * 0.8 || height > this.referenceImage.height * 0.8) {
            this.showError('Seçim çok büyük. Görselin %80\'inden küçük bir alan seçin.');
            return;
        }
        
        this.selection = { x, y, width, height };
        this.proceedToTargetBtn.disabled = false;
        this.showStatus('Seçim tamamlandı. Hedef görseli yükleyebilirsiniz.');
    }

    /**
     * Seçimi temizle
     */
    clearSelection() {
        this.selection = null;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.selectionRect.style.width = '0px';
        this.selectionRect.style.height = '0px';
        this.proceedToTargetBtn.disabled = true;
        this.selectionStart.textContent = '0, 0';
        this.selectionEnd.textContent = '0, 0';
        this.selectionSize.textContent = '0 × 0';
        this.selectionArea.textContent = '0 px²';
    }

    /**
     * Otomatik seçim
     */
    autoSelect() {
        const image = this.referenceImage;
        const centerX = image.width / 2;
        const centerY = image.height / 2;
        const size = Math.min(image.width, image.height) * 0.2; // Daha küçük seçim
        
        this.selectionStart = {
            x: centerX - size / 2,
            y: centerY - size / 2
        };
        this.selectionEnd = {
            x: centerX + size / 2,
            y: centerY + size / 2
        };
        
        this.updateSelectionDisplay();
        this.finalizeSelection();
    }

    /**
     * Tüm görseli seç
     */
    selectAll() {
        const image = this.referenceImage;
        
        this.selectionStart = {
            x: 0,
            y: 0
        };
        this.selectionEnd = {
            x: image.width,
            y: image.height
        };
        
        this.updateSelectionDisplay();
        this.finalizeSelection();
    }

    /**
     * Klavye modunu değiştir
     * @param {boolean} enabled - Klavye modu aktif mi
     */
    toggleKeyboardMode(enabled) {
        this.keyboardMode = enabled;
        if (enabled) {
            this.selectionCanvas.focus();
            this.showStatus('Klavye modu aktif. Ok tuşları ile seçim yapın, Enter ile tamamlayın.');
        } else {
            this.showStatus('Fare/touch modu aktif.');
        }
    }

    /**
     * Eşleştirmeye geç
     */
    proceedToMatching() {
        if (!this.selection) {
            this.showError('Önce bir bölge seçin.');
            return;
        }
        
        this.showStep('matching');
        this.startMatching();
    }

    /**
     * Eşleştirmeyi başlat
     */
    async startMatching() {
        try {
            this.showProgress(0, 'Eşleştirme başlatılıyor...');
            
            // Butonu devre dışı bırak
            this.startMatchingBtn.disabled = true;
            this.startMatchingBtn.textContent = 'İşleniyor...';
            
            const options = this.getMatchingOptions();
            const result = await window.imageMatcher.match(
                this.referenceImage,
                this.targetImage,
                this.selection,
                options
            );
            
            if (result.success) {
                this.showStep('matching');
                this.displayResult(result);
            } else {
                this.showError(`Eşleştirme başarısız: ${result.error}`);
            }
            
        } catch (error) {
            this.showError(`Eşleştirme hatası: ${error.message}`);
        } finally {
            // Butonu tekrar aktif et
            this.startMatchingBtn.disabled = false;
            this.startMatchingBtn.textContent = 'Eşleştirmeyi Başlat';
        }
    }

    /**
     * Eşleştirme seçeneklerini al
     * @returns {Object} Seçenekler
     */
    getMatchingOptions() {
        const scaleCount = parseInt(this.scaleCountSlider.value);
        const scales = this.generateScales(scaleCount);
        
        return {
            scales: scales,
            threshold: 0.3, // Daha düşük eşik değeri (30%) - daha fazla benzer eşleşme bulmak için
            targetSize: parseInt(this.targetSizeSlider.value),
            enableRotation: this.rotationCheckbox.checked
        };
    }

    /**
     * Ölçek listesi oluştur
     * @param {number} count - Ölçek sayısı
     * @returns {Array} Ölçek listesi
     */
    generateScales(count) {
        // Mobil cihazlarda daha az ölçek kullan
        const isMobile = window.innerWidth < 768;
        const actualCount = isMobile ? Math.min(count, 3) : count;
        
        const scales = [];
        for (let i = 0; i < actualCount; i++) {
            scales.push(0.5 + (i * 0.5) / (actualCount - 1));
        }
        return scales;
    }

    /**
     * Sonucu göster
     * @param {Object} result - Eşleştirme sonucu
     */
    displayResult(result) {
        console.log('displayResult çağrıldı:', result);
        const matches = result.matches || [result.bestMatch];
        
        if (!matches || matches.length === 0) {
            console.error('Matches bulunamadı:', result);
            return;
        }
        
        // Sonuç canvas'ını hazırla
        const canvas = this.resultCanvas;
        const image = this.targetImage;
        
        if (!canvas) {
            console.error('Result canvas bulunamadı');
            return;
        }
        
        if (!image) {
            console.error('Target image bulunamadı');
            return;
        }
        
        const maxWidth = 600;
        const maxHeight = 400;
        
        const { width, height } = this.calculateDisplaySize(
            image.width, 
            image.height, 
            maxWidth, 
            maxHeight
        );

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        
        // Canvas üzerinde tüm eşleşmeleri çiz
        const scaleX = width / image.width;
        const scaleY = height / image.height;
        
        // En iyi eşleşmeyi bul
        const bestMatch = matches.reduce((best, current) => 
            current.score > best.score ? current : best
        );
        
        // Tüm eşleşmeleri çiz
        matches.forEach((match, index) => {
            const rectX = match.x * scaleX;
            const rectY = match.y * scaleY;
            const rectWidth = match.width * scaleX;
            const rectHeight = match.height * scaleY;
            
            // Dikdörtgen çiz
            ctx.strokeStyle = match === bestMatch ? '#dc2626' : '#6b7280';
            ctx.lineWidth = match === bestMatch ? 3 : 2;
            ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
            
            // Skor etiketi çiz (sağ alt köşede)
            const scorePercent = Math.round(match.score * 100);
            const scoreX = rectX + rectWidth - 5;
            const scoreY = rectY + rectHeight - 5;
            
            // Arka plan
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            const textWidth = ctx.measureText(`${scorePercent}%`).width + 8;
            ctx.fillRect(scoreX - textWidth, scoreY - 16, textWidth, 16);
            
            // Metin
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(`${scorePercent}%`, scoreX - textWidth + 4, scoreY - 4);
        });
        
        // En iyi eşleşme için detay bilgilerini güncelle
        const scorePercent = Math.round(bestMatch.score * 100);
        this.detailScore.textContent = `${scorePercent}%`;
        this.detailCount.textContent = `${matches.length}`;
        this.detailTime.textContent = `${Math.round(bestMatch.processingTime)}ms`;
        
        // Tüm eşleşmeleri sakla
        this.allMatches = matches;
        
        this.resultContainer.style.display = 'block';
        this.hideProgress();
        
        this.showStatus(`Eşleştirme tamamlandı. ${matches.length} eşleşme bulundu. En iyi benzerlik: ${scorePercent}%`);
    }

    /**
     * Benzerlik eşiğine göre eşleşmeleri filtrele
     */
    filterMatches() {
        if (!this.allMatches) {
            this.showError('Filtrelenecek eşleşme bulunamadı.');
            return;
        }
        
        const threshold = parseInt(this.similaritySlider.value) / 100;
        const filteredMatches = this.allMatches.filter(match => match.score >= threshold);
        
        console.log(`Filtreleme: ${this.allMatches.length} -> ${filteredMatches.length} eşleşme (eşik: ${threshold})`);
        
        // Canvas'ı yeniden çiz
        this.drawMatches(filteredMatches);
        
        // Detay bilgilerini güncelle
        if (filteredMatches.length > 0) {
            const bestMatch = filteredMatches.reduce((best, current) => 
                current.score > best.score ? current : best
            );
            const scorePercent = Math.round(bestMatch.score * 100);
            this.detailScore.textContent = `${scorePercent}%`;
            this.detailCount.textContent = `${filteredMatches.length}`;
        } else {
            this.detailScore.textContent = '0%';
            this.detailCount.textContent = '0';
        }
        
        this.showStatus(`${filteredMatches.length} eşleşme gösteriliyor (eşik: ${this.similaritySlider.value}%)`);
    }

    /**
     * Eşleşmeleri canvas üzerinde çiz
     */
    drawMatches(matches) {
        const canvas = this.resultCanvas;
        const image = this.targetImage;
        
        if (!canvas || !image) return;
        
        const ctx = canvas.getContext('2d');
        const maxWidth = 600;
        const maxHeight = 400;
        
        const { width, height } = this.calculateDisplaySize(
            image.width, 
            image.height, 
            maxWidth, 
            maxHeight
        );

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);
        
        const scaleX = width / image.width;
        const scaleY = height / image.height;
        
        // En iyi eşleşmeyi bul
        const bestMatch = matches.length > 0 ? matches.reduce((best, current) => 
            current.score > best.score ? current : best
        ) : null;
        
        // Tüm eşleşmeleri çiz
        matches.forEach((match) => {
            const rectX = match.x * scaleX;
            const rectY = match.y * scaleY;
            const rectWidth = match.width * scaleX;
            const rectHeight = match.height * scaleY;
            
            // Dikdörtgen çiz
            ctx.strokeStyle = match === bestMatch ? '#dc2626' : '#6b7280';
            ctx.lineWidth = match === bestMatch ? 3 : 2;
            ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
            
            // Skor etiketi çiz (sağ alt köşede)
            const scorePercent = Math.round(match.score * 100);
            const scoreX = rectX + rectWidth - 5;
            const scoreY = rectY + rectHeight - 5;
            
            // Arka plan
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            const textWidth = ctx.measureText(`${scorePercent}%`).width + 8;
            ctx.fillRect(scoreX - textWidth, scoreY - 16, textWidth, 16);
            
            // Metin
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(`${scorePercent}%`, scoreX - textWidth + 4, scoreY - 4);
        });
    }

    /**
     * Sonucu indir
     */
    downloadResult() {
        const canvas = this.resultCanvas;
        const link = document.createElement('a');
        link.download = 'eslesme-sonucu.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    /**
     * Yeni eşleştirme başlat
     */
    startNewMatch() {
        this.showStep('upload');
        this.clearSelection();
        this.resultContainer.style.display = 'none';
        this.referenceImage = null;
        this.targetImage = null;
        
        // File input'ları temizle
        this.refFileInput.value = '';
        this.targetFileInput.value = '';
        this.refPreview.style.display = 'none';
        this.targetPreview.style.display = 'none';
    }

    /**
     * Adım göster
     * @param {string} stepName - Adım adı
     */
    showStep(stepName) {
        console.log('showStep çağrıldı:', stepName, 'Mevcut adımlar:', Object.keys(this.steps));
        
        Object.values(this.steps).forEach(step => {
            if (step) {
                step.style.display = 'none';
            }
        });
        
        if (this.steps[stepName]) {
            this.steps[stepName].style.display = 'block';
            console.log('Adım gösterildi:', stepName);
        } else {
            console.error('Adım bulunamadı:', stepName);
        }
        
        this.currentStep = stepName;
    }

    /**
     * Progress göster
     * @param {number} percent - Yüzde
     * @param {string} text - Açıklama
     */
    showProgress(percent, text) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = text;
    }

    /**
     * Progress gizle
     */
    hideProgress() {
        this.progressFill.style.width = '0%';
        this.progressText.textContent = '';
    }

    /**
     * Durum mesajı göster
     * @param {string} message - Mesaj
     */
    showStatus(message) {
        this.statusMessages.textContent = message;
        this.statusMessages.classList.add('show');
        
        setTimeout(() => {
            this.statusMessages.classList.remove('show');
        }, 3000);
    }

    /**
     * Durum mesajını gizle
     */
    hideStatus() {
        this.statusMessages.classList.remove('show');
    }

    /**
     * Hata mesajı göster
     * @param {string} message - Hata mesajı
     */
    showError(message) {
        this.errorMessages.textContent = message;
        this.errorMessages.classList.add('show');
        
        setTimeout(() => {
            this.errorMessages.classList.remove('show');
        }, 5000);
    }

    /**
     * Ayarları aç/kapat
     */
    toggleSettings() {
        this.settingsPanel.classList.toggle('open');
    }

    /**
     * Hedef boyutu güncelle
     * @param {string} value - Değer
     */
    updateTargetSize(value) {
        this.targetSizeValue.textContent = `${value}px`;
    }

    /**
     * Ölçek sayısını güncelle
     * @param {string} value - Değer
     */
    updateScaleCount(value) {
        this.scaleCountValue.textContent = value;
    }

    /**
     * Eşik değerini güncelle
     * @param {string} value - Değer
     */
    updateThreshold(value) {
        this.thresholdValue.textContent = `${value}%`;
    }

    /**
     * API modunu değiştir
     * @param {boolean} enabled - API modu aktif mi
     */
    toggleApiMode(enabled) {
        this.apiSettings.style.display = enabled ? 'block' : 'none';
    }

    /**
     * Ayarları yükle
     */
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('imageMatcherSettings') || '{}');
        
        if (settings.targetSize) {
            this.targetSizeSlider.value = settings.targetSize;
            this.updateTargetSize(settings.targetSize);
        }
        
        if (settings.scaleCount) {
            this.scaleCountSlider.value = settings.scaleCount;
            this.updateScaleCount(settings.scaleCount);
        }
        
        if (settings.threshold) {
            this.thresholdSlider.value = settings.threshold;
            this.updateThreshold(settings.threshold);
        }
        
        if (settings.rotationSupport) {
            this.rotationCheckbox.checked = settings.rotationSupport;
        }
        
        if (settings.apiMode) {
            this.apiModeCheckbox.checked = settings.apiMode;
            this.toggleApiMode(settings.apiMode);
        }
        
        if (settings.apiUrl) {
            this.apiUrlInput.value = settings.apiUrl;
        }
    }

    /**
     * Ayarları kaydet
     */
    saveSettings() {
        const settings = {
            targetSize: this.targetSizeSlider.value,
            scaleCount: this.scaleCountSlider.value,
            threshold: this.thresholdSlider.value,
            rotationSupport: this.rotationCheckbox.checked,
            apiMode: this.apiModeCheckbox.checked,
            apiUrl: this.apiUrlInput.value
        };
        
        localStorage.setItem('imageMatcherSettings', JSON.stringify(settings));
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
