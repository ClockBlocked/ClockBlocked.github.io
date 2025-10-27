// Main Initialization Module
// Orchestrates all standalone modules for the application

import { bustCache } from './cacheBuster.js';
import { initTheme } from './theme.js';
import { initPWABanner } from './pwa.js';
import { registerServiceWorker } from './serviceWorker.js';
import { initBreadcrumbBorder } from './breadcrumb.js';

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
  setupResponsiveListeners();
  
  // Initialize unified triggers
  setupUnifiedTriggers();
  
  // Initialize bento grid integration for desktop
  if (isDesktop) {
    setupBentoGridIntegration();
  }
  
  console.log('✅ Unified Player System initialized');
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
  const mobileMenuTrigger = document.getElementById('menu-trigger');
  const unifiedMenuTrigger = document.getElementById('unified-menu-trigger');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const dropdownClose = document.getElementById('dropdown-close');
  
  function toggleMenu() {
    if (dropdownMenu) {
      dropdownMenu.classList.toggle('show');
    }
  }
  
  function closeMenu() {
    if (dropdownMenu) {
      dropdownMenu.classList.remove('show');
    }
  }
  
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
  
  function togglePlayer() {
    if (drawer) {
      if (drawer.matches(':popover-open')) {
        drawer.hidePopover();
      } else {
        drawer.showPopover();
        
        // On desktop, check if we should embed in bento grid instead
        if (window.innerWidth >= 1024) {
          const bentoGrid = document.querySelector('.bento-grid');
          if (bentoGrid && !drawer.classList.contains('bento-embedded')) {
            // Option to embed in bento grid (this would be handled by the music player logic)
            console.log('🎵 Desktop player opened - could be embedded in bento grid');
          }
        }
      }
    }
  }
  
  // Bind player triggers
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