# 🚀 Deployment Guide

World-class deployment instructions for Greenhouse Forest Scroll landing page.

---

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Extract Frames

```bash
# Navigate to project
cd new-build

# Extract with FFmpeg (fastest)
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
  rm "$i"  # Remove JPG after conversion
done
cd ../../..
```

### Step 2: Test Locally

```bash
# Start server
python3 -m http.server 8000

# Open browser
open http://localhost:8000

# Verify:
# ✅ Hero section loads
# ✅ Scroll changes forest depth
# ✅ Portfolio cards reveal smoothly
# ✅ Glassmorphism effects visible
```

### Step 3: Deploy to Production

Choose your platform:

#### **Option A: Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, done!
```

#### **Option B: Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Or drag-and-drop folder to: https://app.netlify.com/drop
```

#### **Option C: AWS S3 + CloudFront**

```bash
# Install AWS CLI
brew install awscli

# Create S3 bucket
aws s3 mb s3://greenhouse-forest

# Upload files
aws s3 sync . s3://greenhouse-forest --acl public-read

# Configure CloudFront (via AWS Console)
```

---

## 📋 Pre-Deploy Checklist

### Critical
- [ ] 120 frames extracted to `assets/images/forest-sequence/`
- [ ] All frames named `frame-001.webp` through `frame-120.webp`
- [ ] Test scroll animation works locally
- [ ] Verify glassmorphism on Safari 15+
- [ ] Check mobile responsiveness (< 768px)

### Performance
- [ ] Run Lighthouse audit (Performance > 90)
- [ ] Test on 3G throttling (< 3s load)
- [ ] Verify WebP support fallback
- [ ] Check image sizes (each < 60KB)
- [ ] Total asset size < 5MB

### Quality
- [ ] Test on Chrome, Safari, Firefox
- [ ] Test on iPhone, Android
- [ ] Verify all links work
- [ ] Check reduced motion support
- [ ] Validate HTML (https://validator.w3.org/)

---

## 🔧 Optimization Tips

### Reduce Asset Size

If total size > 5MB:

```bash
# Reduce WebP quality
cd assets/images/forest-sequence
for i in frame-*.webp; do
  cwebp -q 70 "original/$i" -o "$i"  # Lower quality
done

# Or reduce frame count
# Use every other frame (60 instead of 120)
```

### Enable Compression

Add to `.htaccess` (Apache) or `netlify.toml`:

```
# Enable Gzip
gzip on;
gzip_types text/css application/javascript image/webp;

# Enable Brotli (better than Gzip)
brotli on;
brotli_types text/css application/javascript image/webp;
```

### Add CDN

**CloudFlare (Free)**:
1. Sign up at https://cloudflare.com
2. Add your domain
3. Update nameservers
4. Enable "Auto Minify" for CSS/JS
5. Enable "Polish" for image optimization

---

## 🌐 Custom Domain Setup

### Vercel

```bash
# Add domain
vercel domains add greenhouse.com

# Configure DNS
# Add CNAME: www → cname.vercel-dns.com
# Add A: @ → 76.76.19.19
```

### Netlify

```bash
# Add domain via dashboard
# Configure DNS
# Add CNAME: www → [your-site].netlify.app
```

---

## 📊 Post-Deploy Monitoring

### Set Up Analytics

**Google Analytics 4**:
```html
<!-- Add to <head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Performance Monitoring**:
```javascript
// Track forest scroller metrics
if (window.forestScroller) {
  setInterval(() => {
    const metrics = forestScroller.getMetrics();
    console.log('FPS:', metrics.fps, 'Frame:', metrics.currentFrame);

    // Send to analytics
    gtag('event', 'forest_scroll', {
      'fps': metrics.fps,
      'progress': Math.round(metrics.progress * 100)
    });
  }, 5000);
}
```

### Set Up Alerts

**Uptime Monitoring** (Free):
- https://uptimerobot.com
- Ping every 5 minutes
- Email alerts if down

**Lighthouse CI** (Performance):
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=https://greenhouse.com
```

---

## 🐛 Common Deploy Issues

### Issue: 404 on frame images

**Cause**: Incorrect path or missing files
**Fix**:
```bash
# Verify files exist
ls -la assets/images/forest-sequence/ | head -10

# Check naming (must be frame-001, not frame-1)
# Ensure leading zeros: 001, 002, ..., 120
```

### Issue: CORS errors

**Cause**: Loading from different domain
**Fix**: Add CORS headers
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

### Issue: Slow load times

**Cause**: Unoptimized images
**Fix**:
```bash
# Further optimize
cwebp -q 70 -m 6 input.jpg -o output.webp

# Or use fewer frames
# Edit config: totalFrames: 60
```

---

## 🔒 Security Headers

Add to hosting config:

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## ✅ Launch Checklist

Day of Launch:

- [ ] Final test on production URL
- [ ] Run Lighthouse audit
- [ ] Test from different locations/devices
- [ ] Verify SSL certificate active
- [ ] Check all social media links
- [ ] Test contact email
- [ ] Monitor server logs for errors
- [ ] Check analytics tracking works
- [ ] Announce on social media
- [ ] Monitor performance for 24hrs

---

## 🎉 You're Live!

Your world-class forest scroll landing is now live.

**Next Steps**:
1. Share with team
2. Monitor analytics
3. Gather user feedback
4. Iterate and improve

**Performance Targets**:
- Lighthouse: 90+ Performance, 100 Accessibility
- Load Time: < 3s on 3G
- Scroll FPS: 60fps on desktop, 30fps on mobile

---

**Questions?** hello@greenhouseventures.com
