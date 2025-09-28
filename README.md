# In Loving Memory of Dr. Garth Dalwin Hutton

A responsive memorial website built with **HTML**, **TailwindCSS**, and **JavaScript** to honor the life and legacy of Dr. Garth Dalwin Hutton. The site provides sections for obituary details, funeral services, prayer cards, photo memories, and downloadable keepsakes.

---

## Features

* **Hero Section**: Prominent introduction with name, years of life, and quick navigation links.
* **Navigation Bar**: Sticky top bar with smooth access to all sections.
* **Obituary Section**: Detailed biography with portrait.
* **Funeral Services Section**: Embedded video player and event details.
* **Prayer Card Section**: Styled commemorative prayer card with download option.
* **Lifetime Memories**: Digital memorial magazine with download link.
* **Photo Gallery**: Dynamic, paginated gallery with lightbox support and "Download All" functionality.
* **Animations**: Scroll-based animations powered by AOS.
* **Icons**: Feather Icons for consistent visuals.
* **Footer**: Quick links and copyright.

---

## Tech Stack

* **Frontend**: HTML5, CSS3, TailwindCSS
* **JavaScript Libraries**:

  * [AOS (Animate on Scroll)](https://michalsnik.github.io/aos/)
  * [Feather Icons](https://feathericons.com/)
  * [LightGallery](https://www.lightgalleryjs.com/) with plugins: Zoom, Thumbnail, Fullscreen
  * [JSZip](https://stuk.github.io/jszip/) for ZIP creation
  * [FileSaver.js](https://github.com/eligrey/FileSaver.js/) for client-side downloads

---

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. Open `index.html` in a browser.

3. No build tools required—site runs standalone.

---

## Customization

* **Image Data**: Replace the sample `imageData` array in the `<script>` tag with actual image URLs and thumbnails.
* **YouTube Embed**: Update the funeral services `<iframe>` with a valid video link.
* **Downloads**: Replace placeholder `href="#"` with real files for eulogies, prayer cards, and memorial gazette.
* **Favicon**: Update `/static/favicon.ico`.

---

## File Structure

```
├── index.html        # Main entry point
├── gallery.html      # Linked photo gallery (if created separately)
├── /static           # Icons, favicon, and assets
```

---

## Deployment

* Can be deployed on any static site hosting platform:

  * GitHub Pages
  * Netlify
  * Vercel
  * Cloudflare Pages

---

## License

This project is provided for **memorial and personal use only**.
Modify freely for family and community remembrance purposes.
