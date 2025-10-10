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

  navigateToHome() {
    if (window.appState?.router) {
      window.appState.router.navigateTo(window.ROUTES?.HOME || '/');
    }
  },

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

  navigateToAllArtists() {
    if (window.appState?.router) {
      window.appState.router.navigateTo(window.ROUTES?.ALL_ARTISTS || 'artists');
    }
  },

  navigateToAlbum(artistName, albumName) {
    if (!artistName || !albumName) {
      this.navigateToHome();
      return;
    }

    const decodedArtist = artistName;
    const decodedAlbum = albumName;

    if (window.appState?.router && window.music) {
      const artistData = window.music.find(a => a.artist === decodedArtist);
      if (artistData && window.navigation?.pages?.loadArtistPage) {
        window.navigation.pages.loadArtistPage(artistData, decodedAlbum);
      } else {
        this.navigateToHome();
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
    if (window.appState?.router && query) {
      const decodedQuery = query;
      window.appState.router.openSearchDialog?.(decodedQuery);
    }
  },

  initialize() {
    if (window.deepLinkHandled) return;
    window.deepLinkHandled = true;

    const pathInfo = this.parseCurrentPath();

    if (pathInfo.fullPath !== '/' && pathInfo.route && pathInfo.route !== 'home') {
      console.log('Deep link detected:', pathInfo);

      const checkInitialized = setInterval(() => {
        if (window.appState?.router && window.music && window.navigation) {
          clearInterval(checkInitialized);

          setTimeout(() => {
            this.resolveRoute(pathInfo);
          }, 100);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInitialized);
        if (!window.appState?.router) {
          console.error('App not initialized after 5 seconds, redirecting to home');
          window.location.href = '/';
        }
      }, 5000);
    }
  },

  bindPopState() {
    window.addEventListener('popstate', (event) => {
      const pathInfo = this.parseCurrentPath();
      this.resolveRoute(pathInfo);
    });
  },
};
