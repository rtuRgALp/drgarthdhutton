# Size Management Guide

## 📊 Current Status
- **GitHub Pages deployment**: ~182 MB ✅
- **Limit**: 1 GB (soft limit, recommended)
- **Headroom**: ~840 MB available
- **Overall optimization**: 95%+ reduction

## 🎯 Strategy

### What Goes Where

#### Git LFS (Not Counted in GitHub Pages)
- `images/photo_gallery/` - Original high-res photos (2.6 GB)
- `images/tribute_slideshow/` - Original tribute images (291 MB)
- These are source assets, kept for archival purposes
- Automatically managed by `.gitattributes`

#### GitHub Pages Deployment (Counted)
- `images/photo_gallery_web/` - Optimized photos (107 MB) ✅
- `images/tribute_slideshow_web/` - Optimized tribute (53 MB) ✅
- `images/prayer_card/` - Prayer card images (676 KB)
- `files/memorial_magazine/` - PDF magazine (19 MB)
- HTML, CSS, JS, data files (~136 KB)

## 🚀 Workflow

### Adding New Photos
1. Add originals to `images/photo_gallery/` or `images/tribute_slideshow/`
2. Run `npm run optimize:images` (auto-optimizes new photos)
3. Run `npm run build:manifest` (updates gallery index if needed)
4. Push to GitHub (workflow handles the rest)

### Checking Size Before Push
```bash
npm run check:size
```

### Testing Locally
```bash
npm run optimize:images  # Optimize images
npm run build:manifest   # Update manifest
npm start               # Start dev server at localhost:8080
```

## 💡 Future Optimization Options

If you approach 1GB, consider:

### Option 1: Compress Memorial Magazine (19 MB → ~5-10 MB)
PDF can be compressed if needed.

### Option 2: Progressive Loading
Implement lazy loading or pagination for very large galleries.

## 📈 Growth Estimates

With current optimization (95%+ reduction):
- **Can add ~13,000 more photos** before hitting 1GB
- Current: 608 photos optimized (446 gallery + 162 tribute)
- Theoretical max: ~13,000+ photos at current quality

## 🔍 Commands Reference

```bash
# Check deployment size
npm run check:size

# Optimize new images
npm run optimize:images

# Rebuild gallery manifest
npm run build:manifest

# Test locally
npm start

# Full build process
npm run optimize:images && npm run build:manifest
```

## ⚠️ Important Notes

1. **Don't delete originals** - They're in Git LFS and don't count toward GitHub Pages
2. **Do commit optimized images** - These are what visitors see
3. **Workflow auto-generates** optimized images on push
4. **Local testing** requires Node.js and npm
