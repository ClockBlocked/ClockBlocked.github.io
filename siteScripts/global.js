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

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

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
    musicPlayer.mainPlayer.close();
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

const musicPlayer = {
  mainPlayer: {
    inactivityTimer: null,
    lastInteractionTime: null,

    open: () => {
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

      musicPlayer.mainPlayer.switchTab(MUSIC_PLAYER.tabs.playing);
      musicPlayer.mainPlayer.updateTabContent(MUSIC_PLAYER.tabs.playing);

      document.body.style.overflow = "hidden";

      musicPlayer.mainPlayer.startInactivityTimer();
    },

    close: () => {
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (!drawer) {
        console.warn("Music player drawer not found");
        return;
      }

      musicPlayer.mainPlayer.stopInactivityTimer();

      drawer.classList.add("closing");
      drawer.classList.remove("open");

      setTimeout(() => {
        drawer.classList.remove("closing");
        appState.isPopupVisible = false;
        document.body.style.overflow = "";
        musicPlayer.mainPlayer.switchTab(MUSIC_PLAYER.tabs.playing);
      }, 550);
    },

    toggle: () => {
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (!drawer) return;

      const isOpen = drawer.classList.contains("open");

      if (isOpen) {
        musicPlayer.mainPlayer.close();
      } else {
        musicPlayer.mainPlayer.open();
      }
    },

    switchTab: (tabName) => {
      appState.currentTab = tabName;

      QUERY_ALL(".player .dotIndicator").forEach((dot) => {
        dot.classList.toggle("active", dot.dataset.tab === tabName);
      });

      QUERY_ALL(".player .panel").forEach((content) => {
        content.classList.toggle("active", content.dataset.tab === tabName);
      });

      musicPlayer.mainPlayer.updateTabContent(tabName);
      musicPlayer.mainPlayer.resetInactivityTimer();
    },

    startInactivityTimer: () => {
      musicPlayer.mainPlayer.stopInactivityTimer();

      musicPlayer.mainPlayer.lastInteractionTime = Date.now();

      musicPlayer.mainPlayer.inactivityTimer = setTimeout(() => {
        if (appState.currentTab !== MUSIC_PLAYER.tabs.playing) {
          musicPlayer.mainPlayer.switchTab(MUSIC_PLAYER.tabs.playing);
        }
      }, 30000);
    },

    stopInactivityTimer: () => {
      if (musicPlayer.mainPlayer.inactivityTimer) {
        clearTimeout(musicPlayer.mainPlayer.inactivityTimer);
        musicPlayer.mainPlayer.inactivityTimer = null;
      }
    },

    resetInactivityTimer: () => {
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (drawer && drawer.classList.contains("open")) {
        if (appState.currentTab !== MUSIC_PLAYER.tabs.playing) {
          musicPlayer.mainPlayer.startInactivityTimer();
        }
      }
    },

    updateTabContent: (tabName) => {
      if (tabName === MUSIC_PLAYER.tabs.recent) musicPlayer.mainPlayer.updateRecentTab();
      else if (tabName === MUSIC_PLAYER.tabs.queue) musicPlayer.mainPlayer.updateQueueTab();
    },

    updateQueueTab: () => {
      const queueList = QUERY(MUSIC_PLAYER.queueList);
      const queueCount = QUERY(MUSIC_PLAYER.queueCount);

      listRenderer.renderList(queueList, appState.queue.items, {
        source: "queue",
        type: "song",
        showCountEl: queueCount,
        emptyText: "Queue is empty",
        subtext: "Add songs to your queue",
        onPlay: (_, index) => appState.queue.playAt(index),
        onRemove: (_, index) => {
          appState.queue.remove(index);
          musicPlayer.mainPlayer.updateQueueTab();
          ui.updateCounts?.();
        },
      });
    },

    updateRecentTab: () => {
      const recentList = QUERY(MUSIC_PLAYER.recentList);
      const recentCount = QUERY(MUSIC_PLAYER.recentCount);

      listRenderer.renderList(recentList, appState.recentlyPlayed.slice(0, 20), {
        source: "recent",
        type: "song",
        showCountEl: recentCount,
        emptyText: "No recently played songs",
        subtext: "Start playing music to see them here",
        onPlay: (song) => musicPlayer.ui.playSong(song),
        onQueue: (song) => appState.queue.add(song),
      });
    },

    init: () => {
      const closeBtn = QUERY(MUSIC_PLAYER.close);
      if (closeBtn) {
        closeBtn.addEventListener("click", () => musicPlayer.mainPlayer.close());
      }
      QUERY_ALL(`${MUSIC_PLAYER.root} .tab`).forEach((tab) => {
        tab.addEventListener("click", () => {
          const tabName = tab.dataset.tab;
          if (tabName) musicPlayer.mainPlayer.switchTab(tabName);
        });
      });
      const queueBtn = QUERY(MUSIC_PLAYER.queueBtn);
      if (queueBtn) {
        queueBtn.addEventListener("click", () => musicPlayer.mainPlayer.switchTab(MUSIC_PLAYER.tabs.queue));
      }
      musicPlayer.mainPlayer.preventHorizontalScroll();
      musicPlayer.mainPlayer.initDrawerDrag();
      const favoriteBtn = QUERY(MUSIC_PLAYER.favoriteBtn);
      if (favoriteBtn) {
        favoriteBtn.addEventListener("click", () => {
          favoriteBtn.classList.toggle("favorited");
        });
      }
      const scrollEl = QUERY(`${MUSIC_PLAYER.root} .scrollableContent`);
      const coverEl = QUERY(MUSIC_PLAYER.albumArtwork);
      const compactHeader = document.getElementById("compactHeader");
      const compactCover = document.getElementById("compactCover");
      const compactTitle = document.getElementById("compactTitle");
      const compactArtist = document.getElementById("compactArtist");
      const contentCard = QUERY(`${MUSIC_PLAYER.root} .contentCard`);
      let coverRect = null;
      let targetLeft = 16;
      let targetTop = 12;
      let targetSize = 56;
      function recalc() {
        if (!coverEl) return;
        coverRect = coverEl.getBoundingClientRect();
      }
      function onScroll() {
        if (!scrollEl || !coverEl || !compactHeader) return;
        const s = scrollEl.scrollTop;
        const start = 20;
        const end = 180;
        let t = (s - start) / (end - start);
        t = Math.max(0, Math.min(1, t));
        if (!coverRect) recalc();
        const cRect = coverRect;
        const parentRect = QUERY(`${MUSIC_PLAYER.root} .inner`).getBoundingClientRect();
        const initLeft = cRect.left - parentRect.left;
        const initTop = cRect.top - parentRect.top;
        const deltaX = targetLeft - initLeft;
        const deltaY = targetTop - initTop;
        const scaleTarget = targetSize / cRect.width;
        const scale = 1 - (1 - scaleTarget) * t;
        const translateX = deltaX * t;
        const translateY = deltaY * t - s * t * 0.06;
        coverEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        compactHeader.style.opacity = `${t}`;
        compactHeader.style.pointerEvents = t > 0.5 ? "auto" : "none";
        if (t > 0.99) {
          contentCard.classList.add("collapsed");
        } else {
          contentCard.classList.remove("collapsed");
        }
      }
      if (scrollEl) {
        scrollEl.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", () => {
          recalc();
          onScroll();
        });
        $byId("music-player-cover")?.addEventListener("load", () => {
          recalc();
          onScroll();
        });
        recalc();
        onScroll();
      }
      const compactClickArea = document.getElementById("compactHeader");
      if (compactClickArea) {
        compactClickArea.addEventListener("click", () => {
          QUERY(`${MUSIC_PLAYER.root} .scroller`)?.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
      
      musicPlayer.state.init();
    },
    preventHorizontalScroll: () => {
      const scroller = QUERY(MUSIC_PLAYER.scroller);
      if (!scroller) return;
      let startX = 0;
      let scrollLeft = 0;
      scroller.addEventListener("touchstart", (e) => {
        startX = e.touches[0].pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
      });
      scroller.addEventListener("touchmove", (e) => {
        if (!startX) return;
        const x = e.touches[0].pageX - scroller.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 5) {
          e.preventDefault();
          scroller.scrollLeft = scrollLeft;
        }
      });
      scroller.addEventListener("touchend", () => {
        startX = 0;
        scrollLeft = 0;
      });
      scroller.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
      });
    },
    initDrawerDrag: () => {
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (!drawer) return;
      const handle = drawer.querySelector(".dragHandle");
      if (!handle) return;
      let dragging = false;
      let startY = 0;
      let lastTranslate = 0;
      const onPointerDown = (e) => {
        dragging = true;
        startY = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;
        drawer.style.transition = "none";
        window.addEventListener("pointermove", onPointerMove, { passive: false });
        window.addEventListener("pointerup", onPointerUp, { once: true });
        window.addEventListener("touchmove", onPointerMove, { passive: false });
        window.addEventListener("touchend", onPointerUp, { once: true });
      };
      const onPointerMove = (e) => {
        if (!dragging) return;
        const y = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;
        const delta = Math.max(0, y - startY);
        lastTranslate = delta;
        drawer.style.transform = `translateY(${delta}px)`;
        drawer.style.opacity = `${Math.max(0, 1 - delta / 400)}`;
        e.preventDefault();
      };
      const onPointerUp = () => {
        dragging = false;
        drawer.style.transition = "";
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("touchmove", onPointerMove);
        if (lastTranslate > 120) {
          musicPlayer.mainPlayer.close();
        } else {
          drawer.style.transform = "";
          drawer.style.opacity = "";
        }
        lastTranslate = 0;
      };
      handle.addEventListener("pointerdown", onPointerDown);
      handle.addEventListener("touchstart", onPointerDown, { passive: false });
    },
    initialize: () => {
      window.addEventListener("playerstatechange", (event) => {
        if (event.detail.song) {
          musicPlayer.ui.updateNowPlaying();
          musicPlayer.ui.updateNavbar();
        }
      });
    },
  },

  playback: {
    dispatchPlayerStateChange: () => {
      const detail = {
        song: appState.currentSong,
        artist: appState.currentArtist,
        album: appState.currentAlbum,
        isPlaying: appState.isPlaying,
        duration: appState.duration,
        currentTime: appState.audio?.currentTime ?? 0,
        totalTime: appState.audio?.duration ?? 0,
      };
      window.dispatchEvent(new CustomEvent("playerstatechange", { detail }));
    },
    togglePlayPause: () => {
      if (!appState.audio) return;
      if (appState.isPlaying) {
        musicPlayer.playback.pause();
      } else {
        musicPlayer.playback.play();
      }
    },
    play: () => {
      if (!appState.currentSong || !appState.audio) return;
      appState.audio.play().catch((err) => {
        console.error("Playback error:", err);
      });
    },
    pause: () => {
      if (!appState.audio) return;
      appState.audio.pause();
    },
    next: () => {
      const nextSong = appState.queue.getNext();
      if (nextSong) {
        musicPlayer.ui.playSong(nextSong);
        return;
      }
      const nextInAlbum = musicPlayer.ui.getNextInAlbum();
      if (nextInAlbum) {
        musicPlayer.ui.playSong(nextInAlbum);
      } else {
        if (appState.currentSong) {
          musicPlayer.ui.addToRecentlyPlayed(appState.currentSong);
        }
      }
    },
    previous: () => {
      if (appState.audio && appState.audio.currentTime > 3) {
        appState.audio.currentTime = 0;
        return;
      }
      
      if (appState.currentSong) {
        musicPlayer.ui.addToRecentlyPlayed(appState.currentSong);
      }
      
      if (appState.recentlyPlayed.length > 0) {
        const prevSong = appState.recentlyPlayed.shift();
        musicPlayer.ui.playSong(prevSong);
        return;
      }
      const prevInAlbum = musicPlayer.ui.getPreviousInAlbum();
      if (prevInAlbum) {
        musicPlayer.ui.playSong(prevInAlbum);
      }
    },
    seekTo: (time) => {
      if (!appState.audio || isNaN(time) || time < 0) return;
      if (!isFinite(time)) return;
      const safeTime = Math.max(0, Math.min(appState.duration || 0, time));
      appState.audio.currentTime = safeTime;
      musicPlayer.ui.updateProgress();
      if (window.notificationPlayer && notificationPlayer.positionState) {
        notificationPlayer.positionState.update();
      }
    },
    skip: (seconds) => {
      if (!appState.audio) return;
      const newTime = appState.audio.currentTime + seconds;
      musicPlayer.playback.seekTo(newTime);
    },
    shuffle: {
      toggle: () => {
        appState.shuffleMode = !appState.shuffleMode;
        if (window.ui && ui.updateShuffleButton) {
          ui.updateShuffleButton();
        }
        if (window.notifications) {
          notifications.notify({ message: `Shuffle ${appState.shuffleMode ? "enabled" : "disabled"}` });
        }
      },
      all: () => {
        if (!window.music || window.music.length === 0) {
          if (window.notifications) {
            notifications.notify({ type: window.NOTIFICATION_TYPES?.WARNING, message: "No music library found" });
          }
          return;
        }
        const allSongs = [];
        window.music.forEach((artist) => {
          artist.albums.forEach((album) => {
            album.songs.forEach((song) => {
              allSongs.push({
                ...song,
                artist: artist.artist,
                album: album.album,
                cover: utils.getAlbumImageUrl(album.album),
              });
            });
          });
        });
        if (allSongs.length === 0) {
          if (window.notifications) {
            notifications.notify({ type: window.NOTIFICATION_TYPES?.WARNING, message: "No songs found" });
          }
          return;
        }
        for (let i = allSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
        }
        appState.queue.clear();
        allSongs.slice(1).forEach((song) => appState.queue.add(song));
        musicPlayer.ui.playSong(allSongs[0]);
        appState.shuffleMode = true;
        if (window.ui && ui.updateShuffleButton) {
          ui.updateShuffleButton();
        }
        if (window.notifications) {
          notifications.notify({ message: "Playing all songs shuffled" });
        }
      },
    },
    repeat: {
      toggle: () => {
        if (appState.repeatMode === window.REPEAT_MODES?.OFF) {
          appState.repeatMode = window.REPEAT_MODES?.ALL;
        } else if (appState.repeatMode === window.REPEAT_MODES?.ALL) {
          appState.repeatMode = window.REPEAT_MODES?.ONE;
        } else {
          appState.repeatMode = window.REPEAT_MODES?.OFF;
        }
        if (window.ui && ui.updateRepeatButton) {
          ui.updateRepeatButton();
        }
        const modeText = appState.repeatMode === window.REPEAT_MODES?.OFF ? "disabled" : appState.repeatMode === window.REPEAT_MODES?.ALL ? "all songs" : "current song";
        if (window.notifications) {
          notifications.notify({ message: `Repeat ${modeText}` });
        }
      },
    },
  },

  ui: {
    isScrubbing: false,
    wasPlayingBeforeScrub: false,
    rafId: null,
    
    initialize: () => {
      if (appState.audio) return;
      appState.audio = new Audio();
      
      musicPlayer.ui.setupSubscriptions();
      
      const events = {
        timeupdate: musicPlayer.ui.updateProgress,
        ended: musicPlayer.ui.onEnded,
        loadedmetadata: musicPlayer.ui.onMetadataLoaded,
        play: musicPlayer.ui.onPlay,
        pause: musicPlayer.ui.onPause,
        error: musicPlayer.ui.onError,
      };
      Object.entries(events).forEach(([event, handler]) => appState.audio.addEventListener(event, handler));
      musicPlayer.ui.bindSeekBar();
      if (window.notificationPlayer) {
        notificationPlayer.setup();
      }
    },
    
    setupSubscriptions: () => {
      PubSub.subscribe(PLAYER_EVENTS.PLAYBACK_STATE, (data) => {
        musicPlayer.ui.updatePlayPauseUI(data.isPlaying);
      });
      
      PubSub.subscribe(PLAYER_EVENTS.CURRENT_SONG, (data) => {
        musicPlayer.ui.updateNowPlayingUI(data.currentSong);
        musicPlayer.ui.updateNavbarUI(data.currentSong);
      });
      
      PubSub.subscribe(PLAYER_EVENTS.TIME_UPDATE, (data) => {
        musicPlayer.ui.updateProgressUI(data.currentTime, data.duration);
      });
      
      PubSub.subscribe(PLAYER_EVENTS.SHUFFLE_MODE, (data) => {
        musicPlayer.ui.updateShuffleUI(data.shuffleMode);
      });
      
      PubSub.subscribe(PLAYER_EVENTS.REPEAT_MODE, (data) => {
        musicPlayer.ui.updateRepeatUI(data.repeatMode);
      });
      
      PubSub.subscribe(PLAYER_EVENTS.RECENTLY_PLAYED_CHANGED, (data) => {
        if (appState.currentTab === MUSIC_PLAYER.tabs.recent) {
          musicPlayer.mainPlayer.updateRecentTab();
        }
        musicPlayer.ui.updateHomeBentoGrid();
      });
      
      PubSub.subscribe(PLAYER_EVENTS.STATE_CHANGE, (data) => {
        musicPlayer.playback.dispatchPlayerStateChange();
      });
    },
    
    playSong: async (songData) => {
      if (!songData) return;
      musicPlayer.ui.initialize();
      
      if (window.ui && ui.setLoadingState) {
        ui.setLoadingState(true);
      }

      if (appState.currentSong && appState.currentSong.id !== songData.id) {
        musicPlayer.ui.addToRecentlyPlayed(appState.currentSong);
      }

      appState.setCurrentSong(songData);

      musicPlayer.ui.updateNavbar();
      musicPlayer.ui.updateNowPlaying();

      if (window.ui) {
        if (ui.updateCounts) ui.updateCounts();
      }

      const success = await musicPlayer.ui.loadAudioFile(songData);
      
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
          musicPlayer.ui.bindSeekBar();
        }, 100);
        musicPlayer.playback.dispatchPlayerStateChange();
      } else {
        musicPlayer.ui.addToRecentlyPlayed(songData);
        
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
    
    loadAudioFile: async (songData) => {
      if (!songData || !songData.id) return false;
      
      const songFileName = songData.id;
      
      if (!songFileName) return false;
      
      for (const format of window.AUDIO_FORMATS) {
        try {
          const audioUrl = `https://pub-54216af4fb1549ff95a6cb5f8d63fe2d.r2.dev/${songFileName}.${format}`;
          
          appState.audio.src = audioUrl;
          appState.audio.preload = 'auto';
          
          await new Promise((resolve, reject) => {
            const loadHandler = () => {
              appState.audio.removeEventListener('canplaythrough', loadHandler);
              appState.audio.removeEventListener('error', errorHandler);
              resolve();
            };
            
            const errorHandler = (e) => {
              appState.audio.removeEventListener('canplaythrough', loadHandler);
              appState.audio.removeEventListener('error', errorHandler);
              reject(e);
            };
            
            appState.audio.addEventListener('canplaythrough', loadHandler, { once: true });
            appState.audio.addEventListener('error', errorHandler, { once: true });
            
            if (appState.audio.readyState >= 3) {
              loadHandler();
            }
          });
          
          await appState.audio.play();
          return true;
        } catch (error) {
          continue;
        }
      }
      return false;
    },

    handleProgressBarKeyDown: (e) => {
      const audio = appState.audio;
      if (!audio || !audio.duration) return;
      const duration = audio.duration;
      let timeChange = 0;
      switch (e.key) {
        case "ArrowRight":
          timeChange = MUSIC_PLAYER.skipTimes.forward;
          break;
        case "ArrowLeft":
          timeChange = MUSIC_PLAYER.skipTimes.rewind;
          break;
        case "PageUp":
          timeChange = 10;
          break;
        case "PageDown":
          timeChange = -10;
          break;
        case "Home":
          audio.currentTime = 0;
          if (window.notificationPlayer && notificationPlayer.positionState) {
            notificationPlayer.positionState.update();
          }
          e.preventDefault();
          return;
        case "End":
          audio.currentTime = duration;
          if (window.notificationPlayer && notificationPlayer.positionState) {
            notificationPlayer.positionState.update();
          }
          e.preventDefault();
          return;
        default:
          return;
      }
      if (timeChange !== 0) {
        const newTime = Math.max(0, Math.min(duration, audio.currentTime + timeChange));
        audio.currentTime = newTime;
        if (window.notificationPlayer && notificationPlayer.positionState) {
          notificationPlayer.positionState.update();
        }
        e.preventDefault();
      }
    },
    
    updateBufferDisplay: () => {
      const buffer = QUERY(MUSIC_PLAYER.progressBuffer);
      if (!buffer || !appState.audio) return;
      if (!appState.audio.buffered || appState.audio.buffered.length === 0) {
        buffer.style.width = "0%";
        return;
      }
      const duration = appState.audio.duration || 0;
      if (duration === 0) {
        buffer.style.width = "0%";
        return;
      }
      let bufferedEnd = 0;
      for (let i = 0; i < appState.audio.buffered.length; i++) {
        const end = appState.audio.buffered.end(i);
        if (end > bufferedEnd) bufferedEnd = end;
      }
      const bufferProgress = Math.min(1, bufferedEnd / duration);
      buffer.style.width = (bufferProgress * 100).toFixed(2) + "%";
    },
    
bindSeekBar: () => {
    const bar = $byId(IDS.progressBar);
    const thumb = $byId(IDS.progressThumb);
    if (!bar || !thumb) return;

    const onPointerDown = (e) => {
        e.preventDefault();
        bar.setPointerCapture?.(e.pointerId ?? 1);
        player.isScrubbing = true;
        player.wasPlayingBeforeScrub = !!appState.isPlaying;
        if (player.wasPlayingBeforeScrub) appState.audio.pause();
        player.seekFromEvent(e, bar);
        bar.classList.add('is-dragging');
        const moveTarget = bar;
        moveTarget.addEventListener('pointermove', onPointerMove, { passive: false });
        moveTarget.addEventListener('pointerup', onPointerUp, { once: true });
        window.addEventListener('pointercancel', onPointerUp, { once: true });
    };

    const onPointerMove = (e) => {
        if (!player.isScrubbing) return;
        e.preventDefault();
        player.seekFromEvent(e, bar);
    };

    const onPointerUp = (e) => {
        player.seekFromEvent(e, bar, true);
        player.isScrubbing = false;
        bar.classList.remove('is-dragging', 'is-hovering');
        if (player.wasPlayingBeforeScrub) appState.audio.play();
        bar.releasePointerCapture?.(e.pointerId ?? 1);
        bar.removeEventListener('pointermove', onPointerMove);
    };

    const onEnter = () => bar.classList.add('is-hovering');
    const onLeave = () => { if (!player.isScrubbing) bar.classList.remove('is-hovering'); };

    bar.addEventListener('pointerdown', onPointerDown, { passive: false });
    bar.addEventListener('pointerenter', onEnter);
    bar.addEventListener('pointerleave', onLeave);
},
    
    seekFromEvent(e, bar, finalize = false) {
      const rect = bar.getBoundingClientRect();
      const x = e.clientX !== undefined ? e.clientX : e.touches && e.touches[0] ? e.touches[0].clientX : 0;

      let pct = ((x - rect.left) / rect.width) * 100;

      if (!isFinite(pct)) pct = 0;
      pct = Math.max(0, Math.min(100, pct));

      const duration = appState.duration || appState.audio?.duration || 0;
      const time = (duration * pct) / 100;

      musicPlayer.ui.setProgressUI(pct, time);

      if (finalize) {
        if (isFinite(time) && appState.audio) {
          appState.audio.currentTime = time;

          if (window.notificationPlayer?.positionState) {
            notificationPlayer.positionState.update();
          }
        }
      }
    },
    
    setProgressUI(percent, currentTime) {
      const fill = QUERY(MUSIC_PLAYER.progressFill);
      const thumb = QUERY(MUSIC_PLAYER.progressThumb);
      const currentTimeElement = QUERY(MUSIC_PLAYER.currentTime);

      if (fill) {
        fill.style.width = `${percent}%`;
      }

      if (currentTimeElement && isFinite(currentTime)) {
        currentTimeElement.textContent = utils.formatTime(currentTime);
      }
    },
    
    updateProgress() {
      if (musicPlayer.ui.isScrubbing) return;

      const audio = appState.audio;
      if (!audio || !audio.duration) return;

      const currentTime = audio.currentTime;
      const duration = audio.duration;
      const percent = (currentTime / duration) * 100;

      musicPlayer.ui.setProgressUI(percent, currentTime);

      const totalTimeElement = QUERY(MUSIC_PLAYER.totalTime);
      if (totalTimeElement) {
        totalTimeElement.textContent = utils.formatTime(duration);
      }

      if (window.notificationPlayer?.positionState) {
        notificationPlayer.positionState.update();
      }
    },
    
    onMetadataLoaded() {
      const audio = appState.audio;
      if (!audio) return;

      appState.duration = audio.duration;

      const totalTimeElement = QUERY(MUSIC_PLAYER.totalTime);
      if (totalTimeElement) {
        totalTimeElement.textContent = utils.formatTime(audio.duration);
      }

      musicPlayer.ui.updateProgress();
    },

    onPlay: () => {
      appState.setPlayingState(true);
    },
    
    onPause: () => {
      appState.setPlayingState(false);
    },
    
    onError: (error) => {
      console.error("Audio error:", error);
    },
    
    onEnded: () => {
      if (appState.repeatMode === window.REPEAT_MODES?.ONE) {
        appState.audio.currentTime = 0;
        appState.audio.play();
        return;
      }
      musicPlayer.playback.next();
    },

    getNextInAlbum: () => {
      if (!appState.currentSong || !window.music) return null;
      const artist = window.music.find((a) => a.artist === appState.currentArtist);
      const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
      if (!album) return null;
      const currentIndex = album.songs.findIndex((s) => s.title === appState.currentSong.title);
      const nextIndex = appState.shuffleMode ? Math.floor(Math.random() * album.songs.length) : (currentIndex + 1) % album.songs.length;
      if (nextIndex !== currentIndex || appState.repeatMode === window.REPEAT_MODES?.ALL) {
        return {
          ...album.songs[nextIndex],
          artist: artist.artist,
          album: album.album,
          cover: utils.getAlbumImageUrl(album.album),
        };
      }
      return null;
    },
    
    getPreviousInAlbum: () => {
      if (!appState.currentSong || !window.music) return null;
      const artist = window.music.find((a) => a.artist === appState.currentArtist);
      const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
      if (!album) return null;
      const currentIndex = album.songs.findIndex((s) => s.title === appState.currentSong.title);
      const prevIndex = (currentIndex - 1 + album.songs.length) % album.songs.length;
      return {
        ...album.songs[prevIndex],
        artist: artist.artist,
        album: album.album,
        cover: utils.getAlbumImageUrl(album.album),
      };
    },

    updateNowPlaying: () => {
      if (!appState.currentSong) return;

      const coverUrl = appState.currentSong.cover || utils.getAlbumImageUrl(appState.currentSong.album);

      const cover = QUERY(MUSIC_PLAYER.albumArtwork);
      if (cover && coverUrl) {
        cover.src = coverUrl;
      }

      const titleEl = QUERY(MUSIC_PLAYER.songName);
      const artistEl = QUERY(MUSIC_PLAYER.artistName);
      const albumEl = QUERY(MUSIC_PLAYER.albumName);

      if (titleEl && appState.currentSong.title) {
        titleEl.textContent = appState.currentSong.title;
      }
      if (artistEl && appState.currentArtist) {
        artistEl.textContent = appState.currentArtist;
      }
      if (albumEl && appState.currentAlbum) {
        albumEl.textContent = appState.currentAlbum;
      }

      const compactCover = document.getElementById("compactCover");
      const compactTitle = document.getElementById("compactTitle");
      const compactArtist = document.getElementById("compactArtist");
      if (compactCover && coverUrl) compactCover.src = coverUrl;
      if (compactTitle && appState.currentSong.title) compactTitle.textContent = appState.currentSong.title;
      if (compactArtist && appState.currentArtist) compactArtist.textContent = appState.currentArtist;

      const playBtn = QUERY(MUSIC_PLAYER.play);
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (playBtn) {
        const playIcon = playBtn.querySelector(".playIcon");
        const pauseIcon = playBtn.querySelector(".pauseIcon");
        if (appState.isPlaying) {
          playIcon?.style.setProperty("display", "none");
          pauseIcon?.style.setProperty("display", "block");
          drawer?.classList.add(MUSIC_PLAYER.classes.playing);
        } else {
          playIcon?.style.setProperty("display", "block");
          pauseIcon?.style.setProperty("display", "none");
          drawer?.classList.remove(MUSIC_PLAYER.classes.playing);
        }
      }

      musicPlayer.ui.updateNavbar();
      musicPlayer.state.updateMiniHeaderElements();
    },
    
    updateNowPlayingUI: (song) => {
      if (!song) return;
      
      const coverUrl = song.cover || utils.getAlbumImageUrl(song.album);
      const cover = QUERY(MUSIC_PLAYER.albumArtwork);
      if (cover && coverUrl) cover.src = coverUrl;
      
      const updateText = (selector, text) => {
        const el = QUERY(selector);
        if (el && text) el.textContent = text;
      };
      
      updateText(MUSIC_PLAYER.songName, song.title);
      updateText(MUSIC_PLAYER.artistName, song.artist);
      updateText(MUSIC_PLAYER.albumName, song.album);
      
      const compactCover = document.getElementById("compactCover");
      const compactTitle = document.getElementById("compactTitle");
      const compactArtist = document.getElementById("compactArtist");
      if (compactCover && coverUrl) compactCover.src = coverUrl;
      if (compactTitle && song.title) compactTitle.textContent = song.title;
      if (compactArtist && song.artist) compactArtist.textContent = song.artist;
    },
    
    updateNavbar: () => {
      if (!appState.currentSong) return;

      const navbarNowPlaying = QUERY(NAVBAR.nowPlaying);
      const navbarAlbumArt = QUERY(`${NAVBAR.nowPlaying} .albumArtwork img`);
      const navbarSongName = QUERY(`${NAVBAR.nowPlaying} .songName`);
      const navbarArtistName = QUERY(`${NAVBAR.nowPlaying} .artistName`);

      if (!navbarNowPlaying) {
        return;
      }

      navbarNowPlaying.classList.add(CLASSES.hasSong);

      const coverUrl = appState.currentSong.cover || utils.getAlbumImageUrl(appState.currentSong.album);
      if (navbarAlbumArt) {
        navbarAlbumArt.src = coverUrl;
        navbarAlbumArt.style.opacity = "1";

        const svgPlaceholder = QUERY(`${NAVBAR.nowPlaying} .albumArtwork svg`);
        if (svgPlaceholder) {
          svgPlaceholder.style.opacity = "0";
        }
      }

      if (navbarSongName && appState.currentSong.title) {
        navbarSongName.textContent = appState.currentSong.title;
      }

      if (navbarArtistName && appState.currentArtist) {
        navbarArtistName.textContent = appState.currentArtist;
      }
    },
    
    updateNavbarUI: (song) => {
      if (!song) {
        QUERY(NAVBAR.nowPlaying)?.classList.remove(CLASSES.hasSong);
        return;
      }
      
      const navbarNowPlaying = QUERY(NAVBAR.nowPlaying);
      const navbarAlbumArt = QUERY(`${NAVBAR.nowPlaying} .albumArtwork img`);
      const navbarSongName = QUERY(`${NAVBAR.nowPlaying} .songName`);
      const navbarArtistName = QUERY(`${NAVBAR.nowPlaying} .artistName`);
      
      if (!navbarNowPlaying) return;
      
      navbarNowPlaying.classList.add(CLASSES.hasSong);
      
      const coverUrl = song.cover || utils.getAlbumImageUrl(song.album);
      if (navbarAlbumArt) {
        navbarAlbumArt.src = coverUrl;
        navbarAlbumArt.style.opacity = "1";
        
        const svgPlaceholder = QUERY(`${NAVBAR.nowPlaying} .albumArtwork svg`);
        if (svgPlaceholder) svgPlaceholder.style.opacity = "0";
      }
      
      if (navbarSongName && song.title) navbarSongName.textContent = song.title;
      if (navbarArtistName && song.artist) navbarArtistName.textContent = song.artist;
    },
    
    updatePlayPauseUI: (isPlaying) => {
      const playBtn = QUERY(MUSIC_PLAYER.play);
      const navbarPlayBtn = QUERY(NAVBAR.playPause);
      
      if (playBtn) {
        const playIcon = playBtn.querySelector(".playIcon");
        const pauseIcon = playBtn.querySelector(".pauseIcon");
        if (isPlaying) {
          playIcon?.style.setProperty("display", "none");
          pauseIcon?.style.setProperty("display", "block");
        } else {
          playIcon?.style.setProperty("display", "block");
          pauseIcon?.style.setProperty("display", "none");
        }
      }
      
      const navbarPlayIndicator = QUERY(`${NAVBAR.nowPlaying} #play-indicator`);
      if (navbarPlayIndicator) {
        navbarPlayIndicator.classList.toggle("playing", isPlaying);
      }
      
      if (navbarPlayBtn) {
        const navbarPlayIcon = QUERY(NAVBAR.play);
        const navbarPauseIcon = QUERY(NAVBAR.pause);
        if (isPlaying) {
          navbarPlayIcon?.classList.add("hidden");
          navbarPauseIcon?.classList.remove("hidden");
        } else {
          navbarPlayIcon?.classList.remove("hidden");
          navbarPauseIcon?.classList.add("hidden");
        }
      }
      
      QUERY(MUSIC_PLAYER.root)?.classList.toggle(MUSIC_PLAYER.classes.playing, isPlaying);
    },
    
    updateProgressUI: (currentTime, duration) => {
      if (musicPlayer.ui.isScrubbing) return;
      
      const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
      musicPlayer.ui.setProgressUI(percent, currentTime);
      
      const totalTimeElement = QUERY(MUSIC_PLAYER.totalTime);
      if (totalTimeElement) {
        totalTimeElement.textContent = utils.formatTime(duration);
      }
    },
    
    updateShuffleUI: (shuffleMode) => {
      const shuffleBtn = QUERY(MUSIC_PLAYER.shuffleBtn);
      if (shuffleBtn) {
        shuffleBtn.classList.toggle(CLASSES.active, shuffleMode);
        shuffleBtn.setAttribute("aria-pressed", shuffleMode);
      }
    },
    
    updateRepeatUI: (repeatMode) => {
      const repeatBtn = QUERY(MUSIC_PLAYER.repeatBtn);
      if (repeatBtn) {
        repeatBtn.classList.toggle(CLASSES.active, repeatMode !== REPEAT_MODES.OFF);
        repeatBtn.setAttribute("aria-pressed", repeatMode !== REPEAT_MODES.OFF);
      }
    },
    
    addToRecentlyPlayed: (song) => {
      if (!song || !song.id) return;
      
      if (!appState.recentlyPlayed) appState.recentlyPlayed = [];
      
      appState.recentlyPlayed = appState.recentlyPlayed.filter(s => s.id !== song.id);
      
      appState.recentlyPlayed.unshift(song);
      
      if (appState.recentlyPlayed.length > 50) {
        appState.recentlyPlayed = appState.recentlyPlayed.slice(0, 50);
      }
      
      if (window.storage && window.STORAGE_KEYS) {
        storage.save(STORAGE_KEYS.RECENTLY_PLAYED, appState.recentlyPlayed);
      }
      
      PubSub.publish(PLAYER_EVENTS.RECENTLY_PLAYED_CHANGED, { songs: appState.recentlyPlayed });
      
      musicPlayer.ui.updateRecentTab();
      musicPlayer.ui.updateHomeBentoGrid();
    },
    
    updateHomeBentoGrid: () => {
      const dynamicContent = $byId(IDS.dynamicContent);
      if (!dynamicContent) return;
      
      const bentoGrid = dynamicContent.querySelector('.bento-grid');
      if (!bentoGrid) return;
      
      const recentlyPlayedSection = $byId(IDS.recentlyPlayedSection);
      if (recentlyPlayedSection && appState.recentlyPlayed && appState.recentlyPlayed.length > 0) {
        const recentTracksHtml = render.homeSection.recentlyPlayed(
          appState.recentlyPlayed.slice(0, 5),
          utils
        );
        recentlyPlayedSection.innerHTML = recentTracksHtml;
        
        musicPlayer.ui.bindHomeBentoEvents(recentlyPlayedSection);
      }
    },
    
    bindHomeBentoEvents: (container) => {
      if (!container) return;
      
      container.querySelectorAll('.modern-track-item, .track-play-btn').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const songDataStr = item.closest('[data-song]')?.dataset.song;
          if (songDataStr) {
            try {
              const songData = JSON.parse(songDataStr);
              musicPlayer.ui.playSong(songData);
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
            appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
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
              appState.favorites.toggle('songs', songData.id);
              
              btn.classList.toggle('active', appState.favorites.has('songs', songData.id));
            } catch (error) {
              console.error('Error toggling favorite:', error);
            }
          }
        });
      });
    },
    
    updateRecentTab: () => {
      const recentList = QUERY(MUSIC_PLAYER.recentList);
      const recentCount = QUERY(MUSIC_PLAYER.recentCount);

      listRenderer.renderList(recentList, appState.recentlyPlayed.slice(0, 20), {
        source: "recent",
        type: "song",
        showCountEl: recentCount,
        emptyText: "No recently played songs",
        subtext: "Start playing music to see them here",
        onPlay: (song) => musicPlayer.ui.playSong(song),
        onQueue: (song) => appState.queue.add(song),
      });
    }
  },
  
  state: {
    currentTab: 0,
    isCollapsed: false,
    isTransitioning: false,
    scrollThreshold: 150,
    isDraggingHeader: false,
    dragStartY: 0,
    dragDistance: 0,
    lastScrollTop: {},
    scrollTimeout: null,
    transitionTimeout: null,
    
    init() {
      musicPlayer.state.cacheDOMElements();
      musicPlayer.state.injectRequiredHTML();
      musicPlayer.state.bindEvents();
      musicPlayer.state.setupObservers();
    },
    
    cacheDOMElements() {
      this.player = QUERY(MUSIC_PLAYER.root);
      this.coverWrapper = QUERY('.musicPlayerCoverWrapper');
      this.cover = QUERY('#music-player-cover');
      this.panels = QUERY_ALL('.musicPlayerPanel');
      this.dotIndicators = QUERY_ALL('.dotIndicator');
    },
    
    injectRequiredHTML() {
      if (!this.coverWrapper || !this.cover) return;
      
      if (!this.cover.parentElement.classList.contains('coverImageContainer')) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'coverImageContainer';
        this.cover.parentNode.insertBefore(imageContainer, this.cover);
        imageContainer.appendChild(this.cover);
      }
      
      const existingGlow = this.coverWrapper.querySelector('.musicPlayerCoverGlow');
      if (!existingGlow) {
        const glow = document.createElement('div');
        glow.className = 'coverGlow musicPlayerCoverGlow';
        this.coverWrapper.insertBefore(glow, this.coverWrapper.firstChild);
      }
      
      this.panels.forEach(panel => {
        const list = panel.querySelector('.musicPlayerList');
        if (list && !list.parentElement.classList.contains('listContainer')) {
          const listContainer = document.createElement('div');
          listContainer.className = 'listContainer';
          list.parentNode.insertBefore(listContainer, list);
          listContainer.appendChild(list);
        }
      });
      
      musicPlayer.state.updateMiniHeaderElements();
    },
    
    bindEvents() {
      this.panels.forEach((panel, index) => {
        const listContainer = panel.querySelector('.listContainer');
        if (listContainer) {
          listContainer.addEventListener('scroll', () => musicPlayer.state.handleScroll(listContainer, index));
        }
      });
      
      if (this.coverWrapper) {
        this.coverWrapper.addEventListener('mousedown', (e) => musicPlayer.state.handleHeaderDragStart(e));
        this.coverWrapper.addEventListener('touchstart', (e) => musicPlayer.state.handleHeaderDragStart(e), { passive: false });
        
        this.coverWrapper.addEventListener('click', (e) => {
          if (musicPlayer.state.isCollapsed && appState.currentTab !== MUSIC_PLAYER.tabs.playing && !musicPlayer.state.isTransitioning) {
            if (e.target.closest('.miniControlBtn')) return;
            musicPlayer.state.expandHeader();
          }
        });
      }
      
      document.addEventListener('mousemove', (e) => musicPlayer.state.handleHeaderDragMove(e));
      document.addEventListener('touchmove', (e) => musicPlayer.state.handleHeaderDragMove(e), { passive: false });
      document.addEventListener('mouseup', () => musicPlayer.state.handleHeaderDragEnd());
      document.addEventListener('touchend', () => musicPlayer.state.handleHeaderDragEnd());
      
      if (this.coverWrapper) {
        const resizeObserver = new ResizeObserver(() => {
          this.updateListHeights();
        });
        resizeObserver.observe(this.coverWrapper);
      }      
    },
    
    setupObservers() {
      const mutationObserver = new MutationObserver(() => {
        musicPlayer.state.addListItemInteractions();
      });
      
      this.panels.forEach(panel => {
        mutationObserver.observe(panel, {
          childList: true,
          subtree: true
        });
      });
      
      musicPlayer.state.addListItemInteractions();
    },
    
    handleScroll(listContainer, tabIndex) {
      const tabName = this.panels[tabIndex]?.dataset.tab;
      if (musicPlayer.state.isTransitioning || appState.currentTab !== tabName || tabName === MUSIC_PLAYER.tabs.playing) {
        return;
      }
      
      const currentScrollTop = listContainer.scrollTop;
      const lastScroll = musicPlayer.state.lastScrollTop[tabName] || 0;
      const isScrollingDown = currentScrollTop > lastScroll;
      const scrollDelta = Math.abs(currentScrollTop - lastScroll);
      
      musicPlayer.state.lastScrollTop[tabName] = currentScrollTop;
      
      if (scrollDelta < 5) return;
      
      clearTimeout(musicPlayer.state.scrollTimeout);
      
      if (isScrollingDown && !musicPlayer.state.isCollapsed && currentScrollTop > 0) {
        musicPlayer.state.collapseHeader();
      } 
      else if (currentScrollTop === 0 && musicPlayer.state.isCollapsed) {
        musicPlayer.state.expandHeader();
      }
    },
    
    updateListHeights: function() {
      const coverWrapper = this.coverWrapper;
      const recentList = document.getElementById('music-player-recent-list');
      const queueList = document.getElementById('music-player-queue-list');
      
      if (!coverWrapper || !recentList || !queueList) return;
      
      const isCollapsed = coverWrapper.classList.contains('collapsed');
      
      if (isCollapsed) {
        recentList.style.height = 'calc(100vh - 200px)';
        queueList.style.height = 'calc(100vh - 200px)';
      } else {
        recentList.style.height = '500px';
        queueList.style.height = '500px';
      }
    },
  
    collapseHeader() {
      if (musicPlayer.state.isCollapsed || musicPlayer.state.isTransitioning || !this.coverWrapper) return;
      
      musicPlayer.state.isTransitioning = true;
      musicPlayer.state.isCollapsed = true;
      
      const nowPlayingElement = QUERY('.nowPlaying');
      
      requestAnimationFrame(() => {
        this.coverWrapper.classList.add('is-collapsing');
        if (nowPlayingElement) {
          nowPlayingElement.classList.add('is-collapsing');
        }
        
        requestAnimationFrame(() => {
          this.coverWrapper.classList.add('collapsed');
          if (nowPlayingElement) {
            nowPlayingElement.classList.add('collapsed');
            nowPlayingElement.classList.remove('is-collapsing');
          }
          
          clearTimeout(musicPlayer.state.transitionTimeout);
          musicPlayer.state.transitionTimeout = setTimeout(() => {
            this.coverWrapper.classList.remove('is-collapsing');
            musicPlayer.state.isTransitioning = false;
          }, 550);
        });
      });
    },

    expandHeader() {
      if (!musicPlayer.state.isCollapsed || musicPlayer.state.isTransitioning || !this.coverWrapper) return;
      
      musicPlayer.state.isTransitioning = true;
      musicPlayer.state.isCollapsed = false;
      
      const nowPlayingElement = QUERY('.nowPlaying');
      
      requestAnimationFrame(() => {
        this.coverWrapper.classList.add('is-collapsing');
        if (nowPlayingElement) {
          nowPlayingElement.classList.add('is-collapsing');
        }
        
        requestAnimationFrame(() => {
          this.coverWrapper.classList.remove('collapsed');
          if (nowPlayingElement) {
            nowPlayingElement.classList.remove('collapsed');
            nowPlayingElement.classList.remove('is-collapsing');
          }
          
          clearTimeout(musicPlayer.state.transitionTimeout);
          musicPlayer.state.transitionTimeout = setTimeout(() => {
            this.coverWrapper.classList.remove('is-collapsing');
            musicPlayer.state.isTransitioning = false;
          }, 550);
        });
      });
    },
    
    updateMiniHeaderElements() {
      if (!this.coverWrapper) return;
      
      const titleElement = QUERY('#music-player-title');
      const artistElement = QUERY('#music-player-artist');
      
      let miniHeader = this.coverWrapper.querySelector('.miniHeader');
      if (!miniHeader) {
        miniHeader = document.createElement('div');
        miniHeader.className = 'miniHeader';
        this.coverWrapper.appendChild(miniHeader);
      }
      
      const title = titleElement ? titleElement.textContent : '';
      const artist = artistElement ? artistElement.textContent : '';
      
      miniHeader.innerHTML = `
        <div class="miniTitle">${musicPlayer.state.escapeHTML(title)}</div>
        <div class="miniArtist">${musicPlayer.state.escapeHTML(artist)}</div>
      `;
      
      let miniControls = this.coverWrapper.querySelector('.miniControls');
      if (!miniControls) {
        miniControls = document.createElement('div');
        miniControls.className = 'miniControls';
        this.coverWrapper.appendChild(miniControls);
      }
      
      const isPaused = !this.player || !this.player.classList.contains('isPlaying');
      const playIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-14 9V3z"/></svg>';
      const pauseIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
      
      miniControls.innerHTML = `
        <button class="miniControlBtn" onclick="musicPlayer.playback.togglePlayPause()">
          ${isPaused ? playIcon : pauseIcon}
        </button>
      `;
    },
    
    escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },
    
    handleHeaderDragStart(e) {
      if (!this.coverWrapper || appState.currentTab === MUSIC_PLAYER.tabs.playing || musicPlayer.state.isTransitioning) return;
      if (e.target.closest('.miniControlBtn')) return;
      
      const targetElement = e.target;
      if (!targetElement.closest('.musicPlayerCoverWrapper')) return;
      
      musicPlayer.state.isDraggingHeader = true;
      musicPlayer.state.dragStartY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
      musicPlayer.state.dragDistance = 0;
    },
    
    handleHeaderDragMove(e) {
      if (!musicPlayer.state.isDraggingHeader || !this.coverWrapper) return;
      
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
      if (!musicPlayer.state.isDraggingHeader || !this.coverWrapper) return;
      
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
      const listItems = document.querySelectorAll('.list-item');
      
      listItems.forEach(item => {
        const artwork = item.querySelector('.item-artwork');
        if (!artwork) return;
        
        let wrapper = artwork.parentElement;
        if (!wrapper.classList.contains('item-artwork-wrapper')) {
          wrapper = document.createElement('div');
          wrapper.className = 'item-artwork-wrapper';
          artwork.parentNode.insertBefore(wrapper, artwork);
          wrapper.appendChild(artwork);
        }
        
        if (!wrapper.querySelector('.item-play-overlay')) {
          const overlay = document.createElement('div');
          overlay.className = 'item-play-overlay';
          overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
          wrapper.appendChild(overlay);
        }
      });
    }
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
                if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer && musicPlayer.mainPlayer.toggle) {
                    musicPlayer.mainPlayer.toggle();
                } else {
                    console.error('musicPlayer.mainPlayer.toggle not available');
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
                if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer && musicPlayer.mainPlayer.close) {
                    musicPlayer.mainPlayer.close();
                } else {
                    console.error('musicPlayer.mainPlayer.close not available');
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
                if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer && musicPlayer.mainPlayer.switchTab) {
                    musicPlayer.mainPlayer.switchTab('queue');
                } else {
                    console.error('musicPlayer.mainPlayer.switchTab not available');
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
                    if (tabName && typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer && musicPlayer.mainPlayer.switchTab) {
                        musicPlayer.mainPlayer.switchTab(tabName);
                    } else {
                        console.error('musicPlayer.mainPlayer.switchTab not available');
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
                if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer) {
                    musicPlayer.mainPlayer.open();
                    setTimeout(() => {
                        if (musicPlayer.mainPlayer.switchTab) {
                            musicPlayer.mainPlayer.switchTab('playlist');
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
                if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer) {
                    musicPlayer.mainPlayer.open();
                    setTimeout(() => {
                        if (musicPlayer.mainPlayer.switchTab) {
                            musicPlayer.mainPlayer.switchTab('queue');
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
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer && musicPlayer.mainPlayer.open) {
                            musicPlayer.mainPlayer.open();
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
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer && musicPlayer.mainPlayer.close) {
                            musicPlayer.mainPlayer.close();
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
                        if (typeof musicPlayer !== 'undefined' && musicPlayer.mainPlayer && musicPlayer.mainPlayer.close) {
                            musicPlayer.mainPlayer.close();
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        clickables.init();
    });
} else {
    clickables.init();
}

window.clickables = clickables;
document.addEventListener('DOMContentLoaded', () => {
    musicPlayer.mainPlayer.init();
    musicPlayer.mainPlayer.initialize();
});

window.musicPlayer = musicPlayer;

const app = {
    initialize: function() {
        window.music = music;

        storage.initialize();
        notifications.init();
        
        musicPlayer.ui.initialize();

        navigation.initialize();
        homePage.initialize();

        app.resetUI();
        app.syncGlobalState();

        deepLinkRouter.initialize();
        deepLinkRouter.bindPopState();
    },

    resetUI: function() {
        const nowPlayingArea = QUERY(NAVBAR.nowPlaying);
        if (nowPlayingArea) {
            nowPlayingArea.classList.remove(CLASSES.hasSong);
        }
        ui.updateCounts();
    },

    syncGlobalState: function() {
        window.appState = appState;
        window.playerController = {
            playSong: musicPlayer.ui.playSong,
            toggle: musicPlayer.mainPlayer.toggle,
            next: musicPlayer.playback.next,
            previous: musicPlayer.playback.previous,
            seekTo: musicPlayer.playback.seekTo,
            skip: musicPlayer.playback.skip,
        };
        window.musicAppAPI = {
            player: musicPlayer.mainPlayer,
            controls: musicPlayer.playback,
            musicPlayer: musicPlayer,
            dropdown: dropdown,
            notifications: notifications,
            playlists: playlists,
            utils: utils,
            favorites: appState.favorites,
            queue: appState.queue,
        };
    },

    goHome: function() {
        if (appState.router) {
            appState.router.navigateTo(ROUTES.HOME);
        }
    }
};

const playlists = {
    add: (name) => {
        if (!name || !name.trim()) {
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

        if (typeof homePage?.renderPlaylists === "function") {
            homePage.renderPlaylists();
        }

        notifications.notify({ type: NOTIFICATION_TYPES.SUCCESS, message: `Created playlist "${playlist.name}"` });
        return playlist;
    },

    addSong: (playlistId, song) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) {
            notifications.notify({ type: NOTIFICATION_TYPES.ERROR, message: "Playlist not found" });
            return false;
        }

        const exists = playlist.songs.some((s) => s.id === song.id);
        if (exists) {
            notifications.notify({ type: NOTIFICATION_TYPES.WARNING, message: "Song already in playlist" });
            return false;
        }

        playlist.songs.push(song);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);

        notifications.notify({ type: NOTIFICATION_TYPES.SUCCESS, message: `Added "${song.title}" to "${playlist.name}"` });
        return true;
    },

    removeSong: (playlistId, songId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) return false;

        const initialLength = playlist.songs.length;
        playlist.songs = playlist.songs.filter((s) => s.id !== songId);

        if (playlist.songs.length < initialLength) {
            storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
            notifications.notify({ type: NOTIFICATION_TYPES.INFO, message: "Song removed from playlist" });
            return true;
        }

        return false;
    },

    play: (playlistId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist || playlist.songs.length === 0) {
            notifications.notify({ type: NOTIFICATION_TYPES.WARNING, message: "Playlist is empty" });
            return;
        }

        appState.queue.clear();
        playlist.songs.slice(1).forEach((song) => appState.queue.add(song));
        musicPlayer.ui.playSong(playlist.songs[0]);

        notifications.notify({ type: NOTIFICATION_TYPES.SUCCESS, message: `Playing playlist "${playlist.name}"` });
    },

    remove: async (playlistId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) return false;
        
        const confirmed = await overlays.dialog.confirm(
            `Delete the playlist "${playlist.name}"? This cannot be undone.`, 
            {
                okText: "Delete",
                danger: true,
            }
        );
        
        if (!confirmed) return false;
        
        const playlistName = playlist.name;
        appState.playlists = appState.playlists.filter((p) => p.id !== playlistId);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
        notifications.notify({ type: NOTIFICATION_TYPES.INFO, message: `Deleted playlist "${playlistName}"` });
        
        return true;
    },

    create: async () => {
        const name = await overlays.form.prompt(
            "Enter playlist name:", 
            {
                okText: "Create",
                placeholder: "i.e. Car Sounds Favorites",
            }
        );
        
        if (name) return playlists.add(name);
        return null;
    },

    showAll: () => {
        if (appState.playlists.length === 0) {
            overlays.viewer.playlists(
                views.renderEmptyState(
                    "No Playlists", 
                    "You haven't created any playlists yet.", 
                    "Create your first playlist to organize your music."
                )
            );
            return;
        }

        const content = `
            <div class="playlists-page animate__animated animate__fadeIn">
              <div class="page-header mb-8 flex justify-between items-center">
                <div>
                  <h1 class="text-3xl font-bold mb-2">Your Playlists</h1>
                  <p class="text-gray-400">${appState.playlists.length} playlist${appState.playlists.length !== 1 ? "s" : ""}</p>
                </div>
                <button class="create-playlist-btn bg-accent-primary text-white px-6 py-3 rounded-full hover:bg-accent-secondary transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Create Playlist
                </button>
              </div>

              <div class="playlists-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${appState.playlists
                  .map(
                    (playlist, index) => `
                  <div class="playlist-card bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer" style="animation-delay: ${index * 100}ms;" data-playlist-id="${playlist.id}">
                    <div class="playlist-cover aspect-square bg-gradient-to-br from-purple-500 to-blue-600 relative">
                      <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-16 h-16">
                          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                        </svg>
                      </div>
                      <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="play-playlist-btn w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform" data-playlist-id="${playlist.id}">
                          ${ICONS.play}
                        </button>
                      </div>
                    </div>
                    <div class="p-4">
                      <h3 class="font-bold text-lg mb-1 truncate">${playlist.name}</h3>
                      <p class="text-gray-400 text-sm mb-3">${playlist.songs.length} song${playlist.songs.length !== 1 ? "s" : ""}</p>
                      <div class="flex gap-2">
                        <button class="view-playlist-btn flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-500 transition-colors text-sm" data-playlist-id="${playlist.id}">
                          View
                        </button>
                        <button class="delete-playlist-btn px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors" data-playlist-id="${playlist.id}">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `;

        overlays.viewer.playlists(content);
        const modalEl = document.getElementById("playlist-viewer");
        playlists.bindEvents(modalEl);
    },

    show: (playlistId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
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
                  <div class="playlist-header mb-8 flex items-start gap-6">
                    <div class="playlist-cover w-48 h-48 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-24 h-24">
                        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                      </svg>
                    </div>
                    <div class="playlist-info flex-1">
                      <p class="text-sm text-gray-400 mb-2">PLAYLIST</p>
                      <h1 class="text-4xl font-bold mb-4">${playlist.name}</h1>
                      <p class="text-gray-400 mb-6">${playlist.songs.length} song${playlist.songs.length !== 1 ? "s" : ""} • Created ${new Date(playlist.created).toLocaleDateString()}</p>
                      <div class="flex gap-4">
                        <button class="play-playlist-btn bg-accent-primary text-white px-8 py-3 rounded-full hover:bg-accent-secondary transition-colors flex items-center gap-2" data-playlist-id="${playlist.id}" ${
            playlist.songs.length === 0 ? "disabled" : ""
          }>
                          ${ICONS.play}
                          Play
                        </button>
                        <button class="edit-playlist-btn bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-500 transition-colors" data-playlist-id="${playlist.id}">
                          Edit
                        </button>
                        <button class="delete-playlist-btn bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors" data-playlist-id="${playlist.id}">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  ${
                    playlist.songs.length === 0
                      ? `
                    <div class="empty-playlist text-center py-12">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 mx-auto mb-4 text-gray-600">
                        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                      </svg>
                      <h3 class="text-xl font-bold mb-2">This playlist is empty</h3>
                      <p class="text-gray-400 mb-4">Add songs to start building your playlist</p>
                      <button class="browse-music-btn bg-accent-primary text-white px-6 py-2 rounded-full hover:bg-accent-secondary transition-colors">
                        Browse Music
                      </button>
                    </div>
                  `
                      : `
                    <div class="songs-list">
                      <div class="songs-header grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-700 mb-2">
                        <div class="col-span-1">#</div>
                        <div class="col-span-5">Title</div>
                        <div class="col-span-3 hidden md:block">Album</div>
                        <div class="col-span-2 hidden md:block">Date Added</div>
                        <div class="col-span-1">Duration</div>
                      </div>
                      ${playlist.songs
                        .map(
                          (song, index) => `
                        <div class="song-row grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group" data-song='${JSON.stringify(song).replace(/'/g, "&apos;")}' data-playlist-id="${
                            playlist.id
                          }" data-song-index="${index}">
                          <div class="col-span-1 text-gray-400 group-hover:hidden">${index + 1}</div>
                          <div class="col-span-1 hidden group-hover:block">
                            <button class="play-song-btn w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                              ${ICONS.play}
                            </button>
                          </div>
                          <div class="col-span-5 flex items-center gap-3">
                            <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="w-10 h-10 rounded object-cover">
                            <div>
                              <div class="font-medium">${song.title}</div>
                              <div class="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors" data-artist="${song.artist}">${song.artist}</div>
                            </div>
                          </div>
                          <div class="col-span-3 hidden md:block text-gray-400 text-sm">${song.album}</div>
                          <div class="col-span-2 hidden md:block text-gray-400 text-sm">${new Date().toLocaleDateString()}</div>
                          <div class="col-span-1 flex items-center justify-between">
                            <span class="text-gray-400 text-sm">${song.duration || "0:00"}</span>
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <button class="action-btn p-1 hover:bg-white/10 rounded transition-colors" data-action="favorite" data-song-id="${song.id}" title="Add to favorites">
                                <svg class="w-4 h-4 ${appState.favorites.has("songs", song.id) ? "text-red-500" : ""}" fill="${appState.favorites.has("songs", song.id) ? "currentColor" : "none"}" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                              </button>
                              <button class="action-btn p-1 hover:bg-white/10 rounded transition-colors" data-action="add-queue" title="Add to queue">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                              </button>
                              <button class="action-btn p-1 hover:bg-white/10 rounded transition-colors" data-action="remove-from-playlist" title="Remove from playlist">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  `
                  }
                </div>
              `;

            playlists.bindViewEvents(playlist);
            pageLoader.complete();
        }, 200);
    },

    bindEvents: (root = $byId(IDS.dynamicContent)) => {
        const dynamicContent = root;
        if (!dynamicContent) return;

        const createBtn = dynamicContent.querySelector(".create-playlist-btn");
        if (createBtn) {
            createBtn.addEventListener("click", async () => {
                const newPlaylist = await playlists.create();
                if (newPlaylist) {
                    setTimeout(() => playlists.showAll(), 100);
                }
            });
        }

        dynamicContent.querySelectorAll(".view-playlist-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const playlistId = btn.dataset.playlistId;
                playlists.show(playlistId);
            });
        });

        dynamicContent.querySelectorAll(".play-playlist-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const playlistId = btn.dataset.playlistId;
                playlists.play(playlistId);
            });
        });

        dynamicContent.querySelectorAll(".delete-playlist-btn").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const playlistId = btn.dataset.playlistId;
                if (await playlists.remove(playlistId)) {
                    setTimeout(() => playlists.showAll(), 100);
                }
            });
        });

        dynamicContent.querySelectorAll(".playlist-card").forEach((card) => {
            card.addEventListener("click", () => {
                const playlistId = card.dataset.playlistId;
                playlists.show(playlistId);
            });
        });
    },

    bindViewEvents: (playlist) => {
        const dynamicContent = $byId(IDS.dynamicContent);
        if (!dynamicContent) return;

        const playBtn = dynamicContent.querySelector(".play-playlist-btn");
        if (playBtn) {
            playBtn.addEventListener("click", () => {
                playlists.play(playlist.id);
            });
        }

        const editBtn = dynamicContent.querySelector(".edit-playlist-btn");
        if (editBtn) {
            editBtn.addEventListener("click", async () => {
                const newName = await overlays.form.prompt(
                    "Enter new playlist name:",
                    {
                        okText: "Rename",
                        placeholder: "Playlist name",
                        value: playlist.name
                    }
                );
                
                if (newName && newName.trim() && newName.trim() !== playlist.name) {
                    playlist.name = newName.trim();
                    storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
                    playlists.show(playlist.id);
                    notifications.notify({ type: NOTIFICATION_TYPES.SUCCESS, message: "Playlist renamed successfully" });
                }
            });
        }

        const deleteBtn = dynamicContent.querySelector(".delete-playlist-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                if (await playlists.remove(playlist.id)) {
                    if (appState.router) {
                        appState.router.navigateTo(ROUTES.HOME);
                    }
                }
            });
        }

        const browseBtn = dynamicContent.querySelector(".browse-music-btn");
        if (browseBtn) {
            browseBtn.addEventListener("click", () => {
                if (appState.router) {
                    appState.router.navigateTo(ROUTES.HOME);
                }
            });
        }

        dynamicContent.querySelectorAll(".song-row").forEach((row) => {
            row.addEventListener("click", (e) => {
                if (e.target.closest(".action-btn") || e.target.closest(".play-song-btn")) return;

                try {
                    const songData = JSON.parse(row.dataset.song);
                    musicPlayer.ui.playSong(songData);
                } catch (error) {}
            });
        });

        dynamicContent.querySelectorAll(".play-song-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const songRow = btn.closest(".song-row");
                try {
                    const songData = JSON.parse(songRow.dataset.song);
                    musicPlayer.ui.playSong(songData);
                } catch (error) {}
            });
        });

        dynamicContent.querySelectorAll("[data-artist]").forEach((artistEl) => {
            artistEl.addEventListener("click", (e) => {
                e.stopPropagation();
                const artistName = artistEl.dataset.artist;
                if (appState.router) {
                    appState.router.navigateTo(ROUTES.ARTIST, {
                        artist: artistName,
                    });
                }
            });
        });

        dynamicContent.querySelectorAll(".action-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const songRow = btn.closest(".song-row");
                const songData = JSON.parse(songRow.dataset.song);

                switch (action) {
                    case "favorite":
                        appState.favorites.toggle("songs", songData.id);
                        const heartIcon = btn.querySelector("svg");
                        const isFavorite = appState.favorites.has("songs", songData.id);
                        heartIcon.style.color = isFavorite ? "#ef4444" : "";
                        heartIcon.style.fill = isFavorite ? "currentColor" : "none";
                        break;
                    case "add-queue":
                        appState.queue.add(songData);
                        break;
                    case "remove-from-playlist":
                        const playlistId = songRow.dataset.playlistId;
                        const songIndex = parseInt(songRow.dataset.songIndex);
                        if (playlists.removeSong(playlistId, songData.id)) {
                            playlists.show(playlistId);
                        }
                        break;
                }
            });
        });
    },
};

window.addEventListener("load", function() {
    if (!window.appState) {
        app.initialize();
    }
});

window.MyTunesApp = {
    initialize: app.initialize,
    state: function() { return appState; },
    api: function() { return window.musicAppAPI; },
    goHome: app.goHome,
};

if (window.music) {
    app.initialize();
}

window.navigation = navigation;
window.playlists = playlists;
window.views = views;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        clickables.init();
    });
} else {
    clickables.init();
}

document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
    
    const progressBar = $byId(IDS.musicPlayerProgressBar);
    if (progressBar) {
        progressBar.addEventListener('keydown', musicPlayer.ui.handleProgressBarKeyDown);
    }
    
    setTimeout(() => {
        if (notificationPlayer.utils.isSupported()) {
            notificationPlayer.setup();
        }
    }, 100);
});

export {
    appState,
    storage,
    notificationPlayer,
    musicPlayer,
    dropdown,
    overlays,
    playlists,
    notifications,
    utils,
    app,
    pageLoader,
    navigation,
    ACTION_GRID_ITEMS
};
