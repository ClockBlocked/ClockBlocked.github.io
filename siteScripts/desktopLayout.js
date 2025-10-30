import { utils } from "./global.js";
import { render } from "./utilities/templates.js";

export function initDesktopLayout() {
  let desktopElementsInitialized = false;
  let syncPlayerSidebar = null;

  function handleDesktopLayout() {
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop && !desktopElementsInitialized) {
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
      playerSidebar.innerHTML = render.desktopPlayerSidebar();
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
    } else if (!isDesktop && desktopElementsInitialized) {
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
