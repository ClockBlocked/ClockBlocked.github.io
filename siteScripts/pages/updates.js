import { viewManager } from '../viewManager.js';
import { playerManager } from '../playerManager.js';
import {
  appState,
  storage,
  notifications,
  musicPlayer,
  utils
} from '../global.js';

import {
  NAVBAR,
  MUSIC_PLAYER,
  CLASSES,
  IDS,
  REPEAT_MODES,
  NOTIFICATION_TYPES
} from '../map.js";

export const pageUpdates = {
  breadCrumbs: (items, options = {}) => {
    const {
      containerId = ".breadcrumb-list",
      showIcons = false,
      truncateAfter = null,
      animateChanges = true,
      schemaMarkup = false
    } = options;

    const list = document.querySelector(containerId);
    if (!list) return;

    const prev = animateChanges ? list.innerHTML : null;
    list.innerHTML = "";

    let display = items;
    if (truncateAfter && items.length > truncateAfter + 1) {
      display = [items[0], { text: "...", isEllipsis: true }, ...items.slice(-(truncateAfter - 1))];
    }

    display.forEach((item, index) => {
      if (item.isEllipsis) {
        const li = document.createElement("li");
        li.className = "breadcrumb-item";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "breadcrumb-link";
        btn.setAttribute("aria-label", "Show all breadcrumb items");
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 13a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z"/></svg>';
        btn.addEventListener("click", () => {
          pageUpdates.breadCrumbs(items, { ...options, truncateAfter: null });
        });
        li.appendChild(btn);
        list.appendChild(li);
        return;
      }

      const li = document.createElement("li");
      li.className = "breadcrumb-item";
      if (schemaMarkup) {
        li.setAttribute("itemprop", "itemListElement");
        li.setAttribute("itemscope", "");
        li.setAttribute("itemtype", "https://schema.org/ListItem");
      }
      if (item.active) li.classList.add("active");

      const el = document.createElement("button");
      el.type = "button";
      el.className = "breadcrumb-link";
      if (item.active) {
        el.setAttribute("aria-current", "page");
        el.disabled = true;
      }
      if (schemaMarkup) el.setAttribute("itemprop", "item");

      let html = "";
      if (item.icon) {
        html += `<span class="SVGimg">${item.icon}</span>`;
      } else if (item.isHome || (index === 0 && showIcons)) {
        html += '<svg class="SVGimg" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0V14a1 1 0 011-1h2a1 1 0 011 1v7"/></svg>';
      }
      html += schemaMarkup ? `<span itemprop="name">${item.text}</span>` : item.text;
      el.innerHTML = html;

      if (!item.active && item.action) {
        el.setAttribute('data-action', item.action);
        if (item.artistData) {
          el.addEventListener('click', () => {
            pageUpdates.handleBreadcrumbNavigation(item.action, item.artistData);
          });
        } else {
          el.addEventListener('click', () => {
            pageUpdates.handleBreadcrumbNavigation(item.action);
          });
        }
      }

      if (schemaMarkup) {
        const meta = document.createElement("meta");
        meta.setAttribute("itemprop", "position");
        meta.setAttribute("content", (index + 1).toString());
        li.appendChild(meta);
      }
      list.appendChild(li);
    });

    if (animateChanges) {
      const wrapper = list.closest(".breadcrumb-wrapper");
      if (wrapper) {
        wrapper.classList.add("breadcrumb-fade-in");
        setTimeout(() => wrapper.classList.remove("breadcrumb-fade-in"), 300);
      }
    }
  },

  handleBreadcrumbNavigation: async (action, data = null) => {
    switch (action) {
      case 'home':
        await viewManager.switchView('home');
        break;
      case 'allArtists':
        await viewManager.switchView('allArtists');
        break;
      case 'artist':
        if (data) {
          await viewManager.switchView('artist', { artistData: data });
        }
        break;
    }
  },

  updatePageMetadata: (metadata = {}) => {
    if (metadata.title) {
      document.title = metadata.title;
    }

    if (metadata.description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.name = 'description';
        document.head.appendChild(descMeta);
      }
      descMeta.content = metadata.description;
    }

    if (metadata.ogTitle) {
      let ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (!ogTitleMeta) {
        ogTitleMeta = document.createElement('meta');
        ogTitleMeta.property = 'og:title';
        document.head.appendChild(ogTitleMeta);
      }
      ogTitleMeta.content = metadata.ogTitle;
    }

    if (metadata.ogDescription) {
      let ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (!ogDescMeta) {
        ogDescMeta = document.createElement('meta');
        ogDescMeta.property = 'og:description';
        document.head.appendChild(ogDescMeta);
      }
      ogDescMeta.content = metadata.ogDescription;
    }

    if (metadata.ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.property = 'og:image';
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.content = metadata.ogImage;
    }
  },

  updateNowPlayingIndicators: (trackData) => {
    // Update any "now playing" indicators throughout the UI
    const nowPlayingElements = document.querySelectorAll('.now-playing-indicator');
    nowPlayingElements.forEach(element => {
      if (trackData) {
        element.textContent = `${trackData.title} - ${trackData.artist}`;
        element.classList.add('active');
      } else {
        element.textContent = 'Nothing playing';
        element.classList.remove('active');
      }
    });

    // Update the navbar now playing area on mobile
    const nowPlayingArea = document.getElementById('now-playing-area');
    if (nowPlayingArea && playerManager.currentViewport === 'mobile') {
      if (trackData) {
        nowPlayingArea.innerHTML = `
          <div class="now-playing-track">
            <img src="${trackData.cover || '/images/default-cover.jpg'}" alt="Album cover" class="now-playing-cover">
            <div class="now-playing-info">
              <div class="now-playing-title">${trackData.title}</div>
              <div class="now-playing-artist">${trackData.artist}</div>
            </div>
          </div>
        `;
        nowPlayingArea.classList.add('active');
      } else {
        nowPlayingArea.innerHTML = `
          <div class="now-playing-placeholder">
            <svg class="music-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span>No music playing</span>
          </div>
        `;
        nowPlayingArea.classList.remove('active');
      }
    }
  },

  updateViewportSpecificElements: () => {
    const currentViewport = playerManager.getCurrentViewport();
    
    // Update elements based on current viewport
    const desktopOnlyElements = document.querySelectorAll('.desktop-only');
    desktopOnlyElements.forEach(element => {
      if (currentViewport === 'desktop') {
        element.style.display = '';
      } else {
        element.style.display = 'none';
      }
    });

    const mobileOnlyElements = document.querySelectorAll('.mobile-only');
    mobileOnlyElements.forEach(element => {
      if (currentViewport === 'mobile') {
        element.style.display = '';
      } else {
        element.style.display = 'none';
      }
    });

    const tabletOnlyElements = document.querySelectorAll('.tablet-only');
    tabletOnlyElements.forEach(element => {
      if (currentViewport === 'tablet') {
        element.style.display = '';
      } else {
        element.style.display = 'none';
      }
    });
  },

  animateCardLoad: (cardElement, delay = 0) => {
    if (!cardElement) return;

    cardElement.style.opacity = '0';
    cardElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      cardElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      cardElement.style.opacity = '1';
      cardElement.style.transform = 'translateY(0)';
    }, delay);
  },

  staggerCardAnimations: (cardSelector = '.bentoCard', staggerDelay = 100) => {
    const cards = document.querySelectorAll(cardSelector);
    cards.forEach((card, index) => {
      pageUpdates.animateCardLoad(card, index * staggerDelay);
    });
  }
};

export const ui = {
  setLoadingState: (loading) => {
    const nowPlayingArea = document.querySelector(NAVBAR.nowPlaying);
    const songTitle = document.querySelector(NAVBAR.songName);

    if (nowPlayingArea) nowPlayingArea.style.opacity = loading ? "0.5" : "1";
    if (songTitle) songTitle.textContent = loading ? "Loading..." : appState.currentSong?.title || "";
  },

  updateNowPlaying: () => {
    if (!appState.currentSong) return;

    const elements = {
      albumCover: document.querySelector(MUSIC_PLAYER.albumArtwork),
      songTitle: document.querySelector(MUSIC_PLAYER.songName),
      artistName: document.querySelector(MUSIC_PLAYER.artistName),
      albumName: document.querySelector(MUSIC_PLAYER.albumName),
    };

    if (elements.albumCover) {
      utils.loadImageWithFallback(elements.albumCover, utils.getAlbumImageUrl(appState.currentSong.album), utils.getDefaultAlbumImage(), "album");
    }

    if (elements.songTitle) elements.songTitle.textContent = appState.currentSong.title;
    if (elements.artistName) elements.artistName.textContent = appState.currentSong.artist;
    if (elements.albumName) elements.albumName.textContent = appState.currentSong.album;

    ui.updatePlayPauseButtons();
    ui.updateFavoriteButton();
  },

  updateNavbar: () => {
    if (!appState.currentSong) return;

    const container = document.querySelector(NAVBAR.albumArtwork);
    const artist = document.querySelector(NAVBAR.artistName);
    const songTitle = document.querySelector(NAVBAR.songName);
    const playIndicator = document.querySelector(NAVBAR.playIndicator);
    const nowPlayingArea = document.querySelector(NAVBAR.nowPlaying);

    if (container) {
      const svg = container.querySelector("svg");
      const img = container.querySelector("img");

      if (img) {
        const albumUrl = utils.getAlbumImageUrl(appState.currentSong.album);
        utils.loadImageWithFallback(img, albumUrl, utils.getDefaultAlbumImage(), "album");
        img.classList.remove("opacity-0");
        img.classList.add("opacity-100");
      }

      if (svg) {
        svg.classList.add(CLASSES.hidden);
      }
    }

    if (artist) artist.textContent = appState.currentSong.artist;

    if (songTitle) {
      const title = appState.currentSong.title;
      songTitle.classList.toggle(CLASSES.marquee, title.length > 25);
      songTitle.textContent = title;
    }

    if (playIndicator) {
      playIndicator.classList.toggle(CLASSES.active, appState.isPlaying);
    }

    if (nowPlayingArea) {
      nowPlayingArea.classList.add(CLASSES.hasSong);
    }

    // Also update desktop player card if it exists
    if (playerManager.getCurrentViewport() === 'desktop') {
      playerManager.updateDesktopPlayerCard(appState.currentSong);
    }
  },

  updatePlayPauseButtons: () => {
    const navBarPlay = $byId(IDS.playIconNavbar);
    const navBarPause = $byId(IDS.pauseIconNavbar);
    
    if (navBarPlay && navBarPause) {
      navBarPlay.style.display = appState.isPlaying ? "none" : "block";
      navBarPause.style.display = appState.isPlaying ? "block" : "none";
    }

    const musicPlayerBtn = $byId(IDS.playBtn);
    if (musicPlayerBtn) {
      const playIcon = musicPlayerBtn.querySelector(".icon.play");
      const pauseIcon = musicPlayerBtn.querySelector(".icon.pause");
      if (playIcon && pauseIcon) {
        playIcon.classList.toggle(CLASSES.hidden, appState.isPlaying);
        pauseIcon.classList.toggle(CLASSES.hidden, !appState.isPlaying);
      }
      musicPlayerBtn.classList.toggle(CLASSES.playing, appState.isPlaying);
    }

    // Update desktop player card play button
    const desktopPlayBtn = document.getElementById('desktop-play-btn');
    if (desktopPlayBtn) {
      if (appState.isPlaying) {
        desktopPlayBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        `;
      } else {
        desktopPlayBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
      }
    }
  },

  updateShuffleButton: () => {
    const shuffleBtn = $byId(IDS.shuffleBtn);
    if (shuffleBtn) {
      shuffleBtn.classList.toggle(CLASSES.active, appState.shuffleMode);
    }

    // Update any additional shuffle buttons in other views
    const shuffleButtons = document.querySelectorAll('[data-action="shuffle"]');
    shuffleButtons.forEach(btn => {
      btn.classList.toggle(CLASSES.active, appState.shuffleMode);
      btn.setAttribute('aria-pressed', appState.shuffleMode);
    });
  },

  updateRepeatButton: () => {
    const repeatBtn = $byId(IDS.repeatBtn);
    if (repeatBtn) {
      repeatBtn.classList.toggle(CLASSES.active, appState.repeatMode !== REPEAT_MODES.OFF);
      repeatBtn.classList.toggle(CLASSES.repeatOne, appState.repeatMode === REPEAT_MODES.ONE);
    }

    // Update any additional repeat buttons in other views
    const repeatButtons = document.querySelectorAll('[data-action="repeat"]');
    repeatButtons.forEach(btn => {
      btn.classList.toggle(CLASSES.active, appState.repeatMode !== REPEAT_MODES.OFF);
      btn.classList.toggle(CLASSES.repeatOne, appState.repeatMode === REPEAT_MODES.ONE);
      
      // Update aria-label based on current mode
      let label = 'Repeat off';
      if (appState.repeatMode === REPEAT_MODES.ALL) label = 'Repeat all';
      else if (appState.repeatMode === REPEAT_MODES.ONE) label = 'Repeat one';
      btn.setAttribute('aria-label', label);
    });
  },

  updateFavoriteButton: () => {
    if (!appState.currentSong) return;
    
    const favoriteBtn = $byId(IDS.favoriteBtn);
    if (favoriteBtn) {
      const isFavorite = appState.favorites.has("songs", appState.currentSong.id);
      favoriteBtn.classList.toggle("favorited", isFavorite);
      favoriteBtn.classList.toggle(CLASSES.active, isFavorite);
      favoriteBtn.setAttribute("aria-pressed", isFavorite);
      
      const heartIcon = favoriteBtn.querySelector("svg");
      if (heartIcon) {
        heartIcon.style.color = isFavorite ? "#ef4444" : "";
        heartIcon.style.fill = isFavorite ? "currentColor" : "none";
      }
    }

    // Update all favorite buttons for this song across the UI
    if (appState.currentSong.id) {
      const allFavoriteButtons = document.querySelectorAll(`[data-favorite-songs="${appState.currentSong.id}"]`);
      allFavoriteButtons.forEach(btn => {
        const isFavorite = appState.favorites.has("songs", appState.currentSong.id);
        btn.classList.toggle("favorited", isFavorite);
        btn.classList.toggle(CLASSES.active, isFavorite);
        btn.setAttribute("aria-pressed", isFavorite);
        
        const heartIcon = btn.querySelector("svg");
        if (heartIcon) {
          heartIcon.style.color = isFavorite ? "#ef4444" : "";
          heartIcon.style.fill = isFavorite ? "currentColor" : "none";
        }
      });
    }
  },

  updateVolumeControl: (volume) => {
    const volumeSliders = document.querySelectorAll('.volume-slider');
    volumeSliders.forEach(slider => {
      slider.value = volume * 100;
    });

    const volumeIcons = document.querySelectorAll('.volume-icon');
    volumeIcons.forEach(icon => {
      // Update volume icon based on level
      let iconPath;
      if (volume === 0) {
        iconPath = "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-4-8c-.31 0-.62.03-.91.09L7.7 10.28 8.91 11.5c.31-.2.69-.3 1.09-.3 1.66 0 3 1.34 3 3 0 .4-.1.78-.3 1.09l1.22 1.22c.06-.29.09-.6.09-.91V4zm-7 4L2 12l5.5 5.5L9 16 4 11l5-5z";
      } else if (volume < 0.5) {
        iconPath = "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z";
      } else {
        iconPath = "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z";
      }
      
      const svg = icon.querySelector('svg path');
      if (svg) {
        svg.setAttribute('d', iconPath);
      }
    });
  },

  updateProgress: (currentTime, duration) => {
    const progressBars = document.querySelectorAll('.progress-bar');
    const timeDisplays = document.querySelectorAll('.time-current');
    const durationDisplays = document.querySelectorAll('.time-duration');
    
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    progressBars.forEach(bar => {
      bar.value = progress;
    });

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    timeDisplays.forEach(display => {
      display.textContent = formatTime(currentTime);
    });

    durationDisplays.forEach(display => {
      display.textContent = formatTime(duration);
    });
  },

  updateCounts: () => {
    // Update queue count
    const queueCount = appState.queue?.items?.length || 0;
    const queueCounters = document.querySelectorAll('.queue-count');
    queueCounters.forEach(counter => {
      counter.textContent = queueCount;
      counter.style.display = queueCount > 0 ? 'inline' : 'none';
    });

    // Update favorites counts
    const favoriteSongsCount = appState.favorites?.songs?.size || 0;
    const favoriteArtistsCount = appState.favorites?.artists?.size || 0;
    const favoriteAlbumsCount = appState.favorites?.albums?.size || 0;

    const favoriteSongsCounters = document.querySelectorAll('.favorite-songs-count');
    favoriteSongsCounters.forEach(counter => {
      counter.textContent = favoriteSongsCount;
    });

    const favoriteArtistsCounters = document.querySelectorAll('.favorite-artists-count');
    favoriteArtistsCounters.forEach(counter => {
      counter.textContent = favoriteArtistsCount;
    });

    const favoriteAlbumsCounters = document.querySelectorAll('.favorite-albums-count');
    favoriteAlbumsCounters.forEach(counter => {
      counter.textContent = favoriteAlbumsCount;
    });
  },

  updateMusicPlayer: () => {
    ui.updateNowPlaying();
    ui.updateNavbar();
    ui.updatePlayPauseButtons();
    ui.updateFavoriteButton();
    ui.updateShuffleButton();
    ui.updateRepeatButton();
    ui.updateCounts();
    
    // Update desktop player card if visible
    if (playerManager.getCurrentViewport() === 'desktop' && appState.currentSong) {
      playerManager.updateDesktopPlayerCard(appState.currentSong);
    }
  },

  // Legacy compatibility
  updateBreadcrumbs: pageUpdates.breadCrumbs,
  
  showNotification: (message, type = 'info', duration = 3000) => {
    if (notifications?.show) {
      notifications.show(message, type, duration);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  },

  showError: (message, duration = 5000) => {
    ui.showNotification(message, 'error', duration);
  },

  showSuccess: (message, duration = 3000) => {
    ui.showNotification(message, 'success', duration);
  },

  showLoading: (message = 'Loading...') => {
    const loadingElement = document.querySelector('.loading-overlay');
    if (loadingElement) {
      loadingElement.textContent = message;
      loadingElement.classList.add('active');
    }
  },

  hideLoading: () => {
    const loadingElement = document.querySelector('.loading-overlay');
    if (loadingElement) {
      loadingElement.classList.remove('active');
    }
  }
};

// Initialize viewport-specific updates
if (typeof window !== 'undefined') {
  window.pageUpdates = pageUpdates;
  window.ui = ui;

  // Listen for viewport changes
  window.addEventListener('resize', () => {
    pageUpdates.updateViewportSpecificElements();
  });

  // Initial viewport update
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      pageUpdates.updateViewportSpecificElements();
    });
  } else {
    pageUpdates.updateViewportSpecificElements();
  }
}
