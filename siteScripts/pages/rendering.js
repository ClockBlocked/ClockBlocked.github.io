import { viewManager } from '../viewManager.js';
import { playerManager } from '../playerManager.js';
import {
  appState,
  storage,
  notifications,
  musicPlayer,
  utils,
  ACTION_GRID_ITEMS
} from '../global.js';

import { ui, pageUpdates } from './updates.js';
import { render, create } from '../utilities/templates.js';
import { deepLinkRouter } from './router.js';

export const escapeForAttribute = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const pageLoader = {
  bar: null,
  centerOverlay: null,
  loadingText: null,
  contentContainer: null,
  isActive: false,
  startedAt: 0,
  progress: 0,
  timers: [],
  
  pacing: {
    minActiveMs: 800,
    maxActiveMs: 1500,
    completionLingerMs: 300,
  },

  init() {
    if (!pageLoader.bar) {
      const bar = document.createElement('div');
      bar.className = 'loading-bar';
      document.body.appendChild(bar);
      pageLoader.bar = bar;
    }

    if (!pageLoader.centerOverlay) {
      const overlay = document.createElement('div');
      overlay.className = 'center-loading-overlay';
      
      const spinner = document.createElement('div');
      spinner.className = 'center-loading-spinner';
      
      const loadingText = document.createElement('div');
      loadingText.className = 'center-loading-text';
      loadingText.textContent = 'Loading...';
      
      overlay.appendChild(spinner);
      overlay.appendChild(loadingText);
      document.body.appendChild(overlay);
      
      pageLoader.centerOverlay = overlay;
      pageLoader.loadingText = loadingText;
    }

    if (!pageLoader.contentContainer) {
      pageLoader.contentContainer = document.querySelector('#dynamic-content') || 
                                     document.querySelector('#main-content') || 
                                     document.querySelector('main') ||
                                     document.body;
      
      if (pageLoader.contentContainer && !pageLoader.contentContainer.classList.contains('content-blur-container')) {
        pageLoader.contentContainer.classList.add('content-blur-container');
      }
    }
  },

  start(options = {}) {
    pageLoader.init();
    pageLoader.clearTimers();
    pageLoader.isActive = true;
    pageLoader.progress = 0;
    pageLoader.startedAt = Date.now();

    const message = options.message || 'Loading...';
    
    if (pageLoader.loadingText) {
      pageLoader.loadingText.textContent = message;
    }

    const bar = pageLoader.bar;
    bar.classList.remove('complete');
    bar.style.transform = 'scaleX(0)';
    bar.style.opacity = '0';
    
    pageLoader.centerOverlay.classList.add('active');
    
    if (pageLoader.contentContainer) {
      pageLoader.contentContainer.classList.add('blur-active');
    }

    setTimeout(() => {
      bar.classList.add('active');
      bar.style.opacity = '1';
      bar.style.transform = 'scaleX(0.1)';
      pageLoader.animateProgressBar();
    }, 50);
  },

  animateProgressBar() {
    if (!pageLoader.isActive) return;

    const intervals = [
      { duration: 200, progress: 0.1 },
      { duration: 200, progress: 0.25 },
      { duration: 400, progress: 0.5 },
      { duration: 400, progress: 0.7 },
      { duration: 800, progress: 0.9 }
    ];

    let currentInterval = 0;

    const updateProgress = () => {
      if (!pageLoader.isActive || currentInterval >= intervals.length) return;

      const interval = intervals[currentInterval];
      pageLoader.progress = interval.progress;
      
      if (pageLoader.bar) {
        pageLoader.bar.style.transform = `scaleX(${interval.progress})`;
      }

      currentInterval++;
      
      if (currentInterval < intervals.length) {
        const nextInterval = intervals[currentInterval];
        const timer = setTimeout(updateProgress, nextInterval.duration);
        pageLoader.timers.push(timer);
      }
    };

    updateProgress();
  },

  complete() {
    if (!pageLoader.isActive) return;

    const elapsedMs = Date.now() - pageLoader.startedAt;
    const minDelay = Math.max(0, pageLoader.pacing.minActiveMs - elapsedMs);

    setTimeout(() => {
      pageLoader.clearTimers();
      
      if (pageLoader.bar) {
        pageLoader.bar.style.transform = 'scaleX(1)';
        pageLoader.bar.classList.add('complete');
      }

      setTimeout(() => {
        pageLoader.isActive = false;
        
        if (pageLoader.bar) {
          pageLoader.bar.classList.remove('active', 'complete');
          pageLoader.bar.style.opacity = '0';
        }
        
        if (pageLoader.centerOverlay) {
          pageLoader.centerOverlay.classList.remove('active');
        }
        
        if (pageLoader.contentContainer) {
          pageLoader.contentContainer.classList.remove('blur-active');
        }
      }, pageLoader.pacing.completionLingerMs);
    }, minDelay);
  },

  clearTimers() {
    pageLoader.timers.forEach(timer => clearTimeout(timer));
    pageLoader.timers = [];
  },

  stop() {
    pageLoader.complete();
  }
};

export const modernPageRenderer = {
  init() {
    viewManager.init();
    playerManager.init();
    this.setupGlobalEventListeners();
  },

  setupGlobalEventListeners() {
    // Handle view navigation
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('[data-navigate]');
      if (navLink) {
        e.preventDefault();
        const viewName = navLink.getAttribute('data-navigate');
        const artistName = navLink.getAttribute('data-artist');
        
        if (viewName === 'artist' && artistName) {
          const artistData = window.music?.find(a => a.artist === artistName);
          if (artistData) {
            this.navigateToArtist(artistData);
          }
        } else {
          this.navigateToView(viewName);
        }
      }
    });

    // Handle breadcrumb navigation
    document.addEventListener('click', (e) => {
      const breadcrumbLink = e.target.closest('.breadcrumb-link');
      if (breadcrumbLink && !breadcrumbLink.disabled) {
        e.preventDefault();
        const action = breadcrumbLink.getAttribute('data-action');
        if (action) {
          this.handleBreadcrumbAction(action);
        }
      }
    });
  },

  async navigateToView(viewName, data = {}) {
    pageLoader.start({ message: `Loading ${viewName}...` });
    
    try {
      await viewManager.switchView(viewName, data);
      this.updateBreadcrumbs(viewName, data);
    } catch (error) {
      console.error(`Error navigating to ${viewName}:`, error);
      notifications?.show?.('Error loading page', 'error');
    } finally {
      pageLoader.complete();
    }
  },

  async navigateToArtist(artistData) {
    pageLoader.start({ message: `Loading ${artistData.artist}...` });
    
    try {
      await viewManager.switchView('artist', { artistData });
      this.updateBreadcrumbs('artist', { artistData });
    } catch (error) {
      console.error(`Error loading artist page:`, error);
      notifications?.show?.('Error loading artist page', 'error');
    } finally {
      pageLoader.complete();
    }
  },

  async navigateToHome() {
    await this.navigateToView('home');
  },

  async navigateToAllArtists() {
    await this.navigateToView('allArtists');
  },

  updateBreadcrumbs(viewName, data = {}) {
    const breadcrumbItems = this.generateBreadcrumbs(viewName, data);
    pageUpdates.breadCrumbs(breadcrumbItems, {
      showIcons: true,
      animateChanges: true,
      schemaMarkup: true
    });
  },

  generateBreadcrumbs(viewName, data = {}) {
    const items = [
      { 
        text: 'Home', 
        isHome: true, 
        active: viewName === 'home',
        action: 'home'
      }
    ];

    switch (viewName) {
      case 'artist':
        items.push(
          { 
            text: 'Artists', 
            active: false,
            action: 'allArtists'
          },
          { 
            text: data.artistData?.artist || 'Artist', 
            active: true 
          }
        );
        break;
      case 'allArtists':
        items.push({ 
          text: 'All Artists', 
          active: true 
        });
        break;
      case 'album':
        if (data.artistData && data.albumName) {
          items.push(
            { 
              text: 'Artists', 
              active: false,
              action: 'allArtists'
            },
            { 
              text: data.artistData.artist, 
              active: false,
              action: 'artist',
              artistData: data.artistData
            },
            { 
              text: data.albumName, 
              active: true 
            }
          );
        }
        break;
    }

    return items;
  },

  handleBreadcrumbAction(action, data = {}) {
    switch (action) {
      case 'home':
        this.navigateToHome();
        break;
      case 'allArtists':
        this.navigateToAllArtists();
        break;
      case 'artist':
        if (data.artistData) {
          this.navigateToArtist(data.artistData);
        }
        break;
    }
  }
};

// Enhanced page rendering functions that work with viewManager
export const pageRendering = {
  async renderHomePage() {
    await modernPageRenderer.navigateToHome();
  },

  async renderArtistPage(artistData, albumToShow = null) {
    await modernPageRenderer.navigateToArtist(artistData);
    
    if (albumToShow) {
      // Scroll to or highlight the specific album
      setTimeout(() => {
        const albumElement = document.querySelector(`[data-album="${albumToShow}"]`);
        if (albumElement) {
          albumElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          albumElement.classList.add('highlighted');
          setTimeout(() => albumElement.classList.remove('highlighted'), 2000);
        }
      }, 500);
    }
  },

  async renderAllArtistsPage() {
    await modernPageRenderer.navigateToAllArtists();
  },

  // Legacy compatibility functions
  showLoadingState(message = 'Loading...') {
    pageLoader.start({ message });
  },

  hideLoadingState() {
    pageLoader.complete();
  },

  updatePageTitle(title) {
    document.title = title;
  },

  updateMetaTags(meta = {}) {
    if (meta.description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.name = 'description';
        document.head.appendChild(descMeta);
      }
      descMeta.content = meta.description;
    }
  }
};

// Initialize the modern page renderer
if (typeof window !== 'undefined') {
  window.modernPageRenderer = modernPageRenderer;
  window.pageRendering = pageRendering;
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => modernPageRenderer.init());
  } else {
    modernPageRenderer.init();
  }
}
