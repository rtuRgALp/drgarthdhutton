class Gallery {
  constructor() {
    this.images = [];
    this.filteredImages = [];
    this.currentPage = 1;
    this.perPage = 12;
    this.searchTerm = '';
  }

  async boot() {
    const root = document.getElementById('gallery-root');
    if (!root) return;
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
    if (this.els.retry) {
this.els.retry.addEventListener('click', async () => {
        this.els.error.classList.add('hidden');
        this.els.loading.classList.remove('hidden');
        await this.loadImages();
        this.render();
      });
    }
    window.addEventListener('hashchange', () => this.syncFromHash());
    window.addEventListener('popstate', () => this.render());
  }

  async loadImages() {
    try {
      const res = await fetch('./data/images.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`manifest ${res.status}`);
      this.images = await res.json();
      this.filteredImages = [...this.images];
      this.els.loading.classList.add('hidden');
      this.els.error.classList.add('hidden');
    } catch (e) {
      console.error('loadImages', e);
      this.els.loading.classList.add('hidden');
      this.els.error.classList.remove('hidden');
    }
  }
render() {
    if (!this.els.grid) return;
    const total = this.filteredImages.length;
    const totalPages = Math.max(1, Math.ceil(total / this.perPage));
    this.currentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (this.currentPage - 1) * this.perPage;
    const pageItems = this.filteredImages.slice(start, start + this.perPage);

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

    this.els.grid.innerHTML = pageItems.map((im, idx) => {
      const cap = im.title || 'Memory';
      const alt = im.alt || 'Memory image';
      // data-lg* attributes let LightGallery pick up metadata
      return `
        <div class="gh-gallery-card">
          <a href="${im.src}" class="gh-gallery-image" data-sub-html="<h4>${this.escape(cap)}</h4>">
            <img src="${im.src}" alt="${this.escape(alt)}" class="gh-gallery-img" loading="lazy" decoding="async">
          </a>
          <div class="gh-gallery-caption">
            <h3 class="gh-gallery-title">${this.escape(cap)}</h3>
            ${im.date ? `<p class="gh-gallery-date">${this.escape(im.date)}</p>` : ''}
          </div>
        </div>`;
    }).join('');

    this.renderPager(totalPages);
    this.initLightGallery();
    feather.replace();
    this.syncFromHash(); // open deep link if present
  }

  renderPager(totalPages) {
    if (totalPages <= 1) { this.els.pager.innerHTML = ''; return; }
    const cur = this.currentPage;
    const btn = (p, label, dis=false, active=false) =>
      `<button class="gh-gallery-page-btn ${active ? 'active':''}" ${dis?'disabled':''} data-page="${p}">${label}</button>`;
    let html = '';
    html += btn(Math.max(1, cur-1), '«', cur===1);
    const windowSize = 5;
    let start = Math.max(1, cur - Math.floor(windowSize/2));
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
    if (start > 1) { html += btn(1, '1'); if (start > 2) html += `<span class="px-2">…</span>`; }
    for (let i=start;i<=end;i++) html += btn(i, String(i), false, i===cur);
    if (end < totalPages) { if (end < totalPages-1) html += `<span class="px-2">…</span>`; html += btn(totalPages, String(totalPages)); }
    html += btn(Math.min(totalPages, cur+1), '»', cur===totalPages);
    this.els.pager.innerHTML = html;
    this.els.pager.querySelectorAll('button[data-page]').forEach(b=>{
      b.addEventListener('click', () => { this.currentPage = Number(b.dataset.page); this.render(); });
    });
  }

  initLightGallery() {
    const grid = document.getElementById('gh-gallery-grid');
    if (!grid || !window.lightGallery) return;
    if (this._lg) { try { this._lg.destroy(true); } catch(_){} }
    this._lg = lightGallery(grid, {
      selector: '.gh-gallery-image',
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
    if (idx >= 0) {
      const anchors = Array.from(document.querySelectorAll('.gh-gallery-image'));
      const a = anchors[idx % anchors.length];
      if (a) a.click();
    }
  }

  debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t=setTimeout(()=>fn(...args), ms); }; }
  escape(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new Gallery();
  app.boot();
  window.gallery = app; // optional for debugging
});

