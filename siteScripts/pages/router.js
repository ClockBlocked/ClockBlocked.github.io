import { viewManager } from '../viewManager.js';
import { playerManager } from '../playerManager.js';
import {
  appState,
  storage,  
  notifications,
  musicPlayer,
  utils,
  playlists,
  overlays,
} from '../global.js';

import { ui } from './updates.js';
import { render } from '../utilities/templates.js';

export const deepLinkRouter = {
  // Helper to encode names (spaces to periods)
  encodeName(name) {
    return name.trim().replace(/\s+/g, '.');
  },

  // Helper to decode names (periods to spaces)
  decodeName(segment) {
    return segment.replace(/\./g, ' ');
  },

  parseCurrentPath() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);

    // Decode segments that might have been encoded with periods
    const decodedSegments = segments.map(seg => this.decodeName(seg));

    return {
      fullPath: path,
      segments: decodedSegments,
      route: decodedSegments[0] || 'home',
      params: decodedSegments.slice(1),
    };
  },

  resolveRoute(pathInfo) {
    const { route, params } = pathInfo;

    if (!window.appState?.router) {
      console.warn('Router not initialized yet');
      return;
    }

    const routeHandlers = {
      '': () => this.navigateToHome(),
      'home': () => this.navigateToHome(),
      'artist': () => this.navigateToArtist(params[0]),
      'artists': () => this.navigateToAllArtists(),
      'album': () => this.navigateToAlbum(params[0], params[1]),
      'playlist': () => this.navigateToPlaylist(params[0]),
      'favorites': () => this.navigateToFavorites(params[0]),
      'search': () => this.navigateToSearch(params[0]),
    };

    const handler = routeHandlers[route] || routeHandlers[''];
    return handler();
  },

  async navigateToHome() {
    if (window.appState?.router) {
      window.appState.router.navigateTo(window.ROUTES?.HOME || '/');
    }
    await viewManager.switchView('home');
  },

  async navigateToArtist(artistName) {
    if (!artistName) {
      await this.navigateToHome();
      return;
    }

    // Already decoded if coming from parseCurrentPath
    const decodedName = artistName;
    const artistData = window.music?.find(a => a.artist === decodedName);

    if (!artistData) {
      await this.navigateToHome();
      return;
    }

    if (window.appState?.router) {
      window.appState.router.navigateTo(
        window.ROUTES?.ARTIST || 'artist',
        { artist: decodedName }
      );
    }

    await viewManager.switchView('artist', { artistData });
  },

  async navigateToAllArtists() {
    if (window.appState?.router) {
      window.appState.router.navigateTo(window.ROUTES?.ALL_ARTISTS || 'artists');
    }
    await viewManager.switchView('allArtists');
  },

  async navigateToAlbum(artistName, albumName) {
    if (!artistName || !albumName) {
      await this.navigateToHome();
      return;
    }

    const decodedArtist = artistName;
    const decodedAlbum = albumName;

    if (window.appState?.router && window.music) {
      const artistData = window.music.find(a => a.artist === decodedArtist);
      if (artistData) {
        // Navigate to artist page with specific album highlighted
        await this.navigateToArtist(decodedArtist);
        
        // After navigation, scroll to and highlight the album
        setTimeout(() => {
          const albumElement = document.querySelector(`[data-album="${decodedAlbum}"]`);
          if (albumElement) {
            albumElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            albumElement.classList.add('highlighted');
            setTimeout(() => albumElement.classList.remove('highlighted'), 2000);
          }
        }, 500);
      } else {
        await this.navigateToHome();
      }
    }
  },

  navigateToPlaylist(playlistId) {
    if (!playlistId) {
      this.navigateToHome();
      return;
    }

    if (window.playlists) {
      window.playlists.show(playlistId);
    }
  },

  navigateToFavorites(type) {
    const favoriteType = type || 'songs';

    if (window.views) {
      const handlers = {
        'songs': () => window.views.showFavoriteSongs(),
        'artists': () => window.views.showFavoriteArtists(),
        'albums': () => window.views.showFavoriteAlbums?.(),
      };

      const handler = handlers[favoriteType];
      if (handler) handler();
    }
  },

  navigateToSearch(query) {
    if (!query) {
      this.navigateToHome();
      return;
    }

    const decodedQuery = this.decodeName(query);

    if (window.search) {
      window.search.performSearch(decodedQuery);
    }
  },

  // Enhanced URL building functions
  buildUrl(route, params = {}) {
    let url = '';

    switch (route) {
      case 'home':
        url = '/';
        break;
      case 'artist':
        if (params.artist) {
          url = `/artist/${this.encodeName(params.artist)}`;
        }
        break;
      case 'artists':
        url = '/artists';
        break;
      case 'album':
        if (params.artist && params.album) {
          url = `/album/${this.encodeName(params.artist)}/${this.encodeName(params.album)}`;
        }
        break;
      case 'playlist':
        if (params.id) {
          url = `/playlist/${params.id}`;
        }
        break;
      case 'favorites':
        url = `/favorites/${params.type || 'songs'}`;
        break;
      case 'search':
        if (params.query) {
          url = `/search/${this.encodeName(params.query)}`;
        }
        break;
      default:
        url = '/';
    }

    return url;
  },

  // Update URL without triggering navigation
  updateUrl(route, params = {}, replaceState = false) {
    const url = this.buildUrl(route, params);
    
    if (replaceState) {
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }
  },

  // Initialize the router (this was missing!)
  init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      const pathInfo = this.parseCurrentPath();
      this.resolveRoute(pathInfo);
    });

    // Handle initial page load
    const pathInfo = this.parseCurrentPath();
    this.resolveRoute(pathInfo);
  },

  // Legacy compatibility function
  initialize() {
    return this.init();
  },

  // Bind popstate events for browser navigation
  bindPopState() {
    window.addEventListener('popstate', () => {
      const pathInfo = this.parseCurrentPath();
      this.resolveRoute(pathInfo);
    });
  }
};

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  window.deepLinkRouter = deepLinkRouter;
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => deepLinkRouter.init());
  } else {
    deepLinkRouter.init();
  }
}






export const homePage = {
  initialize: () => {
    appState.homePageManager = {
      renderHomePage: homePage.render,
    };
  },

  render: async () => {
    await viewManager.switchView('home');
    homePage.bindEvents();
  },

  addStyles: () => {
    if ($byId("bento-grid-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "bento-grid-styles";
    styleEl.textContent = `
      .bento-grid {
        display: grid;
        gap: 1.5rem;
      }
      
      .bento-card {
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .bento-card:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .card-content {
        min-height: 200px;
      }
      
      .skeleton-loader {
        height: 200px;
        background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 0.5rem;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      .recent-tracks, .album-grid, .artist-grid, .playlists-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .album-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
      }
      
      .artist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 1rem;
      }
      
      .track-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: background-color 0.2s ease;
      }
      
      .track-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      .track-cover {
        width: 48px;
        height: 48px;
        border-radius: 0.25rem;
        object-fit: cover;
      }
      
      .track-info {
        flex: 1;
        min-width: 0;
      }
      
      .track-title {
        font-weight: 500;
        color: white;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .track-artist {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .album-card {
        text-align: center;
      }
      
      .album-cover {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 0.5rem;
        object-fit: cover;
        margin-bottom: 0.5rem;
      }
      
      .album-title {
        font-weight: 500;
        color: white;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .album-artist {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .artist-card {
        text-align: center;
      }
      
      .artist-avatar {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 0.5rem;
      }
      
      .artist-name {
        font-weight: 500;
        color: white;
        font-size: 0.875rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .playlist-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        background-color: rgba(255, 255, 255, 0.05);
        transition: background-color 0.2s ease;
      }
      
      .playlist-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      .playlist-icon {
        width: 40px;
        height: 40px;
        border-radius: 0.25rem;
        background: linear-gradient(45deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
      }
      
      .playlist-info {
        flex: 1;
      }
      
      .playlist-name {
        font-weight: 500;
        color: white;
        margin-bottom: 0.25rem;
      }
      
      .playlist-count {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
      }
    `;
    document.head.appendChild(styleEl);
  },



  bindEvents: () => {
    // Bind any additional home page specific events here
    const bentoCards = document.querySelectorAll('.bentoCard');
    bentoCards.forEach(card => {
      const cardLink = card.querySelector('.card-link');
      if (cardLink) {
        cardLink.addEventListener('click', (e) => {
          e.preventDefault();
          const viewType = cardLink.getAttribute('data-view');
          if (viewType) {
            homePage.handleCardLinkClick(viewType);
          }
        });
      }
    });

    // Bind album click events
    document.addEventListener('click', (e) => {
      const albumCard = e.target.closest('.album-compact-card');
      if (albumCard) {
        const albumName = albumCard.getAttribute('data-album');
        if (albumName && window.pageRendering?.renderArtistPage) {
          // Find the artist data for this album
          const artistData = window.music?.find(artist => 
            artist.albums?.some(album => album.album === albumName)
          );
          if (artistData) {
            window.pageRendering.renderArtistPage(artistData, albumName);
          }
        }
      }
    });

    // Bind artist click events
    document.addEventListener('click', (e) => {
      const artistCard = e.target.closest('.artist-card');
      if (artistCard) {
        const artistName = artistCard.getAttribute('data-artist');
        if (artistName && window.pageRendering?.renderArtistPage) {
          const artistData = window.music?.find(a => a.artist === artistName);
          if (artistData) {
            window.pageRendering.renderArtistPage(artistData);
          }
        }
      }
    });

    // Bind track play events
    document.addEventListener('click', (e) => {
      const trackItem = e.target.closest('.track-item');
      if (trackItem && e.target.closest('.play-button')) {
        const trackData = {
          title: trackItem.querySelector('.track-title')?.textContent,
          artist: trackItem.querySelector('.track-artist')?.textContent,
          cover: trackItem.querySelector('.track-cover')?.src
        };
        if (musicPlayer?.ui?.playSong) {
          musicPlayer.ui.playSong(trackData);
        }
      }
    });
  },

  handleCardLinkClick: (viewType) => {
    const handlers = {
      'recent-plays': () => window.views?.showRecentlyPlayed?.(),
      'discover-albums': () => window.views?.showAllAlbums?.(),
      'favorite-artists': () => window.views?.showFavoriteArtists?.(),
      'playlists': () => window.views?.showPlaylists?.(),
      'favorite-songs': () => window.views?.showFavoriteSongs?.(),
      'quick-stats': () => window.views?.showStats?.()
    };

    const handler = handlers[viewType];
    if (handler) {
      handler();
    }
  }
};

export const views = {
  showFavoriteSongs: () => {
    console.log('Show favorite songs - implement with viewManager');
    // Use viewManager to show favorite songs view
    // This would be integrated with your existing favorites system
  },

  showFavoriteArtists: () => {
    console.log('Show favorite artists - implement with viewManager');
    // Use viewManager to show favorite artists view
  },

  showFavoriteAlbums: () => {
    console.log('Show favorite albums - implement with viewManager');
    // Use viewManager to show favorite albums view
  },

  showRecentlyPlayed: () => {
    // Open music player to recent tab
    if (window.musicPlayer?.mainPlayer) {
      window.musicPlayer.mainPlayer.open();
      setTimeout(() => window.musicPlayer.mainPlayer.switchTab('recent'), 50);
    }
  },

  showAllAlbums: () => {
    console.log('Show all albums - implement with viewManager');
    // Use viewManager to show all albums view
  },

  showPlaylists: () => {
    if (window.playlists?.showAll) {
      window.playlists.showAll();
    }
  },

  showStats: () => {
    console.log('Show stats - implement with viewManager');
    // Use viewManager to show statistics view
  },

  renderEmptyState: (title, message, description) => {
    return `
      <div class="empty-state text-center py-12">
        <div class="empty-icon mb-4">
          <svg class="w-16 h-16 mx-auto text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">${title}</h3>
        <p class="text-gray-400 mb-4">${message}</p>
        ${description ? `<p class="text-sm text-gray-500">${description}</p>` : ''}
      </div>
    `;
  }
};
