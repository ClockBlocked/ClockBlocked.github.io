// Desktop Layout Handler
// This module manages the desktop split-screen layout with menu and player sidebars

export function initDesktopLayout() {
  // Use a flag to track if our desktop elements have been created
  let desktopElementsInitialized = false;
  let syncInterval = null; // To hold the ID of our setInterval

  // This function contains all the logic to create or destroy the desktop view
  function handleDesktopLayout() {
    const isDesktop = window.innerWidth >= 1024;

    // --- SCENARIO 1: We're on a desktop screen AND elements haven't been created yet ---
    if (isDesktop && !desktopElementsInitialized) {
      desktopElementsInitialized = true; // Set flag to true

      // Create and Append All Desktop Elements
      // Create desktop menu trigger button
      const menuTrigger = document.createElement('button');
      menuTrigger.className = 'desktop-menu-trigger';
      menuTrigger.innerHTML = `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>`;

      // Create desktop menu sidebar
      const menuSidebar = document.createElement('div');
      menuSidebar.className = 'desktop-menu-sidebar';
      const dropdownMenu = document.getElementById('dropdown-menu');
      if (dropdownMenu) {
        menuSidebar.innerHTML = `<div class="desktop-menu-header"><h2 class="desktop-menu-title">Music Library</h2></div>${dropdownMenu.innerHTML.replace(/dropdown-/g, 'desktop-menu-')}`;
      }

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'desktop-menu-overlay';

      // Create player sidebar
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
          <div class="player-sidebar-progress"><div class="progress" id="sidebar-music-progress"><div class="time"><span id="sidebar-current-time">0:00</span><span id="sidebar-total-time">0:00</span></div><div class="progressBar" id="sidebar-progress-bar" tabindex="0" role="slider"><div class="progressBuffer" id="sidebar-progress-buffer" style="width: 0%;"></div><div class="progressFill" id="sidebar-progress-fill" style="width: 0%;"><div class="progressThumb" id="sidebar-progress-thumb" style="left: 0%;"></div></div></div></div></div>
          <div class="player-sidebar-buttons">
            <button class="sidebar-control-btn previous" id="sidebar-prev"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg></button>
            <button class="sidebar-control-btn play-pause" id="sidebar-play-pause"><svg id="sidebar-play-icon" class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg><svg id="sidebar-pause-icon" class="w-7 h-7 hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
            <button class="sidebar-control-btn next" id="sidebar-next"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" /></svg></button>
          </div>
          <div class="player-sidebar-actions">
            <button class="sidebar-action-btn" id="sidebar-shuffle" title="Shuffle"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" /></svg></button>
            <button class="sidebar-action-btn" id="sidebar-favorite" title="Favorite"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg></button>
            <button class="sidebar-action-btn" id="sidebar-repeat" title="Repeat"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" /></svg></button>
            <button class="sidebar-action-btn" id="sidebar-queue" title="Queue"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg></button>
          </div>
        </div>
      `;
      document.body.appendChild(menuTrigger);
      document.body.appendChild(menuSidebar);
      document.body.appendChild(overlay);
      document.body.appendChild(playerSidebar);

      // Wire Up Event Listeners and Intervals
      menuTrigger.addEventListener('click', () => { 
        menuSidebar.classList.toggle('open'); 
        overlay.classList.toggle('open'); 
      });
      
      overlay.addEventListener('click', () => { 
        menuSidebar.classList.remove('open'); 
        overlay.classList.remove('open'); 
      });
      
      // Sync player sidebar with main player
      const syncPlayerSidebar = () => {
        const mainSongName = document.querySelector('.songName')?.textContent;
        const mainArtistName = document.querySelector('.artistName')?.textContent;
        const mainAlbumArt = document.querySelector('#cover')?.src;
        const mainAlbumName = document.querySelector('.albumName')?.textContent;
        const mainCurrentTime = document.querySelector('#currentTime')?.textContent;
        const mainTotalTime = document.querySelector('#totalTime')?.textContent;
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
        
        // Sync play/pause button state
        const mainPlayBtn = document.querySelector('#playBtn');
        const sidebarPlayIcon = document.getElementById('sidebar-play-icon');
        const sidebarPauseIcon = document.getElementById('sidebar-pause-icon');
        const navbarPauseIcon = document.getElementById('pause-icon-navbar');
        
        if (mainPlayBtn && sidebarPlayIcon && sidebarPauseIcon) {
          const isPlaying = navbarPauseIcon && !navbarPauseIcon.classList.contains('hidden');
          if (isPlaying) {
            sidebarPlayIcon.classList.add('hidden');
            sidebarPauseIcon.classList.remove('hidden');
          } else {
            sidebarPlayIcon.classList.remove('hidden');
            sidebarPauseIcon.classList.add('hidden');
          }
        }
      };
      
      syncInterval = setInterval(syncPlayerSidebar, 100);

      // Wire up control buttons
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
      
      // Add event listeners to desktop menu items using MutationObserver for robustness
      const bindDesktopMenuItems = () => {
        const desktopMenuItems = document.querySelectorAll('.desktop-menu-item');
        let boundCount = 0;
        
        desktopMenuItems.forEach(item => {
          // Get the original ID from the dropdown menu
          const itemId = item.id.replace('desktop-menu-', 'dropdown-');
          
          // Validate the replacement worked
          if (itemId === item.id || !itemId.startsWith('dropdown-')) {
            console.warn('Desktop menu item ID replacement failed:', item.id);
            return;
          }
          
          const originalElement = document.getElementById(itemId);
          
          if (originalElement && originalElement._clickHandler) {
            item.addEventListener('click', (e) => {
              e.stopPropagation();
              originalElement._clickHandler(e);
              // Close the menu after clicking
              menuSidebar.classList.remove('open');
              overlay.classList.remove('open');
            });
            boundCount++;
          } else if (originalElement) {
            // If no _clickHandler, try to click the original element
            item.addEventListener('click', (e) => {
              e.stopPropagation();
              originalElement.click();
              // Close the menu after clicking
              menuSidebar.classList.remove('open');
              overlay.classList.remove('open');
            });
            boundCount++;
          }
        });
        
        console.log(`Bound ${boundCount} desktop menu items`);
      };
      
      // Try binding immediately, then observe for changes
      setTimeout(bindDesktopMenuItems, 100);
      
      // Also observe for when menu items become available (in case of delayed rendering)
      const menuObserver = new MutationObserver((mutations) => {
        const hasMenuItems = document.querySelectorAll('.desktop-menu-item').length > 0;
        if (hasMenuItems) {
          bindDesktopMenuItems();
          menuObserver.disconnect();
        }
      });
      
      menuObserver.observe(menuSidebar, { childList: true, subtree: true });
      
      // Disconnect observer after 2 seconds to avoid memory leaks
      setTimeout(() => menuObserver.disconnect(), 2000);
    }
    // --- SCENARIO 2: We're on a mobile screen AND the desktop elements EXIST ---
    else if (!isDesktop && desktopElementsInitialized) {
      desktopElementsInitialized = false; // Set flag to false

      // Stop the sync interval to prevent errors
      if (syncInterval) clearInterval(syncInterval);

      // Remove all the created elements
      document.querySelector('.desktop-menu-trigger')?.remove();
      document.querySelector('.desktop-menu-sidebar')?.remove();
      document.querySelector('.desktop-menu-overlay')?.remove();
      document.querySelector('.desktop-player-sidebar')?.remove();
    }
  }

  // Add the event listener to run our function on every resize
  window.addEventListener('resize', handleDesktopLayout);

  // Run the function once on initial page load
  handleDesktopLayout();
}
