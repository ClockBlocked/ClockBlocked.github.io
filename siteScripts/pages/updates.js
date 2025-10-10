import {
  appState,
  storage,
  notifications,
  musicPlayer,
  utils
} from '../global.js';

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

      if (!item.active) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (item.onClick) { item.onClick(); return; }
          if (appState.router) {
            if (item.route) {
              if (item.route === ROUTES.HOME) appState.router.navigateTo(ROUTES.HOME);
              else if (item.route === ROUTES.ARTIST && item.artist) appState.router.navigateTo(ROUTES.ARTIST, { artist: item.artist });
              else if (item.route === ROUTES.ALL_ARTISTS) appState.router.navigateTo(ROUTES.ALL_ARTISTS);
            } else {
              if (item.text === "Home" || item.isHome) appState.router.navigateTo(ROUTES.HOME);
              else if (item.artist) appState.router.navigateTo(ROUTES.ARTIST, { artist: item.artist });
              else if (item.text === "All Artists") appState.router.navigateTo(ROUTES.ALL_ARTISTS);
            }
          }
        });
      }

      li.appendChild(el);
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
  },

  updateShuffleButton: () => {
    const shuffleBtn = $byId(IDS.shuffleBtn);
    if (shuffleBtn) {
      shuffleBtn.classList.toggle(CLASSES.active, appState.shuffleMode);
    }
  },

  updateRepeatButton: () => {
    const repeatBtn = $byId(IDS.repeatBtn);
    if (repeatBtn) {
      repeatBtn.classList.toggle(CLASSES.active, appState.repeatMode !== REPEAT_MODES.OFF);
      repeatBtn.classList.toggle(CLASSES.repeatOne, appState.repeatMode === REPEAT_MODES.ONE);
    }
  },

  updateFavoriteButton: () => {
    if (!appState.currentSong) return;
    const favoriteBtn = $byId(IDS.favoriteBtn);
    if (favoriteBtn) {
      const isFavorite = appState.favorites.has("songs", appState.currentSong.id);
      favoriteBtn.classList.toggle("favorited", isFavorite);
      favoriteBtn.classList.toggle(CLASSES.active, isFavorite);
      favoriteBtn.setAttribute("data-favorite-songs", appState.currentSong.id);
      const heartIcon = favoriteBtn.querySelector("svg");
      if (heartIcon) {
        heartIcon.style.color = isFavorite ? "#ef4444" : "";
        heartIcon.style.fill = isFavorite ? "currentColor" : "none";
      }
    }
  },

  updateCounts: () => {
    const counts = {
      [IDS.favoriteSongsCount]: appState.favorites.songs.size,
      [IDS.favoriteArtistsCount]: appState.favorites.artists.size,
      [IDS.recentCount]: appState.recentlyPlayed.length,
      [IDS.queueCount]: appState.queue.items.length,
    };

    Object.entries(counts).forEach(([id, value]) => {
      const element = $byId(id);
      if (element) element.textContent = value;
    });
  },

  updateMusicPlayer: () => {
    ui.updateNowPlaying();
    ui.updateShuffleButton();
    ui.updateRepeatButton();
  },
};
