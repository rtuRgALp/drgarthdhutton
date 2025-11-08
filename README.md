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

\`\`\`
drgarthdhutton/
├── src/                          # Source files
│   ├── index.html               # Homepage
│   ├── gallery.html             # Photo gallery page
│   └── assets/
│       ├── css/
│       │   └── style.css        # Main stylesheet
│       └── js/
│           ├── script.js        # Gallery & slideshow logic
│           └── theme-manager.js # Dark mode toggle
│
├── data/
│   └── images.json              # Gallery image metadata (auto-generated)
│
├── gallery/
│   ├── pictures/                # Original photos (Git LFS)
│   ├── pictures_web/            # Optimized photos (825 images)
│   ├── videos/                  # Original videos (Git LFS)
│   └── videos_web/              # Optimized videos (MP4, H.264)
│
├── images/
│   ├── prayer_card/             # Prayer card images
│   ├── tribute_slideshow/       # Original slideshow (Git LFS)
│   └── tribute_slideshow_web/   # Optimized slideshow (162 images)
│
├── files/
│   └── memorial_magazine/       # PDF and thumbnail
│
├── static/                      # Favicons and manifest
│
├── scripts/                     # Build & optimization scripts
│   ├── build-manifest.mjs       # Generate images.json
│   ├── optimize-images.mjs      # Image optimization (Sharp)
│   └── optimize-videos.mjs      # Video optimization (FFmpeg)
│
└── .github/workflows/           # CI/CD automation
    ├── static.yml               # Deploy to GitHub Pages
    └── build-manifest.yml       # Auto-update gallery metadata
\`\`\`

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** + **CSS3** (CSS Variables for theming)
- **Vanilla JavaScript** (ES6 modules)
- **Tailwind CSS** (CDN for utility classes)
- **LightGallery 2.7.2** (photo lightbox)
- **Feather Icons** (UI icons)
- **AOS** (scroll animations)

### Build Tools
- **Sharp** (image optimization)
- **FFmpeg** (video transcoding)
- **fast-glob** (file scanning)

### Hosting & CI/CD
- **GitHub Pages** (static hosting)
- **GitHub Actions** (automated deployment)
- **Git LFS** (large file storage for originals)

---

## 💻 Development

### Prerequisites
- Node.js 20+ and npm
- Git with Git LFS installed

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/rtuRgALp/drgarthdhutton.git
   cd drgarthdhutton
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Pull Git LFS files** (optional, only needed for original images/videos)
   \`\`\`bash
   git lfs pull
   \`\`\`

### Local Development

**Start the development server:**
\`\`\`bash
npm start
\`\`\`
Opens at \`http://localhost:8080\`

**Available Scripts:**
\`\`\`bash
npm run optimize:images   # Optimize images with Sharp
npm run optimize:videos   # Optimize videos with FFmpeg
npm run build:manifest    # Generate data/images.json
\`\`\`

---

## 🚀 Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the \`main\` branch.

### Deployment Process

1. **Push to main branch**
   \`\`\`bash
   git push origin main
   \`\`\`

2. **GitHub Actions workflows run:**
   - \`static.yml\`: Builds and deploys to GitHub Pages
   - \`build-manifest.yml\`: Updates \`data/images.json\` if gallery changes

3. **Site updates in 2-3 minutes** at:
   https://rtuRgALp.github.io/drgarthdhutton/

### What Gets Deployed
- All HTML, CSS, and JavaScript from \`src/\`
- Optimized images (\`gallery/pictures_web/\`, \`images/tribute_slideshow_web/\`)
- Optimized videos (\`gallery/videos_web/\`)
- Static assets (\`static/\`, \`data/\`, \`files/\`)

**Note**: Original high-res files in Git LFS are **not deployed** (only optimized versions).

---

## ��️ Gallery Management

### Adding New Photos

1. **Add originals to \`gallery/pictures/\`**
   \`\`\`bash
   cp new-photos/*.jpg gallery/pictures/
   \`\`\`

2. **Optimize for web**
   \`\`\`bash
   npm run optimize:images
   \`\`\`
   This creates optimized versions in \`gallery/pictures_web/\` (JPEG, 85% quality, max 1920px)

3. **Update gallery metadata**
   \`\`\`bash
   npm run build:manifest
   \`\`\`
   This scans \`gallery/pictures_web/\` and generates \`data/images.json\`

4. **Commit and push**
   \`\`\`bash
   git add gallery/pictures/ gallery/pictures_web/ data/images.json
   git commit -m "Add new photos"
   git push
   \`\`\`

### Image Optimization Details
- **Format**: JPEG
- **Quality**: 85%
- **Max dimension**: 1920px (width or height)
- **Average size**: ~200-400KB per image
- **Tool**: Sharp (Node.js image processing)

### Video Optimization Details
- **Format**: MP4 (H.264)
- **Quality**: CRF 23
- **Resolution**: Preserved from original
- **Average size reduction**: ~78%
- **Tool**: FFmpeg

---

## 🎨 Design Features

### Color Scheme
- **Primary Blue**: \`#042d62\` (Dr. Hutton's brand color)
- **Light Blue**: \`#bfe4f9\` (accents)
- **Dark Mode**: Warm evening palette (\`#1c1815\` background)

### Key UX Enhancements
1. **Parallax scrolling** on hero section
2. **Masonry grid layout** for photo gallery
3. **Glassmorphism effects** on cards
4. **Smooth scroll animations** (AOS library)
5. **Infinite scroll** with lazy loading (12 images per batch)
6. **Dynamic lightbox** (all 825 images accessible despite lazy DOM)
7. **Custom slideshow** with 4-second intervals
8. **Scroll-to-top button** (avoids ad-blocker conflicts)

### Browser Compatibility
- ✅ Chrome/Edge/Brave (tested)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS & Android)

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements for theme changes
- Skip-to-content link
- Prefers-reduced-motion support

---

## 📦 Size Management

**Deployment Size**: ~182 MB (well within GitHub Pages' 1GB limit)

**What's Stored Where:**
- **Git LFS** (originals, not deployed): \`gallery/pictures/\` (825 photos), \`gallery/videos/\` (1 video)
- **Deployed to Pages**: Optimized versions only (\`gallery/pictures_web/\`, \`gallery/videos_web/\`)

**Optimization Results:**
- Photos: 85% quality JPEG, max 1920px (~200-400KB each)
- Videos: H.264 MP4, CRF 23 (~78% size reduction)
- Overall: 95%+ reduction from originals

---

## 📝 License

This website is a private memorial project. All photos and content are property of the Hutton family.

---

## 👥 Credits

**Site Development**: AI-assisted development with GitHub Copilot  
**Design**: Custom memorial theme with family brand colors  
**Photos**: Hutton family collection  
**Hosting**: GitHub Pages

---

**In Loving Memory of Dr. Garth Dalwin Hutton**  
*August 9, 1961 - August 9, 2025*
