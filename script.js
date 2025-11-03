```javascript
// Gallery Module
class Gallery {
    constructor() {
        this.images = [];
        this.filteredImages = [];
        this.currentPage = 1;
        this.perPage = 12;
        this.searchTerm = '';
        this.init();
    }

    async init() {
        if (!document.getElementById('gallery-root')) return;
        
        this.setupElements();
        this.setupEventListeners();
        await this.loadImages();
        this.renderGallery();
    }

    setupElements() {
        this.elements = {
            galleryGrid: document.getElementById('gh-gallery-grid'),
            pagination: document.getElementById('gh-pagination'),
            searchInput: document.getElementById('gh-search'),
            downloadBtn: document.getElementById('gh-download-all'),
            loading: document.getElementById('gh-loading'),
            error: document.getElementById('gh-error'),
            retryBtn: document.getElementById('gh-retry')
        };
    }

    setupEventListeners() {
        // Search input with debounce
        this.elements.searchInput.addEventListener('input', this.debounce(() => {
            this.searchTerm = this.elements.searchInput.value.trim().toLowerCase();
            this.currentPage = 1;
            this.filterImages();
            this.renderGallery();
        }, 300));

        // Download all button
        this.elements.downloadBtn.addEventListener('click', () => this.downloadAll());

        // Retry button
        this.elements.retryBtn.addEventListener('click', () => {
            this.elements.error.classList.add('hidden');
            this.elements.loading.classList.remove('hidden');
            this.loadImages();
        });
    }

    async loadImages() {
        try {
            const response = await fetch('./data/images.json');
            if (!response.ok) throw new Error('Failed to load images');
            
            this.images = await response.json();
            this.filteredImages = [...this.images];
            this.elements.loading.classList.add('hidden');
        } catch (error) {
            console.error('Error loading images:', error);
            this.elements.loading.classList.add('hidden');
            this.elements.error.classList.remove('hidden');
        }
    }

    filterImages() {
        if (!this.searchTerm) {
            this.filteredImages = [...this.images];
            return;
        }

        this.filteredImages = this.images.filter(image => {
            return (image.title && image.title.toLowerCase().includes(this.searchTerm)) ||
                   (image.alt && image.alt.toLowerCase().includes(this.searchTerm)) ||
                   (image.tags && image.tags.some(tag => tag.toLowerCase().includes(this.searchTerm)));
        });
    }

    renderGallery() {
        if (this.filteredImages.length === 0) {
            this.elements.galleryGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i data-feather="image" class="w-12 h-12 text-blue-dark mx-auto"></i>
                    <p class="mt-4 text-blue-dark">No images found matching your search.</p>
                </div>
            `;
            this.elements.pagination.innerHTML = '';
            feather.replace();
            return;
        }

        const start = (this.currentPage - 1) * this.perPage;
        const end = start + this.perPage;
        const paginatedImages = this.filteredImages.slice(start, end);

        // Render images
        this.elements.galleryGrid.innerHTML = paginatedImages.map(image => `
            <div class="gh-gallery-card overflow-hidden">
                <a href="${image.src}" class="gh-gallery-image" data-src="${image.src}" data-sub-html="${image.title || ''}">
                    <img src="${image.src}" alt="${image.alt || 'Memory image'}" 
                         class="gh-gallery-img w-full" loading="lazy" decoding="async">
                </a>
                <div class="gh-gallery-caption">
                    <h3 class="gh-gallery-title">${image.title || 'Memory'}</h3>
                    ${image.date ? `<p class="gh-gallery-date">${image.date}</p>` : ''}
                </div>
            </div>
        `).join('');

        // Render pagination
        this.renderPagination();

        // Initialize lightGallery
        this.initLightGallery();
        feather.replace();
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredImages.length / this.perPage);
        
        if (totalPages <= 1) {
            this.elements.pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="gh-gallery-page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}
                    onclick="gallery.setPage(${this.currentPage - 1})">
                <i data-feather="chevron-left"></i>
            </button>
        `;

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            paginationHTML += `
                <button class="gh-gallery-page-btn" onclick="gallery.setPage(1)">1</button>
                ${startPage > 2 ? '<span class="px-2">...</span>' : ''}
            `;
        }

        for (let i = startPage; i <= endPage; i++) {
