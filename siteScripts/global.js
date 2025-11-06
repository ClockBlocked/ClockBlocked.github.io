/**
 * ═══════════════════════════════════════════════════════════════
 *  MYBEATS - ELEMENT REGISTRY & CONSTANTS
 * ═══════════════════════════════════════════════════════════════
 */

const elementCache = new Map();

const DOM = new Proxy({}, {
  get(target, key) {
    if (elementCache.has(key)) {
      return elementCache.get(key);
    }
    
    const actualId = IDS[key] || key;
    const element = document.getElementById(actualId);
    
    if (element) {
      elementCache.set(key, element);
      return element;
    }
    
    console.warn(`Element not found: #${actualId}`);
    return null;
  }
});

const QUERY = (selector) => document.querySelector(selector);
const QUERY_ALL = (selector) => document.querySelectorAll(selector);

function clearElementCache() {
  elementCache.clear();
  console.log('🗑️ Element cache cleared');
}

// ═══════════════════════════════════════════════════════════════
//  GLOBAL ELEMENT IDS (NOT in drawer/navbar)
// ═══════════════════════════════════════════════════════════════

const IDS = Object.freeze({
  // Theme & Search
  themeToggle: "theme-toggle",
  globalSearchTrigger: "global-search-trigger",
  searchDialog: "search-dialog",
  globalSearchForm: "global-search-form",
  globalSearchInput: "global-search-input",
  recentSearchesList: "recent-searches-list",
  
  // Modals & Overlays
  popoverPortal: "popover-portal",
  searchModal: "searchModal",
  searchInput: "searchInput",
  clearSearch: "clearSearch",
  closeSearch: "closeSearch",
  searchResults: "searchResults",
  recentSearches: "recentSearches",
  recentSearchList: "recentSearchList",
  clearRecentBtn: "clearRecentBtn",
  recentSearchesEmpty: "recentSearchesEmpty",
  searchResultsContent: "searchResultsContent",
  songsResults: "songsResults",
  songsList: "songsList",
  artistsResults: "artistsResults",
  artistsList: "artistsList",
  albumsResults: "albumsResults",
  albumsList: "albumsList",
  noResults: "noResults",
  searchLoading: "searchLoading",
  
  // Dropdown Menu
  willHideMenu: "will-hide-menu",
  menuTrigger: "menu-trigger",
  dropdownMenu: "dropdown-menu",
  dropdownClose: "dropdown-close",
  
  // Menu Items
  favoriteSongs: "favorite-songs",
  favoriteArtists: "favorite-artists",
  favoriteAlbums: "favorite-albums",
  createPlaylist: "create-playlist",
  favoriteSongsCount: "favorite-songs-count",
  favoriteArtistsCount: "favorite-artists-count",
  recentlyPlayed: "recently-played",
  queueView: "queue-view",
  shuffleAll: "shuffle-all",
  appSettings: "app-settings",
  aboutApp: "about-app",
  searchTrigger: "searchTrigger",
  
  // Content Sections
  dynamicContent: "dynamic-content",
  contentLoading: "content-loading",
  albumsContainer: "albumWrapper",
  artistsGrid: "artists-grid",
  artistSearch: "artist-search",
  genreFilters: "genre-filters",
  featuredArtists: "featured-artists",
  
  // Page Structure
  pageWrapper: "pageWrapper",
  mainArea: "mainArea",
  mainContainer: "main-container",
  contentWrapper: "contentWrapper",
  
  // PWA
  pwaInstallBanner: "pwa-install-banner",
  pwaDownloadLink: "pwa-download-link",
  pwaDismiss: "pwa-dismiss",
  
  // Sections
  recentlyPlayedSection: "recently-played-section",
  randomAlbumsSection: "random-albums-section",
  favoriteArtistsSection: "favorite-artists-section",
  playlistsSection: "playlists-section",
  favoriteSongsSection: "favorite-songs-section",
});

// ═══════════════════════════════════════════════════════════════
//  MUSIC PLAYER (Drawer) - Selector-based
// ═══════════════════════════════════════════════════════════════

const MUSIC_PLAYER = (() => {
  const parent = "#drawer";
  return Object.freeze({
    root: parent,
    handle: `${parent} .musicPlayerDragHandle`,
    close: `${parent} #closeBtn`,
    curtain: `${parent} .musicPlayerCurtain`,
    scroller: `${parent} .drawerScroller`,
    slide: `${parent} .drawerSlide`,
    inner: `${parent} .drawerInner`,
    content: `${parent} .drawerContent`,
    activeContent: `${parent} .musicPlayerPanel.active`,
    
    // Tabs
    tabs: `${parent} .musicPlayerTab`,
    activeTab: `${parent} .musicPlayerTab.active`,
    tabsWrapper: `${parent} .musicPlayerTabsWrapper`,
    tabSlider: `${parent} .musicPlayerTabSlider`,
    tabsContainer: `${parent} .tabsContainer`,
    
    // Now Playing
    nowPlaying: `${parent} .musicPlayerNowPlaying`,
    coverWrapper: `${parent} .musicPlayerCoverWrapper`,
    albumArtwork: `${parent} #cover`,
    coverGlow: `${parent} .musicPlayerCoverGlow`,
    separator: `${parent} .musicPlayerSeparator`,
    
    // Song Info
    songInfo: `${parent} .musicPlayerInfo`,
    songDetails: `${parent} .musicPlayerDetails`,
    songName: `${parent} #title`,
    artistName: `${parent} #artist`,
    albumName: `${parent} #album`,
    
    // Progress
    progressSection: `${parent} .musicPlayerProgressSection`,
    progressBar: `${parent} #progressBar`,
    progressBuffer: `${parent} #progressBuffer`,
    progressFill: `${parent} #progressFill`,
    progressThumb: `${parent} #progressThumb`,
    timeDisplay: `${parent} .musicPlayerTimeDisplay`,
    currentTime: `${parent} #currentTime`,
    totalTime: `${parent} #totalTime`,
    
    // Controls
    controls: `${parent} .musicPlayerControls`,
    play: `${parent} #playBtn`,
    previous: `${parent} #prevBtn`,
    next: `${parent} #nextBtn`,
    reWind: `${parent} #rewindBtn`,
    fastForward: `${parent} #forwardBtn`,
    
    // Actions
    actions: `${parent} .musicPlayerActions`,
    favoriteBtn: `${parent} #favoriteBtn`,
    queueBtn: `${parent} #queueBtn`,
    shareBtn: `${parent} #shareBtn`,
    moreBtn: `${parent} #moreBtn`,
    
    // Lists
    listHeader: `${parent} .musicPlayerListHeader`,
    listTitle: `${parent} .musicPlayerListTitle`,
    listCount: `${parent} .musicPlayerListCount`,
    list: `${parent} .musicPlayerList`,
    queueList: `${parent} #queueList`,
    recentList: `${parent} #recentList`,
    
    // Empty States
    empty: `${parent} .musicPlayerEmpty`,
    emptyIcon: `${parent} .musicPlayerEmptyIcon`,
    emptyText: `${parent} .musicPlayerEmptyText`,
    emptySubtext: `${parent} .musicPlayerEmptySubtext`,
    
    // List Items
    listItem: `${parent} .musicPlayerListItem`,
    listItemArt: `${parent} .musicPlayerListItemArt`,
    listItemInfo: `${parent} .musicPlayerListItemInfo`,
    listItemTitle: `${parent} .musicPlayerListItemTitle`,
    listItemArtist: `${parent} .musicPlayerListItemArtist`,
    listItemActions: `${parent} .musicPlayerListItemActions`,
    listItemAction: `${parent} .musicPlayerListItemAction`,
    
    // Classes (state modifiers)
    classes: {
      active: 'active',
      playing: 'isPlaying',
      favorited: 'favorited',
      dragging: 'isDragging',
      hovering: 'isHovering',
      loading: 'loading'
    },
    
    // Tab names
    tabs: {
      playing: 'playing',
      recent: 'recent',
      queue: 'queue'
    },
    
    // Animation durations
    animations: {
      backdropFadeIn: 400,
      drawerSlideUp: 500,
      fadeIn: 400,
      glowPulse: 4000,
      albumFloat: 6000,
      waveFlow: 8000,
      heartBeat: 600
    },
    
    // Skip times
    skipTimes: {
      rewind: -10,
      forward: 10
    }
  });
})();

// ═══════════════════════════════════════════════════════════════
//  NAVBAR - Selector-based
// ═══════════════════════════════════════════════════════════════

const NAVBAR = (() => {
  const parent = "#navbar";
  return Object.freeze({
    root: parent,
    content: `${parent} .navbar-content`,
    left: `${parent} .navbar-left`,
    center: `${parent} .navbar-center`,
    right: `${parent} .navbar-right`,
    
    // Now Playing Area
    nowPlaying: `${parent} #now-playing-area`,
    nowPlayingDiv: `${parent} .nowPlaying`,
    albumArtwork: `${parent} .albumArtwork`,
    songInfo: `${parent} .songInfo`,
    artistName: `${parent} .artistName`,
    songName: `${parent} .songName`,
    playIndicator: `${parent} #play-indicator`,
    
    // Controls
    navControls: `${parent} .nav-controls`,
    previous: `${parent} .previous`,
    next: `${parent} .next`,
    playPause: `${parent} .playPause`,
    play: `${parent} #play-icon-navbar`,
    pause: `${parent} #pause-icon-navbar`,
    
    // Menu
    menuTrigger: `${parent} #menu-trigger`,
  });
})();

// ═══════════════════════════════════════════════════════════════
//  MODAL SELECTORS
// ═══════════════════════════════════════════════════════════════

const MODALS = Object.freeze({
  modalClose: ".modal .close",
  dialogClose: "#search-dialog .close",
  dropdownClose: "#dropdown-menu .close",
});

// ═══════════════════════════════════════════════════════════════
//  CSS CLASSES
// ═══════════════════════════════════════════════════════════════

const CLASSES = Object.freeze({
  hidden: "hidden",
  show: "show",
  active: "active",
  playing: "playing",
  loading: "loading",
  hasSong: "has-song",
  marquee: "marquee",
  repeatOne: "repeat-one",
  light: "light",
  medium: "medium",
  searchDialogOpening: "search-dialog-opening",
  searchDialogClosing: "search-dialog-closing",
  animateRotate: "animate__animated animate__rotateIn",
  animateFadeIn: "animate__animated animate__fadeIn",
  animateZoomIn: "animate__animated animate__zoomIn",
  animatePulse: "animate__animated animate__pulse",
  imageFallback: "image-fallback",
  imageLoaded: "image-loaded",
  imageError: "image-error",
  imageLoading: "image-loading",
});

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════

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

const ICONS = Object.freeze({
  dark: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 116.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>',
  medium: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L13 9h7l-5.5 4 2 7L10 16l-6.5 4 2-7L1 9h7l2-7z"/></svg>',
  light: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" /></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"/></svg>',
  pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm192-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"/></svg>',
  next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/></svg>',
  prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',
  shuffle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
  repeat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  rewind: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/></svg>',
  forward: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 256C512 273.7 502.6 289.7 487.5 298.1L199.5 473.9C184.4 482.4 165.8 482 151 473.5C136.1 464.1 128 448.1 128 431.1V335.1L23.01 407.8C7.878 416.3-10.74 415.9-25.56 407.5C-40.41 398.1-48 383.1-48 365.1V146.9c0-17.1 8.406-33.03 23.25-41.53c14.82-8.406 33.43-8.031 48.56 .4688l104.1 72.76V79.1c0-17.1 8.406-33.03 23.25-41.53c14.82-8.406 33.43-8.031 48.56 .4688l287.1 175.9C503.4 222.3 512 238.3 512 255.1L512 256z"/></svg>',
  queue: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>',
  share: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>',
  more: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/></svg>'  
});

const TOAST_STYLES = {
  [NOTIFICATION_TYPES.INFO]: { base: "bg-blue-600/95 border-blue-500 text-white", bar: "bg-white/70" },
  [NOTIFICATION_TYPES.SUCCESS]: { base: "bg-emerald-600/95 border-emerald-500 text-white", bar: "bg-white/70" },
  [NOTIFICATION_TYPES.WARNING]: { base: "bg-amber-600/95 border-amber-500 text-white", bar: "bg-white/80" },
  [NOTIFICATION_TYPES.ERROR]: { base: "bg-rose-600/95 border-rose-500 text-white", bar: "bg-white/70" },
};

// ═══════════════════════════════════════════════════════════════
//  LEGACY HELPERS (backwards compatibility)
// ═══════════════════════════════════════════════════════════════

const $ = new Proxy({}, {
  get(_, key) {
    const id = IDS[key];
    return () => (id ? document.getElementById(id) : null);
  },
});

function $byId(id) {
  return document.getElementById(id);
}

function $bySelector(selector) {
  return document.querySelector(selector);
}

function $allBySelector(selector) {
  return document.querySelectorAll(selector);
}

function $inContext(contextId, elementClass) {
  const context = document.getElementById(contextId);
  return context ? context.querySelector(`.${elementClass}`) : null;
}

const getElement = (id) => document.getElementById(id);
const getElements = (selector) => document.querySelectorAll(selector);
const getElementInContext = (contextSelector, elementSelector) => {
  const context = document.querySelector(contextSelector);
  return context ? context.querySelector(elementSelector) : null;
};

const injectIcons = () => {
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

// ═══════════════════════════════════════════════════════════════
//  GLOBAL WINDOW EXPORTS
// ═══════════════════════════════════════════════════════════════

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
        
//      setTimeout(() => input.focus(), 100);
        
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

const musicPlayer = {
  mainPlayer: {
    get drawer() {
      return DOM.drawer || document.getElementById('drawer');
    },
    
    isOpen() {
      const drawer = this.drawer;
      if (!drawer) {
        return false;
      }
      return drawer.matches(':popover-open');
    },
    
    open() {
      const drawer = this.drawer;
      if (!drawer) {
        return false;
      }
      
      try {
        if (!this.isOpen()) {
          drawer.showPopover();
          return true;
        } else {
          return true;
        }
      } catch (error) {
        return false;
      }
    },
    
    close() {
      const drawer = this.drawer;
      if (!drawer) {
        return false;
      }
      
      try {
        if (this.isOpen()) {
          drawer.hidePopover();
          return true;
        } else {
          return true;
        }
      } catch (error) {
        return false;
      }
    },
    
    toggle() {
      if (this.isOpen()) {
        return this.close();
      } else {
        return this.open();
      }
    },
    
    switchTab(tabName) {
      const allTabs = QUERY_ALL(MUSIC_PLAYER.tabs);
      const allContent = QUERY_ALL('.musicPlayerPanel[data-tab]');
      
      allTabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
          tab.classList.add(CLASSES.active);
        } else {
          tab.classList.remove(CLASSES.active);
        }
      });
      
      allContent.forEach(content => {
        if (content.dataset.tab === tabName) {
          content.classList.add(CLASSES.active);
        } else {
          content.classList.remove(CLASSES.active);
        }
      });
    },
  },

  playback: {
    play() {
      if (!appState.currentSong) {
        return;
      }
      
      if (!appState.audio) {
        appState.audio = new Audio();
        musicPlayer.setupAudioListeners();
      }
      
      if (appState.audio.paused) {
        appState.audio.play()
          .then(() => {
            appState.isPlaying = true;
            musicPlayer.ui.updatePlayButton();
          })
          .catch(error => {
            musicPlayer.ui.showNotification('Playback failed', NOTIFICATION_TYPES.ERROR);
          });
      }
    },
    
    pause() {
      if (appState.audio && !appState.audio.paused) {
        appState.audio.pause();
        appState.isPlaying = false;
        musicPlayer.ui.updatePlayButton();
      }
    },
    
    togglePlayPause() {
      if (!appState.currentSong) {
        return;
      }
      
      if (appState.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    },
    
    previous() {
      const queue = appState.queue || [];
      const currentIndex = queue.findIndex(song => song.id === appState.currentSong?.id);
      
      if (currentIndex > 0) {
        const prevSong = queue[currentIndex - 1];
        musicPlayer.loadSong(prevSong);
      } else if (appState.audio && appState.audio.currentTime > 3) {
        appState.audio.currentTime = 0;
      }
    },
    
    next() {
      const queue = appState.queue || [];
      const currentIndex = queue.findIndex(song => song.id === appState.currentSong?.id);
      
      if (currentIndex < queue.length - 1) {
        const nextSong = queue[currentIndex + 1];
        musicPlayer.loadSong(nextSong);
      } else if (appState.repeatMode === REPEAT_MODES.ALL && queue.length > 0) {
        musicPlayer.loadSong(queue[0]);
      } else {
        this.pause();
      }
    },
    
    skip(seconds) {
      if (!appState.audio) {
        return;
      }
      
      const newTime = appState.audio.currentTime + seconds;
      appState.audio.currentTime = Math.max(0, Math.min(newTime, appState.audio.duration || 0));
    },
    
    seekTo(time) {
      if (!appState.audio) {
        return;
      }
      
      appState.audio.currentTime = Math.max(0, Math.min(time, appState.audio.duration || 0));
    },
    
    shuffle: {
      toggle() {
        appState.isShuffle = !appState.isShuffle;
        const shuffleBtn = document.getElementById('shuffleBtn');
        if (shuffleBtn) {
          shuffleBtn.classList.toggle(CLASSES.active, appState.isShuffle);
        }
        
        if (appState.isShuffle && appState.queue) {
          appState.queue = utils.shuffleArray([...appState.queue]);
        }
      },
      
      all() {
        if (!window.music?.getAllSongs) {
          return;
        }
        
        const allSongs = window.music.getAllSongs();
        if (allSongs.length === 0) {
          return;
        }
        
        appState.queue = utils.shuffleArray([...allSongs]);
        appState.isShuffle = true;
        
        const shuffleBtn = document.getElementById('shuffleBtn');
        if (shuffleBtn) {
          shuffleBtn.classList.add(CLASSES.active);
        }
        
        if (appState.queue.length > 0) {
          musicPlayer.loadSong(appState.queue[0]);
        }
      }
    },
    
    repeat: {
      toggle() {
        const modes = Object.values(REPEAT_MODES);
        const currentIndex = modes.indexOf(appState.repeatMode);
        appState.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        const repeatBtn = document.getElementById('repeatBtn');
        if (repeatBtn) {
          repeatBtn.classList.toggle(CLASSES.repeatOne, appState.repeatMode === REPEAT_MODES.ONE);
          repeatBtn.classList.toggle(CLASSES.active, appState.repeatMode !== REPEAT_MODES.OFF);
        }
      }
    },
  },

  ui: {
    updatePlayButton() {
      const playBtns = [
        QUERY(MUSIC_PLAYER.play),
        QUERY(NAVBAR.playPause)
      ].filter(Boolean);
      
      playBtns.forEach(btn => {
        const playIcon = btn.querySelector('.play');
        const pauseIcon = btn.querySelector('.pause');
        
        if (appState.isPlaying) {
          if (playIcon) playIcon.classList.add(CLASSES.hidden);
          if (pauseIcon) pauseIcon.classList.remove(CLASSES.hidden);
        } else {
          if (playIcon) playIcon.classList.remove(CLASSES.hidden);
          if (pauseIcon) pauseIcon.classList.add(CLASSES.hidden);
        }
      });
      
      const navbarPlayIcon = QUERY(NAVBAR.play);
      const navbarPauseIcon = QUERY(NAVBAR.pause);
      
      if (appState.isPlaying) {
        if (navbarPlayIcon) navbarPlayIcon.classList.add(CLASSES.hidden);
        if (navbarPauseIcon) navbarPauseIcon.classList.remove(CLASSES.hidden);
      } else {
        if (navbarPlayIcon) navbarPlayIcon.classList.remove(CLASSES.hidden);
        if (navbarPauseIcon) navbarPauseIcon.classList.add(CLASSES.hidden);
      }
    },
    
    updateFavoriteButton() {
      const favoriteBtn = QUERY(MUSIC_PLAYER.favoriteBtn);
      if (!favoriteBtn || !appState.currentSong) return;
      
      const favorites = appState.favorites?.songs || [];
      const isFavorited = favorites.some(song => song.id === appState.currentSong.id);
      
      favoriteBtn.classList.toggle(MUSIC_PLAYER.classes.favorited, isFavorited);
      favoriteBtn.setAttribute('aria-pressed', isFavorited);
      favoriteBtn.title = isFavorited ? 'Remove from favorites' : 'Add to favorites';
    },
    
    updateProgress() {
      if (!appState.audio || !appState.duration) return;
      
      const currentTime = appState.audio.currentTime || 0;
      const duration = appState.duration || 0;
      const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      const progressFill = QUERY(MUSIC_PLAYER.progressFill);
      const progressThumb = QUERY(MUSIC_PLAYER.progressThumb);
      const currentTimeEl = QUERY(MUSIC_PLAYER.currentTime);
      
      if (progressFill) {
        progressFill.style.width = `${percent}%`;
      }
      
      if (progressThumb) {
        progressThumb.style.left = `${percent}%`;
      }
      
      if (currentTimeEl && window.utils?.formatTime) {
        currentTimeEl.textContent = window.utils.formatTime(currentTime);
      }
      
      if (window.mediaSession?.setPositionState && duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: appState.audio.playbackRate || 1,
            position: currentTime
          });
        } catch (error) {
        }
      }
    },
    
    showNotification(message, type = NOTIFICATION_TYPES.INFO) {
      if (!window.ui?.showNotification) {
        return;
      }
      
      window.ui.showNotification(message, type);
    },
    
    updateNowPlaying(song) {
      if (!song) {
        return;
      }
      
      const coverEl = QUERY(MUSIC_PLAYER.albumArtwork);
      const titleEl = QUERY(MUSIC_PLAYER.songName);
      const artistEl = QUERY(MUSIC_PLAYER.artistName);
      const albumEl = QUERY(MUSIC_PLAYER.albumName);
      
      if (coverEl) {
        coverEl.src = song.albumArt || song.cover || '';
        coverEl.alt = `${song.album || 'Album'} cover`;
      }
      if (titleEl) titleEl.textContent = song.title || 'Unknown Title';
      if (artistEl) artistEl.textContent = song.artist || 'Unknown Artist';
      if (albumEl) albumEl.textContent = song.album || 'Unknown Album';
      
      const navCover = QUERY(NAVBAR.albumArtwork);
      const navTitle = QUERY(NAVBAR.songName);
      const navArtist = QUERY(NAVBAR.artistName);
      
      if (navCover) {
        const imgTag = navCover.querySelector('img');
        const svgTag = navCover.querySelector('svg');
        
        if (song.albumArt || song.cover) {
          if (imgTag) {
            imgTag.src = song.albumArt || song.cover;
            imgTag.style.opacity = '1';
          }
          if (svgTag) {
            svgTag.style.opacity = '0';
          }
        } else {
          if (imgTag) imgTag.style.opacity = '0';
          if (svgTag) svgTag.style.opacity = '1';
        }
      }
      
      if (navTitle) navTitle.textContent = song.title || 'No song playing';
      if (navArtist) navArtist.textContent = song.artist || 'Select a song to get started';
      
      const navbar = QUERY(NAVBAR.root);
      if (navbar) {
        navbar.classList.add(CLASSES.hasSong);
      }
      
      this.updateFavoriteButton();
    },
    


initialize() {
  this.updatePlayButton();
  this.updateFavoriteButton();
  
  const progressBar = QUERY(MUSIC_PLAYER.progressBar);
  if (progressBar) {
    this.setupProgressBar(progressBar);
  }
},

setupProgressBar(progressBar) {
  let isDragging = false;
  
  const handleProgressClick = (e) => {
    if (!appState.audio || !appState.duration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * appState.duration;
    
    if (!isNaN(newTime) && isFinite(newTime)) {
      musicPlayer.playback.seekTo(newTime);
    }
  };
  
  const startDrag = (e) => {
    if (!appState.currentSong) return;
    isDragging = true;
    progressBar.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };
  
  const onDrag = (e) => {
    if (!isDragging || !appState.audio || !appState.duration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * appState.duration;
    
    if (!isNaN(newTime) && isFinite(newTime)) {
      musicPlayer.playback.seekTo(newTime);
    }
  };
  
  const endDrag = () => {
    isDragging = false;
    progressBar.classList.remove('is-dragging');
    document.body.style.userSelect = '';
  };
  
  progressBar.addEventListener('click', handleProgressClick);
  progressBar.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
},
  },

  loadSong(song) {
    if (!song) {
      return;
    }
    
    appState.currentSong = song;
    this.ui.updateNowPlaying(song);
    
    if (!appState.audio) {
      appState.audio = new Audio();
      this.setupAudioListeners();
    }
    
    const audioUrl = song.audioUrl || song.src || song.url;
    if (!audioUrl) {
      this.ui.showNotification('No audio file found', NOTIFICATION_TYPES.ERROR);
      return;
    }
    
    appState.audio.src = audioUrl;
    appState.audio.load();
    
    const recentlyPlayed = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED) || '[]');
    const filtered = recentlyPlayed.filter(s => s.id !== song.id);
    filtered.unshift(song);
    localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(filtered.slice(0, 50)));
    
    this.playback.play();
    
    if (!this.mainPlayer.isOpen()) {
      this.mainPlayer.open();
    }
    
    if (window.mediaSession) {
      this.updateMediaSession(song);
    }
  },

  setupAudioListeners() {
    if (!appState.audio) return;
    
    appState.audio.addEventListener('loadedmetadata', () => {
      appState.duration = appState.audio.duration;
      const totalEl = QUERY(MUSIC_PLAYER.totalTime);
      if (totalEl && window.utils?.formatTime) {
        totalEl.textContent = window.utils.formatTime(appState.duration);
      }
    });
    
    appState.audio.addEventListener('timeupdate', () => {
      this.ui.updateProgress();
    });
    
    appState.audio.addEventListener('ended', () => {
      if (appState.repeatMode === REPEAT_MODES.ONE) {
        appState.audio.currentTime = 0;
        this.playback.play();
      } else {
        this.playback.next();
      }
    });
    
    appState.audio.addEventListener('play', () => {
      appState.isPlaying = true;
      this.ui.updatePlayButton();
      
      const playIndicator = QUERY(NAVBAR.playIndicator);
      if (playIndicator) {
        playIndicator.classList.add(CLASSES.playing);
      }
    });
    
    appState.audio.addEventListener('pause', () => {
      appState.isPlaying = false;
      this.ui.updatePlayButton();
      
      const playIndicator = QUERY(NAVBAR.playIndicator);
      if (playIndicator) {
        playIndicator.classList.remove(CLASSES.playing);
      }
    });
    
    appState.audio.addEventListener('error', (e) => {
      this.ui.showNotification('Failed to load audio', NOTIFICATION_TYPES.ERROR);
    });
    
    appState.audio.addEventListener('waiting', () => {
    });
    
    appState.audio.addEventListener('canplay', () => {
    });
    
    appState.audio.addEventListener('volumechange', () => {
    });
    
    appState.audio.addEventListener('progress', () => {
      if (appState.audio.buffered.length > 0) {
        const buffered = appState.audio.buffered.end(appState.audio.buffered.length - 1);
        const duration = appState.audio.duration;
        if (duration > 0) {
          const bufferPercent = (buffered / duration) * 100;
          const progressBuffer = QUERY(MUSIC_PLAYER.progressBuffer);
          if (progressBuffer) {
            progressBuffer.style.width = `${bufferPercent}%`;
          }
        }
      }
    });
  },

  updateMediaSession(song) {
    if (!('mediaSession' in navigator)) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title || 'Unknown Title',
      artist: song.artist || 'Unknown Artist',
      album: song.album || 'Unknown Album',
      artwork: [
        { src: song.albumArt || song.cover || '', sizes: '96x96', type: 'image/jpeg' },
        { src: song.albumArt || song.cover || '', sizes: '128x128', type: 'image/jpeg' },
        { src: song.albumArt || song.cover || '', sizes: '192x192', type: 'image/jpeg' },
        { src: song.albumArt || song.cover || '', sizes: '256x256', type: 'image/jpeg' },
        { src: song.albumArt || song.cover || '', sizes: '384x384', type: 'image/jpeg' },
        { src: song.albumArt || song.cover || '', sizes: '512x512', type: 'image/jpeg' }
      ]
    });
    
    navigator.mediaSession.setActionHandler('play', () => this.playback.play());
    navigator.mediaSession.setActionHandler('pause', () => this.playback.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.playback.previous());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.playback.next());
    navigator.mediaSession.setActionHandler('seekbackward', () => this.playback.skip(-10));
    navigator.mediaSession.setActionHandler('seekforward', () => this.playback.skip(10));
    
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== null) {
          this.playback.seekTo(details.seekTime);
        }
      });
    } catch (error) {
    }
  },

  updateQueue(songs) {
    if (!Array.isArray(songs)) {
      return;
    }
    
    appState.queue = [...songs];
    this.renderQueue();
  },

  addToQueue(song) {
    if (!song) {
      return;
    }
    
    if (!appState.queue) {
      appState.queue = [];
    }
    
    appState.queue.push(song);
    this.renderQueue();
    this.ui.showNotification(`Added "${song.title}" to queue`, NOTIFICATION_TYPES.SUCCESS);
  },

  removeFromQueue(index) {
    if (!appState.queue || index < 0 || index >= appState.queue.length) {
      return;
    }
    
    const removed = appState.queue.splice(index, 1)[0];
    this.renderQueue();
    this.ui.showNotification(`Removed "${removed.title}" from queue`, NOTIFICATION_TYPES.INFO);
  },

  clearQueue() {
    appState.queue = [];
    this.renderQueue();
    this.ui.showNotification('Queue cleared', NOTIFICATION_TYPES.INFO);
  },

  renderQueue() {
    const queueList = QUERY(MUSIC_PLAYER.queueList);
    const queueCountEl = document.getElementById('queueCount');
    
    if (!queueList) {
      return;
    }
    
    const queue = appState.queue || [];
    
    if (queueCountEl) {
      queueCountEl.textContent = queue.length;
    }
    
    if (queue.length === 0) {
      queueList.innerHTML = `
        <div class="empty">
          <div class="emptyIcon">
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div class="emptyText">Queue is empty.</div>
        </div>
      `;
      return;
    }
    
    queueList.innerHTML = queue.map((song, index) => `
      <li class="musicPlayerListItem ${song.id === appState.currentSong?.id ? 'active' : ''}" data-song-id="${song.id}" data-index="${index}">
        <div class="musicPlayerListItemArt">
          <img src="${song.albumArt || song.cover || ''}" alt="${song.album || 'Album'} cover" />
        </div>
        <div class="musicPlayerListItemInfo">
          <div class="musicPlayerListItemTitle">${song.title || 'Unknown Title'}</div>
          <div class="musicPlayerListItemArtist">${song.artist || 'Unknown Artist'}</div>
        </div>
        <div class="musicPlayerListItemActions">
          <button class="musicPlayerListItemAction play-song" data-index="${index}" title="Play">
            <span data-icon="play" class="icon"></span>
          </button>
          <button class="musicPlayerListItemAction remove-from-queue" data-index="${index}" title="Remove">
            <span data-icon="close" class="icon"></span>
          </button>
        </div>
      </li>
    `).join('');
    
    if (window.injectIcons) {
      window.injectIcons();
    }
    
    queueList.querySelectorAll('.play-song').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        if (queue[index]) {
          musicPlayer.loadSong(queue[index]);
        }
      });
    });
    
    queueList.querySelectorAll('.remove-from-queue').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        musicPlayer.removeFromQueue(index);
      });
    });
    
    queueList.querySelectorAll('.musicPlayerListItem').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const index = parseInt(item.dataset.index);
          if (queue[index]) {
            musicPlayer.loadSong(queue[index]);
          }
        }
      });
    });
  },

  renderRecentlyPlayed() {
    const recentList = QUERY(MUSIC_PLAYER.recentList);
    
    if (!recentList) {
      return;
    }
    
    const recent = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED) || '[]');
    
    if (recent.length === 0) {
      recentList.innerHTML = `
        <div class="empty">
          <div class="emptyIcon">
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div class="emptyText">No recently played songs.</div>
        </div>
      `;
      return;
    }
    
    recentList.innerHTML = recent.slice(0, 20).map((song) => `
      <li class="musicPlayerListItem ${song.id === appState.currentSong?.id ? 'active' : ''}" data-song-id="${song.id}">
        <div class="musicPlayerListItemArt">
          <img src="${song.albumArt || song.cover || ''}" alt="${song.album || 'Album'} cover" />
        </div>
        <div class="musicPlayerListItemInfo">
          <div class="musicPlayerListItemTitle">${song.title || 'Unknown Title'}</div>
          <div class="musicPlayerListItemArtist">${song.artist || 'Unknown Artist'}</div>
        </div>
        <div class="musicPlayerListItemActions">
          <button class="musicPlayerListItemAction play-recent" data-song='${JSON.stringify(song).replace(/'/g, "&apos;")}' title="Play">
            <span data-icon="play" class="icon"></span>
          </button>
        </div>
      </li>
    `).join('');
    
    if (window.injectIcons) {
      window.injectIcons();
    }
    
    recentList.querySelectorAll('.play-recent').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
          const song = JSON.parse(btn.dataset.song);
          musicPlayer.loadSong(song);
        } catch (error) {
        }
      });
    });
    
    recentList.querySelectorAll('.musicPlayerListItem').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          try {
            const btn = item.querySelector('.play-recent');
            const song = JSON.parse(btn.dataset.song);
            musicPlayer.loadSong(song);
          } catch (error) {
          }
        }
      });
    });
  },


init() {
  this.renderQueue();
  this.renderRecentlyPlayed();
  
  const tabs = QUERY_ALL(MUSIC_PLAYER.tabs);
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      if (tabName) {
        this.mainPlayer.switchTab(tabName);
        
        if (tabName === 'playlist') {
          this.renderRecentlyPlayed();
        } else if (tabName === 'queue') {
          this.renderQueue();
        }
      }
    });
  });
  
  const closeBtn = QUERY(MUSIC_PLAYER.close);
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      this.mainPlayer.close();
    });
  }
  
  const curtain = QUERY(MUSIC_PLAYER.curtain);
  if (curtain) {
    curtain.addEventListener('click', () => {
      this.mainPlayer.close();
    });
  }
},
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





const app = {
    initialize: function() {
        window.music = music;

        storage.initialize();
        notifications.initialize();
        
        musicPlayer.init();

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
            playSong: musicPlayer.loadSong.bind(musicPlayer),
            toggle: musicPlayer.mainPlayer.toggle.bind(musicPlayer.mainPlayer),
            next: musicPlayer.playback.next.bind(musicPlayer.playback),
            previous: musicPlayer.playback.previous.bind(musicPlayer.playback),
            seekTo: musicPlayer.playback.seekTo.bind(musicPlayer.playback),
            skip: musicPlayer.playback.skip.bind(musicPlayer.playback),
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
        window.musicPlayer = musicPlayer;
    },

    goHome: function() {
        if (appState.router) {
            appState.router.navigateTo(ROUTES.HOME);
        }
    }
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
    eventHandlers.bindKeyboard();
    eventHandlers.bindDocument();
  },

  bindControls: () => {
    const nowPlayingTriggers = [DOM.nowPlayingArea, QUERY(NAVBAR.nowPlaying)].filter(Boolean);
    nowPlayingTriggers.forEach(el => bindClick(el, () => musicPlayer.mainPlayer.toggle()));
    
    const navbarPlayPause = QUERY(NAVBAR.playPause);
    if (navbarPlayPause) bindClick(navbarPlayPause, () => musicPlayer.playback.togglePlayPause());
    
    const navbarPrevious = QUERY(NAVBAR.previous);
    if (navbarPrevious) bindClick(navbarPrevious, () => musicPlayer.playback.previous());
    
    const navbarNext = QUERY(NAVBAR.next);
    if (navbarNext) bindClick(navbarNext, () => musicPlayer.playback.next());
  },

  bindMenus: () => {
    const menuElements = {
      menuTrigger: dropdown.toggle,
      dropdownClose: dropdown.close,
      willHideMenu: dropdown.close,
    };
    
    Object.entries(menuElements).forEach(([elementId, handler]) => {
      if (DOM[elementId]) bindClick(DOM[elementId], handler);
    });
    
    const menuActions = {
      favoriteSongs: () => {
        dropdown.close();
        views.showFavoriteSongs();
      },
      favoriteArtists: () => {
        dropdown.close();
        views.showFavoriteArtists();
      },
      favoriteAlbums: () => {
        dropdown.close();
        views.showFavoriteAlbums();
      },
      recentlyPlayed: () => {
        dropdown.close();
        musicPlayer.mainPlayer.open();
        setTimeout(() => musicPlayer.mainPlayer.switchTab("playlist"), 50);
      },
      queueView: () => {
        dropdown.close();
        musicPlayer.mainPlayer.open();
        setTimeout(() => musicPlayer.mainPlayer.switchTab("queue"), 50);
      },
      createPlaylist: () => {
        dropdown.close();
        playlists.create();
      },
      shuffleAll: musicPlayer.playback.shuffle.all.bind(musicPlayer.playback.shuffle),
    };
    
    Object.entries(menuActions).forEach(([elementId, handler]) => {
      if (DOM[elementId]) bindClick(DOM[elementId], handler);
    });
  },

  bindPopups: () => {
    const closeBtn = QUERY(MUSIC_PLAYER.close);
    if (closeBtn) bindClick(closeBtn, () => musicPlayer.mainPlayer.close());
    
    const playBtn = QUERY(MUSIC_PLAYER.play);
    if (playBtn) bindClick(playBtn, () => musicPlayer.playback.togglePlayPause());
    
    const prevBtn = QUERY(MUSIC_PLAYER.previous);
    if (prevBtn) bindClick(prevBtn, () => musicPlayer.playback.previous());
    
    const nextBtn = QUERY(MUSIC_PLAYER.next);
    if (nextBtn) bindClick(nextBtn, () => musicPlayer.playback.next());
    
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) bindClick(shuffleBtn, () => musicPlayer.playback.shuffle.toggle());
    
    const repeatBtn = document.getElementById('repeatBtn');
    if (repeatBtn) bindClick(repeatBtn, () => musicPlayer.playback.repeat.toggle());
    
    const favoriteBtn = QUERY(MUSIC_PLAYER.favoriteBtn);
    if (favoriteBtn) bindClick(favoriteBtn, () => {
      if (appState.currentSong) {
        appState.favorites.toggle("songs", appState.currentSong.id);
        musicPlayer.ui.updateFavoriteButton();
      }
    });
    
    QUERY_ALL(MUSIC_PLAYER.tabs).forEach(tab => {
      bindClick(tab, () => {
        const tabName = tab.dataset.tab;
        if (tabName) musicPlayer.mainPlayer.switchTab(tabName);
      });
    });
  },

  bindKeyboard: () => {
    if (document._kbHandler) document.removeEventListener("keydown", document._kbHandler);
    
    const keyboardHandler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      
      const shortcuts = {
        " ": (e) => {
          e.preventDefault();
          musicPlayer.mainPlayer.toggle();
        },
        ArrowLeft: (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            musicPlayer.playback.previous();
          }
        },
        ArrowRight: (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            musicPlayer.playback.next();
          }
        },
        KeyN: (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            musicPlayer.mainPlayer.open();
          }
        },
        KeyM: (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            dropdown.toggle();
          }
        },
        KeyS: (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            musicPlayer.playback.shuffle.toggle();
          }
        },
        KeyR: (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            musicPlayer.playback.repeat.toggle();
          }
        },
        Escape: () => {
          musicPlayer.mainPlayer.close();
          dropdown.close();
        },
      };
      
      const handler = shortcuts[e.code] || shortcuts[e.key];
      if (handler) handler(e);
    };
    
    document.addEventListener("keydown", keyboardHandler);
    document._kbHandler = keyboardHandler;
  },

  bindDocument: () => {
    if (document._docClickHandler) document.removeEventListener("click", document._docClickHandler);
    
    const documentClickHandler = (e) => {
      const dropdownMenu = DOM.dropdownMenu;
      const menuTrigger = DOM.menuTrigger;
      
      if (dropdownMenu && !dropdownMenu.contains(e.target) && !menuTrigger?.contains(e.target)) {
        dropdown.close();
      }
      
      const drawerEl = DOM.drawer;
      const nowPlayingEl = QUERY(NAVBAR.nowPlaying);
      
      if (appState.isPopupVisible && drawerEl && !drawerEl.contains(e.target) && !nowPlayingEl?.contains(e.target)) {
        musicPlayer.mainPlayer.close();
      }
      
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
    
    document.addEventListener("click", documentClickHandler);
    document._docClickHandler = documentClickHandler;
  },
};


document.addEventListener('DOMContentLoaded', () => {
  app.initialize();
  
  setTimeout(() => {
    if (notificationPlayer.utils.isSupported()) {
      notificationPlayer.setup();
    }
  }, 100);
});


window.MyTunesApp = {
  initialize: app.initialize,
  state: () => appState,
  api: () => window.musicAppAPI,
  goHome: app.goHome,
};

window.navigation = navigation;
window.playlists = playlists;
window.views = views;


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