export const deepLinkRouter = {
  encodeName(name) {
    return String(name).trim().replace(/\s+/g, '.');
  },

  decodeName(segment) {
    return String(segment).replace(/\./g, ' ');
  },

  parseCurrentPath() {
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

  resolveRoute(pathInfo) {
    const { route, params } = pathInfo;
    const router = window.MyTunesApp?.state?.router;

    if (!router) {
      console.warn('Router not initialized yet, cannot resolve route');
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
    const router = window.MyTunesApp?.state?.router;
    if (router) {
      router.navigateTo(window.ROUTES?.HOME || '/');
    }
  },

  navigateToArtist(artistName) {
    if (!artistName) {
      this.navigateToHome();
      return;
    }
    const router = window.MyTunesApp?.state?.router;
    if (router) {
      router.navigateTo(
        window.ROUTES?.ARTIST || 'artist',
        { artist: artistName }
      );
    }
  },

  navigateToAllArtists() {
    const router = window.MyTunesApp?.state?.router;
    if (router) {
      router.navigateTo(window.ROUTES?.ALL_ARTISTS || 'artists');
    }
  },

  navigateToAlbum(artistName, albumName) {
    if (!artistName || !albumName) {
      this.navigateToHome();
      return;
    }

    const { state, music, navigation } = window.MyTunesApp;

    if (state?.router && music) {
      const artistData = music.find(a => a.artist === artistName);
      if (artistData && navigation?.pages?.loadArtistPage) {
        navigation.pages.loadArtistPage(artistData, albumName);
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
    const playlists = window.MyTunesApp?.playlists;
    if (playlists) {
      playlists.show(playlistId);
    }
  },

  navigateToFavorites(type) {
    const favoriteType = type || 'songs';
    const views = window.MyTunesApp?.views;

    if (views) {
      const handlers = {
        'songs': () => views.showFavoriteSongs(),
        'artists': () => views.showFavoriteArtists(),
        'albums': () => views.showFavoriteAlbums?.(),
      };

      const handler = handlers[favoriteType];
      if (handler) handler();
    }
  },

  navigateToSearch(query) {
    const router = window.MyTunesApp?.state?.router;
    if (router && query) {
      router.openSearchDialog?.(query);
    }
  },

  initialize() {
    if (window.deepLinkHandled) return;
    window.deepLinkHandled = true;

    const pathInfo = this.parseCurrentPath();

    if (pathInfo.fullPath !== '/' && pathInfo.route && pathInfo.route !== 'home') {
      console.log('Deep link detected:', pathInfo);

      const checkInitialized = setInterval(() => {
        const app = window.MyTunesApp;
        if (app?.state?.router && app?.music && app?.navigation) {
          clearInterval(checkInitialized);

          setTimeout(() => {
            this.resolveRoute(pathInfo);
          }, 100);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInitialized);
        if (!window.MyTunesApp?.state?.router) {
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