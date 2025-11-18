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
  recentCount: "recent-count",
  queueCount: "queue-count",

  recentlyPlayed: "recently-played",
  queueView: "queue-view",

  recentlyPlayedSection: "recently-played-section",
  randomAlbumsSection: "random-albums-section",
  favoriteArtistsSection: "favorite-artists-section",
  playlistsSection: "playlists-section",
  favoriteSongsSection: "favorite-songs-section",

  albumsContainer: "albumWrapper",
  artistsGrid: "artists-grid",
  artistSearch: "artist-search",
  genreFilters: "genre-filters",

  seekTooltip: "seek-tooltip",

  dynamicContent: "dynamic-content",
  contentLoading: "content-loading",

  musicPlayer: "music-player",
  musicPlayerTrigger: "now-playing-area",
  musicPlayerClose: "music-player-close",

  cover: "cover",
  title: "title",
  artist: "artist",
  album: "album",

  playBtn: "playBtn",
  prevBtn: "prevBtn",
  nextBtn: "nextBtn",
  rewindBtn: "rewindBtn",
  forwardBtn: "forwardBtn",
  shuffleBtn: "shuffleBtn",
  repeatBtn: "repeatBtn",
  favoriteBtn: "favoriteBtn",
  shareBtn: "shareBtn",
  moreBtn: "moreBtn",
  queueBtn: "queueBtn",

  progressBar: "progressBar",
  progressFill: "progressFill",
  progressThumb: "progressThumb",
  progressBuffer: "progressBuffer",
  currentTime: "currentTime",
  totalTime: "totalTime",

  queueList: "queueList",
  recentList: "recentList",

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

export const THEMES = Object.freeze({
  DARK: "dark",
  MEDIUM: "dim",
  LIGHT: "light",
});

export const ICONS = Object.freeze({
  play: '<svg ...></svg>',
  pause: '<svg ...></svg>',
  next: '<svg ...></svg>',
  prev: '<svg ...></svg>',
  shuffle: '<svg ...></svg>',
  repeat: '<svg ...></svg>',
  heart: '<svg ...></svg>',
  close: '<svg ...></svg>',
  rewind: '<svg ...></svg>',
  forward: '<svg ...></svg>',
});

export const ROUTES = Object.freeze({
  HOME: "home",
  ARTIST: "artist",
  ALBUM: "album",
  PLAYLIST: "playlist",
  FAVORITES: "favorites",
  SEARCH: "search",
});

export const STORAGE_KEYS = Object.freeze({
  THEME: "app-theme",
  FAVORITE_SONGS: "favorite-songs",
  FAVORITE_ARTISTS: "favorite-artists",
  RECENTLY_PLAYED: "recently-played",
  QUEUE: "queue",
});

export const AUDIO_FORMATS = Object.freeze({
  MP3: "audio/mpeg",
  WAV: "audio/wav",
  OGG: "audio/ogg",
});

export const REPEAT_MODES = Object.freeze({
  NONE: "none",
  ONE: "one",
  ALL: "all",
});

export const NOTIFICATION_TYPES = Object.freeze({
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
});

export function $(selector, root = document) {
  return root.querySelector(selector);
}
export function $all(selector, root = document) {
  return root.querySelectorAll(selector);
}
export function $byId(id) {
  return document.getElementById(id);
}