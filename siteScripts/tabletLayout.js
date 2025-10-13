// Tablet Layout Handler
// This module manages the tablet-specific player sidebar behavior with trigger tab

export function initTabletLayout() {
  let tabletTriggerInitialized = false;
  let playerTrigger = null;

  function handleTabletLayout() {
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const playerSidebar = document.querySelector('.desktop-player-sidebar');

    if (isTablet && !tabletTriggerInitialized && playerSidebar) {
      tabletTriggerInitialized = true;

      // Create trigger tab
      playerTrigger = document.createElement('button');
      playerTrigger.className = 'tablet-player-trigger';
      playerTrigger.setAttribute('aria-label', 'Toggle music player');
      playerTrigger.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v18m0-18a9 9 0 100 18 9 9 0 000-18z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      `;

      document.body.appendChild(playerTrigger);

      // Initially hide the player sidebar on tablet
      playerSidebar.classList.add('tablet-hidden');

      // Toggle player sidebar on trigger click
      playerTrigger.addEventListener('click', () => {
        playerSidebar.classList.toggle('tablet-hidden');
        playerTrigger.classList.toggle('active');
      });

    } else if (!isTablet && tabletTriggerInitialized) {
      // Clean up when not in tablet view
      tabletTriggerInitialized = false;
      
      if (playerTrigger) {
        playerTrigger.remove();
        playerTrigger = null;
      }

      // Remove tablet classes from player sidebar
      const playerSidebar = document.querySelector('.desktop-player-sidebar');
      if (playerSidebar) {
        playerSidebar.classList.remove('tablet-hidden');
      }
    }
  }

  // Run on load and resize
  window.addEventListener('resize', handleTabletLayout);
  handleTabletLayout();
}
