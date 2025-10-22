// playerManager.js
// Centralized music player management for all viewports (mobile, tablet, desktop)

export const playerManager = {
  playerElement: null,
  isOffcanvasOpen: false,
  currentViewport: 'mobile',
  tabletTrigger: null,
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    
    this.detectViewport();
    this.setupPlayerTriggers();
    this.setupDrawerHandlers();
    this.positionPlayer();
    
    window.addEventListener('resize', () => this.handleResize());
  },

  detectViewport() {
    const width = window.innerWidth;
    if (width < 768) {
      this.currentViewport = 'mobile';
    } else if (width >= 768 && width < 1024) {
      this.currentViewport = 'tablet';
    } else {
      this.currentViewport = 'desktop';
    }
  },

  getCurrentViewport() {
    return this.currentViewport;
  },

  setupPlayerTriggers() {
    // Mobile: Use navbar's "now playing" area to open drawer
    const nowPlayingArea = document.getElementById('now-playing-area');
    if (nowPlayingArea) {
      nowPlayingArea.addEventListener('click', () => {
        if (this.currentViewport === 'mobile') {
          this.openDrawer();
        }
      });
    }

    // Tablet: Create a floating trigger button (navbar is hidden on tablet)
    this.createTabletTrigger();
    
    // Desktop: No trigger needed - player is in bento grid
  },

  createTabletTrigger() {
    // Remove existing trigger if any
    if (this.tabletTrigger) {
      this.tabletTrigger.remove();
    }

    // Create new trigger
    this.tabletTrigger = document.createElement('button');
    this.tabletTrigger.className = 'tablet-player-trigger';
    this.tabletTrigger.setAttribute('aria-label', 'Toggle music player');
    this.tabletTrigger.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
      </svg>
    `;
    
    document.body.appendChild(this.tabletTrigger);
    
    this.tabletTrigger.addEventListener('click', () => {
      if (this.currentViewport === 'tablet') {
        this.toggleDrawer();
      }
    });
    
    this.updateTabletTriggerVisibility();
  },

  updateTabletTriggerVisibility() {
    if (this.tabletTrigger) {
      if (this.currentViewport === 'tablet') {
        this.tabletTrigger.style.display = 'flex';
      } else {
        this.tabletTrigger.style.display = 'none';
      }
    }
  },

  setupDrawerHandlers() {
    const drawer = document.getElementById('drawer');
    if (!drawer) return;

    // Handle swipe down to close
    const drawerDrag = drawer.querySelector('.drawerDrag');
    if (drawerDrag) {
      let startY = 0;
      let currentY = 0;
      let isDragging = false;

      drawerDrag.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
      });

      drawerDrag.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) {
          drawer.style.transform = `translateY(${diff}px)`;
        }
      });

      drawerDrag.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = currentY - startY;
        if (diff > 100) {
          this.closeDrawer();
        } else {
          drawer.style.transform = '';
        }
      });
    }
  },

  openDrawer() {
    const drawer = document.getElementById('drawer');
    if (drawer && (this.currentViewport === 'mobile' || this.currentViewport === 'tablet')) {
      drawer.showPopover();
      this.isOffcanvasOpen = true;
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('drawer');
    if (drawer) {
      drawer.hidePopover();
      drawer.style.transform = '';
      this.isOffcanvasOpen = false;
    }
  },

  toggleDrawer() {
    if (this.isOffcanvasOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  },

  positionPlayer() {
    // Desktop: Player should be in bento grid
    // Mobile/Tablet: Player should be in drawer
    
    if (this.currentViewport === 'desktop') {
      this.closeDrawer();
      // Player remains in drawer, but bento grid card can show player controls
      // The actual music player drawer is still used, just triggered differently
    }
  },

  handleResize() {
    const oldViewport = this.currentViewport;
    this.detectViewport();

    if (oldViewport !== this.currentViewport) {
      this.handleViewportChange();
    }
  },

  handleViewportChange() {
    // Update trigger visibility
    this.updateTabletTriggerVisibility();
    
    // Position player appropriately
    this.positionPlayer();
    
    // Close drawer if switching to desktop
    if (this.currentViewport === 'desktop') {
      this.closeDrawer();
    }
  }
};

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  window.playerManager = playerManager;
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => playerManager.init());
  } else {
    playerManager.init();
  }
}
