import { ui } from './updates.js';
import { render } from '../utilities/templates.js';

export const homePage = {
  initialize: () => {
    if (window.MyTunesApp) {
      window.MyTunesApp.state.homePageManager = {
        renderHomePage: homePage.render,
      };
    } else {
      console.error("MyTunesApp not initialized before homePage.initialize");
    }
  },

  render: () => {
    const dynamicContent = window.$byId(window.IDS.dynamicContent);
    if (!dynamicContent) return;

    dynamicContent.innerHTML = "";
    // Ensure data-loader attribute is present initially
    dynamicContent.innerHTML = render.page("home_bento", { IDS: window.IDS });

    homePage.addStyles();

    // Delay rendering slightly to allow DOM update
    setTimeout(() => homePage.renderRecentlyPlayed(), 50); // Reduced delay slightly
    setTimeout(() => homePage.renderRandomAlbums(), 100);
    setTimeout(() => homePage.renderFavoriteArtists(), 150);
    setTimeout(() => homePage.renderPlaylists(), 200);
    setTimeout(() => homePage.renderFavoriteSongs(), 250);

    homePage.bindEvents();
  },

  addStyles: () => {
    if (window.$byId("bento-grid-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "bento-grid-styles";
    // Using CSS directly here as provided by user
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
        position: relative; /* Needed for skeleton absolute positioning */
        overflow: hidden; /* Prevent skeleton overflow */
        display: flex; /* Ensure flex layout */
        flex-direction: column; /* Stack header and content */
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
        flex-shrink: 0; /* Prevent header from shrinking */
      }
       .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-100);
          margin: 0;
        }
        .card-link {
          font-size: 0.875rem;
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }
      
      .card-content {
        min-height: 200px;
        flex-grow: 1; /* Allow content to grow */
        position: relative; /* Position context for skeleton */
        overflow-y: auto; /* Enable scrolling if content exceeds height */
      }
      
      .skeleton-loader {
         display: none; /* Hide by default */
         position: absolute;
         inset: 0; /* Cover the entire card content area */
         background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
         background-size: 200% 100%;
         animation: loading 1.5s infinite linear; /* Use linear for smoother shimmer */
         border-radius: 0.5rem;
         z-index: 10; /* Ensure it's above the content initially */
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

       /* --- Visibility Logic --- */
       [data-loader="true"] .card-content > *:not(.skeleton-loader) {
           opacity: 0; /* Hide content smoothly */
           pointer-events: none; /* Prevent interaction with hidden content */
       }
       [data-loader="true"] .skeleton-loader {
           display: block; /* Show skeleton */
       }
       /* When data-loader is removed, content fades in */
       .card-content > *:not(.skeleton-loader) {
           transition: opacity 0.3s ease-in;
           opacity: 1;
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
        animation: fadeIn 0.3s ease-in forwards; /* Add forwards to keep final state */
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleEl);
  },

  renderRecentlyPlayed: () => {
    const container = window.$byId(window.IDS.recentlyPlayedSection);
    if (!container) return;
    const appState = window.MyTunesApp.state;
    const card = container.closest('.bento-card'); // Find parent card

    if (!appState.recentlyPlayed || appState.recentlyPlayed.length === 0) {
      container.innerHTML = homePage.renderEmptyState("No recently played tracks", "music-note");
    } else {
      const recentTracks = appState.recentlyPlayed.slice(0, 5);
      container.innerHTML = render.homeSection.recentlyPlayed(recentTracks, window.MyTunesApp.utils);

      container.querySelectorAll(".recent-track").forEach((track) => {
        track.addEventListener("click", (e) => {
          if (e.target.closest(".track-artist")) return;
          try {
            const songData = JSON.parse(track.dataset.song.replace(/&quot;/g, '"'));
            window.MyTunesApp.musicPlayer.ui.playSong(songData);
          } catch (error) { console.error("Error parsing song data:", error); }
        });
      });

      container.querySelectorAll(".track-artist").forEach((artistEl) => {
        artistEl.addEventListener("click", (e) => {
          e.stopPropagation();
          const artistName = artistEl.dataset.artist;
          if (appState.router) {
            appState.router.navigateTo(window.ROUTES.ARTIST, { artist: artistName });
          }
        });
      });
    }
    // **FIX:** Remove data-loader after rendering
    if (card) card.removeAttribute('data-loader');
  },

  renderRandomAlbums: () => {
    const container = window.$byId(window.IDS.randomAlbumsSection);
    if (!container) return;
    const card = container.closest('.bento-card');

    const albums = homePage.getRandomAlbums(6);

    if (!albums || albums.length === 0) {
      container.innerHTML = homePage.renderEmptyState("No albums found", "album");
    } else {
      container.innerHTML = render.homeSection.randomAlbums(albums, window.MyTunesApp.utils);

      container.querySelectorAll(".album-play-btn").forEach((playBtn) => {
        playBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const artistName = playBtn.dataset.artist;
          const albumName = playBtn.dataset.album;
          homePage.playAlbum(artistName, albumName);
        });
      });

      container.querySelectorAll(".album-card").forEach((albumCard) => {
         // Fix: Use currentTarget to ensure it's the card, not the artist link
        albumCard.addEventListener("click", (e) => {
          if (e.target.closest(".album-play-btn") || e.target.closest(".album-artist")) return;
          const artistName = e.currentTarget.dataset.artist;
          const albumName = e.currentTarget.dataset.album;
           // **CHANGED:** Navigate to artist page, then load album within it
           const appState = window.MyTunesApp.state;
           if (appState.router) {
             appState.router.navigateTo(window.ROUTES.ARTIST, { artist: artistName });
             // Use sessionStorage to signal the artist page to load a specific album
             sessionStorage.setItem('pendingAlbumLoad', albumName);
           }
        });
      });

      container.querySelectorAll(".album-artist").forEach((artistEl) => {
        artistEl.addEventListener("click", (e) => {
          e.stopPropagation();
          const artistName = artistEl.dataset.artist;
          const appState = window.MyTunesApp.state;
          if (appState.router) {
            appState.router.navigateTo(window.ROUTES.ARTIST, { artist: artistName });
          }
        });
      });
    }
    // **FIX:** Remove data-loader after rendering
    if (card) card.removeAttribute('data-loader');
  },

  renderFavoriteArtists: () => {
    const container = window.$byId(window.IDS.favoriteArtistsSection);
    if (!container) return;
    const appState = window.MyTunesApp.state;
    const card = container.closest('.bento-card');

    if (!appState.favorites.artists || appState.favorites.artists.size === 0) {
      container.innerHTML = homePage.renderEmptyState("No favorite artists", "artist");
    } else {
      const artists = Array.from(appState.favorites.artists).slice(0, 6);
      container.innerHTML = render.homeSection.favoriteArtists(artists, window.MyTunesApp.utils);

      container.querySelectorAll(".artist-card").forEach((artistEl) => {
        artistEl.addEventListener("click", () => {
          const artistName = artistEl.dataset.artist;
          if (appState.router) {
            appState.router.navigateTo(window.ROUTES.ARTIST, { artist: artistName });
          }
        });
      });
    }
    // **FIX:** Remove data-loader after rendering
    if (card) card.removeAttribute('data-loader');
  },

  renderPlaylists: () => {
    const container = window.$byId(window.IDS.playlistsSection);
    if (!container) return;
    const appState = window.MyTunesApp.state;
    const card = container.closest('.bento-card');

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
        window.MyTunesApp.playlists.show(playlistId);
      });
    });

    const createBtn = container.querySelector(".create-playlist-btn");
    if (createBtn) {
      createBtn.addEventListener("click", async () => {
        const newPlaylist = await window.MyTunesApp.playlists.create();
        if (newPlaylist) {
          setTimeout(() => homePage.renderPlaylists(), 100); // Re-render this card
        }
      });
    }
     // **FIX:** Remove data-loader after rendering
     if (card) card.removeAttribute('data-loader');
  },

  renderFavoriteSongs: () => {
    const container = window.$byId(window.IDS.favoriteSongsSection);
    if (!container) return;
    const appState = window.MyTunesApp.state;
    const card = container.closest('.bento-card');

    if (!appState.favorites.songs || appState.favorites.songs.size === 0) {
      container.innerHTML = homePage.renderEmptyState("No favorite songs", "heart");
    } else {
      const songs = homePage.getSongsByIds(Array.from(appState.favorites.songs).slice(0, 5));
      container.innerHTML = render.homeSection.favoriteSongs(songs, window.MyTunesApp.utils);

      container.querySelectorAll(".recent-track").forEach((track) => {
        track.addEventListener("click", (e) => {
          if (e.target.closest(".track-artist") || e.target.closest(".favorite-heart")) return;
          try {
            const songData = JSON.parse(track.dataset.song.replace(/&quot;/g, '"'));
            window.MyTunesApp.musicPlayer.ui.playSong(songData);
          } catch (error) { console.error("Error parsing song data:", error); }
        });
      });

      container.querySelectorAll(".track-artist").forEach((artistEl) => {
        artistEl.addEventListener("click", (e) => {
          e.stopPropagation();
          const artistName = artistEl.dataset.artist;
          if (appState.router) {
            appState.router.navigateTo(window.ROUTES.ARTIST, { artist: artistName });
          }
        });
      });

      container.querySelectorAll(".favorite-heart").forEach((heartBtn) => {
        heartBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const songId = heartBtn.dataset.songId;
          appState.favorites.remove("songs", songId); // remove handles notification and state update

          const track = heartBtn.closest(".recent-track");
          track.style.transition = "all 0.3s ease";
          track.style.opacity = "0";
          track.style.transform = "translateX(-20px)";

          setTimeout(() => {
            track.remove();
            const remaining = container.querySelectorAll(".recent-track");
            if (remaining.length === 0) {
              homePage.renderFavoriteSongs(); // Re-render if empty now
            }
          }, 300);
        });
      });
    }
     // **FIX:** Remove data-loader after rendering
     if (card) card.removeAttribute('data-loader');
  },

  bindEvents: () => {
    // Use event delegation on a parent element if possible, otherwise querySelectorAll is fine
    document.querySelectorAll("[data-view]").forEach((link) => {
       // Ensure listener isn't added multiple times if renderHomePage is called again
       if (link._viewHandlerAttached) return;
       link._viewHandlerAttached = true;

      link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        const { musicPlayer, notifications, views, playlists } = window.MyTunesApp;

        switch (view) {
          case "recent":
            musicPlayer.mainPlayer.open();
            setTimeout(() => musicPlayer.mainPlayer.switchTab("recent"), 50);
            break;
          case "albums":
            notifications.show("Albums view coming soon", window.NOTIFICATION_TYPES.INFO); // Specify type
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
            notifications.show("View coming soon", window.NOTIFICATION_TYPES.INFO);
        }
      });
    });
  },

  getRandomAlbums: (count = 6) => {
    const music = window.MyTunesApp.music;
    if (!music) return [];

    const allAlbums = [];
    music.forEach((artist) => {
      artist.albums.forEach((album) => {
        allAlbums.push({
          artist: artist.artist,
          album: album.album,
          cover: window.MyTunesApp.utils.getAlbumImageUrl(album.album),
          songs: album.songs,
        });
      });
    });

    // Simple shuffle
    const shuffled = [...allAlbums].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  getSongsByIds: (ids) => {
    const music = window.MyTunesApp.music;
    if (!music || !ids || ids.length === 0) return [];

    const songsMap = new Map(); // Use map for faster lookup if library is large
     music.forEach((artist) => {
       artist.albums.forEach((album) => {
         album.songs.forEach((song) => {
             songsMap.set(song.id, {
                 ...song,
                 artist: artist.artist,
                 album: album.album,
                 cover: window.MyTunesApp.utils.getAlbumImageUrl(album.album),
             });
         });
       });
     });

     // Return songs in the order of the provided ids
     return ids.map(id => songsMap.get(id)).filter(Boolean); // Filter out potential undefined if id not found
  },

  playAlbum: (artistName, albumName) => {
    const music = window.MyTunesApp.music;
    if (!music) return;

    const artist = music.find((a) => a.artist === artistName);
    if (!artist) return;

    const album = artist.albums.find((a) => a.album === albumName);
    if (!album || !album.songs || album.songs.length === 0) return;

    const { state, musicPlayer, utils, notifications } = window.MyTunesApp;

    state.queue.clear();

    album.songs.slice(1).forEach((song) => {
      state.queue.add({ // Use queue's add method
        ...song,
        artist: artistName,
        album: albumName,
        cover: utils.getAlbumImageUrl(albumName),
      });
    });
     // No need to manually save/update counts, queue.add does it

    musicPlayer.ui.playSong({
      ...album.songs[0],
      artist: artistName,
      album: albumName,
      cover: utils.getAlbumImageUrl(albumName),
    });

    // No need for separate notification, playSong handles UI updates/notifications implicitly
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
        <p>${window.MyTunesApp.utils.escapeHtml(message)}</p>
      </div>
    `;
  },
};

export const views = {
    showFavoriteSongs: () => {
        const { state, overlays, utils, ICONS, musicPlayer, notifications } = window.MyTunesApp;
        const favoriteSongIds = Array.from(state.favorites.songs);
        
        if (favoriteSongIds.length === 0) {
            overlays.viewer.playlists( // Using playlist viewer overlay for consistency
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
                 ${favoriteSongs.map((song, index) => render.songItem({
                      trackNumber: index + 1,
                      title: song.title,
                      artist: song.artist,
                      duration: song.duration || "0:00",
                      songData: song,
                      context: 'favorites', // Specific context
                      isFavorite: true, // They are favorites
                      showTrackNumber: true,
                      showArtist: true // Show artist in this list
                 })).join("")}
              </div>
            </div>
          `;
        
        overlays.viewer.playlists(content); // Reusing playlist viewer
        const modalEl = document.getElementById("playlist-viewer");
         if (modalEl) {
             views.bindFavoriteSongsEvents(modalEl); // Pass modal root
         }
    },

    showFavoriteArtists: () => {
         // Reusing artist viewer overlay for consistency
        const { state, overlays, utils, ICONS, navigation, music } = window.MyTunesApp;
        const favoriteArtistNames = Array.from(state.favorites.artists);

        if (favoriteArtistNames.length === 0) {
             overlays.viewer.artists( // Use artist viewer
                views.renderEmptyState(
                    "No Favorite Artists",
                    "You haven't added any artists to your favorites yet.",
                    "Browse artists and click the heart icon to add favorites."
                )
             );
            return;
        }

        const favoriteArtists = favoriteArtistNames
            .map((artistName) => music?.find((a) => a.artist === artistName))
            .filter(Boolean);

        const content = `
            <div class="favorites-artists-page animate__animated animate__fadeIn">
                <div class="page-header">
                    <h1>Favorite Artists</h1>
                    <p>${favoriteArtists.length} artist${favoriteArtists.length !== 1 ? "s" : ""}</p>
                     </div>
                 <div class="artist-grid">
                     ${favoriteArtists.map(artist => `
                         <div class="artist-card" data-artist="${artist.artist}">
                             <div class="artist-avatar-container">
                                 <img src="${utils.getArtistImageUrl(artist.artist)}" alt="${artist.artist}" class="artist-avatar">
                                 <div class="play-button-overlay">
                                     <button class="play-artist-btn" data-artist="${artist.artist}"> ${ICONS.play} </button>
                                 </div>
                             </div>
                             <div class="artist-name">${artist.artist}</div>
                         </div>
                     `).join('')}
                 </div>
             </div>
        `;


         overlays.viewer.artists(content); // Use artist viewer
         const modalEl = document.getElementById("artist-viewer");
         if (modalEl) {
             views.bindFavoriteArtistsEvents(modalEl); // Bind events specific to this view
         }
    },

     // Helper function to bind events within the favorite artists overlay
     bindFavoriteArtistsEvents: (root) => {
         if (!root) return;
         const { navigation, music } = window.MyTunesApp;

         root.querySelectorAll('.artist-card').forEach(card => {
             card.addEventListener('click', (e) => {
                 if (e.target.closest('.play-artist-btn')) return; // Let play button handler work
                 const artistName = card.dataset.artist;
                 overlays.close('artist-viewer'); // Close overlay
                 navigation.router.navigateTo(window.ROUTES.ARTIST, { artist: artistName });
             });
         });

         root.querySelectorAll('.play-artist-btn').forEach(button => {
             button.addEventListener('click', (e) => {
                 e.stopPropagation(); // Prevent card click
                 const artistName = button.dataset.artist;
                 const artistData = music?.find(a => a.artist === artistName);
                 if (artistData) {
                     overlays.close('artist-viewer'); // Close overlay
                     navigation.actions.playArtistSongs(artistData);
                 }
             });
         });
     },


    bindFavoriteSongsEvents: (root) => {
        if (!root) return;
        const { state, musicPlayer, notifications, navigation, overlays } = window.MyTunesApp;

        const playAllBtn = root.querySelector('.play-all-btn');
        if (playAllBtn) {
            playAllBtn.addEventListener('click', () => {
                const favoriteSongIds = Array.from(state.favorites.songs);
                const favoriteSongs = views.getSongsByIds(favoriteSongIds);
                
                if (favoriteSongs.length > 0) {
                    state.queue.clear();
                    favoriteSongs.slice(1).forEach((song) => state.queue.add(song));
                    musicPlayer.ui.playSong(favoriteSongs[0]);
                     overlays.close('playlist-viewer'); // Close overlay on play
                    // Notification handled by queue.add / playSong
                }
            });
        }

        const shuffleAllBtn = root.querySelector('.shuffle-all-btn');
        if (shuffleAllBtn) {
            shuffleAllBtn.addEventListener('click', () => {
                const favoriteSongIds = Array.from(state.favorites.songs);
                let favoriteSongs = views.getSongsByIds(favoriteSongIds);
                
                if (favoriteSongs.length > 0) {
                    for (let i = favoriteSongs.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [favoriteSongs[i], favoriteSongs[j]] = [favoriteSongs[j], favoriteSongs[i]];
                    }
                    
                    state.queue.clear();
                    favoriteSongs.slice(1).forEach((song) => state.queue.add(song));
                    musicPlayer.ui.playSong(favoriteSongs[0]);
                    state.shuffleMode = true;
                    ui.updateShuffleButton(); // Use global ui object
                     overlays.close('playlist-viewer'); // Close overlay on play
                    notifications.show("Shuffling favorite songs", window.NOTIFICATION_TYPES.SUCCESS);
                }
            });
        }

       // Event delegation for song rows
         const songsList = root.querySelector('.songs-list');
         if (songsList) {
             songsList.addEventListener('click', (e) => {
                 const songRow = e.target.closest('.song-item'); // Target .song-item now
                 if (!songRow) return;

                 const songDataStr = songRow.dataset.song;
                 let songData;
                 try { songData = JSON.parse(songDataStr.replace(/&quot;/g, '"')); } catch { return; }

                 // Play song on row click (excluding actions/artist)
                  if (!e.target.closest('.cell.heart, .cell.more, .action-btn, [data-artist]')) {
                      musicPlayer.ui.playSong(songData);
                      overlays.close('playlist-viewer');
                      return;
                  }

                 // Artist link
                 const artistLink = e.target.closest('[data-artist]');
                  if (artistLink) {
                      e.stopPropagation();
                      const artistName = artistLink.dataset.artist;
                      overlays.close('playlist-viewer');
                      state.router?.navigateTo(window.ROUTES.ARTIST, { artist: artistName });
                      return;
                  }

                 // Action buttons
                 const actionBtn = e.target.closest('.action-btn');
                 if (actionBtn) {
                      e.stopPropagation();
                      const action = actionBtn.dataset.action;

                     switch (action) {
                         case 'favorite': // Remove from favorites in this context
                             state.favorites.remove('songs', songData.id); // Handles notification
                             songRow.style.transition = 'all 0.3s ease';
                             songRow.style.opacity = '0';
                             songRow.style.transform = 'translateX(-20px)';
                             setTimeout(() => {
                                 songRow.remove();
                                  // Re-render if list becomes empty?
                                 if (!songsList.querySelector('.song-item')) {
                                     views.showFavoriteSongs(); // Re-render to show empty state
                                 }
                             }, 300);
                             break;
                         case 'add-queue':
                             state.queue.add(songData); // Handles notification
                             break;
                         case 'add-playlist':
                             navigation.actions.showPlaylistSelector(songData); // Assumes this handles closing overlay
                             break;
                         case 'more':
                              navigation.actions.showMoreActionsPopover(actionBtn, songData, 'favorites');
                              break;
                     }
                 }
             });
         }
    },


    getSongsByIds: (songIds) => {
        const music = window.MyTunesApp.music;
        if (!music || !songIds || songIds.length === 0) return [];

        const songsMap = new Map();
        music.forEach((artist) => {
           artist.albums.forEach((album) => {
             album.songs.forEach((song) => {
                 songsMap.set(song.id, {
                     ...song,
                     artist: artist.artist,
                     album: album.album,
                     cover: window.MyTunesApp.utils.getAlbumImageUrl(album.album),
                 });
             });
           });
         });

         return songIds.map(id => songsMap.get(id)).filter(Boolean);
    },

    renderEmptyState: (title, subtitle, description) => {
         // Consistent empty state rendering
        return `
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="48" height="48">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>
            </div>
            <h3 class="empty-state-title">${window.MyTunesApp.utils.escapeHtml(title)}</h3>
            <p class="empty-state-subtitle">${window.MyTunesApp.utils.escapeHtml(subtitle)}</p>
            <p class="empty-state-description">${window.MyTunesApp.utils.escapeHtml(description)}</p>
          </div>
        `;
    },
};