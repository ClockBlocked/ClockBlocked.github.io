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

  embedPlayerInCard(cardContentElement) {
    if (!cardContentElement) return;

    // For desktop, embed a mini player control interface in the card
    // This still uses the main drawer player but provides controls in the bento card
    cardContentElement.innerHTML = `
      <div class="desktop-player-card">
        <div class="player-card-header">
          <button class="player-card-open-btn" onclick="playerManager.openDrawer()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            Open Full Player
          </button>
        </div>
        
        <div class="player-card-content">
          <div class="current-track-info">
            <div class="track-artwork">
              <img id="desktop-track-cover" src="/images/default-cover.jpg" alt="Album cover">
            </div>
            <div class="track-details">
              <div class="track-title" id="desktop-track-title">No track selected</div>
              <div class="track-artist" id="desktop-track-artist">Select a song to play</div>
            </div>
          </div>
          
          <div class="mini-player-controls">
            <button class="control-btn" id="desktop-prev-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button class="control-btn play-pause-btn" id="desktop-play-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button class="control-btn" id="desktop-next-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>
          
          <div class="volume-section">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input type="range" class="volume-slider" id="desktop-volume" min="0" max="100" value="50">
          </div>
        </div>
        
        <div class="quick-actions">
          <button class="action-btn" onclick="playerManager.showQueue()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
            </svg>
            Queue
          </button>
          <button class="action-btn" onclick="playerManager.showLyrics()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            Lyrics
          </button>
        </div>
      </div>
    `;

    // Connect the mini controls to the main player
    this.connectMiniControls();
  },

  connectMiniControls() {
    const playBtn = document.getElementById('desktop-play-btn');
    const prevBtn = document.getElementById('desktop-prev-btn');
    const nextBtn = document.getElementById('desktop-next-btn');
    const volumeSlider = document.getElementById('desktop-volume');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (window.musicPlayer?.togglePlayPause) {
          window.musicPlayer.togglePlayPause();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (window.musicPlayer?.previousTrack) {
          window.musicPlayer.previousTrack();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (window.musicPlayer?.nextTrack) {
          window.musicPlayer.nextTrack();
        }
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        if (window.musicPlayer?.setVolume) {
          window.musicPlayer.setVolume(e.target.value / 100);
        }
      });
    }
  },

  updateDesktopPlayerCard(trackData) {
    const coverImg = document.getElementById('desktop-track-cover');
    const titleEl = document.getElementById('desktop-track-title');
    const artistEl = document.getElementById('desktop-track-artist');
    const playBtn = document.getElementById('desktop-play-btn');

    if (trackData) {
      if (coverImg) coverImg.src = trackData.cover || '/images/default-cover.jpg';
      if (titleEl) titleEl.textContent = trackData.title;
      if (artistEl) artistEl.textContent = trackData.artist;
      
      if (playBtn) {
        playBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        `;
      }
    } else {
      if (coverImg) coverImg.src = '/images/default-cover.jpg';
      if (titleEl) titleEl.textContent = 'No track selected';
      if (artistEl) artistEl.textContent = 'Select a song to play';
      
      if (playBtn) {
        playBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
      }
    }
  },

  showQueue() {
    this.openDrawer();
    // Switch to queue tab in the main player
    setTimeout(() => {
      const queueTab = document.querySelector('[data-tab="queue"]');
      if (queueTab) queueTab.click();
    }, 300);
  },

  showLyrics() {
    this.openDrawer();
    // Switch to lyrics tab in the main player
    setTimeout(() => {
      const lyricsTab = document.querySelector('[data-tab="lyrics"]');
      if (lyricsTab) lyricsTab.click();
    }, 300);
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

    // Update viewport-specific elements
    if (window.pageUpdates?.updateViewportSpecificElements) {
      window.pageUpdates.updateViewportSpecificElements();
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
