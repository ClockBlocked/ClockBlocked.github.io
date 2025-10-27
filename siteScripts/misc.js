// Miscellaneous Modules - Consolidated smaller utilities and features
// Combines: theme.js, pwa.js, breadcrumb.js, cacheBuster.js, desktopLayout.js,
// init.js, overlays.js, and page-related modules
// All using object literal format

// ===========================================
// THEME MODULE
// ===========================================
export const theme = {
  themeColors: {
    dark: "#3d454e",
    dim: "#4a535d",
    light: "#c9d1df",
  },

  setTheme: function(themeName) {
    const html = document.documentElement;
    html.setAttribute("data-theme", themeName);
    localStorage.setItem("theme", themeName);

    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag && this.themeColors[themeName]) {
      metaTag.setAttribute("content", this.themeColors[themeName]);
    }
  },

  init: function() {
    const container = document.querySelector(".theme-toggle-container");
    const trigger = document.querySelector(".theme-trigger");
    const themeButtons = document.querySelectorAll(".theme-options button");

    if (!container || !trigger) {
      console.warn('Theme toggle elements not found');
      return;
    }

    const savedTheme = localStorage.getItem("theme") || "dim";
    this.setTheme(savedTheme);

    themeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === savedTheme);

      btn.addEventListener("click", () => {
        const themeName = btn.dataset.theme;
        this.setTheme(themeName);

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
};

// ===========================================
// PWA (Progressive Web App) MODULE
// ===========================================
export const pwa = {
  deferredPrompt: null,
  banner: null,
  installLink: null,
  dismissBtn: null,

  showBanner: function() {
    if (this.banner) {
      this.banner.style.opacity = "1";
      this.banner.style.pointerEvents = "auto";
      this.banner.classList.remove("translate-y-5");
    }
  },
  
  hideBanner: function() {
    if (this.banner) {
      this.banner.style.opacity = "0";
      this.banner.style.pointerEvents = "none";
    }
  },

  init: function() {
    this.banner = document.getElementById("pwa-install-banner");
    this.installLink = document.getElementById("pwa-download-link");
    this.dismissBtn = document.getElementById("pwa-dismiss");

    if (!this.banner || !this.installLink || !this.dismissBtn) {
      console.warn('PWA banner elements not found');
      return;
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showBanner();
    });

    this.installLink.addEventListener("click", async (e) => {
      e.preventDefault();
      this.hideBanner();
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        this.deferredPrompt = null;
      }
    });
    
    this.dismissBtn.addEventListener("click", () => this.hideBanner());
    
    window.addEventListener("DOMContentLoaded", () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        console.log("App running in standalone mode.");
      } else if ("getInstalledRelatedApps" in navigator) {
        navigator.getInstalledRelatedApps().then((relatedApps) => {
          if (relatedApps.length > 0) {
            console.log("PWA installed.");
            this.showBanner();
          } else {
            console.log("PWA not installed.");
          }
        });
      }
    });
  }
};

// ===========================================
// BREADCRUMB MODULE
// ===========================================
export const breadcrumb = {
  breadcrumbElement: null,
  pageWrapper: null,

  updateBreadcrumb: function() {
    if (!this.breadcrumbElement || !this.pageWrapper) return;

    const scrollTop = this.pageWrapper.scrollTop || document.documentElement.scrollTop;
    
    if (scrollTop > 10) {
      this.breadcrumbElement.classList.add('scrolled');
    } else {
      this.breadcrumbElement.classList.remove('scrolled');
    }
  },

  init: function() {
    this.breadcrumbElement = document.querySelector('.breadcrumb-wrapper');
    this.pageWrapper = document.getElementById('pageWrapper');
    
    if (!this.breadcrumbElement || !this.pageWrapper) {
      console.warn('Breadcrumb or page wrapper not found');
      return;
    }

    this.pageWrapper.addEventListener('scroll', () => this.updateBreadcrumb(), { passive: true });
    this.updateBreadcrumb();

    // Observe for dynamic content changes
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            setTimeout(() => this.init(), 50);
          }
        });
      });
      
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }
  }
};

// ===========================================
// CACHE BUSTER MODULE
// ===========================================
export const cacheBuster = {
  bust: function() {
    const version = Date.now();
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    
    cssLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.includes('?v=')) {
        link.setAttribute('href', `${href}?v=${version}`);
      }
    });
  }
};

// ===========================================
// SERVICE WORKER MODULE
// ===========================================
export const serviceWorker = {
  register: function() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./siteScripts/serviceWorker.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful:', registration.scope);
          })
          .catch((err) => {
            console.log('ServiceWorker registration failed:', err);
          });
      });
    }
  }
};

// ===========================================
// UNIFIED PLAYER SYSTEM MODULE
// ===========================================
export const unifiedPlayerSystem = {
  init: function() {
    console.log('🎵 Initializing Unified Player System...');
    
    // Check device type and set appropriate classes
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const isDesktop = window.innerWidth >= 1024;
    
    document.body.classList.add(
      isMobile ? 'device-mobile' : 
      isTablet ? 'device-tablet' : 
      'device-desktop'
    );
    
    // Initialize responsive behavior
    this.setupResponsiveListeners();
    
    // Initialize unified triggers
    this.setupUnifiedTriggers();
    
    // Initialize bento grid integration for desktop
    if (isDesktop) {
      this.setupBentoGridIntegration();
    }
    
    console.log('✅ Unified Player System initialized');
  },

  setupResponsiveListeners: function() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        const isDesktop = window.innerWidth >= 1024;
        
        // Update device classes
        document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
        document.body.classList.add(
          isMobile ? 'device-mobile' : 
          isTablet ? 'device-tablet' : 
          'device-desktop'
        );
        
        // Refresh bento grid integration if needed
        if (isDesktop) {
          this.setupBentoGridIntegration();
        }
      }, 150);
    });
  },

  setupUnifiedTriggers: function() {
    // Menu triggers
    const mobileMenuTrigger = document.getElementById('menu-trigger');
    const unifiedMenuTrigger = document.getElementById('unified-menu-trigger');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const dropdownClose = document.getElementById('dropdown-close');
    
    const toggleMenu = () => {
      if (dropdownMenu) {
        dropdownMenu.classList.toggle('show');
      }
    };
    
    const closeMenu = () => {
      if (dropdownMenu) {
        dropdownMenu.classList.remove('show');
      }
    };
    
    // Bind menu triggers
    if (mobileMenuTrigger) {
      mobileMenuTrigger.addEventListener('click', toggleMenu);
    }
    
    if (unifiedMenuTrigger) {
      unifiedMenuTrigger.addEventListener('click', toggleMenu);
    }
    
    if (dropdownClose) {
      dropdownClose.addEventListener('click', closeMenu);
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (dropdownMenu && dropdownMenu.classList.contains('show')) {
        if (!dropdownMenu.contains(e.target) && 
            !mobileMenuTrigger?.contains(e.target) && 
            !unifiedMenuTrigger?.contains(e.target)) {
          closeMenu();
        }
      }
    });
    
    // Player triggers
    const mobilePlayerTrigger = document.getElementById('now-playing-area');
    const unifiedPlayerTrigger = document.getElementById('unified-player-trigger');
    const drawer = document.getElementById('drawer');
    
    const togglePlayer = () => {
      if (drawer) {
        if (drawer.matches(':popover-open')) {
          drawer.hidePopover();
        } else {
          drawer.showPopover();
          
          // On desktop, check if we should embed in bento grid instead
          if (window.innerWidth >= 1024) {
            const bentoGrid = document.querySelector('.bento-grid');
            if (bentoGrid && !drawer.classList.contains('bento-embedded')) {
              console.log('🎵 Desktop player opened - could be embedded in bento grid');
            }
          }
        }
      }
    };
    
    // Bind player triggers
    if (mobilePlayerTrigger) {
      mobilePlayerTrigger.addEventListener('click', togglePlayer);
    }
    
    if (unifiedPlayerTrigger) {
      unifiedPlayerTrigger.addEventListener('click', togglePlayer);
    }
  },

  setupBentoGridIntegration: function() {
    const bentoGrid = document.querySelector('.bento-grid');
    const drawer = document.getElementById('drawer');
    
    if (!bentoGrid || !drawer) return;
    
    // This would be controlled by user preference or app state
    const shouldEmbedInBento = false;
    
    if (shouldEmbedInBento) {
      const musicPlayerCard = document.createElement('div');
      musicPlayerCard.className = 'bento-card music-player-card';
      musicPlayerCard.innerHTML = `
        <div class="card-header">
          <h2 class="card-title">Now Playing</h2>
          <button class="expand-player-btn" title="Expand Player">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      `;
      
      bentoGrid.appendChild(musicPlayerCard);
      drawer.classList.add('bento-embedded');
      musicPlayerCard.appendChild(drawer);
      
      const expandBtn = musicPlayerCard.querySelector('.expand-player-btn');
      if (expandBtn) {
        expandBtn.addEventListener('click', () => {
          drawer.classList.remove('bento-embedded');
          document.body.appendChild(drawer);
          drawer.showPopover();
          musicPlayerCard.remove();
        });
      }
    }
  }
};

// ===========================================
// INITIALIZATION MODULE
// ===========================================
export const initialization = {
  init: function() {
    // Run cache buster immediately
    cacheBuster.bust();

    // Initialize all modules when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      theme.init();
      pwa.init();
      breadcrumb.init();
      
      // Initialize unified player system
      unifiedPlayerSystem.init();
    });

    // Register service worker
    serviceWorker.register();
  }
};

// Export legacy function names for backward compatibility
export const initTheme = () => theme.init();
export const initPWABanner = () => pwa.init();
export const initBreadcrumbBorder = () => breadcrumb.init();
export const bustCache = () => cacheBuster.bust();
export const registerServiceWorker = () => serviceWorker.register();
export const initUnifiedPlayerSystem = () => unifiedPlayerSystem.init();

// Auto-initialize on import (matching original behavior)
// Comment: This preserves the original automatic initialization behavior
initialization.init();
