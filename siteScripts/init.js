// Main Initialization Module
// Orchestrates all standalone modules for the application

import { bustCache } from './cacheBuster.js';
import { initTheme } from './theme.js';
import { initPWABanner } from './pwa.js';
import { registerServiceWorker } from './serviceWorker.js';
import { initBreadcrumbBorder } from './breadcrumb.js';
import { render } from './utilities/templates.js';

// Run cache buster immediately
bustCache();

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPWABanner();
  initBreadcrumbBorder();
  
  // Initialize unified player system
  initUnifiedPlayerSystem();
});

// Register service worker
registerServiceWorker();

// Unified Player System Initialization
function initUnifiedPlayerSystem() {
  
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
  setupResponsiveListeners();
  
  // Initialize unified triggers
  setupUnifiedTriggers();
  
  // Initialize bento grid integration for desktop
  if (isDesktop) {
    setupBentoGridIntegration();
  }
  
}

function setupResponsiveListeners() {
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
        setupBentoGridIntegration();
      }
    }, 150);
  });
}

function setupUnifiedTriggers() {
  // Menu triggers
  const mobileMenuTrigger =
    document.getElementById('menu-trigger') ||
    document.querySelector('.menu-trigger'); // fallback if id missing

  const unifiedMenuTrigger =
    document.getElementById('unified-menu-trigger') ||
    document.querySelector('.desktop-menu-trigger'); // desktop fallback

  const dropdownMenu = document.getElementById('dropdown-menu');
  // Support both an explicit #dropdown-close and a generic .close inside the menu
  const dropdownClose =
    document.getElementById('dropdown-close') ||
    document.querySelector('#dropdown-menu .close');

  const toggleMenu = (e) => {
    e?.stopPropagation();
    if (!dropdownMenu) return;
    dropdownMenu.classList.toggle('show');
  };

  const closeMenu = (e) => {
    e?.stopPropagation();
    if (!dropdownMenu) return;
    dropdownMenu.classList.remove('show');
  };

  // Bind menu triggers with stopPropagation to avoid immediate outside-close
  if (mobileMenuTrigger && dropdownMenu) {
    mobileMenuTrigger.addEventListener('click', toggleMenu);
  }
  if (unifiedMenuTrigger && dropdownMenu) {
    unifiedMenuTrigger.addEventListener('click', toggleMenu);
  }
  if (dropdownClose && dropdownMenu) {
    dropdownClose.addEventListener('click', closeMenu);
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownMenu || !dropdownMenu.classList.contains('show')) return;

    const clickedInsideMenu = dropdownMenu.contains(e.target);
    const clickedTrigger =
      (mobileMenuTrigger && mobileMenuTrigger.contains(e.target)) ||
      (unifiedMenuTrigger && unifiedMenuTrigger.contains(e.target));

    if (!clickedInsideMenu && !clickedTrigger) {
      closeMenu();
    }
  });

  // Player triggers
  const mobilePlayerTrigger =
    document.getElementById('now-playing-area') ||
    document.querySelector('#navbar .navbar-center'); // fallback

  const unifiedPlayerTrigger = document.getElementById('unified-player-trigger');
  const drawer = document.getElementById('drawer');

  const isPopoverOpen = () => {
    try {
      return drawer?.matches?.(':popover-open') || false;
    } catch {
      return drawer?.classList?.contains('open') || false;
    }
  };

  const openDrawer = () => {
    if (!drawer) return;
    if (typeof drawer.showPopover === 'function') {
      drawer.showPopover();
    } else {
      drawer.classList.add('open'); // non-popover fallback
    }
  };

  const closeDrawer = () => {
    if (!drawer) return;
    if (typeof drawer.hidePopover === 'function') {
      drawer.hidePopover();
    } else {
      drawer.classList.remove('open'); // non-popover fallback
    }
  };

  const togglePlayer = (e) => {
    e?.stopPropagation();
    if (!drawer) return;

    if (isPopoverOpen()) {
      closeDrawer();
    } else {
      openDrawer();
      // If you want to ensure no menu overlap, close the menu on open
      closeMenu();
    }
  };

  if (mobilePlayerTrigger) {
    mobilePlayerTrigger.addEventListener('click', togglePlayer);
  }
  if (unifiedPlayerTrigger) {
    unifiedPlayerTrigger.addEventListener('click', togglePlayer);
  }
}

function setupBentoGridIntegration() {
  const bentoGrid = document.querySelector('.bento-grid');
  const drawer = document.getElementById('drawer');
  
  if (!bentoGrid || !drawer) return;
  
  // Check if music player should be embedded in bento grid
  // This would be controlled by user preference or app state
  const shouldEmbedInBento = false; // This could be a user setting
  
  if (shouldEmbedInBento) {
    // Create a bento card for the music player
    const musicPlayerCard = document.createElement('div');
    musicPlayerCard.className = 'bento-card music-player-card';
    musicPlayerCard.innerHTML = render.bentoMusicPlayerCard();
    
    // Insert the music player card into bento grid
    bentoGrid.appendChild(musicPlayerCard);
    
    // Move the drawer content into the bento card
    drawer.classList.add('bento-embedded');
    musicPlayerCard.appendChild(drawer);
    
    // Set up expand button to show full player
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

// Export for global access
window.unifiedPlayerSystem = {
  initUnifiedPlayerSystem,
  setupBentoGridIntegration,
  setupUnifiedTriggers
};