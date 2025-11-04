// Theme Manager - Handles light/dark mode switching across the site
class ThemeManager {
  constructor() {
    this.toggle = document.getElementById('theme-toggle');
    this.icon = this.toggle?.querySelector('.theme-toggle-icon');
    this.storageKey = 'gh-theme-preference';
    
    this.init();
  }

  init() {
    // Check for saved preference, otherwise use system preference
    const savedTheme = localStorage.getItem(this.storageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    this.setTheme(initialTheme, false);
    
    // Listen to toggle clicks
    this.toggle?.addEventListener('click', () => this.toggleTheme());
    
    // Listen to system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.setTheme(e.matches ? 'dark' : 'light', false);
      }
    });
    
    // Keyboard support
    this.toggle?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  setTheme(theme, save = true) {
    const isDark = theme === 'dark';
    
    document.documentElement.classList.toggle('dark-mode', isDark);
    this.toggle?.setAttribute('aria-checked', isDark.toString());
    
    // Update icon
    if (this.icon) {
      this.icon.setAttribute('data-feather', isDark ? 'moon' : 'sun');
      if (window.feather) feather.replace();
    }
    
    // Announce theme change to screen readers
    const announcement = document.getElementById('theme-announcement');
    if (announcement) {
      announcement.textContent = `${isDark ? 'Dark' : 'Light'} mode activated`;
    }
    
    // Save preference
    if (save) {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ThemeManager());
} else {
  new ThemeManager();
}
