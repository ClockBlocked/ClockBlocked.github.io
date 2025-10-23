import { viewManager } from '../viewManager.js';
import { playerManager } from '../playerManager.js';
import {
  appState,
  storage,
  notifications,
  musicPlayer,
  utils,
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

  render: async () => {
    await viewManager.switchView('home');
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
      
      .album-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
      }
      
      .artist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 1rem;
      }
      
      .track-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: background-color 0.2s ease;
      }
      
      .track-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      .track-cover {
        width: 48px;
        height: 48px;
        border-radius: 0.25rem;
        object-fit: cover;
      }
      
      .track-info {
        flex: 1;
        min-width: 0;
      }
      
      .track-title {
        font-weight: 500;
        color: white;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .track-artist {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .album-card {
        text-align: center;
      }
      
      .album-cover {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 0.5rem;
        object-fit: cover;
        margin-bottom: 0.5rem;
      }
      
      .album-title {
        font-weight: 500;
        color: white;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .album-artist {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .artist-card {
        text-align: center;
      }
      
      .artist-avatar {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 0.5rem;
      }
      
      .artist-name {
        font-weight: 500;
        color: white;
        font-size: 0.875rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .playlist-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        background-color: rgba(255, 255, 255, 0.05);
        transition: background-color 0.2s ease;
      }
      
      .playlist-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      .playlist-icon {
        width: 40px;
        height: 40px;
        border-radius: 0.25rem;
        background: linear-gradient(45deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
      }
      
      .playlist-info {
        flex: 1;
      }
      
      .playlist-name {
        font-weight: 500;
        color: white;
        margin-bottom: 0.25rem;
      }
      
      .playlist-count {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
      }
    `;
    document.head.appendChild(styleEl);
  },

  renderRecentlyPlayed: () => {
    // This is now handled by viewManager's loadHomeContent
  },

  renderRandomAlbums: () => {
    // This is now handled by viewManager's loadHomeContent
  },

  renderFavoriteArtists: () => {
    // This is now handled by viewManager's loadHomeContent
  },

  renderPlaylists: () => {
    // This is now handled by viewManager's loadHomeContent
  },

  renderFavoriteSongs: () => {
    // This is now handled by viewManager's loadHomeContent
  },

  bindEvents: () => {
    // Bind any additional home page specific events here
    const bentoCards = document.querySelectorAll('.bentoCard');
    bentoCards.forEach(card => {
      const cardLink = card.querySelector('.card-link');
      if (cardLink) {
        cardLink.addEventListener('click', (e) => {
          e.preventDefault();
          const viewType = cardLink.getAttribute('data-view');
          if (viewType) {
            homePage.handleCardLinkClick(viewType);
          }
        });
      }
    });

    // Bind album click events
    document.addEventListener('click', (e) => {
      const albumCard = e.target.closest('.album-compact-card');
      if (albumCard) {
        const albumName = albumCard.getAttribute('data-album');
        if (albumName && window.pageRendering?.renderArtistPage) {
          // Find the artist data for this album
          const artistData = window.music?.find(artist => 
            artist.albums?.some(album => album.album === albumName)
          );
          if (artistData) {
            window.pageRendering.renderArtistPage(artistData, albumName);
          }
        }
      }
    });

    // Bind artist click events
    document.addEventListener('click', (e) => {
      const artistCard = e.target.closest('.artist-card');
      if (artistCard) {
        const artistName = artistCard.getAttribute('data-artist');
        if (artistName && window.pageRendering?.renderArtistPage) {
          const artistData = window.music?.find(a => a.artist === artistName);
          if (artistData) {
            window.pageRendering.renderArtistPage(artistData);
          }
        }
      }
    });

    // Bind track play events
    document.addEventListener('click', (e) => {
      const trackItem = e.target.closest('.track-item');
      if (trackItem && e.target.closest('.play-button')) {
        const trackData = {
          title: trackItem.querySelector('.track-title')?.textContent,
          artist: trackItem.querySelector('.track-artist')?.textContent,
          cover: trackItem.querySelector('.track-cover')?.src
        };
        if (musicPlayer?.ui?.playSong) {
          musicPlayer.ui.playSong(trackData);
        }
      }
    });
  },

  handleCardLinkClick: (viewType) => {
    const handlers = {
      'recent-plays': () => window.views?.showRecentlyPlayed?.(),
      'discover-albums': () => window.views?.showAllAlbums?.(),
      'favorite-artists': () => window.views?.showFavoriteArtists?.(),
      'playlists': () => window.views?.showPlaylists?.(),
      'favorite-songs': () => window.views?.showFavoriteSongs?.(),
      'quick-stats': () => window.views?.showStats?.()
    };

    const handler = handlers[viewType];
    if (handler) {
      handler();
    }
  }
};
