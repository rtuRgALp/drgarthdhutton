# In Loving Memory of Dr. Garth Dalwin Hutton

A responsive memorial website built with **HTML**, **TailwindCSS**, and **JavaScript** to honor the life and legacy of Dr. Garth Dalwin Hutton (1961-2025). The site features an optimized photo gallery, memorial resources, and automated image processing for optimal web performance.

---

## 🌟 Features

### Pages
* **Home Page (`index.html`)**: 
  - Hero section with portrait background
  - Complete obituary with photo
  - Funeral service details and video
  - Interactive prayer card display
  - Memorial magazine preview
  - Photo gallery preview
  - Fully responsive with mobile hamburger menu

* **Photo Gallery (`gallery.html`)**: 
  - Dynamic, paginated photo gallery (12 photos per page)
  - LightGallery integration with zoom, thumbnails, and fullscreen
  - Smart pagination with ellipsis for large galleries
  - Mobile-responsive navigation
  - Lazy loading for performance

### Interactive Elements
* **Dark Mode**: Warm "Evening Mode" theme with system preference detection and localStorage persistence
* **Mobile Navigation**: Hamburger menu on both pages for mobile devices
* **Scroll Animations**: AOS (Animate on Scroll) lazy-loaded for smooth entrance effects
* **Lightbox Gallery**: Full-screen photo viewing with gestures
* **Downloadable Resources**: 
  - Prayer card (front & back) as ZIP
  - Memorial magazine PDF
* **Icons**: Feather Icons throughout
* **Accessibility**: Skip-to-content links, screen reader announcements, high contrast support

---

## 🚀 Tech Stack

### Frontend
* **HTML5, CSS3, TailwindCSS** (via CDN)
* **Vanilla JavaScript** (ES6 modules)

### JavaScript Libraries
* [AOS (Animate on Scroll)](https://michalsnik.github.io/aos/) - Scroll animations (lazy-loaded)
* [Feather Icons](https://feathericons.com/) - Icon system
* [LightGallery](https://www.lightgalleryjs.com/) - Photo gallery with plugins:
  - Zoom
  - Thumbnails
  - Fullscreen
* [JSZip](https://stuk.github.io/jszip/) - Client-side ZIP creation
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Download handling

### Custom Modules
* **theme-manager.js** - Dark/light mode switching with persistence
* **script.js** - Infinite scroll gallery logic

### Build Tools
* **Node.js** (v20+) for image optimization
* **Sharp** - High-performance image processing
* **fast-glob** - File pattern matching

---

## 📦 Setup & Development

### Prerequisites
- Node.js 20+ 
- npm
- Git with Git LFS enabled

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rtuRgALp/drgarthdhutton.git
   cd drgarthdhutton
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Optimize images** (first time):
   ```bash
   npm run optimize:images
   ```

4. **Build gallery manifest**:
   ```bash
   npm run build:manifest
   ```

5. **Start development server**:
   ```bash
   npm start
   ```
   Visit: http://localhost:8080

### Available Scripts

```bash
npm start               # Start local dev server (port 8080)
npm run dev             # Alias for start
npm run optimize:images # Optimize all images for web
npm run build:manifest  # Generate gallery manifest (data/images.json)
npm run generate:favicon # Generate favicon set from source image
npm run check:size      # Check deployment size
```

---

## 🖼️ Image Optimization System

The site uses an intelligent two-tier image storage system:

### Architecture
- **Original Images** (Git LFS): High-resolution source files
  - `images/photo_gallery/` - Gallery originals (2.6GB)
  - `images/tribute_slideshow/` - Tribute originals (291MB)
  
- **Optimized Images** (Git): Web-optimized versions for deployment
  - `images/photo_gallery_web/` - Optimized gallery (107MB, 96% reduction)
  - `images/tribute_slideshow_web/` - Optimized tribute (53MB, 82% reduction)

### How It Works
1. Add high-res photos to `images/photo_gallery/` or `images/tribute_slideshow/`
2. Run `npm run optimize:images` to generate web versions
3. Optimization settings:
   - Max dimensions: 1920×1920px
   - Quality: 85% JPEG
   - Progressive encoding
   - Auto-rotation from EXIF
   - Smart caching (only processes new/changed images)

### Automatic Workflow
GitHub Actions automatically optimizes images on push:
1. Detects new/changed images
2. Generates optimized versions
3. Updates gallery manifest
4. Commits changes back to repo

---

## 📁 File Structure

```
drgarthdhutton/
├── index.html                    # Main home page
├── gallery.html                  # Photo gallery page
├── script.js                     # Gallery logic (infinite scroll)
├── theme-manager.js              # Dark/light mode controller
├── style.css                     # Custom styles + CSS variables + dark mode
├── package.json                  # Dependencies & scripts
├── README.md                     # This file
├── SIZE_MANAGEMENT.md            # Size optimization guide
│
├── .github/workflows/
│   ├── build-manifest.yml        # Auto-generate gallery manifest
│   └── static.yml                # GitHub Pages deployment
│
├── scripts/
│   ├── optimize-images.mjs       # Image optimization tool
│   ├── build-manifest.mjs        # Gallery manifest generator
│   ├── check-size.sh             # Deployment size checker
│   └── generate-favicon.mjs      # Favicon generator
│
├── data/
│   └── images.json               # Gallery manifest (auto-generated)
│
├── images/
│   ├── photo_gallery/            # Original gallery photos (Git LFS)
│   ├── photo_gallery_web/        # Optimized gallery (committed)
│   ├── tribute_slideshow/        # Original tribute images (Git LFS)
│   ├── tribute_slideshow_web/    # Optimized tribute (committed)
│   └── prayer_card/              # Prayer card images
│
├── static/
│   └── *.png, *.ico, manifest    # Favicons and PWA manifest
│
└── files/
    └── memorial_magazine/        # PDF and thumbnails
```

---

## 🌐 Deployment

### GitHub Pages (Current)
The site is automatically deployed via GitHub Actions:
1. Push changes to `main` branch
2. Workflow creates deployment package (~180MB)
3. Only optimized images are deployed
4. Original images stay in Git LFS

### Deployment Size
- **Total Deployment**: ~182 MB (18% of 1GB limit)
- **Gallery (optimized)**: 107 MB
- **Tribute (optimized)**: 53 MB
- **Other assets**: ~22 MB
- **Headroom**: 840 MB available

### Alternative Platforms
Can also deploy to:
- Netlify
- Vercel
- Cloudflare Pages
- Any static hosting service

---

## 🎨 Customization

### Theme System
The site features a sophisticated dark/light mode system with warm tones:

**Light Mode** (Default):
- Navy blue (#042d62) and cyan (#bfe4f9) accents
- Clean white backgrounds
- High contrast for readability

**Dark Mode** ("Evening Mode"):
- Warm brown backgrounds (#1c1815, #2a2622, #3d3832)
- Cream text (#f5f1e8, #d4cfc3)
- Dignified warm tones appropriate for memorial context

Edit CSS variables in `style.css`:
```css
:root {
  /* Light mode */
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
  --gh-blue-dark: #042d62;
  --gh-blue-light: #bfe4f9;
}

.dark-mode {
  /* Dark mode */
  --bg-primary: #1c1815;
  --text-primary: #f5f1e8;
  /* ... warm brown palette */
}
```

### Social Sharing
Open Graph and Twitter Card metadata included for beautiful social previews:
- Custom titles and descriptions per page
- Featured images for sharing
- Edit meta tags in `<head>` of each HTML file

### Adding Photos
1. Add high-res photos to `images/photo_gallery/`
2. Run `npm run optimize:images`
3. Run `npm run build:manifest`
4. Test with `npm start`
5. Commit and push

### Updating Content
- **Obituary**: Edit `index.html` lines 68-85
- **Services**: Edit `index.html` lines 88-117
- **Prayer Card**: Replace images in `images/prayer_card/`
- **Videos**: Update YouTube embed URLs in `index.html`

---

## 📊 Performance

### Optimizations
- ✅ Image optimization (95%+ reduction)
- ✅ Lazy loading for images and animations
- ✅ Progressive JPEG encoding
- ✅ CDN preconnect hints for faster resource loading
- ✅ Resource preloading (gallery JSON data)
- ✅ Infinite scroll gallery (12 photos per batch)
- ✅ Modular JavaScript (theme-manager.js separated)
- ✅ Deferred script loading
- ✅ Mobile-first responsive design
- ✅ Semantic HTML and accessibility features

### Accessibility (WCAG AAA)
- ✅ Skip-to-content links
- ✅ Screen reader announcements (theme changes)
- ✅ High contrast mode support
- ✅ Keyboard navigation (Enter/Space for theme toggle)
- ✅ ARIA labels and live regions
- ✅ Semantic landmarks and headings

### Core Web Vitals
- **LCP** (Largest Contentful Paint): Optimized with preconnect + lazy loading
- **FID** (First Input Delay): Reduced with deferred scripts
- **CLS** (Cumulative Layout Shift): Prevented with proper image sizing

### Size Limits
- **GitHub Pages**: 1 GB recommended
- **Current usage**: 182 MB (18%)
- **Can add**: ~13,000 more photos at current quality

---

## 🤝 Contributing

This is a memorial website for family use. If you're a family member:
1. Contact the repository owner for access
2. Follow the image optimization workflow
3. Test locally before pushing
4. Be respectful of the memorial nature

---

## 📄 License

This project is provided for **memorial and personal use only**.  
All rights reserved by the Hutton family.  
Modify freely for family remembrance purposes.

---

## 💙 In Memory

> "Always with a smile"  
> Dr. Garth Dalwin Hutton  
> August 9, 1961 - August 9, 2025

