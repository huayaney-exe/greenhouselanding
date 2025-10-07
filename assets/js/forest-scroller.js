/**
 * ForestScroller - Canvas-based Image Sequence Controller
 * Smooth scroll-driven forest journey with performance optimizations
 *
 * @version 1.0.0
 * @author Greenhouse
 */

class ForestScroller {
  constructor(options = {}) {
    // Configuration
    this.config = {
      canvasId: options.canvasId || 'forest-canvas',
      imagePath: options.imagePath || 'assets/images/forest-sequence/',
      imagePrefix: options.imagePrefix || 'frame-',
      imageFormat: options.imageFormat || 'webp',
      totalFrames: options.totalFrames || 120,
      smoothing: options.smoothing || 0.1,
      preloadCount: options.preloadCount || 5,
      mobileFrameCount: options.mobileFrameCount || 60,
      mobileBreakpoint: options.mobileBreakpoint || 768,
      onLoad: options.onLoad || null,
      onProgress: options.onProgress || null,
      onReady: options.onReady || null,
      onError: options.onError || null
    };

    // State
    this.canvas = null;
    this.ctx = null;
    this.images = [];
    this.loadedImages = new Set();
    this.currentFrame = 0;
    this.targetFrame = 0;
    this.previousFrame = 0;
    this.isLoading = true;
    this.loadedCount = 0;
    this.isMobile = false;
    this.animationFrameId = null;
    this.supportsWebP = null;

    // Smooth scrolling state
    this.velocity = 0;
    this.lastScrollY = 0;
    this.scrollVelocity = 0;

    // Performance tracking
    this.lastFrameTime = 0;
    this.fps = 60;

    // Initialize
    this.init();
  }

  /**
   * Initialize the forest scroller
   */
  async init() {
    console.log('🌲 ForestScroller: Initializing...');

    try {
      // Detect device
      this.isMobile = window.innerWidth <= this.config.mobileBreakpoint;

      // Adjust frame count for mobile
      if (this.isMobile) {
        this.config.totalFrames = this.config.mobileFrameCount;
        console.log(`📱 Mobile detected: Using ${this.config.totalFrames} frames`);
      }

      // Check WebP support
      this.supportsWebP = await this.checkWebPSupport();
      if (!this.supportsWebP) {
        console.warn('⚠️  WebP not supported, falling back to JPG');
        this.config.imageFormat = 'jpg';
      }

      // Setup canvas
      this.setupCanvas();

      // Preload images progressively
      await this.preloadImages();

      // Setup scroll listener
      this.setupScrollListener();

      // Start animation loop
      this.startAnimationLoop();

      // Handle window resize
      this.setupResizeListener();

      // Mark as ready
      this.isLoading = false;
      if (this.config.onReady) {
        this.config.onReady();
      }

      console.log('✅ ForestScroller: Ready!');
    } catch (error) {
      console.error('❌ ForestScroller initialization failed:', error);
      if (this.config.onError) {
        this.config.onError(error);
      }
    }
  }

  /**
   * Check WebP support
   */
  async checkWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
    });
  }

  /**
   * Setup canvas element
   */
  setupCanvas() {
    this.canvas = document.getElementById(this.config.canvasId);

    if (!this.canvas) {
      throw new Error(`Canvas element #${this.config.canvasId} not found`);
    }

    this.ctx = this.canvas.getContext('2d', {
      alpha: false, // No transparency for better performance
      desynchronized: true // Optimize for animations
    });

    // Set canvas size
    this.resizeCanvas();

    console.log('✅ Canvas initialized');
  }

  /**
   * Resize canvas to match display size
   */
  resizeCanvas() {
    if (!this.canvas) return;

    const container = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    // Set display size
    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight;

    // Set canvas size (accounting for device pixel ratio)
    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    // Set CSS size
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    // Scale context to account for pixel ratio
    this.ctx.scale(dpr, dpr);

    // Redraw current frame with blending
    if (this.images[Math.floor(this.currentFrame)]) {
      this.drawFrameWithBlending(this.currentFrame);
    }
  }

  /**
   * Preload images progressively
   */
  async preloadImages() {
    console.log(`🔄 Preloading ${this.config.totalFrames} frames...`);

    // Priority loading: First frame, last frame, then middle frames
    const priorityFrames = [
      0, // First frame (immediate display)
      Math.floor(this.config.totalFrames / 2), // Middle
      this.config.totalFrames - 1 // Last frame
    ];

    // Load priority frames first
    for (const frameIndex of priorityFrames) {
      await this.loadImage(frameIndex);
    }

    // Draw first frame immediately
    if (this.images[0]) {
      this.drawFrame(0);
    }

    // Load remaining frames in order
    const loadPromises = [];
    for (let i = 0; i < this.config.totalFrames; i++) {
      if (!priorityFrames.includes(i)) {
        loadPromises.push(this.loadImage(i));
      }
    }

    await Promise.all(loadPromises);

    console.log(`✅ Loaded ${this.loadedCount}/${this.config.totalFrames} frames`);
  }

  /**
   * Load a single image
   */
  async loadImage(index) {
    return new Promise((resolve, reject) => {
      if (this.loadedImages.has(index)) {
        resolve();
        return;
      }

      const img = new Image();
      const frameNumber = String(index + 1).padStart(3, '0');
      const imagePath = `${this.config.imagePath}${this.config.imagePrefix}${frameNumber}.${this.config.imageFormat}`;

      img.onload = () => {
        this.images[index] = img;
        this.loadedImages.add(index);
        this.loadedCount++;
        this.updateProgress();
        resolve();
      };

      img.onerror = () => {
        console.warn(`⚠️  Failed to load: ${imagePath}`);
        reject(new Error(`Failed to load frame ${index}`));
      };

      img.src = imagePath;
    });
  }

  /**
   * Update loading progress
   */
  updateProgress() {
    const progress = (this.loadedCount / this.config.totalFrames) * 100;

    if (this.config.onProgress) {
      this.config.onProgress(progress, this.loadedCount, this.config.totalFrames);
    }

    if (this.config.onLoad && this.loadedCount === this.config.totalFrames) {
      this.config.onLoad();
    }
  }

  /**
   * Setup scroll listener with debouncing
   */
  setupScrollListener() {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial position
    this.updateScrollPosition();
  }

  /**
   * Update scroll position and calculate target frame
   */
  updateScrollPosition() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.pageYOffset;
    const scrollProgress = scrollHeight > 0 ? Math.max(0, Math.min(1, scrolled / scrollHeight)) : 0;

    // Calculate scroll velocity for adaptive smoothing
    const deltaScroll = scrolled - this.lastScrollY;
    this.scrollVelocity = Math.abs(deltaScroll);
    this.lastScrollY = scrolled;

    // Apply easing to scroll progress for smoother feel
    const easedProgress = this.easeInOutCubic(scrollProgress);

    // Map scroll progress to frame index
    this.targetFrame = easedProgress * (this.config.totalFrames - 1);

    // Lazy load nearby frames
    this.lazyLoadNearbyFrames(Math.floor(this.targetFrame));
  }

  /**
   * Easing function for smooth transitions
   */
  easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Lerp (linear interpolation) with clamping
   */
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * Lazy load frames near current position
   */
  lazyLoadNearbyFrames(currentIndex) {
    const preloadRange = this.config.preloadCount;

    for (let i = currentIndex; i < currentIndex + preloadRange && i < this.config.totalFrames; i++) {
      if (!this.loadedImages.has(i)) {
        this.loadImage(i).catch(() => {
          // Silent fail for lazy loading
        });
      }
    }
  }

  /**
   * Setup resize listener with debouncing
   */
  setupResizeListener() {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resizeCanvas();
      }, 250);
    };

    window.addEventListener('resize', handleResize);
  }

  /**
   * Start animation loop with advanced smoothing
   */
  startAnimationLoop() {
    const animate = (timestamp) => {
      // Calculate FPS
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        this.fps = 1000 / delta;
      }
      this.lastFrameTime = timestamp;

      // Adaptive smoothing based on velocity (more subtle)
      const adaptiveSmoothness = this.scrollVelocity > 50 ? 0.12 : 0.06;

      // Smooth interpolation to target frame with subtle spring physics
      const diff = this.targetFrame - this.currentFrame;
      this.velocity += diff * adaptiveSmoothness;
      this.velocity *= 0.75; // Stronger damping for less bounce
      this.currentFrame += this.velocity;

      // Clamp current frame
      this.currentFrame = Math.max(0, Math.min(this.currentFrame, this.config.totalFrames - 1));

      // Snap to nearest frame when velocity is low (prevents fuzzy frames)
      const velocityThreshold = 0.05;
      if (Math.abs(this.velocity) < velocityThreshold) {
        this.currentFrame = Math.round(this.currentFrame);
      }

      // Draw with frame blending for ultra-smooth effect
      this.drawFrameWithBlending(this.currentFrame);

      // Continue animation
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Draw frame with blending for ultra-smooth transitions
   */
  drawFrameWithBlending(exactFrame) {
    if (!this.ctx) return;

    const frameIndex1 = Math.floor(exactFrame);
    const frameIndex2 = Math.min(Math.ceil(exactFrame), this.config.totalFrames - 1);
    const blendFactor = exactFrame - frameIndex1;

    const img1 = this.images[frameIndex1];
    const img2 = this.images[frameIndex2];

    // Only draw if first frame is fully loaded AND complete
    if (!img1 || !img1.complete || !img1.naturalWidth) return;

    const canvasWidth = this.canvas.clientWidth;
    const canvasHeight = this.canvas.clientHeight;

    // Clear canvas
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate dimensions for cover behavior
    const dimensions = this.calculateCoverDimensions(canvasWidth, canvasHeight, img1);

    // Draw first frame
    this.ctx.globalAlpha = 1;
    this.ctx.drawImage(img1, dimensions.offsetX, dimensions.offsetY, dimensions.drawWidth, dimensions.drawHeight);

    // Blend second frame ONLY if different, loaded, AND complete
    if (img2 && frameIndex1 !== frameIndex2 && blendFactor > 0.01 && img2.complete && img2.naturalWidth) {
      this.ctx.globalAlpha = blendFactor;
      this.ctx.drawImage(img2, dimensions.offsetX, dimensions.offsetY, dimensions.drawWidth, dimensions.drawHeight);
    }

    // Reset alpha
    this.ctx.globalAlpha = 1;

    // Apply subtle depth-based color grading
    this.applyDepthGrading(exactFrame);
  }

  /**
   * Apply depth-based color grading for atmospheric depth
   */
  applyDepthGrading(frame) {
    const progress = frame / (this.config.totalFrames - 1);
    const canvasWidth = this.canvas.clientWidth;
    const canvasHeight = this.canvas.clientHeight;

    // Subtle green tint that varies with depth
    const greenIntensity = 0.03 + progress * 0.02;

    this.ctx.fillStyle = `rgba(27, 94, 32, ${greenIntensity})`;
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add subtle glow in the center for depth
    const gradient = this.ctx.createRadialGradient(
      canvasWidth / 2,
      canvasHeight / 2,
      0,
      canvasWidth / 2,
      canvasHeight / 2,
      canvasHeight * 0.6
    );

    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  /**
   * Calculate dimensions for object-fit: cover behavior
   */
  calculateCoverDimensions(canvasWidth, canvasHeight, img) {
    const canvasRatio = canvasWidth / canvasHeight;
    const imgRatio = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      // Canvas is taller than image
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    return { drawWidth, drawHeight, offsetX, offsetY };
  }

  /**
   * Draw specific frame to canvas (legacy method for compatibility)
   */
  drawFrame(index) {
    this.drawFrameWithBlending(index);
  }

  /**
   * Get current scroll progress (0-1)
   */
  getProgress() {
    return this.currentFrame / (this.config.totalFrames - 1);
  }

  /**
   * Jump to specific frame
   */
  jumpToFrame(frameIndex) {
    const clampedIndex = Math.max(0, Math.min(frameIndex, this.config.totalFrames - 1));
    this.currentFrame = clampedIndex;
    this.targetFrame = clampedIndex;
    this.drawFrame(Math.floor(clampedIndex));
  }

  /**
   * Jump to scroll percentage (0-100)
   */
  jumpToProgress(percentage) {
    const frame = (percentage / 100) * (this.config.totalFrames - 1);
    this.jumpToFrame(frame);
  }

  /**
   * Pause animation
   */
  pause() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resume animation
   */
  resume() {
    if (!this.animationFrameId) {
      this.startAnimationLoop();
    }
  }

  /**
   * Destroy instance and cleanup
   */
  destroy() {
    console.log('🛑 ForestScroller: Cleaning up...');

    // Cancel animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Clear images
    this.images = [];
    this.loadedImages.clear();

    // Clear canvas
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Remove references
    this.ctx = null;
    this.canvas = null;

    console.log('✅ ForestScroller: Destroyed');
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      fps: Math.round(this.fps),
      currentFrame: Math.floor(this.currentFrame),
      totalFrames: this.config.totalFrames,
      loadedFrames: this.loadedCount,
      progress: this.getProgress(),
      isMobile: this.isMobile
    };
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForestScroller;
}
