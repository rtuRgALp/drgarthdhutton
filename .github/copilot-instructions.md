# Dr. Garth Dalwin Hutton Memorial Website

## Project Overview
Static memorial website with 825+ photos, video content, and interactive gallery. Built with vanilla JS/HTML/CSS, deployed via GitHub Pages. Uses Git LFS for original media, deploys optimized versions only.

## Architecture & Data Flow

### Media Pipeline (Critical)
**Source → Optimize → Manifest → Deploy**

1. **Original media** (Git LFS): `gallery/pictures/` (not deployed)
2. **Optimization**: `npm run optimize:images` → creates `gallery/pictures_web/` (JPEG, 85%, max 1920px)
3. **Manifest**: `npm run build:manifest` → generates `data/images.json` from `gallery/pictures_web/`
4. **Deploy**: GitHub Actions copies only `*_web/` directories to Pages

**Key insight**: Gallery reads from `data/images.json`, NOT filesystem. The manifest must be regenerated after adding/optimizing images.

### Dual Directory Pattern
Every media type has TWO directories:
- `gallery/pictures/` → `gallery/pictures_web/` (825 photos)
- `images/tribute_slideshow/` → `images/tribute_slideshow_web/` (162 images)
- `gallery/videos/` → `gallery/videos_web/` (videos)

Original (`pictures/`) = Git LFS, not deployed. Optimized (`pictures_web/`) = deployed to Pages.

## Critical Workflows

### Adding Photos
```bash
# 1. Add originals (Git LFS)
cp new-photos/*.jpg gallery/pictures/

# 2. Optimize for web
npm run optimize:images

# 3. Regenerate manifest
npm run build:manifest

# 4. Commit ALL three directories
git add gallery/pictures/ gallery/pictures_web/ data/images.json
git commit -m "Add new photos"
git push
```

**Why all three?** CI workflow (`build-manifest.yml`) needs originals in LFS to re-optimize if needed. Skipping any step breaks the gallery.

### Testing Locally
```bash
npm start  # Runs http-server on :8080
```
**Must test gallery.html specifically** - infinite scroll and lightbox require browser environment.

## Project-Specific Conventions

### CSS Theming via CSS Variables
All colors defined in `:root` and `.dark-mode` (lines 1-70 of `style.css`). Use semantic variables:
- `--bg-primary`, `--text-primary` (auto-switch in dark mode)
- `--gh-blue-dark`, `--gh-blue-light` (brand colors, adjusted for dark mode)

**Example**: `.hero-section` uses brand colors that automatically adapt to theme.

### Theme Manager Pattern
`theme-manager.js` is a standalone class instantiated inline at end of file. Stores preference in `localStorage` with key `gh-theme-preference`. Respects system preference if no saved preference.

### Gallery Infinite Scroll
`script.js` loads 12 images at a time (`this.perPage = 12`), but **LightGallery must access all 825 images**. Solution: dynamically adds hidden items to LightGallery's internal array (see `initLightGallery()` method). Don't change this pattern without testing full gallery navigation.

### Path Conventions
- **HTML uses root-relative paths**: `/static/favicon.ico`, `/images/prayer_card/`
- **JS/JSON uses current-relative**: `./gallery/pictures_web/`, `./data/images.json`
- **CSS uses root-relative for background images**: `url('/images/tribute_slideshow_web/001.jpg')`

**Why?** Works in both local dev (`http://localhost:8080/`) and GitHub Pages subdirectory.

## Build Scripts

### `build-manifest.mjs`
- **Purpose**: Generates `data/images.json` from `gallery/pictures_web/`
- **Key logic**: Checks if optimized version exists for each image, falls back to original path if not
- **Uses Sharp**: Reads image metadata (width, height, format) - will fail on Git LFS pointers
- **Run when**: After optimizing images, before deployment

### `optimize-images.mjs`
- **Directories configured**: Array at top defines source/output pairs and optimization settings
- **Skip logic**: Only processes if source is newer than output (mtime comparison)
- **Format**: Converts to JPEG (except when `preserveFormat: true`)
- **Rotation**: Auto-rotates based on EXIF orientation

## CI/CD via GitHub Actions

### `static.yml` (Deployment)
- **Trigger**: Push to `main`
- **Key**: `lfs: false` - doesn't pull LFS files, only optimized versions needed
- **Copies**: Only `src/`, `*_web/` directories, `data/`, `files/`, `static/` to `_deploy/`
- **Excludes**: All original media directories (`gallery/pictures/`, `gallery/videos/`)

### `build-manifest.yml` (Auto-regenerate)
- **Trigger**: Changes to `gallery/**`, `images/**`, or build scripts
- **Key**: `lfs: true` - pulls originals to re-optimize if needed
- **Commits back**: `data/images.json` and optimized directories with `[skip ci]` to avoid loop

## External Dependencies

### CDN Libraries
- **Tailwind CSS**: Utility classes, loaded from CDN (not compiled)
- **LightGallery 2.7.2**: Photo lightbox with zoom/thumbnails/fullscreen plugins
- **Feather Icons**: Icon set, replaced on load via `feather.replace()`
- **AOS**: Scroll animations (used on index.html, not gallery.html)

**No npm install for frontend** - all external deps are CDN links in HTML `<head>`.

## Common Pitfalls

1. **Adding photos without regenerating manifest**: Gallery won't show new images
2. **Editing `data/images.json` manually**: Gets overwritten by `build-manifest.mjs`
3. **Changing optimized images directly**: Source files in `gallery/pictures/` are truth
4. **Forgetting Git LFS**: `git lfs pull` required to access originals locally
5. **Testing gallery without http-server**: File protocol breaks fetch() for `images.json`

## Key Files to Reference

- **Media pipeline**: `scripts/build-manifest.mjs` (lines 28-35 for path conversion logic)
- **Theme system**: `src/assets/css/style.css` (lines 1-70), `src/assets/js/theme-manager.js`
- **Gallery logic**: `src/assets/js/script.js` (see `loadImages()`, `initLightGallery()`, `handleScroll()`)
- **Deployment setup**: `.github/workflows/static.yml` (lines 35-80 for what gets deployed)
