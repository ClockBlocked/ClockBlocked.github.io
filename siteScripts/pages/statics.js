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

    homePage.ensureModalStyles();

    setTimeout(() => homePage.renderRecentlyPlayed(), 100);
    setTimeout(() => homePage.renderRandomAlbums(), 300);
    setTimeout(() => homePage.renderFavoriteArtists(), 500);
    setTimeout(() => homePage.renderPlaylists(), 700);
    setTimeout(() => homePage.renderFavoriteSongs(), 900);

    homePage.bindEvents();
  },

  ensureModalStyles: () => {
    if ($byId("unified-modal-styles")) return;

    const link = document.createElement("link");
    link.id = "unified-modal-styles";
    link.rel = "stylesheet";
    link.href = "modal-theme.css";
    document.head.appendChild(link);
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

    container.querySelectorAll(".modern-track-item").forEach((track) => {
      track.addEventListener("click", (e) => {
        if (e.target.closest(".track-artist-text")) return;

        try {
          const songData = JSON.parse(track.dataset.song);
          musicPlayer.ui.playSong(songData);
        } catch (error) {
          console.error('Error playing song:', error);
        }
      });
    });

    container.querySelectorAll(".track-artist-text").forEach((artistEl) => {
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

    container.querySelectorAll(".modern-artist-card").forEach((artistEl) => {
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

    container.querySelectorAll(".modern-playlist-card").forEach((playlistEl) => {
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

    container.querySelectorAll(".modern-favorite-item").forEach((track) => {
      track.addEventListener("click", (e) => {
        if (e.target.closest(".favorite-artist-text") || e.target.closest(".favorite-heart-btn")) return;

        try {
          const songData = JSON.parse(track.dataset.song);
          musicPlayer.ui.playSong(songData);
        } catch (error) {
          console.error('Error playing song:', error);
        }
      });
    });

    container.querySelectorAll(".favorite-artist-text").forEach((artistEl) => {
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
            views.showRecentlyPlayed();
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
    showRecentlyPlayed: () => {
        if (!appState.recentlyPlayed || appState.recentlyPlayed.length === 0) {
            overlays.viewer.unified(
                "Recently Played",
                views.renderEmptyState(
                    "No Recently Played Tracks",
                    "You haven't played any songs yet.",
                    "Start playing music to see your recent tracks here."
                )
            );
            return;
        }

        const recentTracks = appState.recentlyPlayed.slice(0, 50);

        const content = `
            <div class="recent-tracks-page animate-fade-in">
              <div class="songs-list">
                ${recentTracks
                  .map(
                    (track, index) => `
                  <div class="modern-track-item modal-item-card" data-song='${JSON.stringify(track).replace(/"/g, "&quot;")}' style="animation-delay: ${index * 0.05}s;">
                    <div class="track-artwork-container">
                      <img src="${utils.getAlbumImageUrl(track.album)}" alt="${track.title}" class="track-artwork">
                      <div class="track-play-overlay">
                        <button class="track-play-btn">
                          ${window.ICONS.play}
                        </button>
                      </div>
                    </div>
                    <div class="track-content">
                      <div class="track-main-info">
                        <div class="track-title-text">${track.title}</div>
                        <div class="track-artist-text" data-artist="${track.artist}">${track.artist}</div>
                      </div>
                      <div class="track-meta">
                        <span class="track-duration">${track.duration || '3:24'}</span>
                      </div>
                    </div>
                    <div class="track-actions">
                      <button class="track-action-btn track-favorite-btn" data-action="favorite" data-song-id="${track.id}" title="Add to favorites">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </button>
                      <button class="track-action-btn track-more-btn" data-action="add-queue" title="Add to queue">
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `;
        
        overlays.viewer.unified("Recently Played", content);
        const modalEl = document.getElementById("unified-modal");
        views.bindTrackEvents(modalEl);
    },

    showFavoriteSongs: () => {
        const favoriteSongIds = Array.from(appState.favorites.songs);
        if (favoriteSongIds.length === 0) {
            overlays.viewer.unified(
                "Favorite Songs",
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
            <div class="favorites-page animate-fade-in">
              <div class="page-header favorites-header">
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
                  <div class="song-row modal-item-card animate-fade-in" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}' style="animation-delay: ${index * 0.05}s;">
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
        
        overlays.viewer.unified("Favorite Songs", content);
        const modalEl = document.getElementById("unified-modal");
        views.bindFavoriteSongsEvents(modalEl);
    },

    showFavoriteArtists: () => {
        const favoriteArtistNames = Array.from(appState.favorites.artists);
        
        if (favoriteArtistNames.length === 0) {
            overlays.viewer.unified(
                "Favorite Artists",
                views.renderEmptyState(
                    "No Favorite Artists",
                    "You haven't added any artists to your favorites yet.",
                    "Browse artists and click the heart icon to add favorites."
                )
            );
            return;
        }
        
        const favoriteArtists = favoriteArtistNames
            .map((artistName) => window.music?.find((a) => a.artist === artistName))
            .filter(Boolean);
        
        const content = `
            <div class="favorite-artists-page animate-fade-in">
              <div class="page-header favorites-header">
                <p class="artist-count">${favoriteArtists.length} artist${favoriteArtists.length !== 1 ? "s" : ""}</p>
              </div>
              <div class="modern-artist-grid">
                ${favoriteArtists
                  .map((artist, index) => `
                  <div class="modern-artist-card modal-item-card animate-fade-in" data-artist="${artist.artist}" style="animation-delay: ${index * 0.05}s;">
                    <div class="artist-artwork-container">
                      <img src="${utils.getArtistImageUrl(artist.artist)}" alt="${artist.artist}" class="artist-avatar-image">
                      <div class="artist-play-overlay">
                        <button class="artist-play-btn" data-action="play">
                          ${ICONS.play}
                        </button>
                      </div>
                      <div class="artist-gradient-overlay"></div>
                    </div>
                    <div class="artist-content">
                      <div class="artist-name-text">${artist.artist}</div>
                      <div class="artist-label">Artist</div>
                    </div>
                    <div class="artist-actions">
                      <button class="artist-action-btn artist-follow-btn" data-action="unfollow" title="Unfollow artist">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                `)
                  .join('')}
              </div>
            </div>
          `;
        
        overlays.viewer.unified("Favorite Artists", content);
        const modalEl = document.getElementById("unified-modal");
        views.bindFavoriteArtistsEvents(modalEl);
    },

    bindTrackEvents: (root) => {
        if (!root) return;

        root.querySelectorAll(".modern-track-item").forEach((track) => {
            track.addEventListener("click", (e) => {
                if (e.target.closest(".track-artist-text") || e.target.closest(".track-action-btn")) return;

                try {
                    const songData = JSON.parse(track.dataset.song);
                    musicPlayer.ui.playSong(songData);
                } catch (error) {
                    console.error('Error playing song:', error);
                }
            });
        });

        root.querySelectorAll(".track-artist-text").forEach((artistEl) => {
            artistEl.addEventListener("click", (e) => {
                e.stopPropagation();
                const artistName = artistEl.dataset.artist;
                if (appState.router) {
                    overlays.close('unified-modal');
                    appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
                }
            });
        });

        root.querySelectorAll(".track-action-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const trackItem = btn.closest(".modern-track-item");
                const songData = JSON.parse(trackItem.dataset.song);

                switch (action) {
                    case 'favorite':
                        appState.favorites.add('songs', songData.id);
                        btn.classList.add('active');
                        notifications.show("Added to favorites", NOTIFICATION_TYPES.SUCCESS);
                        break;
                    case 'add-queue':
                        appState.queue.add(songData);
                        notifications.show("Added to queue", NOTIFICATION_TYPES.SUCCESS);
                        break;
                }
            });
        });
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
                    overlays.close('unified-modal');
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
                                overlays.close('unified-modal');
                            }
                        }, 300);
                        break;
                    case 'add-queue':
                        appState.queue.add(songData);
                        notifications.show("Added to queue", NOTIFICATION_TYPES.SUCCESS);
                        break;
                    case 'add-playlist':
                        navigation.actions.showPlaylistSelector(songData);
                        break;
                }
            });
        });
    },

    bindFavoriteArtistsEvents: (root) => {
        if (!root) return;

        root.querySelectorAll('.modern-artist-card').forEach((card) => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.artist-play-btn') || e.target.closest('.artist-follow-btn')) return;

                const artistName = card.dataset.artist;
                if (appState.router) {
                    overlays.close('unified-modal');
                    appState.router.navigateTo(ROUTES.ARTIST, { artist: artistName });
                }
            });
        });

        root.querySelectorAll('.artist-play-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.modern-artist-card');
                const artistName = card.dataset.artist;
                const artistData = window.music?.find((a) => a.artist === artistName);
                
                if (artistData) {
                    navigation.actions.playArtistSongs(artistData);
                }
            });
        });

        root.querySelectorAll('.artist-follow-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.modern-artist-card');
                const artistName = card.dataset.artist;
                
                appState.favorites.remove('artists', artistName);
                
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                
                setTimeout(() => {
                    card.remove();
                    const remaining = root.querySelectorAll('.modern-artist-card');
                    if (remaining.length === 0) {
                        overlays.close('unified-modal');
                    }
                }, 300);
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
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>
            </div>
            <h3 class="empty-state-title">${title}</h3>
            <p class="empty-state-subtitle">${subtitle}</p>
            <p class="empty-state-description">${description}</p>
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