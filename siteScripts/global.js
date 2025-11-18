import { 
  DOM, QUERY, QUERY_ALL, IDS, CLASSES, ROUTES, THEMES, STORAGE_KEYS, 
  ICONS, AUDIO_FORMATS, REPEAT_MODES, NOTIFICATION_TYPES, MUSIC_PLAYER, 
  NAVBAR, $, $byId, notifications 
} from './index.js';

import { music } from "../../modules/library.js";
import { render, create, encodeURIComponent } from "./utilities/index.js";
import { homePage, views, pageLoader, navigation, ui, pageUpdates, deepLinkRouter } from "./pages/index.js";

const ACTION_GRID_ITEMS = [
  { id: 'play-next', icon: 'M9 5l7 7-7 7M15 5v14', label: 'Play Next' },
  { id: 'add-queue', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', label: 'Add to Queue' },
  { id: 'add-playlist', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10', label: 'Add to Playlist' },
  { id: 'share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', label: 'Share' },
  { id: 'download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', label: 'Download' },
  { id: 'view-artist', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'View Artist' }
];
const TOAST_ICONS = {
  [NOTIFICATION_TYPES.SUCCESS]: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>',
  [NOTIFICATION_TYPES.ERROR]: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/></svg>',
  [NOTIFICATION_TYPES.WARNING]: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/></svg>',
  [NOTIFICATION_TYPES.INFO]: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/></svg>',
};
const PLAYER_EVENTS = {
  STATE_CHANGE: 'player:state-change',
  PLAYBACK_STATE: 'player:playback-state',
  CURRENT_SONG: 'player:current-song',
  TIME_UPDATE: 'player:time-update',
  VOLUME_CHANGE: 'player:volume-change',
  QUEUE_CHANGE: 'player:queue-change',
  FAVORITES_CHANGE: 'player:favorites-change',
  REPEAT_MODE: 'player:repeat-mode',
  SHUFFLE_MODE: 'player:shuffle-mode',
  RECENTLY_PLAYED_CHANGED: 'recently-played:changed'
};
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;



////////////////////////////////////////////////////////////
////////////////////////////////  PAGE Updaters  ///////////
const utils = {
  getAlbumImageUrl: (albumName) => {
    if (!albumName) return utils.getDefaultAlbumImage();
    const cleanName = albumName.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
    return `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/Finalfinal/global/content/images/albumCovers/${cleanName}.png`;
  },

  formatTime: (seconds) => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  },

  normalizeForUrl: (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "");
  },

  getArtistImageUrl: (artistName) => {
    if (!artistName) return utils.getDefaultArtistImage();
    const normalized = utils.normalizeForUrl(artistName);
    return `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/Finalfinal/global/content/images/artistPortraits/${normalized}.png`;
  },

  getDefaultAlbumImage: () => {
    return "https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-mobile-layout-issues/global/content/images/albumCovers/default-album.png";
  },

  getDefaultArtistImage: () => {
    return "https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-mobile-layout-issues/global/content/images/artistPortraits/default-artist.png";
  },

  getTotalSongs: (artist) => {
    return artist.albums.reduce((total, album) => total + album.songs.length, 0);
  },

  loadImageWithFallback: (imgElement, primaryUrl, fallbackUrl, type = "image") => {
    if (!imgElement) return;
    imgElement.classList.add(CLASSES.imageLoading);

    const testImage = new Image();
    testImage.onload = () => {
      imgElement.src = primaryUrl;
      imgElement.classList.remove(CLASSES.imageLoading, CLASSES.imageError);
      imgElement.classList.add(CLASSES.imageLoaded);
    };

    testImage.onerror = () => {
      const fallbackImage = new Image();
      fallbackImage.onload = () => {
        imgElement.src = fallbackUrl;
        imgElement.classList.remove(CLASSES.imageLoading);
        imgElement.classList.add(CLASSES.imageLoaded);
      };

      fallbackImage.onerror = () => {
        imgElement.src = utils.generatePlaceholder(type);
        imgElement.classList.remove(CLASSES.imageLoading);
        imgElement.classList.add(CLASSES.imageFallback);
      };

      fallbackImage.src = fallbackUrl;
    };

    testImage.src = primaryUrl;
  },

  generatePlaceholder: (type) => {
    const isArtist = type === "artist";
    const bgColor = isArtist ? "#4F46E5" : "#059669";
    const icon = isArtist
      ? '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>'
      : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>';

    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${bgColor}"/>
      <svg x="75" y="75" width="50" height="50" viewBox="0 0 24 24" fill="white">
        ${icon}
      </svg>
    </svg>`;

    return "data:image/svg+xml;base64," + btoa(svg);
  },

  getSimilarArtists: (artistName, { limit = 12, includeSelf = false } = {}) => {
    const lib = Array.isArray(typeof music !== 'undefined' ? music : null) ? music : 
                (Array.isArray(window.music) ? window.music : []);
    if (!Array.isArray(lib) || !lib.length) return [];
    const artist = lib.find(a => a.artist === artistName);
    if (!artist || !Array.isArray(artist.similar)) return [];
    const arr = includeSelf ? artist.similar.slice() : artist.similar.filter(n => n !== artistName);
    return Array.from(new Set(arr)).slice(0, limit);
  },

  scrollToTop: () => {
    let area = document.getElementById('pageWrapper');
    area.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  },

  getParameterByName: (name, url) => {
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
};
const overlays = {
  open: (id, content, type = 'default') => {
    let modal = document.getElementById(id);
    if (!modal) {
      modal = document.createElement("dialog");
      modal.id = id;
      modal.className = `modal ${type}`;
      document.body.appendChild(modal);
    }

    modal.innerHTML = render.overlay('default', { content });
    
    modal.classList.remove('closing');
    
    modal.querySelector("[data-close]").addEventListener("click", () => overlays.close(id), { once: true });
    modal.addEventListener('cancel', (e) => {
      e.preventDefault();
      overlays.close(id);
    });
    
    modal.showModal();
    modal.offsetHeight;
    requestAnimationFrame(() => modal.setAttribute('open', ''));
  },

  close: (id) => {
    const modal = document.getElementById(id);
    if (modal && modal.open) {
      modal.classList.add('closing');
      setTimeout(() => {
        modal.close();
        modal.classList.remove('closing');
        modal.removeAttribute('open');
      }, 250);
    }
  },

  dialog: {
    confirm(message, { okText = "OK", cancelText = "Cancel", danger = false } = {}) {
      return new Promise((resolve) => {
        const id = "confirm-dialog";
        overlays.open(
          id,
          render.overlay('dialog', {
            message,
            okText,
            cancelText,
            danger,
          }),
          'dialog'
        );
        
        const modal = document.getElementById(id);
        
        const handleCancel = () => {
          overlays.close(id);
          setTimeout(() => resolve(false), 250);
        };
        
        const handleOk = () => {
          overlays.close(id);
          setTimeout(() => resolve(true), 250);
        };
        
        modal.querySelector("[data-cancel]").addEventListener("click", handleCancel, { once: true });
        modal.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
      });
    },

    alert(message, { okText = "OK" } = {}) {
      return new Promise((resolve) => {
        const id = "alert-dialog";
        overlays.open(
          id,
          render.overlay('dialog', {
            message,
            okText,
            cancelText: null,
            danger: false,
          }),
          'dialog'
        );
        
        const modal = document.getElementById(id);
        const handleOk = () => {
          overlays.close(id);
          setTimeout(() => resolve(), 250);
        };
        
        modal.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
      });
    }
  },

  form: {
    prompt(message, { okText = "Create", cancelText = "Go Back", placeholder = "", value = "" } = {}) {
      return new Promise((resolve) => {
        const id = "prompt-form";
        overlays.open(
          id,
          render.overlay('prompt', {
            message,
            okText,
            cancelText,
            placeholder,
            value,
          }),
          'form'
        );
        
        const modal = document.getElementById(id);
        const input = modal.querySelector(".input");
        
        const handleCancel = () => {
          overlays.close(id);
          setTimeout(() => resolve(null), 250);
        };
        
        const handleOk = () => {
          overlays.close(id);
          setTimeout(() => resolve(input.value.trim() || null), 250);
        };
        
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleOk();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
          }
        });
        
        modal.querySelector("[data-cancel]").addEventListener("click", handleCancel, { once: true });
        modal.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
      });
    }
  },

  viewer: {
    playlists(content) {
      overlays.open('playlist-viewer', content, 'viewer playlist');
    },
    
    artists(content) {
      overlays.open('artist-viewer', content, 'viewer artist');
    },
    
    unified(title, content) {
      const wrappedContent = `
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">${title}</h2>
            </div>
            <button class="close-btn" data-close aria-label="Close">&times;</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      `;
      overlays.open('unified-modal', wrappedContent, 'viewer unified');
    },
    
    recentTracks(content) {
      overlays.open('recent-tracks-viewer', content, 'viewer recent');
    },
    
    favoriteSongs(content) {
      overlays.open('favorite-songs-viewer', content, 'viewer favorites');
    },
    
    favoriteArtists(content) {
      overlays.open('favorite-artists-viewer', content, 'viewer favorites');
    }
  }
};
const dropdown = {
  toggle: (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const menu = $byId(IDS.dropdownMenu);
    const trigger = $byId(IDS.menuTrigger);

    if (!menu || !trigger) return;

    const isVisible = menu.classList.contains(CLASSES.show);
    if (isVisible) {
      dropdown.close();
    } else {
      dropdown.open();
    }
  },

  open: (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const menu = $byId(IDS.dropdownMenu);
    const trigger = $byId(IDS.menuTrigger);

    if (!menu || !trigger) return;

    ui.updateCounts();
    menu.classList.add(CLASSES.show);
    trigger.classList.add(CLASSES.active);
    musicPlayer.playback.close();
  },

  close: (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const menu = $byId(IDS.dropdownMenu);
    const trigger = $byId(IDS.menuTrigger);

    if (!menu || !trigger) return;

    menu.classList.remove(CLASSES.show);
    trigger.classList.remove(CLASSES.active);
  }
};



////////////////////////////////////////////////////////////
//////////////////////////////  Event Listeners  ///////////
const app = {
    initialize() {
        window.music = music;
        storage.initialize();
        notifications.init();
        musicPlayer.init();
        navigation.initialize();
        homePage.initialize();
        deepLinkRouter.initialize();
        deepLinkRouter.bindPopState();
        
        this.resetUI();
        this.syncGlobalState();
    },

    resetUI() {
        const nowPlayingArea = QUERY(NAVBAR.nowPlaying);
        nowPlayingArea?.classList.remove(CLASSES.hasSong);
        ui.updateCounts();
    },

    syncGlobalState() {
        window.appState = appState;
        window.playerController = {
            playSong: musicPlayer.ui.playSong,
            toggle: musicPlayer.playback.toggle,
            next: musicPlayer.playback.next,
            previous: musicPlayer.playback.previous,
            seekTo: musicPlayer.playback.seekTo,
            skip: musicPlayer.playback.skip,
        };
        window.musicAppAPI = {
            player: musicPlayer.playback,
            controls: musicPlayer.playback,
            musicPlayer, dropdown, notifications, playlists, utils,
            favorites: appState.favorites,
            queue: appState.queue,
        };
    },

    goHome() {
        appState.router?.navigateTo(ROUTES.HOME);
    }
};
const clickables = {
    elements: {
        menuBtn: null,
        musicPlayerBtn: null,
        navbarPlayPause: null,
        navbarPrevious: null,
        navbarNext: null,
        drawer: null,
        drawerClose: null,
        drawerPlay: null,
        drawerPrevious: null,
        drawerNext: null,
        drawerShuffle: null,
        drawerRepeat: null,
        drawerFavorite: null,
        drawerQueue: null,
        drawerRewind: null,
        drawerForward: null,
        progressBar: null,
        dropdownMenu: null,
        dropdownClose: null,
        favoriteSongs: null,
        favoriteArtists: null,
        favoriteAlbums: null,
        recentlyPlayed: null,
        queueView: null,
        createPlaylist: null,
        shuffleAll: null,
        dotIndicators: null,
        searchTrigger: null,
        searchDialog: null,
    },

    init: () => {
        clickables.elements.menuBtn = $byId(IDS.menuTrigger);
        clickables.elements.musicPlayerBtn = $byId(IDS.musicPlayerTrigger);
        clickables.elements.navbarPlayPause = QUERY(NAVBAR.playPause);
        clickables.elements.navbarPrevious = QUERY(NAVBAR.previous);
        clickables.elements.navbarNext = QUERY(NAVBAR.next);
        clickables.elements.drawer = $byId(IDS.musicPlayer);
        clickables.elements.drawerClose = QUERY(MUSIC_PLAYER.close);
        clickables.elements.drawerPlay = QUERY(MUSIC_PLAYER.play);
        clickables.elements.drawerPrevious = QUERY(MUSIC_PLAYER.previous);
        clickables.elements.drawerNext = QUERY(MUSIC_PLAYER.next);
        clickables.elements.drawerShuffle = QUERY(MUSIC_PLAYER.shuffleBtn);
        clickables.elements.drawerRepeat = QUERY(MUSIC_PLAYER.repeatBtn);
        clickables.elements.drawerFavorite = QUERY(MUSIC_PLAYER.favoriteBtn);
        clickables.elements.drawerQueue = QUERY(MUSIC_PLAYER.queueBtn);
        clickables.elements.drawerRewind = QUERY(MUSIC_PLAYER.reWind);
        clickables.elements.drawerForward = QUERY(MUSIC_PLAYER.fastForward);
        clickables.elements.progressBar = QUERY(MUSIC_PLAYER.progressBar);
        clickables.elements.dropdownMenu = $byId(IDS.dropdownMenu);
        clickables.elements.dropdownClose = $byId(IDS.dropdownClose);
        clickables.elements.favoriteSongs = $byId(IDS.favoriteSongs);
        clickables.elements.favoriteArtists = $byId(IDS.favoriteArtists);
        clickables.elements.recentlyPlayed = $byId(IDS.recentlyPlayed);
        clickables.elements.queueView = $byId(IDS.queueView);
        clickables.elements.createPlaylist = $byId(IDS.createPlaylist);
        clickables.elements.shuffleAll = $byId(IDS.shuffleAll);
        clickables.elements.dotIndicators = QUERY_ALL('.player .dotIndicator');
        clickables.elements.searchTrigger = $byId(IDS.searchTrigger);
        clickables.elements.searchDialog = $byId(IDS.searchDialog);

        clickables.navBar();
        clickables.musicPlayer();
        clickables.dropDownMenu();
        clickables.others();
        clickables.keyboard();
        clickables.document();
    },

    navBar: () => {
        const { menuBtn, musicPlayerBtn, navbarPlayPause, navbarPrevious, navbarNext } = clickables.elements;
        
        if (menuBtn) {
            clickables.removeListener(menuBtn, '_menuToggle');
            const menuToggleHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (typeof dropdown !== 'undefined' && dropdown.toggle) {
                    dropdown.toggle(e);
                } else {
                    console.error('dropdown.toggle not available');
                }
            };
            menuBtn.addEventListener('click', menuToggleHandler);
            menuBtn._menuToggle = menuToggleHandler;
        }
        
        if (musicPlayerBtn) {
            clickables.removeListener(musicPlayerBtn, '_musicPlayerToggle');
            const musicPlayerToggleHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.toggle) {
                    musicPlayer.playback.toggle();
                } else {
                    console.error('musicPlayer.playback.toggle not available');
                }
            };
            musicPlayerBtn.addEventListener('click', musicPlayerToggleHandler);
            musicPlayerBtn._musicPlayerToggle = musicPlayerToggleHandler;
        }
        
        if (navbarPlayPause) {
            clickables.removeListener(navbarPlayPause, '_playPauseToggle');
            const playPauseHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.togglePlayPause) {
                    musicPlayer.playback.togglePlayPause();
                } else {
                    console.error('musicPlayer.playback.togglePlayPause not available');
                }
            };
            navbarPlayPause.addEventListener('click', playPauseHandler);
            navbarPlayPause._playPauseToggle = playPauseHandler;
        }
        
        if (navbarPrevious) {
            clickables.removeListener(navbarPrevious, '_previousHandler');
            const previousHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.previous) {
                    musicPlayer.playback.previous();
                } else {
                    console.error('musicPlayer.playback.previous not available');
                }
            };
            navbarPrevious.addEventListener('click', previousHandler);
            navbarPrevious._previousHandler = previousHandler;
        }
        
        if (navbarNext) {
            clickables.removeListener(navbarNext, '_nextHandler');
            const nextHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.next) {
                    musicPlayer.playback.next();
                } else {
                    console.error('musicPlayer.playback.next not available');
                }
            };
            navbarNext.addEventListener('click', nextHandler);
            navbarNext._nextHandler = nextHandler;
        }
    },

    musicPlayer: () => {
        const {
            drawerClose,
            drawerPlay,
            drawerPrevious,
            drawerNext,
            drawerShuffle,
            drawerRepeat,
            drawerFavorite,
            drawerQueue,
            drawerRewind,
            drawerForward,
            progressBar,
            drawer,
            dotIndicators
        } = clickables.elements;
        
        if (drawerClose) {
            clickables.removeListener(drawerClose, '_closeHandler');
            const closeHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.close) {
                    musicPlayer.playback.close();
                } else {
                    console.error('musicPlayer.playback.close not available');
                }
            };
            drawerClose.addEventListener('click', closeHandler);
            drawerClose._closeHandler = closeHandler;
        }
        
        if (drawerPlay) {
            clickables.removeListener(drawerPlay, '_drawerPlayHandler');
            const drawerPlayHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.togglePlayPause) {
                    musicPlayer.playback.togglePlayPause();
                } else {
                    console.error('musicPlayer.playback.togglePlayPause not available');
                }
            };
            drawerPlay.addEventListener('click', drawerPlayHandler);
            drawerPlay._drawerPlayHandler = drawerPlayHandler;
        }
        
        if (drawerPrevious) {
            clickables.removeListener(drawerPrevious, '_drawerPreviousHandler');
            const drawerPreviousHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.previous) {
                    musicPlayer.playback.previous();
                } else {
                    console.error('musicPlayer.playback.previous not available');
                }
            };
            drawerPrevious.addEventListener('click', drawerPreviousHandler);
            drawerPrevious._drawerPreviousHandler = drawerPreviousHandler;
        }
        
        if (drawerNext) {
            clickables.removeListener(drawerNext, '_drawerNextHandler');
            const drawerNextHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.next) {
                    musicPlayer.playback.next();
                } else {
                    console.error('musicPlayer.playback.next not available');
                }
            };
            drawerNext.addEventListener('click', drawerNextHandler);
            drawerNext._drawerNextHandler = drawerNextHandler;
        }
        
        if (drawerShuffle) {
            clickables.removeListener(drawerShuffle, '_shuffleHandler');
            const shuffleHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.shuffle && musicPlayer.playback.shuffle.toggle) {
                    musicPlayer.playback.shuffle.toggle();
                } else {
                    console.error('musicPlayer.playback.shuffle.toggle not available');
                }
            };
            drawerShuffle.addEventListener('click', shuffleHandler);
            drawerShuffle._shuffleHandler = shuffleHandler;
        }
        
        if (drawerRepeat) {
            clickables.removeListener(drawerRepeat, '_repeatHandler');
            const repeatHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.repeat && musicPlayer.playback.repeat.toggle) {
                    musicPlayer.playback.repeat.toggle();
                } else {
                    console.error('musicPlayer.playback.repeat.toggle not available');
                }
            };
            drawerRepeat.addEventListener('click', repeatHandler);
            drawerRepeat._repeatHandler = repeatHandler;
        }
        
        if (drawerFavorite) {
            clickables.removeListener(drawerFavorite, '_favoriteHandler');
            const favoriteHandler = (e) => {
                e.stopPropagation();
                if (typeof appState !== 'undefined' && appState.currentSong && appState.favorites) {
                    appState.favorites.toggle('songs', appState.currentSong.id);
                    if (typeof ui !== 'undefined' && ui.updateFavoriteButton) {
                        ui.updateFavoriteButton();
                    }
                } else {
                    console.error('appState.favorites not available');
                }
            };
            drawerFavorite.addEventListener('click', favoriteHandler);
            drawerFavorite._favoriteHandler = favoriteHandler;
        }
        
        if (drawerQueue) {
            clickables.removeListener(drawerQueue, '_queueHandler');
            const queueHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.ui && musicPlayer.ui.switchTab) {
                    musicPlayer.ui.switchTab('queue');
                } else {
                    console.error('musicPlayer.ui.switchTab not available');
                }
            };
            drawerQueue.addEventListener('click', queueHandler);
            drawerQueue._queueHandler = queueHandler;
        }
        
        if (drawerRewind) {
            clickables.removeListener(drawerRewind, '_rewindHandler');
            const rewindHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.skip) {
                    musicPlayer.playback.skip(-10);
                } else {
                    console.error('musicPlayer.playback.skip not available');
                }
            };
            drawerRewind.addEventListener('click', rewindHandler);
            drawerRewind._rewindHandler = rewindHandler;
        }
        
        if (drawerForward) {
            clickables.removeListener(drawerForward, '_forwardHandler');
            const forwardHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.skip) {
                    musicPlayer.playback.skip(10);
                } else {
                    console.error('musicPlayer.playback.skip not available');
                }
            };
            drawerForward.addEventListener('click', forwardHandler);
            drawerForward._forwardHandler = forwardHandler;
        }
        
        if (progressBar) {
            if (typeof musicPlayer !== 'undefined' && musicPlayer.ui && musicPlayer.ui.bindSeekBar) {
                musicPlayer.ui.bindSeekBar();
            } else {
                console.error('musicPlayer.ui.bindSeekBar not available');
            }
        }
        
        if (dotIndicators && dotIndicators.length > 0) {
            dotIndicators.forEach(dot => {
                clickables.removeListener(dot, '_dotHandler');
                const dotHandler = (e) => {
                    e.stopPropagation();
                    const tabName = dot.dataset.tab;
                    if (tabName && typeof musicPlayer !== 'undefined' && musicPlayer.ui && musicPlayer.ui.switchTab) {
                        musicPlayer.ui.switchTab(tabName);
                    } else {
                        console.error('musicPlayer.ui.switchTab not available');
                    }
                };
                dot.addEventListener('click', dotHandler);
                dot._dotHandler = dotHandler;
            });
        }
        
        const curtain = QUERY(`${MUSIC_PLAYER.root} .curtain`);
        if (curtain) {
            clickables.removeListener(curtain, '_curtainHandler');
            const curtainHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer && musicPlayer.mainPlayer.close) {
                    musicPlayer.mainPlayer.close();
                } else {
                    console.error('musicPlayer.mainPlayer.close not available');
                }
            };
            curtain.addEventListener('click', curtainHandler);
            curtain._curtainHandler = curtainHandler;
        }
        
        if (drawer) {
            if (drawer._resetTimerClick) {
                drawer.removeEventListener('click', drawer._resetTimerClick);
            }
            if (drawer._resetTimerTouch) {
                drawer.removeEventListener('touchstart', drawer._resetTimerTouch);
            }
            if (drawer._resetTimerScroll) {
                drawer.removeEventListener('scroll', drawer._resetTimerScroll);
            }
            
            const resetTimer = () => {
                if (typeof appState !== 'undefined' && appState.isPopupVisible && appState.currentTab !== MUSIC_PLAYER.tabs.playing) {
                    if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer && musicPlayer.mainPlayer.resetInactivityTimer) {
                        musicPlayer.mainPlayer.resetInactivityTimer();
                    }
                }
            };
            
            drawer.addEventListener('click', resetTimer);
            drawer.addEventListener('touchstart', resetTimer, { passive: true });
            drawer.addEventListener('scroll', resetTimer, { passive: true });
            
            drawer._resetTimerClick = resetTimer;
            drawer._resetTimerTouch = resetTimer;
            drawer._resetTimerScroll = resetTimer;
        }
    },

    dropDownMenu: () => {
        const {
            dropdownClose,
            favoriteSongs,
            favoriteArtists,
            favoriteAlbums,
            recentlyPlayed,
            queueView,
            createPlaylist,
            shuffleAll
        } = clickables.elements;
        
        if (dropdownClose) {
            clickables.removeListener(dropdownClose, '_dropdownCloseHandler');
            const dropdownCloseHandler = (e) => {
                e.stopPropagation();
                if (typeof dropdown !== 'undefined' && dropdown.close) {
                    dropdown.close();
                } else {
                    console.error('dropdown.close not available');
                }
            };
            dropdownClose.addEventListener('click', dropdownCloseHandler);
            dropdownClose._dropdownCloseHandler = dropdownCloseHandler;
        }
        
        if (favoriteSongs) {
            clickables.removeListener(favoriteSongs, '_favoriteSongsHandler');
            const favoriteSongsHandler = (e) => {
                e.stopPropagation();
                if (typeof dropdown !== 'undefined' && dropdown.close) {
                    dropdown.close();
                }
                if (typeof views !== 'undefined' && views.showFavoriteSongs) {
                    views.showFavoriteSongs();
                } else {
                    console.error('views.showFavoriteSongs not available');
                }
            };
            favoriteSongs.addEventListener('click', favoriteSongsHandler);
            favoriteSongs._favoriteSongsHandler = favoriteSongsHandler;
        }
        
        if (favoriteArtists) {
            clickables.removeListener(favoriteArtists, '_favoriteArtistsHandler');
            const favoriteArtistsHandler = (e) => {
                e.stopPropagation();
                if (typeof dropdown !== 'undefined' && dropdown.close) {
                    dropdown.close();
                }
                if (typeof views !== 'undefined' && views.showFavoriteArtists) {
                    views.showFavoriteArtists();
                } else {
                    console.error('views.showFavoriteArtists not available');
                }
            };
            favoriteArtists.addEventListener('click', favoriteArtistsHandler);
            favoriteArtists._favoriteArtistsHandler = favoriteArtistsHandler;
        }
        
        if (recentlyPlayed) {
            clickables.removeListener(recentlyPlayed, '_recentlyPlayedHandler');
            const recentlyPlayedHandler = (e) => {
                e.stopPropagation();
                if (typeof dropdown !== 'undefined' && dropdown.close) {
                    dropdown.close();
                }
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback) {
                    musicPlayer.playback.open();
                    setTimeout(() => {
                        if (musicPlayer.ui.switchTab) {
                            musicPlayer.ui.switchTab('playlist');
                        }
                    }, 100);
                } else {
                    console.error('musicPlayer.mainPlayer not available');
                }
            };
            recentlyPlayed.addEventListener('click', recentlyPlayedHandler);
            recentlyPlayed._recentlyPlayedHandler = recentlyPlayedHandler;
        }
        
        if (queueView) {
            clickables.removeListener(queueView, '_queueViewHandler');
            const queueViewHandler = (e) => {
                e.stopPropagation();
                if (typeof dropdown !== 'undefined' && dropdown.close) {
                    dropdown.close();
                }
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback) {
                    musicPlayer.playback.open();
                    setTimeout(() => {
                        if (musicPlayer.ui.switchTab) {
                            musicPlayer.ui.switchTab('queue');
                        }
                    }, 100);
                } else {
                    console.error('musicPlayer.mainPlayer not available');
                }
            };
            queueView.addEventListener('click', queueViewHandler);
            queueView._queueViewHandler = queueViewHandler;
        }
        
        if (createPlaylist) {
            clickables.removeListener(createPlaylist, '_createPlaylistHandler');
            const createPlaylistHandler = (e) => {
                e.stopPropagation();
                if (typeof dropdown !== 'undefined' && dropdown.close) {
                    dropdown.close();
                }
                if (typeof playlists !== 'undefined' && playlists.create) {
                    playlists.create();
                } else {
                    console.error('playlists.create not available');
                }
            };
            createPlaylist.addEventListener('click', createPlaylistHandler);
            createPlaylist._createPlaylistHandler = createPlaylistHandler;
        }
        
        if (shuffleAll) {
            clickables.removeListener(shuffleAll, '_shuffleAllHandler');
            const shuffleAllHandler = (e) => {
                e.stopPropagation();
                if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.shuffle && musicPlayer.playback.shuffle.all) {
                    musicPlayer.playback.shuffle.all();
                } else {
                    console.error('musicPlayer.playback.shuffle.all not available');
                }
            };
            shuffleAll.addEventListener('click', shuffleAllHandler);
            shuffleAll._shuffleAllHandler = shuffleAllHandler;
        }
    },

    others: () => {
        const { searchTrigger } = clickables.elements;
        
        if (searchTrigger) {
            clickables.removeListener(searchTrigger, '_searchHandler');
            const searchHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (typeof dropdown !== 'undefined' && dropdown.close) {
                    dropdown.close();
                }
                if (typeof appState !== 'undefined' && appState.router && appState.router.openSearchDialog) {
                    appState.router.openSearchDialog();
                } else {
                    console.error('appState.router.openSearchDialog not available');
                }
            };
            searchTrigger.addEventListener('click', searchHandler);
            searchTrigger._searchHandler = searchHandler;
        }
    },

    keyboard: () => {
        if (document._keyboardHandler) {
            document.removeEventListener('keydown', document._keyboardHandler);
        }
        
        const keyboardHandler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const shortcuts = {
                ' ': (e) => {
                    e.preventDefault();
                    if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.togglePlayPause) {
                        musicPlayer.playback.togglePlayPause();
                    }
                },
                'ArrowLeft': (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.previous) {
                            musicPlayer.playback.previous();
                        }
                    }
                },
                'ArrowRight': (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.next) {
                            musicPlayer.playback.next();
                        }
                    }
                },
                'KeyN': (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.open) {
                            musicPlayer.playback.open();
                        }
                    }
                },
                'KeyM': (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (typeof dropdown !== 'undefined' && dropdown.toggle) {
                            dropdown.toggle();
                        }
                    }
                },
                'KeyS': (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.shuffle && musicPlayer.playback.shuffle.toggle) {
                            musicPlayer.playback.shuffle.toggle();
                        }
                    }
                },
                'KeyR': (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.repeat && musicPlayer.playback.repeat.toggle) {
                            musicPlayer.playback.repeat.toggle();
                        }
                    }
                },
                'Escape': () => {
                    const drawer = QUERY(MUSIC_PLAYER.root);
                    if (drawer && drawer.classList.contains('open')) {
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.close) {
                            musicPlayer.playback.close();
                        }
                    }
                    
                    if (typeof dropdown !== 'undefined' && dropdown.close) {
                        dropdown.close();
                    }
                }
            };
            
            const handler = shortcuts[e.code] || shortcuts[e.key];
            if (handler) handler(e);
        };
        
        document.addEventListener('keydown', keyboardHandler);
        document._keyboardHandler = keyboardHandler;
    },

    document: () => {
        if (document._documentClickHandler) {
            document.removeEventListener('click', document._documentClickHandler);
        }
        
        const documentClickHandler = (e) => {
            const { dropdownMenu, menuBtn, drawer, musicPlayerBtn } = clickables.elements;
            
            if (dropdownMenu && !dropdownMenu.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
                if (typeof dropdown !== 'undefined' && dropdown.close) {
                    dropdown.close();
                }
            }
            
            if (typeof appState !== 'undefined' && appState.isPopupVisible) {
                const curtain = QUERY(`${MUSIC_PLAYER.root} .curtain`);
                if (drawer && !drawer.contains(e.target) && musicPlayerBtn && !musicPlayerBtn.contains(e.target) && e.target !== curtain) {
                    if (!curtain || !curtain.contains(e.target)) {
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.playback && musicPlayer.playback.close) {
                            musicPlayer.playback.close();
                        }
                    }
                }
            }
            
            const navItem = e.target.closest('[data-nav]');
            if (navItem) {
                e.preventDefault();
                const navType = navItem.dataset.nav;
                
                if (typeof dropdown !== 'undefined' && dropdown.close) {
                    dropdown.close();
                }
                
                if (typeof appState !== 'undefined' && appState.router) {
                    const router = appState.router;
                    
                    switch (navType) {
                        case 'home':
                            if (router.navigateTo) router.navigateTo('home');
                            break;
                        case 'allArtists':
                            if (router.navigateTo) router.navigateTo('allArtists');
                            break;
                        case 'artist':
                            const artistName = navItem.dataset.artist;
                            if (artistName && router.navigateTo) {
                                router.navigateTo('artist', { artist: artistName });
                            }
                            break;
                        case 'album':
                            const artist = navItem.dataset.artist;
                            const album = navItem.dataset.album;
                            if (artist && album && router.navigateTo) {
                                router.navigateTo('album', { artist, album });
                            }
                            break;
                    }
                }
            }
        };
        
        document.addEventListener('click', documentClickHandler);
        document._documentClickHandler = documentClickHandler;
    },

    removeListener: (element, handlerProp) => {
        if (element && element[handlerProp]) {
            const eventType = handlerProp.includes('touch') ? 'touchstart' : handlerProp.includes('scroll') ? 'scroll' : 'click';
            element.removeEventListener(eventType, element[handlerProp]);
            delete element[handlerProp];
        }
    },

    reinit: () => {
        clickables.init();
    }
};



////////////////////////////////////////////////////////////
///////////  Music Drawer & Android Media Session API //////
const musicPlayer = {
    state: {
        isDraggingHeader: false,
        dragStartY: 0,
        dragDistance: 0,
        isCollapsed: false,
        currentTab: 'playing',
        inactivityTimer: null,
        lastInteractionTime: null
    },

    init() {
        musicPlayer.ui.bindSeekBar();
        musicPlayer.playback.bindEvents();
        
        if (appState.audio) {
            appState.audio.addEventListener('timeupdate', musicPlayer.ui.updateProgress);
            appState.audio.addEventListener('loadedmetadata', musicPlayer.playback.onMetadataLoaded);
            appState.audio.addEventListener('play', musicPlayer.playback.onPlay);
            appState.audio.addEventListener('pause', musicPlayer.playback.onPause);
            appState.audio.addEventListener('ended', musicPlayer.playback.onEnded);
            appState.audio.addEventListener('error', musicPlayer.playback.onError);
            appState.audio.addEventListener('progress', musicPlayer.ui.updateBufferDisplay);
            appState.audio.addEventListener('canplay', () => {
                if (musicPlayer.ui.wasPlayingBeforeScrub) {
                    appState.audio.play();
                }
            });
        }
        
        musicPlayer.ui.updateTabs();
        musicPlayer.ui.addListItemInteractions();
    },

    helpers: {
        getNextInAlbum() {
            if (!appState.currentSong || !window.music) return null;
            const artist = window.music.find((a) => a.artist === appState.currentArtist);
            const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
            if (!album) return null;
            const currentIndex = album.songs.findIndex((s) => s.title === appState.currentSong.title);
            const nextIndex = appState.shuffleMode ? 
                Math.floor(Math.random() * album.songs.length) : 
                (currentIndex + 1) % album.songs.length;
            return album.songs[nextIndex];
        },

        getPrevInAlbum() {
            if (!appState.currentSong || !window.music) return null;
            const artist = window.music.find((a) => a.artist === appState.currentArtist);
            const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
            if (!album) return null;
            const currentIndex = album.songs.findIndex((s) => s.title === appState.currentSong.title);
            const prevIndex = appState.shuffleMode ? 
                Math.floor(Math.random() * album.songs.length) : 
                (currentIndex - 1 + album.songs.length) % album.songs.length;
            return album.songs[prevIndex];
        },

        createSongItem(song, index, type) {
            const item = create('div', { 
                className: 'musicPlayerListItem',
                'data-index': index,
                'data-type': type
            });
            
            item.innerHTML = `
                <div class="musicPlayerListItemArt">
                    <img src="${song.artwork || '/assets/default-artwork.jpg'}" alt="${song.title}" loading="lazy">
                </div>
                <div class="musicPlayerListItemInfo">
                    <div class="musicPlayerListItemTitle">${song.title}</div>
                    <div class="musicPlayerListItemArtist">${song.artist}</div>
                </div>
                <div class="musicPlayerListItemActions">
                    <button class="musicPlayerListItemAction" data-action="play" title="Play">
                        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    <button class="musicPlayerListItemAction" data-action="remove" title="Remove">
                        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                </div>
            `;
            
            return item;
        },

        handleFavoriteToggle() {
            const song = appState.currentSong;
            if (!song) return;
            
            const isFavorited = storage.isFavorite(song);
            
            if (isFavorited) {
                storage.removeFromFavorites(song);
            } else {
                storage.addToFavorites(song);
            }
            
            musicPlayer.ui.updateFavoriteButton(song);
        },

        handleListItemActions(e) {
            const action = e.target.closest('[data-action]');
            if (!action) return;
            
            const listItem = action.closest('.musicPlayerListItem');
            if (!listItem) return;
            
            const index = parseInt(listItem.dataset.index);
            const type = listItem.dataset.type;
            const actionType = action.dataset.action;
            
            switch (actionType) {
                case 'play':
                    if (type === 'queue' && appState.queue[index]) {
                        musicPlayer.playback.loadAndPlaySong(appState.queue[index]);
                    }
                    break;
                    
                case 'remove':
                    if (type === 'queue') {
                        appState.queue.splice(index, 1);
                        musicPlayer.ui.updateQueue();
                    }
                    break;
            }
        }
    },

    playback: {
        play() {
            if (appState.audio) {
                appState.audio.play();
            }
        },

        pause() {
            if (appState.audio) {
                appState.audio.pause();
            }
        },

        toggle() {
            if (!appState.audio) return;
            
            if (appState.audio.paused) {
                this.play();
            } else {
                this.pause();
            }
        },

        open() {
            const drawer = QUERY(MUSIC_PLAYER.root);
            if (!drawer) {
                console.warn("Music player drawer not found");
                return;
            }

            if (appState.currentSong) {
                musicPlayer.ui.updateNowPlaying();
            }

            drawer.classList.remove("closing");
            drawer.classList.add("open");

            appState.isPopupVisible = true;

            musicPlayer.ui.switchTab(MUSIC_PLAYER.tabs.playing);
            musicPlayer.playback.updateTabContent(MUSIC_PLAYER.tabs.playing);

            document.body.style.overflow = "hidden";

            musicPlayer.playback.startInactivityTimer();
        },

        close() {
            const drawer = QUERY(MUSIC_PLAYER.root);
            if (!drawer) {
                console.warn("Music player drawer not found");
                return;
            }

            musicPlayer.playback.stopInactivityTimer();

            drawer.classList.add("closing");
            drawer.classList.remove("open");

            setTimeout(() => {
                drawer.classList.remove("closing");
                appState.isPopupVisible = false;
                document.body.style.overflow = "";
                musicPlayer.ui.switchTab(MUSIC_PLAYER.tabs.playing);
            }, 550);
        },

        toggle() {
            const drawer = QUERY(MUSIC_PLAYER.root);
            if (!drawer) return;

            const isOpen = drawer.classList.contains("open");

            if (isOpen) {
                this.close();
            } else {
                this.open();
            }
        },

        startInactivityTimer() {
            this.stopInactivityTimer();

            musicPlayer.state.lastInteractionTime = Date.now();

            musicPlayer.state.inactivityTimer = setTimeout(() => {
                if (appState.currentTab !== MUSIC_PLAYER.tabs.playing) {
                    musicPlayer.ui.switchTab(MUSIC_PLAYER.tabs.playing);
                }
            }, 30000);
        },

        stopInactivityTimer() {
            if (musicPlayer.state.inactivityTimer) {
                clearTimeout(musicPlayer.state.inactivityTimer);
                musicPlayer.state.inactivityTimer = null;
            }
        },

        resetInactivityTimer() {
            const drawer = QUERY(MUSIC_PLAYER.root);
            if (drawer && drawer.classList.contains("open")) {
                if (appState.currentTab !== MUSIC_PLAYER.tabs.playing) {
                    this.startInactivityTimer();
                }
            }
        },

        updateTabContent(tabName) {
            if (tabName === MUSIC_PLAYER.tabs.recent) this.updateRecentTab();
            else if (tabName === MUSIC_PLAYER.tabs.queue) this.updateQueueTab();
        },

        updateQueueTab() {
            const queueList = QUERY(MUSIC_PLAYER.queueList);
            const queueCount = QUERY(MUSIC_PLAYER.queueCount);

            if (queueCount) {
                queueCount.textContent = appState.queue.length;
            }
            
            if (queueList) {
                musicPlayer.ui.renderQueueList(queueList);
            }
        },

        updateRecentTab() {
            const recentList = QUERY(MUSIC_PLAYER.recentList);
            const recentCount = QUERY(MUSIC_PLAYER.recentCount);

            if (recentCount) {
                recentCount.textContent = appState.recentlyPlayed.length;
            }
            
            if (recentList && appState.recentlyPlayed) {
                recentList.innerHTML = '';
                appState.recentlyPlayed.slice(0, 50).forEach((song, index) => {
                    const item = musicPlayer.helpers.createSongItem(song, index, 'recent');
                    recentList.appendChild(item);
                });
            }
        },

        next() {
            const nextSong = musicPlayer.helpers.getNextInAlbum();
            if (nextSong) {
                this.loadAndPlaySong(nextSong);
            }
        },

        previous() {
            if (appState.audio && appState.audio.currentTime > 3) {
                appState.audio.currentTime = 0;
                return;
            }
            
            const prevSong = musicPlayer.helpers.getPrevInAlbum();
            if (prevSong) {
                this.loadAndPlaySong(prevSong);
            }
        },

        rewind(seconds = 10) {
            if (appState.audio) {
                appState.audio.currentTime = Math.max(0, appState.audio.currentTime - seconds);
            }
        },

        fastForward(seconds = 10) {
            if (appState.audio) {
                const duration = appState.audio.duration || 0;
                appState.audio.currentTime = Math.min(duration, appState.audio.currentTime + seconds);
            }
        },

        shuffle() {
            appState.shuffleMode = !appState.shuffleMode;
            musicPlayer.ui.updateShuffleButton();
            storage.set('shuffleMode', appState.shuffleMode);
        },

        repeat() {
            const modes = window.REPEAT_MODES || { NONE: 0, ALL: 1, ONE: 2 };
            const currentMode = appState.repeatMode || modes.NONE;
            
            if (currentMode === modes.NONE) {
                appState.repeatMode = modes.ALL;
            } else if (currentMode === modes.ALL) {
                appState.repeatMode = modes.ONE;
            } else {
                appState.repeatMode = modes.NONE;
            }
            
            musicPlayer.ui.updateRepeatButton();
            storage.set('repeatMode', appState.repeatMode);
        },

        loadAndPlaySong(song) {
            if (!song) return;
            
            appState.currentSong = song;
            appState.currentArtist = song.artist;
            appState.currentAlbum = song.album;
            
            if (appState.audio) {
                appState.audio.src = song.src;
                appState.audio.load();
            }
            
            musicPlayer.ui.updateSongInfo(song);
            musicPlayer.ui.updateCoverArt(song);
            musicPlayer.ui.updateFavoriteButton(song);
            
            storage.addToRecentlyPlayed(song);
        },

        bindEvents() {
            const playBtn = QUERY(MUSIC_PLAYER.play);
            const prevBtn = QUERY(MUSIC_PLAYER.previous);
            const nextBtn = QUERY(MUSIC_PLAYER.next);
            const rewindBtn = QUERY(MUSIC_PLAYER.reWind);
            const forwardBtn = QUERY(MUSIC_PLAYER.fastForward);
            const shuffleBtn = QUERY(MUSIC_PLAYER.shuffleBtn);
            const repeatBtn = QUERY(MUSIC_PLAYER.repeatBtn);
            const favoriteBtn = QUERY(MUSIC_PLAYER.favoriteBtn);
            const closeBtn = QUERY(MUSIC_PLAYER.close);
            const tabs = QUERY_ALL('.musicPlayerTab');
            
            if (playBtn) {
                playBtn.addEventListener('click', musicPlayer.playback.toggle);
            }
            
            if (prevBtn) {
                prevBtn.addEventListener('click', musicPlayer.playback.previous);
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', musicPlayer.playback.next);
            }
            
            if (rewindBtn) {
                rewindBtn.addEventListener('click', () => musicPlayer.playback.rewind(10));
            }
            
            if (forwardBtn) {
                forwardBtn.addEventListener('click', () => musicPlayer.playback.fastForward(10));
            }
            
            if (shuffleBtn) {
                shuffleBtn.addEventListener('click', musicPlayer.playback.shuffle);
            }
            
            if (repeatBtn) {
                repeatBtn.addEventListener('click', musicPlayer.playback.repeat);
            }
            
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', musicPlayer.helpers.handleFavoriteToggle);
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', musicPlayer.playback.close);
            }
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => musicPlayer.ui.handleTabClick(tab));
            });
            
            document.addEventListener('click', musicPlayer.helpers.handleListItemActions);
        },

        onPlay() {
            appState.setPlayingState(true);
        },
        
        onPause() {
            appState.setPlayingState(false);
        },
        
        onError(error) {
            notifications.show("Audio playback error", "error");
        },
        
        onEnded() {
            if (appState.repeatMode === window.REPEAT_MODES?.ONE) {
                appState.audio.currentTime = 0;
                appState.audio.play();
                return;
            }
            musicPlayer.playback.next();
        },

        onMetadataLoaded() {
            const audio = appState.audio;
            if (!audio || !isFinite(audio.duration)) return;

            appState.duration = audio.duration;

            const totalTimeElement = QUERY(MUSIC_PLAYER.totalTime);
            if (totalTimeElement) {
                totalTimeElement.textContent = utils.formatTime(audio.duration);
            }

            musicPlayer.ui.updateProgress();
        },

        dispatchPlayerStateChange() {
            const detail = {
                isPlaying: appState.isPlaying,
                currentSong: appState.currentSong,
                currentTime: appState.audio?.currentTime ?? 0,
                totalTime: appState.audio?.duration ?? 0,
            };
            window.dispatchEvent(new CustomEvent("playerstatechange", { detail }));
        },

        togglePlayPause() {
            if (!appState.audio) return;
            if (appState.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        }
    },

    ui: {
        isScrubbing: false,
        wasPlayingBeforeScrub: false,

        bindSeekBar() {
            const progressContainer = document.querySelector('.progressBarContainer');
            const progressBar = QUERY(MUSIC_PLAYER.progressBar);
            const progressTrack = QUERY(MUSIC_PLAYER.progressFill);
            const progressThumb = QUERY(MUSIC_PLAYER.progressThumb);

            if (!progressContainer || !progressBar || !progressTrack || !progressThumb) {
                return;
            }

            const getProgressFromEvent = (e) => {
                const rect = progressBar.getBoundingClientRect();
                const clientX = e.clientX !== undefined ? e.clientX : 
                               (e.touches && e.touches[0]) ? e.touches[0].clientX : 
                               (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : 0;
                
                let percentage = ((clientX - rect.left) / rect.width) * 100;
                return Math.max(0, Math.min(100, percentage));
            };

            const updateVisuals = (percentage, seekTime = null) => {
                progressTrack.style.width = `${percentage}%`;
                progressThumb.style.left = `${percentage}%`;
                
                if (seekTime !== null && isFinite(seekTime)) {
                    const currentTimeElement = QUERY(MUSIC_PLAYER.currentTime);
                    if (currentTimeElement) {
                        currentTimeElement.textContent = utils.formatTime(seekTime);
                    }
                }
            };

            const seekToPosition = (e, commit = false) => {
                const percentage = getProgressFromEvent(e);
                const duration = appState.audio?.duration || 0;
                const seekTime = (duration * percentage) / 100;

                updateVisuals(percentage, seekTime);

                if (commit && appState.audio && isFinite(seekTime)) {
                    appState.audio.currentTime = seekTime;
                    
                    if (window.notificationPlayer?.positionState) {
                        notificationPlayer.positionState.update();
                    }
                }
            };

            const startSeeking = (e) => {
                e.preventDefault();
                
                this.isScrubbing = true;
                this.wasPlayingBeforeScrub = !appState.audio?.paused;
                
                if (this.wasPlayingBeforeScrub && appState.audio) {
                    appState.audio.pause();
                }

                progressContainer.classList.add('dragging');
                progressBar.classList.add(CLASSES.isDragging || 'isDragging');
                progressThumb.classList.add('dragging');

                if (progressBar.setPointerCapture) {
                    progressBar.setPointerCapture(e.pointerId || 1);
                }

                seekToPosition(e, false);

                const handleMove = (moveEvent) => {
                    if (!this.isScrubbing) return;
                    moveEvent.preventDefault();
                    seekToPosition(moveEvent, false);
                };

                const handleEnd = (endEvent) => {
                    if (!this.isScrubbing) return;
                    
                    seekToPosition(endEvent, true);
                    
                    this.isScrubbing = false;
                    progressContainer.classList.remove('dragging');
                    progressBar.classList.remove(CLASSES.isDragging || 'isDragging');
                    progressThumb.classList.remove('dragging');

                    if (progressBar.releasePointerCapture) {
                        progressBar.releasePointerCapture(endEvent.pointerId || 1);
                    }

                    if (this.wasPlayingBeforeScrub && appState.audio) {
                        appState.audio.play();
                    }

                    document.removeEventListener('pointermove', handleMove);
                    document.removeEventListener('pointerup', handleEnd);
                    document.removeEventListener('touchmove', handleMove);
                    document.removeEventListener('touchend', handleEnd);
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', handleEnd);
                };

                document.addEventListener('pointermove', handleMove, { passive: false });
                document.addEventListener('pointerup', handleEnd, { once: true });
                document.addEventListener('touchmove', handleMove, { passive: false });
                document.addEventListener('touchend', handleEnd, { once: true });
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd, { once: true });
            };

            const handleHoverStart = () => {
                progressBar.classList.add(CLASSES.isHovering || 'isHovering');
                progressContainer.classList.add('hovering');
            };

            const handleHoverEnd = () => {
                if (!this.isScrubbing) {
                    progressBar.classList.remove(CLASSES.isHovering || 'isHovering');
                    progressContainer.classList.remove('hovering');
                }
            };

            progressBar.addEventListener('pointerdown', startSeeking);
            progressBar.addEventListener('mousedown', startSeeking);
            progressBar.addEventListener('touchstart', startSeeking, { passive: false });
            
            progressBar.addEventListener('pointerenter', handleHoverStart);
            progressBar.addEventListener('pointerleave', handleHoverEnd);
            progressBar.addEventListener('mouseenter', handleHoverStart);
            progressBar.addEventListener('mouseleave', handleHoverEnd);

            progressBar.addEventListener('keydown', (e) => {
                const duration = appState.audio?.duration || 0;
                let timeChange = 0;

                switch (e.key) {
                    case 'ArrowLeft':
                        timeChange = -5;
                        break;
                    case 'ArrowRight':
                        timeChange = 5;
                        break;
                    case 'Home':
                        if (appState.audio) {
                            appState.audio.currentTime = 0;
                            e.preventDefault();
                        }
                        return;
                    case 'End':
                        if (appState.audio) {
                            appState.audio.currentTime = duration;
                            e.preventDefault();
                        }
                        return;
                    default:
                        return;
                }

                if (timeChange !== 0 && appState.audio) {
                    const newTime = Math.max(0, Math.min(duration, appState.audio.currentTime + timeChange));
                    appState.audio.currentTime = newTime;
                    e.preventDefault();
                }
            });
        },

        updateProgress() {
            if (this.isScrubbing) return;

            const audio = appState.audio;
            if (!audio || !isFinite(audio.duration) || audio.duration === 0) return;

            const currentTime = audio.currentTime || 0;
            const duration = audio.duration;
            const percentage = (currentTime / duration) * 100;

            const progressTrack = QUERY(MUSIC_PLAYER.progressFill);
            const progressThumb = QUERY(MUSIC_PLAYER.progressThumb);
            const currentTimeElement = QUERY(MUSIC_PLAYER.currentTime);
            const totalTimeElement = QUERY(MUSIC_PLAYER.totalTime);

            if (progressTrack) {
                progressTrack.style.width = `${percentage}%`;
            }

            if (progressThumb) {
                progressThumb.style.left = `${percentage}%`;
            }

            if (currentTimeElement) {
                currentTimeElement.textContent = utils.formatTime(currentTime);
            }

            if (totalTimeElement) {
                totalTimeElement.textContent = utils.formatTime(duration);
            }

            this.updateBufferDisplay();

            if (window.notificationPlayer?.positionState) {
                notificationPlayer.positionState.update();
            }
        },

        setProgressUI(percent, currentTime) {
            const fill = QUERY(MUSIC_PLAYER.progressFill);
            const thumb = QUERY(MUSIC_PLAYER.progressThumb);
            const currentTimeElement = QUERY(MUSIC_PLAYER.currentTime);

            if (fill) {
                fill.style.width = `${percent}%`;
            }

            if (thumb) {
                thumb.style.left = `${percent}%`;
            }

            if (currentTimeElement && isFinite(currentTime)) {
                currentTimeElement.textContent = utils.formatTime(currentTime);
            }
        },

        updateBufferDisplay() {
            const buffer = QUERY(MUSIC_PLAYER.progressBuffer);
            if (!buffer || !appState.audio) return;

            const audio = appState.audio;
            if (!audio.buffered || audio.buffered.length === 0 || !isFinite(audio.duration) || audio.duration === 0) {
                buffer.style.width = "0%";
                return;
            }

            let bufferedEnd = 0;
            for (let i = 0; i < audio.buffered.length; i++) {
                const end = audio.buffered.end(i);
                if (end > bufferedEnd) {
                    bufferedEnd = end;
                }
            }

            const bufferPercentage = Math.min(100, (bufferedEnd / audio.duration) * 100);
            buffer.style.width = `${bufferPercentage}%`;
        },

        updateTabs() {
            const tabs = QUERY_ALL('.musicPlayerTab');
            const activeTab = QUERY('.musicPlayerTab.active');
            const tabSlider = QUERY('.musicPlayerTabSlider');
            
            if (activeTab && tabSlider) {
                const activeIndex = Array.from(tabs).indexOf(activeTab);
                const slideDistance = activeIndex * 100;
                tabSlider.style.transform = `translateX(${slideDistance}%)`;
            }
        },

        updateCoverArt(song) {
            const albumArtwork = QUERY(MUSIC_PLAYER.albumArtwork);
            const coverGlow = QUERY(MUSIC_PLAYER.coverGlow);
            
            if (albumArtwork && song?.artwork) {
                albumArtwork.src = song.artwork;
                albumArtwork.alt = `${song.title} by ${song.artist}`;
                
                if (coverGlow) {
                    coverGlow.style.backgroundImage = `url(${song.artwork})`;
                }
            }
        },

        updateSongInfo(song) {
            const songName = QUERY(MUSIC_PLAYER.songName);
            const artistName = QUERY(MUSIC_PLAYER.artistName);
            const albumName = QUERY(MUSIC_PLAYER.albumName);
            
            if (songName && song?.title) {
                songName.textContent = song.title;
            }
            
            if (artistName && song?.artist) {
                artistName.textContent = song.artist;
            }
            
            if (albumName && song?.album) {
                albumName.textContent = song.album;
            }
        },

        updatePlaybackState(isPlaying) {
            const playBtn = QUERY(MUSIC_PLAYER.play);
            const playIcon = playBtn?.querySelector('.playIcon');
            const pauseIcon = playBtn?.querySelector('.pauseIcon');
            
            if (playIcon && pauseIcon) {
                if (isPlaying) {
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'block';
                } else {
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                }
            }
        },

        updateRepeatButton() {
            const repeatBtn = QUERY(MUSIC_PLAYER.repeatBtn);
            if (!repeatBtn) return;
            
            repeatBtn.classList.remove(CLASSES.active, CLASSES.repeatOne);
            
            if (appState.repeatMode === window.REPEAT_MODES?.ALL) {
                repeatBtn.classList.add(CLASSES.active);
            } else if (appState.repeatMode === window.REPEAT_MODES?.ONE) {
                repeatBtn.classList.add(CLASSES.active, CLASSES.repeatOne);
            }
        },

        updateShuffleButton() {
            const shuffleBtn = QUERY(MUSIC_PLAYER.shuffleBtn);
            if (!shuffleBtn) return;
            
            if (appState.shuffleMode) {
                shuffleBtn.classList.add(CLASSES.active);
            } else {
                shuffleBtn.classList.remove(CLASSES.active);
            }
        },

        updateFavoriteButton(song) {
            const favoriteBtn = QUERY(MUSIC_PLAYER.favoriteBtn);
            if (!favoriteBtn || !song) return;
            
            const isFavorited = storage.isFavorite(song);
            
            if (isFavorited) {
                favoriteBtn.classList.add(CLASSES.favorited);
            } else {
                favoriteBtn.classList.remove(CLASSES.favorited);
            }
        },

        updateQueue() {
            const queueList = QUERY(MUSIC_PLAYER.queueList);
            const queueCount = QUERY(MUSIC_PLAYER.queueCount);
            
            if (queueCount) {
                queueCount.textContent = appState.queue.length;
            }
            
            if (queueList) {
                this.renderQueueList(queueList);
            }
        },

        renderQueueList(container) {
            if (!container) return;
            
            container.innerHTML = '';
            
            if (appState.queue.length === 0) {
                const empty = create('div', { className: 'musicPlayerEmpty' });
                empty.innerHTML = `
                    <div class="musicPlayerEmptyIcon">
                        <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    </div>
                    <div class="musicPlayerEmptyText">Queue is empty</div>
                    <div class="musicPlayerEmptySubtext">Add songs to see them here</div>
                `;
                container.appendChild(empty);
                return;
            }
            
            appState.queue.forEach((song, index) => {
                const item = musicPlayer.helpers.createSongItem(song, index, 'queue');
                container.appendChild(item);
            });
        },

        handleTabClick(tab) {
            const tabs = QUERY_ALL('.musicPlayerTab');
            const contents = QUERY_ALL('.musicPlayerContent');
            
            tabs.forEach(t => t.classList.remove(CLASSES.active));
            contents.forEach(c => c.classList.remove(CLASSES.active));
            
            tab.classList.add(CLASSES.active);
            
            const targetContent = QUERY(`.musicPlayerContent[data-tab="${tab.dataset.tab}"]`);
            if (targetContent) {
                targetContent.classList.add(CLASSES.active);
            }
            
            this.updateTabs();
            musicPlayer.state.currentTab = tab.dataset.tab;
        },

        switchTab(tabName) {
            const targetTab = QUERY(`.musicPlayerTab[data-tab="${tabName}"]`);
            if (targetTab) {
                this.handleTabClick(targetTab);
            }
        },

        handleHeaderDragStart(e) {
            const coverWrapper = QUERY(MUSIC_PLAYER.coverWrapper);
            if (!coverWrapper) return;
            
            musicPlayer.state.isDraggingHeader = true;
            musicPlayer.state.dragStartY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            musicPlayer.state.dragDistance = 0;
        },
        
        handleHeaderDragMove(e) {
            if (!musicPlayer.state.isDraggingHeader) return;
            
            const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            musicPlayer.state.dragDistance = currentY - musicPlayer.state.dragStartY;
            
            if (musicPlayer.state.isCollapsed && musicPlayer.state.dragDistance < 0) {
                return;
            }
            
            if (!musicPlayer.state.isCollapsed && musicPlayer.state.dragDistance > 0) {
                return;
            }
        },
        
        handleHeaderDragEnd() {
            if (!musicPlayer.state.isDraggingHeader) return;
            
            musicPlayer.state.isDraggingHeader = false;
            
            const dragThreshold = 60;
            
            if (Math.abs(musicPlayer.state.dragDistance) > dragThreshold) {
                if (musicPlayer.state.dragDistance < 0 && !musicPlayer.state.isCollapsed) {
                    musicPlayer.state.collapseHeader();
                } else if (musicPlayer.state.dragDistance > 0 && musicPlayer.state.isCollapsed) {
                    musicPlayer.state.expandHeader();
                }
            }
            
            musicPlayer.state.dragDistance = 0;
        },

        addListItemInteractions() {
            const listItems = QUERY_ALL('.musicPlayerListItem');
            
            listItems.forEach(item => {
                const artwork = item.querySelector('.musicPlayerListItemArt img');
                if (!artwork) return;
                
                let wrapper = artwork.parentElement;
                if (!wrapper.classList.contains('musicPlayerListItemArtwork')) {
                    wrapper = create('div', { className: 'musicPlayerListItemArtwork' });
                    artwork.parentNode.insertBefore(wrapper, artwork);
                    wrapper.appendChild(artwork);
                }
                
                if (!wrapper.querySelector('.musicPlayerListItemPlayOverlay')) {
                    const overlay = create('div', { className: 'musicPlayerListItemPlayOverlay' });
                    overlay.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
                    wrapper.appendChild(overlay);
                }
            });
        },

        async playSong(songData) {
            if (!songData) return;
            
            this.initialize();
            
            if (window.ui && ui.setLoadingState) {
                ui.setLoadingState(true);
            }

            if (appState.currentSong && appState.currentSong.id !== songData.id) {
                this.addToRecentlyPlayed(appState.currentSong);
            }

            appState.setCurrentSong(songData);

            this.updateNavbar();
            this.updateNowPlaying();

            if (window.ui) {
                if (ui.updateCounts) ui.updateCounts();
            }

            const success = await this.loadAudioFile(songData);
            
            if (success) {
                if (window.notificationPlayer && notificationPlayer.metadata) {
                    notificationPlayer.metadata.update(songData);
                }
                if (window.notificationPlayer && notificationPlayer.events) {
                    notificationPlayer.events.bind();
                }
                setTimeout(() => {
                    if (window.clickables && clickables.musicPlayer) {
                        clickables.musicPlayer();
                    }
                    this.bindSeekBar();
                }, 100);
                musicPlayer.playback.dispatchPlayerStateChange();
            } else {
                this.addToRecentlyPlayed(songData);
                
                appState.setPlayingState(false);
                if (window.ui && ui.updatePlayPauseButtons) {
                    ui.updatePlayPauseButtons();
                }
                if (window.notificationPlayer && notificationPlayer.playbackState) {
                    notificationPlayer.playbackState.onPause();
                }
                musicPlayer.playback.dispatchPlayerStateChange();
            }

            if (window.ui && ui.setLoadingState) {
                ui.setLoadingState(false);
            }
        },

        async loadAudioFile(songData) {
            if (!songData || !songData.id) return false;
            
            const sourceUrl = songData.url || songData.src;
            
            if (!sourceUrl) return false;

            try {
                if (appState.audio) {
                    appState.audio.pause();
                    appState.audio.src = '';
                }

                appState.audio = new Audio();
                appState.audio.preload = 'auto';
                appState.audio.src = sourceUrl;

                appState.audio.addEventListener('loadedmetadata', musicPlayer.playback.onMetadataLoaded);
                appState.audio.addEventListener('timeupdate', this.updateProgress.bind(this));
                appState.audio.addEventListener('play', musicPlayer.playback.onPlay);
                appState.audio.addEventListener('pause', musicPlayer.playback.onPause);
                appState.audio.addEventListener('ended', musicPlayer.playback.onEnded);
                appState.audio.addEventListener('error', musicPlayer.playback.onError);
                appState.audio.addEventListener('progress', this.updateBufferDisplay.bind(this));

                await appState.audio.load();
                await appState.audio.play();
                
                return true;
            } catch (error) {
                console.error('Error loading audio:', error);
                return false;
            }
        },

        addToRecentlyPlayed(song) {
            if (!song) return;
            
            appState.recentlyPlayed = appState.recentlyPlayed.filter(s => s.id !== song.id);
            appState.recentlyPlayed.unshift(song);
            appState.recentlyPlayed = appState.recentlyPlayed.slice(0, 50);
            
            if (window.storage) {
                storage.save('recentlyPlayed', appState.recentlyPlayed);
            }
        },

        updateNavbar() {
            const nowPlayingArea = QUERY(NAVBAR.nowPlaying);
            if (nowPlayingArea && appState.currentSong) {
                nowPlayingArea.classList.add(CLASSES.hasSong);
                
                const albumArt = nowPlayingArea.querySelector('.albumArtwork');
                const songName = nowPlayingArea.querySelector('.songName');
                const artistName = nowPlayingArea.querySelector('.artistName');
                
                if (albumArt && appState.currentSong.cover) {
                    albumArt.src = appState.currentSong.cover;
                }
                
                if (songName) {
                    songName.textContent = appState.currentSong.title;
                }
                
                if (artistName) {
                    artistName.textContent = appState.currentSong.artist;
                }
            }
        },

        updateNowPlaying() {
            if (!appState.currentSong) return;
            
            const song = appState.currentSong;
            const coverUrl = song.cover || song.artwork;
            
            this.updateCoverArt(song);
            this.updateSongInfo(song);
            this.updateFavoriteButton(song);
            
            const playBtn = QUERY(MUSIC_PLAYER.play);
            const drawer = QUERY(MUSIC_PLAYER.root);
            
            if (playBtn) {
                const playIcon = playBtn.querySelector('.playIcon');
                const pauseIcon = playBtn.querySelector('.pauseIcon');
                
                if (appState.isPlaying) {
                    if (playIcon) playIcon.style.display = 'none';
                    if (pauseIcon) pauseIcon.style.display = 'block';
                    if (drawer) drawer.classList.add('playing');
                } else {
                    if (playIcon) playIcon.style.display = 'block';
                    if (pauseIcon) pauseIcon.style.display = 'none';
                    if (drawer) drawer.classList.remove('playing');
                }
            }
        },

        initialize() {
            if (this._initialized) return;
            this._initialized = true;
            
            this.bindSeekBar();
        },

        updateHomeBentoGrid() {
            const dynamicContent = QUERY('#dynamic-content');
            if (!dynamicContent) return;
            
            const bentoGrid = dynamicContent.querySelector('.bento-grid');
            if (!bentoGrid) return;
            
            const recentlyPlayedSection = QUERY('#recently-played-section');
            if (recentlyPlayedSection && appState.recentlyPlayed && appState.recentlyPlayed.length > 0) {
                const recentTracksHtml = render.homeSection.recentlyPlayed(
                    appState.recentlyPlayed.slice(0, 5),
                    utils
                );
                recentlyPlayedSection.innerHTML = recentTracksHtml;
                
                this.bindHomeBentoEvents(recentlyPlayedSection);
            }
        },
        
        bindHomeBentoEvents(container) {
            if (!container) return;
            
            container.querySelectorAll('.modern-track-item, .track-play-btn').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const songDataStr = item.closest('[data-song]')?.dataset.song;
                    if (songDataStr) {
                        try {
                            const songData = JSON.parse(songDataStr);
                            this.playSong(songData);
                        } catch (error) {
                            console.error('Error parsing song data:', error);
                        }
                    }
                });
            });
            
            container.querySelectorAll('[data-artist]').forEach(artistEl => {
                artistEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const artistName = artistEl.dataset.artist;
                    if (appState.router) {
                        appState.router.navigateTo('artist', { artist: artistName });
                    }
                });
            });
            
            container.querySelectorAll('.track-favorite-btn, .favorite-heart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const songItem = btn.closest('[data-song]');
                    if (songItem) {
                        const songDataStr = songItem.dataset.song;
                        try {
                            const songData = JSON.parse(songDataStr);
                            if (storage.isFavorite) {
                                const wasFavorite = storage.isFavorite(songData);
                                if (wasFavorite) {
                                    storage.removeFromFavorites(songData);
                                } else {
                                    storage.addToFavorites(songData);
                                }
                                btn.classList.toggle('active', !wasFavorite);
                            }
                        } catch (error) {
                            console.error('Error toggling favorite:', error);
                        }
                    }
                });
            });
        },

        updatePlayPauseUI(isPlaying) {
            const playBtn = QUERY(MUSIC_PLAYER.play);
            if (playBtn) {
                const playIcon = playBtn.querySelector('.playIcon');
                const pauseIcon = playBtn.querySelector('.pauseIcon');
                if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
                if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
            }
        },

        updateNowPlayingUI(song) {
            if (!song) return;
            
            const coverUrl = song.cover || song.artwork;
            const cover = QUERY(MUSIC_PLAYER.albumArtwork);
            if (cover && coverUrl) cover.src = coverUrl;
            
            const updateText = (selector, text) => {
                const el = QUERY(selector);
                if (el && text) el.textContent = text;
            };
            
            updateText(MUSIC_PLAYER.songName, song.title);
            updateText(MUSIC_PLAYER.artistName, song.artist);
            updateText(MUSIC_PLAYER.albumName, song.album);
        },

        updateNavbarUI(song) {
            const nowPlayingArea = QUERY('#now-playing-area');
            if (nowPlayingArea && song) {
                nowPlayingArea.classList.add('has-song');
                
                const albumArt = nowPlayingArea.querySelector('.albumArtwork');
                const songName = nowPlayingArea.querySelector('.songName');
                const artistName = nowPlayingArea.querySelector('.artistName');
                
                if (albumArt && song.cover) {
                    albumArt.src = song.cover;
                }
                
                if (songName) {
                    songName.textContent = song.title;
                }
                
                if (artistName) {
                    artistName.textContent = song.artist;
                }
            }
        },

        updateProgressUI(currentTime, duration) {
            const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
            this.setProgressUI(percent, currentTime);
            
            const totalTimeElement = QUERY(MUSIC_PLAYER.totalTime);
            if (totalTimeElement) {
                totalTimeElement.textContent = utils.formatTime(duration);
            }
        },

        updateShuffleUI(shuffleMode) {
            const shuffleBtn = QUERY(MUSIC_PLAYER.shuffleBtn);
            if (shuffleBtn) {
                shuffleBtn.classList.toggle('active', shuffleMode);
                shuffleBtn.setAttribute("aria-pressed", shuffleMode);
            }
        },
        
        updateRepeatUI(repeatMode) {
            const repeatBtn = QUERY(MUSIC_PLAYER.repeatBtn);
            if (repeatBtn) {
                repeatBtn.classList.toggle('active', repeatMode !== 0);
                repeatBtn.setAttribute("aria-pressed", repeatMode !== 0);
            }
        },

        setupSubscriptions() {
            if (window.PubSub && window.PLAYER_EVENTS) {
                PubSub.subscribe(PLAYER_EVENTS.PLAYBACK_STATE, (data) => {
                    this.updatePlayPauseUI(data.isPlaying);
                });
                
                PubSub.subscribe(PLAYER_EVENTS.CURRENT_SONG, (data) => {
                    this.updateNowPlayingUI(data.currentSong);
                    this.updateNavbarUI(data.currentSong);
                });
                
                PubSub.subscribe(PLAYER_EVENTS.TIME_UPDATE, (data) => {
                    this.updateProgressUI(data.currentTime, data.duration);
                });
                
                PubSub.subscribe(PLAYER_EVENTS.SHUFFLE_MODE, (data) => {
                    this.updateShuffleUI(data.shuffleMode);
                });
                
                PubSub.subscribe(PLAYER_EVENTS.REPEAT_MODE, (data) => {
                    this.updateRepeatUI(data.repeatMode);
                });
                
                PubSub.subscribe(PLAYER_EVENTS.RECENTLY_PLAYED_CHANGED, (data) => {
                    if (appState.currentTab === 'recent') {
                        musicPlayer.playback.updateRecentTab();
                    }
                    this.updateHomeBentoGrid();
                });
            }
        },

        onPlay() {
            appState.setPlayingState(true);
            if (window.PubSub && window.PLAYER_EVENTS) {
                PubSub.publish(PLAYER_EVENTS.PLAYBACK_STATE, { isPlaying: true });
            }
        },
        
        onPause() {
            appState.setPlayingState(false);
            if (window.PubSub && window.PLAYER_EVENTS) {
                PubSub.publish(PLAYER_EVENTS.PLAYBACK_STATE, { isPlaying: false });
            }
        },
        
        onError(error) {
            if (window.notifications) {
                notifications.show("Audio playback error", "error");
            }
        },
        
        onEnded() {
            if (appState.repeatMode === 2) {
                appState.audio.currentTime = 0;
                appState.audio.play();
                return;
            }
            musicPlayer.playback.next();
        }
    }
};
const notificationPlayer = {
  state: {
    isInitialized: false,
    supportedActions: new Set(),
    currentMetadata: null,
    positionUpdateInterval: null,
    lastPositionUpdate: 0
  },

  metadata: {
    generateArtworkUrl: (albumName) => {
      if (!albumName) return utils.getDefaultAlbumImage();
      const cleanName = albumName
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^\w]/g, '');
      return `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-mobile-layout-issues/global/content/images/albumCovers/${cleanName}.png`;
    },

    createArtworkArray: (artworkUrl) => {
      if (!artworkUrl) return [];
      const sizes = [96, 128, 192, 256, 384, 512];
      return sizes.map(size => ({
        src: artworkUrl,
        sizes: `${size}x${size}`,
        type: 'image/png'
      }));
    },

    update: (songData) => {
      if (!('mediaSession' in navigator) || !songData) return;

      try {
        let artworkUrl = songData.cover;
        if (!artworkUrl && songData.album) {
          artworkUrl = notificationPlayer.metadata.generateArtworkUrl(songData.album);
        }

        const artwork = notificationPlayer.metadata.createArtworkArray(artworkUrl);

        const metadata = new MediaMetadata({
          title: songData.title || "Unknown Song",
          artist: songData.artist || "Unknown Artist", 
          album: songData.album || "Unknown Album",
          artwork: artwork
        });

        navigator.mediaSession.metadata = metadata;
        notificationPlayer.state.currentMetadata = metadata;

        notificationPlayer.positionState.update();

      } catch (error) {
      }
    },

    clear: () => {
      if (!('mediaSession' in navigator)) return;
      try {
        navigator.mediaSession.metadata = null;
        notificationPlayer.state.currentMetadata = null;
      } catch (error) {
      }
    }
  },

  positionState: {
    update: () => {
      if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) {
        return;
      }

      if (!appState.audio) return;

      try {
        const duration = appState.duration || appState.audio.duration || 0;
        const currentTime = appState.audio.currentTime || 0;
        const playbackRate = appState.audio.playbackRate || 1.0;

        if (isFinite(duration) && duration > 0 && isFinite(currentTime) && currentTime >= 0) {
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: playbackRate,
            position: Math.min(currentTime, duration)
          });

          notificationPlayer.state.lastPositionUpdate = Date.now();
        }
      } catch (error) {
      }
    },

    reset: () => {
      if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) {
        return;
      }

      try {
        navigator.mediaSession.setPositionState(null);
      } catch (error) {
      }
    },

    startContinuousUpdate: () => {
      notificationPlayer.positionState.stopContinuousUpdate();
      notificationPlayer.state.positionUpdateInterval = setInterval(() => {
        notificationPlayer.positionState.update();
      }, 1000);
    },

    stopContinuousUpdate: () => {
      if (notificationPlayer.state.positionUpdateInterval) {
        clearInterval(notificationPlayer.state.positionUpdateInterval);
        notificationPlayer.state.positionUpdateInterval = null;
      }
    }
  },

  playbackState: {
    update: (state) => {
      if (!('mediaSession' in navigator)) return;

      try {
        navigator.mediaSession.playbackState = state;
        
        if (state === 'playing') {
          notificationPlayer.positionState.startContinuousUpdate();
        } else {
          notificationPlayer.positionState.stopContinuousUpdate();
        }
        
        notificationPlayer.positionState.update();
      } catch (error) {
      }
    },

    onPlay: () => {
      notificationPlayer.playbackState.update('playing');
    },

    onPause: () => {
      notificationPlayer.playbackState.update('paused');
    },

    onStop: () => {
      notificationPlayer.playbackState.update('none');
      notificationPlayer.positionState.reset();
    },

    onEnded: () => {
      notificationPlayer.playbackState.update('paused');
      notificationPlayer.positionState.reset();
    }
  },

  actions: {
    play: () => {
      try {
        if (appState.audio && appState.audio.paused) {
          appState.audio.play();
        } else if (musicPlayer.playback && musicPlayer.playback.play) {
          musicPlayer.playback.play();
        }
      } catch (error) {
      }
    },

    pause: () => {
      try {
        if (appState.audio && !appState.audio.paused) {
          appState.audio.pause();
        } else if (musicPlayer.playback && musicPlayer.playback.pause) {
          musicPlayer.playback.pause();
        }
      } catch (error) {
      }
    },

    stop: () => {
      try {
        if (appState.audio) {
          appState.audio.pause();
          appState.audio.currentTime = 0;
        }
        notificationPlayer.playbackState.onStop();
      } catch (error) {
      }
    },

    previoustrack: () => {
      try {
        if (appState.audio && appState.audio.currentTime > 3) {
          appState.audio.currentTime = 0;
          notificationPlayer.positionState.update();
        } else {
          if (musicPlayer.playback && musicPlayer.playback.previous) {
            musicPlayer.playback.previous();
          }
        }
      } catch (error) {
      }
    },

    nexttrack: () => {
      try {
        if (musicPlayer.playback && musicPlayer.playback.next) {
          musicPlayer.playback.next();
        }
      } catch (error) {
      }
    },

    seekto: (details) => {
      try {
        if (!appState.audio || !details || typeof details.seekTime !== 'number') return;

        const seekTime = Math.max(0, Math.min(details.seekTime, appState.audio.duration || 0));
        
        if (details.fastSeek && 'fastSeek' in appState.audio) {
          appState.audio.fastSeek(seekTime);
        } else {
          appState.audio.currentTime = seekTime;
        }
        
        notificationPlayer.positionState.update();
      } catch (error) {
      }
    },

    seekbackward: (details) => {
      try {
        const skipTime = details?.seekOffset || 10;
        if (appState.audio) {
          const newTime = Math.max(appState.audio.currentTime - skipTime, 0);
          appState.audio.currentTime = newTime;
          notificationPlayer.positionState.update();
        }
      } catch (error) {
      }
    },

    seekforward: (details) => {
      try {
        const skipTime = details?.seekOffset || 10;
        if (appState.audio) {
          const duration = appState.duration || appState.audio.duration || 0;
          const newTime = Math.min(appState.audio.currentTime + skipTime, duration);
          appState.audio.currentTime = newTime;
          notificationPlayer.positionState.update();
        }
      } catch (error) {
      }
    }
  },

  events: {
    bind: () => {
      if (!appState.audio) return;

      notificationPlayer.events.unbind();

      const eventHandlers = notificationPlayer.events.handlers;
      
      appState.audio.addEventListener('loadstart', eventHandlers.onLoadStart);
      appState.audio.addEventListener('loadedmetadata', eventHandlers.onLoadedMetadata);
      appState.audio.addEventListener('loadeddata', eventHandlers.onLoadedData);
      appState.audio.addEventListener('canplay', eventHandlers.onCanPlay);
      appState.audio.addEventListener('play', eventHandlers.onPlay);
      appState.audio.addEventListener('pause', eventHandlers.onPause);
      appState.audio.addEventListener('ended', eventHandlers.onEnded);
      appState.audio.addEventListener('timeupdate', eventHandlers.onTimeUpdate);
      appState.audio.addEventListener('durationchange', eventHandlers.onDurationChange);
      appState.audio.addEventListener('ratechange', eventHandlers.onRateChange);
      appState.audio.addEventListener('seeked', eventHandlers.onSeeked);
      appState.audio.addEventListener('error', eventHandlers.onError);
    },

    unbind: () => {
      if (!appState.audio) return;

      const eventHandlers = notificationPlayer.events.handlers;
      
      appState.audio.removeEventListener('loadstart', eventHandlers.onLoadStart);
      appState.audio.removeEventListener('loadedmetadata', eventHandlers.onLoadedMetadata);
      appState.audio.removeEventListener('loadeddata', eventHandlers.onLoadedData);
      appState.audio.removeEventListener('canplay', eventHandlers.onCanPlay);
      appState.audio.removeEventListener('play', eventHandlers.onPlay);
      appState.audio.removeEventListener('pause', eventHandlers.onPause);
      appState.audio.removeEventListener('ended', eventHandlers.onEnded);
      appState.audio.removeEventListener('timeupdate', eventHandlers.onTimeUpdate);
      appState.audio.removeEventListener('durationchange', eventHandlers.onDurationChange);
      appState.audio.removeEventListener('ratechange', eventHandlers.onRateChange);
      appState.audio.removeEventListener('seeked', eventHandlers.onSeeked);
      appState.audio.removeEventListener('error', eventHandlers.onError);
    },

    handlers: {
      onLoadStart: () => {
        notificationPlayer.playbackState.update('none');
      },

      onLoadedMetadata: () => {
        notificationPlayer.positionState.update();
      },

      onLoadedData: () => {
        notificationPlayer.positionState.update();
      },

      onCanPlay: () => {
        notificationPlayer.positionState.update();
      },

      onPlay: () => {
        notificationPlayer.playbackState.onPlay();
      },

      onPause: () => {
        notificationPlayer.playbackState.onPause();
      },

      onEnded: () => {
        notificationPlayer.playbackState.onEnded();
      },

      onTimeUpdate: () => {
        const now = Date.now();
        if (now - notificationPlayer.state.lastPositionUpdate > 500) {
          notificationPlayer.positionState.update();
        }
      },

      onDurationChange: () => {
        notificationPlayer.positionState.update();
      },

      onRateChange: () => {
        notificationPlayer.positionState.update();
      },

      onSeeked: () => {
        notificationPlayer.positionState.update();
      },

      onError: (error) => {
        notificationPlayer.playbackState.update('paused');
        notificationPlayer.positionState.stopContinuousUpdate();
      }
    }
  },

  setup: () => {
    if (!('mediaSession' in navigator)) {
      return false;
    }

    if (notificationPlayer.state.isInitialized) {
      return true;
    }

    try {
      navigator.mediaSession.metadata = null;
      
      const actionHandlers = [
        ['play', notificationPlayer.actions.play],
        ['pause', notificationPlayer.actions.pause],
        ['stop', notificationPlayer.actions.stop],
        ['previoustrack', notificationPlayer.actions.previoustrack],
        ['nexttrack', notificationPlayer.actions.nexttrack],
        ['seekto', notificationPlayer.actions.seekto],
        ['seekbackward', notificationPlayer.actions.seekbackward],
        ['seekforward', notificationPlayer.actions.seekforward]
      ];

      actionHandlers.forEach(([action, handler]) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
          notificationPlayer.state.supportedActions.add(action);
        } catch (error) {
        }
      });

      if (appState.audio) {
        notificationPlayer.events.bind();
      }

      notificationPlayer.playbackState.update('none');

      notificationPlayer.state.isInitialized = true;
      
      return true;

    } catch (error) {
      return false;
    }
  },

  destroy: () => {
    try {
      notificationPlayer.positionState.stopContinuousUpdate();
      notificationPlayer.events.unbind();

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        notificationPlayer.positionState.reset();

        Array.from(notificationPlayer.state.supportedActions).forEach(action => {
          try {
            navigator.mediaSession.setActionHandler(action, null);
          } catch (error) {
          }
        });

        navigator.mediaSession.playbackState = 'none';
      }

      notificationPlayer.state.isInitialized = false;
      notificationPlayer.state.supportedActions.clear();
      notificationPlayer.state.currentMetadata = null;
      notificationPlayer.state.lastPositionUpdate = 0;

    } catch (error) {
    }
  },

  utils: {
    isSupported: () => {
      return 'mediaSession' in navigator;
    },

    isInitialized: () => {
      return notificationPlayer.state.isInitialized;
    },

    getSupportedActions: () => {
      return Array.from(notificationPlayer.state.supportedActions);
    },

    getCurrentMetadata: () => {
      return notificationPlayer.state.currentMetadata;
    },

    getPlaybackInfo: () => {
      if (!appState.audio) return null;

      return {
        currentTime: appState.audio.currentTime,
        duration: appState.duration || appState.audio.duration,
        playbackRate: appState.audio.playbackRate || 1.0,
        paused: appState.audio.paused,
        ended: appState.audio.ended,
        volume: appState.audio.volume,
        playbackState: navigator.mediaSession?.playbackState || 'none'
      };
    },

    forcePositionUpdate: () => {
      notificationPlayer.positionState.update();
    },

    rebindEvents: () => {
      notificationPlayer.events.bind();
    }
  }
};
const listRenderer = {
renderList(container, items, options = {}) {
  const { type = 'song', source = '', showCountEl = null, emptyText = 'No items', subtext = '', onPlay, onRemove, onQueue } = options;
  if (!container) return;

  const emptyState = container.querySelector('.empty-state');
  const listType = container.dataset.listType || source || 'unknown';

  if (!items || items.length === 0) {
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.querySelector('.empty-text').textContent = emptyText;
      emptyState.querySelector('.empty-subtext').textContent = subtext;
    }
    container.querySelectorAll('.list-item').forEach(li => li.remove());
    if (showCountEl) showCountEl.textContent = '0 songs';
    container.classList.add('empty');
    return;
  }

  container.classList.remove('empty');
  
  if (emptyState) emptyState.hidden = true;
  container.querySelectorAll('.list-item').forEach(li => li.remove());

  items.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = `list-item ${song.active ? 'active' : ''}`;
    li.dataset.map = type;
    li.dataset.source = source;
    li.dataset.index = index;

    li.innerHTML = `
      <img src="${song.cover || utils.getAlbumImageUrl(song.album)}" 
           alt="${song.title}" 
           class="item-artwork">
      <div class="item-metadata">
        <div class="item-title">${song.title}</div>
        <div class="item-artist">${song.artist}</div>
      </div>
      <div class="item-actions">
        <button class="action-button" data-action="play" title="Play Now">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
        ${onQueue ? `
        <button class="action-button" data-action="queue" title="Add to Queue">
          <svg viewBox="0 0 24 24"><path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 
                   8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 
                   16h8v-2H2v2z"/></svg>
        </button>` : ''}
        ${onRemove ? `
        <button class="action-button" data-action="remove" title="Remove">
          <svg viewBox="0 0 24 24"><path 
            d="M19 6.41L17.59 5 12 10.59 6.41 5 
               5 6.41 10.59 12 5 17.59 6.41 19 
               12 13.41 17.59 19 19 17.59 
               13.41 12z"/></svg>
        </button>` : ''}
      </div>
    `;

    li.addEventListener('click', () => onPlay?.(song, index));

    li.querySelector('[data-action="play"]')?.addEventListener('click', e => {
      e.stopPropagation();
      onPlay?.(song, index);
    });

    li.querySelector('[data-action="remove"]')?.addEventListener('click', e => {
      e.stopPropagation();
      onRemove?.(song, index);
    });

    li.querySelector('[data-action="queue"]')?.addEventListener('click', e => {
      e.stopPropagation();
      onQueue?.(song, index);
    });

    container.appendChild(li);
  });

  if (showCountEl) {
    showCountEl.textContent = `${items.length} song${items.length !== 1 ? 's' : ''}`;
  }
}
};
const playlists = {
    add(name) {
        if (!name?.trim()) {
            notifications.notify({ type: NOTIFICATION_TYPES.WARNING, message: "Please enter a playlist name" });
            return null;
        }

        const playlist = {
            id: Date.now().toString(),
            name: name.trim(),
            songs: [],
            created: new Date().toISOString(),
            description: "",
            cover: null,
        };

        appState.playlists.push(playlist);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
        homePage?.renderPlaylists?.();
        
        notifications.notify({ type: NOTIFICATION_TYPES.SUCCESS, message: `Created playlist "${playlist.name}"` });
        return playlist;
    },

    addSong(playlistId, song) {
        const playlist = appState.playlists.find(p => p.id === playlistId);
        if (!playlist) {
            notifications.notify({ type: NOTIFICATION_TYPES.ERROR, message: "Playlist not found" });
            return false;
        }

        if (playlist.songs.some(s => s.id === song.id)) {
            notifications.notify({ type: NOTIFICATION_TYPES.WARNING, message: "Song already in playlist" });
            return false;
        }

        playlist.songs.push(song);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
        notifications.notify({ type: NOTIFICATION_TYPES.SUCCESS, message: `Added "${song.title}" to "${playlist.name}"` });
        return true;
    },

    removeSong(playlistId, songId) {
        const playlist = appState.playlists.find(p => p.id === playlistId);
        if (!playlist) return false;

        const initialLength = playlist.songs.length;
        playlist.songs = playlist.songs.filter(s => s.id !== songId);

        if (playlist.songs.length < initialLength) {
            storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
            notifications.notify({ type: NOTIFICATION_TYPES.INFO, message: "Song removed from playlist" });
            return true;
        }
        return false;
    },

    play(playlistId) {
        const playlist = appState.playlists.find(p => p.id === playlistId);
        if (!playlist?.songs.length) {
            notifications.notify({ type: NOTIFICATION_TYPES.WARNING, message: "Playlist is empty" });
            return;
        }

        appState.queue.clear();
        playlist.songs.slice(1).forEach(song => appState.queue.add(song));
        musicPlayer.ui.playSong(playlist.songs[0]);
        notifications.notify({ type: NOTIFICATION_TYPES.SUCCESS, message: `Playing playlist "${playlist.name}"` });
    },

    async remove(playlistId) {
        const playlist = appState.playlists.find(p => p.id === playlistId);
        if (!playlist) return false;
        
        const confirmed = await overlays.dialog.confirm(
            `Delete the playlist "${playlist.name}"? This cannot be undone.`, 
            { okText: "Delete", danger: true }
        );
        
        if (!confirmed) return false;
        
        appState.playlists = appState.playlists.filter(p => p.id !== playlistId);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
        notifications.notify({ type: NOTIFICATION_TYPES.INFO, message: `Deleted playlist "${playlist.name}"` });
        return true;
    },

    async create() {
        const name = await overlays.form.prompt(
            "Enter playlist name:", 
            { okText: "Create", placeholder: "i.e. Car Sounds Favorites" }
        );
        return name ? playlists.add(name) : null;
    },

    showAll() {
        if (appState.playlists.length === 0) {
            overlays.viewer.playlists(views.renderEmptyState(
                "No Playlists", 
                "You haven't created any playlists yet.", 
                "Create your first playlist to organize your music."
            ));
            return;
        }

        const content = `
            <div class="playlists-page animate__animated animate__fadeIn">
                <!-- Playlist grid content (same as original) -->
            </div>
        `;

        overlays.viewer.playlists(content);
        playlists.bindEvents(document.getElementById("playlist-viewer"));
    },

    show(playlistId) {
        const playlist = appState.playlists.find(p => p.id === playlistId);
        if (!playlist) {
            notifications.notify({ type: NOTIFICATION_TYPES.ERROR, message: "Playlist not found" });
            return;
        }

        pageLoader.start({ message: "Loading playlist..." });
        setTimeout(() => {
            const dynamicContent = $byId(IDS.dynamicContent);
            if (!dynamicContent) return;

            dynamicContent.innerHTML = `
                <div class="playlist-page animate__animated animate__fadeIn">
                    <!-- Playlist detail content (same as original) -->
                </div>
            `;

            playlists.bindViewEvents(playlist);
            pageLoader.complete();
        }, 200);
    },

    bindEvents(root = $byId(IDS.dynamicContent)) {
        root?.querySelector(".create-playlist-btn")?.addEventListener("click", async () => {
            const newPlaylist = await playlists.create();
            if (newPlaylist) setTimeout(() => playlists.showAll(), 100);
        });

        const attachListeners = (el, event, selector, handler) => {
            el?.addEventListener(event, e => {
                const target = e.target.closest(selector);
                if (target) handler(e, target);
            });
        };

        attachListeners(root, "click", ".view-playlist-btn", (e, btn) => {
            e.stopPropagation();
            playlists.show(btn.dataset.playlistId);
        });

        attachListeners(root, "click", ".play-playlist-btn", (e, btn) => {
            e.stopPropagation();
            playlists.play(btn.dataset.playlistId);
        });

        attachListeners(root, "click", ".delete-playlist-btn", async (e, btn) => {
            e.stopPropagation();
            if (await playlists.remove(btn.dataset.playlistId)) {
                setTimeout(() => playlists.showAll(), 100);
            }
        });

        attachListeners(root, "click", ".playlist-card", (e, card) => {
            playlists.show(card.dataset.playlistId);
        });
    },

    bindViewEvents(playlist) {
        const dynamicContent = $byId(IDS.dynamicContent);
        if (!dynamicContent) return;

        dynamicContent.querySelector(".play-playlist-btn")?.addEventListener("click", () => {
            playlists.play(playlist.id);
        });

        dynamicContent.querySelector(".edit-playlist-btn")?.addEventListener("click", async () => {
            const newName = await overlays.form.prompt(
                "Enter new playlist name:",
                { okText: "Rename", placeholder: "Playlist name", value: playlist.name }
            );
            
            if (newName?.trim() && newName.trim() !== playlist.name) {
                playlist.name = newName.trim();
                storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
                playlists.show(playlist.id);
                notifications.notify({ type: NOTIFICATION_TYPES.SUCCESS, message: "Playlist renamed successfully" });
            }
        });

        dynamicContent.querySelector(".delete-playlist-btn")?.addEventListener("click", async () => {
            if (await playlists.remove(playlist.id)) {
                appState.router?.navigateTo(ROUTES.HOME);
            }
        });

        dynamicContent.querySelector(".browse-music-btn")?.addEventListener("click", () => {
            appState.router?.navigateTo(ROUTES.HOME);
        });

        // Song row event delegation
        dynamicContent.addEventListener("click", e => {
            const songRow = e.target.closest(".song-row");
            if (!songRow) return;

            if (e.target.closest(".action-btn") || e.target.closest(".play-song-btn")) {
                e.stopPropagation();
                const action = e.target.closest(".action-btn")?.dataset.action;
                const songData = JSON.parse(songRow.dataset.song);
                
                switch (action) {
                    case "favorite":
                        appState.favorites.toggle("songs", songData.id);
                        break;
                    case "add-queue":
                        appState.queue.add(songData);
                        break;
                    case "remove-from-playlist":
                        if (playlists.removeSong(songRow.dataset.playlistId, songData.id)) {
                            playlists.show(songRow.dataset.playlistId);
                        }
                        break;
                }
            } else {
                try {
                    const songData = JSON.parse(songRow.dataset.song);
                    musicPlayer.ui.playSong(songData);
                } catch (error) {}
            }
        });

        dynamicContent.addEventListener("click", e => {
            if (e.target.matches("[data-artist]")) {
                e.stopPropagation();
                appState.router?.navigateTo(ROUTES.ARTIST, { artist: e.target.dataset.artist });
            }
        });
    }
};



const perquisites = () => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            clickables.init();
            app.initialize();
        });
    } else {
        clickables.init();
        app.initialize();
    }
};
const PubSub = {
  events: new Map(),

  subscribe(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return () => this.unsubscribe(event, callback);
  },

  unsubscribe(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  },

  publish(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} subscriber:`, error);
        }
      });
    }
  },

  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
};
const appState = {
  audio: null,
  currentSong: null,
  currentArtist: null,
  currentAlbum: null,
  isPlaying: false,
  duration: 0,
  recentlyPlayed: [],
  isDragging: false,
  shuffleMode: false,
  repeatMode: REPEAT_MODES.OFF,
  seekTooltip: null,
  currentIndex: 0,
  playlists: [],
  isPopupVisible: false,
  currentTab: "now-playing",
  inactivityTimer: null,
  notificationContainer: null,
  notifications: [],
  currentNotificationTimeout: null,
  router: null,
  homePageManager: null,

  setState(updates) {
    const oldState = { ...this };
    Object.keys(updates).forEach(key => {
      if (this[key] !== updates[key]) {
        const oldValue = this[key];
        this[key] = updates[key];
        switch (key) {
          case 'isPlaying':
            PubSub.publish(PLAYER_EVENTS.PLAYBACK_STATE, {
              isPlaying: this.isPlaying,
              previousState: oldValue
            });
            break;
          case 'currentSong':
            PubSub.publish(PLAYER_EVENTS.CURRENT_SONG, {
              currentSong: this.currentSong,
              previousSong: oldValue
            });
            break;
          case 'shuffleMode':
            PubSub.publish(PLAYER_EVENTS.SHUFFLE_MODE, {
              shuffleMode: this.shuffleMode,
              previousMode: oldValue
            });
            break;
          case 'repeatMode':
            PubSub.publish(PLAYER_EVENTS.REPEAT_MODE, {
              repeatMode: this.repeatMode,
              previousMode: oldValue
            });
            break;
          case 'duration':
          case 'currentTime':
            PubSub.publish(PLAYER_EVENTS.TIME_UPDATE, {
              currentTime: this.currentTime,
              duration: this.duration
            });
            break;
        }
      }
    });
    PubSub.publish(PLAYER_EVENTS.STATE_CHANGE, {
      newState: { ...this },
      oldState,
      changes: updates
    });
  },

  setPlayingState(isPlaying) {
    this.setState({ isPlaying });
  },

  setCurrentSong(song) {
    this.setState({ 
      currentSong: song,
      currentArtist: song?.artist || null,
      currentAlbum: song?.album || null
    });
  },

  setPlaybackTime(currentTime, duration) {
    this.setState({ currentTime, duration });
  },

  toggleShuffle() {
    this.setState({ shuffleMode: !this.shuffleMode });
  },

  setRepeatMode(mode) {
    this.setState({ repeatMode: mode });
  },

  favorites: {
    songs: new Set(),
    artists: new Set(),
    albums: new Set(),

    add: function(type, id) {
        appState.favorites[type].add(id);
        appState.favorites.save(type);
        appState.favorites.updateIcon(type, id, true);
        PubSub.publish('favorites:changed', {
          type,
          id,
          action: 'add'
        });
        const itemName = type === "songs" ? "song" : type.slice(0, -1);
        notifications.notify({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: `Added ${itemName} to favorites`
        });
      },
      
    remove: function(type, id) {
        appState.favorites[type].delete(id);
        appState.favorites.save(type);
        appState.favorites.updateIcon(type, id, false);
        PubSub.publish('favorites:changed', {
          type,
          id,
          action: 'remove'
        });
        const itemName = type === "songs" ? "song" : type.slice(0, -1);
        notifications.notify({
          type: NOTIFICATION_TYPES.INFO,
          message: `Removed ${itemName} from favorites`
        });
      },
      
    toggle: function(type, id) {
      if (appState.favorites[type].has(id)) {
        appState.favorites.remove(type, id);
        return false;
      } else {
        appState.favorites.add(type, id);
        return true;
      }
    },

    has: function(type, id) {
      return appState.favorites[type].has(id);
    },

    save: function(type) {
      const key = type === "songs" ? STORAGE_KEYS.FAVORITE_SONGS : 
                 type === "artists" ? STORAGE_KEYS.FAVORITE_ARTISTS : 
                 STORAGE_KEYS.FAVORITE_ALBUMS;
      storage.save(key, Array.from(appState.favorites[type]));
    },

    updateIcon: function(type, id, isFavorite) {
      const icons = document.querySelectorAll(`[data-favorite-${type}="${id}"]`);
      icons.forEach((icon) => {
        icon.classList.toggle("favorited", isFavorite);
        icon.classList.toggle(CLASSES.active, isFavorite);
        icon.setAttribute("aria-pressed", isFavorite);
        if (type === "songs") {
          const heartIcon = icon.querySelector("svg");
          if (heartIcon) {
            heartIcon.style.color = isFavorite ? "#ef4444" : "";
            heartIcon.style.fill = isFavorite ? "currentColor" : "none";
          }
        }
      });
      if (type === "songs" && appState.currentSong && appState.currentSong.id === id) {
        ui.updateFavoriteButton();
      }
    }
  },

  queue: {
    items: [],

    add: function(song, position = null) {
      if (position !== null) {
        appState.queue.items.splice(position, 0, song);
      } else {
        appState.queue.items.push(song);
      }
      storage.save(STORAGE_KEYS.QUEUE, appState.queue.items);
      ui.updateCounts();
      PubSub.publish('queue:changed', { action: 'add', song, position });
      notifications.notify({ message: `Added "${song.title}" to queue` });
    },

    remove: function(index) {
      if (index >= 0 && index < appState.queue.items.length) {
        const removed = appState.queue.items.splice(index, 1)[0];
        storage.save(STORAGE_KEYS.QUEUE, appState.queue.items);
        ui.updateCounts();
        PubSub.publish('queue:changed', { action: 'remove', index, song: removed });
        return removed;
      }
      return null;
    },

    clear: function() {
      appState.queue.items = [];
      storage.save(STORAGE_KEYS.QUEUE, appState.queue.items);
      ui.updateCounts();
      PubSub.publish('queue:changed', { action: 'clear' });
    },

    getNext: function() {
      return appState.queue.items.length > 0 ? appState.queue.remove(0) : null;
    },

    get: function() {
      return appState.queue.items;
    },

    playAt: function(index) {
      const song = appState.queue.remove(index);
      if (song) {
        musicPlayer.ui.playSong(song);
      }
    }
  }
};
const storage = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  },

  load: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  initialize: () => {
    const favoriteTypes = [
      { type: "songs", key: STORAGE_KEYS.FAVORITE_SONGS },
      { type: "artists", key: STORAGE_KEYS.FAVORITE_ARTISTS },
      { type: "albums", key: STORAGE_KEYS.FAVORITE_ALBUMS }
    ];

    favoriteTypes.forEach(({ type, key }) => {
      const data = storage.load(key);
      if (data) {
        appState.favorites[type] = new Set(data);
      }
    });

    const dataLoaders = {
      [STORAGE_KEYS.RECENTLY_PLAYED]: (data) => {
        appState.recentlyPlayed = data || [];
        setTimeout(() => {
          musicPlayer.ui.updateHomeBentoGrid();
        }, 100);
      },
      [STORAGE_KEYS.PLAYLISTS]: (data) => (appState.playlists = data || []),
      [STORAGE_KEYS.QUEUE]: (data) => (appState.queue.items = data || [])
    };

    Object.entries(dataLoaders).forEach(([key, loader]) => {
      const data = storage.load(key);
      if (data) loader(data);
    });
  }
};

window.clickables = clickables;
window.musicPlayer = musicPlayer;
window.navigation = navigation;
window.playlists = playlists;
window.views = views;
window.MyTunesApp = {
    initialize: app.initialize,
    state: () => appState,
    api: () => window.musicAppAPI,
    goHome: app.goHome,
};

document.addEventListener('DOMContentLoaded', () => {
    $byId(IDS.musicPlayerProgressBar)?.addEventListener('keydown', musicPlayer.ui.handleProgressBarKeyDown);
    if (notificationPlayer.utils.isSupported()) {
        setTimeout(() => notificationPlayer.setup(), 100);
    }
});

perquisites();

export { appState, storage, notificationPlayer, musicPlayer, dropdown, overlays, playlists, notifications, utils, app, pageLoader, navigation, ACTION_GRID_ITEMS };