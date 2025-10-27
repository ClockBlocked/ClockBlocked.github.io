// Unified Player Integration
// Integrates the unified player with the existing music system

import { 
    appState, 
    musicPlayer, 
    notifications, 
    NOTIFICATION_TYPES 
} from './global.js';

class UnifiedPlayerIntegration {
    constructor() {
        this.isInitialized = false;
        this.playerController = null;
        this.musicPlayerAPI = null;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Wait for the main app to be ready
        this.waitForAppReady().then(() => {
            this.setupIntegration();
            this.bindGlobalEvents();
            this.isInitialized = true;
            console.log('🎵 Unified Player Integration initialized');
        });
    }
    
    async waitForAppReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.musicAppAPI && window.unifiedPlayerController) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }
    
    setupIntegration() {
        this.playerController = window.unifiedPlayerController;
        this.musicPlayerAPI = window.musicAppAPI;
        
        // Override the existing music player methods to work with unified system
        this.overrideMusicPlayerMethods();
        
        // Set up cross-device synchronization
        this.setupCrossDeviceSync();
        
        // Initialize desktop bento grid integration
        this.setupDesktopBentoIntegration();
    }
    
    overrideMusicPlayerMethods() {
        // Override the main player toggle method
        const originalToggle = musicPlayer.mainPlayer.toggle;
        musicPlayer.mainPlayer.toggle = () => {
            if (this.playerController) {
                this.playerController.toggle();
            } else {
                originalToggle();
            }
        };
        
        // Override the open method
        const originalOpen = musicPlayer.mainPlayer.open;
        musicPlayer.mainPlayer.open = () => {
            if (this.playerController) {
                this.playerController.open();
            } else {
                originalOpen();
            }
        };
        
        // Override the close method
        const originalClose = musicPlayer.mainPlayer.close;
        musicPlayer.mainPlayer.close = () => {
            if (this.playerController) {
                this.playerController.close();
            } else {
                originalClose();
            }
        };
    }
    
    setupCrossDeviceSync() {
        // Listen for player state changes and sync across all displays
        window.addEventListener('playerstatechange', (e) => {
            this.syncPlayerState(e.detail);
        });
        
        // Listen for window resize to handle responsive behavior
        window.addEventListener('resize', this.debounce(() => {
            this.handleResponsiveChanges();
        }, 250));
    }
    
    syncPlayerState(playerState) {
        // Sync navbar player (mobile)
        this.updateNavbarPlayer(playerState);
        
        // Sync unified triggers
        this.updateUnifiedTriggers(playerState);
        
        // Sync bento grid player (desktop)
        this.updateBentoGridPlayer(playerState);
        
        // Update player controller
        if (this.playerController) {
            this.playerController.updatePlayerDisplay(playerState);
        }
    }
    
    updateNavbarPlayer(playerState) {
        const navbar = document.getElementById('navbar');
        if (!navbar || window.innerWidth >= 768) return; // Only for mobile
        
        const albumArtwork = navbar.querySelector('.albumArtwork img');
        const songName = navbar.querySelector('.songName');
        const artistName = navbar.querySelector('.artistName');
        const playIndicator = navbar.querySelector('#play-indicator');
        const nowPlayingArea = navbar.querySelector('#now-playing-area');
        
        if (playerState.song) {
            // Update album artwork
            if (albumArtwork && playerState.song.cover) {
                albumArtwork.src = playerState.song.cover;
                albumArtwork.style.opacity = '1';
                
                // Hide the SVG icon
                const svgIcon = navbar.querySelector('.albumArtwork svg');
                if (svgIcon) svgIcon.style.display = 'none';
            }
            
            // Update song info
            if (songName) songName.textContent = playerState.song.title || 'No song playing';
            if (artistName) artistName.textContent = playerState.song.artist || 'Select a song to get started';
            
            // Update play indicator
            if (playIndicator) {
                playIndicator.classList.toggle('active', playerState.isPlaying);
            }
            
            // Add has-song class to now playing area
            if (nowPlayingArea) {
                nowPlayingArea.classList.add('has-song');
            }
        } else {
            // Reset to default state
            if (albumArtwork) albumArtwork.style.opacity = '0';
            if (songName) songName.textContent = 'No song playing';
            if (artistName) artistName.textContent = 'Select a song to get started';
            if (playIndicator) playIndicator.classList.remove('active');
            if (nowPlayingArea) nowPlayingArea.classList.remove('has-song');
            
            // Show the SVG icon
            const svgIcon = navbar.querySelector('.albumArtwork svg');
            if (svgIcon) svgIcon.style.display = 'block';
        }
        
        // Update navbar controls
        this.updateNavbarControls(playerState);
    }
    
    updateNavbarControls(playerState) {
        const playIcon = document.getElementById('play-icon-navbar');
        const pauseIcon = document.getElementById('pause-icon-navbar');
        
        if (playIcon && pauseIcon) {
            if (playerState.isPlaying) {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
            } else {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            }
        }
    }
    
    updateUnifiedTriggers(playerState) {
        const playerTrigger = document.getElementById('unified-player-trigger');
        if (!playerTrigger) return;
        
        // Update trigger appearance based on player state
        if (playerState.isPlaying) {
            playerTrigger.classList.add('playing');
            
            // Add subtle animation to indicate playing
            playerTrigger.style.animation = 'pulse 2s infinite';
        } else {
            playerTrigger.classList.remove('playing');
            playerTrigger.style.animation = '';
        }
        
        // Update trigger tooltip
        const hasActiveSong = playerState.song && playerState.song.title;
        const tooltipText = hasActiveSong 
            ? `${playerState.isPlaying ? 'Now Playing' : 'Paused'}: ${playerState.song.title}`
            : 'Music Player';
        
        playerTrigger.setAttribute('title', tooltipText);
    }
    
    updateBentoGridPlayer(playerState) {
        const bentoPlayerCard = document.querySelector('.music-player-card');
        if (!bentoPlayerCard) return;
        
        // Update bento card content
        const cardTitle = bentoPlayerCard.querySelector('.card-title');
        if (cardTitle && playerState.song) {
            cardTitle.textContent = playerState.isPlaying ? 'Now Playing' : 'Paused';
        }
        
        // Add playing indicator to bento card
        bentoPlayerCard.classList.toggle('playing', playerState.isPlaying);
    }
    
    setupDesktopBentoIntegration() {
        if (window.innerWidth < 1024) return;
        
        // Check if we should auto-embed in bento grid
        const autoEmbed = localStorage.getItem('autoEmbedPlayer') === 'true';
        const bentoGrid = document.querySelector('.bento-grid');
        
        if (autoEmbed && bentoGrid && this.playerController) {
            // Wait a bit for the page to fully load
            setTimeout(() => {
                this.playerController.embedInBentoGrid();
                notifications.show('Music player embedded in dashboard', NOTIFICATION_TYPES.INFO);
            }, 1000);
        }
    }
    
    handleResponsiveChanges() {
        const newDeviceType = this.getDeviceType();
        
        if (this.playerController) {
            this.playerController.deviceType = newDeviceType;
            this.playerController.setupResponsiveHandling();
            this.playerController.updateDisplayMode();
        }
        
        // Re-sync player state after responsive changes
        if (appState.currentSong) {
            const currentState = {
                song: appState.currentSong,
                isPlaying: appState.isPlaying,
                currentTime: appState.audio?.currentTime || 0,
                duration: appState.duration || 0
            };
            this.syncPlayerState(currentState);
        }
    }
    
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    bindGlobalEvents() {
        // Bind the unified menu and player triggers
        this.bindUnifiedTriggers();
        
        // Bind mobile navbar controls
        this.bindMobileControls();
        
        // Bind keyboard shortcuts
        this.bindKeyboardShortcuts();
        
        // Bind settings for display mode
        this.bindDisplayModeSettings();
    }
    
    bindUnifiedTriggers() {
        // Menu triggers
        const mobileMenuTrigger = document.getElementById('menu-trigger');
        const unifiedMenuTrigger = document.getElementById('unified-menu-trigger');
        const dropdownMenu = document.getElementById('dropdown-menu');
        const dropdownClose = document.getElementById('dropdown-close');
        
        const toggleMenu = () => {
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('show');
                
                // Close player if menu is opened (to avoid conflicts)
                if (dropdownMenu.classList.contains('show') && this.playerController) {
                    this.playerController.close();
                }
            }
        };
        
        const closeMenu = () => {
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        };
        
        // Bind triggers
        if (mobileMenuTrigger) {
            mobileMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });
        }
        
        if (unifiedMenuTrigger) {
            unifiedMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });
        }
        
        if (dropdownClose) {
            dropdownClose.addEventListener('click', closeMenu);
        }
        
        // Player triggers
        const mobilePlayerTrigger = document.getElementById('now-playing-area');
        const unifiedPlayerTrigger = document.getElementById('unified-player-trigger');
        
        const togglePlayer = () => {
            if (this.playerController) {
                this.playerController.toggle();
                
                // Close menu if player is opened
                closeMenu();
            }
        };
        
        if (mobilePlayerTrigger) {
            mobilePlayerTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlayer();
            });
        }
        
        if (unifiedPlayerTrigger) {
            unifiedPlayerTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlayer();
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdownMenu && dropdownMenu.classList.contains('show')) {
                if (!dropdownMenu.contains(e.target) && 
                    !mobileMenuTrigger?.contains(e.target) && 
                    !unifiedMenuTrigger?.contains(e.target)) {
                    closeMenu();
                }
            }
        });
    }
    
    bindMobileControls() {
        // Bind mobile navbar playback controls
        const previousBtn = document.querySelector('#navbar .previous');
        const playPauseBtn = document.querySelector('#navbar .playPause');
        const nextBtn = document.querySelector('#navbar .next');
        
        if (previousBtn) {
            previousBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (musicPlayer.playback) {
                    musicPlayer.playback.previous();
                }
            });
        }
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (appState.isPlaying) {
                    if (musicPlayer.playback) musicPlayer.playback.pause();
                } else {
                    if (musicPlayer.playback) musicPlayer.playback.play();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (musicPlayer.playback) {
                    musicPlayer.playback.next();
                }
            });
        }
    }
    
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.playerController) {
                        this.playerController.toggle();
                    }
                    break;
                    
                case 'KeyM':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const dropdownMenu = document.getElementById('dropdown-menu');
                        if (dropdownMenu) {
                            dropdownMenu.classList.toggle('show');
                        }
                    }
                    break;
                    
                case 'KeyP':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (this.playerController) {
                            this.playerController.toggle();
                        }
                    }
                    break;
                    
                case 'Escape':
                    // Close any open overlays
                    const dropdownMenu = document.getElementById('dropdown-menu');
                    if (dropdownMenu) {
                        dropdownMenu.classList.remove('show');
                    }
                    if (this.playerController) {
                        this.playerController.close();
                    }
                    break;
            }
        });
    }
    
    bindDisplayModeSettings() {
        // Add a setting in the dropdown menu for desktop display mode
        if (window.innerWidth >= 1024) {
            this.addDisplayModeToggle();
        }
    }
    
    addDisplayModeToggle() {
        const settingsSection = document.querySelector('.dropdown-section:last-child');
        if (!settingsSection) return;
        
        const displayModeItem = document.createElement('div');
        displayModeItem.className = 'dropdown-item';
        displayModeItem.id = 'display-mode-toggle';
        
        const currentMode = localStorage.getItem('playerDisplayMode') || 'overlay';
        const isEmbedded = currentMode === 'embedded';
        
        displayModeItem.innerHTML = `
            <div class="dropdown-item-icon">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
            </div>
            <div class="dropdown-item-content">
                <div class="dropdown-item-title">Player Display</div>
                <div class="dropdown-item-subtitle">${isEmbedded ? 'Embedded in dashboard' : 'Overlay mode'}</div>
            </div>
            <div class="dropdown-item-toggle">
                <input type="checkbox" ${isEmbedded ? 'checked' : ''} />
            </div>
        `;
        
        settingsSection.appendChild(displayModeItem);
        
        const toggle = displayModeItem.querySelector('input[type="checkbox"]');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                const newMode = e.target.checked ? 'embedded' : 'overlay';
                
                if (this.playerController) {
                    this.playerController.setDisplayMode(newMode);
                }
                
                // Update the subtitle
                const subtitle = displayModeItem.querySelector('.dropdown-item-subtitle');
                if (subtitle) {
                    subtitle.textContent = newMode === 'embedded' ? 'Embedded in dashboard' : 'Overlay mode';
                }
                
                // Show notification
                notifications.show(
                    `Player display mode: ${newMode === 'embedded' ? 'Embedded' : 'Overlay'}`,
                    NOTIFICATION_TYPES.SUCCESS
                );
            });
        }
    }
    
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
    }
    
    // Public API methods
    getPlayerController() {
        return this.playerController;
    }
    
    isPlayerOpen() {
        return this.playerController?.drawer?.matches(':popover-open') || false;
    }
    
    getCurrentDisplayMode() {
        return this.playerController?.getDisplayMode() || 'overlay';
    }
    
    refreshIntegration() {
        this.handleResponsiveChanges();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.unifiedPlayerIntegration = new UnifiedPlayerIntegration();
});

// Export for module usage
export { UnifiedPlayerIntegration };