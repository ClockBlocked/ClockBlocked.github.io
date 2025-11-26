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

  resolveRoute: function(pathInfo) {
    const { route, params } = pathInfo;

    if (!window.appState?.router) {
      return;
    }

    const routeHandlers = {
      '': function() { this.navigateToHome(); },
      'home': function() { this.navigateToHome(); },
      'artist': function() { this.navigateToArtist(params[0]); },
      'artists': function() { this.navigateToAllArtists(); },
      'album': function() { this.navigateToAlbum(params[0], params[1]); },
      'playlist': function() { this.navigateToPlaylist(params[0]); },
      'favorites': function() { this.navigateToFavorites(params[0]); },
      'search': function() { this.navigateToSearch(params[0]); },
    };

    const handler = routeHandlers[route] || routeHandlers[''];
    return handler.call(this);
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
      if (artistData && window.navigation?.pages?.loadArtistPage) {
        window.navigation.pages.loadArtistPage(artistData, decodedAlbum);
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
    if (window.views) {
      const handlers = {
        'songs': function() { window.views.showFavoriteSongs(); },
        'artists': function() { window.views.showFavoriteArtists(); },
        'albums': function() { window.views.showFavoriteAlbums?.(); },
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
  },

  bindPopState: function() {
    window.addEventListener('popstate', (event) => {
      const pathInfo = this.parseCurrentPath();
      this.resolveRoute(pathInfo);
    });
  },
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

  init: function () {
    if (!pageLoader.bar) {
      const bar = document.createElement("div");
      bar.className = "loading-bar";
      document.body.appendChild(bar);
      pageLoader.bar = bar;
    }

    if (!pageLoader.centerOverlay) {
      const overlay = document.createElement("div");
      overlay.className = "center-loading-overlay";

      const spinner = document.createElement("div");
      spinner.className = "center-loading-spinner";

      const loadingText = document.createElement("div");
      loadingText.className = "center-loading-text";
      loadingText.textContent = "Loading...";

      overlay.appendChild(spinner);
      overlay.appendChild(loadingText);
      document.body.appendChild(overlay);

      pageLoader.centerOverlay = overlay;
      pageLoader.loadingText = loadingText;
    }

    if (!pageLoader.contentContainer) {
      pageLoader.contentContainer = document.querySelector("#dynamic-content") || document.querySelector("#main-content") || document.querySelector("main") || document.body;

      if (pageLoader.contentContainer && !pageLoader.contentContainer.classList.contains("content-blur-container")) {
        pageLoader.contentContainer.classList.add("content-blur-container");
      }
    }
  },

  start: function (options = {}) {
    pageLoader.init();
    pageLoader.clearTimers();
    pageLoader.isActive = true;
    pageLoader.progress = 0;
    pageLoader.startedAt = Date.now();

    const message = options.message || "Loading...";

    if (pageLoader.loadingText) {
      pageLoader.loadingText.textContent = message;
    }

    const bar = pageLoader.bar;
    bar.classList.remove("complete");
    bar.style.transform = "scaleX(0)";
    bar.style.opacity = "0";

    pageLoader.centerOverlay.classList.add("active");

    if (pageLoader.contentContainer) {
      pageLoader.contentContainer.classList.add("blur-active");
    }

    setTimeout(function () {
      bar.classList.add("active");
      bar.style.opacity = "1";
      bar.style.transform = "scaleX(0.1)";
      pageLoader.animateProgressBar();
    }, 50);
  },

  animateProgressBar: function () {
    if (!pageLoader.isActive) return;

    const intervals = [
      { duration: 200, progress: 0.1 },
      { duration: 200, progress: 0.25 },
      { duration: 400, progress: 0.5 },
      { duration: 400, progress: 0.7 },
      { duration: 800, progress: 0.9 },
    ];

    let currentProgress = 0.1;

    intervals.forEach(function (interval, index) {
      const timer = setTimeout(function () {
        if (!pageLoader.isActive) return;

        currentProgress = interval.progress;
        pageLoader.progress = currentProgress;
        pageLoader.bar.style.transform = "scaleX(" + currentProgress + ")";

        if (index === intervals.length - 1) {
          pageLoader.startFinalCrawl();
        }
      }, interval.duration);

      pageLoader.timers.push(timer);
    });
  },

  startFinalCrawl: function () {
    if (!pageLoader.isActive) return;

    const crawlDuration = 2000 + Math.random() * 1000;
    const startTime = Date.now();

    function crawl() {
      if (!pageLoader.isActive) return;

      const elapsed = Date.now() - startTime;
      const progress = 0.9 + 0.09 * (elapsed / crawlDuration);

      if (progress < 0.99) {
        pageLoader.progress = progress;
        pageLoader.bar.style.transform = "scaleX(" + progress + ")";

        const timer = setTimeout(crawl, 50);
        pageLoader.timers.push(timer);
      }
    }

    const timer = setTimeout(crawl, 50);
    pageLoader.timers.push(timer);
  },

  complete: function () {
    if (!pageLoader.isActive || !pageLoader.bar) return;

    const elapsed = Date.now() - pageLoader.startedAt;
    const minDuration = pageLoader.pacing.minActiveMs;
    const waitTime = Math.max(0, minDuration - elapsed);

    function finalize() {
      pageLoader.bar.style.transform = "scaleX(1)";
      pageLoader.bar.classList.add("complete");

      if (pageLoader.contentContainer) {
        pageLoader.contentContainer.classList.remove("blur-active");
      }

      setTimeout(function () {
        pageLoader.centerOverlay.classList.remove("active");
      }, 100);

      setTimeout(function () {
        pageLoader.bar.classList.remove("active", "complete");
        pageLoader.bar.style.opacity = "0";
        pageLoader.isActive = false;
        pageLoader.clearTimers();

        if (pageLoader.loadingText) {
          pageLoader.loadingText.textContent = "Loading...";
        }
      }, pageLoader.pacing.completionLingerMs);
    }

    if (waitTime > 0) {
      const timer = setTimeout(finalize, waitTime);
      pageLoader.timers.push(timer);
    } else {
      finalize();
    }
  },

  hide: function () {
    pageLoader.isActive = false;
    pageLoader.clearTimers();

    if (pageLoader.bar) {
      pageLoader.bar.classList.remove("active", "complete");
      pageLoader.bar.style.opacity = "0";
      pageLoader.bar.style.transform = "scaleX(0)";
    }

    if (pageLoader.centerOverlay) {
      pageLoader.centerOverlay.classList.remove("active");
    }

    if (pageLoader.contentContainer) {
      pageLoader.contentContainer.classList.remove("blur-active");
    }

    if (pageLoader.loadingText) {
      pageLoader.loadingText.textContent = "Loading...";
    }
  },

  clearTimers: function () {
    pageLoader.timers.forEach(function (timer) {
      clearTimeout(timer);
    });
    pageLoader.timers = [];
  },

  setPacing: function (options) {
    Object.assign(pageLoader.pacing, options);
  },

  setMessage: function (message) {
    if (pageLoader.loadingText) {
      pageLoader.loadingText.textContent = message;
    }
  },
};