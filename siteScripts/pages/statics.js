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
import { BentoCards } from '../components/bentoCards.js';
import { ROUTES } from '../map.js';

export const homePage = {
  sections: [
    {
      id: 'home-recent',
      title: 'Recently played',
      description: 'Jump back into the tracks you loved last time you were here.',
      containerId: IDS.recentlyPlayedSection,
      action: { label: 'Open queue', action: 'open-recent-tab' },
    },
    {
      id: 'home-albums',
      title: 'Discover albums',
      description: 'Albums we think you will enjoy based on your recent plays.',
      containerId: IDS.randomAlbumsSection,
      action: { label: 'All artists', action: 'goto-artists' },
    },
    {
      id: 'home-artists',
      title: 'Favorite artists',
      description: 'Your saved artists plus a few mood-matching recommendations.',
      containerId: IDS.favoriteArtistsSection,
      action: { label: 'Manage favorites', action: 'view-favorite-artists' },
    },
    {
      id: 'home-playlists',
      title: 'Your playlists',
      description: 'Keep curating the perfect soundtrack for every moment.',
      containerId: IDS.playlistsSection,
      action: { label: 'New playlist', action: 'create-playlist' },
    },
    {
      id: 'home-favorites',
      title: 'Favorite songs',
      description: "The songs you can't live without – ready in one tap.",
      containerId: IDS.favoriteSongsSection,
      action: { label: 'View favorites', action: 'view-favorite-songs' },
    },
  ],

  initialize: () => {
    appState.homePageManager = {
      renderHomePage: homePage.render,
    };
  },

  render: () => {
    const dynamicContent = $byId(IDS.dynamicContent);
    if (!dynamicContent) return;

    const heroSubtitle = homePage.getHeroSubtitle();
    dynamicContent.innerHTML = render.viewShell({
      viewId: 'home-view',
      accentLabel: 'Now streaming',
      title: 'Your personal music universe',
      subtitle: heroSubtitle,
      actions: [
        { label: 'Shuffle library', action: 'shuffle-library' },
        { label: 'Browse artists', action: 'goto-artists' },
      ],
    });

    const viewGrid = dynamicContent.querySelector('[data-view-grid]');
    if (!viewGrid) return;

    viewGrid.innerHTML = homePage.sections
      .map((section) => homePage.renderSectionShell(section))
      .join('');

    homePage.renderRecentlyPlayed();
    homePage.renderRandomAlbums();
    homePage.renderFavoriteArtists();
    homePage.renderPlaylists();
    homePage.renderFavoriteSongs();
    homePage.bindEvents();
  },

  renderSectionShell: (section) => {
    const actionHtml = section.action
      ? `<div class="view-section-actions"><button type="button" data-section-action="${section.action.action}" data-section-id="${section.id}">${section.action.label}</button></div>`
      : '';

    return `
      <div class="view-section" data-section-id="${section.id}">
        <div class="view-section-header">
          <div>
            <h2>${section.title}</h2>
            ${section.description ? `<p class="view-section-description">${section.description}</p>` : ''}
          </div>
          ${actionHtml}
        </div>
        <div class="bento-grid" id="${section.containerId}"></div>
      </div>
    `;
  },

  getSectionContainer: (containerId) => {
    return $byId(containerId);
  },

  renderRecentlyPlayed: () => {
    const container = homePage.getSectionContainer(IDS.recentlyPlayedSection);
    if (!container) return;

    const tracks = homePage.getRecentSongs(6);
    if (!tracks.length) {
      container.innerHTML = homePage.renderEmptyState('No recently played songs', 'Play something new and it will show up here.');
      return;
    }

    const cards = tracks.map((song, index) => ({
      type: 'song',
      data: {
        title: song.title,
        album: song.album,
        artist: song.artist,
        duration: song.duration || '0:00',
        cover: song.cover,
        trackNumber: index + 1,
        payload: song,
      },
    }));

    container.innerHTML = BentoCards.renderCollection(cards);
  },

  renderRandomAlbums: () => {
    const container = homePage.getSectionContainer(IDS.randomAlbumsSection);
    if (!container) return;

    const albums = homePage.getRandomAlbums(6);
    if (!albums.length) {
      container.innerHTML = homePage.renderEmptyState('No albums found', 'Your library does not have enough albums yet.');
      return;
    }

    const cards = albums.map((album) => ({
      type: 'album',
      data: {
        title: album.album,
        artist: album.artist,
        year: album.year || '—',
        songCount: album.songs.length,
        cover: album.cover,
        payload: album,
      },
    }));

    container.innerHTML = BentoCards.renderCollection(cards);
  },

  renderFavoriteArtists: () => {
    const container = homePage.getSectionContainer(IDS.favoriteArtistsSection);
    if (!container) return;

    const artists = homePage.getFavoriteArtists(6);
    if (!artists.length) {
      container.innerHTML = homePage.renderEmptyState('No favorite artists', 'Tap the heart icon on an artist to favorite them.');
      return;
    }

    const cards = artists.map((artist) => ({
      type: 'artist',
      data: {
        name: artist.artist,
        genre: artist.genre || 'Various',
        statLine: `${artist.albums.length} albums`,
        cover: artist.cover,
        payload: { artist: artist.artist },
      },
    }));

    container.innerHTML = BentoCards.renderCollection(cards);
  },

  renderPlaylists: () => {
    const container = homePage.getSectionContainer(IDS.playlistsSection);
    if (!container) return;

    if (!appState.playlists || appState.playlists.length === 0) {
      container.innerHTML = homePage.renderEmptyState('No playlists yet', 'Create your first playlist to pin your vibe.', {
        label: 'Create playlist',
        action: 'create-playlist',
      });
      return;
    }

    const playlistsToShow = appState.playlists.slice(0, 6);
    const cards = playlistsToShow.map((playlist) => {
      const cover = playlist.songs[0]
        ? playlist.songs[0].cover || utils.getAlbumImageUrl(playlist.songs[0].album)
        : utils.getDefaultAlbumImage();
      return {
        type: 'playlist',
        data: {
          name: playlist.name,
          owner: 'You',
          songCount: playlist.songs.length,
          updatedLabel: new Date(playlist.created).toLocaleDateString(),
          cover,
          payload: playlist,
        },
      };
    });

    container.innerHTML = BentoCards.renderCollection(cards);
  },

  renderFavoriteSongs: () => {
    const container = homePage.getSectionContainer(IDS.favoriteSongsSection);
    if (!container) return;

    const songs = homePage.getFavoriteSongs(6);
    if (!songs.length) {
      container.innerHTML = homePage.renderEmptyState('No favorite songs', 'Add songs to your favorites to quick access them.');
      return;
    }

    const cards = songs.map((song, index) => ({
      type: 'song',
      data: {
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration || '0:00',
        cover: song.cover,
        trackNumber: index + 1,
        payload: song,
      },
    }));

    container.innerHTML = BentoCards.renderCollection(cards);
  },

  renderEmptyState: (title, message, action) => {
    return `
      <div class="view-section-empty">
        ${title ? `<h3>${title}</h3>` : ''}
        ${message ? `<p>${message}</p>` : ''}
        ${action ? `<button type="button" data-section-action="${action.action}">${action.label}</button>` : ''}
      </div>
    `;
  },

  getHeroSubtitle: () => {
    const playlistCount = appState.playlists.length;
    const favorites = appState.favorites.songs.size;
    if (playlistCount && favorites) {
      return `${playlistCount} playlists • ${favorites} favorite songs ready to spin.`;
    }
    if (playlistCount) {
      return `${playlistCount} playlists curated by you.`;
    }
    if (favorites) {
      return `${favorites} songs have been favorited so far.`;
    }
    return 'Tap play on any card to instantly fill your queue.';
  },

  getRecentSongs: (limit = 6) => {
    return (appState.recentlyPlayed || [])
      .slice(0, limit)
      .map((song) => homePage.enrichSong(song));
  },

  getRandomAlbums: (count = 6) => {
    if (!Array.isArray(window.music) || !window.music.length) return [];
    const pool = [];
    window.music.forEach((artist) => {
      artist.albums.forEach((album) => {
        pool.push({
          ...album,
          artist: artist.artist,
          cover: utils.getAlbumImageUrl(album.album),
        });
      });
    });
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  getFavoriteArtists: (limit = 6) => {
    const names = Array.from(appState.favorites.artists || []);
    const list = [];
    if (names.length) {
      names.forEach((name) => {
        const artistData = window.music?.find((artist) => artist.artist === name);
        if (artistData) {
          list.push({ ...artistData, cover: utils.getArtistImageUrl(artistData.artist) });
        }
      });
    }

    if (list.length < limit && Array.isArray(window.music)) {
      const filler = window.music
        .filter((artist) => !names.includes(artist.artist))
        .map((artist) => ({ ...artist, cover: utils.getArtistImageUrl(artist.artist) }));
      list.push(...filler.slice(0, limit - list.length));
    }
    return list.slice(0, limit);
  },

  getFavoriteSongs: (limit = 6) => {
    const ids = Array.from(appState.favorites.songs || []);
    const songs = homePage.getSongsByIds(ids).map((song) => homePage.enrichSong(song));
    if (songs.length < limit) {
      const recent = homePage.getRecentSongs(limit - songs.length);
      recent.forEach((song) => {
        if (!songs.some((existing) => existing.id === song.id)) {
          songs.push(song);
        }
      });
    }
    return songs.slice(0, limit);
  },

  getSongsByIds: (ids = []) => {
    const list = [];
    if (!Array.isArray(window.music)) return list;
    ids.forEach((id) => {
      const song = homePage.findSongById(id);
      if (song) {
        list.push(song);
      }
    });
    return list;
  },

  findSongById: (songId) => {
    if (!songId || !Array.isArray(window.music)) return null;
    for (const artist of window.music) {
      for (const album of artist.albums) {
        const song = album.songs.find((track) => track.id === songId);
        if (song) {
          return homePage.enrichSong({ ...song, artist: artist.artist, album: album.album });
        }
      }
    }
    return null;
  },

  enrichSong: (song) => {
    if (!song) return song;
    return {
      ...song,
      cover: song.cover || utils.getAlbumImageUrl(song.album),
    };
  },

  bindEvents: () => {
    const dynamicContent = $byId(IDS.dynamicContent);
    if (!dynamicContent) return;

    if (!dynamicContent._sectionActionHandler) {
      const handler = (event) => {
        const button = event.target.closest('[data-section-action]');
        if (!button) return;
        event.preventDefault();
        homePage.handleSectionAction(button.dataset.sectionAction);
      };
      dynamicContent.addEventListener('click', handler);
      dynamicContent._sectionActionHandler = handler;
    }
  },

  handleSectionAction: (action) => {
    switch (action) {
      case 'shuffle-library':
        homePage.shuffleLibrary();
        break;
      case 'goto-artists':
        appState.router?.navigateTo(ROUTES.ALL_ARTISTS);
        break;
      case 'open-recent-tab':
        musicPlayer.mainPlayer.open();
        setTimeout(() => musicPlayer.mainPlayer.switchTab?.('recent'), 100);
        break;
      case 'view-favorite-artists':
        views.showFavoriteArtists?.();
        break;
      case 'view-favorite-songs':
        views.showFavoriteSongs?.();
        break;
      case 'create-playlist':
        playlists.create()?.then?.(() => setTimeout(() => homePage.renderPlaylists(), 150));
        break;
      default:
        break;
    }
  },

  shuffleLibrary: () => {
    if (!Array.isArray(window.music) || !window.music.length) {
      notifications.show('No songs available to shuffle yet.');
      return;
    }
    const pool = [];
    window.music.forEach((artist) => {
      artist.albums.forEach((album) => {
        album.songs.forEach((song) => {
          pool.push({
            ...song,
            artist: artist.artist,
            album: album.album,
            cover: utils.getAlbumImageUrl(album.album),
          });
        });
      });
    });
    if (!pool.length) {
      notifications.show('No songs available to shuffle yet.');
      return;
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    appState.queue.clear();
    shuffled.slice(1).forEach((song) => appState.queue.add(song));
    musicPlayer.ui.playSong(shuffled[0]);
    notifications.show('Shuffling your entire library');
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