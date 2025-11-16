import { appState, notifications, musicPlayer, utils, overlays, playlists } from "../global.js";
import { IDS, ROUTES, NOTIFICATION_TYPES, $byId } from "../map.js";
import { pageUpdates } from "./updates.js";
import { render } from "../utilities/templates.js";
import { BentoCards } from "../components/bentoCards.js";

const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

export const escapeForAttribute = function (str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const viewContext = {
  type: "home",
  artist: null,
  album: null,
  playlist: null,
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
  activeOptions: null,

  defaultOptions: {
    showBar: true,
    showSpinner: true,
    blurContent: true,
    message: "Loading...",
  },

  pacing: {
    minActiveMs: 800,
    maxActiveMs: 1500,
    completionLingerMs: 300,
  },

  init() {
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
      pageLoader.contentContainer =
        document.querySelector("#dynamic-content") ||
        document.querySelector("#main-content") ||
        document.querySelector("main") ||
        document.body;

      if (pageLoader.contentContainer && !pageLoader.contentContainer.classList.contains("content-blur-container")) {
        pageLoader.contentContainer.classList.add("content-blur-container");
      }
    }
  },

  start(options = {}) {
    pageLoader.init();
    pageLoader.clearTimers();
    pageLoader.isActive = true;
    pageLoader.progress = 0;
    pageLoader.startedAt = Date.now();

    pageLoader.activeOptions = { ...pageLoader.defaultOptions, ...options };
    const { showBar, showSpinner, blurContent, message } = pageLoader.activeOptions;

    if (pageLoader.loadingText) {
      pageLoader.loadingText.textContent = message;
    }

    const bar = pageLoader.bar;
    if (bar) {
      bar.classList.remove("complete");
      bar.style.transform = "scaleX(0)";
      bar.style.opacity = "0";
    }

    if (showSpinner && pageLoader.centerOverlay) {
      pageLoader.centerOverlay.classList.add("active");
    } else if (pageLoader.centerOverlay) {
      pageLoader.centerOverlay.classList.remove("active");
    }

    if (pageLoader.contentContainer) {
      if (blurContent) {
        pageLoader.contentContainer.classList.add("blur-active");
      } else {
        pageLoader.contentContainer.classList.remove("blur-active");
      }
    }

    if (showBar && bar) {
      setTimeout(() => {
        bar.classList.add("active");
        bar.style.opacity = "1";
        bar.style.transform = "scaleX(0.1)";
        pageLoader.animateProgressBar();
      }, 50);
    }
  },

  animateProgressBar() {
    if (!pageLoader.isActive || pageLoader.activeOptions?.showBar === false || !pageLoader.bar) return;

    const intervals = [
      { duration: 200, progress: 0.1 },
      { duration: 200, progress: 0.25 },
      { duration: 400, progress: 0.5 },
      { duration: 400, progress: 0.7 },
      { duration: 800, progress: 0.9 },
    ];

    let currentProgress = 0.1;

    intervals.forEach((interval, index) => {
      const timer = setTimeout(() => {
        if (!pageLoader.isActive || pageLoader.activeOptions?.showBar === false) return;

        currentProgress = interval.progress;
        pageLoader.progress = currentProgress;
        pageLoader.bar.style.transform = `scaleX(${currentProgress})`;

        if (index === intervals.length - 1) {
          pageLoader.startFinalCrawl();
        }
      }, interval.duration);

      pageLoader.timers.push(timer);
    });
  },

  startFinalCrawl() {
    if (!pageLoader.isActive || pageLoader.activeOptions?.showBar === false || !pageLoader.bar) return;

    const crawlDuration = 2000 + Math.random() * 1000;
    const startTime = Date.now();

    const crawl = () => {
      if (!pageLoader.isActive || pageLoader.activeOptions?.showBar === false) return;

      const elapsed = Date.now() - startTime;
      const progress = 0.9 + 0.09 * (elapsed / crawlDuration);

      if (progress < 0.99) {
        pageLoader.progress = progress;
        pageLoader.bar.style.transform = `scaleX(${progress})`;
        const timer = setTimeout(crawl, 50);
        pageLoader.timers.push(timer);
      }
    };

    const timer = setTimeout(crawl, 50);
    pageLoader.timers.push(timer);
  },

  complete() {
    if (!pageLoader.isActive) {
      return Promise.resolve();
    }

    const elapsed = Date.now() - pageLoader.startedAt;
    const minDuration = pageLoader.pacing.minActiveMs;
    const waitTime = Math.max(0, minDuration - elapsed);

    return new Promise((resolve) => {
      const finalize = () => {
        if (pageLoader.activeOptions?.showBar !== false && pageLoader.bar) {
          pageLoader.bar.style.transform = "scaleX(1)";
          pageLoader.bar.classList.add("complete");
        }

        if (pageLoader.contentContainer && pageLoader.activeOptions?.blurContent !== false) {
          pageLoader.contentContainer.classList.remove("blur-active");
        }

        const spinnerTimer = setTimeout(() => {
          if (pageLoader.activeOptions?.showSpinner !== false && pageLoader.centerOverlay) {
            pageLoader.centerOverlay.classList.remove("active");
          }
        }, 100);
        pageLoader.timers.push(spinnerTimer);

        const cleanupTimer = setTimeout(() => {
          if (pageLoader.bar) {
            pageLoader.bar.classList.remove("active", "complete");
            pageLoader.bar.style.opacity = "0";
            pageLoader.bar.style.transform = "scaleX(0)";
          }
          pageLoader.isActive = false;
          pageLoader.clearTimers();
          pageLoader.activeOptions = null;

          if (pageLoader.loadingText) {
            pageLoader.loadingText.textContent = "Loading...";
          }
          resolve();
        }, pageLoader.pacing.completionLingerMs);
        pageLoader.timers.push(cleanupTimer);
      };

      if (waitTime > 0) {
        const timer = setTimeout(finalize, waitTime);
        pageLoader.timers.push(timer);
      } else {
        finalize();
      }
    });
  },

  hide() {
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

    pageLoader.activeOptions = null;
  },

  clearTimers() {
    pageLoader.timers.forEach((timer) => clearTimeout(timer));
    pageLoader.timers = [];
  },

  setPacing(options) {
    Object.assign(pageLoader.pacing, options);
  },

  setMessage(message) {
    if (pageLoader.loadingText) {
      pageLoader.loadingText.textContent = message;
    }
  },

  async wrapAsync(task, options = {}) {
    pageLoader.start(options);
    try {
      return await task();
    } catch (error) {
      console.error("PageLoader task failed", error);
      throw error;
    } finally {
      await pageLoader.complete();
    }
  },
};

export const PageLoader = pageLoader;

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const renderingHelpers = {
  getDynamicContent() {
    return $byId(IDS.dynamicContent);
  },

  renderViewShell(config) {
    const container = renderingHelpers.getDynamicContent();
    if (!container) return null;
    container.innerHTML = render.viewShell(config);
    return container.querySelector("[data-view-grid]");
  },

  renderHeroSection(config) {
    if (!config) return "";
    const statsHtml = ensureArray(config.stats)
      .map((stat) => {
        if (!stat?.label) return "";
        return `
          <div class="view-hero-stat">
            <p class="view-hero-stat-value">${escapeForAttribute(stat.value ?? "")}</p>
            <p class="view-hero-stat-label">${escapeForAttribute(stat.label)}</p>
          </div>
        `;
      })
      .join("");

    const actionsHtml = ensureArray(config.actions)
      .map((action) => {
        if (!action?.label || !action?.action) return "";
        const variant = action.variant || "solid";
        return `<button type="button" class="view-hero-btn view-hero-btn--${variant}" data-section-action="${escapeForAttribute(
          action.action
        )}">${escapeForAttribute(action.label)}</button>`;
      })
      .join("");

    return `
      <div class="view-hero" data-section-id="${escapeForAttribute(config.id || "view-hero")}">
        <div class="view-hero-cover">
          <img src="${escapeForAttribute(config.cover)}" alt="${escapeForAttribute(config.title)}" loading="lazy"/>
        </div>
        <div class="view-hero-body">
          ${config.kicker ? `<p class="view-hero-eyebrow">${escapeForAttribute(config.kicker)}</p>` : ""}
          <h2 class="view-hero-title">${escapeForAttribute(config.title)}</h2>
          ${config.subtitle ? `<p class="view-hero-subtitle">${escapeForAttribute(config.subtitle)}</p>` : ""}
          ${statsHtml ? `<div class="view-hero-stats">${statsHtml}</div>` : ""}
          ${actionsHtml ? `<div class="view-hero-actions">${actionsHtml}</div>` : ""}
        </div>
      </div>
    `;
  },

  renderSection(sectionConfig = {}) {
    if (!sectionConfig.id) return "";
    const hasCards = Boolean(sectionConfig.cardsHtml);
    const content = hasCards
      ? sectionConfig.cardsHtml
      : sectionConfig.emptyState || renderingHelpers.renderEmptyState(sectionConfig.emptyConfig);

    return `
      <div class="view-section" data-section-id="${escapeForAttribute(sectionConfig.id)}">
        <div class="view-section-header">
          <div>
            <h2>${escapeForAttribute(sectionConfig.title || "")}</h2>
            ${sectionConfig.description ? `<p class="view-section-description">${escapeForAttribute(sectionConfig.description)}</p>` : ""}
          </div>
          ${sectionConfig.action ? `<div class="view-section-actions"><button type="button" data-section-action="${escapeForAttribute(
            sectionConfig.action.action
          )}">${escapeForAttribute(sectionConfig.action.label)}</button></div>` : ""}
        </div>
        <div class="bento-grid">
          ${content}
        </div>
      </div>
    `;
  },

  renderEmptyState(config = {}) {
    if (!config.title && !config.message) return "";
    return `
      <div class="view-section-empty">
        ${config.title ? `<h3>${escapeForAttribute(config.title)}</h3>` : ""}
        ${config.message ? `<p>${escapeForAttribute(config.message)}</p>` : ""}
        ${config.action ? `<button type="button" data-section-action="${escapeForAttribute(config.action.action)}">${escapeForAttribute(
          config.action.label
        )}</button>` : ""}
      </div>
    `;
  },

  buildSongCards(songs = []) {
    const cards = songs.map((song, index) => ({
      type: "song",
      data: {
        title: song.title,
        album: song.album,
        artist: song.artist,
        duration: song.duration || "0:00",
        cover: song.cover,
        trackNumber: song.trackNumber ?? index + 1,
        payload: song,
      },
    }));
    return BentoCards.renderCollection(cards);
  },

  buildAlbumCards(albums = []) {
    const cards = albums.map((album) => ({
      type: "album",
      data: {
        title: album.album,
        artist: album.artist,
        year: album.year || "—",
        songCount: ensureArray(album.songs).length,
        cover: album.cover || utils.getAlbumImageUrl(album.album),
        payload: album,
      },
    }));
    return BentoCards.renderCollection(cards);
  },

  buildArtistCards(artists = []) {
    const cards = artists.map((artist) => ({
      type: "artist",
      data: {
        name: artist.artist,
        genre: artist.genre || "Various",
        statLine: `${ensureArray(artist.albums).length} albums`,
        cover: artist.cover || utils.getArtistImageUrl(artist.artist),
        payload: { artist: artist.artist },
      },
    }));
    return BentoCards.renderCollection(cards);
  },

  buildPlaylistSongCards(playlist) {
    const songs = ensureArray(playlist?.songs).map((song, index) => ({
      ...song,
      cover: song.cover || utils.getAlbumImageUrl(song.album),
      trackNumber: index + 1,
    }));
    return renderingHelpers.buildSongCards(songs);
  },

  findArtist(name) {
    if (!name || !window.music) return null;
    return window.music.find((artist) => artist.artist.toLowerCase() === name.toLowerCase()) || null;
  },

  findAlbum(artistInput, albumName) {
    if (!artistInput || !albumName) return null;
    const artistData = typeof artistInput === "string" ? renderingHelpers.findArtist(artistInput) : artistInput;
    if (!artistData) return null;
    const album = ensureArray(artistData.albums).find((entry) => entry.album.toLowerCase() === albumName.toLowerCase());
    if (!album) return null;
    return { artist: artistData, album };
  },

  collectArtistSongs(artistData) {
    if (!artistData) return [];
    const songs = [];
    ensureArray(artistData.albums).forEach((album) => {
      ensureArray(album.songs).forEach((song) => {
        songs.push({
          ...song,
          artist: artistData.artist,
          album: album.album,
          cover: song.cover || utils.getAlbumImageUrl(album.album),
        });
      });
    });
    return songs;
  },
};

export const navigation = {
  viewContext,

  initialize() {
    PageLoader.init();
    appState.router = navigation.createRouter();

    window.addEventListener("popstate", (event) => {
      const state = event.state;
      if (state?.routeName) {
        appState.router.executeRoute(state.routeName, state.params || {}, { skipHistory: true });
      } else {
        appState.router.handleRoute(window.location.pathname, { replaceState: true });
      }
    });

    appState.router.handleInitialRoute();
  },

  createRouter() {
    const router = {
      routes: {},

      encodeName(name = "") {
        return name.trim().replace(/\s+/g, ".");
      },

      decodeName(segment = "") {
        return segment.replace(/\./g, " ");
      },

      buildUrl(routeName, params = {}) {
        switch (routeName) {
          case ROUTES.HOME:
            return "/";
          case ROUTES.ARTIST:
            return `/artist/${router.encodeName(params.artist || "")}`;
          case ROUTES.ALL_ARTISTS:
            return "/artists";
          case ROUTES.ALBUM:
            return `/album/${router.encodeName(params.artist || "")}/${router.encodeName(params.album || "")}`;
          case ROUTES.PLAYLIST:
            return `/playlist/${params.playlistId || ""}`;
          default:
            return "/";
        }
      },

      handleInitialRoute() {
        const match = this.matchPath(window.location.pathname) || { routeName: ROUTES.HOME, params: {} };
        window.history.replaceState(match, "", window.location.pathname);
        this.executeRoute(match.routeName, match.params, { skipHistory: true });
      },

      matchPath(path) {
        const normalized = path.split("?")[0];
        for (const key in this.routes) {
          const route = this.routes[key];
          const match = normalized.match(route.pattern);
          if (match) {
            const params = route.parse ? route.parse(match) : {};
            return { routeName: key, params };
          }
        }
        return null;
      },

      handleRoute(path, options = {}) {
        const match = this.matchPath(path) || { routeName: ROUTES.HOME, params: {} };
        if (options.replaceState) {
          window.history.replaceState(match, "", path);
        }
        this.executeRoute(match.routeName, match.params, { skipHistory: true });
      },

      executeRoute(routeName, params = {}, options = {}) {
        const route = this.routes[routeName];
        if (route && typeof route.handler === "function") {
          route.handler(params, options);
        } else {
          navigation.pages.loadHomePage();
        }
      },

      navigateTo(routeName, params = {}, options = {}) {
        if (!navigation.isValidRoute(routeName, params)) {
          this.executeRoute(ROUTES.HOME, {});
          return;
        }

        const url = this.buildUrl(routeName, params);
        const state = { routeName, params };
        if (options.replace) {
          window.history.replaceState(state, "", url);
        } else {
          window.history.pushState(state, "", url);
        }
        this.executeRoute(routeName, params, { skipHistory: true });
      },

      navigateToArtist(artistName) {
        this.navigateTo(ROUTES.ARTIST, { artist: artistName });
      },

      openSearchDialog() {
        notifications.show("Search functionality coming soon");
      },

      closeSearchDialog() {},
    };

    router.routes = {
      [ROUTES.HOME]: {
        pattern: /^\/$/,
        handler: navigation.pages.loadHomePage,
      },
      [ROUTES.ARTIST]: {
        pattern: /^\/artist\/([^/]+)$/,
        parse: (match) => ({ artist: router.decodeName(match[1]) }),
        handler: ({ artist }) => navigation.pages.loadArtistPage(artist),
      },
      [ROUTES.ALL_ARTISTS]: {
        pattern: /^\/artists$/,
        handler: navigation.pages.loadAllArtistsPage,
      },
      [ROUTES.ALBUM]: {
        pattern: /^\/album\/([^/]+)\/([^/]+)$/,
        parse: (match) => ({ artist: router.decodeName(match[1]), album: router.decodeName(match[2]) }),
        handler: ({ artist, album }) => navigation.pages.loadAlbumPage({ artist, album }),
      },
      [ROUTES.PLAYLIST]: {
        pattern: /^\/playlist\/([^/]+)$/,
        parse: (match) => ({ playlistId: match[1] }),
        handler: ({ playlistId }) => navigation.pages.loadPlaylistPage(playlistId),
      },
    };

    return router;
  },

  isValidRoute(routeName, params = {}) {
    switch (routeName) {
      case ROUTES.HOME:
      case ROUTES.ALL_ARTISTS:
        return true;
      case ROUTES.ARTIST:
        return Boolean(params.artist && renderingHelpers.findArtist(params.artist));
      case ROUTES.ALBUM: {
        if (!params.artist || !params.album) return false;
        return Boolean(renderingHelpers.findAlbum(params.artist, params.album));
      }
      case ROUTES.PLAYLIST:
        return Boolean(params.playlistId && appState.playlists.find((pl) => pl.id === params.playlistId));
      default:
        return false;
    }
  },

  pages: {
    async loadHomePage() {
      viewContext.type = "home";
      viewContext.artist = null;
      viewContext.album = null;
      viewContext.playlist = null;

      await PageLoader.wrapAsync(async () => {
        if (!appState.homePageManager) return;
        await delay(50);
        appState.homePageManager.renderHomePage();

        pageUpdates.breadCrumbs(
          [
            {
              text: "Home",
              route: ROUTES.HOME,
              active: true,
              isHome: true,
              icon:
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path class="fa-secondary" d="M80 202.9L80 448c0 26.5 21.5 48 48 48l80 0 0-168c0-13.3 10.7-24 24-24l112 0c13.3 0 24 10.7 24 24l0 168 80 0c26.5 0 48-21.5 48-48l0-245.1L288 18.7 80 202.9z"/><path class="fa-primary" d="M293.3 2c-3-2.7-7.6-2.7-10.6 0L2.7 250c-3.3 2.9-3.6 8-.7 11.3s8 3.6 11.3 .7L64 217.1 64 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-230.9L562.7 262c3.3 2.9 8.4 2.6 11.3-.7s2.6-8.4-.7-11.3L293.3 2zM80 448l0-245.1L288 18.7 496 202.9 496 448c0 26.5-21.5 48-48 48l-80 0 0-168c0-13.3-10.7-24-24-24l-112 0c-13.3 0 24 10.7 24 24l0 168-80 0c-26.5 0-48-21.5-48-48zm144 48l0-168c0-4.4 3.6-8 8-8l112 0c4.4 0 8 3.6 8 8l0 168-128 0z"/></svg>',
            },
          ],
          {
            showIcons: true,
            truncateAfter: 3,
            animateChanges: true,
            schemaMarkup: true,
          }
        );

        utils.scrollToTop();
      }, { message: "Loading Music..." });
    },

    async loadArtistPage(artistInput, targetAlbumName = null) {
      const artistData = typeof artistInput === "string" ? renderingHelpers.findArtist(artistInput) : artistInput;
      if (!artistData) {
        appState.router?.navigateTo(ROUTES.HOME, {}, { replace: true });
        return;
      }

      viewContext.type = "artist";
      viewContext.artist = artistData;
      viewContext.album = null;
      viewContext.playlist = null;

      await PageLoader.wrapAsync(async () => {
        await delay(75);
        const root = navigation.rendering.renderArtistView(artistData, targetAlbumName);
        navigation.events.bindViewInteractions(root, { ...viewContext, targetAlbumName });

        pageUpdates.breadCrumbs(
          [
            {
              text: "Home",
              route: ROUTES.HOME,
              active: false,
              isHome: true,
            },
            {
              text: artistData.artist,
              route: ROUTES.ARTIST,
              artist: artistData.artist,
              active: true,
            },
          ],
          { showIcons: true, truncateAfter: 3, animateChanges: true, schemaMarkup: true }
        );

        utils.scrollToTop();
      }, { message: "Finding Artist..." });
    },

    async loadAllArtistsPage() {
      viewContext.type = "artists";
      viewContext.artist = null;
      viewContext.album = null;
      viewContext.playlist = null;

      await PageLoader.wrapAsync(async () => {
        await delay(75);
        const root = navigation.rendering.renderAllArtistsPage();
        navigation.events.bindViewInteractions(root, { ...viewContext });

        pageUpdates.breadCrumbs([
          { text: "Home", route: ROUTES.HOME, active: false, isHome: true },
          { text: "All Artists", route: ROUTES.ALL_ARTISTS, active: true },
        ]);

        utils.scrollToTop();
      }, { message: "Loading library..." });
    },

    async loadAlbumPage(params = {}) {
      const found = renderingHelpers.findAlbum(params.artist, params.album);
      if (!found) {
        appState.router?.navigateTo(ROUTES.HOME, {}, { replace: true });
        return;
      }

      const { artist, album } = found;
      viewContext.type = "album";
      viewContext.artist = artist;
      viewContext.album = album;
      viewContext.playlist = null;

      await PageLoader.wrapAsync(async () => {
        await delay(75);
        const root = navigation.rendering.renderAlbumPage(artist, album);
        navigation.events.bindViewInteractions(root, { ...viewContext });

        pageUpdates.breadCrumbs([
          { text: "Home", route: ROUTES.HOME, active: false, isHome: true },
          { text: artist.artist, route: ROUTES.ARTIST, artist: artist.artist, active: false },
          { text: album.album, route: ROUTES.ALBUM, artist: artist.artist, album: album.album, active: true },
        ]);

        utils.scrollToTop();
      }, { message: "Opening album..." });
    },

    async loadPlaylistPage(playlistId) {
      const playlist = appState.playlists.find((pl) => pl.id === playlistId);
      if (!playlist) {
        notifications.notify({ type: NOTIFICATION_TYPES.ERROR, message: "Playlist not found" });
        appState.router?.navigateTo(ROUTES.HOME, {}, { replace: true });
        return;
      }

      viewContext.type = "playlist";
      viewContext.artist = null;
      viewContext.album = null;
      viewContext.playlist = playlist;

      await PageLoader.wrapAsync(async () => {
        await delay(50);
        const root = navigation.rendering.renderPlaylistPage(playlist);
        navigation.events.bindViewInteractions(root, { ...viewContext });

        pageUpdates.breadCrumbs([
          { text: "Home", route: ROUTES.HOME, active: false, isHome: true },
          { text: "Playlists", onClick: () => appState.router?.navigateTo(ROUTES.HOME), active: false },
          { text: playlist.name, active: true },
        ]);

        utils.scrollToTop();
      }, { message: "Loading playlist..." });
    },
  },

  rendering: {
    renderArtistView(artistData, targetAlbumName = null) {
      const grid = renderingHelpers.renderViewShell({
        viewId: "artist-view",
        accentLabel: "Artist",
        title: artistData.artist,
        subtitle: `${artistData.genre || "Across genres"} • ${ensureArray(artistData.albums).length} albums • ${utils.getTotalSongs(
          artistData
        )} songs`,
        actions: [
          { label: "Play", action: "artist-play" },
          { label: "Shuffle", action: "artist-shuffle" },
          { label: "Favorite", action: "artist-favorite" },
        ],
      });
      if (!grid) return null;

      const songs = renderingHelpers.collectArtistSongs(artistData).slice(0, 6);
      const albums = ensureArray(artistData.albums).map((album) => ({
        ...album,
        artist: artistData.artist,
        cover: album.cover || utils.getAlbumImageUrl(album.album),
      }));

      if (targetAlbumName) {
        albums.sort((a, b) => {
          if (a.album === targetAlbumName) return -1;
          if (b.album === targetAlbumName) return 1;
          return 0;
        });
      }

      const similarNames = ensureArray(utils.getSimilarArtists?.(artistData.artist, { limit: 8 }))
        .filter(Boolean)
        .map((name) => renderingHelpers.findArtist(name) || { artist: name, albums: [], genre: "" })
        .slice(0, 6)
        .map((artist) => ({ ...artist, cover: utils.getArtistImageUrl(artist.artist) }));

      const heroHtml = renderingHelpers.renderHeroSection({
        id: "artist-hero",
        kicker: "Artist",
        cover: utils.getArtistImageUrl(artistData.artist),
        title: artistData.artist,
        subtitle: `${artistData.genre || ""} • Since ${ensureArray(artistData.albums)[0]?.year || "—"}`,
        stats: [
          { label: "Albums", value: ensureArray(artistData.albums).length },
          { label: "Tracks", value: utils.getTotalSongs(artistData) },
          { label: "Favorites", value: appState.favorites.artists.has(artistData.artist) ? "★" : "—" },
        ],
        actions: [
          { label: "Play Artist", action: "artist-play", variant: "solid" },
          { label: "Add to Queue", action: "artist-queue", variant: "ghost" },
        ],
      });

      const sections = [
        heroHtml,
        renderingHelpers.renderSection({
          id: "artist-top-songs",
          title: "Popular songs",
          description: "Handpicked essentials for an instant vibe.",
          cardsHtml: songs.length ? renderingHelpers.buildSongCards(songs) : "",
          emptyConfig: { title: "No songs yet", message: "This artist needs songs added to the catalog." },
        }),
        renderingHelpers.renderSection({
          id: "artist-albums",
          title: "Albums",
          description: "Dive deeper into full-length releases.",
          cardsHtml: albums.length ? renderingHelpers.buildAlbumCards(albums) : "",
          emptyConfig: { title: "No albums", message: "Albums for this artist will show up here." },
        }),
        renderingHelpers.renderSection({
          id: "artist-similar",
          title: "Fans also like",
          description: "Neighbors across your sonic universe.",
          cardsHtml: similarNames.length ? renderingHelpers.buildArtistCards(similarNames) : "",
          emptyConfig: { title: "No recommendations", message: "Add more artists to unlock smarter recs." },
        }),
      ].filter(Boolean);

      grid.innerHTML = sections.join("");
      return grid.closest("#" + IDS.dynamicContent) || grid;
    },

    renderAllArtistsPage() {
      const grid = renderingHelpers.renderViewShell({
        viewId: "all-artists-view",
        accentLabel: "Browse",
        title: "All artists",
        subtitle: "Every artist in your library, unified in one adaptive grid.",
        actions: [{ label: "Back to Home", action: "go-home" }],
      });
      if (!grid) return null;

      const artists = ensureArray(window.music).map((artist) => ({
        ...artist,
        cover: utils.getArtistImageUrl(artist.artist),
      }));

      const cardsHtml = artists.length
        ? renderingHelpers.buildArtistCards(artists)
        : renderingHelpers.renderEmptyState({ title: "No artists", message: "Import music to get started." });

      grid.innerHTML = renderingHelpers.renderSection({
        id: "all-artists-grid",
        title: "Artists",
        description: "Tap any card to jump into their discography.",
        cardsHtml,
      });

      return grid.closest("#" + IDS.dynamicContent) || grid;
    },

    renderAlbumPage(artistData, album) {
      const grid = renderingHelpers.renderViewShell({
        viewId: "album-view",
        accentLabel: "Album",
        title: album.album,
        subtitle: `${artistData.artist} • ${album.year || "Unknown"} • ${ensureArray(album.songs).length} songs`,
        actions: [
          { label: "Play", action: "album-play" },
          { label: "Queue", action: "album-queue" },
          { label: "Favorite", action: "album-favorite" },
        ],
      });
      if (!grid) return null;

      const enrichedSongs = ensureArray(album.songs).map((song, index) => ({
        ...song,
        artist: artistData.artist,
        album: album.album,
        cover: song.cover || utils.getAlbumImageUrl(album.album),
        trackNumber: index + 1,
      }));

      const heroHtml = renderingHelpers.renderHeroSection({
        id: "album-hero",
        kicker: artistData.artist,
        cover: utils.getAlbumImageUrl(album.album),
        title: album.album,
        subtitle: `${album.year || "Unknown release"} • ${enrichedSongs.length} tracks`,
        stats: [
          { label: "Duration", value: utils.getAlbumDuration?.(album) || "—" },
          { label: "Favorites", value: appState.favorites.albums.has(album.album) ? "★" : "—" },
        ],
        actions: [
          { label: "Play Album", action: "album-play", variant: "solid" },
          { label: "Add to Queue", action: "album-queue", variant: "ghost" },
        ],
      });

      const moreAlbums = ensureArray(artistData.albums)
        .filter((item) => item.album !== album.album)
        .map((item) => ({ ...item, artist: artistData.artist, cover: utils.getAlbumImageUrl(item.album) }))
        .slice(0, 6);

      const sections = [
        heroHtml,
        renderingHelpers.renderSection({
          id: "album-tracklist",
          title: "Tracklist",
          description: "Tap any song to start playing instantly.",
          cardsHtml: enrichedSongs.length ? renderingHelpers.buildSongCards(enrichedSongs) : "",
          emptyConfig: { title: "No tracks", message: "This album has no songs yet." },
        }),
        moreAlbums.length
          ? renderingHelpers.renderSection({
              id: "album-more-from",
              title: `More from ${artistData.artist}`,
              description: "Continue exploring the discography.",
              cardsHtml: renderingHelpers.buildAlbumCards(moreAlbums),
            })
          : "",
      ].filter(Boolean);

      grid.innerHTML = sections.join("");
      return grid.closest("#" + IDS.dynamicContent) || grid;
    },

    renderPlaylistPage(playlist) {
      const cover = playlist.songs[0]?.cover || utils.getDefaultAlbumImage?.() || utils.getAlbumImageUrl(playlist.songs[0]?.album);
      const grid = renderingHelpers.renderViewShell({
        viewId: "playlist-view",
        accentLabel: "Playlist",
        title: playlist.name,
        subtitle: `${playlist.songs.length} songs • Created ${new Date(playlist.created || Date.now()).toLocaleDateString()}`,
        actions: [
          { label: "Play", action: "playlist-play" },
          { label: "Add Songs", action: "playlist-browse" },
          { label: "Delete", action: "playlist-delete" },
        ],
      });
      if (!grid) return null;

      const heroHtml = renderingHelpers.renderHeroSection({
        id: "playlist-hero",
        kicker: "Your playlist",
        cover,
        title: playlist.name,
        subtitle: `${playlist.songs.length} tracks curated by you`,
        stats: [
          { label: "Songs", value: playlist.songs.length },
          { label: "Created", value: new Date(playlist.created || Date.now()).toLocaleDateString() },
        ],
        actions: [
          { label: "Play playlist", action: "playlist-play", variant: "solid" },
          { label: "Queue all", action: "playlist-queue", variant: "ghost" },
        ],
      });

      const hasSongs = playlist.songs.length > 0;
      const sections = [
        heroHtml,
        renderingHelpers.renderSection({
          id: "playlist-songs",
          title: "Songs",
          description: hasSongs ? "Tap a card to play or open actions for more." : "", 
          cardsHtml: hasSongs ? renderingHelpers.buildPlaylistSongCards(playlist) : "",
          emptyConfig: {
            title: "No songs",
            message: "Add tracks to this playlist to start listening.",
            action: { label: "Browse music", action: "playlist-browse" },
          },
        }),
      ];

      grid.innerHTML = sections.join("");
      return grid.closest("#" + IDS.dynamicContent) || grid;
    },
  },

  events: {
    bindViewInteractions(root, context) {
      if (!root) return;
      const container = root.closest("#" + IDS.dynamicContent) || root;
      if (!container) return;

      if (container._viewInteractionHandler) {
        container.removeEventListener("click", container._viewInteractionHandler);
      }

      const handler = (event) => {
        const sectionAction = event.target.closest("[data-section-action]");
        if (sectionAction) {
          event.preventDefault();
          navigation.events.handleSectionAction(sectionAction.dataset.sectionAction, context);
          return;
        }

        const actionButton = event.target.closest("[data-action]");
        if (actionButton) {
          event.preventDefault();
          const card = actionButton.closest(".bento-card");
          const payload = navigation.events.parseCardPayload(card);
          navigation.actions.handleCardAction(actionButton.dataset.action, payload, context);
          return;
        }

        const card = event.target.closest(".bento-card");
        if (card) {
          const payload = navigation.events.parseCardPayload(card);
          navigation.actions.handleCardTap(card, payload, context);
        }
      };

      container.addEventListener("click", handler);
      container._viewInteractionHandler = handler;
    },

    handleSectionAction(action, context) {
      switch (action) {
        case "go-home":
          appState.router?.navigateTo(ROUTES.HOME);
          break;
        case "artist-play":
          navigation.actions.playArtistSongs(context?.artist);
          break;
        case "artist-shuffle":
          navigation.actions.shuffleArtistSongs(context?.artist);
          break;
        case "artist-favorite":
          if (context?.artist) {
            appState.favorites.toggle("artists", context.artist.artist);
          }
          break;
        case "artist-queue":
          navigation.actions.queueArtistSongs(context?.artist);
          break;
        case "album-play":
          navigation.actions.playAlbumSongs(context?.album, context?.artist?.artist);
          break;
        case "album-queue":
          navigation.actions.queueAlbumSongs(context?.album, context?.artist?.artist);
          break;
        case "album-favorite":
          if (context?.album) {
            appState.favorites.toggle("albums", context.album.album);
          }
          break;
        case "playlist-play":
          navigation.actions.playPlaylist(context?.playlist);
          break;
        case "playlist-queue":
          navigation.actions.queuePlaylist(context?.playlist);
          break;
        case "playlist-delete":
          navigation.actions.deletePlaylist(context?.playlist);
          break;
        case "playlist-browse":
          appState.router?.navigateTo(ROUTES.HOME);
          break;
        default:
          break;
      }
    },

    parseCardPayload(card) {
      if (!card) return null;
      const payloadString = card.dataset.payload;
      if (!payloadString) return null;
      try {
        return JSON.parse(payloadString);
      } catch (error) {
        return null;
      }
    },
  },

  actions: {
    playArtistSongs(artistData) {
      if (!artistData) return;
      const songs = renderingHelpers.collectArtistSongs(artistData);
      if (!songs.length) return;
      appState.queue.clear();
      songs.slice(1).forEach((song) => appState.queue.add(song));
      musicPlayer.ui.playSong(songs[0]);
      notifications.show(`Playing ${artistData.artist}`, NOTIFICATION_TYPES.SUCCESS);
    },

    shuffleArtistSongs(artistData) {
      if (!artistData) return;
      const songs = renderingHelpers.collectArtistSongs(artistData);
      if (!songs.length) return;
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      appState.queue.clear();
      shuffled.slice(1).forEach((song) => appState.queue.add(song));
      musicPlayer.ui.playSong(shuffled[0]);
      notifications.show(`Shuffling ${artistData.artist}`, NOTIFICATION_TYPES.SUCCESS);
    },

    queueArtistSongs(artistData) {
      if (!artistData) return;
      const songs = renderingHelpers.collectArtistSongs(artistData);
      songs.forEach((song) => appState.queue.add(song));
      notifications.show(`Queued ${songs.length} songs from ${artistData.artist}`, NOTIFICATION_TYPES.INFO);
    },

    playAlbumSongs(album, artistName) {
      if (!album || !ensureArray(album.songs).length) return;
      const cover = utils.getAlbumImageUrl(album.album);
      const enriched = ensureArray(album.songs).map((song) => ({
        ...song,
        artist: artistName,
        album: album.album,
        cover,
      }));
      appState.queue.clear();
      enriched.slice(1).forEach((song) => appState.queue.add(song));
      musicPlayer.ui.playSong(enriched[0]);
    },

    queueAlbumSongs(album, artistName) {
      if (!album || !ensureArray(album.songs).length) return;
      ensureArray(album.songs).forEach((song) =>
        appState.queue.add({ ...song, artist: artistName, album: album.album, cover: utils.getAlbumImageUrl(album.album) })
      );
      notifications.show(`Queued ${album.album}`, NOTIFICATION_TYPES.SUCCESS);
    },

    playPlaylist(playlist) {
      if (!playlist || !playlist.songs.length) return;
      appState.queue.clear();
      playlist.songs.slice(1).forEach((song) => appState.queue.add(song));
      musicPlayer.ui.playSong(playlist.songs[0]);
    },

    queuePlaylist(playlist) {
      if (!playlist) return;
      playlist.songs.forEach((song) => appState.queue.add(song));
      notifications.show(`Queued ${playlist.name}`, NOTIFICATION_TYPES.INFO);
    },

    async deletePlaylist(playlist) {
      if (!playlist) return;
      const confirmed = await overlays.dialog.confirm(`Delete ${playlist.name}?`, { okText: "Delete" });
      if (confirmed) {
        await playlists.remove(playlist.id);
        appState.router?.navigateTo(ROUTES.HOME);
      }
    },

    handleCardTap(card, payload, context) {
      const type = card?.dataset.cardType;
      switch (type) {
        case "artist":
          if (payload?.artist) {
            appState.router?.navigateTo(ROUTES.ARTIST, { artist: payload.artist });
          }
          break;
        case "album":
          if (payload?.artist && payload?.album) {
            appState.router?.navigateTo(ROUTES.ALBUM, { artist: payload.artist, album: payload.album });
          }
          break;
        case "playlist":
          if (payload?.id) {
            playlists.show(payload.id);
          }
          break;
        case "song":
          if (payload) {
            musicPlayer.ui.playSong(payload);
          }
          break;
        default:
          break;
      }
    },

    handleCardAction(action, payload, context) {
      switch (action) {
        case "play-artist":
          navigation.actions.playArtistSongs(renderingHelpers.findArtist(payload?.artist || payload?.name));
          break;
        case "view-artist":
          if (payload?.artist) appState.router?.navigateTo(ROUTES.ARTIST, { artist: payload.artist });
          break;
        case "favorite-artist":
          if (payload?.artist) appState.favorites.toggle("artists", payload.artist);
          break;
        case "play-album":
          navigation.actions.playAlbumSongs(payload, payload?.artist);
          break;
        case "view-album":
          if (payload?.artist && payload?.album) appState.router?.navigateTo(ROUTES.ALBUM, { artist: payload.artist, album: payload.album });
          break;
        case "favorite-album":
          if (payload?.album) appState.favorites.toggle("albums", payload.album);
          break;
        case "play-song":
          if (payload) musicPlayer.ui.playSong(payload);
          break;
        case "queue-song":
          if (payload) {
            appState.queue.add(payload);
            notifications.show(`Queued ${payload.title}`, NOTIFICATION_TYPES.SUCCESS);
          }
          break;
        case "favorite-song":
          if (payload?.id) appState.favorites.toggle("songs", payload.id);
          break;
        case "play-playlist":
          navigation.actions.playPlaylist(payload);
          break;
        case "view-playlist":
          if (payload?.id) playlists.show(payload.id);
          break;
        case "favorite-playlist":
          notifications.show("Playlist favorites coming soon", NOTIFICATION_TYPES.INFO);
          break;
        default:
          navigation.actions.handleSongAction(action, payload, context);
          break;
      }
    },

    handleSongAction(action, songData, context) {
      if (!songData) return;
      switch (action) {
        case "favorite":
        case "favorite-song":
          appState.favorites.toggle("songs", songData.id);
          break;
        case "play-next":
          appState.queue.add(songData, 0);
          notifications.show(`"${songData.title}" will play next`, NOTIFICATION_TYPES.SUCCESS);
          break;
        case "add-queue":
        case "queue-song":
          appState.queue.add(songData);
          notifications.show(`Added "${songData.title}" to queue`, NOTIFICATION_TYPES.SUCCESS);
          break;
        case "add-playlist":
          navigation.actions.showPlaylistSelector(songData);
          break;
        case "download":
          notifications.show("Download feature coming soon", NOTIFICATION_TYPES.INFO);
          break;
        case "share":
          navigation.actions.shareSong(songData);
          break;
        case "view-artist":
          appState.router.navigateTo(ROUTES.ARTIST, { artist: songData.artist });
          break;
        default:
          break;
      }
    },

    showPlaylistSelector(songData) {
      if (appState.playlists.length === 0) {
        overlays.dialog
          .confirm("No playlists found. Create a new playlist?", { okText: "Create Playlist", cancelText: "Cancel" })
          .then((confirmed) => {
            if (confirmed) {
              playlists.create().then((playlist) => {
                if (playlist) {
                  playlists.addSong(playlist.id, songData);
                }
              });
            }
          });
        return;
      }

      const playlistOptions = appState.playlists
        .map((playlist) => {
          return `
        <button class="playlist-option" data-playlist-id="${playlist.id}">
          <div class="playlist-icon">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div class="playlist-info">
            <div class="playlist-name">${playlist.name}</div>
            <div class="playlist-count">${playlist.songs.length} songs</div>
          </div>
        </button>
      `;
        })
        .join("");

      const content = `
        <div class="playlist-selector">
          <h3 class="playlist-selector-title">Add to Playlist</h3>
          <div class="playlist-list">
            ${playlistOptions}
          </div>
          <div class="playlist-actions">
            <button class="create-new-playlist">
              <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Create New Playlist
            </button>
            <button class="cancel-playlist-selection">
              Cancel
            </button>
          </div>
        </div>
      `;

      overlays.open("playlist-selector", content, "playlist-selector");

      const modal = document.getElementById("playlist-selector");

      modal.querySelectorAll(".playlist-option").forEach((option) => {
        option.addEventListener("click", () => {
          const playlistId = option.dataset.playlistId;
          playlists.addSong(playlistId, songData);
          overlays.close("playlist-selector");
        });
      });

      modal.querySelector(".create-new-playlist").addEventListener("click", async () => {
        overlays.close("playlist-selector");
        const newPlaylist = await playlists.create();
        if (newPlaylist) {
          playlists.addSong(newPlaylist.id, songData);
        }
      });

      modal.querySelector(".cancel-playlist-selection").addEventListener("click", () => {
        overlays.close("playlist-selector");
      });
    },

    shareSong(songData) {
      if (navigator.share) {
        navigator
          .share({
            title: songData.title,
            text: `Listen to "${songData.title}" by ${songData.artist}`,
            url: window.location.href,
          })
          .catch(() => {
            navigation.actions.fallbackShare(songData);
          });
      } else {
        navigation.actions.fallbackShare(songData);
      }
    },

    fallbackShare() {
      const shareUrl = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            notifications.show("Song link copied to clipboard!", NOTIFICATION_TYPES.SUCCESS);
          })
          .catch(() => {
            notifications.show("Share feature not available", NOTIFICATION_TYPES.WARNING);
          });
      } else {
        notifications.show("Share feature not available", NOTIFICATION_TYPES.WARNING);
      }
    },
  },
};
