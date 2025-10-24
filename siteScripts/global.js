import { IDS, CLASSES, ROUTES, THEMES, STORAGE_KEYS, ICONS, AUDIO_FORMATS, REPEAT_MODES, NOTIFICATION_TYPES, $, $byId } from "./map.js";
import { music } from "../modules/library.js";
import { render, create } from "./utilities/templates.js";
import { encodeURIComponent } from './utilities/parsers.js';
import { homePage, views } from './pages/statics.js';
import { pageLoader, navigation } from './pages/rendering.js';
import { ui, pageUpdates } from './pages/updates.js';
import { deepLinkRouter } from './pages/router.js';

const ACTION_GRID_ITEMS = [
  { id: 'play-next', icon: 'M9 5l7 7-7 7M15 5v14', label: 'Play Next' },
  { id: 'add-queue', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', label: 'Add to Queue' },
  { id: 'add-playlist', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10', label: 'Add to Playlist' },
  { id: 'share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z', label: 'Share' },
  { id: 'download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', label: 'Download' },
  { id: 'view-artist', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'View Artist' }
];

const TOAST_ICONS = {
  [NOTIFICATION_TYPES.SUCCESS]: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
  [NOTIFICATION_TYPES.ERROR]: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
  [NOTIFICATION_TYPES.WARNING]: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.742-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
  [NOTIFICATION_TYPES.INFO]: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
};

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

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
  isInitialized: false, // Flag to prevent multiple initializations

  favorites: {
    songs: new Set(),
    artists: new Set(),
    albums: new Set(),

    add: function(type, id) {
      appState.favorites[type].add(id);
      appState.favorites.save(type);
      appState.favorites.updateIcon(type, id, true);
      const itemName = type === "songs" ? "song" : type.slice(0, -1);
      notifications.show(`Added ${itemName} to favorites`, NOTIFICATION_TYPES.SUCCESS);
    },

    remove: function(type, id) {
      appState.favorites[type].delete(id);
      appState.favorites.save(type);
      appState.favorites.updateIcon(type, id, false);
      const itemName = type === "songs" ? "song" : type.slice(0, -1);
      notifications.show(`Removed ${itemName} from favorites`, NOTIFICATION_TYPES.INFO);
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
      notifications.show(`Added "${utils.escapeHtml(song.title)}" to queue`);
    },

    remove: function(index) {
      if (index >= 0 && index < appState.queue.items.length) {
        const removed = appState.queue.items.splice(index, 1)[0];
        storage.save(STORAGE_KEYS.QUEUE, appState.queue.items);
        ui.updateCounts();
        return removed;
      }
      return null;
    },

    clear: function() {
      appState.queue.items = [];
      storage.save(STORAGE_KEYS.QUEUE, appState.queue.items);
      ui.updateCounts();
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
    const cleanName = String(albumName).toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
    return `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-mobile-layout-issues/global/content/images/albumCovers/${cleanName}.png`;
  },

  formatTime: (seconds) => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  },

  normalizeForUrl: (text) => {
    return String(text)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "");
  },

  getArtistImageUrl: (artistName) => {
    if (!artistName) return utils.getDefaultArtistImage();
    const normalized = utils.normalizeForUrl(artistName);
    return `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-mobile-layout-issues/global/content/images/artistPortraits/${normalized}.png`;
  },

  getDefaultAlbumImage: () => {
    return "https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-mobile-layout-issues/global/content/images/albumCovers/default-album.png";
  },

  getDefaultArtistImage: () => {
    return "https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-mobile-layout-issues/global/content/images/artistPortraits/default-artist.png";
  },

  getTotalSongs: (artist) => {
    if (!artist || !Array.isArray(artist.albums)) return 0;
    return artist.albums.reduce((total, album) => total + (album.songs?.length || 0), 0);
  },

  loadImageWithFallback: (imgElement, primaryUrl, fallbackUrl, type = "image") => {
    if (!imgElement) return;
    imgElement.classList.add(CLASSES.imageLoading);
    imgElement.classList.remove(CLASSES.imageLoaded, CLASSES.imageError, CLASSES.imageFallback);

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
        imgElement.classList.remove(CLASSES.imageLoading, CLASSES.imageError);
        imgElement.classList.add(CLASSES.imageLoaded);
      };

      fallbackImage.onerror = () => {
        imgElement.src = utils.generatePlaceholder(type);
        imgElement.classList.remove(CLASSES.imageLoading, CLASSES.imageError);
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
    const lib = window.MyTunesApp?.music;
    if (!Array.isArray(lib) || !lib.length) return [];
    const artist = lib.find(a => a.artist === artistName);
    if (!artist || !Array.isArray(artist.similar)) return [];
    const arr = includeSelf ? artist.similar.slice() : artist.similar.filter(n => n !== artistName);
    return Array.from(new Set(arr)).slice(0, limit);
  },

  scrollToTop: () => {
    let area = document.getElementById('pageWrapper');
    if (area) {
        area.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
    }
  },

  getParameterByName: (name, url = window.location.href) => {
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  escapeHtml: (s) => {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};

const storage = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage [${key}]:`, error);
      return false;
    }
  },

  load: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading from localStorage [${key}]:`, error);
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
      if (data && Array.isArray(data)) { // Ensure data is array before creating Set
        appState.favorites[type] = new Set(data);
      } else {
        appState.favorites[type] = new Set(); // Initialize as empty Set if load fails or is invalid
      }
    });

    const dataLoaders = {
      [STORAGE_KEYS.RECENTLY_PLAYED]: (data) => (appState.recentlyPlayed = Array.isArray(data) ? data : []),
      [STORAGE_KEYS.PLAYLISTS]: (data) => (appState.playlists = Array.isArray(data) ? data : []),
      [STORAGE_KEYS.QUEUE]: (data) => (appState.queue.items = Array.isArray(data) ? data : [])
    };

    Object.entries(dataLoaders).forEach(([key, loader]) => {
      const data = storage.load(key);
      loader(data); // Loader function handles null/invalid data
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

    if (!menu || !trigger || !menu.classList.contains(CLASSES.show)) return;

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

    try {
        if (typeof modal.showModal === 'function') {
            modal.showModal();
            modal.offsetHeight; // Force reflow
            requestAnimationFrame(() => modal.setAttribute('open', ''));
        } else {
            console.error('dialog.showModal() is not supported.');
            // Fallback display if needed
            modal.style.display = 'block';
             modal.setAttribute('open', '');
        }
    } catch (error) {
        console.error('Error showing modal:', error);
    }
  },

  close: (id) => {
    const modal = document.getElementById(id);
    if (modal && modal.hasAttribute('open')) {
      modal.classList.add('closing');
      modal.addEventListener('animationend', () => {
          if (typeof modal.close === 'function') {
              try { modal.close(); } catch {} // Catch errors if already closed
          } else {
               modal.style.display = 'none'; // Fallback
          }
          modal.classList.remove('closing');
          modal.removeAttribute('open');
      }, { once: true });
    }
  },

  dialog: {
    confirm(message, { okText = "OK", cancelText = "Cancel", danger = false } = {}) {
      return new Promise((resolve) => {
        const id = "confirm-dialog-" + Date.now(); // Unique ID for multiple confirms
        overlays.open(
          id,
          render.overlay('dialog', {
            message: utils.escapeHtml(message),
            okText: utils.escapeHtml(okText),
            cancelText: utils.escapeHtml(cancelText),
            danger,
          }),
          'dialog'
        );

        const modal = document.getElementById(id);
        if (!modal) return resolve(false); // Modal creation failed

        const handleCancel = () => {
          overlays.close(id);
          resolve(false); // Resolve immediately, animation handles removal
        };

        const handleOk = () => {
          overlays.close(id);
          resolve(true); // Resolve immediately
        };

        modal.querySelector("[data-cancel]")?.addEventListener("click", handleCancel, { once: true });
        modal.querySelector("[data-ok]")?.addEventListener("click", handleOk, { once: true });
      });
    },

    alert(message, { okText = "OK" } = {}) {
      return new Promise((resolve) => {
        const id = "alert-dialog-" + Date.now(); // Unique ID
        overlays.open(
          id,
          render.overlay('dialog', {
            message: utils.escapeHtml(message),
            okText: utils.escapeHtml(okText),
            cancelText: null, // No cancel button
            danger: false,
          }),
          'dialog'
        );

        const modal = document.getElementById(id);
         if (!modal) return resolve(); // Modal creation failed

        const handleOk = () => {
          overlays.close(id);
          resolve(); // Resolve immediately
        };

        modal.querySelector("[data-ok]")?.addEventListener("click", handleOk, { once: true });
      });
    }
  },

  form: {
    prompt(message, { okText = "Create", cancelText = "Cancel", placeholder = "", value = "" } = {}) {
      return new Promise((resolve) => {
        const id = "prompt-form-" + Date.now(); // Unique ID
        overlays.open(
          id,
          render.overlay('prompt', {
            message: utils.escapeHtml(message),
            okText: utils.escapeHtml(okText),
            cancelText: utils.escapeHtml(cancelText),
            placeholder: utils.escapeHtml(placeholder),
            value: utils.escapeHtml(value),
          }),
          'form'
        );

        const modal = document.getElementById(id);
        if (!modal) return resolve(null); // Modal creation failed

        const input = modal.querySelector(".input");

        if (input) {
            setTimeout(() => input.focus(), 100); // Focus after modal is shown
        }

        const handleCancel = () => {
          overlays.close(id);
          resolve(null); // Resolve immediately
        };

        const handleOk = () => {
          const inputValue = input ? input.value.trim() : null;
          overlays.close(id);
          resolve(inputValue || null); // Resolve immediately
        };

        input?.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleOk();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
          }
        });

        modal.querySelector("[data-cancel]")?.addEventListener("click", handleCancel, { once: true });
        modal.querySelector("[data-ok]")?.addEventListener("click", handleOk, { once: true });
      });
    }
  },

  viewer: {
    playlists(content) {
      overlays.open('playlist-viewer', content, 'viewer playlist');
    },

    artists(content) {
      overlays.open('artist-viewer', content, 'viewer artist');
    }
  }
};

const notifications = {
  container: null,
  items: new Set(),

  initialize() {
    if (this.container && document.body.contains(this.container)) return;
    const existing = document.getElementById("toast-portal");
    this.container = existing || document.createElement("div");
    this.container.id = this.container.id || "toast-portal";
    if (!existing && this.container) { // Check if container exists before appending
        document.body.appendChild(this.container);
    }
  },

  show(message, type = NOTIFICATION_TYPES.INFO, undoCallback = null, options = {}) {
    this.initialize();
    if (!this.container) return null; // Don't proceed if container is missing

    const duration = Number.isFinite(options.duration) ? Math.max(1200, options.duration) : 5000;
    const title = options.title || null;
    const iconHtml = options.iconHtml || TOAST_ICONS[type] || TOAST_ICONS[NOTIFICATION_TYPES.INFO];

    const toastHtml = render.notification({
      type,
      iconHtml,
      title: title ? utils.escapeHtml(title) : null,
      message: utils.escapeHtml(String(message)),
    });

    const toast = create(toastHtml);
    if (!toast) return null; // Check if element creation failed

    if (!prefersReducedMotion) {
      toast.style.animation = "toast-in 200ms cubic-bezier(.2,.8,.25,1) both";
    }

    const dismiss = (reason = "manual") => {
      if (!this.items.has(toast)) return;
      ctrl.stop();
      this.items.delete(toast);

      const animationName = reason === 'swipe' ? (toast.style.transform.includes('-') ? 'toast-swipe-out-left' : 'toast-swipe-out-right') : 'toast-out-up';
      const animationDuration = reason === 'swipe' ? 220 : 180;

      if (!prefersReducedMotion) {
          toast.style.animation = `${animationName} ${animationDuration}ms cubic-bezier(.2,.8,.25,1) forwards`;
          setTimeout(() => toast.remove(), animationDuration - 20); // Remove slightly before animation ends
      } else {
          toast.remove();
      }
    };


    const actions = toast.querySelector('.toast-actions');
    if (actions && typeof undoCallback === "function") {
      const undoBtn = document.createElement("button");
      undoBtn.type = "button";
      undoBtn.textContent = "Undo";
      undoBtn.addEventListener("click", () => {
        try { undoCallback(); } catch(e) { console.error("Undo callback failed:", e); }
        dismiss("undo");
      });
      actions.appendChild(undoBtn);
    }

    const progress = toast.querySelector('.toast-progress');
    if (!progress) {
        console.warn('Toast progress bar element not found');
        // Optionally create it dynamically if needed
    }


    this.container.prepend(toast);
    this.items.add(toast);

    const ctrl = this.createTimerController({
      duration,
      onTick: (ratioRemaining) => {
        if (progress) { // Check if progress exists
            progress.style.width = (ratioRemaining * 100).toFixed(2) + "%";
        }
      },
      onEnd: () => dismiss("timeout"),
    });

    const pause = () => ctrl.pause();
    const resume = () => ctrl.resume();

    toast.addEventListener("mouseenter", pause);
    toast.addEventListener("mouseleave", resume);
    toast.addEventListener("touchstart", (e) => { pause(); /* touchStart(e); */ }, { passive: true }); // Pointer handles start
    toast.addEventListener("touchend", (e) => { /* touchEnd(e); */ resume(); }); // Pointer handles end
    toast.addEventListener("touchcancel", (e) => { /* touchEnd(e); */ resume(); }); // Pointer handles cancel


    let drag = null;
    const threshold = 56;
    const maxFade = 80;

    const startDrag = (clientX) => {
      drag = { startX: clientX, lastX: clientX };
      toast.style.transition = "none"; // Disable transition during drag
    };
    const onDrag = (clientX) => {
      if (!drag) return;
      drag.lastX = clientX;
      const dx = clientX - drag.startX;
      toast.style.transform = `translateX(${dx}px)`;
      const abs = Math.min(Math.abs(dx), maxFade);
      const alpha = 1 - (abs / maxFade) * 0.85; // Fade out as it moves
      toast.style.opacity = String(Math.max(0.15, alpha));
    };
    const endDrag = (e) => { // Pass event for releasePointerCapture
      if (!drag) return;
      const dx = drag.lastX - drag.startX;
      // Re-enable transition for smooth return or dismissal
      toast.style.transition = "transform 180ms cubic-bezier(.2,.8,.25,1), opacity 160ms linear";
      if (Math.abs(dx) >= threshold) {
        // Use dismiss with 'swipe' reason for correct animation
        dismiss("swipe");
      } else {
        // Reset styles if not swiped far enough
        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";
      }
       if (toast.releasePointerCapture && e?.pointerId) { // Check if supported and pointerId exists
         try { toast.releasePointerCapture(e.pointerId); } catch {}
      }
      drag = null;
    };


    toast.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return; // Only primary mouse button
      ctrl.pause();
      if (toast.setPointerCapture) { // Check if supported
        try { toast.setPointerCapture(e.pointerId); } catch {}
      }
      startDrag(e.clientX);
    });
    toast.addEventListener("pointermove", (e) => {
      if (!drag || !e.isPrimary) return; // Only track primary pointer
      onDrag(e.clientX);
    });
    // Use pointerup for both mouse and touch end
    toast.addEventListener("pointerup", (e) => {
      endDrag(e); // Pass event
      ctrl.resume();
    });
     // Handle cases where the pointer interaction is cancelled
    toast.addEventListener("pointercancel", (e) => {
      endDrag(e); // Pass event
      ctrl.resume();
    });

    return toast;
  },

  createTimerController({ duration, onTick, onEnd }) {
    let start = performance.now();
    let remaining = duration;
    let raf = null;
    let running = true;

    function frame(now) {
      if (!running) return;
      const elapsed = now - start;
      const left = Math.max(0, remaining - elapsed);
      const ratioRemaining = left / duration;
      onTick?.(ratioRemaining);
      if (left <= 0) {
        running = false;
        onEnd?.();
        raf = null; // Clear RAF ID
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      pause() {
        if (!running || raf === null) return;
        running = false;
        remaining -= performance.now() - start;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      },
      resume() {
        if (running || raf !== null) return;
        running = true;
        start = performance.now();
        raf = requestAnimationFrame(frame);
      },
      stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      }
    };
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
        console.error("Failed to update media metadata:", error);
      }
    },

    clear: () => {
      if (!('mediaSession' in navigator)) return;
      try {
        navigator.mediaSession.metadata = null;
        notificationPlayer.state.currentMetadata = null;
      } catch (error) {
        console.warn("Failed to clear metadata:", error);
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
        // console.warn("Failed to update position state:", error); // Reduce console noise
      }
    },

    reset: () => {
      if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) {
        return;
      }

      try {
        navigator.mediaSession.setPositionState(null);
      } catch (error) {
        console.warn("Failed to reset position state:", error);
      }
    },

    startContinuousUpdate: () => {
      notificationPlayer.positionState.stopContinuousUpdate(); // Clear existing interval first
      notificationPlayer.state.positionUpdateInterval = setInterval(() => {
        notificationPlayer.positionState.update();
      }, 1000); // Update every second
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

        // Always update position state when playback state changes
        notificationPlayer.positionState.update();
      } catch (error) {
        console.warn("Failed to update playback state:", error);
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
      notificationPlayer.positionState.stopContinuousUpdate(); // Ensure updates stop
    },

    onEnded: () => {
      notificationPlayer.playbackState.update('paused'); // Often treated as paused at the end
      notificationPlayer.positionState.update(); // Update one last time to show end position
      notificationPlayer.positionState.stopContinuousUpdate();
    }
  },

  actions: {
    play: () => {
      try {
        if (musicPlayer.playback?.play) {
           musicPlayer.playback.play(); // Prefer using the app's play function
        } else if (appState.audio && appState.audio.paused) {
          appState.audio.play().catch(e => console.error("Media Session play failed:", e));
        }
      } catch (error) {
        console.error('Failed to execute play action:', error);
      }
    },

    pause: () => {
      try {
         if (musicPlayer.playback?.pause) {
           musicPlayer.playback.pause(); // Prefer using the app's pause function
         } else if (appState.audio && !appState.audio.paused) {
          appState.audio.pause();
        }
      } catch (error) {
        console.error('Failed to execute pause action:', error);
      }
    },

    stop: () => {
      try {
        // Stop usually means pause and reset time
        if (appState.audio) {
          appState.audio.pause();
          appState.audio.currentTime = 0;
        }
        notificationPlayer.playbackState.onStop(); // Update state
      } catch (error) {
        console.error('Failed to execute stop action:', error);
      }
    },

    previoustrack: () => {
      try {
        // If > 3 seconds in, restart track, otherwise go to previous
        if (appState.audio && appState.audio.currentTime > 3) {
           if (musicPlayer.playback?.seekTo) {
             musicPlayer.playback.seekTo(0); // Use app's seek if available
           } else {
            appState.audio.currentTime = 0;
           }
          notificationPlayer.positionState.update();
        } else {
          if (musicPlayer.playback?.previous) {
            musicPlayer.playback.previous(); // Use app's previous function
          }
        }
      } catch (error) {
        console.error('Failed to execute previous track action:', error);
      }
    },

    nexttrack: () => {
      try {
        if (musicPlayer.playback?.next) {
          musicPlayer.playback.next(); // Use app's next function
        }
      } catch (error) {
        console.error('Failed to execute next track action:', error);
      }
    },

    seekto: (details) => {
      try {
        if (!details || typeof details.seekTime !== 'number') return;
        const seekTime = details.seekTime;

        if (musicPlayer.playback?.seekTo) {
             musicPlayer.playback.seekTo(seekTime); // Use app's seek if available
        } else if (appState.audio) {
            const safeTime = Math.max(0, Math.min(seekTime, appState.audio.duration || Infinity));
             if (details.fastSeek && 'fastSeek' in appState.audio) {
               try { appState.audio.fastSeek(safeTime); } catch (e) { appState.audio.currentTime = safeTime;}
            } else {
               appState.audio.currentTime = safeTime;
            }
        }
        // Position state will be updated by the 'seeked' event or continuous update
      } catch (error) {
        console.error('Failed to execute seek to action:', error);
      }
    },

    seekbackward: (details) => {
      try {
        const skipTime = details?.seekOffset || 10; // Default skip 10s
         if (musicPlayer.playback?.skip) {
            musicPlayer.playback.skip(-skipTime); // Use app's skip if available
         } else if (appState.audio) {
          const newTime = Math.max(appState.audio.currentTime - skipTime, 0);
          appState.audio.currentTime = newTime;
         }
        // Position state will be updated
      } catch (error) {
        console.error('Failed to execute seek backward action:', error);
      }
    },

    seekforward: (details) => {
      try {
        const skipTime = details?.seekOffset || 10; // Default skip 10s
        if (musicPlayer.playback?.skip) {
            musicPlayer.playback.skip(skipTime); // Use app's skip if available
        } else if (appState.audio) {
          const duration = appState.duration || appState.audio.duration || Infinity;
          const newTime = Math.min(appState.audio.currentTime + skipTime, duration);
          appState.audio.currentTime = newTime;
        }
        // Position state will be updated
      } catch (error) {
        console.error('Failed to execute seek forward action:', error);
      }
    }
  },

  events: {
     // Store listeners to allow proper removal
    _listeners: {},

    bind: () => {
      if (!appState.audio) return;

      notificationPlayer.events.unbind(); // Ensure previous listeners are removed

      const handlers = notificationPlayer.events.handlers;
      const options = { passive: true }; // Use passive listeners where appropriate

      notificationPlayer.events._listeners = {
          loadstart: handlers.onLoadStart,
          loadedmetadata: handlers.onLoadedMetadata,
          // loadeddata: handlers.onLoadedData, // Often redundant with loadedmetadata
          canplay: handlers.onCanPlay,
          play: handlers.onPlay,
          pause: handlers.onPause,
          ended: handlers.onEnded,
          timeupdate: handlers.onTimeUpdate, // Keep this for fallback if continuous update fails
          durationchange: handlers.onDurationChange,
          ratechange: handlers.onRateChange,
          seeked: handlers.onSeeked, // Important for seekto actions
          error: handlers.onError
      };

       Object.entries(notificationPlayer.events._listeners).forEach(([event, handler]) => {
           appState.audio.addEventListener(event, handler, options);
       });
    },

    unbind: () => {
       if (!appState.audio || !notificationPlayer.events._listeners) return;

        Object.entries(notificationPlayer.events._listeners).forEach(([event, handler]) => {
           appState.audio.removeEventListener(event, handler);
       });
       notificationPlayer.events._listeners = {}; // Clear stored listeners
    },

    handlers: {
      onLoadStart: () => {
        // notificationPlayer.playbackState.update('none'); // May cause flicker, handled by play/pause
      },
      onLoadedMetadata: () => {
        notificationPlayer.positionState.update(); // Update duration
      },
      // onLoadedData: () => { /* Often redundant */ },
      onCanPlay: () => {
        notificationPlayer.positionState.update(); // Update initial position/duration if needed
      },
      onPlay: () => {
        notificationPlayer.playbackState.onPlay(); // Correctly updates state and starts continuous pos update
      },
      onPause: () => {
        notificationPlayer.playbackState.onPause(); // Correctly updates state and stops continuous pos update
      },
      onEnded: () => {
        notificationPlayer.playbackState.onEnded(); // Updates state, stops continuous pos update
      },
      onTimeUpdate: () => {
        // Only update if continuous update isn't running or hasn't updated recently
         const now = Date.now();
        if (!notificationPlayer.state.positionUpdateInterval && (now - notificationPlayer.state.lastPositionUpdate > 800)) {
           notificationPlayer.positionState.update();
         }
      },
      onDurationChange: () => {
        notificationPlayer.positionState.update(); // Duration changed
      },
      onRateChange: () => {
        notificationPlayer.positionState.update(); // Playback rate affects position state
      },
      onSeeked: () => {
        notificationPlayer.positionState.update(); // Position changed due to seek
      },
      onError: (e) => {
        console.error('Audio Element Error:', e);
        notificationPlayer.playbackState.update('paused'); // Treat errors as paused
        notificationPlayer.positionState.stopContinuousUpdate();
      }
    }
  },
  setup: () => {
    if (!('mediaSession' in navigator)) {
      console.warn('Media Session API not supported.');
      return false;
    }

    if (notificationPlayer.state.isInitialized) {
      // console.warn('NotificationPlayer already initialized.'); // Can be noisy
      return true;
    }

    try {
      // Clear any previous metadata just in case
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';

      const actionHandlersMap = {
        play: notificationPlayer.actions.play,
        pause: notificationPlayer.actions.pause,
        stop: notificationPlayer.actions.stop,
        previoustrack: notificationPlayer.actions.previoustrack,
        nexttrack: notificationPlayer.actions.nexttrack,
        seekto: notificationPlayer.actions.seekto,
        seekbackward: notificationPlayer.actions.seekbackward,
        seekforward: notificationPlayer.actions.seekforward,
      };

      // Clear existing handlers before setting new ones
      Object.keys(actionHandlersMap).forEach(action => {
          try { navigator.mediaSession.setActionHandler(action, null); } catch {}
      });
      notificationPlayer.state.supportedActions.clear(); // Reset supported actions


      Object.entries(actionHandlersMap).forEach(([action, handler]) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
          notificationPlayer.state.supportedActions.add(action); // Track supported actions
          // console.log(`Media session action "${action}" handler set.`);
        } catch (error) {
          console.warn(`Media session action "${action}" not supported or handler failed:`, error);
        }
      });

      if (appState.audio) {
        notificationPlayer.events.bind(); // Bind audio events
      }

      // Set initial state based on audio element, if available
       const initialState = appState.audio?.paused === false ? 'playing' : 'paused';
       notificationPlayer.playbackState.update(appState.audio ? initialState : 'none');


      notificationPlayer.state.isInitialized = true;
      console.log('NotificationPlayer setup complete.');
      return true;

    } catch (error) {
      console.error('Failed to setup NotificationPlayer:', error);
      notificationPlayer.state.isInitialized = false; // Ensure state reflects failure
      return false;
    }
  },

  destroy: () => {
    try {
      notificationPlayer.positionState.stopContinuousUpdate();
      notificationPlayer.events.unbind(); // Unbind audio events

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        notificationPlayer.positionState.reset();

        // Clear all known action handlers
        Array.from(notificationPlayer.state.supportedActions).forEach(action => {
          try {
            navigator.mediaSession.setActionHandler(action, null);
          } catch (error) {
             // console.warn(`Failed to clear action handler "${action}":`, error); // Can be noisy
          }
        });

        navigator.mediaSession.playbackState = 'none'; // Reset playback state
      }

      // Reset internal state
      notificationPlayer.state.isInitialized = false;
      notificationPlayer.state.supportedActions.clear();
      notificationPlayer.state.currentMetadata = null;
      notificationPlayer.state.lastPositionUpdate = 0;
      console.log('NotificationPlayer destroyed.');

    } catch (error) {
      console.error('Error during NotificationPlayer cleanup:', error);
    }
  },

  utils: {
    isSupported: () => 'mediaSession' in navigator,
    isInitialized: () => notificationPlayer.state.isInitialized,
    getSupportedActions: () => Array.from(notificationPlayer.state.supportedActions),
    getCurrentMetadata: () => notificationPlayer.state.currentMetadata,
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
    forcePositionUpdate: () => notificationPlayer.positionState.update(),
    rebindEvents: () => notificationPlayer.events.bind(),
  }
};


const musicPlayer = {
    mainPlayer: {
        open: () => {
            const drawer = document.querySelector('.drawer');
            if (!drawer) return;

            try {
                if (!drawer.matches(':popover-open')) {
                    drawer.showPopover();
                    appState.isPopupVisible = true;
                    musicPlayer.mainPlayer.updateTabContent(appState.currentTab || 'playing');
                }
            } catch (e) { console.error("Error showing popover:", e); }
        },

        close: () => {
            const drawer = document.querySelector('.drawer');
             if (!drawer) return;

             try {
                if (drawer.matches(':popover-open')) {
                    drawer.hidePopover();
                    appState.isPopupVisible = false;
                    // Switch back to 'playing' tab slightly after closing animation might start
                    setTimeout(() => musicPlayer.mainPlayer.switchTab("playing"), 50);
                }
             } catch (e) { console.error("Error hiding popover:", e); }
        },

        toggle: () => {
            const drawer = document.querySelector('.drawer');
            if (!drawer) return;

            try {
                if (drawer.matches(':popover-open')) {
                    musicPlayer.mainPlayer.close();
                } else {
                    musicPlayer.mainPlayer.open();
                }
            } catch (e) { console.error("Error toggling popover:", e); }
        },

        switchTab: (tabName) => {
            appState.currentTab = tabName;

            document.querySelectorAll('.tabsContainer .tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === tabName);
            });

            document.querySelectorAll('#musicPlayer .body .content[data-tab]').forEach(content => {
                content.classList.toggle('active', content.dataset.tab === tabName);
            });

            musicPlayer.mainPlayer.updateTabContent(tabName);
        },

        updateTabContent: (tabName) => {
            if (tabName === 'recent') musicPlayer.mainPlayer.updateRecentTab();
            else if (tabName === 'queue') musicPlayer.mainPlayer.updateQueueTab();
        },

        updateQueueTab: () => {
            const queueList = document.getElementById('queueList');
            if (!queueList) return;

            const emptyState = queueList.querySelector('.empty');

            // Clear existing items except the empty state message
            const itemsToRemove = queueList.querySelectorAll('li:not(.empty)');
            itemsToRemove.forEach(item => item.remove());


            if (appState.queue.items.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            appState.queue.items.forEach((song, index) => {
                const listItemHTML = render.playerListItem({ song, index, type: 'queue', utils });
                const listItem = create(listItemHTML);
                if (!listItem) return; // Skip if creation failed

                const playBtn = listItem.querySelector('[data-action="play"]');
                if (playBtn) {
                    playBtn.addEventListener('click', e => {
                        e.stopPropagation();
                        appState.queue.playAt(index);
                    });
                }

                const removeBtn = listItem.querySelector('[data-action="remove"]');
                if (removeBtn) {
                    removeBtn.addEventListener('click', e => {
                        e.stopPropagation();
                        appState.queue.remove(index);
                        musicPlayer.mainPlayer.updateQueueTab(); // Re-render after removal
                        // ui.updateCounts(); // updateCounts is called within remove
                    });
                }

                listItem.addEventListener('click', () => appState.queue.playAt(index));
                queueList.appendChild(listItem);
            });
             ui.updateCounts(); // Update count after rendering all items
        },

        updateRecentTab: () => {
            const recentList = document.getElementById('recentList');
            if (!recentList) return;

            const emptyState = recentList.querySelector('.empty');

             // Clear existing items except the empty state message
            const itemsToRemove = recentList.querySelectorAll('li:not(.empty)');
            itemsToRemove.forEach(item => item.remove());

            if (!appState.recentlyPlayed || appState.recentlyPlayed.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';


            appState.recentlyPlayed.slice(0, 20).forEach((song, index) => {
                const listItemHTML = render.playerListItem({ song, index, type: 'recent', utils });
                 const listItem = create(listItemHTML);
                 if (!listItem) return; // Skip if creation failed

                const playBtn = listItem.querySelector('[data-action="play"]');
                if (playBtn) {
                    playBtn.addEventListener('click', e => {
                        e.stopPropagation();
                        musicPlayer.ui.playSong(song);
                    });
                }

                const queueBtn = listItem.querySelector('[data-action="queue"]');
                if (queueBtn) {
                    queueBtn.addEventListener('click', e => {
                        e.stopPropagation();
                        appState.queue.add(song);
                        // notifications.show is called within queue.add
                    });
                }

                listItem.addEventListener('click', () => musicPlayer.ui.playSong(song));
                recentList.appendChild(listItem);
            });
             ui.updateCounts(); // Update count after rendering
        },

        preventHorizontalScroll: () => {
            // This might interfere with native scroll; consider carefully if needed
             const musicPlayerElement = document.getElementById('musicPlayer');
             if (!musicPlayerElement) return;

            // Simple check - does this improve UX or cause issues?
             musicPlayerElement.addEventListener('wheel', (e) => {
                 if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                     e.preventDefault();
                 }
             }, { passive: false });
        },

        initDrawerDrag: () => {
           // Basic drag-to-close logic (consider refining threshold/velocity)
            const drawerScroller = document.querySelector('.drawerScroller');
            const drawer = document.querySelector('.drawer');

            if (!drawerScroller || !drawer) return;

            let isDragging = false;
            let startY = 0;
            let currentY = 0;
            let startScrollTop = 0;

            const handlePointerDown = (e) => {
                 // Only initiate drag if at the top and pulling down
                if (drawerScroller.scrollTop > 5) return; // Allow scrolling up first

                isDragging = true;
                startY = e.clientY;
                currentY = startY;
                startScrollTop = drawerScroller.scrollTop; // Store initial scroll position

                // Use pointer capture for better event handling
                 if (drawerScroller.setPointerCapture) {
                    try { drawerScroller.setPointerCapture(e.pointerId); } catch {}
                 }
                 drawerScroller.style.overscrollBehavior = 'contain'; // Prevent page scroll during drag
                 drawerScroller.style.userSelect = 'none'; // Prevent text selection
            };

             const handlePointerMove = (e) => {
                if (!isDragging) return;

                currentY = e.clientY;
                const deltaY = currentY - startY;

                // Only prevent scroll and apply transform if dragging downwards from the top
                if (deltaY > 0 && startScrollTop <= 5) {
                   // e.preventDefault(); // Might not be needed with overscrollBehavior
                   // Apply visual feedback (optional)
                    drawer.style.transform = `translateY(${Math.max(0, deltaY)}px)`;
                    drawer.style.transition = 'none'; // Disable transition during drag
                } else if (deltaY < 0 && startScrollTop <=5) {
                    // Allow scrolling up immediately if pulling up from the top
                    isDragging = false; // Stop drag gesture
                     if (drawerScroller.releasePointerCapture && e.pointerId) {
                         try { drawerScroller.releasePointerCapture(e.pointerId); } catch {}
                     }
                     drawer.style.transform = 'translateY(0px)';
                     drawerScroller.style.overscrollBehavior = '';
                     drawerScroller.style.userSelect = '';

                }
            };

            const handlePointerUp = (e) => {
                if (!isDragging) return;

                isDragging = false;
                 if (drawerScroller.releasePointerCapture && e.pointerId) {
                     try { drawerScroller.releasePointerCapture(e.pointerId); } catch {}
                 }
                 drawerScroller.style.overscrollBehavior = '';
                 drawerScroller.style.userSelect = '';


                const deltaY = currentY - startY;
                const threshold = 80; // Pixels to drag down to close

                drawer.style.transition = 'transform 0.2s ease-out'; // Add transition back

                if (deltaY > threshold && startScrollTop <= 5) { // Only close if dragged down from top
                    musicPlayer.mainPlayer.close();
                     drawer.style.transform = ''; // Reset transform after close starts
                } else {
                    // Snap back if not closed
                    drawer.style.transform = 'translateY(0px)';
                }
            };

             // Use pointer events for unified touch/mouse handling
            drawerScroller.addEventListener('pointerdown', handlePointerDown);
            drawerScroller.addEventListener('pointermove', handlePointerMove);
            drawerScroller.addEventListener('pointerup', handlePointerUp);
            drawerScroller.addEventListener('pointercancel', handlePointerUp); // Handle cancel event

        },

        init: () => {
            const closeBtn = document.getElementById('closeBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => musicPlayer.mainPlayer.close());
            }

            document.querySelectorAll('.tabsContainer .tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.dataset.tab;
                    if (tabName) musicPlayer.mainPlayer.switchTab(tabName);
                });
            });

            const queueBtn = document.getElementById('queueBtn');
            if (queueBtn) {
                queueBtn.addEventListener('click', () => musicPlayer.mainPlayer.switchTab('queue'));
            }

            // musicPlayer.mainPlayer.preventHorizontalScroll(); // Re-evaluate if needed
            musicPlayer.mainPlayer.initDrawerDrag();
        }
    },

    playback: {
        _dispatchPlayerStateChange: () => { // Make private helper
            const detail = {
                song: appState.currentSong,
                artist: appState.currentArtist,
                album: appState.currentAlbum,
                isPlaying: appState.isPlaying,
                duration: appState.duration,
                currentTime: appState.audio?.currentTime ?? 0,
                totalTime: appState.audio?.duration ?? 0,
                repeatMode: appState.repeatMode,
                shuffleMode: appState.shuffleMode,
            };
            window.dispatchEvent(new CustomEvent('playerstatechange', { detail }));
        },
        play: () => {
            if (!appState.currentSong || !appState.audio) return;
            appState.audio.play().then(() => {
                // Play started successfully
                 // ui.updatePlayPauseButtons(); // Handled by 'play' event
                 // notificationPlayer.playbackState.onPlay(); // Handled by 'play' event
                 // musicPlayer.playback._dispatchPlayerStateChange(); // Dispatched by event handler
            }).catch((err) => {
                console.error("Audio play failed:", err);
                // Handle potential errors (e.g., user interaction needed)
                 notifications.show("Playback failed. Please interact with the page.", NOTIFICATION_TYPES.ERROR);
                 appState.isPlaying = false; // Ensure state is correct
                 ui.updatePlayPauseButtons();
                 notificationPlayer.playbackState.onPause(); // Update media session
                 musicPlayer.playback._dispatchPlayerStateChange();
            });
        },

        pause: () => {
            if (!appState.audio || appState.audio.paused) return; // Don't pause if already paused
            appState.audio.pause();
             // ui.updatePlayPauseButtons(); // Handled by 'pause' event
             // notificationPlayer.playbackState.onPause(); // Handled by 'pause' event
             // musicPlayer.playback._dispatchPlayerStateChange(); // Dispatched by event handler
        },

        next: () => {
            const nextSong = appState.queue.getNext();
            if (nextSong) {
                musicPlayer.ui.playSong(nextSong);
                return;
            }
             // Handle repeat/shuffle logic within getNextInAlbum
            const nextInAlbum = musicPlayer.ui.getNextInAlbum();
            if (nextInAlbum) {
                musicPlayer.ui.playSong(nextInAlbum);
            } else if (appState.repeatMode === REPEAT_MODES.OFF) {
                 // Optionally stop playback or do nothing if at the end and no repeat/queue
                 musicPlayer.playback.pause(); // Example: Pause at the end
                 // musicPlayer.ui.resetPlayerUI(); // Optionally reset UI
            }
            // If repeatMode is ALL, getNextInAlbum should handle wrapping around
        },

        previous: () => {
            if (appState.audio && appState.audio.currentTime > 3) {
                musicPlayer.playback.seekTo(0); // Restart current song
                return;
            }
            // Try getting the previous song from recently played (more reliable history)
             if (appState.recentlyPlayed.length > 1) { // Need at least 2 for previous
                // Remove current song from top, play the next one
                appState.recentlyPlayed.shift(); // Remove current
                const prevSong = appState.recentlyPlayed.shift(); // Get the actual previous
                 if (prevSong) {
                    musicPlayer.ui.playSong(prevSong, true); // Play without adding back to recent yet
                    // Add current song back to the start of recent if needed after prev plays
                     if(appState.currentSong) {
                        appState.recentlyPlayed.unshift(appState.currentSong);
                     }
                     return;
                 }
             }

            // Fallback: get previous in the current album context (less reliable history)
            const prevInAlbum = musicPlayer.ui.getPreviousInAlbum();
            if (prevInAlbum) {
                musicPlayer.ui.playSong(prevInAlbum);
            }
        },

        seekTo: (time) => {
            if (!appState.audio || !isFinite(time) || time < 0) return;
            const duration = appState.duration || appState.audio?.duration || Infinity;
            const safeTime = Math.max(0, Math.min(duration, time));
            appState.audio.currentTime = safeTime;
            // UI update will happen via 'timeupdate' or 'seeked' event
            // musicPlayer.ui.updateProgress(); // No need to call manually
            // notificationPlayer.positionState.update(); // Let event handler manage this
        },

        skip: (seconds) => {
            if (!appState.audio) return;
            const newTime = appState.audio.currentTime + seconds;
            musicPlayer.playback.seekTo(newTime);
        },

        shuffle: {
            toggle: () => {
                appState.shuffleMode = !appState.shuffleMode;
                ui.updateShuffleButton();
                notifications.show(`Shuffle ${appState.shuffleMode ? "enabled" : "disabled"}`);
                 musicPlayer.playback._dispatchPlayerStateChange();
            },

            all: () => {
                 const musicLib = window.MyTunesApp?.music;
                if (!musicLib || musicLib.length === 0) {
                    notifications.show("No music library found", NOTIFICATION_TYPES.WARNING);
                    return;
                }
                const allSongs = [];
                 musicLib.forEach((artist) => {
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
                    notifications.show("No songs found", NOTIFICATION_TYPES.WARNING);
                    return;
                }
                // Fisher-Yates shuffle
                for (let i = allSongs.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
                }
                appState.queue.clear();
                // Add all but the first song to the queue
                 allSongs.slice(1).forEach((song) => {
                     // Use queue.add without notification for bulk add
                     appState.queue.items.push(song);
                 });
                 storage.save(STORAGE_KEYS.QUEUE, appState.queue.items); // Save once
                 ui.updateCounts(); // Update counts once


                musicPlayer.ui.playSong(allSongs[0]); // Play the first song
                appState.shuffleMode = true; // Enable shuffle mode
                ui.updateShuffleButton();
                notifications.show("Playing all songs shuffled");
                 musicPlayer.playback._dispatchPlayerStateChange();
            },
        },

        repeat: {
            toggle: () => {
                 const modes = [REPEAT_MODES.OFF, REPEAT_MODES.ALL, REPEAT_MODES.ONE];
                 const currentIndex = modes.indexOf(appState.repeatMode);
                 appState.repeatMode = modes[(currentIndex + 1) % modes.length]; // Cycle through modes

                ui.updateRepeatButton();
                const modeText = appState.repeatMode === REPEAT_MODES.OFF ? "disabled" :
                                appState.repeatMode === REPEAT_MODES.ALL ? "all songs" : "current song";
                notifications.show(`Repeat ${modeText}`);
                 musicPlayer.playback._dispatchPlayerStateChange();
            },
        },
    },

    ui: {
        isScrubbing: false,
        wasPlayingBeforeScrub: false,
        // rafId: null, // Not used currently

        initialize: () => {
            if (appState.audio) return; // Already initialized

            appState.audio = new Audio();
            const events = {
                timeupdate: musicPlayer.ui.updateProgress,
                ended: musicPlayer.ui.onEnded,
                loadedmetadata: musicPlayer.ui.onMetadataLoaded,
                play: musicPlayer.ui.onPlay,
                pause: musicPlayer.ui.onPause,
                error: musicPlayer.ui.onError,
                 // Add events handled by notificationPlayer as well
                 seeked: notificationPlayer.events.handlers.onSeeked, // Ensure seek updates position state
                 durationchange: notificationPlayer.events.handlers.onDurationChange,
                 ratechange: notificationPlayer.events.handlers.onRateChange,
                 loadstart: notificationPlayer.events.handlers.onLoadStart,
                 canplay: notificationPlayer.events.handlers.onCanPlay,

            };

            Object.entries(events).forEach(([event, handler]) =>
                appState.audio.addEventListener(event, handler)
            );

            musicPlayer.ui.bindSeekBar();
             // notificationPlayer setup is now handled in app.initialize
            // notificationPlayer.setup(); // Don't call here
        },

         playSong: async (songData, isPlayingPrevious = false) => { // Add flag
          if (!songData) return;
            musicPlayer.ui.initialize(); // Ensure audio element exists
                ui.setLoadingState(true);

           // Add to recently played *only* if it's a new song, not from 'previous' action
           if (appState.currentSong && !isPlayingPrevious && appState.currentSong.id !== songData.id) {
               musicPlayer.ui.addToRecentlyPlayed(appState.currentSong);
           }


            appState.currentSong = songData;
            appState.currentArtist = songData.artist;
            appState.currentAlbum = songData.album;

            // Update UI immediately
            ui.updateNowPlaying();
            ui.updateNavbar();
            ui.updateMusicPlayer(); // Includes favorite button update
            ui.updateCounts();

            const success = await musicPlayer.ui.loadAudioFile(songData);
            if (success) {
                // Metadata and events are handled by the audio element events now
                 // notificationPlayer.metadata.update(songData); // Handled by loadedmetadata
                 // notificationPlayer.events.bind(); // Bound once in initialize
                setTimeout(() => {
                    eventHandlers.bindControlEvents?.(); // Rebind if needed
                    musicPlayer.ui.bindSeekBar(); // Ensure seek bar is bound
                }, 100);
               // State change dispatched by event handlers
            } else {
                appState.isPlaying = false; // Ensure correct state on failure
                ui.updatePlayPauseButtons();
                notificationPlayer.playbackState.onPause();
                 musicPlayer.playback._dispatchPlayerStateChange();
                 notifications.show(`Failed to load "${songData.title}"`, NOTIFICATION_TYPES.ERROR);
            }
            ui.setLoadingState(false);
          },

        loadAudioFile: async (songData) => {
             if (!appState.audio) {
                 console.error("Audio element not initialized.");
                 return false;
             }
            if (!songData || !songData.title) {
                console.error('No song data or title provided:', songData);
                return false;
            }

            const songFileName = songData.title
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/[^\w]/g, "");

            if (!songFileName) {
                console.error('Song filename is empty after cleaning:', songData.title);
                return false;
            }

            // Attempt to load supported formats
            for (const format of AUDIO_FORMATS) {
                const audioUrl = `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-mobile-layout-issues/global/content/audio/${songFileName}.${format}`;

                try {
                    // Check if the browser likely supports the format before setting src
                    const canPlayType = appState.audio.canPlayType(`audio/${format === 'm4a' ? 'mp4' : format}`);
                    if (!canPlayType || canPlayType === '') {
                        console.warn(`Browser may not support ${format}, skipping.`);
                        continue; // Try next format
                    }

                    appState.audio.src = audioUrl;
                    appState.audio.load(); // Explicitly call load

                     // Use a promise that resolves on 'canplay' or rejects on 'error'
                     await new Promise((resolve, reject) => {
                         const canPlayHandler = () => {
                             cleanup();
                             resolve();
                         };
                         const errorHandler = (e) => {
                             cleanup();
                             console.warn(`Error loading ${format} format from ${audioUrl}:`, e.target.error);
                             reject(e.target.error || new Error(`Failed to load ${format}`));
                         };
                         const cleanup = () => {
                             appState.audio.removeEventListener('canplay', canPlayHandler);
                             appState.audio.removeEventListener('error', errorHandler);
                             appState.audio.removeEventListener('abort', errorHandler); // Handle abort too
                         };

                         appState.audio.addEventListener('canplay', canPlayHandler, { once: true });
                         appState.audio.addEventListener('error', errorHandler, { once: true });
                         appState.audio.addEventListener('abort', errorHandler, { once: true });

                         // Timeout for loading issues
                         const loadTimeout = setTimeout(() => {
                            if (appState.audio.readyState < 2) { // HAVE_CURRENT_DATA
                                cleanup();
                                reject(new Error(`Timeout loading ${format}`));
                            }
                         }, 15000); // 15 seconds timeout

                         // If already playable (e.g., cached), resolve immediately
                          if (appState.audio.readyState >= 3) { // HAVE_FUTURE_DATA
                              clearTimeout(loadTimeout);
                              canPlayHandler();
                          }
                     });


                    // Attempt to play immediately after successful load check
                     await appState.audio.play();
                     console.log(`Successfully loaded and playing ${format}`);
                    return true; // Success!

                } catch (error) {
                    console.warn(`Failed to load or play ${format}:`, error);
                     appState.audio.src = ''; // Clear src on error to prevent lingering states
                    // Continue to the next format
                }
            }

            console.error("All audio format attempts failed for:", songData.title);
            return false; // All formats failed
        },

        bindSeekBar: () => {
            const bar = $byId(IDS.progressBar);
            const thumb = $byId(IDS.progressThumb); // Used for UI update only
            if (!bar || !thumb) return;

             // Remove previous listeners to prevent duplicates
            bar.removeEventListener('pointerdown', musicPlayer.ui._handlePointerDown);
            bar.removeEventListener('pointerenter', musicPlayer.ui._handlePointerEnter);
            bar.removeEventListener('pointerleave', musicPlayer.ui._handlePointerLeave);
            bar.removeEventListener('keydown', musicPlayer.ui.handleProgressBarKeyDown);


            // Store bound functions to allow removal later
            musicPlayer.ui._handlePointerDown = musicPlayer.ui._handlePointerDown || ((e) => {
                 if (!appState.audio || !isFinite(appState.audio.duration)) return; // Don't allow seek if duration unknown
                e.preventDefault();
                if (bar.setPointerCapture) { try { bar.setPointerCapture(e.pointerId); } catch {} }
                musicPlayer.ui.isScrubbing = true;
                musicPlayer.ui.wasPlayingBeforeScrub = !appState.audio.paused;
                if (musicPlayer.ui.wasPlayingBeforeScrub) appState.audio.pause(); // Pause immediately
                musicPlayer.ui.seekFromEvent(e, bar, false); // Update UI immediately
                bar.classList.add('is-dragging');

                 // Add move/up listeners to the document for wider capture area
                 document.addEventListener('pointermove', musicPlayer.ui._handlePointerMove, { passive: false });
                 document.addEventListener('pointerup', musicPlayer.ui._handlePointerUp, { once: true });
                 document.addEventListener('pointercancel', musicPlayer.ui._handlePointerUp, { once: true }); // Handle cancel too
            });

             musicPlayer.ui._handlePointerMove = musicPlayer.ui._handlePointerMove || ((e) => {
                 if (!musicPlayer.ui.isScrubbing) return;
                 e.preventDefault();
                 musicPlayer.ui.seekFromEvent(e, bar, false); // Only update UI during move
             });

            musicPlayer.ui._handlePointerUp = musicPlayer.ui._handlePointerUp || ((e) => {
                if (!musicPlayer.ui.isScrubbing) return; // Prevent multiple calls

                 // Remove document listeners
                 document.removeEventListener('pointermove', musicPlayer.ui._handlePointerMove);
                 document.removeEventListener('pointerup', musicPlayer.ui._handlePointerUp);
                 document.removeEventListener('pointercancel', musicPlayer.ui._handlePointerUp);


                 if (bar.releasePointerCapture && e.pointerId) { try { bar.releasePointerCapture(e.pointerId); } catch {} }

                // Final seek action
                musicPlayer.ui.seekFromEvent(e, bar, true);
                musicPlayer.ui.isScrubbing = false;
                bar.classList.remove('is-dragging', 'is-hovering');

                 // Resume playback *after* seek completes (use 'seeked' event ideally, or slight delay)
                 // A short delay is simpler here
                setTimeout(() => {
                    if (musicPlayer.ui.wasPlayingBeforeScrub && appState.audio && appState.audio.paused) {
                        appState.audio.play().catch(err => console.error("Resume after scrub failed:", err));
                    }
                }, 50); // Small delay to allow seek to process
            });


             musicPlayer.ui._handlePointerEnter = musicPlayer.ui._handlePointerEnter || (() => bar.classList.add('is-hovering'));
             musicPlayer.ui._handlePointerLeave = musicPlayer.ui._handlePointerLeave || (() => {
                 if (!musicPlayer.ui.isScrubbing) bar.classList.remove('is-hovering');
             });

            // Add new listeners
            bar.addEventListener('pointerdown', musicPlayer.ui._handlePointerDown, { passive: false });
            bar.addEventListener('pointerenter', musicPlayer.ui._handlePointerEnter);
            bar.addEventListener('pointerleave', musicPlayer.ui._handlePointerLeave);
            bar.addEventListener('keydown', musicPlayer.ui.handleProgressBarKeyDown);
        },


        seekFromEvent: (e, bar, finalize = false) => {
             const duration = appState.duration || appState.audio?.duration || 0;
             if (duration === 0 || !isFinite(duration)) return; // Cannot seek without duration

            const rect = bar.getBoundingClientRect();
             // Use clientX for pointer events
            const x = e.clientX !== undefined ? e.clientX : 0;
             let pct = ((x - rect.left) / rect.width);
             pct = Math.max(0, Math.min(1, pct)); // Clamp between 0 and 1

            const time = duration * pct;

            // Always update UI during scrubbing
             if (!finalize || musicPlayer.ui.isScrubbing) {
                musicPlayer.ui.setProgressUI(pct * 100, time);
             }

             // Only set audio currentTime when finalizing the seek (on pointerup)
            if (finalize && appState.audio) {
                appState.audio.currentTime = time;
                 // notificationPlayer update will happen via 'seeked' event
            }
        },

        setProgressUI: (percent, currentTime) => {
            const fill = $byId(IDS.progressFill);
            const thumb = $byId(IDS.progressThumb);
            const currentTimeElement = $byId(IDS.currentTime);
            if (fill) fill.style.width = percent + '%';
            if (thumb) thumb.style.left = percent + '%';
            if (currentTimeElement && isFinite(currentTime)) {
                currentTimeElement.textContent = utils.formatTime(currentTime);
            }
        },

        handleProgressBarKeyDown: (e) => {
            const audio = appState.audio;
            if (!audio || !isFinite(audio.duration) || audio.duration <= 0) return;

            const duration = audio.duration;
            let timeChange = 0;
            let newTime = audio.currentTime;

            switch (e.key) {
                case 'ArrowRight': timeChange = 5; break;
                case 'ArrowLeft': timeChange = -5; break;
                case 'PageUp': timeChange = 10; break;
                case 'PageDown': timeChange = -10; break;
                case 'Home': newTime = 0; break;
                case 'End': newTime = duration; break;
                default: return; // Do nothing for other keys
            }

             e.preventDefault(); // Prevent default browser action for handled keys

            if (timeChange !== 0) {
                newTime = audio.currentTime + timeChange;
            }

            newTime = Math.max(0, Math.min(duration, newTime)); // Clamp time

             if (newTime !== audio.currentTime) {
                audio.currentTime = newTime;
                // UI update will happen via 'timeupdate'/'seeked'
             }
        },

        updateProgress: () => {
             // Avoid UI updates while user is actively scrubbing
            if (!appState.audio || musicPlayer.ui.isScrubbing || !isFinite(appState.audio.duration)) return;

            const duration = appState.duration || appState.audio.duration || 0;
            const currentTime = appState.audio.currentTime || 0;
             // Ensure percent calculation is safe
            const percent = (duration > 0 && isFinite(duration)) ? (currentTime / duration) * 100 : 0;

            musicPlayer.ui.setProgressUI(percent, currentTime);
            musicPlayer.ui.updateBufferDisplay();
             // State change dispatch is handled by play/pause/ended events primarily
             // musicPlayer.playback._dispatchPlayerStateChange(); // Maybe too frequent here
        },


        updateBufferDisplay: () => {
            const buffer = $byId(IDS.progressBuffer);
            if (!buffer || !appState.audio || !appState.audio.buffered) return;

            const duration = appState.audio.duration || 0;
            if (duration === 0 || !isFinite(duration) || appState.audio.buffered.length === 0) {
                buffer.style.width = '0%';
                return;
            }

             try {
                // Find the buffered end time relevant to the current playback time
                const currentTime = appState.audio.currentTime;
                let bufferedEnd = 0;
                for (let i = 0; i < appState.audio.buffered.length; i++) {
                     if (appState.audio.buffered.start(i) <= currentTime && appState.audio.buffered.end(i) >= currentTime) {
                         bufferedEnd = appState.audio.buffered.end(i);
                         break; // Found the relevant range
                     }
                 }
                 // If not found, use the end of the last range (less accurate but better than nothing)
                 if (bufferedEnd === 0 && appState.audio.buffered.length > 0) {
                     bufferedEnd = appState.audio.buffered.end(appState.audio.buffered.length - 1);
                 }


                const bufferProgress = Math.min(1, bufferedEnd / duration);
                buffer.style.width = (bufferProgress * 100).toFixed(2) + '%';
             } catch (e) {
                 console.warn("Error updating buffer display:", e);
                 buffer.style.width = '0%'; // Reset on error
             }
        },

        onPlay: () => {
            appState.isPlaying = true;
            ui.updatePlayPauseButtons();
             // notificationPlayer state update is handled by its own event handler
             musicPlayer.playback._dispatchPlayerStateChange();
        },

        onPause: () => {
            // Only update if not scrubbing (pause during scrub is temporary)
             if (!musicPlayer.ui.isScrubbing) {
                appState.isPlaying = false;
                ui.updatePlayPauseButtons();
                // notificationPlayer state update handled by its own handler
                 musicPlayer.playback._dispatchPlayerStateChange();
             }
        },

        onMetadataLoaded: () => {
            if (!appState.audio || !isFinite(appState.audio.duration)) return;

            appState.duration = appState.audio.duration;
            const totalTimeElement = $byId(IDS.totalTime);
            if (totalTimeElement) {
                totalTimeElement.textContent = utils.formatTime(appState.duration);
            }

            musicPlayer.ui.updateProgress(); // Update progress with new duration
            musicPlayer.ui.updateBufferDisplay();
             // Update Media Session metadata (now handled by notificationPlayer's handler)
        },

        onError: (e) => {
            console.error("Audio Element Error:", e.target.error);
             notifications.show(`Error playing audio: ${e.target.error?.message || 'Unknown error'}`, NOTIFICATION_TYPES.ERROR);
             // Ensure state reflects error
             appState.isPlaying = false;
             ui.updatePlayPauseButtons();
             // notificationPlayer state update handled by its own handler
             musicPlayer.playback._dispatchPlayerStateChange();

        },

        onEnded: () => {
             // Handle repeat mode ONE
            if (appState.repeatMode === REPEAT_MODES.ONE) {
                musicPlayer.playback.seekTo(0);
                musicPlayer.playback.play();
                return;
            }
             // Ensure state reflects ended (paused)
             appState.isPlaying = false;
             ui.updatePlayPauseButtons();
             // notificationPlayer state update handled by its own handler
             musicPlayer.playback._dispatchPlayerStateChange();

             // Move to next track (handles repeat ALL and queue)
            musicPlayer.playback.next();
        },

        addToRecentlyPlayed: (song) => {
             if (!song) return;
             // Prevent duplicates at the very start
             if (appState.recentlyPlayed.length > 0 && appState.recentlyPlayed[0].id === song.id) {
                 return;
             }

            appState.recentlyPlayed.unshift(song);
            // Limit the size of recently played list
            if (appState.recentlyPlayed.length > 50) {
                appState.recentlyPlayed.length = 50; // More efficient than slice
            }
            // Save only a portion to localStorage for performance
            storage.save(STORAGE_KEYS.RECENTLY_PLAYED, appState.recentlyPlayed.slice(0, 20));
             ui.updateCounts(); // Update count display
        },


        getNextInAlbum: () => {
            if (!appState.currentSong || !window.MyTunesApp?.music) return null;

             const musicLib = window.MyTunesApp.music;
            const artist = musicLib.find((a) => a.artist === appState.currentArtist);
            const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
            if (!album?.songs || album.songs.length === 0) return null;

            const currentIndex = album.songs.findIndex((s) => s.id === appState.currentSong.id);
             if (currentIndex === -1) return null; // Current song not found in album

             let nextIndex;

            if (appState.shuffleMode) {
                 if (album.songs.length <= 1) {
                     nextIndex = 0; // Only one song, just repeat or stop based on repeatMode
                 } else {
                    // Simple shuffle: pick random index *different* from current
                    do {
                         nextIndex = Math.floor(Math.random() * album.songs.length);
                    } while (nextIndex === currentIndex);
                 }
            } else {
                 nextIndex = (currentIndex + 1); // Get next index
            }

             // Handle end of album / repeat logic
             if (nextIndex >= album.songs.length) { // Reached end
                 if (appState.repeatMode === REPEAT_MODES.ALL) {
                     nextIndex = 0; // Wrap around if repeating all
                 } else {
                     return null; // Stop if not repeating
                 }
             }

             // Only return a song if the index is valid and different (unless shuffling a single song album)
            if (nextIndex !== currentIndex || album.songs.length === 1) {
                 const nextSong = album.songs[nextIndex];
                 return {
                    ...nextSong,
                    artist: artist.artist,
                    album: album.album,
                    cover: utils.getAlbumImageUrl(album.album)
                };
            }

            return null; // Should not happen in normal flow unless repeat is off and at end
        },


        getPreviousInAlbum: () => {
             // This is less reliable for true history, use recentlyPlayed first
            if (!appState.currentSong || !window.MyTunesApp?.music) return null;

             const musicLib = window.MyTunesApp.music;
            const artist = musicLib.find((a) => a.artist === appState.currentArtist);
            const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
            if (!album?.songs || album.songs.length === 0) return null;

            const currentIndex = album.songs.findIndex((s) => s.id === appState.currentSong.id);
             if (currentIndex === -1) return null;

            // Simple previous: wrap around
            const prevIndex = (currentIndex - 1 + album.songs.length) % album.songs.length;
            const prevSong = album.songs[prevIndex];

             return {
                 ...prevSong,
                 artist: artist.artist,
                 album: album.album,
                 cover: utils.getAlbumImageUrl(album.album)
             };
        },
    },
};

const app = {
   cardRegistry: new Map(),
  initialize: function() {
    if (appState.isInitialized) {
        console.warn('App already initialized. Skipping.');
        return; // Prevent multiple initializations
    }
    console.log('App initializing...');

    // Load data first
    storage.initialize();

    // Initialize UI components and state handlers
    notifications.initialize();
    musicPlayer.ui.initialize(); // Creates Audio element
    homePage.initialize(); // <<< Initialize home page manager EARLIER
    navigation.initialize(); // <<< NOW AFTER homePage: Sets up router, handles initial route

    // Bind base event handlers
    eventHandlers.init(); // Binds static UI elements

    // Set initial UI state
    app.resetUI(); // Includes ui.updateCounts()

    // Expose APIs (handled within MyTunesApp setup)
    // app.syncGlobalState(); // Now part of MyTunesApp setup

    // Initialize deep linking AFTER main router setup
    deepLinkRouter.initialize(); // Checks current URL
    deepLinkRouter.bindPopState(); // Listens for back/forward

    // Setup Media Session API
     if (notificationPlayer.utils.isSupported()) {
         setTimeout(() => notificationPlayer.setup(), 100); // Delay slightly
     }

    appState.isInitialized = true; // Mark as initialized
    console.log('App initialization complete.');
  },

  resetUI: function() {
    const nowPlayingArea = document.querySelector(NAVBAR.nowPlaying);
    if (nowPlayingArea) {
      nowPlayingArea.classList.remove(CLASSES.hasSong);
    }
    ui.updateCounts(); // Ensure counts are updated on reset
  },

  syncGlobalState: function() {
    // This is handled by the window.MyTunesApp definition now
  },

  goHome: function() {
    if (appState.router) {
      appState.router.navigateTo(ROUTES.HOME);
    }
  },

  async loadArtistInfo(artistData) {
        if (!this.cardRegistry) this.cardRegistry = new Map();

        const card = this.cardRegistry.get('artist-info');
        if (!card || !card.contentElement) return;

        card.contentElement.innerHTML = ''; // Clear previous content safely

        const display = document.createElement('div');
        display.className = 'artist-info-display';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'artist-avatar-large';
        const img = document.createElement('img');
        utils.loadImageWithFallback(img, utils.getArtistImageUrl(artistData.artist), utils.getDefaultArtistImage(), "artist");
        img.alt = artistData.artist;
        avatarDiv.appendChild(img);
        display.appendChild(avatarDiv);

        const meta = document.createElement('div');
        meta.className = 'artist-meta';
        const statRow = document.createElement('div');
        statRow.className = 'artist-stat-row';

        const stat1 = document.createElement('div');
        stat1.className = 'stat';
        const val1 = document.createElement('span');
        val1.className = 'stat-value';
        val1.textContent = artistData.albums?.length || 0;
        const lbl1 = document.createElement('span');
        lbl1.className = 'stat-label';
        lbl1.textContent = 'Albums';
        stat1.appendChild(val1);
        stat1.appendChild(lbl1);

        const stat2 = document.createElement('div');
        stat2.className = 'stat';
        const val2 = document.createElement('span');
        val2.className = 'stat-value';
        val2.textContent = utils.getTotalSongs(artistData);
        const lbl2 = document.createElement('span');
        lbl2.className = 'stat-label';
        lbl2.textContent = 'Songs';
        stat2.appendChild(val2);
        stat2.appendChild(lbl2);

        statRow.appendChild(stat1);
        statRow.appendChild(stat2);
        meta.appendChild(statRow);
        display.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'artist-actions-compact';

        const btnPlay = document.createElement('button');
        btnPlay.id = 'artistPlay';
        btnPlay.className = 'btn-primary';
        btnPlay.innerHTML = `
            <svg fill="currentColor" viewBox="0 0 20 20" style="width: 20px; height: 20px;">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
            </svg>
            Play All`;
        // btnPlay.addEventListener('click', () => navigation.actions.playArtistSongs(artistData)); // Add listener


        const btnFollow = document.createElement('button');
        btnFollow.id = 'artistFollow';
        btnFollow.className = 'btn-secondary';
        const isFav = appState.favorites.has("artists", artistData.artist);
         btnFollow.innerHTML = `
             <svg fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 20 20" style="width: 20px; height: 20px;">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
             </svg>
            ${isFav ? 'Favorited' : 'Favorite'}`; // Update text based on state
         btnFollow.classList.toggle("active", isFav);
         btnFollow.setAttribute("data-favorite-artists", artistData.artist); // Link to artist
        // btnFollow.addEventListener('click', () => { /* Favorite toggle logic */ }); // Add listener


        actions.appendChild(btnPlay);
        actions.appendChild(btnFollow);
        display.appendChild(actions);

        card.contentElement.appendChild(display);
    }
};

const playlists = {
    add: async (name) => { // Make async if create() is async
        if (!name || !name.trim()) {
            notifications.show("Please enter a playlist name", NOTIFICATION_TYPES.WARNING);
            return null;
        }

        const playlist = {
            id: Date.now().toString(),
            name: name.trim(),
            songs: [],
            created: new Date().toISOString(),
            description: "",
            cover: null, // Placeholder for potential future cover art
        };

        appState.playlists.push(playlist);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);

        // Re-render playlists section on homepage if visible
        const playlistsSection = $byId(IDS.playlistsSection);
        if (playlistsSection && typeof homePage?.renderPlaylists === 'function') {
           homePage.renderPlaylists();
        }


        notifications.show(`Created playlist "${utils.escapeHtml(playlist.name)}"`, NOTIFICATION_TYPES.SUCCESS);
        return playlist;
    },

    addSong: (playlistId, song) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) {
            notifications.show("Playlist not found", NOTIFICATION_TYPES.ERROR);
            return false;
        }

        // Use song ID for checking existence
        const exists = playlist.songs.some((s) => s.id === song.id);
        if (exists) {
            notifications.show("Song already in playlist", NOTIFICATION_TYPES.WARNING);
            return false;
        }

        // Store a copy or reference as needed. Storing full song objects.
        playlist.songs.push({...song}); // Store a copy to avoid mutation issues if song object changes elsewhere
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);

        notifications.show(`Added "${utils.escapeHtml(song.title)}" to "${utils.escapeHtml(playlist.name)}"`, NOTIFICATION_TYPES.SUCCESS);

        // Update view if the playlist is currently displayed
        const currentPlaylistView = document.querySelector(`.playlist-page[data-playlist-id="${playlistId}"]`);
         if (currentPlaylistView && typeof playlists.show === 'function') {
           playlists.show(playlistId); // Refresh the view
         }


        return true;
    },

    removeSong: (playlistId, songId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) return false;

        const initialLength = playlist.songs.length;
        playlist.songs = playlist.songs.filter((s) => s.id !== songId);

        if (playlist.songs.length < initialLength) {
            storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
            notifications.show("Song removed from playlist", NOTIFICATION_TYPES.INFO);

            // Update view if the playlist is currently displayed
             const currentPlaylistView = document.querySelector(`.playlist-page[data-playlist-id="${playlistId}"]`);
             if (currentPlaylistView && typeof playlists.show === 'function') {
               playlists.show(playlistId); // Refresh the view
             }
             // Also update homepage playlist section if visible
             const playlistsSection = $byId(IDS.playlistsSection);
             if (playlistsSection && typeof homePage?.renderPlaylists === 'function') {
                homePage.renderPlaylists();
             }

            return true;
        }

        return false;
    },

    play: (playlistId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist || playlist.songs.length === 0) {
            notifications.show("Playlist is empty", NOTIFICATION_TYPES.WARNING);
            return;
        }

        appState.queue.clear();
        // Add all songs except the first to the queue without individual notifications
         playlist.songs.slice(1).forEach((song) => appState.queue.items.push(song));
         storage.save(STORAGE_KEYS.QUEUE, appState.queue.items); // Save queue once
         ui.updateCounts(); // Update counts once


        musicPlayer.ui.playSong(playlist.songs[0]); // Play the first song

        notifications.show(`Playing playlist "${utils.escapeHtml(playlist.name)}"`, NOTIFICATION_TYPES.SUCCESS);
    },

    remove: async (playlistId) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) return false;

        const confirmed = await overlays.dialog.confirm(
            `Delete the playlist "${utils.escapeHtml(playlist.name)}"? This cannot be undone.`,
            {
                okText: "Delete",
                danger: true,
            }
        );

        if (!confirmed) return false;

        const playlistName = playlist.name; // Store name before filtering
        appState.playlists = appState.playlists.filter((p) => p.id !== playlistId);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
        notifications.show(`Deleted playlist "${utils.escapeHtml(playlistName)}"`, NOTIFICATION_TYPES.INFO);

        // Update homepage playlist section if visible
         const playlistsSection = $byId(IDS.playlistsSection);
         if (playlistsSection && typeof homePage?.renderPlaylists === 'function') {
            homePage.renderPlaylists();
         }
         // If currently viewing the deleted playlist, navigate home
         const currentPlaylistView = document.querySelector(`.playlist-page[data-playlist-id="${playlistId}"]`);
         if(currentPlaylistView && appState.router) {
             appState.router.navigateTo(ROUTES.HOME);
         }


        return true;
    },


    create: async () => {
        const name = await overlays.form.prompt(
            "Enter playlist name:",
            {
                okText: "Create",
                placeholder: "My playlist",
            }
        );

         // Call the async add function
        if (name) return await playlists.add(name);
        return null;
    },

    showAll: () => {
        // ... (existing showAll rendering logic - seems okay) ...
        // Ensure event binding happens correctly within the overlay
        const content = `...`; // Existing rendering logic
        overlays.viewer.playlists(content);
        const modalEl = document.getElementById("playlist-viewer");
         if(modalEl) { // Check if modal exists
            playlists.bindEvents(modalEl); // Pass modal element as root
         }
    },

    show: (playlistId) => {
         // ... (existing show rendering logic - seems okay) ...
         // Ensure event binding happens correctly for the dynamically loaded content
         const dynamicContent = $byId(IDS.dynamicContent);
         if (dynamicContent) {
             dynamicContent.innerHTML = `...`; // Existing rendering logic
             playlists.bindViewEvents(playlist); // Bind events after content is set
         }
    },


    bindEvents: (root = document) => { // Default to document, allow specific root
        if (!root) return;

        const createBtn = root.querySelector(".create-playlist-btn");
        if (createBtn) {
            // Remove previous listener if exists to prevent duplicates
            createBtn.removeEventListener("click", playlists._handleCreateClick);
            createBtn.addEventListener("click", playlists._handleCreateClick);
        }

        root.querySelectorAll(".view-playlist-btn").forEach((btn) => {
             btn.removeEventListener("click", playlists._handleViewClick); // Remove previous
            btn.addEventListener("click", playlists._handleViewClick);
        });

        root.querySelectorAll(".play-playlist-btn").forEach((btn) => {
            btn.removeEventListener("click", playlists._handlePlayClick); // Remove previous
            btn.addEventListener("click", playlists._handlePlayClick);
        });

        root.querySelectorAll(".delete-playlist-btn").forEach((btn) => {
            btn.removeEventListener("click", playlists._handleDeleteClick); // Remove previous
            btn.addEventListener("click", playlists._handleDeleteClick);
        });

        root.querySelectorAll(".playlist-card:not(.bound)").forEach((card) => { // Use a class to mark bound cards
            card.classList.add('bound');
            card.addEventListener("click", playlists._handleCardClick);
        });
    },
     // Define helper functions for event listeners to allow removal
     _handleCreateClick: async () => {
         const newPlaylist = await playlists.create();
         if (newPlaylist && typeof homePage?.renderPlaylists === 'function') {
             // Re-render relevant sections
             homePage.renderPlaylists(); // Update home section
             if(document.getElementById("playlist-viewer")) { // Update full view if open
                 playlists.showAll();
             }
         }
     },
     _handleViewClick: (e) => {
         e.stopPropagation();
         const playlistId = e.currentTarget.dataset.playlistId;
         playlists.show(playlistId);
         overlays.close('playlist-viewer'); // Close the 'all playlists' view if open
     },
     _handlePlayClick: (e) => {
          e.stopPropagation();
          const playlistId = e.currentTarget.dataset.playlistId;
          playlists.play(playlistId);
          overlays.close('playlist-viewer'); // Close viewer on play
     },
     _handleDeleteClick: async (e) => {
         e.stopPropagation();
         const playlistId = e.currentTarget.dataset.playlistId;
         if (await playlists.remove(playlistId)) {
             // Refresh views if necessary
              if(document.getElementById("playlist-viewer")) { // Update full view if open
                 playlists.showAll();
             }
         }
     },
    _handleCardClick: (e) => {
        const playlistId = e.currentTarget.dataset.playlistId;
        playlists.show(playlistId);
        overlays.close('playlist-viewer'); // Close the 'all playlists' view if open
    },


    bindViewEvents: (playlist) => {
        const dynamicContent = $byId(IDS.dynamicContent);
        if (!dynamicContent) return;

        const playBtn = dynamicContent.querySelector(".play-playlist-btn");
        if (playBtn) {
            playBtn.addEventListener("click", () => playlists.play(playlist.id));
        }

        const editBtn = dynamicContent.querySelector(".edit-playlist-btn");
        if (editBtn) {
            editBtn.addEventListener("click", async () => {
                const newName = await overlays.form.prompt(
                    "Enter new playlist name:",
                    { okText: "Rename", placeholder: "Playlist name", value: playlist.name }
                );
                if (newName && newName.trim() && newName.trim() !== playlist.name) {
                    playlist.name = newName.trim();
                    storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);
                    playlists.show(playlist.id); // Re-render the view
                    notifications.show("Playlist renamed successfully", NOTIFICATION_TYPES.SUCCESS);
                     // Update homepage section if visible
                      if (typeof homePage?.renderPlaylists === 'function') {
                         homePage.renderPlaylists();
                      }
                }
            });
        }

        const deleteBtn = dynamicContent.querySelector(".delete-playlist-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                await playlists.remove(playlist.id); // remove handles navigation if needed
            });
        }

        const browseBtn = dynamicContent.querySelector(".browse-music-btn");
        if (browseBtn) {
            browseBtn.addEventListener("click", () => appState.router?.navigateTo(ROUTES.HOME));
        }

         // Use event delegation for song rows for better performance
         const songsList = dynamicContent.querySelector(".songs-list");
         if (songsList) {
             songsList.addEventListener('click', (e) => {
                 const songRow = e.target.closest('.song-row');
                 if (!songRow) return; // Click wasn't on a song row

                 const songDataStr = songRow.dataset.song;
                 let songData;
                 try { songData = JSON.parse(songDataStr.replace(/&quot;/g, '"')); } catch { return; }


                 // Play song on row click (but not on action buttons or artist link)
                  if (!e.target.closest('.action-btn, .play-song-btn, [data-artist]')) {
                     musicPlayer.ui.playSong(songData);
                     return;
                 }

                 // Play button specific action
                 if (e.target.closest('.play-song-btn')) {
                      e.stopPropagation();
                      musicPlayer.ui.playSong(songData);
                      return;
                  }

                 // Artist link action
                 const artistLink = e.target.closest('[data-artist]');
                 if (artistLink) {
                     e.stopPropagation();
                     const artistName = artistLink.dataset.artist;
                     appState.router?.navigateTo(ROUTES.ARTIST, { artist: artistName });
                     return;
                 }

                 // Handle action buttons
                 const actionBtn = e.target.closest('.action-btn');
                 if (actionBtn) {
                      e.stopPropagation();
                      const action = actionBtn.dataset.action;
                      const playlistId = songRow.dataset.playlistId; // Get playlistId from row

                     switch (action) {
                         case "favorite":
                             appState.favorites.toggle("songs", songData.id);
                              // Update UI directly - favorites.toggle handles notification
                              const heartIcon = actionBtn.querySelector("svg");
                              const isFavorite = appState.favorites.has("songs", songData.id);
                              if(heartIcon) {
                                heartIcon.style.color = isFavorite ? "#ef4444" : "";
                                heartIcon.style.fill = isFavorite ? "currentColor" : "none";
                              }
                             break;
                         case "add-queue":
                             appState.queue.add(songData); // Handles notification
                             break;
                         case "remove-from-playlist":
                              // removeSong handles re-render and notification
                             playlists.removeSong(playlistId, songData.id);
                             break;
                     }
                 }
             });
         }
    },
};

const bindClick = (el, handler) => {
  if (!el || typeof handler !== "function") return;

  // Store the handler on the element to allow removal
  const eventName = '_clickHandler';
  if (el[eventName]) el.removeEventListener("click", el[eventName]);

  const fn = (e) => {
       e.stopPropagation(); // Stop propagation inside the handler
       e.preventDefault(); // Prevent default link behavior for buttons/links used as buttons
       handler();
   };

  el.addEventListener("click", fn);
  el[eventName] = fn; // Store the new handler
};

const bindClickAll = (nodeList, handler) => {
  if (!nodeList) return;
  nodeList.forEach((el) => bindClick(el, handler));
};

const eventHandlers = {
   _boundElements: new Set(), // Keep track of elements with bound handlers

  init: () => {
    eventHandlers.bindMenus();
    eventHandlers.bindControls();
    eventHandlers.bindPopups();
    // eventHandlers.bindProgress(); // Seek bar binding is handled in musicPlayer.ui.bindSeekBar
    eventHandlers.bindKeyboard();
    eventHandlers.bindDocument(); // General document level clicks
     eventHandlers.bindControlEvents(); // Ensure player controls are bound initially
  },

   // Helper to safely bind and track
  _bindAndTrack: (selectorOrElement, handler, event = 'click') => {
      let elements;
      if (typeof selectorOrElement === 'string') {
          elements = document.querySelectorAll(selectorOrElement);
      } else if (selectorOrElement instanceof HTMLElement) {
          elements = [selectorOrElement];
      } else if (selectorOrElement instanceof NodeList) {
          elements = selectorOrElement;
      } else {
          return; // Invalid input
      }

      elements.forEach(el => {
          if (!eventHandlers._boundElements.has(el)) { // Only bind if not already tracked
              const fn = (e) => {
                  e.preventDefault(); // Prevent default actions for clicks
                  e.stopPropagation();
                  handler(e); // Pass event if needed by handler
              };
              el.addEventListener(event, fn);
              el._dynamicHandler = fn; // Store handler for potential removal
              eventHandlers._boundElements.add(el); // Track element
          }
      });
  },
  // Example usage in bindControls:
   bindControls: () => {
      // Use _bindAndTrack for cleaner binding
      eventHandlers._bindAndTrack(IDS.nowPlayingArea, () => musicPlayer.mainPlayer.toggle());
      eventHandlers._bindAndTrack(NAVBAR.nowPlaying, () => musicPlayer.mainPlayer.toggle()); // QuerySelector backup
      eventHandlers._bindAndTrack(NAVBAR.playPause, () => musicPlayer.mainPlayer.toggle());
      eventHandlers._bindAndTrack(NAVBAR.previous, () => musicPlayer.playback.previous());
      eventHandlers._bindAndTrack(NAVBAR.next, () => musicPlayer.playback.next());

       // Example for elements retrieved by $byId
       const menuTrigger = $byId(IDS.menuTrigger);
       if (menuTrigger) eventHandlers._bindAndTrack(menuTrigger, dropdown.toggle);
   },


   // --- Keep other bind methods similar, potentially using _bindAndTrack ---
   bindMenus: () => { /* ... similar logic ... */ },
   bindPopups: () => { /* ... similar logic ... */ },
   bindKeyboard: () => { /* ... document level, no need for _boundElements ... */ },
   bindDocument: () => { /* ... document level, no need for _boundElements ... */ },
   bindControlEvents: () => { /* ... similar logic ... */ },


   // Optional: Function to clean up handlers if needed (e.g., on page transitions without full reload)
   cleanupHandlers: () => {
       eventHandlers._boundElements.forEach(el => {
           if (el._dynamicHandler) {
               el.removeEventListener('click', el._dynamicHandler); // Assuming click, adjust if other events used
               delete el._dynamicHandler;
           }
       });
       eventHandlers._boundElements.clear();
       console.log("Cleaned up dynamic event handlers.");
   }
};

window.MyTunesApp = {
  initialize: app.initialize,
  goHome: app.goHome,
  state: appState,
  music: music,
  navigation: navigation,
  playlists: playlists,
  views: views,
  utils: utils,
  dropdown: dropdown,
  overlays: overlays,
  notifications: notifications,
  musicPlayer: musicPlayer,
  playerController: {
        playSong: musicPlayer.ui.playSong,
        toggle: musicPlayer.mainPlayer.toggle,
        next: musicPlayer.playback.next,
        previous: musicPlayer.playback.previous,
        seekTo: musicPlayer.playback.seekTo,
        skip: musicPlayer.playback.skip,
   },
   eventHandlers: eventHandlers, // Expose if cleanup is needed externally
};

function onDomReady() {
    console.log('DOM ready, initializing application...');
    if (!window.MyTunesApp.state.isInitialized) {
        window.MyTunesApp.initialize();
         console.log('Application initialization sequence started from onDomReady.');
    } else {
        console.log('DOM ready, but app already initialized.');
    }

    // Specific bindings after initial setup (moved from initialize to ensure elements exist)
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        // Ensure seek bar binding happens after player UI is initialized
         musicPlayer.ui.bindSeekBar();
        progressBar.addEventListener('keydown', musicPlayer.ui.handleProgressBarKeyDown);
    }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onDomReady);
} else {
  onDomReady();
}

const loadArtistInfo = (artistData) => app.loadArtistInfo(artistData);

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
    eventHandlers,
    app,
    pageLoader,
    navigation,
    ACTION_GRID_ITEMS,
    loadArtistInfo
};