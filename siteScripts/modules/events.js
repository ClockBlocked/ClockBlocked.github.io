import { render, create } from './templates.js';
import { syncs } from './background.js';
import { pageManager } from './builder.js';

export const eventManager = {
  bindHomeEvents: function() {
    document.querySelectorAll("[data-view]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = link.dataset.view;

        switch (view) {
          case "recent":
            musicPlayer.mainPlayer.open();
            setTimeout(() => musicPlayer.mainPlayer.switchTab("recent"), 50);
            break;
          case "albums":
            notifications.show("Albums view coming soon");
            break;
          case "favorite-artists":
            pageManager.showFavoriteArtists();
            break;
          case "playlists":
            playlists.showAll();
            break;
          case "favorite-songs":
            pageManager.showFavoriteSongs();
            break;
          default:
            notifications.show("View coming soon");
        }
      });
    });
  },

  bindArtistPageEvents: function(artistData) {
    const playButton = document.querySelector("#artistPlay");
    if (playButton) {
      playButton.addEventListener("click", function () {
        eventManager.playArtistSongs(artistData);
      });
    }

    const followButton = document.querySelector("#artistFollow");
    if (followButton) {
      const isFavorite = appState.favorites.has("artists", artistData.artist);
      followButton.textContent = isFavorite ? "Unfavorite" : "Favorite";
      followButton.classList.toggle(CLASSES.active, isFavorite);
      followButton.addEventListener("click", function () {
        const wasFavorite = appState.favorites.toggle("artists", artistData.artist);
        followButton.textContent = wasFavorite ? "Unfavorite" : "Favorite";
        followButton.classList.toggle(CLASSES.active, wasFavorite);
      });
    }

    document.addEventListener("click", function (e) {
      const playAlbumBtn = e.target.closest(".play-album");
      if (playAlbumBtn) {
        e.stopPropagation();
        const activeTab = document.querySelector(".album-tab.active");
        if (activeTab) {
          const albumIndex = parseInt(activeTab.dataset.albumIndex);
          const album = artistData.albums[albumIndex];
          if (album) eventManager.playAlbumSongs(album, artistData.artist);
        }
      }
    });
  },

  bindAllArtistsEvents: function() {
    const artistSearch = $byId(IDS.artistSearch);
    if (artistSearch) {
      artistSearch.addEventListener("input", function (e) {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll(".artist-card").forEach(function (card) {
          const artistName = card.querySelector("h3").textContent.toLowerCase();
          const genreTag = card.querySelector(".genre-tag")?.textContent.toLowerCase() || "";
          const matches = artistName.includes(query) || genreTag.includes(query);
          card.parentElement.style.display = matches ? "block" : "none";
        });
      });
    }

    const genreFilters = $byId(IDS.genreFilters);
    if (genreFilters && window.music) {
      const genres = new Set();
      window.music.forEach(function (artist) {
        if (artist.genre) genres.add(artist.genre);
      });

      genreFilters.innerHTML = "";
      Array.from(genres)
        .sort()
        .forEach(function (genre) {
          const genreBtn = document.createElement("button");
          genreBtn.className = "px-3 py-1 text-xs font-medium rounded-full bg-bg-subtle hover:bg-bg-muted transition-colors";
          genreBtn.textContent = genre;

          genreBtn.addEventListener("click", function () {
            genreBtn.classList.toggle(CLASSES.active);
            genreBtn.classList.toggle("bg-accent-primary");
            genreBtn.classList.toggle("text-white");

            const activeFilters = Array.from(genreFilters.querySelectorAll("." + CLASSES.active)).map(function (btn) {
              return btn.textContent.toLowerCase();
            });

            document.querySelectorAll(".artist-card").forEach(function (card) {
              const cardGenre = card.querySelector(".genre-tag")?.textContent.toLowerCase() || "";
              card.parentElement.style.display = activeFilters.length === 0 || activeFilters.includes(cardGenre) ? "block" : "none";
            });
          });

          genreFilters.appendChild(genreBtn);
        });
    }
  },

  bindSongItemEvents: function(container) {
    if (!container) return;

    container.querySelectorAll(".song-item").forEach(function (songItem, itemIndex) {
      let clickCount = 0;
      let clickTimer = null;

      const songsContainer = songItem.closest(".songs-container");
      const songIndex = parseInt(songItem.dataset.index);

      if (!songsContainer._songsData) {
        songsContainer._songsData = [];
      }

      songItem.addEventListener("click", function (e) {
        if (e.target.closest(".song-actions") || e.target.closest("[data-action]")) return;

        clickCount++;
        if (clickCount === 1) {
          clickTimer = setTimeout(function () {
            clickCount = 0;
          }, 300);
        } else if (clickCount === 2) {
          clearTimeout(clickTimer);
          clickCount = 0;

          const songData = songsContainer._songsData[songIndex];
          if (songData) {
            musicPlayer.ui.playSong(songData);
          }
        }
      });

      const playButton = songItem.querySelector("[data-action='play']");
      if (playButton) {
        playButton.addEventListener("click", function (e) {
          e.stopPropagation();
          const songData = songsContainer._songsData[songIndex];
          if (songData) {
            musicPlayer.ui.playSong(songData);
          }
        });
      }

      const artistElement = songItem.querySelector("[data-artist]");
      if (artistElement) {
        artistElement.addEventListener("click", function (e) {
          e.stopPropagation();
          const artistName = artistElement.dataset.artist;
          appState.router.navigateToArtist(artistName);
        });
      }

      songItem.querySelectorAll("[data-action]").forEach(function (actionBtn) {
        actionBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          const action = actionBtn.dataset.action;
          const songData = JSON.parse(songItem.dataset.song);
          const context = songItem.dataset.context || "base";

          if (action === "more") {
            eventManager.showMoreActionsPopover(actionBtn, songData, context);
          } else {
            eventManager.handleSongAction(action, songData, context);
          }
        });
      });
    });
  },

  playArtistSongs: function(artistData) {
    const allSongs = [];
    artistData.albums.forEach(function (album) {
      album.songs.forEach(function (song) {
        allSongs.push({
          ...song,
          artist: artistData.artist,
          album: album.album,
          cover: utils.getAlbumImageUrl(album.album),
        });
      });
    });

    if (allSongs.length > 0) {
      appState.queue.clear();
      allSongs.slice(1).forEach(function (song) {
        appState.queue.add(song);
      });
      musicPlayer.ui.playSong(allSongs[0]);
    }
  },

  playAlbumSongs: function(album, artistName) {
    if (album.songs.length === 0) return;

    appState.queue.clear();
    album.songs.slice(1).forEach(function (song) {
      appState.queue.add({
        ...song,
        artist: artistName,
        album: album.album,
        cover: utils.getAlbumImageUrl(album.album),
      });
    });

    musicPlayer.ui.playSong({
      ...album.songs[0],
      artist: artistName,
      album: album.album,
      cover: utils.getAlbumImageUrl(album.album),
    });
  },

  handleSongAction: function(action, songData, context) {
    switch (action) {
      case "favorite":
        const wasFavorite = appState.favorites.toggle("songs", songData.id);
        const message = wasFavorite ? 'Added "' + songData.title + '" to your favorite music' : 'Removed "' + songData.title + '" from your favorite music';
        notifications.show(message, wasFavorite ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.INFO);
        break;

      case "play-next":
        appState.queue.add(songData, 0);
        notifications.show('"' + songData.title + '" will play next', NOTIFICATION_TYPES.SUCCESS);
        break;

      case "add-queue":
        appState.queue.add(songData);
        notifications.show('Added "' + songData.title + '" to queue', NOTIFICATION_TYPES.SUCCESS);
        break;

      case "add-playlist":
        eventManager.showPlaylistSelector(songData);
        break;

      case "remove-from-playlist":
        const playlistContainer = document.querySelector("[data-playlist-id]");
        if (playlistContainer) {
          const playlistId = playlistContainer.dataset.playlistId;
          if (playlists.removeSong(playlistId, songData.id)) {
            playlists.show(playlistId);
            notifications.show('Removed "' + songData.title + '" from playlist', NOTIFICATION_TYPES.INFO);
          }
        }
        break;

      case "download":
        notifications.show("Download feature coming soon", NOTIFICATION_TYPES.INFO);
        break;

      case "share":
        eventManager.shareSong(songData);
        break;

      case "view-artist":
        appState.router.navigateToArtist(songData.artist);
        break;

      default:
    }
  },

  showMoreActionsPopover: function(triggerButton, songData, context) {
    document.querySelectorAll(".more-actions-popover").forEach(function (p) {
      p.remove();
    });

    const popover = document.createElement("div");
    popover.className = "more-actions-popover";
    popover.innerHTML = render.actionPopover(ACTION_GRID_ITEMS);
    document.body.appendChild(popover);

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const triggerRect = triggerButton.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    let left = triggerRect.right + 8;
    let top = triggerRect.top;

    if (left + popoverRect.width > viewport.width - 16) {
      left = triggerRect.left - popoverRect.width - 8;
      if (left < 16) {
        left = Math.max(16, Math.min(viewport.width - popoverRect.width - 16, triggerRect.left + (triggerRect.width - popoverRect.width) / 2));
      }
    }

    if (top + popoverRect.height > viewport.height - 16) {
      top = Math.max(16, viewport.height - popoverRect.height - 16);
    }

    top = Math.max(16, top);

    popover.style.left = left + "px";
    popover.style.top = top + "px";

    popover.querySelectorAll(".popover-action-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const action = btn.dataset.action;
        popover.remove();
        eventManager.handleSongAction(action, songData, context);
      });
    });

    const closePopover = function (e) {
      if (!popover.contains(e.target) && !triggerButton.contains(e.target)) {
        popover.remove();
        document.removeEventListener("click", closePopover);
        document.removeEventListener("keydown", escapeHandler);
      }
    };

    const escapeHandler = function (e) {
      if (e.key === "Escape") {
        popover.remove();
        document.removeEventListener("click", closePopover);
        document.removeEventListener("keydown", escapeHandler);
      }
    };

    setTimeout(function () {
      document.addEventListener("click", closePopover);
      document.addEventListener("keydown", escapeHandler);
    }, 100);
  }
};