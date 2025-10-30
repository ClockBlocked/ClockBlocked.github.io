// ============================================================================
// BUILDER.JS - DOM Updates and Dynamic Layout Changes
// ============================================================================
// Consolidates DOM manipulation and updates from:
// - pages/updates.js
// - desktopLayout.js
// - utilities/dynamicOverlays.js (if needed)
// ============================================================================

/**
 * Page Updates - UI update functions
 */
export const pageUpdates = {
  /**
   * Update breadcrumbs navigation
   * @param {Array} items - Breadcrumb items
   * @param {Object} options - Configuration options
   */
  breadCrumbs: (items, options = {}) => {
    const {
      containerId = ".breadcrumb-list",
      showIcons = false,
      truncateAfter = null,
      animateChanges = true,
      schemaMarkup = false
    } = options;

    const list = document.querySelector(containerId);
    if (!list) return;

    const prev = animateChanges ? list.innerHTML : null;
    list.innerHTML = "";

    let display = items;
    if (truncateAfter && items.length > truncateAfter + 1) {
      display = [items[0], { text: "...", isEllipsis: true }, ...items.slice(-(truncateAfter - 1))];
    }

    display.forEach((item, index) => {
      if (item.isEllipsis) {
        const li = document.createElement("li");
        li.className = "breadcrumb-item";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "breadcrumb-link";
        btn.setAttribute("aria-label", "Show all breadcrumb items");
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 13a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z"/></svg>';
        btn.addEventListener("click", () => {
          pageUpdates.breadCrumbs(items, { ...options, truncateAfter: null });
        });
        li.appendChild(btn);
        list.appendChild(li);
        return;
      }

      const li = document.createElement("li");
      li.className = "breadcrumb-item";
      if (schemaMarkup) {
        li.setAttribute("itemprop", "itemListElement");
        li.setAttribute("itemscope", "");
        li.setAttribute("itemtype", "https://schema.org/ListItem");
      }
      if (item.active) li.classList.add("active");

      const el = document.createElement("button");
      el.type = "button";
      el.className = "breadcrumb-link";
      if (item.active) {
        el.setAttribute("aria-current", "page");
        el.disabled = true;
      }
      if (schemaMarkup) el.setAttribute("itemprop", "item");

      let html = "";
      if (item.icon) {
        html += `<span class="SVGimg">${item.icon}</span>`;
      } else if (item.isHome || (index === 0 && showIcons)) {
        html += '<svg class="SVGimg" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0V14a1 1 0 011-1h2a1 1 0 011 1v7"/></svg>';
      }
      html += schemaMarkup ? `<span itemprop="name">${item.text}</span>` : item.text;
      el.innerHTML = html;

      if (!item.active) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (item.onClick) { 
            item.onClick(); 
            return; 
          }
          if (window.appState?.router) {
            if (item.route) {
              if (item.route === window.ROUTES?.HOME) {
                window.appState.router.navigateTo(window.ROUTES.HOME);
              } else if (item.route === window.ROUTES?.ARTIST && item.artist) {
                window.appState.router.navigateTo(window.ROUTES.ARTIST, { artist: item.artist });
              } else if (item.route === window.ROUTES?.ALL_ARTISTS) {
                window.appState.router.navigateTo(window.ROUTES.ALL_ARTISTS);
              }
            } else {
              if (item.text === "Home" || item.isHome) {
                window.appState.router.navigateTo(window.ROUTES?.HOME || '/');
              } else if (item.artist) {
                window.appState.router.navigateTo(window.ROUTES?.ARTIST || 'artist', { artist: item.artist });
              } else if (item.text === "All Artists") {
                window.appState.router.navigateTo(window.ROUTES?.ALL_ARTISTS || 'allArtists');
              }
            }
          }
        });
      }

      li.appendChild(el);
      if (schemaMarkup) {
        const meta = document.createElement("meta");
        meta.setAttribute("itemprop", "position");
        meta.setAttribute("content", (index + 1).toString());
        li.appendChild(meta);
      }
      list.appendChild(li);

      if (index < display.length - 1) {
        const chevron = document.createElement("li");
        chevron.className = "breadcrumb-chevron";
        chevron.setAttribute("aria-hidden", "true");
        chevron.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>';
        list.appendChild(chevron);
      }
    });

    if (animateChanges && prev !== null && prev !== list.innerHTML) {
      list.style.opacity = "0";
      requestAnimationFrame(() => {
        list.style.transition = "opacity 0.2s ease";
        list.style.opacity = "1";
      });
    }
  },

  /**
   * Update page title
   * @param {string} title - New page title
   */
  pageTitle: (title) => {
    document.title = title;
    const dynamicTitle = document.getElementById('dynamicTitle');
    if (dynamicTitle) {
      dynamicTitle.textContent = title;
    }
  },

  /**
   * Show loading state
   * @param {string} containerId - Container element ID
   */
  showLoading: (containerId = 'dynamic-content') => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    }
  },

  /**
   * Hide loading state
   * @param {string} containerId - Container element ID
   */
  hideLoading: (containerId = 'dynamic-content') => {
    const container = document.getElementById(containerId);
    if (container) {
      const spinner = container.querySelector('.loading-spinner');
      if (spinner) {
        spinner.remove();
      }
    }
  }
};

/**
 * UI utilities for dynamic updates
 */
export const ui = {
  /**
   * Scroll to top of page
   * @param {boolean} smooth - Use smooth scrolling
   */
  scrollToTop: (smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  },

  /**
   * Scroll to element
   * @param {string|Element} target - Target element or selector
   * @param {Object} options - Scroll options
   */
  scrollTo: (target, options = {}) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      element.scrollIntoView({
        behavior: options.smooth !== false ? 'smooth' : 'auto',
        block: options.block || 'start',
        inline: options.inline || 'nearest'
      });
    }
  },

  /**
   * Add CSS class to element
   * @param {string|Element} target - Target element or selector
   * @param {string} className - Class name to add
   */
  addClass: (target, className) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      element.classList.add(className);
    }
  },

  /**
   * Remove CSS class from element
   * @param {string|Element} target - Target element or selector
   * @param {string} className - Class name to remove
   */
  removeClass: (target, className) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      element.classList.remove(className);
    }
  },

  /**
   * Toggle CSS class on element
   * @param {string|Element} target - Target element or selector
   * @param {string} className - Class name to toggle
   */
  toggleClass: (target, className) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      element.classList.toggle(className);
    }
  },

  /**
   * Show element
   * @param {string|Element} target - Target element or selector
   */
  show: (target) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      element.classList.remove('hidden');
      element.style.display = '';
    }
  },

  /**
   * Hide element
   * @param {string|Element} target - Target element or selector
   */
  hide: (target) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      element.classList.add('hidden');
    }
  },

  /**
   * Create and append element
   * @param {string} tag - HTML tag name
   * @param {Object} options - Element options (className, innerHTML, etc.)
   * @param {Element} parent - Parent element to append to
   * @returns {Element} Created element
   */
  createElement: (tag, options = {}, parent = null) => {
    const element = document.createElement(tag);
    
    if (options.className) {
      element.className = options.className;
    }
    
    if (options.id) {
      element.id = options.id;
    }
    
    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    }
    
    if (options.textContent) {
      element.textContent = options.textContent;
    }
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }
    
    if (parent) {
      parent.appendChild(element);
    }
    
    return element;
  }
};

/**
 * Desktop layout initialization
 */
export function initDesktopLayout() {
  let desktopElementsInitialized = false;
  let syncPlayerSidebar = null;

  function handleDesktopLayout() {
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop && !desktopElementsInitialized) {
      desktopElementsInitialized = true;
      // Desktop-specific layout initialization would go here
      console.log('Desktop layout initialized');
    } else if (!isDesktop && desktopElementsInitialized) {
      desktopElementsInitialized = false;
      // Cleanup desktop-specific elements
      console.log('Desktop layout cleaned up');
    }
  }

  window.addEventListener('resize', handleDesktopLayout);
  handleDesktopLayout();
}

// Export for global access
if (typeof window !== 'undefined') {
  window.pageUpdates = pageUpdates;
  window.ui = ui;
}
