import { render, create } from './utilities/templates.js';
import { utils } from './global.js';
import { playerManager } from './playerManager.js';

export const viewManager = {
  currentView: null,
  viewContainer: null,
  cardRegistry: new Map(),
  transitionDuration: 300,

  init() {
    this.viewContainer = document.getElementById('dynamic-content') || document.querySelector('#main-content');
    if (!this.viewContainer) {
      console.error('No view container found');
      return;
    }
    
    this.viewContainer.classList.add('view-container');
  },

  async switchView(viewName, data = {}) {
    if (this.currentView === viewName && !data.forceReload) {
      return;
    }

    await this.transitionOut();
    
    this.currentView = viewName;
    
    switch (viewName) {
      case 'home':
        await this.renderHomeView();
        break;
      case 'artist':
        await this.renderArtistView(data.artistData);
        break;
      case 'allArtists':
        await this.renderAllArtistsView();
        break;
      default:
        console.warn(`Unknown view: ${viewName}`);
    }

    await this.transitionIn();
  },

  async transitionOut() {
    return new Promise(resolve => {
      this.viewContainer.classList.add('transitioning-out');
      setTimeout(() => {
        this.viewContainer.classList.remove('transitioning-out');
        resolve();
      }, this.transitionDuration);
    });
  },

  async transitionIn() {
    return new Promise(resolve => {
      this.viewContainer.classList.add('transitioning-in');
      requestAnimationFrame(() => {
        this.viewContainer.classList.remove('transitioning-in');
        resolve();
      });
    });
  },

  async renderHomeView() {
    const bentoWrapper = this.getOrCreateBentoWrapper();
    
    const cardConfigs = [
      {
        id: 'recent-plays',
        type: 'medium',
        icon: 'clock',
        title: 'Recently Played',
        description: 'Your most recently played tracks',
        loader: true,
        contentId: 'recently-played-content'
      },
      {
        id: 'discover-albums',
        type: 'large',
        icon: 'disc',
        title: 'Discover Albums',
        description: 'Explore your music collection',
        loader: true,
        contentId: 'discover-albums-content'
      },
      {
        id: 'favorite-artists',
        type: 'medium',
        icon: 'users',
        title: 'Favorite Artists',
        description: 'Artists you love most',
        loader: true,
        contentId: 'favorite-artists-content'
      },
      {
        id: 'now-playing',
        type: 'player',
        icon: 'play',
        title: 'Now Playing',
        description: 'Current track',
        contentId: 'now-playing-content',
        desktopOnly: true
      },
      {
        id: 'playlists',
        type: 'large',
        icon: 'list',
        title: 'Your Playlists',
        description: 'Your curated collections',
        loader: true,
        contentId: 'playlists-content'
      },
      {
        id: 'favorite-songs',
        type: 'medium',
        icon: 'heart',
        title: 'Favorite Songs',
        description: 'Songs you can\'t get enough of',
        loader: true,
        contentId: 'favorite-songs-content'
      },
      {
        id: 'quick-stats',
        type: 'small',
        icon: 'stats',
        title: 'Quick Stats',
        description: 'Your library overview',
        contentId: 'quick-stats-content'
      }
    ];

    this.populateBentoCards(bentoWrapper, cardConfigs);
    
    await this.loadHomeContent();
  },

  async renderArtistView(artistData) {
    const bentoWrapper = this.getOrCreateBentoWrapper();
    
    const cardConfigs = [
      {
        id: 'artist-info',
        type: 'large',
        icon: 'user',
        title: artistData.artist,
        description: `${artistData.genre || 'Various Genres'}`,
        contentId: 'artist-info-content'
      },
      {
        id: 'artist-albums',
        type: 'large',
        icon: 'disc',
        title: 'Albums',
        description: `${artistData.albums.length} albums`,
        loader: true,
        contentId: 'artist-albums-content'
      },
      {
        id: 'artist-stats',
        type: 'medium',
        icon: 'chart',
        title: 'Statistics',
        description: 'Artist analytics',
        loader: true,
        contentId: 'artist-stats-content'
      },
      {
        id: 'now-playing',
        type: 'player',
        icon: 'play',
        title: 'Now Playing',
        description: 'Current track',
        contentId: 'now-playing-content',
        desktopOnly: true
      },
      {
        id: 'similar-artists',
        type: 'large',
        icon: 'users',
        title: 'Similar Artists',
        description: 'You might also like',
        loader: true,
        contentId: 'similar-artists-content'
      },
      {
        id: 'top-tracks',
        type: 'medium',
        icon: 'music',
        title: 'Top Tracks',
        description: 'Most played songs',
        loader: true,
        contentId: 'top-tracks-content'
      }
    ];

    this.populateBentoCards(bentoWrapper, cardConfigs);
    
    await this.loadArtistContent(artistData);
  },

  async renderAllArtistsView() {
    this.viewContainer.innerHTML = render.page('allArtists');
  },

  getOrCreateBentoWrapper() {
    let bentoWrapper = this.viewContainer.querySelector('.bentoCardsWrapper');
    
    if (!bentoWrapper) {
      this.viewContainer.innerHTML = '';
      bentoWrapper = document.createElement('div');
      bentoWrapper.className = 'bentoCardsWrapper';
      this.viewContainer.appendChild(bentoWrapper);
    } else {
      bentoWrapper.innerHTML = '';
    }

    return bentoWrapper;
  },

  populateBentoCards(container, cardConfigs) {
    this.cardRegistry.clear();
    
    cardConfigs.forEach(config => {
      const card = this.createBentoCard(config);
      container.appendChild(card);
      this.cardRegistry.set(config.id, {
        element: card,
        contentElement: card.querySelector(`#${config.contentId}`),
        config: config
      });
    });
  },

  createBentoCard(config) {
    const card = document.createElement('div');
    card.className = `bentoCard bentoCard-${config.type}`;
    card.id = `bento-${config.id}`;
    
    if (config.desktopOnly) {
      card.classList.add('desktop-only');
    }
    
    if (config.loader) {
      card.setAttribute('data-loader', 'true');
    }

    const iconSvg = this.getIconSvg(config.icon);
    
    card.innerHTML = `
      ${config.loader ? `
        <div class="loadingOverlay" id="loading-${config.id}">
          <div class="spinner"></div>
          <div class="loadingText">Loading...</div>
        </div>
      ` : ''}
      
      <div class="card-header">
        <div class="cardIcon">
          ${iconSvg}
        </div>
        <h2 class="cardTitle">${config.title}</h2>
      </div>
      
      ${config.description ? `
        <div class="cardBody">
          ${config.description}
        </div>
      ` : ''}
      
      <div id="${config.contentId}" class="card-content">
      </div>
      
      ${config.showFooter !== false ? `
        <div class="cardFooter">
          <a href="#" class="card-link" data-view="${config.id}">View All →</a>
        </div>
      ` : ''}
    `;

    return card;
  },

  async loadHomeContent() {
    const contentLoaders = {
      'recent-plays': () => this.loadRecentPlays(),
      'discover-albums': () => this.loadDiscoverAlbums(),
      'favorite-artists': () => this.loadFavoriteArtists(),
      'playlists': () => this.loadPlaylists(),
      'favorite-songs': () => this.loadFavoriteSongs(),
      'quick-stats': () => this.loadQuickStats(),
      'now-playing': () => this.embedPlayer()
    };

    const loadPromises = Object.entries(contentLoaders).map(async ([cardId, loader]) => {
      const card = this.cardRegistry.get(cardId);
      if (card) {
        this.showLoader(cardId);
        try {
          await loader();
        } catch (error) {
          console.error(`Error loading ${cardId}:`, error);
          this.showError(cardId, 'Failed to load content');
        } finally {
          this.hideLoader(cardId);
        }
      }
    });

    await Promise.all(loadPromises);
  },

  async loadArtistContent(artistData) {
    const contentLoaders = {
      'artist-info': () => this.loadArtistInfo(artistData),
      'artist-albums': () => this.loadArtistAlbums(artistData),
      'artist-stats': () => this.loadArtistStats(artistData),
      'similar-artists': () => this.loadSimilarArtists(artistData),
      'top-tracks': () => this.loadTopTracks(artistData),
      'now-playing': () => this.embedPlayer()
    };

    const loadPromises = Object.entries(contentLoaders).map(async ([cardId, loader]) => {
      const card = this.cardRegistry.get(cardId);
      if (card) {
        if (card.config.loader) {
          this.showLoader(cardId);
        }
        try {
          await loader();
        } catch (error) {
          console.error(`Error loading ${cardId}:`, error);
          this.showError(cardId, 'Failed to load content');
        } finally {
          if (card.config.loader) {
            this.hideLoader(cardId);
          }
        }
      }
    });

    await Promise.all(loadPromises);
  },

  async loadRecentPlays() {
    await this.simulateDelay(400);
    const card = this.cardRegistry.get('recent-plays');
    if (card && card.contentElement) {
      const recentTracks = this.getRecentTracks(6);
      card.contentElement.innerHTML = render.homeSection.recentlyPlayed(recentTracks, utils);
    }
  },

  async loadDiscoverAlbums() {
    await this.simulateDelay(600);
    const card = this.cardRegistry.get('discover-albums');
    if (card && card.contentElement) {
      const randomAlbums = this.getRandomAlbums(8);
      card.contentElement.innerHTML = render.homeSection.randomAlbums(randomAlbums, utils);
    }
  },

  async loadFavoriteArtists() {
    await this.simulateDelay(500);
    const card = this.cardRegistry.get('favorite-artists');
    if (card && card.contentElement) {
      const favoriteArtists = this.getFavoriteArtists(6);
      card.contentElement.innerHTML = render.homeSection.favoriteArtists(favoriteArtists, utils);
    }
  },

  async loadPlaylists() {
    await this.simulateDelay(450);
    const card = this.cardRegistry.get('playlists');
    if (card && card.contentElement) {
      const playlists = window.appState?.playlists || [];
      card.contentElement.innerHTML = render.homeSection.playlists(playlists);
    }
  },

  async loadFavoriteSongs() {
    await this.simulateDelay(550);
    const card = this.cardRegistry.get('favorite-songs');
    if (card && card.contentElement) {
      const favoriteSongs = this.getFavoriteSongs(6);
      card.contentElement.innerHTML = render.homeSection.favoriteSongs(favoriteSongs, utils);
    }
  },

  async loadQuickStats() {
    await this.simulateDelay(300);
    const card = this.cardRegistry.get('quick-stats');
    if (card && card.contentElement) {
      const stats = this.calculateQuickStats();
      card.contentElement.innerHTML = `
        <div class="quick-stats-grid">
          <div class="stat-item">
            <span class="stat-number">${stats.totalTracks}</span>
            <span class="stat-label">Total Tracks</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${stats.totalArtists}</span>
            <span class="stat-label">Artists</span>
          </div>
        </div>
      `;
    }
  },

  async loadArtistInfo(artistData) {
    const card = this.cardRegistry.get('artist-info');
    if (card && card.contentElement) {
      card.contentElement.innerHTML = `
        <div class="artist-info-display">
          <div class="artist-avatar-large">
            <img src="${utils.getArtistImageUrl(artistData.artist)}" alt="${artistData.artist}">
          </div>
          <div class="artist-meta">
            <div class="artist-stat-row">
              <div class="stat">
                <span class="stat-value">${artistData.albums.length}</span>
                <span class="stat-label">Albums</span>
              </div>
              <div class="stat">
                <span class="stat-value">${utils.getTotalSongs(artistData)}</span>
                <span class="stat-label">Songs</span>
              </div>
            </div>
          </div>
          <div class="artist-actions-compact">
            <button id="artistPlay" class="btn-primary">
              <svg fill="currentColor" viewBox="0 0 20 20" style="width: 20px; height: 20px;">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
              </svg>
              Play All
            </button>
            <button id="artistFollow" class="btn-secondary">
              <svg fill="currentColor" viewBox="0 0 20 20" style="width: 20px; height: 20px;">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
              Favorite
            </button>
          </div>
        </div>
      `;
    }
  },

  async loadArtistAlbums(artistData) {
    await this.simulateDelay(400);
    const card = this.cardRegistry.get('artist-albums');
    if (card && card.contentElement) {
      let html = '<div class="albums-grid">';
      artistData.albums.forEach(album => {
        html += `
          <div class="album-compact-card" data-album="${album.album}">
            <img src="${utils.getAlbumImageUrl(album.album)}" alt="${album.album}">
            <div class="album-compact-info">
              <div class="album-compact-title">${album.album}</div>
              <div class="album-compact-year">${album.year || 'Unknown'}</div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      card.contentElement.innerHTML = html;
    }
  },

  async loadArtistStats(artistData) {
    await this.simulateDelay(500);
    const card = this.cardRegistry.get('artist-stats');
    if (card && card.contentElement) {
      const stats = this.calculateArtistStats(artistData);
      card.contentElement.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">${stats.totalDuration}</div>
            <div class="stat-label">Total Duration</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">${stats.latestYear}</div>
            <div class="stat-label">Latest Release</div>
          </div>
        </div>
      `;
    }
  },

  async loadSimilarArtists(artistData) {
    await this.simulateDelay(600);
    const card = this.cardRegistry.get('similar-artists');
    if (card && card.contentElement) {
      const similarArtists = utils.getSimilarArtists(artistData.artist, { limit: 12 });
      card.contentElement.innerHTML = render.homeSection.favoriteArtists(similarArtists, utils);
    }
  },

  async loadTopTracks(artistData) {
    await this.simulateDelay(450);
    const card = this.cardRegistry.get('top-tracks');
    if (card && card.contentElement) {
      const topTracks = this.getTopTracksForArtist(artistData, 5);
      card.contentElement.innerHTML = render.homeSection.recentlyPlayed(topTracks, utils);
    }
  },

  embedPlayer() {
    const card = this.cardRegistry.get('now-playing');
    if (card && card.contentElement) {
      playerManager.embedPlayerInCard(card.contentElement);
    }
  },

  showLoader(cardId) {
    const card = this.cardRegistry.get(cardId);
    if (card) {
      const loader = card.element.querySelector('.loadingOverlay');
      if (loader) {
        loader.classList.remove('hidden');
      }
    }
  },

  hideLoader(cardId) {
    const card = this.cardRegistry.get(cardId);
    if (card) {
      const loader = card.element.querySelector('.loadingOverlay');
      if (loader) {
        loader.classList.add('hidden');
      }
    }
  },

  showError(cardId, message) {
    const card = this.cardRegistry.get(cardId);
    if (card && card.contentElement) {
      card.contentElement.innerHTML = `
        <div class="error-state">
          <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <p class="error-message">${message}</p>
          <button class="retry-button" onclick="viewManager.retryLoad('${cardId}')">Retry</button>
        </div>
      `;
    }
  },

  getIconSvg(iconName) {
    const icons = {
      clock: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>',
      disc: '<path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>',
      users: '<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>',
      play: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>',
      list: '<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>',
      heart: '<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>',
      stats: '<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>',
      user: '<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>',
      chart: '<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>',
      music: '<path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>'
    };
    
    return `<svg fill="currentColor" viewBox="0 0 20 20">${icons[iconName] || icons.disc}</svg>`;
  },

  getRecentTracks(limit = 6) {
    return window.appState?.recentlyPlayed?.slice(0, limit) || [];
  },

  getRandomAlbums(limit = 8) {
    if (!window.music) return [];
    const allAlbums = [];
    window.music.forEach(artist => {
      artist.albums.forEach(album => {
        allAlbums.push({
          ...album,
          artist: artist.artist
        });
      });
    });
    return allAlbums.sort(() => 0.5 - Math.random()).slice(0, limit);
  },

  getFavoriteArtists(limit = 6) {
    if (!window.appState?.favorites) return [];
    const favorites = Array.from(window.appState.favorites.artists || []);
    return favorites.slice(0, limit);
  },

  getFavoriteSongs(limit = 6) {
    if (!window.appState?.favorites) return [];
    const favorites = Array.from(window.appState.favorites.songs || []);
    return favorites.slice(0, limit);
  },

  calculateQuickStats() {
    if (!window.music) return { totalTracks: 0, totalArtists: 0 };
    
    let totalTracks = 0;
    window.music.forEach(artist => {
      artist.albums.forEach(album => {
        totalTracks += album.songs?.length || 0;
      });
    });

    return {
      totalTracks,
      totalArtists: window.music.length
    };
  },

  calculateArtistStats(artistData) {
    let totalSeconds = 0;
    let latestYear = 0;

    artistData.albums.forEach(album => {
      if (album.year && album.year > latestYear) {
        latestYear = album.year;
      }
      
      album.songs?.forEach(song => {
        if (song.duration) {
          const parts = song.duration.split(':');
          totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      });
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return {
      totalDuration: `${hours}h ${minutes}m`,
      latestYear: latestYear || 'Unknown'
    };
  },

  getTopTracksForArtist(artistData, limit = 5) {
    const allTracks = [];
    artistData.albums.forEach(album => {
      album.songs?.forEach(song => {
        allTracks.push({
          ...song,
          artist: artistData.artist,
          album: album.album,
          cover: utils.getAlbumImageUrl(album.album)
        });
      });
    });
    return allTracks.slice(0, limit);
  },

  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
