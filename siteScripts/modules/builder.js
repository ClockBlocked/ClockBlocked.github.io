import { appState, storage, utils, playlists, overlays, ACTION_GRID_ITEMS } from './global.js';
import { render, create } from './templates.js';
import { syncs } from './background.js';
import { musicPlayer } from './musicPlayers.js';
import { notifications } from './toasts.js';

export const pageManager = {
  initialize: function() {
    appState.homePageManager = {
      renderHomePage: this.renderHomePage.bind(this),
    };
  },

  renderHomePage: function() {
    const dynamicContent = $byId(IDS.dynamicContent);
    if (!dynamicContent) return;

    dynamicContent.innerHTML = "";
    dynamicContent.innerHTML = render.page("home_bento", { IDS: window.IDS });

    this.addHomeStyles();

    setTimeout(() => this.renderRecentlyPlayed(), 100);
    setTimeout(() => this.renderRandomAlbums(), 300);
    setTimeout(() => this.renderFavoriteArtists(), 500);
    setTimeout(() => this.renderPlaylists(), 700);
    setTimeout(() => this.renderFavoriteSongs(), 900);

    this.bindHomeEvents();
  },

  addHomeStyles: function() {
    if ($byId("bento-grid-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "bento-grid-styles";
    styleEl.textContent = `
      .bento-grid {
        display: grid;
        gap: 1.5rem;
      }
      
      .bento-card {
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .bento-card:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .card-content {
        min-height: 200px;
      }
      
      .skeleton-loader {
        height: 200px;
        background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 0.5rem;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      .modern-track-item, .modern-favorite-item, .modern-playlist-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .modern-track-item:hover, .modern-favorite-item:hover, .modern-playlist-card:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }

      .track-artwork-container, .favorite-artwork-container, .playlist-artwork-container, .artist-artwork-container {
        width: 40px;
        height: 40px;
        border-radius: 0.25rem;
        flex-shrink: 0;
        position: relative;
        overflow: hidden;
      }

      .track-artwork, .favorite-artwork, .artist-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .playlist-icon-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(96, 165, 250, 0.3);
      }

      .track-content, .favorite-content, .playlist-content, .artist-content {
        flex: 1;
        min-width: 0;
      }

      .track-title-text, .favorite-title-text, .playlist-name-text, .artist-name-text {
        font-weight: 500;
        margin-bottom: 0.125rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .track-artist-text, .favorite-artist-text, .playlist-tracks-text, .artist-label {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .track-artist-text:hover, .favorite-artist-text:hover {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: underline;
      }
      
      .album-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }
      
      .album-card {
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s ease;
        position: relative;
      }
      
      .album-cover {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 0.5rem;
        object-fit: cover;
        margin-bottom: 0.5rem;
        position: relative;
      }
      
      .album-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .album-card:hover .album-overlay {
        opacity: 1;
      }
      
      .album-play-btn {
        width: 3rem;
        height: 3rem;
        background: rgba(59, 130, 246, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .album-play-btn:hover {
        transform: scale(1.1);
        background: rgba(59, 130, 246, 1);
      }
      
      .album-play-btn svg {
        width: 1.2rem;
        height: 1.2rem;
      }
      
      .album-info {
        font-size: 0.875rem;
      }
      
      .album-title {
        font-weight: 500;
        margin-bottom: 0.125rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .album-artist {
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .album-artist:hover {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: underline;
      }
      
      .modern-artist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;
      }
      
      .modern-artist-card {
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s ease;
        position: relative;
      }
      
      .modern-artist-card:hover {
        transform: scale(1.05);
      }
      
      .artist-avatar-image {
        border-radius: 50%;
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
      }
      
      .artist-name-text {
        font-size: 0.875rem;
        font-weight: 500;
        margin-top: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .create-playlist-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        background: rgba(59, 130, 246, 0.1);
        border: 1px dashed rgba(59, 130, 246, 0.3);
        color: rgb(59, 130, 246);
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        margin-top: 0.5rem;
        text-align: center;
        justify-content: center;
      }
      
      .create-playlist-btn:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.5);
        transform: translateY(-1px);
      }
      
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.875rem;
        text-align: center;
        padding: 2rem 1rem;
      }
      
      .empty-state svg {
        margin-bottom: 1rem;
        opacity: 0.6;
      }
      
      .track-play-overlay, .playlist-play-overlay, .favorite-play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.95);
        transition: opacity 0.2s ease, transform 0.2s ease;
        border-radius: 0.25rem;
        cursor: pointer;
      }
      
      .modern-track-item:hover .track-play-overlay,
      .modern-playlist-card:hover .playlist-play-overlay,
      .modern-favorite-item:hover .favorite-play-overlay {
        opacity: 1;
        transform: scale(1);
      }

      .artist-play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 50%;
        cursor: pointer;
      }

      .modern-artist-card:hover .artist-play-overlay {
        opacity: 1;
      }

      .artist-artwork-container {
        border-radius: 50%;
      }

      .track-play-btn, .playlist-play-btn, .favorite-play-btn {
        width: 2.5rem;
        height: 2.5rem;
        background: rgba(59, 130, 246, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        transform: scale(1);
      }

      .track-play-btn:hover, .playlist-play-btn:hover, .favorite-play-btn:hover {
        transform: scale(1.1);
        background: rgba(59, 130, 246, 1);
      }

      .track-play-btn svg, .playlist-play-btn svg, .favorite-play-btn svg {
        width: 1.125rem;
        height: 1.125rem;
        margin-left: 2px;
      }
      
      .artist-play-btn {
        color: white;
        border: none;
        background: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        transition: transform 0.2s ease;
      }
      
      .artist-play-btn svg {
         width: 1.5rem;
         height: 1.5rem;
      }
      
      .artist-play-btn:hover {
        transform: scale(1.1);
      }
      
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleEl);
  },

  renderRecentlyPlayed: function() {
    const container = $byId(IDS.recentlyPlayedSection);
    if (!container) return;

    if (!appState.recentlyPlayed || appState.recentlyPlayed.length === 0) {
      container.innerHTML = this.renderEmptyState("No recently played tracks", "music-note");
      return;
    }

    const recentTracks = appState.recentlyPlayed.slice(0, 5);
    container.innerHTML = render.homeSection.recentlyPlayed(recentTracks, utils);

    container.querySelectorAll(".modern-track-item").forEach((track) => {
      track.addEventListener("click", (e) => {
        if (e.target.closest(".track-artist-text") || e.target.closest(".track-action-btn")) return;
        try {
          const songData = JSON.parse(track.dataset.song);
          musicPlayer.ui.playSong(songData);
        } catch (error) {}
      });
    });

    container.querySelectorAll(".track-artist-text").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = artistEl.dataset.artist;
        if (appState.router) {
          appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
        }
      });
    });
  },

  renderRandomAlbums: function() {
    const container = $byId(IDS.randomAlbumsSection);
    if (!container) return;

    const albums = this.getRandomAlbums(6);
    if (!albums || albums.length === 0) {
      container.innerHTML = this.renderEmptyState("No albums found", "album");
      return;
    }

    container.innerHTML = render.homeSection.randomAlbums(albums, utils);

    container.querySelectorAll(".album-play-btn").forEach((playBtn) => {
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = playBtn.dataset.artist;
        const albumName = playBtn.dataset.album;
        this.playAlbum(artistName, albumName);
      });
    });

    container.querySelectorAll(".album-card").forEach((albumCard) => {
      albumCard.addEventListener("click", (e) => {
        if (e.target.closest(".album-play-btn") || e.target.closest(".album-artist")) return;
        const artistName = albumCard.dataset.artist;
        const albumName = albumCard.dataset.album;
        this.playAlbum(artistName, albumName);
      });
    });

    container.querySelectorAll(".album-artist").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = artistEl.dataset.artist;
        const albumCard = artistEl.closest('.album-card');
        const albumName = albumCard ? albumCard.dataset.album : null;
        
        if (appState.router) {
          appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
          
          if (albumName) {
            sessionStorage.setItem('pendingAlbumLoad', albumName);
            
            setTimeout(() => {
              const storedAlbum = sessionStorage.getItem('pendingAlbumLoad');
              if (storedAlbum === albumName) {
                const artistData = window.music?.find((a) => a.artist === artistName);
                if (artistData) {
                  this.loadArtistPage(artistData, albumName);
                }
                sessionStorage.removeItem('pendingAlbumLoad');
              }
            }, 100);
          }
        }
      });
    });
  },

  renderFavoriteArtists: function() {
    const container = $byId(IDS.favoriteArtistsSection);
    if (!container) return;

    if (!appState.favorites.artists || appState.favorites.artists.size === 0) {
      container.innerHTML = this.renderEmptyState("No favorite artists", "artist");
      return;
    }

    const artists = Array.from(appState.favorites.artists).slice(0, 6);
    container.innerHTML = render.homeSection.favoriteArtists(artists, utils);

    container.querySelectorAll(".modern-artist-card").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        if (e.target.closest(".artist-action-btn")) return;
        const artistName = artistEl.dataset.artist;
        if (appState.router) {
          appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
        }
      });
    });
  },

  renderPlaylists: function() {
    const container = $byId(IDS.playlistsSection);
    if (!container) return;

    let html = "";
    if (!appState.playlists || appState.playlists.length === 0) {
      html = this.renderEmptyState("No playlists yet", "playlist");
    } else {
      const displayPlaylists = appState.playlists.slice(0, 3);
      html = render.homeSection.playlists(displayPlaylists);
    }

    html += `
      <button class="create-playlist-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        Create Playlist
      </button>
    `;

    container.innerHTML = html;

    container.querySelectorAll(".modern-playlist-card").forEach((playlistEl) => {
      playlistEl.addEventListener("click", (e) => {
        if (e.target.closest(".playlist-action-btn")) return;
        const playlistId = playlistEl.dataset.playlistId;
        playlists.show(playlistId);
      });
    });

    const createBtn = container.querySelector(".create-playlist-btn");
    if (createBtn) {
      createBtn.addEventListener("click", () => {
        playlists.create().then(newPlaylist => {
          if (newPlaylist) {
            setTimeout(() => this.renderPlaylists(), 100);
          }
        });
      });
    }
  },

  renderFavoriteSongs: function() {
    const container = $byId(IDS.favoriteSongsSection);
    if (!container) return;

    if (!appState.favorites.songs || appState.favorites.songs.size === 0) {
      container.innerHTML = this.renderEmptyState("No favorite songs", "heart");
      return;
    }

    const songs = this.getSongsByIds(Array.from(appState.favorites.songs).slice(0, 5));
    container.innerHTML = render.homeSection.favoriteSongs(songs, utils);

    container.querySelectorAll(".modern-favorite-item").forEach((track) => {
      track.addEventListener("click", (e) => {
        if (e.target.closest(".favorite-artist-text") || e.target.closest(".favorite-action-btn")) return;
        try {
          const songData = JSON.parse(track.dataset.song);
          musicPlayer.ui.playSong(songData);
        } catch (error) {}
      });
    });

    container.querySelectorAll(".favorite-artist-text").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = artistEl.dataset.artist;
        if (appState.router) {
          appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
        }
      });
    });

    container.querySelectorAll(".favorite-heart-btn").forEach((heartBtn) => {
      heartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const songId = heartBtn.dataset.songId;
        appState.favorites.remove("songs", songId);

        const track = heartBtn.closest(".modern-favorite-item");
        track.style.transition = "all 0.3s ease";
        track.style.opacity = "0";
        track.style.transform = "translateX(-20px)";

        setTimeout(() => {
          track.remove();
          const remaining = container.querySelectorAll(".modern-favorite-item");
          if (remaining.length === 0) {
            this.renderFavoriteSongs();
          }
        }, 300);
      });
    });
  },

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
            this.showFavoriteArtists();
            break;
          case "playlists":
            playlists.showAll();
            break;
          case "favorite-songs":
            this.showFavoriteSongs();
            break;
          default:
            notifications.show("View coming soon");
        }
      });
    });
  },

  getRandomAlbums: function(count = 6) {
    if (!window.music) return [];
    const allAlbums = [];
    window.music.forEach((artist) => {
      artist.albums.forEach((album) => {
        allAlbums.push({
          artist: artist.artist,
          album: album.album,
          cover: utils.getAlbumImageUrl(album.album),
          songs: album.songs,
        });
      });
    });
    const shuffled = [...allAlbums].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  getSongsByIds: function(ids) {
    if (!window.music || !ids.length) return [];
    const songs = [];
    window.music.forEach((artist) => {
      artist.albums.forEach((album) => {
        album.songs.forEach((song) => {
          if (ids.includes(song.id)) {
            songs.push({
              ...song,
              artist: artist.artist,
              album: album.album,
              cover: utils.getAlbumImageUrl(album.album),
            });
          }
        });
      });
    });
    return songs;
  },

  playAlbum: function(artistName, albumName) {
    if (!window.music) return;
    const artist = window.music.find((a) => a.artist === artistName);
    if (!artist) return;
    const album = artist.albums.find((a) => a.album === albumName);
    if (!album || album.songs.length === 0) return;

    appState.queue.clear();
    album.songs.slice(1).forEach((song) => {
      appState.queue.add({
        ...song,
        artist: artistName,
        album: albumName,
        cover: utils.getAlbumImageUrl(albumName),
      });
    });

    musicPlayer.ui.playSong({
      ...album.songs[0],
      artist: artistName,
      album: albumName,
      cover: utils.getAlbumImageUrl(albumName),
    });

    notifications.show(`Playing album "${albumName}"`, NOTIFICATION_TYPES.SUCCESS);
  },

  renderEmptyState: function(message, iconType) {
    const icons = {
      "music-note": '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>',
      album: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>',
      artist: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
      playlist: '<path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>',
      heart: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
    };

    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-3 opacity-50">${icons[iconType] || icons["music-note"]}</svg>`;
    
    return render.emptyState({
      icon: iconSvg,
      title: '',
      subtitle: message
    });
  },

  showFavoriteSongs: function() {
    const favoriteSongIds = Array.from(appState.favorites.songs);
    if (favoriteSongIds.length === 0) {
      overlays.viewer.playlists(
        this.renderEmptyState(
          "No Favorite Songs", 
          "You haven't added any songs to your favorites yet.", 
          "Browse your music and click the heart icon to add favorites."
        )
      );
      return;
    }

    const favoriteSongs = this.getSongsByIds(favoriteSongIds);

    const content = `
      <div class="favorites-page animate__animated animate__fadeIn">
        <div class="page-header favorites-header">
          <h1 class="favorites-title">Favorite Songs</h1>
          <p class="favorites-count">${favoriteSongs.length} song${favoriteSongs.length !== 1 ? "s" : ""}</p>
          <div class="favorites-actions">
            <button class="play-all-btn">
              ${ICONS.play}
              Play All
            </button>
            <button class="shuffle-all-btn">
              ${ICONS.shuffle}
              Shuffle
            </button>
          </div>
        </div>
        <div class="songs-list">
          ${favoriteSongs
            .map(
              (song, index) => `
            <div class="song-item group flex items-center gap-4 p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/50 border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}'>
              <div class="flex items-center justify-center w-8">
                <span class="text-gray-400 group-hover:opacity-0 transition-opacity duration-200 text-sm font-medium">${index + 1}</span>
                <button class="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-green-500 hover:bg-green-600 w-8 h-8 rounded-full flex items-center justify-center play-button" data-action="play">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                </button>
              </div>

              <div class="flex-1 min-w-0">
                <div class="text-white font-medium truncate song-title">${song.title}</div>
                <div class="text-gray-400 text-sm truncate cursor-pointer hover:text-white transition-colors duration-200 artist-name" data-artist="${song.artist}">${song.artist}</div>
              </div>

              <div class="text-gray-400 text-sm font-medium song-duration">${song.duration || "0:00"}</div>

              <button class="p-2 rounded-full text-red-500 hover:text-red-400 transition-colors duration-200 favorite-button" data-action="favorite" data-song-id="${song.id}">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </button>

              <button class="p-2 rounded-full text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 more-button" data-action="more">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
    
    overlays.viewer.playlists(content);
    const modalEl = document.getElementById("playlist-viewer");
    this.bindFavoriteSongsEvents(modalEl);
  },

  showFavoriteArtists: function() {
    const favoriteArtistNames = Array.from(appState.favorites.artists);
    
    let modalEl = document.getElementById('favorite-artists-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'favorite-artists-modal';
      modalEl.className = 'modal-overlay';
      modalEl.innerHTML = render.favoriteArtistsModal();
      document.body.appendChild(modalEl);
      
      modalEl.querySelector('.close-btn').addEventListener('click', () => {
        modalEl.style.display = 'none';
      });
      
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          modalEl.style.display = 'none';
        }
      });
    }
    
    const artistsList = modalEl.querySelector('.artists-list');
    const artistCount = modalEl.querySelector('.artist-count');
    
    if (favoriteArtistNames.length === 0) {
      artistsList.innerHTML = render.emptyState({
        icon: '♡',
        title: 'No Favorite Artists',
        subtitle: "You haven't added any artists to your favorites yet.",
        subtext: 'Browse artists and click the heart icon to add favorites.'
      });
      artistCount.textContent = "0 artists";
    } else {
      const favoriteArtists = favoriteArtistNames
        .map((artistName) => window.music?.find((a) => a.artist === artistName))
        .filter(Boolean);
      
      artistCount.textContent = `${favoriteArtists.length} artist${favoriteArtists.length !== 1 ? "s" : ""}`;
      
      artistsList.innerHTML = favoriteArtists
        .map((artist) => {
          return `
            <div class="artist-item" data-artist="${artist.artist}">
              <div class="artist-image">
                <img src="${utils.getArtistImageUrl(artist.artist)}" alt="${artist.artist}">
                <button class="play-btn">
                  ${ICONS.play}
                </button>
              </div>
              <div class="artist-info">
                <div class="artist-name">${artist.artist}</div>
                <div class="song-count">${utils.getTotalSongs(artist)} song${utils.getTotalSongs(artist) !== 1 ? "s" : ""}</div>
              </div>
            </div>
          `;
        })
        .join('');
      
      const artistItems = artistsList.querySelectorAll('.artist-item');
      artistItems.forEach(item => {
        item.addEventListener('click', (e) => {
          if (!e.target.closest('.play-btn')) {
            const artistName = item.getAttribute('data-artist');
            if (appState.router) {
              appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
            }
          }
        });
      });
      
      const playButtons = artistsList.querySelectorAll('.play-btn');
      playButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const artistItem = button.closest('.artist-item');
          const artistName = artistItem.getAttribute('data-artist');
          const artistData = window.music?.find((a) => a.artist === artistName);
          if (artistData) {
            this.playArtistSongs(artistData);
          }
        });
      });
    }
    
    modalEl.style.display = 'flex';
  },

  bindFavoriteSongsEvents: function(root) {
    if (!root) return;

    const playAllBtn = root.querySelector('.play-all-btn');
    if (playAllBtn) {
      playAllBtn.addEventListener('click', () => {
        const favoriteSongIds = Array.from(appState.favorites.songs);
        const favoriteSongs = this.getSongsByIds(favoriteSongIds);
        
        if (favoriteSongs.length > 0) {
          appState.queue.clear();
          favoriteSongs.slice(1).forEach((song) => appState.queue.add(song));
          musicPlayer.ui.playSong(favoriteSongs[0]);
          notifications.show("Playing all favorite songs", NOTIFICATION_TYPES.SUCCESS);
        }
      });
    }

    const shuffleAllBtn = root.querySelector('.shuffle-all-btn');
    if (shuffleAllBtn) {
      shuffleAllBtn.addEventListener('click', () => {
        const favoriteSongIds = Array.from(appState.favorites.songs);
        let favoriteSongs = this.getSongsByIds(favoriteSongIds);
        
        if (favoriteSongs.length > 0) {
          for (let i = favoriteSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [favoriteSongs[i], favoriteSongs[j]] = [favoriteSongs[j], favoriteSongs[i]];
          }
          
          appState.queue.clear();
          favoriteSongs.slice(1).forEach((song) => appState.queue.add(song));
          musicPlayer.ui.playSong(favoriteSongs[0]);
          appState.shuffleMode = true;
          uiManager.updateShuffleButton();
          notifications.show("Shuffling favorite songs", NOTIFICATION_TYPES.SUCCESS);
        }
      });
    }

    root.querySelectorAll('.song-item').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-button') || e.target.closest('.more-button') || e.target.closest('.artist-name')) return;
        try {
          const songData = JSON.parse(row.dataset.song);
          musicPlayer.ui.playSong(songData);
        } catch (error) {}
      });
    });

    root.querySelectorAll('.artist-name').forEach((artistEl) => {
      artistEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const artistName = artistEl.dataset.artist;
        if (appState.router) {
          overlays.close('playlist-viewer');
          appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
        }
      });
    });

    root.querySelectorAll('.favorite-button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songRow = btn.closest('.song-item');
        const songData = JSON.parse(songRow.dataset.song);
        appState.favorites.remove('songs', songData.id);
        songRow.style.transition = 'all 0.3s ease';
        songRow.style.opacity = '0';
        songRow.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
          songRow.remove();
          const remaining = root.querySelectorAll('.song-item');
          if (remaining.length === 0) {
            overlays.close('playlist-viewer');
          }
        }, 300);
      });
    });

    root.querySelectorAll('.more-button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songRow = btn.closest('.song-item');
        const songData = JSON.parse(songRow.dataset.song);
        this.showMoreActionsPopover(btn, songData, 'favorites');
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
        this.handleSongAction(action, songData, context);
      }.bind(this));
    }.bind(this));

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
        this.showPlaylistSelector(songData);
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
        this.shareSong(songData);
        break;

      case "view-artist":
        appState.router.navigateToArtist(songData.artist);
        break;

      default:
    }
  },

  showPlaylistSelector: function(songData) {
    if (appState.playlists.length === 0) {
      overlays.dialog.confirm("No playlists found. Create a new playlist?", { okText: "Create Playlist", cancelText: "Cancel" }).then(function (confirmed) {
        if (confirmed) {
          playlists.create().then(function (playlist) {
            if (playlist) {
              playlists.addSong(playlist.id, songData);
            }
          });
        }
      });
      return;
    }

    const playlistOptions = appState.playlists
      .map(function (playlist) {
        return `
      <button class="playlist-option" data-playlist-id="${playlist.id}">
        <div class="playlist-icon">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
        <div class="playlist-info">
          <div class="playlist-name">${playlist.name}</div>
          <div class="playlist-count">${playlist.songs.length} songs</div>
        </div>
      </button>
    `;
      })
      .join("");

    const content = `
      <div class="playlist-selector">
        <h3 class="playlist-selector-title">Add to Playlist</h3>
        <div class="playlist-list">
          ${playlistOptions}
        </div>
        <div class="playlist-actions">
          <button class="create-new-playlist">
            <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Create New Playlist
          </button>
          <button class="cancel-playlist-selection">
            Cancel
          </button>
        </div>
      </div>
    `;

    overlays.open("playlist-selector", content, "playlist-selector");

    const modal = document.getElementById("playlist-selector");

    modal.querySelectorAll(".playlist-option").forEach(function (option) {
      option.addEventListener("click", function () {
        const playlistId = option.dataset.playlistId;
        playlists.addSong(playlistId, songData);
        overlays.close("playlist-selector");
      });
    });

    modal.querySelector(".create-new-playlist").addEventListener("click", async function () {
      overlays.close("playlist-selector");
      const newPlaylist = await playlists.create();
      if (newPlaylist) {
        playlists.addSong(newPlaylist.id, songData);
      }
    });

    modal.querySelector(".cancel-playlist-selection").addEventListener("click", function () {
      overlays.close("playlist-selector");
    });
  },

  shareSong: function(songData) {
    if (navigator.share) {
      navigator
        .share({
          title: songData.title,
          text: 'Listen to "' + songData.title + '" by ' + songData.artist,
          url: window.location.href,
        })
        .catch(function () {
          this.fallbackShare(songData);
        }.bind(this));
    } else {
      this.fallbackShare(songData);
    }
  },

  fallbackShare: function(songData) {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(function () {
          notifications.show("Song link copied to clipboard!", NOTIFICATION_TYPES.SUCCESS);
        })
        .catch(function () {
          notifications.show("Share feature not available", NOTIFICATION_TYPES.WARNING);
        });
    } else {
      notifications.show("Share feature not available", NOTIFICATION_TYPES.WARNING);
    }
  }
};