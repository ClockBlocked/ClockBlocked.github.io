export const router = {
  encodeName: function(name) {
    return name.trim().replace(/\s+/g, '.');
  },

  decodeName: function(segment) {
    return segment.replace(/\./g, ' ');
  },

  parseCurrentPath: function() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const decodedSegments = segments.map(seg => this.decodeName(seg));

    return {
      fullPath: path,
      segments: decodedSegments,
      route: decodedSegments[0] || 'home',
      params: decodedSegments.slice(1),
    };
  },

  initialize: function() {
    if (window.deepLinkHandled) return;
    window.deepLinkHandled = true;

    const pathInfo = this.parseCurrentPath();

    if (pathInfo.fullPath !== '/' && pathInfo.route && pathInfo.route !== 'home') {
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
          window.location.href = '/';
        }
      }, 5000);
    }

    this.bindPopState();
  },

  bindPopState: function() {
    window.addEventListener('popstate', (event) => {
      const pathInfo = this.parseCurrentPath();
      this.resolveRoute(pathInfo);
    });
  },

  resolveRoute: function(pathInfo) {
    const { route, params } = pathInfo;

    if (!window.appState?.router) return;

    const routeHandlers = {
      '': () => { this.navigateToHome(); },
      'home': () => { this.navigateToHome(); },
      'artist': () => { this.navigateToArtist(params[0]); },
      'artists': () => { this.navigateToAllArtists(); },
      'album': () => { this.navigateToAlbum(params[0], params[1]); },
      'playlist': () => { this.navigateToPlaylist(params[0]); },
      'favorites': () => { this.navigateToFavorites(params[0]); },
      'search': () => { this.navigateToSearch(params[0]); },
    };

    const handler = routeHandlers[route] || routeHandlers[''];
    handler.call(this);
  },

  navigateToHome: function() {
    if (window.appState?.router) {
      window.appState.router.navigateTo(window.ROUTES?.HOME || '/');
    }
  },

  navigateToArtist: function(artistName) {
    if (!artistName) {
      this.navigateToHome();
      return;
    }

    const decodedName = artistName;
    if (window.appState?.router) {
      window.appState.router.navigateTo(
        window.ROUTES?.ARTIST || 'artist',
        { artist: decodedName }
      );
    }
  },

  navigateToAllArtists: function() {
    if (window.appState?.router) {
      window.appState.router.navigateTo(window.ROUTES?.ALL_ARTISTS || 'artists');
    }
  },

  navigateToAlbum: function(artistName, albumName) {
    if (!artistName || !albumName) {
      this.navigateToHome();
      return;
    }

    const decodedArtist = artistName;
    const decodedAlbum = albumName;

    if (window.appState?.router && window.music) {
      const artistData = window.music.find(a => a.artist === decodedArtist);
      if (artistData && window.pageManager?.loadArtistPage) {
        window.pageManager.loadArtistPage(artistData, decodedAlbum);
      } else {
        this.navigateToHome();
      }
    }
  },

  navigateToPlaylist: function(playlistId) {
    if (!playlistId) {
      this.navigateToHome();
      return;
    }

    if (window.playlists) {
      window.playlists.show(playlistId);
    }
  },

  navigateToFavorites: function(type) {
    const favoriteType = type || 'songs';
    if (window.pageManager) {
      const handlers = {
        'songs': () => { window.pageManager.showFavoriteSongs(); },
        'artists': () => { window.pageManager.showFavoriteArtists(); },
        'albums': () => { window.pageManager.showFavoriteAlbums?.(); },
      };
      const handler = handlers[favoriteType];
      if (handler) handler();
    }
  },

  navigateToSearch: function(query) {
    if (window.appState?.router && query) {
      const decodedQuery = query;
      window.appState.router.openSearchDialog?.(decodedQuery);
    }
  }
};