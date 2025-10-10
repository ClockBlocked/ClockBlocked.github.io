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
      
      .recent-tracks, .album-grid, .artist-grid, .playlists-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .recent-track, .playlist-card {
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
      
      .recent-track:hover, .playlist-card:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }
      
      .track-art, .artist-avatar {
        width: 40px;
        height: 40px;
        border-radius: 0.25rem;
        object-fit: cover;
        flex-shrink: 0;
      }
      
      .artist-avatar {
        border-radius: 50%;
      }
      
      .track-info, .playlist-info {
        flex: 1;
        min-width: 0;
      }
      
      .track-title, .playlist-name {
        font-weight: 500;
        margin-bottom: 0.125rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .track-artist, .playlist-tracks {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .track-artist:hover {
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
      
      .artist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;
      }
      
      .artist-card {
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .artist-card:hover {
        transform: scale(1.05);
      }
      
      .artist-name {
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
      
      .play-button-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.2s ease;
        background: rgba(59, 130, 246, 0.9);
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      
      .recent-track:hover .play-button-overlay,
      .artist-card:hover .play-button-overlay {
        opacity: 1;
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

  renderRecentlyPlayed: () => {
    const container = $byId(IDS.recentlyPlayedSection);
    if (!container) return;

    if (!appState.recentlyPlayed || appState.recentlyPlayed.length === 0) {
      container.innerHTML = homePage.renderEmptyState("No recently played tracks", "music-note");
      return;
    }

    const recentTracks = appState.recentlyPlayed.slice(0, 5);
    container.innerHTML = render.homeSection.recentlyPlayed(recentTracks, utils);

    container.querySelectorAll(".recent-track").forEach((track) => {
      track.addEventListener("click", (e) => {
        if (e.target.closest(".track-artist")) return;

        try {
          const songData = JSON.parse(track.dataset.song);
          musicPlayer.ui.playSong(songData);
        } catch (error) {}
      });
    });

    container.querySelectorAll(".track-artist").forEach((artistEl) => {
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
          appState.router.navigateTo(ROUTES.ARTIST, {
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

    container.querySelectorAll(".artist-card").forEach((artistEl) => {
      artistEl.addEventListener("click", () => {
        const artistName = artistEl.dataset.artist;
        if (appState.router) {
          appState.router.navigateTo(ROUTES.ARTIST, {
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

    container.querySelectorAll(".playlist-card").forEach((playlistEl) => {
      playlistEl.addEventListener("click", () => {
        const playlistId = playlistEl.dataset.playlistId;
        playlists.show(playlistId);
      });
    });

    const createBtn = container.querySelector(".create-playlist-btn");
    if (createBtn) {
      createBtn.addEventListener("click", () => {
        const newPlaylist = playlists.create();
        if (newPlaylist) {
          setTimeout(() => homePage.renderPlaylists(), 100);
        }
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

    container.querySelectorAll(".recent-track").forEach((track) => {
      track.addEventListener("click", (e) => {
        if (e.target.closest(".track-artist") || e.target.closest(".favorite-heart")) return;

        try {
          const songData = JSON.parse(track.dataset.song);
          musicPlayer.ui.playSong(songData);
        } catch (error) {}
      });
    });

    container.querySelectorAll(".track-artist").forEach((artistEl) => {
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

    container.querySelectorAll(".favorite-heart").forEach((heartBtn) => {
      heartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const songId = heartBtn.dataset.songId;
        appState.favorites.remove("songs", songId);

        const track = heartBtn.closest(".recent-track");
        track.style.transition = "all 0.3s ease";
        track.style.opacity = "0";
        track.style.transform = "translateX(-20px)";

        setTimeout(() => {
          track.remove();
          const remaining = container.querySelectorAll(".recent-track");
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

    return `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-3 opacity-50">
          ${icons[iconType] || icons["music-note"]}
        </svg>
        <p>${message}</p>
      </div>
    `;
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
              <div class="page-header mb-8">
                <h1 class="text-3xl font-bold mb-2">Favorite Songs</h1>
                <p class="text-gray-400">${favoriteSongs.length} song${favoriteSongs.length !== 1 ? "s" : ""}</p>
                <div class="flex gap-4 mt-4">
                  <button class="play-all-btn bg-accent-primary text-white px-6 py-2 rounded-full hover:bg-accent-secondary transition-colors flex items-center gap-2">
                    ${ICONS.play}
                    Play All
                  </button>
                  <button class="shuffle-all-btn bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-500 transition-colors flex items-center gap-2">
                    ${ICONS.shuffle}
                    Shuffle
                  </button>
                </div>
              </div>
              <div class="songs-list">
                ${favoriteSongs
                  .map(
                    (song, index) => `
                  <div class="song-row flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}'>
                    <div class="track-number text-gray-400 w-8 text-center">${index + 1}</div>
                    <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="w-12 h-12 rounded object-cover">
                    <div class="song-info flex-1">
                      <div class="song-title font-medium">${song.title}</div>
                      <div class="song-artist text-gray-400 text-sm cursor-pointer hover:text-white transition-colors" data-artist="${song.artist}">${song.artist}</div>
                    </div>
                    <div class="album-name text-gray-400 text-sm hidden md:block">${song.album}</div>
                    <div class="song-duration text-gray-400 text-sm">${song.duration || "0:00"}</div>
                    <div class="song-actions flex items-center gap-2">
                      <button class="action-btn p-2 hover:bg-white/10 rounded transition-colors" data-action="favorite" data-song-id="${song.id}" title="Remove from favorites">
                        <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      </button>
                      <button class="action-btn p-2 hover:bg-white/10 rounded transition-colors" data-action="add-queue" title="Add to queue">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      </button>
                      <button class="action-btn p-2 hover:bg-white/10 rounded transition-colors" data-action="add-playlist" title="Add to playlist">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"/></svg>
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
            modalEl.innerHTML = `
                <div class="modal-content slide-in">
                    <div class="modal-header">
                        <div>
                            <h2 class="modal-title">Favorite Artists</h2>
                            <div class="artist-count">0 artists</div>
                        </div>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="artists-list"></div>
                </div>
            `;
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
            artistsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">♡</div>
                    <h3 class="empty-title">No Favorite Artists</h3>
                    <p class="empty-text">You haven't added any artists to your favorites yet.</p>
                    <p class="empty-subtext">Browse artists and click the heart icon to add favorites.</p>
                </div>
            `;
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
                    console.error('Error playing song:', error);
                }
            });
        });

        root.querySelectorAll('.song-artist').forEach((artistEl) => {
            artistEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const artistName = artistEl.dataset.artist;
                if (appState.router) {
                    overlays.close('playlist-viewer');
                    appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
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
        return `
          <div class="empty-state text-center py-12">
            <div class="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">${title}</h3>
            <p class="text-gray-400 mb-2">${subtitle}</p>
            <p class="text-gray-500 text-sm">${description}</p>
          </div>
        `;
    },
};
/**
 * 
 *
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *  
 *    Copyright 2025
 *  William Cole Hanson
 * 
 * Chevrolay@Outlook.com
 * 
 *    m.me/Chevrolay
 * 
 * 
**/
