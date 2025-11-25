import { render, create } from '../utilities/templates.js';
import { uiManager } from './ui-manager.js';

export const pageManager = {
  initialize: function() {
    appState.homePageManager = {
      renderHomePage: this.loadHomePage.bind(this),
    };
  },

  loadHomePage: function() {
    pageLoader.start({ message: "Loading Music..." });

    const dynamicContent = $byId(IDS.dynamicContent);
    if (dynamicContent) {
      dynamicContent.innerHTML = "";
    }

    setTimeout(() => {
      this.renderHomePage();
      uiManager.breadCrumbs(
        [
          {
            text: "Home",
            route: ROUTES.HOME,
            active: true,
            isHome: true,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M125.2 16.1c6.2-4.4 5.4-14.8-2.2-15.6c-3.6-.4-7.3-.5-11-.5C50.1 0 0 50.1 0 112s50.1 112 112 112c32.1 0 61.1-13.5 81.5-35.2c5.2-5.6-1-14-8.6-13.2c-2.9 .3-5.9 .4-9 .4c-48.6 0-88-39.4-88-88c0-29.7 14.7-55.9 37.2-71.9zm289.9 85.3c-8.8-7.2-21.5-7.2-30.3 0l-216 176c-10.3 8.4-11.8 23.5-3.4 33.8s23.5 11.8 33.8 3.4L224 294.4 224 456c0 30.9 25.1 56 56 56l240 0c30.9 0 56-25.1 56-56l0-161.6 24.8 20.2c10.3 8.4 25.4 6.8 33.8-3.4s6.8-25.4-3.4-33.8l-216-176zM528 255.3L528 456c0 4.4-3.6 8-8 8l-240 0c-4.4 0-8-3.6-8-8l0-200.7L400 151 528 255.3zM352 312l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM248.5 12.3L236.6 44.6 204.3 56.5c-7 2.6-7 12.4 0 15l32.3 11.9 11.9 32.3c2.6 7 12.4 7 15 0l11.9-32.3 32.3-11.9c7-2.6 7-12.4 0-15L275.4 44.6 263.5 12.3c-2.6-7-12.4-7-15 0zm-145 320c-2.6-7-12.4-7-15 0L76.6 364.6 44.3 376.5c-7 2.6-7 12.4 0 15l32.3 11.9 11.9 32.3c2.6 7 12.4 7 15 0l11.9-32.3 32.3-11.9c7-2.6 7-12.4 0-15l-32.3-11.9-11.9-32.3z"/></svg>',
          },
        ],
        {
          showIcons: true,
          truncateAfter: 3,
          animateChanges: true,
          schemaMarkup: true,
        }
      );

      setTimeout(() => {
        pageLoader.complete();
      }, 700);

      utils.scrollToTop();
    }, 200);
  },

  loadArtistPage: function(artistData, targetAlbumName = null) {
    pageLoader.start({ message: "Finding Artist..." });

    const dynamicContent = $byId(IDS.dynamicContent);
    if (!dynamicContent) return;

    dynamicContent.innerHTML = "";

    setTimeout(() => {
      this.renderArtistPage(artistData, targetAlbumName);
      pageLoader.complete();
      utils.scrollToTop();
    }, 200);
  },

  loadAllArtistsPage: function() {
    pageLoader.start({ message: "Loading library..." });

    const dynamicContent = $byId(IDS.dynamicContent);
    if (!dynamicContent || !window.music) return;

    dynamicContent.innerHTML = "";

    setTimeout(() => {
      this.renderAllArtistsPage();
      setTimeout(() => {
        pageLoader.complete();
      }, 100);
    }, 300);
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

  renderArtistPage: function(artistData, targetAlbumName = null) {
    const dynamicContent = $byId(IDS.dynamicContent);
    if (!dynamicContent) return;

    dynamicContent.innerHTML = render.artist("enhancedArtist", {
      artist: artistData.artist,
      cover: utils.getArtistImageUrl(artistData.artist),
      genre: artistData.genre || "",
      albumCount: artistData.albums.length,
      songCount: utils.getTotalSongs(artistData),
    });

    this.setupAlbumsSection(artistData, targetAlbumName);

    uiManager.breadCrumbs(
      [
        {
          text: "Home  ",
          route: ROUTES.HOME,
          active: false,
          isHome: true,
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path class="fa-secondary" d="M80 202.9L80 448c0 26.5 21.5 48 48 48l80 0 0-168c0-13.3 10.7-24 24-24l112 0c13.3 0 24 10.7 24 24l0 168 80 0c26.5 0 48-21.5 48-48l0-245.1L288 18.7 80 202.9z"/><path class="fa-primary" d="M293.3 2c-3-2.7-7.6-2.7-10.6 0L2.7 250c-3.3 2.9-3.6 8-.7 11.3s8 3.6 11.3 .7L64 217.1 64 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-230.9L562.7 262c3.3 2.9 8.4 2.6 11.3-.7s2.6-8.4-.7-11.3L293.3 2zM80 448l0-245.1L288 18.7 496 202.9 496 448c0 26.5-21.5 48-48 48l-80 0 0-168c0-13.3-10.7-24-24-24l-112 0c-13.3 0 24 10.7 24 24l0 168-80 0c-26.5 0-48-21.5-48-48zm144 48l0-168c0-4.4 3.6-8 8-8l112 0c4.4 0 8 3.6 8 8l0 168-128 0z"/></svg>',
        },
        {
          text: "  Discography",
          route: ROUTES.ARTIST,
          artist: artistData.artist,
          active: true,
          icon: "",
        },
      ],
      { showIcons: true, truncateAfter: 3, animateChanges: true, schemaMarkup: true }
    );

    const names = utils.getSimilarArtists(artistData.artist, { limit: 24 });
    this.buildSimilar(names);
    this.bindArtistPageEvents(artistData);
  },

  renderAllArtistsPage: function() {
    const dynamicContent = $byId(IDS.dynamicContent);
    if (!dynamicContent || !window.music) return;

    dynamicContent.innerHTML = render.page("allArtists");

    const artistsGrid = $byId(IDS.artistsGrid);
    if (artistsGrid) {
      window.music.forEach(function (artist, index) {
        const artistCard = document.createElement("div");
        artistCard.className = "animate__animated animate__fadeIn";
        artistCard.style.animationDelay = 0.05 * index + "s";

        artistCard.innerHTML = render.artist("card", {
          id: artist.artist.replace(/\s+/g, "").toLowerCase(),
          artist: artist.artist,
          cover: utils.getArtistImageUrl(artist.artist),
          genre: artist.genre || "Various",
          albumCount: artist.albums.length,
        });

        artistsGrid.appendChild(artistCard);

        artistCard.querySelector(".artist-card").addEventListener("click", function () {
          appState.router.navigateTo(ROUTES.ARTIST, { artist: artist.artist });
        });
      });
    }

    uiManager.breadCrumbs([
      {
        text: "Home",
        route: ROUTES.HOME,
        active: false,
        isHome: true,
      },
      {
        text: "All Artists",
        route: ROUTES.ALL_ARTISTS,
        active: true,
      },
    ]);

    this.bindAllArtistsEvents();
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
  }
};