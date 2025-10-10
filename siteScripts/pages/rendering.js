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

    let currentProgress = 0.1;

    intervals.forEach((interval, index) => {
      const timer = setTimeout(() => {
        if (!pageLoader.isActive) return;
        
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
    if (!pageLoader.isActive) return;

    const crawlDuration = 2000 + Math.random() * 1000;
    const startTime = Date.now();
    
    function crawl() {
      if (!pageLoader.isActive) return;
      
      const elapsed = Date.now() - startTime;
      const progress = 0.9 + (0.09 * (elapsed / crawlDuration));
      
      if (progress < 0.99) {
        pageLoader.progress = progress;
        pageLoader.bar.style.transform = `scaleX(${progress})`;
        
        const timer = setTimeout(crawl, 50);
        pageLoader.timers.push(timer);
      }
    }
    
    const timer = setTimeout(crawl, 50);
    pageLoader.timers.push(timer);
  },

  complete() {
    if (!pageLoader.isActive || !pageLoader.bar) return;

    const elapsed = Date.now() - pageLoader.startedAt;
    const minDuration = pageLoader.pacing.minActiveMs;
    const waitTime = Math.max(0, minDuration - elapsed);

    function finalize() {
      pageLoader.bar.style.transform = 'scaleX(1)';
      pageLoader.bar.classList.add('complete');

      if (pageLoader.contentContainer) {
        pageLoader.contentContainer.classList.remove('blur-active');
      }

      setTimeout(() => {
        pageLoader.centerOverlay.classList.remove('active');
      }, 100);

      setTimeout(() => {
        pageLoader.bar.classList.remove('active', 'complete');
        pageLoader.bar.style.opacity = '0';
        pageLoader.isActive = false;
        pageLoader.clearTimers();
        
        if (pageLoader.loadingText) {
          pageLoader.loadingText.textContent = 'Loading...';
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

  hide() {
    pageLoader.isActive = false;
    pageLoader.clearTimers();
    
    if (pageLoader.bar) {
      pageLoader.bar.classList.remove('active', 'complete');
      pageLoader.bar.style.opacity = '0';
      pageLoader.bar.style.transform = 'scaleX(0)';
    }
    
    if (pageLoader.centerOverlay) {
      pageLoader.centerOverlay.classList.remove('active');
    }
    
    if (pageLoader.contentContainer) {
      pageLoader.contentContainer.classList.remove('blur-active');
    }
    
    if (pageLoader.loadingText) {
      pageLoader.loadingText.textContent = 'Loading...';
    }
  },

  clearTimers() {
    pageLoader.timers.forEach(timer => clearTimeout(timer));
    pageLoader.timers = [];
  },

  setPacing(options) {
    Object.assign(pageLoader.pacing, options);
  },

  setMessage(message) {
    if (pageLoader.loadingText) {
      pageLoader.loadingText.textContent = message;
    }
  }
};

export const navigation = {
  initialize: () => {
    pageLoader.init();
    
    appState.router = navigation.createRouter();
    
    window.addEventListener("popstate", () => {
      appState.router.handleRoute(window.location.pathname + window.location.search);
    });
    
    appState.router.handleInitialRoute();
  },

createRouter: () => {
  const router = {
    // Helper to encode names (spaces to periods)
    encodeName(name) {
      return name.trim().replace(/\s+/g, '.');
    },
    // Helper to decode names (periods to spaces)
    decodeName(segment) {
      return segment.replace(/\./g, ' ');
    },

    routes: {},

    handleInitialRoute: function () {
      const path = window.location.pathname + window.location.search;
      this.handleRoute(path);
    },

    handleRoute: function (path) {
      let matchedRoute = false;
      for (const key in this.routes) {
        const route = this.routes[key];
        const match = path.match(route.pattern);
        if (match) {
          const params = {};
          if (key === ROUTES.ARTIST) params.artist = router.decodeName(match[1]);
          route.handler(params);
          matchedRoute = true;
          break;
        }
      }
      if (!matchedRoute) navigation.pages.loadHomePage();
    },

    navigateTo: function (routeName, params = {}) {
      let url;
      switch (routeName) {
        case ROUTES.HOME: url = "/"; break;
        case ROUTES.ARTIST:
          url = `/artist/${router.encodeName(params.artist)}`;
          break;
        case ROUTES.ALL_ARTISTS: url = "/artists"; break;
        default: url = "/";
      }
      window.history.pushState({}, "", url);
      if (this.routes[routeName]) this.routes[routeName].handler(params);
    },

    navigateToArtist: function (artistName) {
      this.navigateTo(ROUTES.ARTIST, { artist: artistName });
    },

    openSearchDialog: () => {
      notifications.show("Search functionality coming soon");
    },

    closeSearchDialog: () => { }
  };

  // Now define the routes using `router` variable so helpers are always accessible
  router.routes = {
    [ROUTES.HOME]: {
      pattern: /^\/$/,
      handler: navigation.pages.loadHomePage,
    },
    [ROUTES.ARTIST]: {
      pattern: /^\/artist\/(.+)$/,
      handler: (params) => {
        // Use router.decodeName instead of this.decodeName
        const artistName = params.artist || utils.getParameterByName("artist", window.location.href);
        const decodedArtistName = artistName ? router.decodeName(artistName) : '';
        const artistData = window.music?.find(a => a.artist === decodedArtistName);
        if (artistData) {
          navigation.pages.loadArtistPage(artistData);
        } else {
          appState.router.navigateTo(ROUTES.HOME);
        }
      },
    },
    [ROUTES.ALL_ARTISTS]: {
      pattern: /^\/artists$/,
      handler: navigation.pages.loadAllArtistsPage,
    },
  };

  return router;
},



isValidRoute: (routeName, params = {}) => {
  switch (routeName) {
    case ROUTES.HOME:
    case ROUTES.ALL_ARTISTS:
      return true;
      
    case ROUTES.ARTIST:
      if (!params.artist || !window.music) return false;
      return window.music.some(a => a.artist === params.artist);
      
    default:
      return false;
  }
},

  pages: {
    loadHomePage: () => {
      pageLoader.start({ message: "Loading Music..." });
      
      if (appState.homePageManager) {
        const dynamicContent = $byId(IDS.dynamicContent);
        if (dynamicContent) {
          dynamicContent.innerHTML = "";
        }

        setTimeout(() => {
          appState.homePageManager.renderHomePage();
          
          pageUpdates.breadCrumbs(
            [
              {
                text: "Home",
                route: ROUTES.HOME,
                active: true,
                isHome: true,
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M125.2 16.1c6.2-4.4 5.4-14.8-2.2-15.6c-3.6-.4-7.3-.5-11-.5C50.1 0 0 50.1 0 112s50.1 112 112 112c32.1 0 61.1-13.5 81.5-35.2c5.2-5.6-1-14-8.6-13.2c-2.9 .3-5.9 .4-9 .4c-48.6 0-88-39.4-88-88c0-29.7 14.7-55.9 37.2-71.9zm289.9 85.3c-8.8-7.2-21.5-7.2-30.3 0l-216 176c-10.3 8.4-11.8 23.5-3.4 33.8s23.5 11.8 33.8 3.4L224 294.4 224 456c0 30.9 25.1 56 56 56l240 0c30.9 0 56-25.1 56-56l0-161.6 24.8 20.2c10.3 8.4 25.4 6.8 33.8-3.4s6.8-25.4-3.4-33.8l-216-176zM528 255.3L528 456c0 4.4-3.6 8-8 8l-240 0c-4.4 0-8-3.6-8-8l0-200.7L400 151 528 255.3zM352 312l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM248.5 12.3L236.6 44.6 204.3 56.5c-7 2.6-7 12.4 0 15l32.3 11.9 11.9 32.3c2.6 7 12.4 7 15 0l11.9-32.3 32.3-11.9c7-2.6 7-12.4 0-15L275.4 44.6 263.5 12.3c-2.6-7-12.4-7-15 0zm-145 320c-2.6-7-12.4-7-15 0L76.6 364.6 44.3 376.5c-7 2.6-7 12.4 0 15l32.3 11.9 11.9 32.3c2.6 7 12.4 7 15 0l11.9-32.3 32.3-11.9c7-2.6 7-12.4 0-15l-32.3-11.9-11.9-32.3z"/></svg>'
              }
            ],
            {
              showIcons: true,
              truncateAfter: 3,
              animateChanges: true,
              schemaMarkup: true
            }
          );
          
          setTimeout(() => {
            pageLoader.complete();
          }, 700);
          
          utils.scrollToTop();
        }, 200);
      }
    },

    loadArtistPage: (artistData, targetAlbumName = null) => {
      pageLoader.start({ message: "Finding Artist..." });
      
      const dynamicContent = $byId(IDS.dynamicContent);
      if (!dynamicContent) return;

      dynamicContent.innerHTML = "";

      setTimeout(() => {
        navigation.rendering.renderArtistPage(artistData, targetAlbumName);
        pageLoader.complete();
        utils.scrollToTop();
      }, 200);
    },

    loadAllArtistsPage: () => {
      pageLoader.start({ message: "Loading library..." });
      
      const dynamicContent = $byId(IDS.dynamicContent);
      if (!dynamicContent || !window.music) return;

      dynamicContent.innerHTML = "";

      setTimeout(() => {
        navigation.rendering.renderAllArtistsPage();
        
        setTimeout(() => {
          pageLoader.complete();
        }, 100);
      }, 300);
    }
  },

  rendering: {
    renderArtistPage: (artistData, targetAlbumName = null) => {
      const dynamicContent = $byId(IDS.dynamicContent);
      if (!dynamicContent) return;
      
      dynamicContent.innerHTML = render.artist("enhancedArtist", {
        artist: artistData.artist,
        cover: utils.getArtistImageUrl(artistData.artist),
        genre: artistData.genre || '',
        albumCount: artistData.albums.length,
        songCount: utils.getTotalSongs(artistData),
      });

      navigation.rendering.setupAlbumsSection(artistData, targetAlbumName);
      
      pageUpdates.breadCrumbs(
        [
          { 
            text: "Home  ", 
            route: ROUTES.HOME, 
            active: false, 
            isHome: true, 
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path class="fa-secondary" d="M80 202.9L80 448c0 26.5 21.5 48 48 48l80 0 0-168c0-13.3 10.7-24 24-24l112 0c13.3 0 24 10.7 24 24l0 168 80 0c26.5 0 48-21.5 48-48l0-245.1L288 18.7 80 202.9z"/><path class="fa-primary" d="M293.3 2c-3-2.7-7.6-2.7-10.6 0L2.7 250c-3.3 2.9-3.6 8-.7 11.3s8 3.6 11.3 .7L64 217.1 64 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-230.9L562.7 262c3.3 2.9 8.4 2.6 11.3-.7s2.6-8.4-.7-11.3L293.3 2zM80 448l0-245.1L288 18.7 496 202.9 496 448c0 26.5-21.5 48-48 48l-80 0 0-168c0-13.3-10.7-24-24-24l-112 0c-13.3 0 24 10.7 24 24l0 168-80 0c-26.5 0-48-21.5-48-48zm144 48l0-168c0-4.4 3.6-8 8-8l112 0c4.4 0 8 3.6 8 8l0 168-128 0z"/></svg>' 
          },
          { 
            text: "  Discography", 
            route: ROUTES.ARTIST, 
            artist: artistData.artist, 
            active: true, 
            icon: '' 
          }
        ],
        { showIcons: true, truncateAfter: 3, animateChanges: true, schemaMarkup: true }
      );
      
      const names = utils.getSimilarArtists(artistData.artist, { limit: 24 });
      navigation.rendering.buildSimilar(names);
      navigation.events.bindArtistPageEvents(artistData);
    },

    setupAlbumsSection: (artistData, targetAlbumName = null) => {
      const albumsContainer = $byId(IDS.albumsContainer);
      if (!albumsContainer || !artistData.albums.length) return;

      albumsContainer.innerHTML = render.album('section', { albums: artistData.albums });

      let targetAlbumIndex = 0;
      if (targetAlbumName) {
        const index = artistData.albums.findIndex(album => album.album === targetAlbumName);
        if (index !== -1) {
          targetAlbumIndex = index;
        }
      }

      navigation.rendering.displaySingleAlbum(artistData, targetAlbumIndex);
      navigation.events.bindAlbumSwitcher(artistData);
    },

    displaySingleAlbum: (artistData, albumIndex) => {
      const currentAlbumDisplay = $byId("current-album-display");
      if (!currentAlbumDisplay || !artistData.albums[albumIndex]) return;

      const album = artistData.albums[albumIndex];
      currentAlbumDisplay.style.opacity = "0";
      currentAlbumDisplay.style.transform = "translateY(10px)";

      setTimeout(() => {
        const albumId = `${artistData.artist}-${album.album}`.replace(/\s+/g, "").toLowerCase();
        currentAlbumDisplay.innerHTML = render.album("card", {
          albumId: albumId,
          album: album.album,
          cover: utils.getAlbumImageUrl(album.album),
          year: album.year || "Unknown",
          songCount: album.songs.length,
        });

        navigation.rendering.renderAlbumSongs(currentAlbumDisplay, album, artistData.artist);
        currentAlbumDisplay.style.opacity = "1";
        currentAlbumDisplay.style.transform = "translateY(0)";
      }, 250);
    },

renderAlbumSongs: (albumContainer, album, artistName) => {
  const songsContainer = albumContainer.querySelector(".songs-container");
  if (!songsContainer) return;

  songsContainer.innerHTML = "";

  if (!album.songs || album.songs.length === 0) {
    songsContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No songs found in this album</p>';
    return;
  }

  songsContainer._songsData = [];

  album.songs.forEach((song, index) => {
    const songData = {
      ...song,
      artist: artistName,
      album: album.album,
      cover: utils.getAlbumImageUrl(album.album),
    };

    songsContainer._songsData.push(songData);

    const isFavorite = appState.favorites.has("songs", song.id);
    const songElement = create(
      render.songItem({
        trackNumber: index + 1,
        title: song.title,
        artist: artistName,
        duration: song.duration || "0:00",
        songData: songData,
        context: 'base',
        isFavorite: isFavorite,
        showTrackNumber: true,
        showArtist: false
      })
    );

    songElement.dataset.index = index;

    songsContainer.appendChild(songElement);
  });

  navigation.events.bindSongItemEvents(songsContainer);
},

    buildSimilar: (names) => {
      const rows = document.querySelectorAll('.similar-rows .names-row');
      const base = Array.from(new Set((names || []).map(n => String(n)).filter(Boolean)));
      if (!rows.length || !base.length) return;
      
      rows.forEach(row => {
        const speed = parseFloat(row.dataset.speed || '30') || 30;
        const gap = parseInt(row.dataset.gap || '18', 10) || 18;
        const track = document.createElement('div');
        const copyA = document.createElement('div');
        const copyB = document.createElement('div');
        
        track.className = 'names-track';
        copyA.className = 'names-copy';
        copyB.className = 'names-copy';
        track.style.setProperty('--speed', speed + 's');
        track.style.setProperty('--gap', gap + 'px');
        
        base.forEach(n => copyA.appendChild(navigation.rendering.createArtistPill(n)));
        const rotated = base.length > 1 ? base.slice(1).concat(base[0]) : base.slice();
        rotated.forEach(n => copyB.appendChild(navigation.rendering.createArtistPill(n)));
        
        row.innerHTML = '';
        track.appendChild(copyA);
        track.appendChild(copyB);
        row.appendChild(track);
        
        navigation.rendering.syncRowWidth(row, copyA, gap);
        const ro = new ResizeObserver(() => navigation.rendering.syncRowWidth(row, copyA, gap));
        ro.observe(row);
      });
    },

    createArtistPill: (name) => {
      const a = document.createElement('a');
      a.className = 'name-pill';
      a.href = '#';
      a.dataset.artist = name;
      const h4 = document.createElement('h4');
      h4.textContent = name;
      a.appendChild(h4);
      a.addEventListener('click', e => {
        e.preventDefault();
        if (appState.router) {
          appState.router.navigateToArtist(name);
        }
      });
      return a;
    },

    syncRowWidth: (row, copyA, gap) => {
      const items = Array.from(copyA.children);
      if (!items.length) return;
      const contentWidth = items.reduce((w, el) => w + el.getBoundingClientRect().width, 0);
      const totalGaps = Math.max(items.length - 1, 0) * gap;
      const half = contentWidth + totalGaps;
      const trackEl = row.querySelector('.names-track');
      if (trackEl) trackEl.style.width = (half * 2) + 'px';
    },

    renderAllArtistsPage: () => {
      const dynamicContent = $byId(IDS.dynamicContent);
      if (!dynamicContent || !window.music) return;

      dynamicContent.innerHTML = render.page("allArtists");

      const artistsGrid = $byId(IDS.artistsGrid);
      if (artistsGrid) {
        window.music.forEach((artist, index) => {
          const artistCard = document.createElement("div");
          artistCard.className = "animate__animated animate__fadeIn";
          artistCard.style.animationDelay = `${0.05 * index}s`;

          artistCard.innerHTML = render.artist("card", {
            id: artist.artist.replace(/\s+/g, "").toLowerCase(),
            artist: artist.artist,
            cover: utils.getArtistImageUrl(artist.artist),
            genre: artist.genre || "Various",
            albumCount: artist.albums.length,
          });

          artistsGrid.appendChild(artistCard);

          artistCard.querySelector(".artist-card").addEventListener("click", () => {
            appState.router.navigateTo(ROUTES.ARTIST, { artist: artist.artist });
          });
        });
      }

      pageUpdates.breadCrumbs([
        {
          text: "Home",
          route: ROUTES.HOME,
          active: false,
          isHome: true,
        },
        {
          text: "All Artists",
          route: ROUTES.ALL_ARTISTS,
          active: true,
        },
      ]);

      navigation.events.bindAllArtistsEvents();
    }
  },

  events: {
    bindArtistPageEvents: (artistData) => {
      const playButton = document.querySelector("#artistPlay");
      if (playButton) {
        playButton.addEventListener("click", () => {
          navigation.actions.playArtistSongs(artistData);
        });
      }

      const followButton = document.querySelector("#artistFollow");
      if (followButton) {
        const isFavorite = appState.favorites.has("artists", artistData.artist);
        followButton.textContent = isFavorite ? "Unfavorite" : "Favorite";
        followButton.classList.toggle(CLASSES.active, isFavorite);
        followButton.addEventListener("click", () => {
          const wasFavorite = appState.favorites.toggle("artists", artistData.artist);
          followButton.textContent = wasFavorite ? "Unfavorite" : "Favorite";
          followButton.classList.toggle(CLASSES.active, wasFavorite);
        });
      }

      document.addEventListener("click", e => {
        const playAlbumBtn = e.target.closest(".play-album");
        if (playAlbumBtn) {
          e.stopPropagation();
          const activeTab = document.querySelector(".album-tab.active");
          if (activeTab) {
            const albumIndex = parseInt(activeTab.dataset.albumIndex);
            const album = artistData.albums[albumIndex];
            if (album) navigation.actions.playAlbumSongs(album, artistData.artist);
          }
        }
      });
    },

    bindAlbumSwitcher: (artistData) => {
      const albumTabs = document.querySelectorAll(".album-tab");
      albumTabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
          e.preventDefault();
          const albumIndex = parseInt(tab.dataset.albumIndex);
          
          albumTabs.forEach((t) => {
            t.classList.remove("active", "bg-accent-primary", "text-white");
            t.classList.add("bg-gray-700", "text-gray-300");
          });

          tab.classList.add("active", "bg-accent-primary", "text-white");
          tab.classList.remove("bg-gray-700", "text-gray-300");

          navigation.rendering.displaySingleAlbum(artistData, albumIndex);
        });
      });
    },

    bindAllArtistsEvents: () => {
      const artistSearch = $byId(IDS.artistSearch);
      if (artistSearch) {
        artistSearch.addEventListener("input", (e) => {
          const query = e.target.value.toLowerCase().trim();
          document.querySelectorAll(".artist-card").forEach((card) => {
            const artistName = card.querySelector("h3").textContent.toLowerCase();
            const genreTag = card.querySelector(".genre-tag")?.textContent.toLowerCase() || "";
            const matches = artistName.includes(query) || genreTag.includes(query);
            card.parentElement.style.display = matches ? "block" : "none";
          });
        });
      }

      const genreFilters = $byId(IDS.genreFilters);
      if (genreFilters && window.music) {
        const genres = new Set();
        window.music.forEach((artist) => {
          if (artist.genre) genres.add(artist.genre);
        });

        genreFilters.innerHTML = "";
        Array.from(genres).sort().forEach((genre) => {
          const genreBtn = document.createElement("button");
          genreBtn.className = "px-3 py-1 text-xs font-medium rounded-full bg-bg-subtle hover:bg-bg-muted transition-colors";
          genreBtn.textContent = genre;

          genreBtn.addEventListener("click", () => {
            genreBtn.classList.toggle(CLASSES.active);
            genreBtn.classList.toggle("bg-accent-primary");
            genreBtn.classList.toggle("text-white");

            const activeFilters = Array.from(genreFilters.querySelectorAll("." + CLASSES.active)).map((btn) => btn.textContent.toLowerCase());

            document.querySelectorAll(".artist-card").forEach((card) => {
              const cardGenre = card.querySelector(".genre-tag")?.textContent.toLowerCase() || "";
              card.parentElement.style.display = activeFilters.length === 0 || activeFilters.includes(cardGenre) ? "block" : "none";
            });
          });

          genreFilters.appendChild(genreBtn);
        });
      }
    },

bindSongItemEvents: (container) => {
  if (!container) return;

  container.querySelectorAll(".song-item").forEach((songItem, itemIndex) => {
    let clickCount = 0;
    let clickTimer = null;

    // Get the song data from the container's stored array
    const songsContainer = songItem.closest('.songs-container');
    const songIndex = parseInt(songItem.dataset.index);
    
    // Store song data in memory, not in HTML
    if (!songsContainer._songsData) {
      songsContainer._songsData = [];
    }

    songItem.addEventListener("click", (e) => {
      if (e.target.closest(".song-actions") || e.target.closest("[data-action]")) return;

      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => { clickCount = 0; }, 300);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        
        // Get song data from memory instead of parsing JSON
        const songData = songsContainer._songsData[songIndex];
        if (songData) {
          musicPlayer.ui.playSong(songData);
        }
      }
    });

    const playButton = songItem.querySelector("[data-action='play']");
    if (playButton) {
      playButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const songData = songsContainer._songsData[songIndex];
        if (songData) {
          musicPlayer.ui.playSong(songData);
        }
      });
    }

        const artistElement = songItem.querySelector("[data-artist]");
        if (artistElement) {
          artistElement.addEventListener("click", (e) => {
            e.stopPropagation();
            const artistName = artistElement.dataset.artist;
            appState.router.navigateToArtist(artistName);
          });
        }

        songItem.querySelectorAll("[data-action]").forEach((actionBtn) => {
          actionBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const action = actionBtn.dataset.action;
            const songData = JSON.parse(songItem.dataset.song);
            const context = songItem.dataset.context || 'base';

            if (action === 'more') {
              navigation.actions.showMoreActionsPopover(actionBtn, songData, context);
            } else {
              navigation.actions.handleSongAction(action, songData, context);
            }
          });
        });
      });
    }
  },

  actions: {
    playArtistSongs: (artistData) => {
      const allSongs = [];
      artistData.albums.forEach((album) => {
        album.songs.forEach((song) => {
          allSongs.push({
            ...song,
            artist: artistData.artist,
            album: album.album,
            cover: utils.getAlbumImageUrl(album.album),
          });
        });
      });

      if (allSongs.length > 0) {
        appState.queue.clear();
        allSongs.slice(1).forEach((song) => appState.queue.add(song));
        musicPlayer.ui.playSong(allSongs[0]);
      }
    },

    playAlbumSongs: (album, artistName) => {
      if (album.songs.length === 0) return;

      appState.queue.clear();
      album.songs.slice(1).forEach((song) => {
        appState.queue.add({
          ...song,
          artist: artistName,
          album: album.album,
          cover: utils.getAlbumImageUrl(album.album),
        });
      });

      musicPlayer.ui.playSong({
        ...album.songs[0],
        artist: artistName,
        album: album.album,
        cover: utils.getAlbumImageUrl(album.album),
      });
    },

    handleSongAction: (action, songData, context) => {
      switch (action) {
        case "favorite":
          const wasFavorite = appState.favorites.toggle("songs", songData.id);
          const message = wasFavorite ? `Added "${songData.title}" to your favorite music` : `Removed "${songData.title}" from your favorite music`;
          notifications.show(message, wasFavorite ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.INFO);
          break;
          
        case "play-next":
          appState.queue.add(songData, 0);
          notifications.show(`"${songData.title}" will play next`, NOTIFICATION_TYPES.SUCCESS);
          break;
          
        case "add-queue":
          appState.queue.add(songData);
          notifications.show(`Added "${songData.title}" to queue`, NOTIFICATION_TYPES.SUCCESS);
          break;
          
        case "add-playlist":
          navigation.actions.showPlaylistSelector(songData);
          break;
          
        case "remove-from-playlist":
          const playlistContainer = document.querySelector('[data-playlist-id]');
          if (playlistContainer) {
            const playlistId = playlistContainer.dataset.playlistId;
            if (playlists.removeSong(playlistId, songData.id)) {
              playlists.show(playlistId);
              notifications.show(`Removed "${songData.title}" from playlist`, NOTIFICATION_TYPES.INFO);
            }
          }
          break;
          
        case "download":
          notifications.show("Download feature coming soon", NOTIFICATION_TYPES.INFO);
          break;
          
        case "share":
          navigation.actions.shareSong(songData);
          break;
          
        case "view-artist":
          appState.router.navigateToArtist(songData.artist);
          break;
          
        default:
          console.log(`Action ${action} not implemented yet`);
      }
    },

    showMoreActionsPopover: (triggerButton, songData, context) => {
      document.querySelectorAll('.more-actions-popover').forEach(p => p.remove());
      
      const popover = document.createElement('div');
      popover.className = 'more-actions-popover';
      
      popover.innerHTML = `
        <div class="popover-grid">
          ${ACTION_GRID_ITEMS.map(action => `
            <button class="popover-action-btn" data-action="${action.id}">
              <svg class="popover-icon" viewBox="0 0 24 24">
                <path d="${action.icon}"/>
              </svg>
              <span class="popover-label">${action.label}</span>
            </button>
          `).join('')}
        </div>
      `;
      
      document.body.appendChild(popover);
      
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      const triggerRect = triggerButton.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      
      let left = triggerRect.right + 8;
      let top = triggerRect.top;
      
      if (left + popoverRect.width > viewport.width - 16) {
        left = triggerRect.left - popoverRect.width - 8;
        if (left < 16) {
          left = Math.max(16, Math.min(
            viewport.width - popoverRect.width - 16,
            triggerRect.left + (triggerRect.width - popoverRect.width) / 2
          ));
        }
      }
      
      if (top + popoverRect.height > viewport.height - 16) {
        top = Math.max(16, viewport.height - popoverRect.height - 16);
      }
      
      top = Math.max(16, top);
      
      popover.style.left = `${left}px`;
      popover.style.top = `${top}px`;
      
      popover.querySelectorAll('.popover-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          popover.remove();
          navigation.actions.handleSongAction(action, songData, context);
        });
      });
      
      const closePopover = (e) => {
        if (!popover.contains(e.target) && !triggerButton.contains(e.target)) {
          popover.remove();
          document.removeEventListener('click', closePopover);
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          popover.remove();
          document.removeEventListener('click', closePopover);
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      
      setTimeout(() => {
        document.addEventListener('click', closePopover);
        document.addEventListener('keydown', escapeHandler);
      }, 100);
    },

    showPlaylistSelector: (songData) => {
      if (appState.playlists.length === 0) {
        overlays.dialog.confirm(
          "No playlists found. Create a new playlist?",
          { okText: "Create Playlist", cancelText: "Cancel" }
        ).then((confirmed) => {
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

      const playlistOptions = appState.playlists.map(playlist => `
        <button class="playlist-option w-full text-left p-3 rounded hover:bg-gray-700 transition-colors flex items-center gap-3" data-playlist-id="${playlist.id}">
          <div class="playlist-icon w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div class="flex-1">
            <div class="font-medium">${playlist.name}</div>
            <div class="text-sm text-gray-400">${playlist.songs.length} songs</div>
          </div>
        </button>
      `).join('');

      const content = `
        <div class="playlist-selector">
          <h3 class="text-xl font-bold mb-4">Add to Playlist</h3>
          <div class="playlist-list max-h-64 overflow-y-auto space-y-2 mb-6">
            ${playlistOptions}
          </div>
          <div class="actions flex gap-3">
            <button class="create-new-playlist flex-1 bg-accent-primary text-white py-3 px-4 rounded hover:bg-accent-secondary transition-colors">
              <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Create New Playlist
            </button>
            <button class="cancel-playlist-selection bg-gray-600 text-white py-3 px-4 rounded hover:bg-gray-500 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      `;

      overlays.open('playlist-selector', content, 'playlist-selector');
      
      const modal = document.getElementById('playlist-selector');
      
      modal.querySelectorAll('.playlist-option').forEach(option => {
        option.addEventListener('click', () => {
          const playlistId = option.dataset.playlistId;
          playlists.addSong(playlistId, songData);
          overlays.close('playlist-selector');
        });
      });
      
      modal.querySelector('.create-new-playlist').addEventListener('click', async () => {
        overlays.close('playlist-selector');
        const newPlaylist = await playlists.create();
        if (newPlaylist) {
          playlists.addSong(newPlaylist.id, songData);
        }
      });
      
      modal.querySelector('.cancel-playlist-selection').addEventListener('click', () => {
        overlays.close('playlist-selector');
      });
    },

    shareSong: (songData) => {
      if (navigator.share) {
        navigator.share({
          title: songData.title,
          text: `Listen to "${songData.title}" by ${songData.artist}`,
          url: window.location.href
        }).catch(() => {
          navigation.actions.fallbackShare(songData);
        });
      } else {
        navigation.actions.fallbackShare(songData);
      }
    },

    fallbackShare: (songData) => {
      const shareUrl = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          notifications.show("Song link copied to clipboard!", NOTIFICATION_TYPES.SUCCESS);
        }).catch(() => {
          notifications.show("Share feature not available", NOTIFICATION_TYPES.WARNING);
        });
      } else {
        notifications.show("Share feature not available", NOTIFICATION_TYPES.WARNING);
      }
    }
  }
};




