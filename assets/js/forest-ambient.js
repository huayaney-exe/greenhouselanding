/**
 * ForestAmbient - Atmospheric Effects System
 * Particles, fog, light rays, and ambient enhancements
 *
 * @version 1.0.0
 * @author Greenhouse
 */

class ForestAmbient {
  constructor(options = {}) {
    this.config = {
      particleCount: options.particleCount || 40,
      sparkleCount: options.sparkleCount || 30,
      particleSpeed: options.particleSpeed || 0.3,
      fogIntensity: options.fogIntensity || 0.15,
      vignetteIntensity: options.vignetteIntensity || 0.3,
      lightRays: options.lightRays !== false,
      soundEnabled: options.soundEnabled || false,
      colorTint: options.colorTint || 'rgba(27, 94, 32, 0.08)'
    };

    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.sparkles = [];
    this.lightRayOpacity = 0;
    this.animationFrameId = null;
    this.scrollProgress = 0;
    this.scrollVelocity = 0;
    this.lastScrollY = 0;
    this.velocityMultiplier = 1;

    this.init();
  }

  /**
   * Initialize ambient system
   */
  init() {
    this.createCanvas();
    this.createParticles();
    this.createSparkles();
    this.startAnimation();
    this.trackScrollVelocity();

    if (this.config.soundEnabled) {
      this.initAmbientSound();
    }

    console.log('🌿 ForestAmbient: Initialized');
  }

  /**
   * Create overlay canvas for effects
   */
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'forest-ambient-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
      opacity: 0.9;
    `;

    this.ctx = this.canvas.getContext('2d', { alpha: true });

    // Insert after forest canvas
    const forestCanvas = document.getElementById('forest-canvas');
    if (forestCanvas && forestCanvas.parentElement) {
      forestCanvas.parentElement.appendChild(this.canvas);
    }

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * Resize canvas
   */
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Create floating particles (leaves, light specks)
   */
  createParticles() {
    this.particles = [];

    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 5 + 2,
        speedX: (Math.random() - 0.5) * this.config.particleSpeed,
        speedY: Math.random() * this.config.particleSpeed * 0.5 + 0.2,
        opacity: Math.random() * 0.6 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        depth: Math.random(), // 0 = far, 1 = near
        type: Math.random() > 0.7 ? 'leaf' : 'speck'
      });
    }
  }

  /**
   * Create golden sparkle particles
   */
  createSparkles() {
    this.sparkles = [];

    for (let i = 0; i < this.config.sparkleCount; i++) {
      this.sparkles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        baseSpeedX: (Math.random() - 0.5) * 0.4,
        baseSpeedY: Math.random() * 0.3 + 0.1,
        speedX: 0,
        speedY: 0,
        opacity: Math.random() * 0.8 + 0.4,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        depth: Math.random() * 0.5 + 0.5, // Sparkles are closer
        hue: Math.random() * 20 + 35, // Golden hues (35-55)
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.01
      });
    }
  }

  /**
   * Track scroll velocity for acceleration
   */
  trackScrollVelocity() {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.pageYOffset;
      const deltaScroll = Math.abs(currentScrollY - this.lastScrollY);

      // Calculate velocity (0-1 range, capped)
      this.scrollVelocity = Math.min(deltaScroll / 50, 3);

      // Smooth velocity changes
      this.velocityMultiplier = this.velocityMultiplier * 0.9 + this.scrollVelocity * 0.1;

      this.lastScrollY = currentScrollY;
    }, { passive: true });

    // Decay velocity over time
    setInterval(() => {
      this.scrollVelocity *= 0.95;
      this.velocityMultiplier = Math.max(1, this.velocityMultiplier * 0.98);
    }, 50);
  }

  /**
   * Update scroll progress for effects
   */
  updateProgress(progress) {
    this.scrollProgress = progress;

    // Light rays appear more in the middle of the journey
    const midProgress = 1 - Math.abs(progress - 0.5) * 2;
    this.lightRayOpacity = midProgress * 0.5 + 0.2; // Always visible with peak at middle
  }

  /**
   * Start animation loop
   */
  startAnimation() {
    const animate = () => {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw effects in layers
      this.drawFog();
      this.drawLightRays();
      this.drawParticles();
      this.drawSparkles();
      this.drawGoldenBurst();
      this.drawVignette();
      this.drawColorTint();

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Draw atmospheric fog
   */
  drawFog() {
    const gradient = this.ctx.createRadialGradient(
      window.innerWidth / 2,
      window.innerHeight / 2,
      0,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerWidth * 0.8
    );

    gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
    gradient.addColorStop(0.5, `rgba(200, 220, 200, ${this.config.fogIntensity * 0.3})`);
    gradient.addColorStop(1, `rgba(180, 200, 180, ${this.config.fogIntensity})`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  /**
   * Draw god rays / light beams
   */
  drawLightRays() {
    if (!this.config.lightRays || this.lightRayOpacity <= 0) return;

    const rayCount = 5;
    const centerX = window.innerWidth * 0.6;
    const centerY = window.innerHeight * 0.2;

    this.ctx.save();
    this.ctx.globalAlpha = this.lightRayOpacity;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 0.4 - Math.PI * 0.2;
      const gradient = this.ctx.createLinearGradient(
        centerX,
        centerY,
        centerX + Math.cos(angle) * window.innerHeight * 1.5,
        centerY + Math.sin(angle) * window.innerHeight * 1.5
      );

      gradient.addColorStop(0, 'rgba(255, 250, 200, 0.15)');
      gradient.addColorStop(0.3, 'rgba(255, 250, 200, 0.05)');
      gradient.addColorStop(1, 'rgba(255, 250, 200, 0)');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(
        centerX,
        centerY,
        window.innerHeight * 1.5,
        angle - 0.05,
        angle + 0.05
      );
      this.ctx.closePath();
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  /**
   * Draw and update floating particles
   */
  drawParticles() {
    this.particles.forEach(particle => {
      // Update position with velocity multiplier
      const velocityFactor = this.velocityMultiplier;
      particle.x += particle.speedX * (1 + particle.depth) * velocityFactor;
      particle.y += particle.speedY * (1 + particle.depth) * velocityFactor;
      particle.rotation += particle.rotationSpeed * velocityFactor;

      // Wrap around screen
      if (particle.x < -10) particle.x = window.innerWidth + 10;
      if (particle.x > window.innerWidth + 10) particle.x = -10;
      if (particle.y > window.innerHeight + 10) {
        particle.y = -10;
        particle.x = Math.random() * window.innerWidth;
      }

      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity * (0.5 + particle.depth * 0.5);
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);

      if (particle.type === 'leaf') {
        this.drawLeaf(particle);
      } else {
        this.drawSpeck(particle);
      }

      this.ctx.restore();
    });
  }

  /**
   * Draw leaf-shaped particle
   */
  drawLeaf(particle) {
    const size = particle.size * (0.8 + particle.depth * 0.4);
    const green = Math.floor(150 + particle.depth * 50);

    this.ctx.fillStyle = `rgb(${green - 50}, ${green}, ${green - 70})`;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size * 2, size, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw light speck particle
   */
  drawSpeck(particle) {
    const size = particle.size * (0.5 + particle.depth * 0.5);

    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 250, 200, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 250, 200, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw and update golden sparkles
   */
  drawSparkles() {
    this.sparkles.forEach(sparkle => {
      // Update twinkle and pulse
      sparkle.twinkle += sparkle.twinkleSpeed;
      sparkle.pulsePhase += sparkle.pulseSpeed;

      // Apply velocity-based acceleration
      const velocityFactor = this.velocityMultiplier;
      sparkle.speedX = sparkle.baseSpeedX * velocityFactor;
      sparkle.speedY = sparkle.baseSpeedY * velocityFactor;

      // Update position
      sparkle.x += sparkle.speedX * (0.8 + sparkle.depth * 0.4);
      sparkle.y += sparkle.speedY * (0.8 + sparkle.depth * 0.4);

      // Wrap around screen
      if (sparkle.x < -10) sparkle.x = window.innerWidth + 10;
      if (sparkle.x > window.innerWidth + 10) sparkle.x = -10;
      if (sparkle.y > window.innerHeight + 10) {
        sparkle.y = -10;
        sparkle.x = Math.random() * window.innerWidth;
      }

      // Calculate twinkling opacity
      const twinkleOpacity = (Math.sin(sparkle.twinkle) * 0.5 + 0.5);
      const pulseSize = (Math.sin(sparkle.pulsePhase) * 0.3 + 1);
      const finalOpacity = sparkle.opacity * twinkleOpacity * (0.6 + this.scrollProgress * 0.4);

      // Draw sparkle
      this.ctx.save();
      this.ctx.globalAlpha = finalOpacity;
      this.ctx.translate(sparkle.x, sparkle.y);

      // Draw multi-layered sparkle
      this.drawSparkleGlow(sparkle, pulseSize);
      this.drawSparkleStar(sparkle, pulseSize);

      this.ctx.restore();
    });
  }

  /**
   * Draw sparkle glow effect
   */
  drawSparkleGlow(sparkle, pulseSize) {
    const size = sparkle.size * pulseSize * (0.8 + sparkle.depth * 0.4);

    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3);
    gradient.addColorStop(0, `hsla(${sparkle.hue}, 100%, 70%, 0.8)`);
    gradient.addColorStop(0.3, `hsla(${sparkle.hue}, 100%, 60%, 0.4)`);
    gradient.addColorStop(0.6, `hsla(${sparkle.hue}, 80%, 50%, 0.1)`);
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size * 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw sparkle star shape
   */
  drawSparkleStar(sparkle, pulseSize) {
    const size = sparkle.size * pulseSize * (0.6 + sparkle.depth * 0.3);
    const points = 4;

    this.ctx.fillStyle = `hsla(${sparkle.hue}, 100%, 85%, 0.9)`;
    this.ctx.beginPath();

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? size * 2 : size * 0.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.closePath();
    this.ctx.fill();

    // Add bright center dot
    this.ctx.fillStyle = `hsla(${sparkle.hue}, 100%, 95%, 1)`;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw golden burst effect (intensity based on scroll velocity)
   */
  drawGoldenBurst() {
    if (this.velocityMultiplier < 1.2) return;

    const burstIntensity = Math.min((this.velocityMultiplier - 1) / 2, 0.3);

    const gradient = this.ctx.createRadialGradient(
      window.innerWidth / 2,
      window.innerHeight / 2,
      0,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight * 0.6
    );

    gradient.addColorStop(0, `rgba(255, 215, 0, ${burstIntensity * 0.15})`);
    gradient.addColorStop(0.5, `rgba(255, 193, 7, ${burstIntensity * 0.08})`);
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  /**
   * Draw vignette effect
   */
  drawVignette() {
    const gradient = this.ctx.createRadialGradient(
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight * 0.3,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight * 0.8
    );

    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${this.config.vignetteIntensity})`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  /**
   * Draw subtle color tint
   */
  drawColorTint() {
    this.ctx.fillStyle = this.config.colorTint;
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  /**
   * Initialize ambient forest sounds (optional)
   */
  initAmbientSound() {
    // This would require audio files, placeholder for future implementation
    console.log('🔊 Ambient sound system ready (audio files required)');
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }

    this.particles = [];
    console.log('🛑 ForestAmbient: Destroyed');
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForestAmbient;
}
