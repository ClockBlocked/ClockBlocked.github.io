import { REPEAT_MODES, STORAGE_KEYS } from '../map.js';

// Reactive State Store
// This provides a simple pub/sub pattern for state management
// Usage: appState.set('isPlaying', true) will notify all subscribers
// Usage: appState.subscribe((state) => { /* update UI */ })

const appState = {
  // Private state storage
  _state: {
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
  },

  // Subscribers list
  _subscribers: [],

  // Get a state value
  get: function(key) {
    if (key) {
      return appState._state[key];
    }
    // Return a copy of the entire state
    return { ...appState._state };
  },

  // Set a state value and notify subscribers
  set: function(key, value) {
    if (appState._state[key] !== value) {
      appState._state[key] = value;
      appState._notify(key, value);
    }
  },

  // Subscribe to state changes
  subscribe: function(callback) {
    appState._subscribers.push(callback);
    // Return unsubscribe function
    return function unsubscribe() {
      const index = appState._subscribers.indexOf(callback);
      if (index > -1) {
        appState._subscribers.splice(index, 1);
      }
    };
  },

  // Notify all subscribers of a state change
  _notify: function(key, value) {
    const state = appState.get();
    appState._subscribers.forEach(callback => {
      try {
        callback(state, key, value);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    });
  },

  // Favorites management
  favorites: {
    songs: new Set(),
    artists: new Set(),
    albums: new Set(),

    add: function(type, id) {
      appState.favorites[type].add(id);
      appState.favorites.save(type);
      appState.favorites.updateIcon(type, id, true);
      const itemName = type === "songs" ? "song" : type.slice(0, -1);
      // notifications.show will be imported from notifications module
      if (window.notifications) {
        window.notifications.show(`Added ${itemName} to favorites`, 'success');
      }
    },

    remove: function(type, id) {
      appState.favorites[type].delete(id);
      appState.favorites.save(type);
      appState.favorites.updateIcon(type, id, false);
      const itemName = type === "songs" ? "song" : type.slice(0, -1);
      if (window.notifications) {
        window.notifications.show(`Removed ${itemName} from favorites`, 'info');
      }
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
      // storage.save will be imported from storage module
      if (window.storage) {
        window.storage.save(key, Array.from(appState.favorites[type]));
      }
    },

    updateIcon: function(type, id, isFavorite) {
      const icons = document.querySelectorAll(`[data-favorite-${type}="${id}"]`);
      icons.forEach((icon) => {
        icon.classList.toggle("favorited", isFavorite);
        icon.classList.toggle("active", isFavorite);
        icon.setAttribute("aria-pressed", isFavorite);
        if (type === "songs") {
          const heartIcon = icon.querySelector("svg");
          if (heartIcon) {
            heartIcon.style.color = isFavorite ? "#ef4444" : "";
            heartIcon.style.fill = isFavorite ? "currentColor" : "none";
          }
        }
      });
      if (type === "songs" && appState.get('currentSong') && appState.get('currentSong').id === id) {
        // ui.updateFavoriteButton will be called via state subscription
        if (window.ui) {
          window.ui.updateFavoriteButton();
        }
      }
    }
  },

  // Queue management
  queue: {
    items: [],

    add: function(song, position = null) {
      if (position !== null) {
        appState.queue.items.splice(position, 0, song);
      } else {
        appState.queue.items.push(song);
      }
      if (window.storage) {
        window.storage.save(STORAGE_KEYS.QUEUE, appState.queue.items);
      }
      if (window.ui) {
        window.ui.updateCounts();
      }
      if (window.notifications) {
        window.notifications.show(`Added "${song.title}" to queue`, 'success');
      }
    },

    remove: function(index) {
      if (index >= 0 && index < appState.queue.items.length) {
        const removed = appState.queue.items.splice(index, 1)[0];
        if (window.storage) {
          window.storage.save(STORAGE_KEYS.QUEUE, appState.queue.items);
        }
        if (window.ui) {
          window.ui.updateCounts();
        }
        return removed;
      }
      return null;
    },

    clear: function() {
      appState.queue.items = [];
      if (window.storage) {
        window.storage.save(STORAGE_KEYS.QUEUE, appState.queue.items);
      }
      if (window.ui) {
        window.ui.updateCounts();
      }
    },

    getNext: function() {
      return appState.queue.items.length > 0 ? appState.queue.remove(0) : null;
    },

    get: function() {
      return appState.queue.items;
    },

    playAt: function(index) {
      const song = appState.queue.remove(index);
      if (song && window.musicPlayer) {
        window.musicPlayer.ui.playSong(song);
      }
    }
  }
};

export { appState };
