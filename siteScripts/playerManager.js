export const playerManager = {
  playerElement: null,
  isTabletOffcanvasOpen: false,
  isMobileOffcanvasOpen: false,
  currentViewport: 'mobile',

  init() {
    this.detectViewport();
    this.setupTabletTrigger();
    this.setupMobileTrigger();
    this.setupOffcanvasHandlers();
    window.addEventListener('resize', () => this.handleResize());
  },

  detectViewport() {
    const width = window.innerWidth;
    if (width < 768) {
      this.currentViewport = 'mobile';
    } else if (width >= 768 && width <= 1024) {
      this.currentViewport = 'tablet';
    } else {
      this.currentViewport = 'desktop';
    }
  },

  setupTabletTrigger() {
    const trigger = document.getElementById('tabletPlayerTrigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        this.toggleTabletPlayer();
      });
    }
  },

  setupMobileTrigger() {
    const trigger = document.querySelector('.navbar-icon[data-action="player"]');
    if (trigger) {
      trigger.addEventListener('click', () => {
        this.toggleMobilePlayer();
      });
    }
  },

  setupOffcanvasHandlers() {
    const offcanvas = document.querySelector('.offcanvas-player');
    if (offcanvas) {
      const handle = offcanvas.querySelector('.offcanvas-handle');
      if (handle) {
        let startY = 0;
        let currentY = 0;

        handle.addEventListener('touchstart', (e) => {
          startY = e.touches[0].clientY;
        });

        handle.addEventListener('touchmove', (e) => {
          currentY = e.touches[0].clientY;
          const diff = currentY - startY;
          if (diff > 0) {
            offcanvas.style.transform = `translateY(${diff}px)`;
          }
        });

        handle.addEventListener('touchend', (e) => {
          const diff = currentY - startY;
          if (diff > 100) {
            this.closeOffcanvas();
          } else {
            offcanvas.style.transform = '';
          }
        });
      }
    }
  },

  toggleTabletPlayer() {
    this.isTabletOffcanvasOpen = !this.isTabletOffcanvasOpen;
    const offcanvas = document.querySelector('.offcanvas-player');
    if (offcanvas) {
      offcanvas.classList.toggle('active', this.isTabletOffcanvasOpen);
    }
  },

  toggleMobilePlayer() {
    this.isMobileOffcanvasOpen = !this.isMobileOffcanvasOpen;
    const offcanvas = document.querySelector('.offcanvas-player');
    if (offcanvas) {
      offcanvas.classList.toggle('active', this.isMobileOffcanvasOpen);
    }
  },

  closeOffcanvas() {
    this.isTabletOffcanvasOpen = false;
    this.isMobileOffcanvasOpen = false;
    const offcanvas = document.querySelector('.offcanvas-player');
    if (offcanvas) {
      offcanvas.classList.remove('active');
      offcanvas.style.transform = '';
    }
  },

  movePlayerToDesktopCard() {
    const bentoPlayerCard = document.getElementById('bentoPlayerContent');
    const currentPlayer = document.getElementById('musicPlayer');
    
    if (bentoPlayerCard && currentPlayer) {
      bentoPlayerCard.appendChild(currentPlayer);
      currentPlayer.style.position = 'relative';
      currentPlayer.style.width = '100%';
      currentPlayer.style.height = '100%';
    }
  },

  movePlayerToOffcanvas() {
    const offcanvasContent = document.querySelector('.offcanvas-content');
    const currentPlayer = document.getElementById('musicPlayer');
    
    if (offcanvasContent && currentPlayer) {
      offcanvasContent.appendChild(currentPlayer);
      currentPlayer.style.position = 'relative';
      currentPlayer.style.width = '100%';
      currentPlayer.style.height = 'auto';
    }
  },

  handleResize() {
    const oldViewport = this.currentViewport;
    this.detectViewport();

    if (oldViewport !== this.currentViewport) {
      if (this.currentViewport === 'desktop') {
        this.closeOffcanvas();
        this.movePlayerToDesktopCard();
      } else {
        this.movePlayerToOffcanvas();
      }
    }
  },

  embedPlayer(playerHTML) {
    if (this.currentViewport === 'desktop') {
      const bentoPlayerContent = document.getElementById('bentoPlayerContent');
      if (bentoPlayerContent) {
        bentoPlayerContent.innerHTML = playerHTML;
      }
    } else {
      const offcanvasContent = document.querySelector('.offcanvas-content');
      if (offcanvasContent) {
        offcanvasContent.innerHTML = playerHTML;
      }
    }
  }
};
