#!/bin/bash
# Setup local development environment
# Creates symlinks to mimic production directory structure

cd "$(dirname "$0")/.."

# Create _dev directory if it doesn't exist
mkdir -p _dev

# Create symlinks from src/ to _dev/ to match production structure
ln -sf ../src/index.html _dev/index.html
ln -sf ../src/gallery.html _dev/gallery.html
ln -sf ../src/assets _dev/assets
ln -sf ../data _dev/data
ln -sf ../files _dev/files
ln -sf ../gallery _dev/gallery
ln -sf ../images _dev/images
ln -sf ../static _dev/static

echo "✓ Development environment setup complete!"
echo "  Start server: npx http-server _dev -p 8080 -c-1"
echo "  Access at: http://localhost:8080/"
