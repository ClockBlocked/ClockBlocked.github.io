// ============================================================================
// ROUTER.JS - URL Routing and Navigation Logic
// ============================================================================
// Enhanced version of pages/router.js with improved navigation capabilities
// ============================================================================

/**
 * Deep Link Router - Handles URL-based navigation
 */
export const deepLinkRouter = {
  /**
   * Encode names for URL (spaces to periods)
   * @param {string} name - Name to encode
   * @returns {string} Encoded name
   */
  encodeName(name) {
    return name.trim().replace(/\s+/g, '.');
  },

  /**
   * Decode names from URL (periods to spaces)
   * @param {string} segment - URL segment to decode
   * @returns {string} Decoded name
   */
  decodeName(segment) {
    return segment.replace(/\./g, ' ');
  },

  /**
   * Parse current URL path
   * @returns {Object} Parsed path information
   */
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

  /**
   * Resolve and handle route
   * @param {Object} pathInfo - Parsed path information
   */
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

  /**
   * Navigate to home page
   */
  navigateToHome() {
    if (window.appState?.router) {
      window.appState.router.navigateTo(window.ROUTES?.HOME || '/');
    }
  },

  /**
   * Navigate to artist page
   * @param {string} artistName - Artist name
   */
  navigateToArtist(artistName) {
    if (!artistName) {
      this.navigateToHome();
      return;
    }

    // Already decoded if coming from parseCurrentPath
    const decodedName = artistName;

    if (window.appState?.router) {
      window.appState.router.navigateTo(
        window.ROUTES?.ARTIST || 'artist',
        { artist: decodedName }
      );
    }
  },

  /**
   * Navigate to all artists page
   */
  navigateToAllArtists() {
    if (window.appState?.router) {
      window.appState.router.navigateTo(window.ROUTES?.ALL_ARTISTS || 'artists');
    }
  },

  /**
   * Navigate to album page
   * @param {string} artistName - Artist name
   * @param {string} albumName - Album name
   */
  navigateToAlbum(artistName, albumName) {
    if (!artistName || !albumName) {
      this.navigateToHome();
      return;
    }

    const decodedArtist = artistName;
    const decodedAlbum = albumName;

    if (window.appState?.router) {
      window.appState.router.navigateTo(
        window.ROUTES?.ALBUM || 'album',
        { artist: decodedArtist, album: decodedAlbum }
      );
    }
  },

  /**
   * Navigate to playlist page
   * @param {string} playlistId - Playlist ID
   */
  navigateToPlaylist(playlistId) {
    if (!playlistId) {
      this.navigateToHome();
      return;
    }

    if (window.appState?.router) {
      window.appState.router.navigateTo(
        'playlist',
        { id: playlistId }
      );
    }
  },

  /**
   * Navigate to favorites page
   * @param {string} type - Favorites type (songs/artists/albums)
   */
  navigateToFavorites(type = 'songs') {
    if (window.appState?.router) {
      window.appState.router.navigateTo(
        'favorites',
        { type: type }
      );
    }
  },

  /**
   * Navigate to search page
   * @param {string} query - Search query
   */
  navigateToSearch(query) {
    if (window.appState?.router) {
      window.appState.router.navigateTo(
        window.ROUTES?.SEARCH || 'search',
        { q: query || '' }
      );
    }
  },

  /**
   * Initialize router on page load
   */
  init() {
    // Handle initial page load
    const pathInfo = this.parseCurrentPath();
    this.resolveRoute(pathInfo);

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      const pathInfo = this.parseCurrentPath();
      this.resolveRoute(pathInfo);
    });
  }
};

/**
 * Navigation helper functions
 */
export const navigation = {
  /**
   * Navigate to a specific route
   * @param {string} route - Route name
   * @param {Object} params - Route parameters
   */
  navigateTo(route, params = {}) {
    if (window.appState?.router) {
      window.appState.router.navigateTo(route, params);
    } else {
      console.warn('Router not initialized');
    }
  },

  /**
   * Go back in history
   */
  goBack() {
    window.history.back();
  },

  /**
   * Go forward in history
   */
  goForward() {
    window.history.forward();
  },

  /**
   * Reload current page
   */
  reload() {
    window.location.reload();
  },

  /**
   * Get current route information
   * @returns {Object} Current route info
   */
  getCurrentRoute() {
    return deepLinkRouter.parseCurrentPath();
  }
};

// Export router for global access
if (typeof window !== 'undefined') {
  window.deepLinkRouter = deepLinkRouter;
  window.navigation = navigation;
}
