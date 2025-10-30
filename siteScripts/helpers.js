// ============================================================================
// HELPERS.JS - Utility Functions and Helper Methods
// ============================================================================
// Consolidates utility functions from multiple files:
// - utilities/dom.js
// - utilities/parsers.js
// - cacheBuster.js
// - breadcrumb.js
// - theme.js
// - pwa.js
// - serviceWorker.js
// ============================================================================

// ============================================================================
// DOM UTILITIES
// ============================================================================

/**
 * Event delegation helper
 * @param {Element} root - Root element to attach listener to
 * @param {string} event - Event name
 * @param {string} selector - CSS selector for target elements
 * @param {Function} handler - Event handler function
 * @param {Object} opts - Event listener options
 */
export const on = (root, event, selector, handler, opts) => {
  root.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  }, opts);
};

/**
 * Safe JSON stringification for data-* attributes
 * @param {Object} obj - Object to stringify
 * @returns {string} JSON string with escaped quotes
 */
export const toDataJSON = (obj) => JSON.stringify(obj).replaceAll('"', '&quot;');

/**
 * Delay utility
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if key is Enter or Space (for keyboard accessibility)
 * @param {KeyboardEvent} e - Keyboard event
 * @returns {boolean} True if Enter or Space key
 */
export const isEnterOrSpace = (e) => e.key === 'Enter' || e.key === ' ' || e.code === 'Space';

/**
 * Try/catch wrapper for safe function execution
 * @param {Function} fn - Function to execute
 * @param {*} fallback - Fallback value if function throws
 * @returns {*} Function result or fallback
 */
export const safe = (fn, fallback = undefined) => {
  try { return fn(); } catch { return fallback; }
};

/**
 * Simple query selector shorthand
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element} Selected element
 */
export const $ = (selector, context = document) => context.querySelector(selector);

/**
 * Query selector by ID shorthand
 * @param {string} id - Element ID
 * @returns {Element} Selected element
 */
export const $byId = (id) => document.getElementById(id);

// ============================================================================
// TIME AND DATE UTILITIES
// ============================================================================

/**
 * Format seconds to MM:SS format
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse duration string to seconds
 * @param {string} durationStr - Duration string (e.g., "3:45")
 * @returns {number} Duration in seconds
 */
export function parseDuration(durationStr) {
  if (typeof durationStr !== "string") return 0;
  const parts = durationStr.split(':');
  if (parts.length !== 2) return 0;
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  return minutes * 60 + seconds;
}

// ============================================================================
// STRING AND URL UTILITIES
// ============================================================================

/**
 * Normalize name for URL usage
 * @param {string} name - Name to normalize
 * @returns {string} Normalized name
 */
export function normalizeNameForUrl(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Normalize text for URL slug
 * @param {string} text - Text to normalize
 * @returns {string} URL-friendly slug
 */
export function normalizeForUrl(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');
}

/**
 * Encode URI component safely
 * @param {string} str - String to encode
 * @returns {string} Encoded string
 */
export function encodeURIComponent(str) {
  return window.encodeURIComponent(str);
}

// ============================================================================
// IMAGE UTILITIES
// ============================================================================

/**
 * Get album image URL
 * @param {string} albumName - Album name
 * @returns {string} Album image URL
 */
export function getAlbumImageUrl(albumName) {
  if (!albumName) return getDefaultAlbumImage();
  return `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/Finalfinal/global/content/images/albumCovers/${albumName.toLowerCase().replace(/\s+/g, '')}.png`;
}

/**
 * Get artist image URL
 * @param {string} artistName - Artist name
 * @returns {string} Artist image URL
 */
export function getArtistImageUrl(artistName) {
  if (!artistName) return getDefaultArtistImage();
  let normalizedName = normalizeNameForUrl(artistName);
  return `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/Finalfinal/global/content/images/artistPortraits/${normalizedName}.png`;
}

/**
 * Get default artist image
 * @returns {string} Default artist image URL
 */
export function getDefaultArtistImage() {
  return 'https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/Finalfinal/global/content/images/artistPortraits/default-artist.png';
}

/**
 * Get default album image
 * @returns {string} Default album image URL
 */
export function getDefaultAlbumImage() {
  return 'https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/Finalfinal/global/content/images/albumCovers/default-album.png';
}

/**
 * Load image with fallback
 * @param {HTMLImageElement} imgElement - Image element
 * @param {string} primaryUrl - Primary image URL
 * @param {string} fallbackUrl - Fallback image URL
 * @param {string} type - Image type (artist/image)
 */
export function loadImageWithFallback(imgElement, primaryUrl, fallbackUrl, type = 'image') {
  if (!imgElement) return;

  let testImage = new Image();
  
  testImage.onload = function() {
    imgElement.src = primaryUrl;
    imgElement.classList.remove('image-loading', 'image-error');
    imgElement.classList.add('image-loaded');
  };
  
  testImage.onerror = function() {
    let fallbackImage = new Image();
    
    fallbackImage.onload = function() {
      imgElement.src = fallbackUrl;
      imgElement.classList.remove('image-loading');
      imgElement.classList.add('image-loaded', 'image-fallback');
    };
    
    fallbackImage.onerror = function() {
      imgElement.classList.remove('image-loading');
      imgElement.classList.add('image-error');
      imgElement.src = generatePlaceholderImage(type);
    };
    
    fallbackImage.src = fallbackUrl;
  };
  
  imgElement.classList.add('image-loading');
  imgElement.classList.remove('image-loaded', 'image-error', 'image-fallback');
  testImage.src = primaryUrl;
}

/**
 * Generate placeholder image SVG
 * @param {string} type - Image type (artist/image)
 * @returns {string} Data URL for placeholder image
 */
export function generatePlaceholderImage(type) {
  let isArtist = type === 'artist';
  let bgColor = isArtist ? '#4F46E5' : '#059669';
  let icon = isArtist ? 
    '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' :
    '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>';
  
  let svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="${bgColor}"/>
    <svg x="75" y="75" width="50" height="50" viewBox="0 0 24 24" fill="white">
      ${icon}
    </svg>
  </svg>`;
  
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// ============================================================================
// DATA UTILITIES
// ============================================================================

/**
 * Get total songs for an artist
 * @param {Object} artist - Artist object with albums
 * @returns {number} Total song count
 */
export function getTotalSongs(artist) {
  if (!artist || !artist.albums) return 0;
  return artist.albums.reduce((total, album) => total + album.songs.length, 0);
}

/**
 * Escape string for HTML attribute
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeForAttribute(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================================================
// CACHE BUSTER
// ============================================================================

/**
 * Add cache-busting query parameters to stylesheets and scripts
 */
export function bustCache() {
  const cacheBuster = "?_=" + Date.now();

  // StyleSheets
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (!link.href.includes("?")) {
      link.href += cacheBuster;
    } else {
      link.href += "&" + cacheBuster.substring(2);
    }
  });

  // Scripts
  document.querySelectorAll("script[src]").forEach((script) => {
    if (!script.src.includes(window.location.host) || script.src.includes("cache")) return;

    if (!script.src.includes("?")) {
      script.src += cacheBuster;
    } else {
      script.src += "&" + cacheBuster.substring(2);
    }
  });
}

// ============================================================================
// BREADCRUMB UTILITIES
// ============================================================================

/**
 * Initialize breadcrumb border scroll effect
 */
export function initBreadcrumbBorder() {
  const breadcrumb = document.querySelector('.breadcrumb-wrapper');
  const pageWrapper = document.getElementById('pageWrapper');
  
  if (!breadcrumb || !pageWrapper) {
    console.warn('Breadcrumb or page wrapper not found');
    return;
  }

  function updateBreadcrumb() {
    const scrollTop = pageWrapper.scrollTop || document.documentElement.scrollTop;
    
    if (scrollTop > 10) {
      breadcrumb.classList.add('scrolled');
    } else {
      breadcrumb.classList.remove('scrolled');
    }
  }
  
  pageWrapper.addEventListener('scroll', updateBreadcrumb, { passive: true });
  updateBreadcrumb();
}

// ============================================================================
// THEME UTILITIES
// ============================================================================

const THEME_COLORS = {
  dark: "#3d454e",
  dim: "#4a535d",
  light: "#c9d1df",
};

/**
 * Initialize theme toggle functionality
 */
export function initTheme() {
  const container = document.querySelector(".theme-toggle-container");
  const trigger = document.querySelector(".theme-trigger");
  const themeButtons = document.querySelectorAll(".theme-options button");
  const html = document.documentElement;

  const setTheme = (theme) => {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag && THEME_COLORS[theme]) {
      metaTag.setAttribute("content", THEME_COLORS[theme]);
    }
  };

  const savedTheme = localStorage.getItem("theme") || "dim";
  setTheme(savedTheme);

  themeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === savedTheme);

    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      setTheme(theme);

      themeButtons.forEach((b) => b.classList.toggle("active", b === btn));
      container.classList.remove("active");
    });
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    container.classList.toggle("active");
  });

  document.addEventListener("click", () => {
    container.classList.remove("active");
  });
}

// ============================================================================
// PWA UTILITIES
// ============================================================================

/**
 * Initialize PWA install banner
 */
export function initPWABanner() {
  let deferredPrompt;
  const banner = document.getElementById("pwa-install-banner");
  const installLink = document.getElementById("pwa-download-link");
  const dismissBtn = document.getElementById("pwa-dismiss");

  if (!banner || !installLink || !dismissBtn) {
    console.warn('PWA banner elements not found');
    return;
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showPWABanner();
  });

  function showPWABanner() {
    banner.style.opacity = "1";
    banner.style.pointerEvents = "auto";
    banner.classList.remove("translate-y-5");
  }
  
  function hidePWABanner() {
    banner.style.opacity = "0";
    banner.style.pointerEvents = "none";
  }

  installLink.addEventListener("click", async (e) => {
    e.preventDefault();
    hidePWABanner();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
    }
  });
  
  dismissBtn.addEventListener("click", hidePWABanner);
  
  window.addEventListener("DOMContentLoaded", () => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("App running in standalone mode.");
    } else if ("getInstalledRelatedApps" in navigator) {
      navigator.getInstalledRelatedApps().then((relatedApps) => {
        if (relatedApps.length > 0) {
          console.log("PWA installed.");
          showPWABanner();
        } else {
          console.log("PWA not installed.");
        }
      });
    }
  });
}

/**
 * Register service worker for PWA functionality
 */
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./system/serviceWorker.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    });
  }
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Storage helper object
 */
export const storage = {
  save: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },
  
  load: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }
};
