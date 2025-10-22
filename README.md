# 🔍 Image Matcher

Privacy-focused, client-side image matching application. All processing happens in your browser - your images are never sent to any server.

## ✨ Features

### 🎯 Core Features
- **Client-Side Processing**: All image processing happens in your browser
- **Multi-Scale Matching**: Searches at 4 different scales to find the best result
- **Mobile-Friendly**: Touch-enabled interface for mobile devices
- **PWA Support**: Installable app that works offline
- **Accessibility**: Keyboard navigation, screen reader support

### 🔒 Privacy & Security
- **Data Privacy**: Your images are never sent to any server
- **Offline Operation**: Works without internet connection
- **Local Processing**: All calculations performed on your device

### 🎨 User Experience
- **Intuitive Interface**: Simple and easy to use
- **Real-Time Preview**: Instant feedback on selections and results
- **Adjustable Parameters**: Threshold values, scale count, etc.
- **Result Download**: Download matching results as PNG files

## 🚀 Quick Start

### 1. Open the Application
- Open `index.html` in your web browser
- Or access via GitHub Pages

### 2. Upload Images
- **Reference Image**: Image containing the region you want to match
- **Target Image**: Image where you want to find the reference region

### 3. Select Region
- Draw a rectangle on the reference image using mouse or touch
- Use keyboard mode with arrow keys for precision

### 4. Start Matching
- Click "Start Matching" button
- View and download results

## 📱 PWA Installation

### Desktop
1. Click the install icon in the browser address bar
2. Select "Install"

### Mobile
1. Select "Add to Home Screen" from browser menu
2. App will be added to your home screen

## ⚙️ Settings

### Image Processing
- **Target Size**: Maximum size for image processing (800-2000px)
- **Scale Count**: Number of scales to try (2-8)
- **Threshold**: Minimum similarity percentage (30-95%)

### Advanced
- **Rotation Support**: Handles small angular differences (experimental)
- **API Mode**: Optional server API usage

## 🧪 Test Scenarios

### Basic Tests
1. **Same Image**: Different sizes of the same image
2. **Similar Content**: Images containing similar objects
3. **Different Angles**: Images taken from different perspectives

### Challenging Scenarios
1. **Low Contrast**: Poor lighting conditions
2. **Noisy Images**: Low quality or blurry images
3. **Partial Overlap**: Objects only partially visible

### Performance Tests
1. **Large Images**: High resolution photographs
2. **Multiple Scales**: Different scale combinations
3. **Speed Tests**: Processing time measurements

## 🔧 Developer Notes

### Architecture
- **Modular Structure**: Each feature in separate modules
- **Abstraction Layers**: For future extensions
- **Performance Optimization**: Web Worker support

### Technologies
- **Vanilla JavaScript**: No framework dependencies
- **Canvas API**: Image processing
- **Service Worker**: Offline operation
- **Web App Manifest**: PWA features

### Extension Points
- **Different Matching Algorithms**: SIFT, ORB, etc.
- **Machine Learning**: TensorFlow.js integration
- **3D Matching**: Using depth information

## 📊 Performance

### Targets
- **First Match**: < 1 second (on mobile devices)
- **Memory Usage**: < 100MB
- **File Size**: < 500KB (compressed)

### Optimizations
- **Image Resizing**: Automatic size optimization
- **Grayscale Conversion**: Fast processing
- **Multi-Scale**: Parallel processing

## 🐛 Known Limitations

### Algorithm Limits
- **Rotation**: Large angular differences (>15°) are difficult
- **Perspective**: 3D transformations not supported
- **Color Changes**: Extreme color differences are challenging

### Technical Limits
- **Memory**: Very large images may cause issues
- **Browser**: Limited support on older browsers
- **Mobile**: Slow on low-performance devices

## 🤝 Contributing

### Development
1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

### Testing
1. Run test scenarios
2. Test on different devices
3. Submit bug reports

### Documentation
1. README updates
2. Code comments
3. Usage examples

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🔗 Links

- **GitHub**: [Project Page](https://github.com/adogannw/image-matcher)
- **Demo**: [Live Demo](https://adogannw.github.io/image-matcher)
- **Issues**: [Bug Reports](https://github.com/adogannw/image-matcher/issues)

## 📞 Support

### FAQ
- **Image not loading**: Check supported formats (JPG, PNG, WebP)
- **Matching failed**: Lower threshold or increase scale count
- **Running slow**: Reduce image size

### Contact
- **GitHub Issues**: For technical problems
- **Email**: For general questions
- **Discussions**: For community support

---

## 🇹🇷 Türkçe

**Görüntü Eşleştirici** - Gizlilik odaklı, istemci tarafı görüntü eşleştirme uygulaması.

### Özellikler
- ✅ İstemci tarafı işleme (veriler sunucuya gönderilmez)
- ✅ Çoklu ölçek eşleştirme
- ✅ PWA desteği ve çevrimdışı çalışma
- ✅ Mobil uyumlu tasarım
- ✅ Erişilebilirlik özellikleri

### Kullanım
1. Referans görseli yükleyin
2. Eşleştirilecek bölgeyi seçin
3. Hedef görseli yükleyin
4. Eşleştirmeyi başlatın

**Canlı Demo**: https://adogannw.github.io/image-matcher

---

**Note**: This application runs entirely on the client-side. Your images are never sent to any server and your privacy is protected.