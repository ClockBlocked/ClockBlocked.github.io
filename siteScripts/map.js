/**
 * ═══════════════════════════════════════════════════════════════
 *  MYBEATS - DOM ELEMENT REFERENCES
 *  Individual DOM element variables for direct access
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
//  DIRECT DOM ELEMENT REFERENCES
// ═══════════════════════════════════════════════════════════════

// Theme & UI Elements
export const themeToggle = document.getElementById("theme-toggle");
export const globalSearchTrigger = document.getElementById("global-search-trigger");
export const searchDialog = document.getElementById("search-dialog");
export const globalSearchForm = document.getElementById("global-search-form");
export const globalSearchInput = document.getElementById("global-search-input");
export const recentSearchesList = document.getElementById("recent-searches-list");
export const popoverPortal = document.getElementById("popover-portal");
export const willHideMenu = document.getElementById("will-hide-menu");
export const menuTrigger = document.getElementById("menu-trigger");
export const dropdownMenu = document.getElementById("dropdown-menu");
export const dropdownClose = document.getElementById("dropdown-close");

// Favorites & Library
export const favoriteSongs = document.getElementById("favorite-songs");
export const favoriteArtists = document.getElementById("favorite-artists");
export const createPlaylist = document.getElementById("create-playlist");
export const favoriteSongsCount = document.getElementById("favorite-songs-count");
export const favoriteArtistsCount = document.getElementById("favorite-artists-count");
export const recentlyPlayed = document.getElementById("recently-played");
export const queueView = document.getElementById("queue-view");
export const recentCount = document.getElementById("recent-count");
export const queueCount = document.getElementById("queue-count");

// Sections
export const recentlyPlayedSection = document.getElementById("recently-played-section");
export const randomAlbumsSection = document.getElementById("random-albums-section");
export const favoriteArtistsSection = document.getElementById("favorite-artists-section");
export const playlistsSection = document.getElementById("playlists-section");
export const favoriteSongsSection = document.getElementById("favorite-songs-section");

// Search & Actions
export const searchMusic = document.getElementById("search-music");
export const shuffleAll = document.getElementById("shuffle-all");
export const appSettings = document.getElementById("app-settings");
export const aboutApp = document.getElementById("about-app");

// Content & Dynamic Elements
export const dynamicContent = document.getElementById("dynamic-content");
export const contentLoading = document.getElementById("content-loading");
export const albumsContainer = document.getElementById("albumWrapper");
export const artistsGrid = document.getElementById("artists-grid");
export const artistSearch = document.getElementById("artist-search");
export const genreFilters = document.getElementById("genre-filters");
export const seekTooltip = document.getElementById("seek-tooltip");

// Music Player Elements
export const drawer = document.getElementById("drawer");
export const drawerHandle = document.getElementById("drawerHandle");
export const musicPlayer = document.getElementById("musicPlayer");
export const albumCover = document.getElementById("albumCover");
export const songTitle = document.getElementById("songTitle");
export const artistName = document.getElementById("artistName");
export const albumName = document.getElementById("albumName");
export const playBtn = document.getElementById("playBtn");
export const prevBtn = document.getElementById("prevBtn");
export const nextBtn = document.getElementById("nextBtn");
export const rewindBtn = document.getElementById("rewindBtn");
export const forwardBtn = document.getElementById("forwardBtn");
export const shuffleBtn = document.getElementById("shuffleBtn");
export const repeatBtn = document.getElementById("repeatBtn");
export const favoriteBtn = document.getElementById("favoriteBtn");
export const queueBtn = document.getElementById("queueBtn");
export const shareBtn = document.getElementById("shareBtn");
export const moreBtn = document.getElementById("moreBtn");
export const progressBar = document.getElementById("progressBar");
export const progressFill = document.getElementById("progressFill");
export const progressThumb = document.getElementById("progressThumb");
export const currentTime = document.getElementById("currentTime");
export const totalTime = document.getElementById("totalTime");
export const queueList = document.getElementById("queueList");
export const recentList = document.getElementById("recentList");

// Navbar Elements
export const playPauseNavbar = document.getElementById("play-pause-navbar");
export const prevBtnNavbar = document.getElementById("prev-btn-navbar");
export const nextBtnNavbar = document.getElementById("next-btn-navbar");
export const playIconNavbar = document.getElementById("play-icon-navbar");
export const pauseIconNavbar = document.getElementById("pause-icon-navbar");
export const nowPlayingArea = document.getElementById("now-playing-area");

// Music Player Component Elements
export const musicPlayerDragHandle = document.querySelector("#drawer .musicPlayerDragHandle");
export const musicPlayerCloseBtn = document.querySelector("#drawer #closeBtn");
export const musicPlayerCurtain = document.querySelector("#drawer .musicPlayerCurtain");
export const musicPlayerScroller = document.querySelector("#drawer .musicPlayerScroller");
export const musicPlayerSlide = document.querySelector("#drawer .musicPlayerSlide");
export const musicPlayerInner = document.querySelector("#drawer .musicPlayerInner");
export const musicPlayerContent = document.querySelector("#drawer .musicPlayerContent");
export const musicPlayerActiveContent = document.querySelector("#drawer .musicPlayerPanel.active");
export const musicPlayerTabs = document.querySelectorAll("#drawer .musicPlayerTab");
export const musicPlayerActiveTab = document.querySelector("#drawer .musicPlayerTab.active");
export const musicPlayerTabsWrapper = document.querySelector("#drawer .musicPlayerTabsWrapper");
export const musicPlayerTabSlider = document.querySelector("#drawer .musicPlayerTabSlider");
export const musicPlayerNowPlaying = document.querySelector("#drawer .musicPlayerNowPlaying");
export const musicPlayerCoverWrapper = document.querySelector("#drawer .musicPlayerCoverWrapper");
export const musicPlayerAlbumArtwork = document.querySelector("#drawer #cover");
export const musicPlayerCoverGlow = document.querySelector("#drawer .musicPlayerCoverGlow");
export const musicPlayerSeparator = document.querySelector("#drawer .musicPlayerSeparator");
export const musicPlayerSongInfo = document.querySelector("#drawer .musicPlayerInfo");
export const musicPlayerSongDetails = document.querySelector("#drawer .musicPlayerDetails");
export const musicPlayerSongName = document.querySelector("#drawer #title");
export const musicPlayerArtistName = document.querySelector("#drawer #artist");
export const musicPlayerAlbumName = document.querySelector("#drawer #album");
export const musicPlayerProgressSection = document.querySelector("#drawer .musicPlayerProgressSection");
export const musicPlayerProgressBuffer = document.querySelector("#drawer #progressBuffer");
export const musicPlayerTimeDisplay = document.querySelector("#drawer .musicPlayerTimeDisplay");
export const musicPlayerControls = document.querySelector("#drawer .musicPlayerControls");
export const musicPlayerActions = document.querySelector("#drawer .musicPlayerActions");
export const musicPlayerListHeader = document.querySelector("#drawer .musicPlayerListHeader");
export const musicPlayerListTitle = document.querySelector("#drawer .musicPlayerListTitle");
export const musicPlayerListCount = document.querySelector("#drawer .musicPlayerListCount");
export const musicPlayerList = document.querySelector("#drawer .musicPlayerList");
export const musicPlayerQueueCount = document.querySelector("#drawer #queueCount");
export const musicPlayerRecentCount = document.querySelector("#drawer #recentCount");
export const musicPlayerEmpty = document.querySelector("#drawer .musicPlayerEmpty");
export const musicPlayerEmptyIcon = document.querySelector("#drawer .musicPlayerEmptyIcon");
export const musicPlayerEmptyText = document.querySelector("#drawer .musicPlayerEmptyText");
export const musicPlayerEmptySubtext = document.querySelector("#drawer .musicPlayerEmptySubtext");
export const musicPlayerListItem = document.querySelector("#drawer .musicPlayerListItem");
export const musicPlayerListItemArt = document.querySelector("#drawer .musicPlayerListItemArt");
export const musicPlayerListItemInfo = document.querySelector("#drawer .musicPlayerListItemInfo");
export const musicPlayerListItemTitle = document.querySelector("#drawer .musicPlayerListItemTitle");
export const musicPlayerListItemArtist = document.querySelector("#drawer .musicPlayerListItemArtist");
export const musicPlayerListItemActions = document.querySelector("#drawer .musicPlayerListItemActions");
export const musicPlayerListItemAction = document.querySelector("#drawer .musicPlayerListItemAction");

// Navbar Component Elements
export const navbarRoot = document.getElementById("navbar");
export const navbarNowPlaying = document.querySelector("#navbar #now-playing-area");
export const navbarAlbumArtwork = document.querySelector("#navbar .albumArtwork");
export const navbarArtistName = document.querySelector("#navbar .artistName");
export const navbarSongName = document.querySelector("#navbar .songName");
export const navbarPlayIndicator = document.querySelector("#navbar #play-indicator");
export const navbarPrevious = document.querySelector("#navbar .previous");
export const navbarNext = document.querySelector("#navbar .next");
export const navbarPlayPause = document.querySelector("#navbar .playPause");
export const navbarPlay = document.querySelector("#navbar #play-icon-navbar");
export const navbarPause = document.querySelector("#navbar #pause-icon-navbar");
export const navbarMenuTrigger = document.querySelector("#navbar #menu-trigger");
export const navbarNextNavbar = document.querySelector("#navbar .next");

// Modal Elements
export const modalClose = document.querySelector(".modal .close");
export const dialogClose = document.querySelector("#search-dialog .close");
export const dropdownCloseModal = document.querySelector("#dropdown-menu .close");

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS (unchanged)
// ═══════════════════════════════════════════════════════════════

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
});

export const THEMES = Object.freeze({
  DARK: "dark",
  MEDIUM: "dim",
  LIGHT: "light",
});

export const ICONS = Object.freeze({
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

export const NOTIFICATION_TYPES = Object.freeze({
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
});

export const TOAST_ICONS = {
  [NOTIFICATION_TYPES.INFO]: '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16Zm.75-11.5a.75.75 0 10-1.5 0v.5a.75.75 0 001.5 0v-.5ZM9 9.75A.75.75 0 019.75 9h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-4.5Z"/></svg>',
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

// ═══════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
//  GLOBAL WINDOW EXPORTS
// ═══════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  // Export all individual element variables
  window.themeToggle = themeToggle;
  window.globalSearchTrigger = globalSearchTrigger;
  window.searchDialog = searchDialog;
  window.globalSearchForm = globalSearchForm;
  window.globalSearchInput = globalSearchInput;
  window.recentSearchesList = recentSearchesList;
  window.popoverPortal = popoverPortal;
  window.willHideMenu = willHideMenu;
  window.menuTrigger = menuTrigger;
  window.dropdownMenu = dropdownMenu;
  window.dropdownClose = dropdownClose;
  window.favoriteSongs = favoriteSongs;
  window.favoriteArtists = favoriteArtists;
  window.createPlaylist = createPlaylist;
  window.favoriteSongsCount = favoriteSongsCount;
  window.favoriteArtistsCount = favoriteArtistsCount;
  window.recentlyPlayed = recentlyPlayed;
  window.queueView = queueView;
  window.recentCount = recentCount;
  window.queueCount = queueCount;
  window.recentlyPlayedSection = recentlyPlayedSection;
  window.randomAlbumsSection = randomAlbumsSection;
  window.favoriteArtistsSection = favoriteArtistsSection;
  window.playlistsSection = playlistsSection;
  window.favoriteSongsSection = favoriteSongsSection;
  window.searchMusic = searchMusic;
  window.shuffleAll = shuffleAll;
  window.appSettings = appSettings;
  window.aboutApp = aboutApp;
  window.dynamicContent = dynamicContent;
  window.contentLoading = contentLoading;
  window.albumsContainer = albumsContainer;
  window.artistsGrid = artistsGrid;
  window.artistSearch = artistSearch;
  window.genreFilters = genreFilters;
  window.seekTooltip = seekTooltip;
  window.drawer = drawer;
  window.drawerHandle = drawerHandle;
  window.musicPlayer = musicPlayer;
  window.albumCover = albumCover;
  window.songTitle = songTitle;
  window.artistName = artistName;
  window.albumName = albumName;
  window.playBtn = playBtn;
  window.prevBtn = prevBtn;
  window.nextBtn = nextBtn;
  window.rewindBtn = rewindBtn;
  window.forwardBtn = forwardBtn;
  window.shuffleBtn = shuffleBtn;
  window.repeatBtn = repeatBtn;
  window.favoriteBtn = favoriteBtn;
  window.queueBtn = queueBtn;
  window.shareBtn = shareBtn;
  window.moreBtn = moreBtn;
  window.progressBar = progressBar;
  window.progressFill = progressFill;
  window.progressThumb = progressThumb;
  window.currentTime = currentTime;
  window.totalTime = totalTime;
  window.queueList = queueList;
  window.recentList = recentList;
  window.playPauseNavbar = playPauseNavbar;
  window.prevBtnNavbar = prevBtnNavbar;
  window.nextBtnNavbar = nextBtnNavbar;
  window.playIconNavbar = playIconNavbar;
  window.pauseIconNavbar = pauseIconNavbar;
  window.nowPlayingArea = nowPlayingArea;

  // Export constants
  window.CLASSES = CLASSES;
  window.THEMES = THEMES;
  window.ROUTES = ROUTES;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.ICONS = ICONS;
  window.AUDIO_FORMATS = AUDIO_FORMATS;
  window.REPEAT_MODES = REPEAT_MODES;
  window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
  window.TOAST_ICONS = TOAST_ICONS;
  window.TOAST_STYLES = TOAST_STYLES;
  
  // Export helper functions
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