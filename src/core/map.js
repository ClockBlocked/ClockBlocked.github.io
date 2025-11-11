export const elementCache = new Map();

export const DOM = new Proxy({}, {
  get(target, elementId) {
    if (elementCache.has(elementId)) {
      return elementCache.get(elementId);
    }
    
    const element = document.getElementById(elementId);
    
    if (element) {
      elementCache.set(elementId, element);
      return element;
    }
    
    console.warn(`Element not found: #${elementId}`);
    return null;
  }
});

export const QUERY = (selector) => document.querySelector(selector);
export const QUERY_ALL = (selector) => document.querySelectorAll(selector);

export function clearElementCache() {
  elementCache.clear();
  console.log('🗑️ Element cache cleared');
}

export const IDS = Object.freeze({
  themeToggle: "theme-toggle",
  globalSearchTrigger: "global-search-trigger",
  searchDialog: "search-dialog",
  globalSearchForm: "global-search-form",
  globalSearchInput: "global-search-input",
  recentSearchesList: "recent-searches-list",
  popoverPortal: "popover-portal",
  willHideMenu: "will-hide-menu",
  menuTrigger: "menu-trigger",
  dropdownMenu: "dropdown-menu",
  dropdownClose: "dropdown-close",
  favoriteSongs: "favorite-songs",
  favoriteArtists: "favorite-artists",
  createPlaylist: "create-playlist",
  favoriteSongsCount: "favorite-songs-count",
  favoriteArtistsCount: "favorite-artists-count",
  recentlyPlayed: "recently-played",
  queueView: "queue-view",
  recentCount: "recent-count",
  queueCount: "queue-count",
  recentlyPlayedSection: "recently-played-section",
  randomAlbumsSection: "random-albums-section",
  favoriteArtistsSection: "favorite-artists-section",
  playlistsSection: "playlists-section",
  favoriteSongsSection: "favorite-songs-section",
  searchMusic: "search-music",
  shuffleAll: "shuffle-all",
  appSettings: "app-settings",
  aboutApp: "about-app",
  dynamicContent: "dynamic-content",
  contentLoading: "content-loading",
  albumsContainer: "albumWrapper",
  artistsGrid: "artists-grid",
  artistSearch: "artist-search",
  genreFilters: "genre-filters",
  seekTooltip: "seek-tooltip",
  musicPlayer: "music-player",
  musicPlayerTrigger: "now-playing-area",
  musicPlayerClose: "music-player-close",
  albumCover: "music-player-cover", 
  songTitle: "music-player-title",
  artistName: "music-player-artist",
  albumName: "music-player-album",
  playBtn: "music-player-play",
  prevBtn: "music-player-prev", 
  nextBtn: "music-player-next",
  rewindBtn: "music-player-rewind",
  forwardBtn: "music-player-forward",
  shuffleBtn: "music-player-shuffle",
  repeatBtn: "music-player-repeat",
  favoriteBtn: "music-player-favorite",
  queueBtn: "music-player-queue",
  shareBtn: "music-player-share",
  moreBtn: "music-player-more",
  progressBar: "music-player-progress-bar",
  progressFill: "music-player-progress-fill", 
  progressThumb: "music-player-progress-thumb",
  currentTime: "music-player-current-time",
  totalTime: "music-player-total-time",
  queueList: "music-player-queue-list",
  recentList: "music-player-recent-list",
  playPauseNavbar: "navbar-play-pause",
  prevBtnNavbar: "navbar-prev",
  nextBtnNavbar: "navbar-next",
  playIconNavbar: "navbar-play-icon",
  pauseIconNavbar: "navbar-pause-icon",
  nowPlayingAreaNavbar: "now-playing-area",
  searchTrigger: "searchTrigger",
});

export const CLASSES = Object.freeze({
  hidden: "hidden",
  searchDialogOpening: "search-dialog-opening",
  searchDialogClosing: "search-dialog-closing",
  hasSong: "has-song",
  light: "light",
  medium: "medium",
  show: "show",
  active: "active",
  marquee: "marquee",
  repeatOne: "repeat-one",
  animateRotate: "animate__animated animate__rotateIn",
  animateFadeIn: "animate__animated animate__fadeIn",
  animateZoomIn: "animate__animated animate__zoomIn",
  animatePulse: "animate__animated animate__pulse",
  imageFallback: "image-fallback",
  imageLoaded: "image-loaded",
  imageError: "image-error",
  imageLoading: "image-loading",
  playing: "playing",
  isPlaying: "isPlaying",
  isDragging: "isDragging",
  isHovering: "isHovering",
  favorited: "favorited",
});

export const THEMES = Object.freeze({
  DARK: "dark",
  MEDIUM: "dim",
  LIGHT: "light",
});

export const ICONS = Object.freeze({
  dark: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 116.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>',
  medium: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L13 9h7l-5.5 4 2 7L10 16l-6.5 4 2-7L1 9h7l2-7z"/></svg>',
  light: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"/></svg>',
  pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm192-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"/></svg>',
  next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/></svg>',
  prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',
  shuffle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
  repeat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  rewind: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/></svg>',
  forward: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 256C512 273.7 502.6 289.7 487.5 298.1L199.5 473.9C184.4 482.4 165.8 482 151 473.5C136.1 464.1 128 448.1 128 431.1V80.01C128 63.03 136.1 47.03 151 38.52C165.8 29.97 184.4 29.63 199.5 38.13L487.5 213.9C502.6 222.3 512 238.3 512 255.1V256z"/></svg>',
  queue: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>',
  share: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>',
  more: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/></svg>'  
});

export const MUSIC_PLAYER = (() => {
  const parent = "#music-player";
  return Object.freeze({
    root: parent,
    trigger: "#now-playing-area",
    handle: `${parent} .musicPlayerDragHandle`,
    close: `${parent} #music-player-close`,
    curtain: `${parent} .musicPlayerCurtain`,
    scroller: `${parent} .musicPlayerScroller`,
    slide: `${parent} .musicPlayerSlide`,
    inner: `${parent} .musicPlayerInner`,
    content: `${parent} .musicPlayerContent`,
    activeContent: `${parent} .musicPlayerPanel.active`,
    tabs: `${parent} .musicPlayerTab`,
    activeTab: `${parent} .musicPlayerTab.active`,
    tabsWrapper: `${parent} .musicPlayerTabsWrapper`,
    tabSlider: `${parent} .musicPlayerTabSlider`,
    nowPlayingTab: `${parent} .musicPlayerNowPlaying`,
    coverWrapper: `${parent} .musicPlayerCoverWrapper`,
    albumArtwork: `${parent} #music-player-cover`,
    coverGlow: `${parent} .musicPlayerCoverGlow`,
    separator: `${parent} .musicPlayerSeparator`,
    songInfo: `${parent} .musicPlayerInfo`,
    songDetails: `${parent} .musicPlayerDetails`,
    songName: `${parent} #music-player-title`,
    artistName: `${parent} #music-player-artist`,
    albumName: `${parent} #music-player-album`,
    progressSection: `${parent} .musicPlayerProgressSection`,
    progressBar: `${parent} #music-player-progress-bar`,
    progressBuffer: `${parent} #musicPlayerProgressBuffer`,
    progressFill: `${parent} #music-player-progress-fill`,
    progressThumb: `${parent} #music-player-progress-thumb`,
    timeDisplay: `${parent} .musicPlayerTimeDisplay`,
    currentTime: `${parent} #music-player-current-time`,
    totalTime: `${parent} #music-player-total-time`,
    controls: `${parent} .musicPlayerControls`,
    play: `${parent} #music-player-play`,
    previous: `${parent} #music-player-prev`,
    next: `${parent} #music-player-next`,
    reWind: `${parent} #music-player-rewind`,
    fastForward: `${parent} #music-player-forward`,
    actions: `${parent} .musicPlayerActions`,
    favoriteBtn: `${parent} #music-player-favorite`,
    queueBtn: `${parent} #music-player-queue`,
    shareBtn: `${parent} #music-player-share`,
    moreBtn: `${parent} #music-player-more`,
    shuffleBtn: `${parent} #music-player-shuffle`,
    repeatBtn: `${parent} #music-player-repeat`,
    listHeader: `${parent} .musicPlayerListHeader`,
    listTitle: `${parent} .musicPlayerListTitle`,
    listCount: `${parent} .musicPlayerListCount`,
    list: `${parent} .musicPlayerList`,
    queueList: `${parent} #music-player-queue-list`,
    queueCount: `${parent} #queue-count`,
    recentList: `${parent} #music-player-recent-list`,
    recentCount: `${parent} #recent-count`,
    empty: `${parent} .musicPlayerEmpty`,
    emptyIcon: `${parent} .musicPlayerEmptyIcon`,
    emptyText: `${parent} .musicPlayerEmptyText`,
    emptySubtext: `${parent} .musicPlayerEmptySubtext`,
    listItem: `${parent} .musicPlayerListItem`,
    listItemArt: `${parent} .musicPlayerListItemArt`,
    listItemInfo: `${parent} .musicPlayerListItemInfo`,
    listItemTitle: `${parent} .musicPlayerListItemTitle`,
    listItemArtist: `${parent} .musicPlayerListItemArtist`,
    listItemActions: `${parent} .musicPlayerListItemActions`,
    listItemAction: `${parent} .musicPlayerListItemAction`,
    classes: {
      active: 'active',
      playing: 'isPlaying',
      favorited: 'favorited',
      dragging: 'isDragging',
      hovering: 'isHovering',
      loading: 'loading'
    },
    tabs: {
      playing: 'playing',
      recent: 'recent',
      queue: 'queue'
    },
    animations: {
      backdropFadeIn: 400,
      drawerSlideUp: 500,
      fadeIn: 400,
      glowPulse: 4000,
      albumFloat: 6000,
      waveFlow: 8000,
      heartBeat: 600
    },
    skipTimes: {
      rewind: -10,
      forward: 10
    }
  });
})();

export const NAVBAR = (() => {
  const parent = "#navbar";
  return Object.freeze({
    root: parent,
    nowPlaying: `${parent} #now-playing-area`,
    albumArtwork: `${parent} .albumArtwork`,
    artistName: `${parent} .artistName`,
    songName: `${parent} .songName`,
    playIndicator: `${parent} #play-indicator`,
    previous: `${parent} #navbar-prev`,
    next: `${parent} #navbar-next`,
    playPause: `${parent} #navbar-play-pause`,
    play: `${parent} #navbar-play-icon`,
    pause: `${parent} #navbar-pause-icon`,
    menuTrigger: `${parent} #menu-trigger`,
    nextNavbar: `${parent} .next`,
  });
})();

export const MODALS = Object.freeze({
  modalClose: ".modal .close",
  dialogClose: "#search-dialog .close",
  dropdownClose: "#dropdown-menu .close",
});

export const NOTIFICATION_TYPES = Object.freeze({
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
});

export const TOAST_ICONS = {
  [NOTIFICATION_TYPES.INFO]: '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16Zm.75-11.5a.75.75 0 10-1.5 0v.5a.75.75 0 001.5 0v-.5ZM9 9.75A.75.75 0 019.75 9h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-.5A.75.75 0 019 14.25v-4.5Z"/></svg>',
  [NOTIFICATION_TYPES.SUCCESS]: '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4Z"/></svg>',
  [NOTIFICATION_TYPES.WARNING]: '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.592c.75 1.335-.212 3.009-1.743 3.009H3.482c-1.531 0-2.493-1.674-1.743-3.009L8.257 3.1ZM11 13a1 1 0 11-2 0 1 1 0 012 0Zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1Z"/></svg>',
  [NOTIFICATION_TYPES.ERROR]: '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16ZM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22Z"/></svg>',
};

export const TOAST_STYLES = {
  [NOTIFICATION_TYPES.INFO]: { base: "bg-blue-600/95 border-blue-500 text-white", bar: "bg-white/70" },
  [NOTIFICATION_TYPES.SUCCESS]: { base: "bg-emerald-600/95 border-emerald-500 text-white", bar: "bg-white/70" },
  [NOTIFICATION_TYPES.WARNING]: { base: "bg-amber-600/95 border-amber-500 text-white", bar: "bg-white/80" },
  [NOTIFICATION_TYPES.ERROR]: { base: "bg-rose-600/95 border-rose-500 text-white", bar: "bg-white/70" },
};

export const ROUTES = Object.freeze({
  HOME: "home",
  ARTIST: "artist",
  ALL_ARTISTS: "allArtists",
  SEARCH: "search",
  ALBUM: "album",
});

export const STORAGE_KEYS = Object.freeze({
  THEME_PREFERENCE: "theme-color",
  RECENT_SEARCHES: "recentSearches",
  FAVORITE_SONGS: "favoriteSongs",
  FAVORITE_ARTISTS: "favoriteArtists",
  FAVORITE_ALBUMS: "favoriteAlbums",
  RECENTLY_PLAYED: "recentlyPlayed",
  PLAYLISTS: "playlists",
  QUEUE: "queue",
});

export const AUDIO_FORMATS = Object.freeze(["mp3", "ogg", "m4a"]);

export const REPEAT_MODES = Object.freeze({
  OFF: "off",
  ALL: "all",
  ONE: "one",
});

export const $ = new Proxy({}, {
  get(_, key) {
    const id = IDS[key];
    return () => (id ? document.getElementById(id) : null);
  },
});

export function $byId(id) {
  return document.getElementById(id);
}

export function $bySelector(selector) {
  return document.querySelector(selector);
}

export function $allBySelector(selector) {
  return document.querySelectorAll(selector);
}

export function $inContext(contextId, elementClass) {
  const context = document.getElementById(contextId);
  return context ? context.querySelector(`.${elementClass}`) : null;
}

export const getElement = (id) => document.getElementById(id);
export const getElements = (selector) => document.querySelectorAll(selector);
export const getElementInContext = (contextSelector, elementSelector) => {
  const context = document.querySelector(contextSelector);
  return context ? context.querySelector(elementSelector) : null;
};

export const injectIcons = () => {
  const iconElements = document.querySelectorAll('[data-icon]');
  iconElements.forEach(element => {
    const iconName = element.getAttribute('data-icon');
    if (ICONS[iconName]) {
      element.innerHTML = ICONS[iconName];
      if (!element.classList.contains('icon')) {
        element.classList.add('icon');
      }
    }
  });
};

if (typeof window !== 'undefined') {
  window.DOM = DOM;
  window.QUERY = QUERY;
  window.QUERY_ALL = QUERY_ALL;
  window.clearElementCache = clearElementCache;
  window.IDS = IDS;
  window.CLASSES = CLASSES;
  window.MUSIC_PLAYER = MUSIC_PLAYER;
  window.NAVBAR = NAVBAR;
  window.MODALS = MODALS;
  window.ROUTES = ROUTES;
  window.THEMES = THEMES;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.ICONS = ICONS;
  window.AUDIO_FORMATS = AUDIO_FORMATS;
  window.REPEAT_MODES = REPEAT_MODES;
  window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
  window.TOAST_ICONS = TOAST_ICONS;
  window.TOAST_STYLES = TOAST_STYLES;
  window.$ = $;
  window.$byId = $byId;
  window.$bySelector = $bySelector;
  window.$allBySelector = $allBySelector;
  window.$inContext = $inContext;
  window.getElement = getElement;
  window.getElements = getElements;
  window.getElementInContext = getElementInContext;
  window.injectIcons = injectIcons;
}

document.addEventListener('DOMContentLoaded', injectIcons);