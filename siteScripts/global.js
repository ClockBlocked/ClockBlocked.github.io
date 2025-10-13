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
      notifications.show(`Added "${song.title}" to queue`);
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
    const cleanName = albumName.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
    return `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-home-page-layout-issues/global/content/images/albumCovers/${cleanName}.png`;
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
    return `https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-home-page-layout-issues/global/content/images/artistPortraits/${normalized}.png`;
  },

  getDefaultAlbumImage: () => {
    return "https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-home-page-layout-issues/global/content/images/albumCovers/default-album.png";
  },

  getDefaultArtistImage: () => {
    return "https://raw.githubusercontent.com/ClockBlocked/ClockBlocked.github.io/refs/heads/copilot/fix-home-page-layout-issues/global/content/images/artistPortraits/default-artist.png";
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
      [STORAGE_KEYS.RECENTLY_PLAYED]: (data) => (appState.recentlyPlayed = data || []),
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
    prompt(message, { okText = "Create", cancelText = "Cancel", placeholder = "", value = "" } = {}) {
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
        
        setTimeout(() => input.focus(), 100);
        
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
    if (!existing) document.body.appendChild(this.container);
  },

  show(message, type = NOTIFICATION_TYPES.INFO, undoCallback = null, options = {}) {
    this.initialize();

    const duration = Number.isFinite(options.duration) ? Math.max(1200, options.duration) : 5000;
    const title = options.title || null;
    const iconHtml = options.iconHtml || TOAST_ICONS[type] || TOAST_ICONS[NOTIFICATION_TYPES.INFO];

    const toastHtml = render.notification({
      type,
      iconHtml,
      title,
      message: this.escapeHtml(String(message)),
    });
    
    const toast = create(toastHtml);

    if (!prefersReducedMotion) {
      toast.style.animation = "toast-in 200ms cubic-bezier(.2,.8,.25,1) both";
    }

    const actions = toast.querySelector('.toast-actions');
    if (actions && typeof undoCallback === "function") {
      const undoBtn = document.createElement("button");
      undoBtn.type = "button";
      undoBtn.textContent = "Undo";
      undoBtn.addEventListener("click", () => {
        try { undoCallback(); } catch {}
        dismiss("undo");
      });
      actions.appendChild(undoBtn);
    }

    const progress = toast.querySelector('.toast-progress');

    this.container.prepend(toast);
    this.items.add(toast);

    const ctrl = this.createTimerController({
      duration,
      onTick: (ratioRemaining) => {
        progress.style.width = (ratioRemaining * 100).toFixed(2) + "%";
      },
      onEnd: () => dismiss("timeout"),
    });

    const pause = () => ctrl.pause();
    const resume = () => ctrl.resume();

    toast.addEventListener("mouseenter", pause);
    toast.addEventListener("mouseleave", resume);
    toast.addEventListener("touchstart", (e) => { pause(); touchStart(e); }, { passive: true });
    toast.addEventListener("touchend", (e) => { touchEnd(e); resume(); });
    toast.addEventListener("touchcancel", (e) => { touchEnd(e); resume(); });

    let drag = null;
    const threshold = 56;
    const maxFade = 80;

    const startDrag = (clientX) => {
      drag = { startX: clientX, lastX: clientX };
      toast.style.transition = "none";
    };
    const onDrag = (clientX) => {
      if (!drag) return;
      drag.lastX = clientX;
      const dx = clientX - drag.startX;
      toast.style.transform = `translateX(${dx}px)`;
      const abs = Math.min(Math.abs(dx), maxFade);
      const alpha = 1 - (abs / maxFade) * 0.85;
      toast.style.opacity = String(Math.max(0.15, alpha));
    };
    const endDrag = () => {
      if (!drag) return;
      const dx = drag.lastX - drag.startX;
      toast.style.transition = "transform 180ms cubic-bezier(.2,.8,.25,1), opacity 160ms linear";
      if (Math.abs(dx) >= threshold) {
        toast.style.animation = dx > 0 ? "toast-swipe-out-right 220ms both" : "toast-swipe-out-left 220ms both";
        setTimeout(() => dismiss("swipe"), 200);
      } else {
        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";
      }
      drag = null;
    };

    toast.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      ctrl.pause();
      toast.setPointerCapture?.(e.pointerId);
      startDrag(e.clientX);
    });
    toast.addEventListener("pointermove", (e) => {
      if (!drag) return;
      onDrag(e.clientX);
    });
    toast.addEventListener("pointerup", () => {
      endDrag();
      ctrl.resume();
    });
    toast.addEventListener("pointercancel", () => {
      endDrag();
      ctrl.resume();
    });

    function touchStart(e) {
      const t = e.changedTouches?.[0];
      if (!t) return;
      startDrag(t.clientX);
    }
    function touchEnd(e) {
      const t = e.changedTouches?.[0];
      if (!t) return;
      onDrag(t.clientX);
      endDrag();
    }

    const dismiss = () => {
      if (!this.items.has(toast)) return;
      ctrl.stop();
      this.items.delete(toast);
      if (!prefersReducedMotion) {
        toast.style.animation = "toast-out-up 180ms cubic-bezier(.2,.8,.25,1) forwards";
        setTimeout(() => toast.remove(), 160);
      } else {
        toast.remove();
      }
    };

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
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      pause() {
        if (!running) return;
        running = false;
        remaining -= performance.now() - start;
        if (raf) cancelAnimationFrame(raf);
      },
      resume() {
        if (running) return;
        running = true;
        start = performance.now();
        raf = requestAnimationFrame(frame);
      },
      stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      }
    };
  },

  escapeHtml(s) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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
      return `https://koders.cloud/global/content/images/albumCovers/${cleanName}.png`;
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
        console.warn("Failed to update position state:", error);
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
        console.error('Failed to execute play action:', error);
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
        console.error('Failed to execute pause action:', error);
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
        console.error('Failed to execute stop action:', error);
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
        console.error('Failed to execute previous track action:', error);
      }
    },

    nexttrack: () => {
      try {
        if (musicPlayer.playback && musicPlayer.playback.next) {
          musicPlayer.playback.next();
        }
      } catch (error) {
        console.error('Failed to execute next track action:', error);
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
        console.error('Failed to execute seek to action:', error);
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
        console.error('Failed to execute seek backward action:', error);
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
        console.error('Failed to execute seek forward action:', error);
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
        console.error('Audio error:', error);
        notificationPlayer.playbackState.update('paused');
        notificationPlayer.positionState.stopContinuousUpdate();
      }
    }
  },

  setup: () => {
    if (!('mediaSession' in navigator)) {
      console.warn('Media Session API not supported');
      return false;
    }

    if (notificationPlayer.state.isInitialized) {
      console.warn('NotificationPlayer already initialized');
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
          console.warn(`Media session action "${action}" not supported:`, error);
        }
      });

      if (appState.audio) {
        notificationPlayer.events.bind();
      }

      notificationPlayer.playbackState.update('none');

      notificationPlayer.state.isInitialized = true;
      
      return true;

    } catch (error) {
      console.error('Failed to setup NotificationPlayer:', error);
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
            console.warn(`Failed to clear action handler "${action}":`, error);
          }
        });

        navigator.mediaSession.playbackState = 'none';
      }

      notificationPlayer.state.isInitialized = false;
      notificationPlayer.state.supportedActions.clear();
      notificationPlayer.state.currentMetadata = null;
      notificationPlayer.state.lastPositionUpdate = 0;

    } catch (error) {
      console.error('Error during NotificationPlayer cleanup:', error);
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

const musicPlayer = {
    mainPlayer: {
        open: () => {
            const drawer = document.querySelector('.drawer');
            if (!drawer) return;
            
            drawer.showPopover();
            appState.isPopupVisible = true;
            musicPlayer.mainPlayer.updateTabContent(appState.currentTab || 'playing');
        },
        
        close: () => {
            const drawer = document.querySelector('.drawer');
            if (!drawer) return;
            
            drawer.hidePopover();
            appState.isPopupVisible = false;
            setTimeout(() => musicPlayer.mainPlayer.switchTab("playing"), 50);
        },
        
        toggle: () => {
            const drawer = document.querySelector('.drawer');
            if (!drawer) return;
            
            if (drawer.matches(':popover-open')) {
                musicPlayer.mainPlayer.close();
            } else {
                musicPlayer.mainPlayer.open();
            }
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
            
            if (appState.queue.items.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                const items = queueList.querySelectorAll('li:not(.empty)');
                items.forEach(item => item.remove());
                return;
            }
            
            if (emptyState) emptyState.style.display = 'none';
            
            const existingItems = queueList.querySelectorAll('li:not(.empty)');
            existingItems.forEach(item => item.remove());
            
            appState.queue.items.forEach((song, index) => {
                const listItemHTML = render.playerListItem({ song, index, type: 'queue', utils });
                const listItem = create(listItemHTML);
                
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
                        musicPlayer.mainPlayer.updateQueueTab(); 
                        ui.updateCounts(); 
                    });
                }
                
                listItem.addEventListener('click', () => appState.queue.playAt(index));
                queueList.appendChild(listItem);
            });
        },
        
        updateRecentTab: () => {
            const recentList = document.getElementById('recentList');
            if (!recentList) return;
            
            const emptyState = recentList.querySelector('.empty');
            
            if (!appState.recentlyPlayed || appState.recentlyPlayed.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                const items = recentList.querySelectorAll('li:not(.empty)');
                items.forEach(item => item.remove());
                return;
            }
            
            if (emptyState) emptyState.style.display = 'none';
            
            const existingItems = recentList.querySelectorAll('li:not(.empty)');
            existingItems.forEach(item => item.remove());
            
            appState.recentlyPlayed.slice(0, 20).forEach((song, index) => {
                const listItemHTML = render.playerListItem({ song, index, type: 'recent', utils });
                const listItem = create(listItemHTML);
                
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
                        notifications.show(`Added "${song.title}" to queue`); 
                    });
                }
                
                listItem.addEventListener('click', () => musicPlayer.ui.playSong(song));
                recentList.appendChild(listItem);
            });
        },
        
        preventHorizontalScroll: () => {
            const musicPlayerElement = document.getElementById('musicPlayer');
            if (!musicPlayerElement) return;

            let startX = 0;
            let startY = 0;

            const handleTouchStart = (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            };

            const handleTouchMove = (e) => {
                const deltaX = Math.abs(e.touches[0].clientX - startX);
                const deltaY = Math.abs(e.touches[0].clientY - startY);
                
                if (deltaX > deltaY) {
                    e.preventDefault();
                }
            };

            musicPlayerElement.addEventListener('touchstart', handleTouchStart, { passive: true });
            musicPlayerElement.addEventListener('touchmove', handleTouchMove, { passive: false });

            musicPlayerElement.addEventListener('wheel', (e) => {
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    e.preventDefault();
                }
            }, { passive: false });
        },
        
        initDrawerDrag: () => {
            const drawerScroller = document.querySelector('.drawerScroller');
            const drawer = document.querySelector('.drawer');
            
            if (!drawerScroller || !drawer) return;
            
            let isDragging = false;
            let startY = 0;
            let currentY = 0;
            
            const handleTouchStart = (e) => {
                isDragging = true;
                startY = e.touches[0].clientY;
                currentY = startY;
                drawerScroller.style.scrollSnapType = 'none';
            };
            
            const handleTouchMove = (e) => {
                if (!isDragging) return;
                
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                
                if (deltaY > 0) {
                    e.preventDefault();
                }
            };
            
            const handleTouchEnd = (e) => {
                if (!isDragging) return;
                
                isDragging = false;
                drawerScroller.style.scrollSnapType = 'y mandatory';
                
                const deltaY = currentY - startY;
                
                if (deltaY > 5) {
                    musicPlayer.mainPlayer.close();
                } else {
                    drawerScroller.scrollTo({
                        top: drawerScroller.scrollTop,
                        behavior: 'smooth'
                    });
                }
            };
            
            drawerScroller.addEventListener('touchstart', handleTouchStart, { passive: true });
            drawerScroller.addEventListener('touchmove', handleTouchMove, { passive: false });
            drawerScroller.addEventListener('touchend', handleTouchEnd, { passive: true });
            
            drawerScroller.addEventListener('mousedown', (e) => {
                isDragging = true;
                startY = e.clientY;
                currentY = startY;
                drawerScroller.style.scrollSnapType = 'none';
            });
            
            drawerScroller.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                currentY = e.clientY;
                const deltaY = currentY - startY;
                if (deltaY > 0) {
                    e.preventDefault();
                }
            });
            
            drawerScroller.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                drawerScroller.style.scrollSnapType = 'y mandatory';
                
                const deltaY = currentY - startY;
                if (deltaY > 5) {
                    musicPlayer.mainPlayer.close();
                }
            });
            
            drawerScroller.addEventListener('mouseleave', (e) => {
                if (isDragging) {
                    isDragging = false;
                    drawerScroller.style.scrollSnapType = 'y mandatory';
                    musicPlayer.mainPlayer.close();
                }
            });
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
            
            musicPlayer.mainPlayer.preventHorizontalScroll();
            musicPlayer.mainPlayer.initDrawerDrag();
        }
    },

    playback: {
        dispatchPlayerStateChange: () {
          const detail = {
            song: appState.currentSong,
            artist: appState.currentArtist,
            album: appState.currentAlbum,
            isPlaying: appState.isPlaying,
            duration: appState.duration,
            currentTime: appState.audio?.currentTime ?? 0,
            totalTime: appState.audio?.duration ?? 0
          };
        window.dispatchEvent(new CustomEvent('playerstatechange', { detail }));
      },
        play: () => {
            if (!appState.currentSong || !appState.audio) return;
            appState.audio.play().catch((err) => {
                console.error("Play failed:", err);
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
            }
        },

        previous: () => {
            if (appState.audio && appState.audio.currentTime > 3) {
                appState.audio.currentTime = 0;
                return;
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
            notificationPlayer.positionState.update();
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
            },

            all: () => {
                if (!window.music || window.music.length === 0) {
                    notifications.show("No music library found", NOTIFICATION_TYPES.WARNING);
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
                    notifications.show("No songs found", NOTIFICATION_TYPES.WARNING);
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
                ui.updateShuffleButton();
                notifications.show("Playing all songs shuffled");
            },
        },

        repeat: {
            toggle: () => {
                if (appState.repeatMode === REPEAT_MODES.OFF) {
                    appState.repeatMode = REPEAT_MODES.ALL;
                } else if (appState.repeatMode === REPEAT_MODES.ALL) {
                    appState.repeatMode = REPEAT_MODES.ONE;
                } else {
                    appState.repeatMode = REPEAT_MODES.OFF;
                }
                ui.updateRepeatButton();
                const modeText = appState.repeatMode === REPEAT_MODES.OFF ? "disabled" : 
                                appState.repeatMode === REPEAT_MODES.ALL ? "all songs" : "current song";
                notifications.show(`Repeat ${modeText}`);
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
            const events = {
                timeupdate: musicPlayer.ui.updateProgress,
                ended: musicPlayer.ui.onEnded,
                loadedmetadata: musicPlayer.ui.onMetadataLoaded,
                play: musicPlayer.ui.onPlay,
                pause: musicPlayer.ui.onPause,
                error: musicPlayer.ui.onError,
            };
            
            Object.entries(events).forEach(([event, handler]) => 
                appState.audio.addEventListener(event, handler)
            );
            
            musicPlayer.ui.bindSeekBar();
            notificationPlayer.setup();
        },

        playSong: async (songData) => {
          if (!songData) return;
            musicPlayer.ui.initialize();
                ui.setLoadingState(true);
            
          if (appState.currentSong) {
                musicPlayer.ui.addToRecentlyPlayed(appState.currentSong);
            }
            
            appState.currentSong = songData;
            appState.currentArtist = songData.artist;
            appState.currentAlbum = songData.album;
            
            ui.updateNowPlaying();
            ui.updateNavbar();
            ui.updateMusicPlayer();
            ui.updateCounts();
            
            const success = await musicPlayer.ui.loadAudioFile(songData);
            if (success) {
                notificationPlayer.metadata.update(songData);
                notificationPlayer.events.bind();
                setTimeout(() => { 
                    eventHandlers.bindControlEvents?.(); 
                    musicPlayer.ui.bindSeekBar(); 
                }, 100);
              dispatchPlayerStateChange();
            } else {
                appState.isPlaying = false;
                ui.updatePlayPauseButtons();
                notificationPlayer.playbackState.onPause();
              dispatchPlayerStateChange();
            }
            ui.setLoadingState(false);
          },

        loadAudioFile: async (songData) => {
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

            for (const format of AUDIO_FORMATS) {
                try {
                    const audioUrl = `https://koders.cloud/global/content/audio/${songFileName}.${format}`;
                    
                    appState.audio.src = audioUrl;
                    appState.audio.preload = "auto";
                    
                    await new Promise((resolve, reject) => {
                        const loadHandler = () => {
                            appState.audio.removeEventListener("canplaythrough", loadHandler);
                            appState.audio.removeEventListener("error", errorHandler);
                            resolve();
                        };
                        
                        const errorHandler = (e) => {
                            appState.audio.removeEventListener("canplaythrough", loadHandler);
                            appState.audio.removeEventListener("error", errorHandler);
                            reject(e);
                        };
                        
                        appState.audio.addEventListener("canplaythrough", loadHandler, { once: true });
                        appState.audio.addEventListener("error", errorHandler, { once: true });
                        
                        if (appState.audio.readyState >= 3) {
                            loadHandler();
                        }
                    });
                    
                    await appState.audio.play();
                    return true;
                    
                } catch (error) {
                    console.warn(`Failed to load ${format} format:`, error);
                    continue;
                }
            }
            
            console.error("All audio format attempts failed for:", songData.title);
            return false;
        },

        bindSeekBar: () => {
            const bar = $byId(IDS.progressBar);
            const thumb = $byId(IDS.progressThumb);
            if (!bar || !thumb) return;

            const onPointerDown = (e) => {
                e.preventDefault();
                bar.setPointerCapture?.(e.pointerId ?? 1);
                musicPlayer.ui.isScrubbing = true;
                musicPlayer.ui.wasPlayingBeforeScrub = !!appState.isPlaying;
                if (musicPlayer.ui.wasPlayingBeforeScrub) appState.audio.pause();
                musicPlayer.ui.seekFromEvent(e, bar);
                bar.classList.add('is-dragging');
                const moveTarget = bar;
                moveTarget.addEventListener('pointermove', onPointerMove, { passive: false });
                moveTarget.addEventListener('pointerup', onPointerUp, { once: true });
                window.addEventListener('pointercancel', onPointerUp, { once: true });
            };

            const onPointerMove = (e) => {
                if (!musicPlayer.ui.isScrubbing) return;
                e.preventDefault();
                musicPlayer.ui.seekFromEvent(e, bar);
            };

            const onPointerUp = (e) => {
                musicPlayer.ui.seekFromEvent(e, bar, true);
                musicPlayer.ui.isScrubbing = false;
                bar.classList.remove('is-dragging', 'is-hovering');
                if (musicPlayer.ui.wasPlayingBeforeScrub) appState.audio.play();
                bar.releasePointerCapture?.(e.pointerId ?? 1);
                bar.removeEventListener('pointermove', onPointerMove);
            };

            const onEnter = () => bar.classList.add('is-hovering');
            const onLeave = () => { 
                if (!musicPlayer.ui.isScrubbing) bar.classList.remove('is-hovering'); 
            };
            
            bar.addEventListener('pointerdown', onPointerDown, { passive: false });
            bar.addEventListener('pointerenter', onEnter);
            bar.addEventListener('pointerleave', onLeave);
            
            bar.addEventListener('keydown', musicPlayer.ui.handleProgressBarKeyDown);
        },

        seekFromEvent: (e, bar, finalize = false) => {
            const rect = bar.getBoundingClientRect();
            const x = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
            let pct = ((x - rect.left) / rect.width) * 100;
            if (!isFinite(pct)) pct = 0;
            pct = Math.max(0, Math.min(100, pct));
            const time = (appState.duration || appState.audio?.duration || 0) * (pct / 100);
            musicPlayer.ui.setProgressUI(pct, time);
            if (finalize) {
                if (isFinite(time)) {
                    appState.audio.currentTime = time;
                    notificationPlayer.positionState.update();
                }
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
            if (!audio || !audio.duration) return;
            
            const duration = audio.duration;
            let timeChange = 0;
            
            switch (e.key) {
                case 'ArrowRight':
                    timeChange = 5;
                    break;
                case 'ArrowLeft':
                    timeChange = -5;
                    break;
                case 'PageUp':
                    timeChange = 10;
                    break;
                case 'PageDown':
                    timeChange = -10;
                    break;
                case 'Home':
                    audio.currentTime = 0;
                    notificationPlayer.positionState.update();
                    e.preventDefault();
                    return;
                case 'End':
                    audio.currentTime = duration;
                    notificationPlayer.positionState.update();
                    e.preventDefault();
                    return;
                default:
                    return;
            }
            
            if (timeChange !== 0) {
                const newTime = Math.max(0, Math.min(duration, audio.currentTime + timeChange));
                audio.currentTime = newTime;
                notificationPlayer.positionState.update();
                e.preventDefault();
            }
        },

        updateProgress: () => {
            if (!appState.audio || musicPlayer.ui.isScrubbing) return;
            
            const duration = appState.duration || appState.audio.duration || 0;
            const currentTime = appState.audio.currentTime || 0;
            const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
            
            musicPlayer.ui.setProgressUI(percent, currentTime);
            musicPlayer.ui.updateBufferDisplay();
          dispatchPlayerStateChange();
        },

        updateBufferDisplay: () => {
            const buffer = $byId(IDS.progressBuffer);
            if (!buffer || !appState.audio) return;
            
            if (!appState.audio.buffered || appState.audio.buffered.length === 0) {
                buffer.style.width = '0%';
                return;
            }
            
            const duration = appState.audio.duration || 0;
            if (duration === 0) {
                buffer.style.width = '0%';
                return;
            }
            
            let bufferedEnd = 0;
            for (let i = 0; i < appState.audio.buffered.length; i++) {
                const end = appState.audio.buffered.end(i);
                if (end > bufferedEnd) bufferedEnd = end;
            }
            
            const bufferProgress = Math.min(1, bufferedEnd / duration);
            buffer.style.width = (bufferProgress * 100).toFixed(2) + '%';
        },

        onPlay: () => {
            appState.isPlaying = true;
            ui.updatePlayPauseButtons();
        },

        onPause: () => {
            appState.isPlaying = false;
            ui.updatePlayPauseButtons();
        },

        onMetadataLoaded: () => {
            if (!appState.audio || isNaN(appState.audio.duration)) return;
            
            appState.duration = appState.audio.duration;
            const totalTimeElement = $byId(IDS.totalTime);
            if (totalTimeElement) {
                totalTimeElement.textContent = utils.formatTime(appState.duration);
            }
            
            musicPlayer.ui.updateProgress();
            musicPlayer.ui.updateBufferDisplay();
        },

        onError: (error) => {
            console.error("Audio error:", error);
        },

        onEnded: () => {
            if (appState.repeatMode === REPEAT_MODES.ONE) { 
                appState.audio.currentTime = 0; 
                appState.audio.play(); 
                return; 
            }
            musicPlayer.playback.next();
        },

        addToRecentlyPlayed: (song) => {
            appState.recentlyPlayed.unshift(song);
            if (appState.recentlyPlayed.length > 50) {
                appState.recentlyPlayed = appState.recentlyPlayed.slice(0, 50);
            }
            storage.save(STORAGE_KEYS.RECENTLY_PLAYED, appState.recentlyPlayed.slice(0, 20));
        },

        getNextInAlbum: () => {
            if (!appState.currentSong || !window.music) return null;
            const artist = window.music.find((a) => a.artist === appState.currentArtist);
            const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
            if (!album) return null;
            const currentIndex = album.songs.findIndex((s) => s.title === appState.currentSong.title);
            const nextIndex = appState.shuffleMode ? 
                Math.floor(Math.random() * album.songs.length) : 
                (currentIndex + 1) % album.songs.length;
            if (nextIndex !== currentIndex || appState.repeatMode === REPEAT_MODES.ALL) {
                return { 
                    ...album.songs[nextIndex], 
                    artist: artist.artist, 
                    album: album.album, 
                    cover: utils.getAlbumImageUrl(album.album) 
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
                cover: utils.getAlbumImageUrl(album.album) 
            };
        },
    },
};

const app = {
    initialize: function() {
        window.music = music;

        storage.initialize();
        notifications.initialize();
        
        musicPlayer.ui.initialize();

        navigation.initialize();
        homePage.initialize();

        eventHandlers.init();

        app.resetUI();
        app.syncGlobalState();

        deepLinkRouter.initialize();
        deepLinkRouter.bindPopState();
    },

    resetUI: function() {
        const nowPlayingArea = document.querySelector(NAVBAR.nowPlaying);
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
            notifications.show("Please enter a playlist name", NOTIFICATION_TYPES.WARNING);
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

        notifications.show(`Created playlist "${playlist.name}"`, NOTIFICATION_TYPES.SUCCESS);
        return playlist;
    },

    addSong: (playlistId, song) => {
        const playlist = appState.playlists.find((p) => p.id === playlistId);
        if (!playlist) {
            notifications.show("Playlist not found", NOTIFICATION_TYPES.ERROR);
            return false;
        }

        const exists = playlist.songs.some((s) => s.id === song.id);
        if (exists) {
            notifications.show("Song already in playlist", NOTIFICATION_TYPES.WARNING);
            return false;
        }

        playlist.songs.push(song);
        storage.save(STORAGE_KEYS.PLAYLISTS, appState.playlists);

        notifications.show(`Added "${song.title}" to "${playlist.name}"`, NOTIFICATION_TYPES.SUCCESS);
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
        playlist.songs.slice(1).forEach((song) => appState.queue.add(song));
        musicPlayer.ui.playSong(playlist.songs[0]);

        notifications.show(`Playing playlist "${playlist.name}"`, NOTIFICATION_TYPES.SUCCESS);
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
        notifications.show(`Deleted playlist "${playlistName}"`, NOTIFICATION_TYPES.INFO);
        
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
                            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
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
            notifications.show("Playlist not found", NOTIFICATION_TYPES.ERROR);
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
                        <div class="song-row grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}' data-playlist-id="${
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
                    notifications.show("Playlist renamed successfully", NOTIFICATION_TYPES.SUCCESS);
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

const bindClick = (el, handler) => {
  if (!el || typeof handler !== "function") return;
  const fn = (e) => { e.stopPropagation(); handler(); };
  if (el._clickHandler) el.removeEventListener("click", el._clickHandler);
  el.addEventListener("click", fn);
  el._clickHandler = fn;
};

const bindClickAll = (nodeList, handler) => {
  if (!nodeList) return;
  nodeList.forEach((el) => bindClick(el, handler));
};

const eventHandlers = {
  init: () => {
    eventHandlers.bindMenus();
    eventHandlers.bindControls();
    eventHandlers.bindPopups();
    eventHandlers.bindProgress();
    eventHandlers.bindKeyboard();
    eventHandlers.bindDocument();
  },

  bindControls: () => {
    const idTrigger = $byId(IDS.nowPlayingArea);
    const selTrigger = document.querySelector(NAVBAR.nowPlaying);
    [idTrigger, selTrigger].filter(Boolean).forEach((el) => bindClick(el, () => musicPlayer.mainPlayer.toggle()));
    const navbarPlayPause = document.querySelector(NAVBAR.playPause);
    if (navbarPlayPause) bindClick(navbarPlayPause, () => musicPlayer.mainPlayer.toggle());
    const navbarPrevious = document.querySelector(NAVBAR.previous);
    if (navbarPrevious) bindClick(navbarPrevious, () => musicPlayer.playback.previous());
    const navbarNext = document.querySelector(NAVBAR.next);
    if (navbarNext) bindClick(navbarNext, () => musicPlayer.playback.next());
  },

  bindMenus: () => {
    const menuElements = {
      [IDS.menuTrigger]: dropdown.toggle,
      [IDS.dropdownClose]: dropdown.close,
      [IDS.willHideMenu]: dropdown.close,
    };
    Object.entries(menuElements).forEach(([id, handler]) => {
      const el = $byId(id);
      if (el) bindClick(el, handler);
    });
    const menuActions = {
      [IDS.favoriteSongs]: () => { dropdown.close(); views.showFavoriteSongs(); },
      [IDS.favoriteArtists]: () => { dropdown.close(); views.showFavoriteArtists(); },
      [IDS.recentlyPlayed]: () => { dropdown.close(); musicPlayer.mainPlayer.open(); setTimeout(() => musicPlayer.mainPlayer.switchTab("recent"), 50); },
      [IDS.queueView]: () => { dropdown.close(); musicPlayer.mainPlayer.open(); setTimeout(() => musicPlayer.mainPlayer.switchTab("queue"), 50); },
      [IDS.createPlaylist]: () => { dropdown.close(); playlists.create(); },
      [IDS.shuffleAll]: musicPlayer.playback.shuffle.all,
    };
    if (IDS.favoriteAlbums) {
      menuActions[IDS.favoriteAlbums] = () => { dropdown.close(); views.showFavoriteAlbums(); };
    }
    Object.entries(menuActions).forEach(([id, handler]) => {
      const el = $byId(id);
      if (el) bindClick(el, handler);
    });
  },

  bindPopups: () => {
    const popupControls = {
      [MUSIC_PLAYER.close]: musicPlayer.mainPlayer.close,
      [MUSIC_PLAYER.play]: musicPlayer.mainPlayer.toggle,
      [MUSIC_PLAYER.previous]: musicPlayer.playback.previous,
      [MUSIC_PLAYER.next]: musicPlayer.playback.next,
      [MUSIC_PLAYER.shuffle]: musicPlayer.playback.shuffle.toggle,
      [MUSIC_PLAYER.repeat]: musicPlayer.playback.repeat.toggle,
      [MUSIC_PLAYER.favoriteBtn]: () => {
        if (appState.currentSong) {
          appState.favorites.toggle("songs", appState.currentSong.id);
          ui.updateFavoriteButton();
        }
      },
    };
    Object.entries(popupControls).forEach(([selector, handler]) => {
      bindClickAll(document.querySelectorAll(selector), handler);
    });
    document.querySelectorAll(".tab").forEach((tab) => {
      bindClick(tab, () => {
        const tabName = tab.dataset.tab;
        if (tabName) musicPlayer.mainPlayer.switchTab(tabName);
      });
    });
  },

  bindProgress: () => {
    const progressBar = document.querySelector(MUSIC_PLAYER.progressBar);
    if (!progressBar) return;
    const handleProgressClick = (e) => {
      if (!appState.currentSong || !appState.audio || !appState.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percent * appState.duration;
      if (!isNaN(newTime) && isFinite(newTime)) musicPlayer.playback.seekTo(newTime);
    };
    const startDrag = (e) => {
      if (!appState.currentSong) return;
      progressBar._dragging = true;
      document.body.style.userSelect = "none";
      e.preventDefault();
    };
    const onDrag = (e) => {
      if (!progressBar._dragging || !appState.currentSong || !appState.audio || !appState.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percent * appState.duration;
      if (!isNaN(newTime) && isFinite(newTime)) musicPlayer.playback.seekTo(newTime);
    };
    const endDrag = () => {
      progressBar._dragging = false;
      document.body.style.userSelect = "";
    };
    if (progressBar._clickHandler) progressBar.removeEventListener("click", progressBar._clickHandler);
    progressBar.addEventListener("click", handleProgressClick);
    progressBar._clickHandler = handleProgressClick;
    if (progressBar._startDrag) progressBar.removeEventListener("mousedown", progressBar._startDrag);
    if (progressBar._onDrag) document.removeEventListener("mousemove", progressBar._onDrag);
    if (progressBar._endDrag) document.removeEventListener("mouseup", progressBar._endDrag);
    progressBar.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);
    progressBar._startDrag = startDrag;
    progressBar._onDrag = onDrag;
    progressBar._endDrag = endDrag;
  },

  bindKeyboard: () => {
    if (document._kbHandler) document.removeEventListener("keydown", document._kbHandler);
    const fn = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const shortcuts = {
        " ": (e) => { e.preventDefault(); musicPlayer.mainPlayer.toggle(); },
        ArrowLeft: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); musicPlayer.playback.previous(); } },
        ArrowRight: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); musicPlayer.playback.next(); } },
        KeyN: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); musicPlayer.mainPlayer.open(); } },
        KeyM: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); dropdown.toggle(); } },
        KeyS: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); musicPlayer.playback.shuffle.toggle(); } },
        KeyR: (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); musicPlayer.playback.repeat.toggle(); } },
        Escape: () => { musicPlayer.mainPlayer.close(); dropdown.close(); },
      };
      const handler = shortcuts[e.code] || shortcuts[e.key];
      if (handler) handler(e);
    };
    document.addEventListener("keydown", fn);
    document._kbHandler = fn;
  },

  bindDocument: () => {
    if (document._docClickHandler) document.removeEventListener("click", document._docClickHandler);
    const fn = (e) => {
      const dropdownMenu = $byId(IDS.dropdownMenu);
      const menuTrigger = $byId(IDS.menuTrigger);
      if (dropdownMenu && !dropdownMenu.contains(e.target) && !menuTrigger?.contains(e.target)) dropdown.close();
      const drawerEl = $byId(IDS.drawer);
      const nowPlayingEl = document.querySelector(NAVBAR.nowPlaying);
      if (appState.isPopupVisible && drawerEl && !drawerEl.contains(e.target) && !nowPlayingEl?.contains(e.target)) musicPlayer.mainPlayer.close();
      const navItem = e.target.closest("[data-nav]");
      if (navItem) {
        e.preventDefault();
        const navType = navItem.dataset.nav;
        dropdown.close();
        if (appState.router) {
          const navHandlers = {
            [ROUTES.HOME]: () => appState.router.navigateTo(ROUTES.HOME),
            [ROUTES.ALL_ARTISTS]: () => appState.router.navigateTo(ROUTES.ALL_ARTISTS),
            [ROUTES.ARTIST]: () => {
              const artistName = navItem.dataset.artist;
              if (artistName) appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
            },
            [ROUTES.ALBUM]: () => {
              const artist = navItem.dataset.artist;
              const album = navItem.dataset.album;
              if (artist && album) appState.router.navigateTo(ROUTES.ALBUM, { artist, album });
            },
          };
          if (navHandlers[navType]) navHandlers[navType]();
        }
      }
      if (e.target.closest("#" + IDS.globalSearchTrigger)) {
        e.preventDefault();
        dropdown.close();
        if (appState.router) appState.router.openSearchDialog();
      }
    };
    document.addEventListener("click", fn);
    document._docClickHandler = fn;
  },

  bindControlEvents: () => {
    const map = {
      [IDS.playBtn]: musicPlayer.mainPlayer.toggle,
      [IDS.prevBtn]: musicPlayer.playback.previous,
      [IDS.nextBtn]: musicPlayer.playback.next,
      [IDS.shuffleBtn]: musicPlayer.playback.shuffle.toggle,
      [IDS.repeatBtn]: musicPlayer.playback.repeat.toggle,
      [IDS.favoriteBtn]: () => { 
        if (appState.currentSong) appState.favorites.toggle("songs", appState.currentSong.id); 
      },
    };
    Object.entries(map).forEach(([id, handler]) => {
      const el = $byId(id);
      if (el) bindClick(el, handler);
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
    eventHandlers.init();
  });
} else {
  eventHandlers.init();
}

document.addEventListener('DOMContentLoaded', () => {
  app.initialize();
  
  const progressBar = document.getElementById('progressBar');
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
    eventHandlers,
    app,
    pageLoader,
    navigation,
    ACTION_GRID_ITEMS
};
