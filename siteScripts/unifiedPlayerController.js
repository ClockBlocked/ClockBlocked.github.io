// Unified Player Controller
// Handles the same music player across all devices with different display modes

const UnifiedPlayerController = {
    drawer: null,
    isInitialized: false,
    currentDisplayMode: 'overlay', // 'overlay', 'embedded'
    deviceType: null,
    
    init() {
        if (this.isInitialized) return;
        
        this.drawer = document.getElementById('drawer');
        if (!this.drawer) {
            return;
        }
        
        this.deviceType = this.getDeviceType();
        this.setupEventListeners();
        this.setupResponsiveHandling();
        this.updateDisplayMode();
        
        this.isInitialized = true;
    },
    
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    },
    
    setupEventListeners() {
        // Listen for player state changes
        window.addEventListener('playerstatechange', (e) => {
            this.updatePlayerDisplay(e.detail);
        });
        
        // Listen for resize events
        window.addEventListener('resize', this.debounce(() => {
            this.deviceType = this.getDeviceType();
            this.updateDisplayMode();
        }, 250));
        
        // Listen for popover state changes
        this.drawer.addEventListener('toggle', (e) => {
            if (e.newState === 'open') {
                this.onPlayerOpen();
            } else {
                this.onPlayerClose();
            }
        });
    },
    
    setupResponsiveHandling() {
        // Set up device-specific behaviors
        switch (this.deviceType) {
            case 'mobile':
                this.setupMobileHandling();
                break;
            case 'tablet':
                this.setupTabletHandling();
                break;
            case 'desktop':
                this.setupDesktopHandling();
                break;
        }
    },
    
    setupMobileHandling() {
        // Mobile: Full screen drawer from bottom
        this.drawer.classList.remove('tablet-mode', 'desktop-mode');
        this.drawer.classList.add('mobile-mode');
        
        // Enable swipe to close
        this.setupSwipeToClose();
    },
    
    setupTabletHandling() {
        // Tablet: Centered modal-style drawer
        this.drawer.classList.remove('mobile-mode', 'desktop-mode');
        this.drawer.classList.add('tablet-mode');
        
        // Adjust drawer size for tablet
        const drawerContent = this.drawer.querySelector('.drawerContent');
        if (drawerContent) {
            drawerContent.style.maxWidth = '600px';
            drawerContent.style.margin = '10vh auto';
        }
    },
    
    setupDesktopHandling() {
        // Desktop: Can be overlay or embedded in bento grid
        this.drawer.classList.remove('mobile-mode', 'tablet-mode');
        this.drawer.classList.add('desktop-mode');
        
        // Check if should be embedded in bento grid
        if (this.shouldEmbedInBento()) {
            this.embedInBentoGrid();
        }
    },
    
    setupSwipeToClose() {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        const drawerContent = this.drawer.querySelector('.drawerContent');
        if (!drawerContent) return;
        
        const handleTouchStart = (e) => {
            startY = e.touches[0].clientY;
            currentY = startY;
            isDragging = true;
            drawerContent.style.transition = 'none';
        };
        
        const handleTouchMove = (e) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 0) {
                const opacity = Math.max(0.5, 1 - deltaY / 300);
                const translateY = Math.min(deltaY, 200);
                
                drawerContent.style.transform = `translateY(${translateY}px)`;
                drawerContent.style.opacity = opacity;
            }
        };
        
        const handleTouchEnd = () => {
            if (!isDragging) return;
            
            isDragging = false;
            drawerContent.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            const deltaY = currentY - startY;
            
            if (deltaY > 100) {
                this.close();
            } else {
                drawerContent.style.transform = 'translateY(0)';
                drawerContent.style.opacity = '1';
            }
        };
        
        drawerContent.addEventListener('touchstart', handleTouchStart, { passive: true });
        drawerContent.addEventListener('touchmove', handleTouchMove, { passive: false });
        drawerContent.addEventListener('touchend', handleTouchEnd, { passive: true });
    },
    
    shouldEmbedInBento() {
        // Check user preference or app state
        const userPreference = localStorage.getItem('playerDisplayMode');
        const bentoGrid = document.querySelector('.bento-grid');
        
        return userPreference === 'embedded' && 
               bentoGrid && 
               this.deviceType === 'desktop';
    },
    
    embedInBentoGrid() {
        const bentoGrid = document.querySelector('.bento-grid');
        if (!bentoGrid) return;
        
        // Create bento card for music player
        const musicPlayerCard = this.createBentoPlayerCard();
        bentoGrid.appendChild(musicPlayerCard);
        
        // Move drawer into bento card
        this.drawer.classList.add('bento-embedded');
        this.drawer.style.position = 'static';
        this.drawer.style.height = '100%';
        
        musicPlayerCard.appendChild(this.drawer);
        this.currentDisplayMode = 'embedded';
    },
    
    unembedFromBento() {
        if (this.currentDisplayMode !== 'embedded') return;
        
        const musicPlayerCard = this.drawer.closest('.music-player-card');
        if (musicPlayerCard) {
            // Move drawer back to body
            document.body.appendChild(this.drawer);
            musicPlayerCard.remove();
        }
        
        // Reset drawer styles
        this.drawer.classList.remove('bento-embedded');
        this.drawer.style.position = '';
        this.drawer.style.height = '';
        
        this.currentDisplayMode = 'overlay';
    },
    
    createBentoPlayerCard() {
        const card = document.createElement('div');
        card.className = 'bento-card music-player-card';
        card.innerHTML = `
            <div class="card-header">
                <h2 class="card-title">Now Playing</h2>
                <div class="card-actions">
                    <button class="expand-player-btn" title="Expand Player">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button class="minimize-player-btn" title="Hide Player">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Bind card actions
        const expandBtn = card.querySelector('.expand-player-btn');
        const minimizeBtn = card.querySelector('.minimize-player-btn');
        
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                this.unembedFromBento();
                this.open();
            });
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.unembedFromBento();
            });
        }
        
        return card;
    },
    
    updateDisplayMode() {
        if (this.deviceType === 'desktop' && this.shouldEmbedInBento()) {
            if (this.currentDisplayMode !== 'embedded') {
                this.embedInBentoGrid();
            }
        } else {
            if (this.currentDisplayMode === 'embedded') {
                this.unembedFromBento();
            }
        }
    },
    
    updatePlayerDisplay(playerState) {
        if (!playerState) return;
        
        // Update all player displays (navbar, drawer, bento card)
        this.updateNavbarDisplay(playerState);
        this.updateDrawerDisplay(playerState);
        
        if (this.currentDisplayMode === 'embedded') {
            this.updateBentoCardDisplay(playerState);
        }
    },
    
    updateNavbarDisplay(playerState) {
        const navbarCover = document.querySelector('#navbar .albumArtwork img');
        const navbarSong = document.querySelector('#navbar .songName');
        const navbarArtist = document.querySelector('#navbar .artistName');
        const playIndicator = document.querySelector('#play-indicator');
        
        if (navbarCover && playerState.song?.cover) {
            navbarCover.src = playerState.song.cover;
            navbarCover.style.opacity = '1';
        }
        
        if (navbarSong && playerState.song?.title) {
            navbarSong.textContent = playerState.song.title;
        }
        
        if (navbarArtist && playerState.song?.artist) {
            navbarArtist.textContent = playerState.song.artist;
        }
        
        if (playIndicator) {
            playIndicator.classList.toggle('active', playerState.isPlaying);
        }
    },
    
    updateDrawerDisplay(playerState) {
        const drawerCover = document.querySelector('#drawer #cover');
        const drawerTitle = document.querySelector('#drawer #title');
        const drawerArtist = document.querySelector('#drawer #artist');
        const drawerAlbum = document.querySelector('#drawer #album');
        
        if (drawerCover && playerState.song?.cover) {
            drawerCover.src = playerState.song.cover;
        }
        
        if (drawerTitle && playerState.song?.title) {
            drawerTitle.textContent = playerState.song.title;
        }
        
        if (drawerArtist && playerState.song?.artist) {
            drawerArtist.textContent = playerState.song.artist;
        }
        
        if (drawerAlbum && playerState.song?.album) {
            drawerAlbum.textContent = playerState.song.album;
        }
    },
    
    updateBentoCardDisplay(playerState) {
        const bentoCard = document.querySelector('.music-player-card');
        if (!bentoCard) return;
        
        // Update bento card with current player state
        // This would sync with the embedded drawer content
    },
    
    open() {
        if (this.currentDisplayMode === 'embedded') {
            // Already visible in bento grid
            return;
        }
        
        if (this.drawer) {
            this.drawer.showPopover();
        }
    },
    
    close() {
        if (this.currentDisplayMode === 'embedded') {
            // Hide the bento card or minimize it
            const bentoCard = document.querySelector('.music-player-card');
            if (bentoCard) {
                bentoCard.style.display = 'none';
            }
            return;
        }
        
        if (this.drawer) {
            this.drawer.hidePopover();
        }
    },
    
    toggle() {
        if (this.currentDisplayMode === 'embedded') {
            const bentoCard = document.querySelector('.music-player-card');
            if (bentoCard) {
                const isVisible = bentoCard.style.display !== 'none';
                bentoCard.style.display = isVisible ? 'none' : 'block';
            }
            return;
        }
        
        if (this.drawer) {
            if (this.drawer.matches(':popover-open')) {
                this.close();
            } else {
                this.open();
            }
        }
    },
    
    onPlayerOpen() {
        document.body.classList.add('player-open');
    },
    
    onPlayerClose() {
        document.body.classList.remove('player-open');
    },
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Set display mode preference
    setDisplayMode(mode) {
        if (['overlay', 'embedded'].includes(mode)) {
            localStorage.setItem('playerDisplayMode', mode);
            this.updateDisplayMode();
        }
    },
    
    // Get current display mode
    getDisplayMode() {
        return this.currentDisplayMode;
    },
    
    // Force refresh of player state
    refresh() {
        this.setupResponsiveHandling();
        this.updateDisplayMode();
    }
};

// Initialize unified player controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.unifiedPlayerController = Object.create(UnifiedPlayerController);
    window.unifiedPlayerController.init();
});

// Export for module usage
export { UnifiedPlayerController };