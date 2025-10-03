



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
 
 
 
// Drawer IDs
  drawer: "drawer",
  drawerHandle: "drawerHandle",
  
  // Music Player IDs (updated for drawer)
  musicPlayer: "musicPlayer",
  albumCover: "albumCover", 
  songTitle: "songTitle",
  artistName: "artistName",
  albumName: "albumName",
  
  playBtn: "playBtn",
  prevBtn: "prevBtn", 
  nextBtn: "nextBtn",
  rewindBtn: "rewindBtn",
  forwardBtn: "forwardBtn",
  shuffleBtn: "shuffleBtn",
  repeatBtn: "repeatBtn",
  favoriteBtn: "favoriteBtn",
  queueBtn: "queueBtn",
  shareBtn: "shareBtn",
  moreBtn: "moreBtn",
  
  progressBar: "progressBar",
  progressFill: "progressFill", 
  progressThumb: "progressThumb",
  currentTime: "currentTime",
  totalTime: "totalTime",
  
  // Tab content
  queueList: "queueList",
  recentList: "recentList", 
 
  // New Feature IDs
  visualizerContainer: "visualizer-container",
  lyricsContainer: "lyrics-container",
  sleepTimerBtn: "sleep-timer-btn",
  sleepTimerDisplay: "sleep-timer-display",
  voiceCommandBtn: "voice-command-btn",
  equalizerBtn: "equalizer-btn",
  crossfadeToggle: "crossfade-toggle",
  recommendationsContainer: "recommendations-container",
 
 
/** 
  // Music Player IDs
  musicPlayer: "musicPlayer",
  playBtn: "playBtn",
  prevBtn: "prevBtn",
  nextBtn: "nextBtn",
  shuffleBtn: "shuffleBtn",
  repeatBtn: "repeatBtn",
  favoriteBtn: "favoriteBtn",
  progressBar: "progressBar",
  progressFill: "progressFill",
  progressThumb: "progressThumb",
  currentTime: "current",
  totalTime: "total",
**/  
  // Navbar IDs
  playPauseNavbar: "play-pause-navbar",
  prevBtnNavbar: "prev-btn-navbar",
  nextBtnNavbar: "next-btn-navbar",
  playIconNavbar: "play-icon-navbar",
  pauseIconNavbar: "pause-icon-navbar",
  nowPlayingArea: "now-playing-area",
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
});




export const THEMES = Object.freeze({
  DARK: "dark",
  MEDIUM: "dim",
  LIGHT: "light",
});

export const ICONS = Object.freeze({
  dark: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 116.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>',
  medium: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L13 9h7l-5.5 4 2 7L10 16l-6.5 4 2-7L1 9h7l2-7z"/></svg>',
  light:
    '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>',
  play: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc. --><path style="fill:var(--fa-secondary-color,currentColor);opacity:var(--fa-secondary-opacity,.4)" d="M64 72l0 368c0 2.8 1.5 5.4 3.9 6.9s5.4 1.5 7.9 .1l336-184c2.6-1.4 4.2-4.1 4.2-7s-1.6-5.6-4.2-7L75.8 65c-2.5-1.4-5.5-1.3-7.9 .1S64 69.2 64 72z"/><path style="fill:var(--fa-primary-color,currentColor);opacity:var(--fa-primary-opacity,1)" d="M51.6 37.6C39.5 44.8 32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184c-12.4-6.8-27.4-6.5-39.6 .7zM75.8 65l336 184c2.6 1.4 4.2 4.1 4.2 7s-1.6 5.6-4.2 7L75.8 447c-2.5 1.4-5.5 1.3-7.9-.1S64 442.8 64 440L64 72c0-2.8 1.5-5.4 3.9-6.9s5.4-1.5 7.9-.1z"/></svg>
`,
  pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc. --><path style="fill:var(--fa-secondary-color,currentColor);opacity:var(--fa-secondary-opacity,.4)" d="M32 80l0 352c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16l0-352c0-8.8-7.2-16-16-16L48 64c-8.8 0-16 7.2-16 16zm224 0l0 352c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16l0-352c0-8.8-7.2-16-16-16l-64 0c-8.8 0-16 7.2-16 16z"/><path style="fill:var(--fa-primary-color,currentColor);opacity:var(--fa-primary-opacity,1)" d="M48 64c-8.8 0-16 7.2-16 16l0 352c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16l0-352c0-8.8-7.2-16-16-16L48 64zM0 80C0 53.5 21.5 32 48 32l64 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48L0 80zM272 64c-8.8 0-16 7.2-16 16l0 352c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16l0-352c0-8.8-7.2-16-16-16l-64 0zM224 80c0-26.5 21.5-48 48-48l64 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48l0-352z"/></svg>',
  next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc. --><path style="fill:var(--fa-secondary-color,currentColor);opacity:var(--fa-secondary-opacity,.4)" d="M32 72l0 368c0 2.9 1.6 5.6 4.2 7s5.7 1.3 8.2-.4l280-184 10.2-6.7-10.2-6.7-280-184c-2.5-1.6-5.6-1.8-8.2-.4S32 69.1 32 72z"/><path style="fill:var(--fa-primary-color,currentColor);opacity:var(--fa-primary-opacity,1)" d="M368 32c-8.8 0-16 7.2-16 16l0 181.2-10-6.6-280-184c-12.3-8.1-28-8.8-41-1.8S0 57.3 0 72L0 440c0 14.7 8.1 28.2 21 35.2s28.7 6.3 41-1.8l280-184 10-6.6 0 181.2c0 8.8 7.2 16 16 16s16-7.2 16-16l0-416c0-8.8-7.2-16-16-16zM44.4 65.3l280 184 10.2 6.7-10.2 6.7-280 184c-2.5 1.6-5.6 1.8-8.2 .4s-4.2-4.1-4.2-7L32 72c0-2.9 1.6-5.6 4.2-7s5.7-1.3 8.2 .4z"/></svg>',
  prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',
  shuffle:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
  repeat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
  heart:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  
  rewind: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc. --><path style="fill:var(--fa-secondary-color,currentColor);opacity:var(--fa-secondary-opacity,.4)" d="M49.4 256l10.2 6.7 280 184c2.5 1.6 5.6 1.8 8.2 .4s4.2-4.1 4.2-7l0-368c0-2.9-1.6-5.6-4.2-7s-5.7-1.3-8.2 .4l-280 184-10.2 6.7z"/><path style="fill:var(--fa-primary-color,currentColor);opacity:var(--fa-primary-opacity,1)" d="M16 32c8.8 0 16 7.2 16 16l0 181.2 10-6.6 280-184c12.3-8.1 28-8.8 41-1.8S384 57.3 384 72l0 368c0 14.7-8.1 28.2-21 35.2s-28.7 6.3-41-1.8l-280-184-10-6.6 0 181.2c0 8.8-7.2 16-16 16S0 472.8 0 464L0 48c0-8.8 7.2-16 16-16zM339.6 65.3l-280 184-10.2 6.7 10.2 6.7 280 184c2.5 1.6 5.6 1.8 8.2 .4s4.2-4.1 4.2-7l0-368c0-2.9-1.6-5.6-4.2-7s-5.7-1.3-8.2 .4z"/></svg>',
  forward: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc. --><path style="fill:var(--fa-secondary-color,currentColor);opacity:var(--fa-secondary-opacity,.4)" d="M32 64L32 448 224 283.4 224 228.6 32 64zm224 0l0 384 224-192-224-192z"/><path style="fill:var(--fa-primary-color,currentColor);opacity:var(--fa-primary-opacity,1)" d="M496 480c8.8 0 16-7.2 16-16l0-416c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 165.9-203.2-174.1c-9.5-8.1-22.8-10-34.2-4.8S224 51.5 224 64L224 186.4 52.8 39.7c-9.5-8.1-22.8-10-34.2-4.8S0 51.5 0 64L0 448c0 12.5 7.3 23.8 18.6 29.1s24.7 3.4 34.2-4.8L224 325.6 224 448c0 12.5 7.3 23.8 18.6 29.1s24.7 3.4 34.2-4.8L480 298.1 480 464c0 8.8 7.2 16 16 16zM224 283.4L32 448 32 64 224 228.6 224 283.4zM256 448l0-384 224 192-224 192z"/></svg>',
  queue: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>',
  share: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>',
  more: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/></svg>'  
});

export const MUSIC_PLAYER = (() => {
  const parent = "#musicPlayer";
  return Object.freeze({
    root: parent,
    handle: `${parent} #mpHandle`,
    close: `${parent} #closeBtn`,
    
    // Content sections
    content: `${parent} .content`,
    activeContent: `${parent} .content.active`,
    
    // Tabs
    tabs: `${parent} .tab`,
    activeTab: `${parent} .tab.active`,
    
    // Player elements
    albumArtwork: `${parent} #cover`,
    songName: `${parent} #title`,
    artistName: `${parent} #artist`,
    albumName: `${parent} #album`,
    
    currentTime: `${parent} #current`,
    totalTime: `${parent} #total`,
    
    progressBar: `${parent} #progressBar`,
    progressFill: `${parent} #progressFill`,
    progressThumb: `${parent} #progressThumb`,
    
    // Control buttons
    play: `${parent} #playBtn`,
    previous: `${parent} #prevBtn`,
    next: `${parent} #nextBtn`,
    reWind: `${parent} #rewindBtn`,
    fastForward: `${parent} #forwardBtn`,
    favoriteBtn: `${parent} #favoriteBtn`,
    queueBtn: `${parent} #queueBtn`,
    shareBtn: `${parent} #shareBtn`,
    moreBtn: `${parent} #moreBtn`,
    
    // Lists
    queueList: `${parent} #queueList`,
    recentList: `${parent} #recentList`,
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
    previous: `${parent} .previous`,
    next: `${parent} .next`,
    playPause: `${parent} .playPause`,
    play: `${parent} #play-icon-navbar`,
    pause: `${parent} #pause-icon-navbar`,
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
  [NOTIFICATION_TYPES.INFO]:    '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16Zm.75-11.5a.75.75 0 10-1.5 0v.5a.75.75 0 001.5 0v-.5ZM9 9.75A.75.75 0 019.75 9h.5c.414 0 .75.336.75.75v4.5a.75.75 0 01-1.5 0v-3.75H9.75A.75.75 0 019 9.75Z"/></svg>',
  [NOTIFICATION_TYPES.SUCCESS]: '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4Z"/></svg>',
  [NOTIFICATION_TYPES.WARNING]:'<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.592c.75 1.335-.212 3.009-1.743 3.009H3.482c-1.531 0-2.492-1.674-1.743-3.009L8.257 3.1Zm1.743 3.401a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5Zm0 6.75a.75.75 0 10-1.5 0v.5a.75.75 0 001.5 0v-.5Z"/></svg>',
  [NOTIFICATION_TYPES.ERROR]:   '<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16Zm2.828-11.172a1 1 0 00-1.414-1.414L10 6.828 8.586 5.414A1 1 0 107.172 6.828L8.586 8.242 7.172 9.656a1 1 0 101.414 1.414L10 9.656l1.414 1.414a1 1 0 001.414-1.414L11.414 8.242l1.414-1.414Z"/></svg>',
};

export const TOAST_STYLES = {
  [NOTIFICATION_TYPES.INFO]:    { base: "bg-blue-600/95 border-blue-500 text-white",    bar: "bg-white/70" },
  [NOTIFICATION_TYPES.SUCCESS]: { base: "bg-emerald-600/95 border-emerald-500 text-white", bar: "bg-white/70" },
  [NOTIFICATION_TYPES.WARNING]: { base: "bg-amber-600/95 border-amber-500 text-white",  bar: "bg-white/80" },
  [NOTIFICATION_TYPES.ERROR]:   { base: "bg-rose-600/95 border-rose-500 text-white",    bar: "bg-white/70" },
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




// Referencing Helpers
export const getElement = (id) => {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID '${id}' not found`);
  }
  return element;
};

export const getElements = (selector) => {
  return document.querySelectorAll(selector);
};

export const getElementInContext = (contextSelector, elementSelector) => {
  const context = document.querySelector(contextSelector);
  return context ? context.querySelector(elementSelector) : null;
};

export const $ = new Proxy(
  {},
  {
    get(_, key) {
      const id = IDS[key];
      return () => (id ? document.getElementById(id) : null);
    },
  }
);


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


// Injection Helper
export const injectIcons = () => {
  // Get all elements with data-icon attribute
  const iconElements = document.querySelectorAll('[data-icon]');
  
  iconElements.forEach(element => {
    const iconName = element.getAttribute('data-icon');
    if (ICONS[iconName]) {
      element.innerHTML = ICONS[iconName];
      
      // Add icon class if it doesn't have one
      if (!element.classList.contains('icon')) {
        element.classList.add('icon');
      }
    }
  });
};


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




document.addEventListener('DOMContentLoaded', injectIcons);
window.injectIcons = injectIcons;