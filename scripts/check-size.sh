#!/bin/bash
# Site size checker for GitHub Pages deployment
# GitHub Pages has a 1GB recommended limit

echo "📊 Repository Size Analysis"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Total repository size
total_size=$(du -sh . 2>/dev/null | awk '{print $1}')
echo "Total repository size: $total_size"
echo ""

# GitHub Pages deployment size (excludes .git, node_modules, originals)
echo "📦 GitHub Pages Deployment Size:"
echo "--------------------------------"

# Optimized gallery images
gallery_web=$(du -sh images/photo_gallery_web 2>/dev/null | awk '{print $1}')
echo "  Gallery (optimized):     $gallery_web"

# Optimized tribute slideshow
tribute_web=$(du -sh images/tribute_slideshow_web 2>/dev/null | awk '{print $1}')
echo "  Tribute (optimized):     $tribute_web"

# Prayer card
prayer=$(du -sh images/prayer_card 2>/dev/null | awk '{print $1}')
echo "  Prayer card:             $prayer"

# Memorial magazine
magazine=$(du -sh files/memorial_magazine 2>/dev/null | awk '{print $1}')
echo "  Memorial magazine:       $magazine"

# HTML/CSS/JS
code_size=$(du -sh *.html *.css *.js data/ 2>/dev/null | awk '{sum+=$1} END {print sum "K"}')
echo "  Code (HTML/CSS/JS/data): $code_size"

echo ""
echo "📁 Source Assets (Git LFS, not in Pages build):"
echo "------------------------------------------------"
gallery_orig=$(du -sh images/photo_gallery 2>/dev/null | awk '{print $1}')
echo "  Original photos:         $gallery_orig"

tribute_orig=$(du -sh images/tribute_slideshow 2>/dev/null | awk '{print $1}')
echo "  Original tribute:        $tribute_orig"

echo ""
echo "💡 Optimization Tips:"
echo "--------------------"

# Calculate total deployment size (rough estimate in MB)
gallery_web_mb=$(du -sm images/photo_gallery_web 2>/dev/null | awk '{print $1}')
tribute_web_mb=$(du -sm images/tribute_slideshow_web 2>/dev/null | awk '{print $1}')
magazine_mb=$(du -sm files/memorial_magazine 2>/dev/null | awk '{print $1}')
deploy_mb=$((${gallery_web_mb:-0} + ${tribute_web_mb:-0} + ${magazine_mb:-0} + 1))
echo ""
echo "📊 Estimated GitHub Pages Size: ~${deploy_mb}MB"

if [ "$deploy_mb" -lt 500 ]; then
    echo "${GREEN}✅ Well under 1GB limit! You have plenty of room.${NC}"
elif [ "$deploy_mb" -lt 900 ]; then
    echo "${YELLOW}⚠️  Getting close to 1GB. Monitor growth.${NC}"
else
    echo "${RED}❌ Approaching 1GB limit. Optimize more assets.${NC}"
fi

echo ""
echo "🎯 Current Strategy:"
echo "-------------------"
echo "  ✓ Original photos → Git LFS (not counted in Pages)"
echo "  ✓ Original tribute → Git LFS (not counted in Pages)"
echo "  ✓ Optimized versions → Git (deployed to Pages)"
echo "  ✓ Automatic optimization on push!"
