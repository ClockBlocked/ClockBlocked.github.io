
import { music } from "../../modules/library.js";
import { render, create, encodeURIComponent } from "./utilities/index.js";
import { homePage, views, pageLoader, navigation, ui, pageUpdates, deepLinkRouter } from "./pages/index.js";

const CLASSES = Object.freeze({
  hidden: "hidden",
  show: "show",
  active: "active",
  marquee: "marquee",
  light: "light",
  medium: "medium",
  playing: "playing",
  repeatOne: "repeat-one",
  imageFallback: "image-fallback",
  imageLoaded: "image-loaded",
  imageError: "image-error",
  imageLoading: "image-loading",
  animateRotate: "animate__animated animate__rotateIn",
  animateFadeIn: "animate__animated animate__fadeIn",
  animateZoomIn: "animate__animated animate__zoomIn",
  animatePulse: "animate__animated animate__pulse",
});

const THEMES = Object.freeze({
  DARK: "dark",
  MEDIUM: "dim",
  LIGHT: "light",
});

const ROUTES = Object.freeze({
  HOME: "home",
  ARTIST: "artist",
  ALL_ARTISTS: "allArtists",
  SEARCH: "search",
  ALBUM: "album",
});

const STORAGE_KEYS = Object.freeze({
  THEME_PREFERENCE: "theme-color",
  RECENT_SEARCHES: "recentSearches",
  FAVORITE_SONGS: "favoriteSongs",
  FAVORITE_ARTISTS: "favoriteArtists",
  FAVORITE_ALBUMS: "favoriteAlbums",
  RECENTLY_PLAYED: "recentlyPlayed",
  PLAYLISTS: "playlists",
  QUEUE: "queue",
});

const ICONS = Object.freeze({
  dark: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>',
  medium: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>',
  light: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>',
  next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l12 8-12 8V4zm13 0v16h2V4h-2z"/></svg>',
  prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l-12 8 12 8V4zM5 4v16H3V4h2z"/></svg>',
  shuffle: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M19.5 12l3 3m-3-3l-3 3"/></svg>',
  repeat: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
  rewind: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z"/></svg>',
  forward: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z"/></svg>',
  queue: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/></svg>',
  share: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/></svg>',
  more: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"/></svg>'
});

const AUDIO_FORMATS = Object.freeze(["mp3", "ogg", "m4a"]);

const REPEAT_MODES = Object.freeze({
  OFF: "off",
  ALL: "all",
  ONE: "one",
});

const NOTIFICATION_TYPES = Object.freeze({
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
});

const ACTION_GRID_ITEMS = [
  { id: 'play-next', icon: 'M9 5l7 7-7 7M15 5v14', label: 'Play Next' },
  { id: 'add-queue', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', label: 'Add to Queue' },
  { id: 'add-playlist', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10', label: 'Add to Playlist' },
  { id: 'share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', label: 'Share' },
  { id: 'download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', label: 'Download' },
  { id: 'view-artist', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'View Artist' }
];

const TOAST_ICONS = {
  [NOTIFICATION_TYPES.SUCCESS]: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"/></svg>',
  [NOTIFICATION_TYPES.ERROR]: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd"/></svg>',
  [NOTIFICATION_TYPES.WARNING]: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/></svg>',
  [NOTIFICATION_TYPES.INFO]: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/></svg>',
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
      : '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>';
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Crect width='24' height='24' fill='${bgColor}'/%3E${icon}%3C/svg%3E`;
  }
};

const storage = {
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage save error:', error);
    }
  },
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};

const themeManager = {
  refs: {},
  cacheDOM() {
    this.refs = {
      toggle: document.getElementById('theme-toggle'),
      root: document.documentElement
    };
  },
  init() {
    const savedTheme = storage.get(STORAGE_KEYS.THEME_PREFERENCE, THEMES.DARK);
    this.applyTheme(savedTheme);
    if (this.refs.toggle) {
      this.refs.toggle.addEventListener('click', () => this.cycleTheme());
    }
  },
  applyTheme(theme) {
    if (!this.refs.root) return;
    this.refs.root.setAttribute('data-theme', theme);
    this.refs.root.classList.remove(CLASSES.light, CLASSES.medium);
    if (theme === THEMES.LIGHT) {
      this.refs.root.classList.add(CLASSES.light);
    } else if (theme === THEMES.MEDIUM) {
      this.refs.root.classList.add(CLASSES.medium);
    }
    if (this.refs.toggle) {
      this.refs.toggle.innerHTML = ICONS[theme] || ICONS.dark;
    }
    storage.save(STORAGE_KEYS.THEME_PREFERENCE, theme);
  },
  cycleTheme() {
    const current = this.refs.root?.getAttribute('data-theme') || THEMES.DARK;
    const themes = [THEMES.DARK, THEMES.MEDIUM, THEMES.LIGHT];
    const currentIndex = themes.indexOf(current);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.applyTheme(nextTheme);
  }
};

const search = {
  refs: {},
  cacheDOM() {
    this.refs = {
      trigger: document.getElementById('global-search-trigger'),
      dialog: document.getElementById('search-dialog'),
      form: document.getElementById('global-search-form'),
      input: document.getElementById('global-search-input'),
      recentList: document.getElementById('recent-searches-list')
    };
  },
  recentSearches: [],
  init() {
    this.recentSearches = storage.get(STORAGE_KEYS.RECENT_SEARCHES, []);
    if (this.refs.trigger) {
      this.refs.trigger.addEventListener('click', () => this.open());
    }
    if (this.refs.dialog) {
      this.refs.dialog.addEventListener('click', (e) => {
        if (e.target === this.refs.dialog) this.close();
      });
    }
    if (this.refs.form) {
      this.refs.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }
    this.renderRecentSearches();
  },
  open() {
    if (this.refs.dialog) {
      this.refs.dialog.showModal();
      setTimeout(() => this.refs.input?.focus(), 100);
    }
  },
  close() {
    if (this.refs.dialog) {
      this.refs.dialog.close();
      if (this.refs.input) this.refs.input.value = '';
    }
  },
  performSearch() {
    const query = this.refs.input?.value.trim();
    if (!query) return;
    this.addToRecentSearches(query);
    this.close();
    if (appState.router) {
      appState.router.navigateTo(ROUTES.SEARCH, { q: query });
    }
  },
  addToRecentSearches(query) {
    this.recentSearches = this.recentSearches.filter(s => s !== query);
    this.recentSearches.unshift(query);
    this.recentSearches = this.recentSearches.slice(0, 10);
    storage.save(STORAGE_KEYS.RECENT_SEARCHES, this.recentSearches);
    this.renderRecentSearches();
  },
  renderRecentSearches() {
    if (!this.refs.recentList) return;
    if (this.recentSearches.length === 0) {
      this.refs.recentList.innerHTML = '<p class="empty-state">No recent searches</p>';
      return;
    }
    this.refs.recentList.innerHTML = this.recentSearches.map(query => `
      <button type="button" class="recent-search-item" data-query="${query}">
        <span>${query}</span>
      </button>
    `).join('');
    this.refs.recentList.querySelectorAll('.recent-search-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        if (this.refs.input) this.refs.input.value = query;
        this.performSearch();
      });
    });
  }
};

const navbar = {
  refs: {},
  cacheDOM() {
    const navRoot = document.querySelector('nav');
    if (!navRoot) {
      console.warn("Navbar root not found");
      return;
    }
    this.refs = {
      root: navRoot,
      menuTrigger: document.getElementById('menu-trigger'),
      dropdownMenu: document.getElementById('dropdown-menu'),
      dropdownClose: document.getElementById('dropdown-close'),
      favoriteSongs: document.getElementById('favorite-songs'),
      favoriteArtists: document.getElementById('favorite-artists'),
      createPlaylist: document.getElementById('create-playlist')
    };
  },
  init() {
    if (this.refs.menuTrigger) {
      this.refs.menuTrigger.addEventListener('click', () => this.toggleMenu());
    }
    if (this.refs.dropdownClose) {
      this.refs.dropdownClose.addEventListener('click', () => this.closeMenu());
    }
    if (this.refs.dropdownMenu) {
      this.refs.dropdownMenu.addEventListener('click', (e) => {
        if (e.target === this.refs.dropdownMenu) this.closeMenu();
      });
    }
    document.addEventListener('click', (e) => {
      if (!this.refs.menuTrigger?.contains(e.target) && !this.refs.dropdownMenu?.contains(e.target)) {
        this.closeMenu();
      }
    });
  },
  toggleMenu() {
    if (this.refs.dropdownMenu) {
      const isOpen = this.refs.dropdownMenu.classList.toggle(CLASSES.show);
      this.refs.menuTrigger?.setAttribute('aria-expanded', isOpen);
    }
  },
  closeMenu() {
    if (this.refs.dropdownMenu) {
      this.refs.dropdownMenu.classList.remove(CLASSES.show);
      this.refs.menuTrigger?.setAttribute('aria-expanded', 'false');
    }
  }
};

const overlays = {
  refs: {},
  cacheDOM() {
    this.refs = {
      popoverPortal: document.getElementById('popover-portal'),
      willHideMenu: document.getElementById('will-hide-menu')
    };
  },
  init() {
    if (this.refs.willHideMenu) {
      this.refs.willHideMenu.addEventListener('click', (e) => {
        if (e.target === this.refs.willHideMenu) {
          this.closePopover();
        }
      });
    }
  },
  showPopover(content) {
    if (!this.refs.popoverPortal || !this.refs.willHideMenu) return;
    this.refs.popoverPortal.innerHTML = content;
    this.refs.willHideMenu.classList.add(CLASSES.show);
    appState.isPopupVisible = true;
  },
  closePopover() {
    if (this.refs.willHideMenu) {
      this.refs.willHideMenu.classList.remove(CLASSES.show);
      appState.isPopupVisible = false;
    }
    if (this.refs.popoverPortal) {
      setTimeout(() => {
        this.refs.popoverPortal.innerHTML = '';
      }, 300);
    }
  }
};

const musicPlayer = {
  refs: {},
  cacheDOM() {
    const root = document.getElementById('music-player');
    if (!root) {
      console.warn("Music Player Root not found");
      return;
    }
    this.refs = {
      root: root,
      drawer: {
        closeBtn: root.querySelector('#music-player-close'),
        scroller: root.querySelector('.musicPlayerScroller'),
        curtain: root.querySelector('.musicPlayerCurtain')
      },
      display: {
        cover: root.querySelector('#music-player-cover'),
        title: root.querySelector('#music-player-title'),
        artist: root.querySelector('#music-player-artist'),
        album: root.querySelector('#music-player-album'),
        currentTime: root.querySelector('#music-player-current-time'),
        totalTime: root.querySelector('#music-player-total-time')
      },
      controls: {
        play: root.querySelector('#music-player-play'),
        prev: root.querySelector('#music-player-prev'),
        next: root.querySelector('#music-player-next'),
        shuffle: root.querySelector('#music-player-shuffle'),
        repeat: root.querySelector('#music-player-repeat'),
        favorite: root.querySelector('#music-player-favorite'),
        progress: {
          bar: root.querySelector('#music-player-progress-bar'),
          fill: root.querySelector('#music-player-progress-fill'),
          thumb: root.querySelector('#music-player-progress-thumb')
        }
      },
      lists: {
        queue: root.querySelector('#music-player-queue-list'),
        recent: root.querySelector('#music-player-recent-list')
      },
      tabs: {
        nowPlaying: root.querySelector('#tab-now-playing'),
        queue: root.querySelector('#tab-queue'),
        recentlyPlayed: root.querySelector('#tab-recently-played')
      },
      counts: {
        queueCount: root.querySelector('#queue-count'),
        recentCount: root.querySelector('#recent-count')
      }
    };
  },
  mainPlayer: {
    init() {
      if (!appState.audio) {
        appState.audio = new Audio();
        appState.audio.preload = 'metadata';
      }
      musicPlayer.events.init();
      musicPlayer.ui.init();
    },
    open() {
      if (musicPlayer.refs.root) {
        musicPlayer.refs.root.classList.add(CLASSES.show);
      }
    },
    close() {
      if (musicPlayer.refs.root) {
        musicPlayer.refs.root.classList.remove(CLASSES.show);
      }
    },
    toggle() {
      if (musicPlayer.refs.root) {
        musicPlayer.refs.root.classList.toggle(CLASSES.show);
      }
    }
  },
  playback: {
    play() {
      if (appState.audio && appState.currentSong) {
        appState.audio.play().then(() => {
          appState.setPlayingState(true);
        }).catch(error => {
          console.error('Playback error:', error);
          notifications.notify({
            type: NOTIFICATION_TYPES.ERROR,
            message: 'Playback failed'
          });
        });
      }
    },
    pause() {
      if (appState.audio) {
        appState.audio.pause();
        appState.setPlayingState(false);
      }
    },
    toggle() {
      if (appState.isPlaying) {
        musicPlayer.playback.pause();
      } else {
        musicPlayer.playback.play();
      }
    },
    next() {
      const queueSong = appState.queue.getNext();
      if (queueSong) {
        musicPlayer.ui.playSong(queueSong);
        return;
      }
      if (!appState.currentSong) return;
      const currentArtist = music.find(a => a.artist === appState.currentSong.artist);
      if (!currentArtist) return;
      const allSongs = currentArtist.albums.flatMap(album => album.songs);
      const currentIndex = allSongs.findIndex(s => s.id === appState.currentSong.id);
      if (currentIndex === -1) return;
      if (appState.repeatMode === REPEAT_MODES.ONE) {
        musicPlayer.playback.seekTo(0);
        musicPlayer.playback.play();
        return;
      }
      let nextIndex;
      if (appState.shuffleMode) {
        nextIndex = Math.floor(Math.random() * allSongs.length);
      } else {
        nextIndex = currentIndex + 1;
        if (nextIndex >= allSongs.length) {
          if (appState.repeatMode === REPEAT_MODES.ALL) {
            nextIndex = 0;
          } else {
            return;
          }
        }
      }
      musicPlayer.ui.playSong(allSongs[nextIndex]);
    },
    previous() {
      if (!appState.currentSong) return;
      if (appState.audio && appState.audio.currentTime > 3) {
        musicPlayer.playback.seekTo(0);
        return;
      }
      const currentArtist = music.find(a => a.artist === appState.currentSong.artist);
      if (!currentArtist) return;
      const allSongs = currentArtist.albums.flatMap(album => album.songs);
      const currentIndex = allSongs.findIndex(s => s.id === appState.currentSong.id);
      if (currentIndex === -1) return;
      let prevIndex;
      if (appState.shuffleMode) {
        prevIndex = Math.floor(Math.random() * allSongs.length);
      } else {
        prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          if (appState.repeatMode === REPEAT_MODES.ALL) {
            prevIndex = allSongs.length - 1;
          } else {
            return;
          }
        }
      }
      musicPlayer.ui.playSong(allSongs[prevIndex]);
    },
    seekTo(time) {
      if (appState.audio) {
        appState.audio.currentTime = time;
      }
    },
    toggleShuffle() {
      appState.toggleShuffle();
      ui.updateShuffleButton();
    },
    cycleRepeatMode() {
      const modes = [REPEAT_MODES.OFF, REPEAT_MODES.ALL, REPEAT_MODES.ONE];
      const currentIndex = modes.indexOf(appState.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      appState.setRepeatMode(nextMode);
      ui.updateRepeatButton();
    }
  },
  events: {
    init() {
      if (!appState.audio) return;
      appState.audio.addEventListener('loadedmetadata', () => {
        appState.setState({ duration: appState.audio.duration });
      });
      appState.audio.addEventListener('timeupdate', () => {
        if (!appState.isDragging) {
          appState.setState({ currentTime: appState.audio.currentTime });
        }
      });
      appState.audio.addEventListener('ended', () => {
        musicPlayer.playback.next();
      });
      appState.audio.addEventListener('play', () => {
        appState.setPlayingState(true);
      });
      appState.audio.addEventListener('pause', () => {
        appState.setPlayingState(false);
      });
      if (musicPlayer.refs.drawer?.closeBtn) {
        musicPlayer.refs.drawer.closeBtn.addEventListener('click', () => {
          musicPlayer.mainPlayer.close();
        });
      }
      if (musicPlayer.refs.controls?.play) {
        musicPlayer.refs.controls.play.addEventListener('click', () => {
          musicPlayer.playback.toggle();
        });
      }
      if (musicPlayer.refs.controls?.next) {
        musicPlayer.refs.controls.next.addEventListener('click', () => {
          musicPlayer.playback.next();
        });
      }
      if (musicPlayer.refs.controls?.prev) {
        musicPlayer.refs.controls.prev.addEventListener('click', () => {
          musicPlayer.playback.previous();
        });
      }
      if (musicPlayer.refs.controls?.shuffle) {
        musicPlayer.refs.controls.shuffle.addEventListener('click', () => {
          musicPlayer.playback.toggleShuffle();
        });
      }
      if (musicPlayer.refs.controls?.repeat) {
        musicPlayer.refs.controls.repeat.addEventListener('click', () => {
          musicPlayer.playback.cycleRepeatMode();
        });
      }
      if (musicPlayer.refs.controls?.favorite) {
        musicPlayer.refs.controls.favorite.addEventListener('click', () => {
          if (appState.currentSong) {
            appState.favorites.toggle('songs', appState.currentSong.id);
          }
        });
      }
      if (musicPlayer.refs.controls?.progress?.bar) {
        const progressBar = musicPlayer.refs.controls.progress.bar;
        const progressThumb = musicPlayer.refs.controls.progress.thumb;
        progressBar.addEventListener('mousedown', (e) => {
          appState.isDragging = true;
          musicPlayer.events.handleProgressDrag(e);
        });
        progressBar.addEventListener('touchstart', (e) => {
          appState.isDragging = true;
          musicPlayer.events.handleProgressDrag(e.touches[0]);
        });
        document.addEventListener('mousemove', (e) => {
          if (appState.isDragging) {
            musicPlayer.events.handleProgressDrag(e);
          }
        });
        document.addEventListener('touchmove', (e) => {
          if (appState.isDragging) {
            musicPlayer.events.handleProgressDrag(e.touches[0]);
          }
        });
        document.addEventListener('mouseup', () => {
          appState.isDragging = false;
        });
        document.addEventListener('touchend', () => {
          appState.isDragging = false;
        });
      }
      if (musicPlayer.refs.tabs) {
        Object.values(musicPlayer.refs.tabs).forEach(tab => {
          if (tab) {
            tab.addEventListener('click', () => {
              const tabName = tab.id.replace('tab-', '');
              musicPlayer.ui.switchTab(tabName);
            });
          }
        });
      }
    },
    handleProgressDrag(e) {
      if (!musicPlayer.refs.controls?.progress?.bar || !appState.duration) return;
      const progressBar = musicPlayer.refs.controls.progress.bar;
      const rect = progressBar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * appState.duration;
      musicPlayer.playback.seekTo(newTime);
      appState.setState({ currentTime: newTime });
    }
  },
  ui: {
    init() {
      this.updatePlayButton();
      this.updateShuffleButton();
      this.updateRepeatButton();
      this.updateFavoriteButton();
      this.updateCounts();
      PubSub.subscribe(PLAYER_EVENTS.PLAYBACK_STATE, () => {
        this.updatePlayButton();
      });
      PubSub.subscribe(PLAYER_EVENTS.CURRENT_SONG, () => {
        this.updateDisplay();
        this.updateFavoriteButton();
      });
      PubSub.subscribe(PLAYER_EVENTS.TIME_UPDATE, () => {
        this.updateProgress();
      });
      PubSub.subscribe(PLAYER_EVENTS.SHUFFLE_MODE, () => {
        this.updateShuffleButton();
      });
      PubSub.subscribe(PLAYER_EVENTS.REPEAT_MODE, () => {
        this.updateRepeatButton();
      });
      PubSub.subscribe('queue:changed', () => {
        this.renderQueue();
        this.updateCounts();
      });
      PubSub.subscribe(PLAYER_EVENTS.RECENTLY_PLAYED_CHANGED, () => {
        this.renderRecentlyPlayed();
        this.updateCounts();
      });
    },
    playSong(song) {
      if (!appState.audio || !song) return;
      appState.setCurrentSong(song);
      const artistData = music.find(a => a.artist === song.artist);
      const albumData = artistData?.albums.find(album => album.album === song.album);
      if (!albumData) return;
      appState.audio.src = song.file;
      appState.audio.load();
      musicPlayer.playback.play();
      musicPlayer.mainPlayer.open();
      this.addToRecentlyPlayed(song);
    },
    updateDisplay() {
      if (!appState.currentSong) return;
      const { cover, title, artist, album } = musicPlayer.refs.display || {};
      if (title) title.textContent = appState.currentSong.title;
      if (artist) artist.textContent = appState.currentSong.artist;
      if (album) album.textContent = appState.currentSong.album;
      if (cover) {
        const albumImageUrl = utils.getAlbumImageUrl(appState.currentSong.album);
        utils.loadImageWithFallback(cover, albumImageUrl, utils.getDefaultAlbumImage(), 'album');
      }
    },
    updatePlayButton() {
      const playBtn = musicPlayer.refs.controls?.play;
      if (!playBtn) return;
      playBtn.innerHTML = appState.isPlaying ? ICONS.pause : ICONS.play;
      playBtn.setAttribute('aria-label', appState.isPlaying ? 'Pause' : 'Play');
    },
    updateProgress() {
      const { currentTime, totalTime } = musicPlayer.refs.display || {};
      const { fill, thumb } = musicPlayer.refs.controls?.progress || {};
      if (currentTime) {
        currentTime.textContent = utils.formatTime(appState.currentTime || 0);
      }
      if (totalTime) {
        totalTime.textContent = utils.formatTime(appState.duration || 0);
      }
      if (fill && thumb && appState.duration) {
        const percentage = (appState.currentTime / appState.duration) * 100;
        fill.style.width = `${percentage}%`;
        thumb.style.left = `${percentage}%`;
      }
    },
    updateShuffleButton() {
      const shuffleBtn = musicPlayer.refs.controls?.shuffle;
      if (!shuffleBtn) return;
      shuffleBtn.classList.toggle(CLASSES.active, appState.shuffleMode);
      shuffleBtn.setAttribute('aria-pressed', appState.shuffleMode);
    },
    updateRepeatButton() {
      const repeatBtn = musicPlayer.refs.controls?.repeat;
      if (!repeatBtn) return;
      repeatBtn.classList.toggle(CLASSES.active, appState.repeatMode !== REPEAT_MODES.OFF);
      repeatBtn.classList.toggle(CLASSES.repeatOne, appState.repeatMode === REPEAT_MODES.ONE);
      repeatBtn.setAttribute('aria-label', `Repeat: ${appState.repeatMode}`);
    },
    updateFavoriteButton() {
      const favoriteBtn = musicPlayer.refs.controls?.favorite;
      if (!favoriteBtn || !appState.currentSong) return;
      const isFavorite = appState.favorites.has('songs', appState.currentSong.id);
      favoriteBtn.classList.toggle(CLASSES.active, isFavorite);
      favoriteBtn.setAttribute('aria-pressed', isFavorite);
      const svg = favoriteBtn.querySelector('svg');
      if (svg) {
        svg.style.color = isFavorite ? "#ef4444" : "";
        svg.style.fill = isFavorite ? "currentColor" : "none";
      }
    },
    switchTab(tabName) {
      appState.currentTab = tabName;
      const tabs = musicPlayer.refs.tabs;
      if (tabs) {
        Object.values(tabs).forEach(tab => {
          if (tab) tab.classList.remove(CLASSES.active);
        });
        const activeTab = tabs[tabName.replace(/-/g, '')];
        if (activeTab) activeTab.classList.add(CLASSES.active);
      }
    },
    renderQueue() {
      const queueList = musicPlayer.refs.lists?.queue;
      if (!queueList) return;
      const queue = appState.queue.get();
      if (queue.length === 0) {
        queueList.innerHTML = '<p class="empty-state">Queue is empty</p>';
        return;
      }
      queueList.innerHTML = queue.map((song, index) => `
        <div class="song-item" data-song-id="${song.id}" data-queue-index="${index}">
          <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.album}" class="song-cover">
          <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
          </div>
          <button class="btn-icon" data-action="remove-from-queue" data-index="${index}">
            ${ICONS.close}
          </button>
        </div>
      `).join('');
      queueList.querySelectorAll('[data-action="remove-from-queue"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          appState.queue.remove(index);
        });
      });
      queueList.querySelectorAll('.song-item').forEach(item => {
        item.addEventListener('click', () => {
          const index = parseInt(item.dataset.queueIndex);
          appState.queue.playAt(index);
        });
      });
    },
    addToRecentlyPlayed(song) {
      appState.recentlyPlayed = appState.recentlyPlayed.filter(s => s.id !== song.id);
      appState.recentlyPlayed.unshift(song);
      appState.recentlyPlayed = appState.recentlyPlayed.slice(0, 50);
      storage.save(STORAGE_KEYS.RECENTLY_PLAYED, appState.recentlyPlayed);
      PubSub.publish(PLAYER_EVENTS.RECENTLY_PLAYED_CHANGED);
    },
    renderRecentlyPlayed() {
      const recentList = musicPlayer.refs.lists?.recent;
      if (!recentList) return;
      if (appState.recentlyPlayed.length === 0) {
        recentList.innerHTML = '<p class="empty-state">No recently played songs</p>';
        return;
      }
      recentList.innerHTML = appState.recentlyPlayed.map(song => `
        <div class="song-item" data-song-id="${song.id}">
          <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.album}" class="song-cover">
          <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
          </div>
          <button class="btn-icon btn-play">
            ${ICONS.play}
          </button>
        </div>
      `).join('');
      recentList.querySelectorAll('.song-item').forEach(item => {
        item.addEventListener('click', () => {
          const songId = item.dataset.songId;
          const song = appState.recentlyPlayed.find(s => s.id === songId);
          if (song) musicPlayer.ui.playSong(song);
        });
      });
    },
    updateCounts() {
      const { queueCount, recentCount } = musicPlayer.refs.counts || {};
      if (queueCount) {
        queueCount.textContent = appState.queue.get().length;
      }
      if (recentCount) {
        recentCount.textContent = appState.recentlyPlayed.length;
      }
    }
  }
};

const notifications = {
  refs: {},
  cacheDOM() {
    this.refs = {
      container: document.getElementById('notification-container')
    };
    if (!this.refs.container) {
      this.refs.container = document.createElement('div');
      this.refs.container.id = 'notification-container';
      this.refs.container.className = 'notification-container';
      document.body.appendChild(this.refs.container);
    }
  },
  notify({ type = NOTIFICATION_TYPES.INFO, message, duration = 3000 }) {
    if (!this.refs.container) return;
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-icon">${TOAST_ICONS[type] || TOAST_ICONS[NOTIFICATION_TYPES.INFO]}</div>
      <div class="notification-message">${message}</div>
    `;
    this.refs.container.appendChild(notification);
    setTimeout(() => notification.classList.add(CLASSES.show), 10);
    setTimeout(() => {
      notification.classList.remove(CLASSES.show);
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
};

function initializeApp() {
  themeManager.cacheDOM();
  search.cacheDOM();
  navbar.cacheDOM();
  overlays.cacheDOM();
  musicPlayer.cacheDOM();
  notifications.cacheDOM();
  themeManager.init();
  search.init();
  navbar.init();
  overlays.init();
  musicPlayer.mainPlayer.init();
  const savedQueue = storage.get(STORAGE_KEYS.QUEUE, []);
  appState.queue.items = savedQueue;
  const savedRecentlyPlayed = storage.get(STORAGE_KEYS.RECENTLY_PLAYED, []);
  appState.recentlyPlayed = savedRecentlyPlayed;
  const savedFavoriteSongs = storage.get(STORAGE_KEYS.FAVORITE_SONGS, []);
  appState.favorites.songs = new Set(savedFavoriteSongs);
  const savedFavoriteArtists = storage.get(STORAGE_KEYS.FAVORITE_ARTISTS, []);
  appState.favorites.artists = new Set(savedFavoriteArtists);
  const savedFavoriteAlbums = storage.get(STORAGE_KEYS.FAVORITE_ALBUMS, []);
  appState.favorites.albums = new Set(savedFavoriteAlbums);
  const savedPlaylists = storage.get(STORAGE_KEYS.PLAYLISTS, []);
  appState.playlists = savedPlaylists;
  musicPlayer.ui.renderQueue();
  musicPlayer.ui.renderRecentlyPlayed();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

export {
  CLASSES,
  THEMES,
  ROUTES,
  STORAGE_KEYS,
  ICONS,
  AUDIO_FORMATS,
  REPEAT_MODES,
  NOTIFICATION_TYPES,
  ACTION_GRID_ITEMS,
  TOAST_ICONS,
  prefersReducedMotion,
  PubSub,
  PLAYER_EVENTS,
  appState,
  utils,
  storage,
  themeManager,
  search,
  navbar,
  overlays,
  musicPlayer,
  notifications
};
