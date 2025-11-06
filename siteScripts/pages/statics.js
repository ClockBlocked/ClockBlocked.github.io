import {
  appState,
  storage,
  notifications,
  musicPlayer,
  utils,
  navigation,
  playlists,
  overlays,
} from '../global.js';

import * as PAGE from '../map.js';
import { ui } from './updates.js';
import { render } from '../utilities/templates.js';

export const homePage = {
  initialize: () => {
    appState.homePageManager = {
      renderHomePage: homePage.render,
    };
  },

  render: () => {
    const dynamicContent = $byId(IDS.dynamicContent);
    if (!dynamicContent) return;

    dynamicContent.innerHTML = "";
    dynamicContent.innerHTML = render.page("home_bento", { IDS: window.IDS });

    homePage.addStyles();

    setTimeout(() => homePage.renderRecentlyPlayed(), 100);
    setTimeout(() => homePage.renderRandomAlbums(), 300);
    setTimeout(() => homePage.renderFavoriteArtists(), 500);
    setTimeout(() => homePage.renderPlaylists(), 700);
    setTimeout(() => homePage.renderFavoriteSongs(), 900);

    homePage.bindEvents();
  },

  addStyles: () => {
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
      
      /* Updated styles from templates.js for .modern-track-item */
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
        background-color: rgba(96, 165, 250, 0.3); /* Example color */
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
      
      /* Style for .modern-artist-card */
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
      
      /* --- ENHANCEMENT: Styles for Track, Playlist, and Favorite Song overlays --- */
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

      /* --- REVERT: Original styles for Artist overlay --- */
      .artist-play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6); /* Original background */
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease; /* Original transition */
        border-radius: 50%;
        cursor: pointer;
      }

      .modern-artist-card:hover .artist-play-overlay {
        opacity: 1;
      }
      /* --- END REVERT --- */


      .artist-artwork-container {
        border-radius: 50%;
      }

      /* --- ENHANCEMENT: New styles for Track, Playlist, and Favorite Song buttons --- */
      .track-play-btn, .playlist-play-btn, .favorite-play-btn {
        width: 2.5rem; /* 40px */
        height: 2.5rem; /* 40px */
        background: rgba(59, 130, 246, 0.9); /* Blue */
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
        width: 1.125rem; /* 18px */
        height: 1.125rem; /* 18px */
        margin-left: 2px; /* Optical centering */
      }
      
      /* --- REVERT: Original styles for Artist play button --- */
      .artist-play-btn {
        color: white;
        border: none;
        background: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem; /* 40px */
        height: 2.5rem; /* 40px */
        transition: transform 0.2s ease;
      }
      
      .artist-play-btn svg {
         width: 1.5rem; /* 24px */
         height: 1.5rem; /* 24px */
      }
      
      .artist-play-btn:hover {
        transform: scale(1.1);
      }
      /* --- END REVERT --- */
      
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

  renderRecentlyPlayed: () => {
    const container = $byId(IDS.recentlyPlayedSection);
    if (!container) return;

    if (!appState.recentlyPlayed || appState.recentlyPlayed.length === 0) {
      container.innerHTML = homePage.renderEmptyState("No recently played tracks", "music-note");
      return;
    }

    const recentTracks = appState.recentlyPlayed.slice(0, 5);
    container.innerHTML = render.homeSection.recentlyPlayed(recentTracks, utils);

    // *** UPDATED SELECTOR ***
    container.querySelectorAll(".modern-track-item").forEach((track) => {
      track.addEventListener("click", (e) => {
        // *** UPDATED CLASS ***
        if (e.target.closest(".track-artist-text") || e.target.closest(".track-action-btn")) return; // Also ignore other buttons

        try {
          const songData = JSON.parse(track.dataset.song);
          musicPlayer.ui.playSong(songData);
        } catch (error) {}
      });
    });

    // *** UPDATED SELECTOR ***
    container.querySelectorAll(".track-artist-text").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = artistEl.dataset.artist;
        if (appState.router) {
          appState.router.navigateTo(PAGE.ROUTES.ARTIST, {
            artist: artistName,
          });
        }
      });
    });
  },

  renderRandomAlbums: () => {
    const container = $byId(IDS.randomAlbumsSection);
    if (!container) return;

    const albums = homePage.getRandomAlbums(6);

    if (!albums || albums.length === 0) {
      container.innerHTML = homePage.renderEmptyState("No albums found", "album");
      return;
    }

    container.innerHTML = render.homeSection.randomAlbums(albums, utils);

    // This section's selectors were already correct!
    container.querySelectorAll(".album-play-btn").forEach((playBtn) => {
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = playBtn.dataset.artist;
        const albumName = playBtn.dataset.album;
        homePage.playAlbum(artistName, albumName);
      });
    });

    container.querySelectorAll(".album-card").forEach((albumCard) => {
      albumCard.addEventListener("click", (e) => {
        if (e.target.closest(".album-play-btn") || e.target.closest(".album-artist")) return;

        const artistName = albumCard.dataset.artist;
        const albumName = albumCard.dataset.album;
        homePage.playAlbum(artistName, albumName);
      });
    });

    container.querySelectorAll(".album-artist").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = artistEl.dataset.artist;
        const albumCard = artistEl.closest('.album-card');
        const albumName = albumCard ? albumCard.dataset.album : null;
        
        if (appState.router) {
          appState.router.navigateTo(PAGE.ROUTES.ARTIST, {
            artist: artistName,
          });
          
          if (albumName) {
            sessionStorage.setItem('pendingAlbumLoad', albumName);
            
            setTimeout(() => {
              const storedAlbum = sessionStorage.getItem('pendingAlbumLoad');
              if (storedAlbum === albumName) {
                const artistData = window.music?.find((a) => a.artist === artistName);
                if (artistData) {
                  navigation.pages.loadArtistPage(artistData, albumName);
                }
                sessionStorage.removeItem('pendingAlbumLoad');
              }
            }, 100);
          }
        }
      });
    });
  },

  renderFavoriteArtists: () => {
    const container = $byId(IDS.favoriteArtistsSection);
    if (!container) return;

    if (!appState.favorites.artists || appState.favorites.artists.size === 0) {
      container.innerHTML = homePage.renderEmptyState("No favorite artists", "artist");
      return;
    }

    const artists = Array.from(appState.favorites.artists).slice(0, 6);
    container.innerHTML = render.homeSection.favoriteArtists(artists, utils);

    // *** UPDATED SELECTOR ***
    container.querySelectorAll(".modern-artist-card").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        if (e.target.closest(".artist-action-btn")) return; // Ignore action buttons
        const artistName = artistEl.dataset.artist;
        if (appState.router) {
          appState.router.navigateTo(PAGE.ROUTES.ARTIST, {
            artist: artistName,
          });
        }
      });
    });
  },

  renderPlaylists: () => {
    const container = $byId(IDS.playlistsSection);
    if (!container) return;

    let html = "";

    if (!appState.playlists || appState.playlists.length === 0) {
      html = homePage.renderEmptyState("No playlists yet", "playlist");
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

    // *** UPDATED SELECTOR ***
    container.querySelectorAll(".modern-playlist-card").forEach((playlistEl) => {
      playlistEl.addEventListener("click", (e) => {
        if (e.target.closest(".playlist-action-btn")) return; // Ignore action buttons
        const playlistId = playlistEl.dataset.playlistId;
        playlists.show(playlistId);
      });
    });

    const createBtn = container.querySelector(".create-playlist-btn");
    if (createBtn) {
      createBtn.addEventListener("click", () => {
        playlists.create().then(newPlaylist => { // Wait for the async create to finish
          if (newPlaylist) {
            setTimeout(() => homePage.renderPlaylists(), 100); // Re-render if successful
          }
        });
      });
    }
  },

  renderFavoriteSongs: () => {
    const container = $byId(IDS.favoriteSongsSection);
    if (!container) return;

    if (!appState.favorites.songs || appState.favorites.songs.size === 0) {
      container.innerHTML = homePage.renderEmptyState("No favorite songs", "heart");
      return;
    }

    const songs = homePage.getSongsByIds(Array.from(appState.favorites.songs).slice(0, 5));
    container.innerHTML = render.homeSection.favoriteSongs(songs, utils);

    // *** UPDATED SELECTOR ***
    container.querySelectorAll(".modern-favorite-item").forEach((track) => {
      track.addEventListener("click", (e) => {
        // *** UPDATED CLASSES ***
        if (e.target.closest(".favorite-artist-text") || e.target.closest(".favorite-action-btn")) return;

        try {
          const songData = JSON.parse(track.dataset.song);
          musicPlayer.ui.playSong(songData);
        } catch (error) {}
      });
    });

    // *** UPDATED SELECTOR ***
    container.querySelectorAll(".favorite-artist-text").forEach((artistEl) => {
      artistEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const artistName = artistEl.dataset.artist;
        if (appState.router) {
          appState.router.navigateTo(PAGE.ROUTES.ARTIST, {
            artist: artistName,
          });
        }
      });
    });

    // *** UPDATED SELECTOR ***
    container.querySelectorAll(".favorite-heart-btn").forEach((heartBtn) => {
      heartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const songId = heartBtn.dataset.songId;
        appState.favorites.remove("songs", songId);

        // *** UPDATED CLASS ***
        const track = heartBtn.closest(".modern-favorite-item");
        track.style.transition = "all 0.3s ease";
        track.style.opacity = "0";
        track.style.transform = "translateX(-20px)";

        setTimeout(() => {
          track.remove();
          // *** UPDATED CLASS ***
          const remaining = container.querySelectorAll(".modern-favorite-item");
          if (remaining.length === 0) {
            homePage.renderFavoriteSongs();
          }
        }, 300);
      });
    });
  },

  bindEvents: () => {
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
            views.showFavoriteArtists();
            break;
          case "playlists":
            playlists.showAll();
            break;
          case "favorite-songs":
            views.showFavoriteSongs();
            break;
          default:
            notifications.show("View coming soon");
        }
      });
    });
  },

  getRandomAlbums: (count = 6) => {
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

  getSongsByIds: (ids) => {
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

  playAlbum: (artistName, albumName) => {
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

  renderEmptyState: (message, iconType) => {
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
};

export const views = {
    showFavoriteSongs: () => {
        const favoriteSongIds = Array.from(appState.favorites.songs);
        if (favoriteSongIds.length === 0) {
            overlays.viewer.playlists(
                views.renderEmptyState(
                    "No Favorite Songs", 
                    "You haven't added any songs to your favorites yet.", 
                    "Browse your music and click the heart icon to add favorites."
                )
            );
            return;
        }

        const favoriteSongs = views.getSongsByIds(favoriteSongIds);

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
                  <div class="song-row" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}'>
                    <div class="track-number">${index + 1}</div>
                    <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="song-cover">
                    <div class="song-info">
                      <div class="song-title">${song.title}</div>
                      <div class="song-artist" data-artist="${song.artist}">${song.artist}</div>
                    </div>
                    <div class="album-name">${song.album}</div>
                    <div class="song-duration">${song.duration || "0:00"}</div>
                    <div class="song-actions">
                      <button class="action-btn" data-action="favorite" data-song-id="${song.id}" title="Remove from favorites">
                        <svg class="action-icon icon-red" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      </button>
                      <button class="action-btn" data-action="add-queue" title="Add to queue">
                        <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      </button>
                      <button class="action-btn" data-action="add-playlist" title="Add to playlist">
                        <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"/></svg>
                      </button>
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
        views.bindFavoriteSongsEvents(modalEl);
    },

    showFavoriteArtists: () => {
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
                            appState.router.navigateTo(PAGE.ROUTES.ARTIST, { artist: artistName });
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
                        navigation.actions.playArtistSongs(artistData);
                    }
                });
            });
        }
        
        modalEl.style.display = 'flex';
    },

    bindFavoriteSongsEvents: (root) => {
        if (!root) return;

        const playAllBtn = root.querySelector('.play-all-btn');
        if (playAllBtn) {
            playAllBtn.addEventListener('click', () => {
                const favoriteSongIds = Array.from(appState.favorites.songs);
                const favoriteSongs = views.getSongsByIds(favoriteSongIds);
                
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
                let favoriteSongs = views.getSongsByIds(favoriteSongIds);
                
                if (favoriteSongs.length > 0) {
                    for (let i = favoriteSongs.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [favoriteSongs[i], favoriteSongs[j]] = [favoriteSongs[j], favoriteSongs[i]];
                    }
                    
                    appState.queue.clear();
                    favoriteSongs.slice(1).forEach((song) => appState.queue.add(song));
                    musicPlayer.ui.playSong(favoriteSongs[0]);
                    appState.shuffleMode = true;
                    ui.updateShuffleButton();
                    notifications.show("Shuffling favorite songs", NOTIFICATION_TYPES.SUCCESS);
                }
            });
        }

        root.querySelectorAll('.song-row').forEach((row) => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.action-btn') || e.target.closest('.song-artist')) return;

                try {
                    const songData = JSON.parse(row.dataset.song);
                    musicPlayer.ui.playSong(songData);
                } catch (error) {
                }
            });
        });

        root.querySelectorAll('.song-artist').forEach((artistEl) => {
            artistEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const artistName = artistEl.dataset.artist;
                if (appState.router) {
                    overlays.close('playlist-viewer');
                    appState.router.navigateTo(PAGE.ROUTES.ARTIST, { artist: artistName });
                }
            });
        });

        root.querySelectorAll('.action-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const songRow = btn.closest('.song-row');
                const songData = JSON.parse(songRow.dataset.song);

                switch (action) {
                    case 'favorite':
                        appState.favorites.remove('songs', songData.id);
                        songRow.style.transition = 'all 0.3s ease';
                        songRow.style.opacity = '0';
                        songRow.style.transform = 'translateX(-20px)';
                        
                        setTimeout(() => {
                            songRow.remove();
                            const remaining = root.querySelectorAll('.song-row');
                            if (remaining.length === 0) {
                                overlays.close('playlist-viewer');
                            }
                        }, 300);
                        break;
                    case 'add-queue':
                        appState.queue.add(songData);
                        break;
                    case 'add-playlist':
                        navigation.actions.showPlaylistSelector(songData);
                        break;
                }
            });
        });
    },

    getSongsByIds: (songIds) => {
        const allSongs = [];
        if (window.music) {
            window.music.forEach((artist) => {
                artist.albums.forEach((album) => {
                    album.songs.forEach((song) => {
                        if (songIds.includes(song.id)) {
                            allSongs.push({
                                ...song,
                                artist: artist.artist,
                                album: album.album,
                                cover: utils.getAlbumImageUrl(album.album),
                            });
                        }
                    });
                });
            });
        }
        return allSongs;
    },

    renderEmptyState: (title, subtitle, description) => {
        const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>`;
        
        return render.emptyState({
          icon: icon,
          title: title,
          subtitle: subtitle,
          subtext: description
        });
    },
};
/**
 * *
 * * * * * * * * * * * * * Copyright 2025
 * William Cole Hanson
 * * Chevrolay@Outlook.com
 * * m.me/Chevrolay
 * * **/