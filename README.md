# Dr. Garth Dalwin Hutton Memorial Website

A memorial website celebrating the life and legacy of Dr. Garth Dalwin Hutton (1961-2025).

🌐 **Live Site**: [rtuRgALp.github.io/drgarthdhutton](https://rtuRgALp.github.io/drgarthdhutton/)

---

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [Deployment](#deployment)
- [Gallery Management](#gallery-management)
- [Design Features](#design-features)

---

## ✨ Features

### Core Pages
- **Homepage**: Obituary, funeral details, prayer card, and memorial resources
- **Gallery**: 825 optimized photos with lazy loading and lightbox viewing
- **Slideshow**: Custom photo slideshow with play/pause controls

### Interactive Elements
- 🎨 Light/Dark mode toggle with warm evening palette
- 📜 Smooth scroll-to-top button (appears after 500px scroll)
- 🖼️ Infinite scroll gallery with masonry layout
- 🔍 Full-screen lightbox with zoom and thumbnails
- 📱 Fully responsive design
- ♿ Accessibility-focused (ARIA labels, keyboard navigation, screen reader support)

### Media
- 825 high-resolution photos (stored in Git LFS)
- 162 tribute slideshow images
- 1 memorial service video
- Downloadable prayer card (PNG files)
- Downloadable memorial magazine (PDF)

---

## 📁 Project Structure

```
drgarthdhutton/
├── src/                          # Source files (deployed)
│   ├── index.html               # Homepage
│   ├── gallery.html             # Photo gallery page
│   └── assets/
│       ├── css/
│       │   └── style.css        # Main stylesheet with CSS variables
│       └── js/
│           ├── script.js        # Gallery infinite scroll & lightbox logic
│           └── theme-manager.js # Dark mode toggle (standalone class)
│
├── data/
│   └── images.json              # Gallery metadata (auto-generated, DO NOT edit manually)
│
├── gallery/
│   ├── pictures/                # Original photos (Git LFS, NOT deployed)
│   ├── pictures_web/            # Optimized photos (deployed, 825 images)
│   ├── videos/                  # Original videos (Git LFS, NOT deployed)
│   └── videos_web/              # Optimized videos (deployed, MP4 H.264)
│
├── images/
│   ├── prayer_card/             # Prayer card images (deployed)
│   ├── tribute_slideshow/       # Original slideshow (Git LFS, NOT deployed)
│   └── tribute_slideshow_web/   # Optimized slideshow (deployed, 162 images)
│
├── files/
│   └── memorial_magazine/       # PDF and thumbnail (deployed)
│
├── static/                      # Favicons and manifest (deployed)
│
├── scripts/                     # Build & optimization scripts
│   ├── build-manifest.mjs       # Generate data/images.json from pictures_web/
│   ├── optimize-images.mjs      # Optimize to JPEG 85%, max 1920px
│   └── optimize-videos.mjs      # Video optimization (FFmpeg)
│
└── .github/
    ├── copilot-instructions.md  # AI agent guidance
    └── workflows/               # CI/CD automation
        ├── static.yml           # Deploy to Pages (lfs: false)
        └── build-manifest.yml   # Auto-update manifest (lfs: true)
```

---

## 🛠️ Technology Stack

### Frontend (No Build Step)
- **HTML5** + **CSS3** (CSS Variables for theming)
- **Vanilla JavaScript** (ES6, no bundler)
- **Tailwind CSS** (CDN, not compiled)
- **LightGallery 2.7.2** (photo lightbox via CDN)
- **Feather Icons** (UI icons via CDN)
- **AOS** (scroll animations, index.html only)

### Build Tools (Backend Only)
- **Node.js 20+** (for optimization scripts)
- **Sharp** (image optimization)
- **FFmpeg** (video transcoding, optional)
- **fast-glob** (file scanning)
- **http-server** (local dev server)

### Hosting & CI/CD
- **GitHub Pages** (static hosting)
- **GitHub Actions** (automated deployment & manifest updates)
- **Git LFS** (large file storage for originals only)

---

## 💻 Development

### Prerequisites
- Node.js 20+ and npm
- Git with Git LFS installed

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rtuRgALp/drgarthdhutton.git
   cd drgarthdhutton
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Pull Git LFS files** (optional, only needed for original images/videos)
   ```bash
   git lfs pull
   ```

### Local Development

**Start the development server:**
```bash
npm start  # Opens at http://localhost:8080
```

**⚠️ Important**: Must use http-server (not file:// protocol) - `fetch()` for `data/images.json` requires HTTP.

**Available Scripts:**
```bash
npm run optimize:images   # Optimize images with Sharp (gallery/ and images/)
npm run optimize:videos   # Optimize videos with FFmpeg (requires FFmpeg installed)
npm run build:manifest    # Generate data/images.json from pictures_web/
npm run optimize:all      # Run both image and video optimization
```

---

## 🚀 Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

### Deployment Process

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **GitHub Actions workflows run:**
   - `static.yml`: Builds and deploys to GitHub Pages
   - `build-manifest.yml`: Updates `data/images.json` if gallery changes

3. **Site updates in 2-3 minutes** at:
   https://rtuRgALp.github.io/drgarthdhutton/

### What Gets Deployed
- All HTML, CSS, and JavaScript from `src/`
- Optimized images (`gallery/pictures_web/`, `images/tribute_slideshow_web/`)
- Optimized videos (`gallery/videos_web/`)
- Static assets (`static/`, `data/`, `files/`)

**Note**: Original high-res files in Git LFS are **not deployed** (only optimized versions).

---

## 🖼️ Gallery Management

### Critical 4-Step Media Pipeline

**Source → Optimize → Manifest → Deploy**

1. **Add originals to `gallery/pictures/`**
   ```bash
   cp new-photos/*.jpg gallery/pictures/
   ```

2. **Optimize for web**
   ```bash
   npm run optimize:images
   ```
   Creates optimized versions in `gallery/pictures_web/` (JPEG, 85% quality, max 1920px)

3. **Regenerate manifest** (REQUIRED)
   ```bash
   npm run build:manifest
   ```
   Scans `gallery/pictures_web/` and generates `data/images.json`
   
   **Why?** Gallery reads from JSON, not filesystem. Skipping this = images won't appear.

4. **Commit ALL three directories**
   ```bash
   git add gallery/pictures/ gallery/pictures_web/ data/images.json
   git commit -m "Add new photos"
   git push
   ```
   
   **Why all three?** CI needs originals (LFS) to re-optimize if needed. Manifest triggers deployment.

### Controlling Photo Order

Photos are displayed in this priority order:

1. **Custom order** (if `gallery/photo-order.txt` exists) - photos listed in file appear first in that order
2. **By date** (newest first) - for photos not in custom order file
3. **By filename** (alphabetical) - as tiebreaker

**To set custom order:**
```bash
# 1. Create order file (copy from example)
cp gallery/photo-order.txt.example gallery/photo-order.txt

# 2. Edit and list filenames in desired order (one per line)
# favorite_photo.jpg
# second_photo.jpg
# third_photo.jpg

# 3. Rebuild manifest
npm run build:manifest

# 4. Commit
git add gallery/photo-order.txt data/images.json
git commit -m "Update photo order"
```

**Alternative: Rename files with numeric prefixes**
```bash
# Alphabetical sort will respect numbers
001_first_photo.jpg
002_second_photo.jpg
```

### Dual Directory Pattern

Every media type has TWO directories:
- `gallery/pictures/` → `gallery/pictures_web/` (825 photos)
- `images/tribute_slideshow/` → `images/tribute_slideshow_web/` (162 images)
- `gallery/videos/` → `gallery/videos_web/` (videos)

**Original** (no `_web` suffix) = Git LFS, NOT deployed  
**Optimized** (`_web` suffix) = deployed to GitHub Pages

### Image Optimization Details
- **Format**: JPEG (converted from any input format)
- **Quality**: 85%
- **Max dimension**: 1920px (width or height, aspect preserved)
- **EXIF rotation**: Auto-applied
- **Average size**: ~200-400KB per image
- **Skip logic**: Only re-optimizes if source newer than output
- **Tool**: Sharp (configured in `scripts/optimize-images.mjs`)

### Video Optimization Details
- **Format**: MP4 (H.264)
- **Quality**: CRF 23
- **Resolution**: Preserved from original
- **Average size reduction**: ~78%
- **Tool**: FFmpeg (must be installed separately)

---

## 🎨 Design Features

### CSS Theming System
- **Theme storage**: `localStorage` key `gh-theme-preference`
- **System preference**: Respects `prefers-color-scheme`
- **CSS Variables**: Defined in `:root` and `.dark-mode` (lines 1-70 of `style.css`)
- **Brand colors**: `--gh-blue-dark` (#042d62), `--gh-blue-light` (#bfe4f9)
- **Dark mode**: Warm evening palette (`--bg-primary: #1c1815`)

### Path Conventions
- **HTML**: Root-relative (`/static/favicon.ico`, `/images/prayer_card/`)
- **JS/JSON**: Current-relative (`./gallery/pictures_web/`, `./data/images.json`)
- **CSS**: Root-relative for backgrounds (`url('/images/tribute_slideshow_web/001.jpg')`)

**Why?** Works in both local dev (localhost:8080) and GitHub Pages subdirectory.

### Key UX Features
1. **Infinite scroll**: Loads 12 images at a time (`script.js` line 7: `this.perPage = 12`)
2. **LightGallery integration**: Dynamically adds hidden items for all 825 images (see `initLightGallery()`)
3. **Masonry grid layout** with Tailwind utility classes
4. **Custom slideshow** with play/pause (4-second intervals)
5. **Scroll-to-top button** (appears after 500px scroll)
6. **Theme toggle**: Standalone `ThemeManager` class

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation (Enter/Space for theme toggle)
- Screen reader announcements for theme changes
- Skip-to-content link
- `history.scrollRestoration = 'manual'` (prevents jump on browser back)

---

## 📦 Size Management

**What's Stored Where:**
- **Git LFS** (originals, NOT deployed):
  - `gallery/pictures/` - 825 original photos
  - `gallery/videos/` - Original videos
  - `images/tribute_slideshow/` - 162 original slideshow images
  
- **Deployed to GitHub Pages** (optimized only):
  - `gallery/pictures_web/` - 825 optimized photos (~165 MB)
  - `gallery/videos_web/` - Optimized videos
  - `images/tribute_slideshow_web/` - 162 optimized slideshow images
  - All `src/`, `data/`, `files/`, `static/` directories

**Optimization Results:**
- Photos: JPEG 85% quality, max 1920px (~200-400KB each)
- Videos: H.264 MP4, CRF 23 (~78% size reduction)
- Overall: 95%+ reduction from originals

**GitHub Pages Limit**: 1GB (deployment well within limit)

---

## 🚨 Common Pitfalls

1. **Adding photos without regenerating manifest**: Gallery won't show new images (reads from `data/images.json`, not filesystem)
2. **Editing `data/images.json` manually**: Gets overwritten by `build-manifest.mjs`
3. **Changing optimized images directly**: Source files in `gallery/pictures/` are source of truth
4. **Forgetting Git LFS**: Run `git lfs pull` to access originals locally
5. **Testing without http-server**: File protocol (`file://`) breaks `fetch()` for JSON
6. **Photo order not updating**: After changing `photo-order.txt` or renaming files, must run `npm run build:manifest`

## 📚 Key Files Reference

- **Media pipeline logic**: `scripts/build-manifest.mjs` (lines 28-35 for path conversion)
- **Theme system**: `src/assets/css/style.css` (lines 1-70), `src/assets/js/theme-manager.js`
- **Gallery logic**: `src/assets/js/script.js` (`loadImages()`, `initLightGallery()`, `handleScroll()`)
- **Deployment config**: `.github/workflows/static.yml` (lines 35-80 for deployment filtering)
- **CI auto-update**: `.github/workflows/build-manifest.yml` (commits with `[skip ci]`)

---

## 📝 License

This website is a private memorial project. All photos and content are property of the Hutton family.

---

**In Loving Memory of Dr. Garth Dalwin Hutton**  
*August 9, 1961 - August 9, 2025*
