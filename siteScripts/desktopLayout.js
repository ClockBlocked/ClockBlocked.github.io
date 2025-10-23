import { utils } from "./global.js";

export function initDesktopLayout() {
  let desktopElementsInitialized = false;
  let syncPlayerSidebar = null;

  function handleDesktopLayout() {
    const isDesktop = window.innerWidth >= 1024;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    if ((isDesktop || isTablet) && !desktopElementsInitialized) {
      desktopElementsInitialized = true;

      const menuTrigger = document.createElement('button');
      menuTrigger.className = 'desktop-menu-trigger';
      menuTrigger.innerHTML = `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>`;

      const menuSidebar = document.createElement('div');
      menuSidebar.className = 'desktop-menu-sidebar';
      const dropdownMenu = document.getElementById('dropdown-menu');
      if (dropdownMenu) {
        menuSidebar.innerHTML = `<div class="desktop-menu-header"><h2 class="desktop-menu-title">Music Library</h2></div>${dropdownMenu.innerHTML.replace(/dropdown-/g, 'desktop-menu-')}`;
      }

      const overlay = document.createElement('div');
      overlay.className = 'desktop-menu-overlay';

      const playerSidebar = document.createElement('div');
      playerSidebar.className = 'desktop-player-sidebar';
      playerSidebar.innerHTML = `
        <div class="player-sidebar-header"><span class="player-sidebar-title">Now Playing</span></div>
        <div class="player-sidebar-album">
          <div class="player-sidebar-album-art"><img id="sidebar-album-art" src="" alt="Album Cover"></div>
          <div class="player-sidebar-info">
            <div class="player-sidebar-song" id="sidebar-song-name">No song playing</div>
            <div class="player-sidebar-artist" id="sidebar-artist-name">Select a song to start</div>
            <div class="player-sidebar-album-name" id="sidebar-album-name"></div>
          </div>
        </div>
        <div class="player-sidebar-controls">
          <div class="player-sidebar-progress"><div class="progress" id="sidebar-music-progress"><div class="time"><span id="sidebar-current-time">0:00</span><span id="sidebar-total-time">0:00</span></div><div class="bar"><div class="buffer" id="sidebar-progress-buffer"></div><div class="fill" id="sidebar-progress-fill" style="width:0%"></div></div></div></div>
          <div class="player-sidebar-buttons">
            <button class="sidebar-control-btn previous" id="sidebar-prev"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-5.89 4a1 1 0 000 1.664l5.89 4z"></path></svg></button>
            <button class="sidebar-control-btn play-pause" id="sidebar-play-pause"><svg id="sidebar-play-icon" class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2-9a1 1 0 012 0v4a1 1 0 01-2 0V9zm4 0a1 1 0 112 0v4a1 1 0 11-2 0V9z" clip-rule="evenodd"></path></svg><svg id="sidebar-pause-icon" class="w-7 h-7 hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zm6 0a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" clip-rule="evenodd"></path></svg></button>
            <button class="sidebar-control-btn next" id="sidebar-next"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l5.89-4a1 1 0 000-1.664l-5.89-4A1 1 0 0010 6v2.798L4.555 5.168z"></path></svg></button>
          </div>
          <div class="player-sidebar-actions">
            <button class="sidebar-action-btn" id="sidebar-shuffle" title="Shuffle"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 00-1.05 9.294A1 1 0 004.05 15.606l2.828 2.829a1 1 0 001.415-1.415l-2.829-2.828a5 5 0 117.071-7.07l2.829 2.828a1 1 0 101.415-1.415l-2.828-2.828A7.001 7.001 0 004 2z" clip-rule="evenodd"></path></svg></button>
            <button class="sidebar-action-btn" id="sidebar-favorite" title="Favorite"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></button>
            <button class="sidebar-action-btn" id="sidebar-repeat" title="Repeat"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 00-1.05 9.294A1 1 0 004.05 15.606l2.828 2.829a1 1 0 001.415-1.415l-2.829-2.828a5 5 0 117.071-7.07l2.829 2.828a1 1 0 101.415-1.415l-2.828-2.828A7.001 7.001 0 004 2z" clip-rule="evenodd"></path></svg></button>
            <button class="sidebar-action-btn" id="sidebar-queue" title="Queue"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H4z"></path></svg></button>
          </div>
        </div>
      `;
      document.body.appendChild(menuTrigger);
      document.body.appendChild(menuSidebar);
      document.body.appendChild(overlay);
      document.body.appendChild(playerSidebar);

      menuTrigger.addEventListener('click', () => {
        menuSidebar.classList.toggle('open');
        overlay.classList.toggle('open');
      });

      overlay.addEventListener('click', () => {
        menuSidebar.classList.remove('open');
        overlay.classList.remove('open');
      });

      syncPlayerSidebar = function (playerState) {
        let state = playerState?.detail || {};
        const mainSongName = state.song?.title || document.querySelector('.songName')?.textContent;
        const mainArtistName = state.artist || document.querySelector('.artistName')?.textContent;
        const mainAlbumArt = state.song?.cover || document.querySelector('#cover')?.src;
        const mainAlbumName = state.album || document.querySelector('.albumName')?.textContent;
        const mainCurrentTime = state.currentTime !== undefined ? utils.formatTime(state.currentTime) : document.querySelector('#currentTime')?.textContent;
        const mainTotalTime = state.duration !== undefined ? utils.formatTime(state.duration) : document.querySelector('#totalTime')?.textContent;
        const mainProgressFill = document.querySelector('#progressFill')?.style.width;

        const sidebarSongName = document.getElementById('sidebar-song-name');
        const sidebarArtistName = document.getElementById('sidebar-artist-name');
        const sidebarAlbumArt = document.getElementById('sidebar-album-art');
        const sidebarAlbumName = document.getElementById('sidebar-album-name');
        const sidebarCurrentTime = document.getElementById('sidebar-current-time');
        const sidebarTotalTime = document.getElementById('sidebar-total-time');
        const sidebarProgressFill = document.getElementById('sidebar-progress-fill');

        if (sidebarSongName && mainSongName) sidebarSongName.textContent = mainSongName;
        if (sidebarArtistName && mainArtistName) sidebarArtistName.textContent = mainArtistName;
        if (sidebarAlbumArt && mainAlbumArt) sidebarAlbumArt.src = mainAlbumArt;
        if (sidebarAlbumName && mainAlbumName) sidebarAlbumName.textContent = mainAlbumName;
        if (sidebarCurrentTime && mainCurrentTime) sidebarCurrentTime.textContent = mainCurrentTime;
        if (sidebarTotalTime && mainTotalTime) sidebarTotalTime.textContent = mainTotalTime;
        if (sidebarProgressFill && mainProgressFill) sidebarProgressFill.style.width = mainProgressFill;

        const sidebarPlayIcon = document.getElementById('sidebar-play-icon');
        const sidebarPauseIcon = document.getElementById('sidebar-pause-icon');
        if (sidebarPlayIcon && sidebarPauseIcon) {
          if (state.isPlaying) {
            sidebarPlayIcon.classList.add('hidden');
            sidebarPauseIcon.classList.remove('hidden');
          } else {
            sidebarPlayIcon.classList.remove('hidden');
            sidebarPauseIcon.classList.add('hidden');
          }
        }
      };

      window.addEventListener('playerstatechange', syncPlayerSidebar);
      syncPlayerSidebar();

      const sidebarPlayPause = document.getElementById('sidebar-play-pause');
      const sidebarPrev = document.getElementById('sidebar-prev');
      const sidebarNext = document.getElementById('sidebar-next');

      if (sidebarPlayPause) {
        sidebarPlayPause.addEventListener('click', () => {
          const navbarPlayPause = document.querySelector('.navbar-center .playPause');
          if (navbarPlayPause) navbarPlayPause.click();
        });
      }

      if (sidebarPrev) {
        sidebarPrev.addEventListener('click', () => {
          const navbarPrev = document.querySelector('.navbar-right .previous');
          if (navbarPrev) navbarPrev.click();
        });
      }

      if (sidebarNext) {
        sidebarNext.addEventListener('click', () => {
          const navbarNext = document.querySelector('.navbar-right .next');
          if (navbarNext) navbarNext.click();
        });
      }

      const bindDesktopMenuItems = () => {
        const desktopMenuItems = document.querySelectorAll('.desktop-menu-item');
        let boundCount = 0;

        desktopMenuItems.forEach(item => {
          const itemId = item.id.replace('desktop-menu-', 'dropdown-');
          if (itemId === item.id || !itemId.startsWith('dropdown-')) {
            return;
          }
          const originalElement = document.getElementById(itemId);
          if (originalElement && originalElement._clickHandler) {
            item.addEventListener('click', (e) => {
              e.stopPropagation();
              originalElement._clickHandler(e);
              menuSidebar.classList.remove('open');
              overlay.classList.remove('open');
            });
            boundCount++;
          } else if (originalElement) {
            item.addEventListener('click', (e) => {
              e.stopPropagation();
              originalElement.click();
              menuSidebar.classList.remove('open');
              overlay.classList.remove('open');
            });
            boundCount++;
          }
        });
      };

      setTimeout(bindDesktopMenuItems, 100);

      const menuObserver = new MutationObserver((mutations) => {
        const hasMenuItems = document.querySelectorAll('.desktop-menu-item').length > 0;
        if (hasMenuItems) {
          bindDesktopMenuItems();
          menuObserver.disconnect();
        }
      });

      menuObserver.observe(menuSidebar, { childList: true, subtree: true });
      setTimeout(() => menuObserver.disconnect(), 2000);
    } else if (!isDesktop && !isTablet && desktopElementsInitialized) {
      desktopElementsInitialized = false;
      document.querySelector('.desktop-menu-trigger')?.remove();
      document.querySelector('.desktop-menu-sidebar')?.remove();
      document.querySelector('.desktop-menu-overlay')?.remove();
      document.querySelector('.desktop-player-sidebar')?.remove();
      if (syncPlayerSidebar) {
        window.removeEventListener('playerstatechange', syncPlayerSidebar);
        syncPlayerSidebar = null;
      }
    }
  }

  window.addEventListener('resize', handleDesktopLayout);
  handleDesktopLayout();
}
