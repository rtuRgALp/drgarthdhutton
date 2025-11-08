// Gallery Module (gallery.html only) - Infinite Scroll Version
class Gallery {
  constructor() {
    this.images = [];
    this.filteredImages = [];
    this.loadedCount = 0;
    this.perPage = 12;
    this.loading = false;
  }

  async boot() {
    const root = document.getElementById('gallery-root');
    if (!root) return;

    // Prevent browser scroll restoration from jumping
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.q = sel => document.querySelector(sel);
    this.els = {
      grid: this.q('#gh-gallery-grid'),
      pager: this.q('#gh-pagination'),
      loading: this.q('#gh-loading'),
      error: this.q('#gh-error'),
      retry: this.q('#gh-retry')
    };

    this.bindEvents();
    await this.loadImages();
    this.render();
  }

  bindEvents() {
    this.els.retry?.addEventListener('click', async () => {
      this.els.error.classList.add('hidden');
      this.els.loading.classList.remove('hidden');
      await this.loadImages();
      this.render();
    });
    
    window.addEventListener('scroll', () => this.handleScroll());
    window.addEventListener('hashchange', () => this.syncFromHash());
    
    // Don't re-render on popstate to avoid scroll jumping
    window.addEventListener('popstate', (e) => {
      // Only sync hash if present, don't re-render entire gallery
      if (location.hash) {
        this.syncFromHash();
      }
    });
  }

  handleScroll() {
    if (this.loading || this.loadedCount >= this.filteredImages.length) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 500;
    
    if (scrollPosition >= threshold) {
      this.loadMore();
    }
  }

  async loadImages() {
    try {
      const res = await fetch('./data/images.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`manifest ${res.status}`);
      this.images = await res.json();
      this.filteredImages = [...this.images];
      this.loadedCount = 0;
      this.els.loading.classList.add('hidden');
      this.els.error.classList.add('hidden');
      
      // Initialize lightGallery once with all images
      this.initLightGallery();
    } catch (e) {
      console.error('loadImages', e);
      this.els.loading.classList.add('hidden');
      this.els.error.classList.remove('hidden');
    }
  }

  render() {
    if (!this.els.grid) return;
    const total = this.filteredImages.length;

    if (total === 0) {
      this.els.grid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i data-feather="image" class="w-12 h-12 text-blue-dark mx-auto"></i>
          <p class="mt-4 text-blue-dark">No images found.</p>
        </div>`;
      this.els.pager.innerHTML = '';
      feather.replace();
      return;
    }

    this.els.grid.innerHTML = '';
    this.loadedCount = 0;
    this.loadMore();
  }

  loadMore() {
    if (this.loading) return;
    this.loading = true;
    
    const total = this.filteredImages.length;
    const nextBatch = Math.min(this.perPage, total - this.loadedCount);
    
    if (nextBatch <= 0) {
      this.loading = false;
      this.updateLoadingIndicator();
      return;
    }
    
    const start = this.loadedCount;
    const end = start + nextBatch;
    const pageItems = this.filteredImages.slice(start, end);

    const newHTML = pageItems.map((im, idx) => {
      const cap = im.title || 'Memory';
      const alt = im.alt || 'Memory image';
      const globalIdx = start + idx;
      return `
        <div class="gh-gallery-card">
          <a href="#" class="gh-gallery-image" data-index="${globalIdx}">
            <img src="${im.src}" alt="${this.escape(alt)}" class="gh-gallery-img" loading="lazy" decoding="async">
          </a>
        </div>`;
    }).join('');

    this.els.grid.insertAdjacentHTML('beforeend', newHTML);
    this.loadedCount = end;
    
    // Add click handlers for new images
    const newAnchors = this.els.grid.querySelectorAll('.gh-gallery-image:not([data-handled])');
    newAnchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const index = parseInt(anchor.dataset.index);
        if (this._lg) {
          this._lg.openGallery(index);
        }
      });
      anchor.setAttribute('data-handled', 'true');
    });
    
    feather.replace();
    
    this.loading = false;
    this.updateLoadingIndicator();
    this.syncFromHash();
  }

  updateLoadingIndicator() {
    const total = this.filteredImages.length;
    const remaining = total - this.loadedCount;
    
    if (remaining > 0) {
      this.els.pager.innerHTML = `
        <div class="text-center py-4 text-blue-dark">
          <p class="text-sm">Showing ${this.loadedCount} of ${total} photos</p>
          <p class="text-xs mt-1 opacity-75">Scroll down to load more...</p>
        </div>`;
    } else if (total > this.perPage) {
      this.els.pager.innerHTML = `
        <div class="text-center py-4 text-blue-dark">
          <p class="text-sm">All ${total} photos loaded</p>
        </div>`;
    } else {
      this.els.pager.innerHTML = '';
    }
  }

  initLightGallery() {
    if (this._lg) return; // Only initialize once
    
    const grid = document.getElementById('gh-gallery-grid');
    if (!grid || !window.lightGallery) return;
    
    // Create dynamic gallery with ALL filtered images
    const dynamicItems = this.filteredImages.map(im => ({
      src: im.src,
      thumb: im.src,
      subHtml: `<h4>${this.escape(im.title || 'Memory')}</h4>`,
      alt: im.alt || 'Memory image'
    }));
    
    this._lg = lightGallery(grid, {
      dynamic: true,
      dynamicEl: dynamicItems,
      plugins: [lgZoom, lgThumbnail, lgFullscreen],
      download: false,
      counter: true,
      hideBarsDelay: 0,
      speed: 400,
      mode: 'lg-fade'
    });
  }

  syncFromHash() {
    const hash = new URL(location.href).hash;
    if (!hash.startsWith('#img=')) return;
    const token = decodeURIComponent(hash.slice(5));
    const idx = this.filteredImages.findIndex(im => im.src.endsWith(token) || im.src.includes(token));
    if (idx >= 0 && this._lg) {
      this._lg.openGallery(idx);
    }
  }

  escape(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new Gallery();
  app.boot();
  window.gallery = app;
});
