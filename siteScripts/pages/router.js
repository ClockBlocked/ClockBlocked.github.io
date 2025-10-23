import { viewManager } from '../viewManager.js';
import { pageRendering } from './rendering.js';

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
