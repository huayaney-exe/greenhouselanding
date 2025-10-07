# 🌲 Greenhouse - Forest Scroll Experience

**World-class scroll-through forest landing page** with glassmorphic design and canvas-based image sequences.

---

## 🎯 Project Overview

An immersive scroll-driven journey through a digital forest where users discover Greenhouse's portfolio companies as "clearings" with premium glassmorphic effects.

### Key Features

- ✨ **Canvas-based image sequences** - Smooth 60fps scroll-driven animations
- 💎 **Glassmorphism design** - Premium frosted-glass effects throughout
- 📱 **Mobile-optimized** - Automatic frame reduction for performance
- ♿ **Accessible** - WCAG AA compliant with reduced motion support
- 🚀 **Performance** - < 3s load time, lazy loading, WebP support

---

## 🚀 Quick Start

### Prerequisites

- **FFmpeg** (for frame extraction) OR **Python 3** with OpenCV
- Modern browser (Chrome 90+, Safari 15+, Firefox 90+)
- Local development server

### Installation

```bash
# 1. Navigate to project
cd new-build

# 2. Extract frames from video (choose one method)

# Method A: FFmpeg (fastest - 2 minutes)
brew install ffmpeg
ffmpeg -i assets/video.mp4 \
  -vf "fps=2,scale=1920:1080:flags=lanczos" \
  -q:v 2 \
  assets/images/forest-sequence/frame-%03d.jpg

# Convert to WebP
brew install webp
cd assets/images/forest-sequence
for i in frame-*.jpg; do
  cwebp -q 80 "$i" -o "${i%.jpg}.webp"
done

# Method B: Python script (included)
pip3 install opencv-python pillow
python3 ../../../extract-frames.py  # Use existing script
python3 ../../../convert-to-webp.py

# 3. Start local server
python3 -m http.server 8000

# 4. Open in browser
open http://localhost:8000
```

---

## 📁 Project Structure

```
new-build/
├── index.html                    # Main HTML (world-class structure)
├── assets/
│   ├── css/
│   │   └── forest-scroll.css     # Complete styling system
│   ├── js/
│   │   └── forest-scroller.js    # Canvas image sequence controller
│   ├── images/
│   │   └── forest-sequence/      # Frame images (120 frames)
│   │       ├── frame-001.webp
│   │       ├── frame-002.webp
│   │       └── ...
│   └── video.mp4                 # Source video
└── docs/
    └── IMPLEMENTATION.md         # Technical details
```

---

## 🎨 Design System

### Color Palette

```css
--color-forest-primary: #1B5E20;  /* Primary brand */
--color-forest-light: #4CAF50;    /* Accent */
--color-golden: #FFB300;          /* Highlights */
--color-white: #FFFFFF;
--color-text: #2C3E50;
```

### Glassmorphism Tokens

```css
--glass-bg: rgba(255, 255, 255, 0.25);
--glass-blur: 12px;
--glass-border: rgba(255, 255, 255, 0.18);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
```

### Typography

- **Primary Font**: Inter (400-900 weights)
- **Hero**: 10rem (Black 900)
- **Section Titles**: 4rem (Bold 700)
- **Body**: 1rem (Regular 400)

---

## ⚙️ Configuration

### Adjust Scroll Behavior

Edit `index.html` lines 95-110:

```javascript
const FOREST_CONFIG = {
  scrollSmoothing: 0.1,      // Higher = faster (0.01-0.3)
  parallaxIntensity: 1.5,    // Depth effect strength
  frameRate: 30,             // Target FPS
  mobileFrameCount: 60,      // Frames for mobile
  glassBlurIntensity: 12     // Glassmorphism blur (px)
};
```

### ForestScroller Options

```javascript
new ForestScroller({
  totalFrames: 120,          // Number of frames
  smoothing: 0.1,            // Interpolation speed
  imageFormat: 'webp',       // 'webp' or 'jpg'
  preloadCount: 5,           // Lazy load ahead count
  mobileBreakpoint: 768      // Mobile detection width
});
```

---

## 📊 Performance

### Targets

- ⚡ **Load Time**: < 3s on 3G
- 🎬 **Scroll FPS**: 60fps
- 📦 **Asset Size**: ~4-5MB (120 frames @ 40-50KB each)
- ♿ **Accessibility**: WCAG AA

### Optimizations Included

1. **Progressive Image Loading** - Priority frames first
2. **Lazy Loading** - Preload 5 frames ahead of scroll position
3. **WebP Detection** - Automatic fallback to JPG
4. **Canvas Optimization** - Hardware-accelerated rendering
5. **Debounced Scroll** - RequestAnimationFrame for 60fps
6. **Device Pixel Ratio** - Sharp rendering on retina displays
7. **Mobile Frame Reduction** - 60 frames instead of 120

---

## 🌐 Browser Support

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Full | Recommended |
| Safari | 15+ | ✅ Full | Backdrop-filter support |
| Safari | < 15 | ⚠️ Partial | Solid backgrounds fallback |
| Firefox | 90+ | ✅ Full | Full support |
| Edge | 90+ | ✅ Full | Chromium-based |
| Mobile Safari | iOS 15+ | ✅ Optimized | 60-frame variant |
| Mobile Chrome | Latest | ✅ Optimized | Touch-optimized |

---

## 🐛 Troubleshooting

### Issue: Frames not loading

**Symptoms**: Console error "Failed to load frame"
**Solution**:
- Verify frames exist in `assets/images/forest-sequence/`
- Check naming: `frame-001.webp` through `frame-120.webp`
- Ensure WebP support or fallback to JPG

### Issue: Stuttering scroll

**Symptoms**: Choppy animation, low FPS
**Solution**:
- Reduce `totalFrames` to 60 in config
- Increase `smoothing` to 0.2 for faster interpolation
- Check console for FPS metrics: `forestScroller.getMetrics()`

### Issue: Glassmorphism not working

**Symptoms**: Solid backgrounds instead of blur
**Solution**:
- Safari < 15 doesn't support `backdrop-filter`
- Fallback CSS automatically applies
- Update Safari to version 15+ for full effect

### Issue: Images loading slowly

**Symptoms**: Blank canvas, slow reveal
**Solution**:
- Optimize images further (reduce quality to 70-75%)
- Reduce total frame count
- Check network tab for slow connections

---

## 📱 Mobile Considerations

### Automatic Optimizations

- **Frame Reduction**: 60 frames (50% reduction)
- **Blur Intensity**: 8px instead of 12px
- **Touch Events**: Passive listeners for smooth scrolling
- **Viewport Meta**: Proper scaling and zoom prevention

### Testing

```bash
# Test on actual devices
# Or use browser DevTools device emulation

# Chrome DevTools
1. Open DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M)
3. Select device (iPhone 13, Pixel 5, etc.)
4. Test scroll performance
```

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] All 120 frames extracted and optimized
- [ ] Test on Chrome, Safari, Firefox
- [ ] Test on mobile devices
- [ ] Verify glassmorphism on supported browsers
- [ ] Check Lighthouse scores (Performance > 90)
- [ ] Test reduced motion preferences
- [ ] Validate all links work
- [ ] Optimize images if size > 5MB

### Deploy to Production

```bash
# 1. Build optimization (optional)
# Minify CSS and JS if needed

# 2. Upload to hosting
# - Vercel, Netlify, AWS S3, etc.

# 3. Configure CDN
# - CloudFlare, Fastly for global delivery

# 4. Test production URL
# - Run Lighthouse audit
# - Test from different locations
```

### Recommended Hosting

- **Vercel** - Zero-config, automatic HTTPS
- **Netlify** - Built-in CDN, instant deploys
- **AWS S3 + CloudFront** - Enterprise scalability

---

## 📈 Analytics & Monitoring

### Recommended Tools

- **Google Analytics 4** - User journey tracking
- **Hotjar** - Scroll depth heatmaps
- **Lighthouse CI** - Performance monitoring
- **Sentry** - Error tracking

### Key Metrics to Track

- **Scroll Depth**: % users reaching portfolio section
- **Time on Page**: Average engagement time
- **Frame Load Time**: Performance monitoring
- **Device Breakdown**: Mobile vs Desktop usage
- **Browser Distribution**: Safari vs Chrome performance

---

## 🔧 Advanced Customization

### Add Parallax Layers

```javascript
// In forest-scroller.js, add multiple canvases
<canvas id="forest-bg" class="forest-layer"></canvas>
<canvas id="forest-mg" class="forest-layer"></canvas>
<canvas id="forest-fg" class="forest-layer"></canvas>

// Control each layer with different scroll speeds
```

### Add Sound Design

```javascript
// Add ambient forest sounds
const forestAmbience = new Audio('assets/audio/forest.mp3');
forestAmbience.loop = true;
forestAmbience.volume = 0.3;

// Fade in/out based on scroll
window.addEventListener('scroll', () => {
  const progress = forestScroller.getProgress();
  forestAmbience.volume = progress * 0.3;
});
```

### Seasonal Variations

```javascript
// Load different frame sequences based on season
const season = new Date().getMonth(); // 0-11
const seasonPath = season < 3 ? 'winter/' :
                   season < 6 ? 'spring/' :
                   season < 9 ? 'summer/' : 'autumn/';

imagePath: `assets/images/${seasonPath}forest-sequence/`
```

---

## 📚 Resources

### Documentation

- [GSAP ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Glassmorphism Guide](https://css-tricks.com/glassmorphism/)

### Tools

- **FFmpeg**: https://ffmpeg.org/
- **WebP Converter**: https://developers.google.com/speed/webp
- **Image Optimizer**: https://squoosh.app/

---

## 🤝 Support

Need help? Contact:
- **Email**: hello@greenhouseventures.com
- **GitHub**: [Report Issues](https://github.com/greenhouse-ventures)

---

## 📄 License

© 2025 Greenhouse Ventures. All rights reserved.

---

**Built with 🌲 by Greenhouse**
