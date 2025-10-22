// viewManager.js
// Centralized view management, menu handling, and scrolling logic

class ViewManager {
    constructor() {
        this.currentView = 'home';
        this.currentViewport = 'mobile';
        this.menuOpen = false;
        this.init();
    }

    init() {
        this.detectViewport();
        this.ensureScrollability();
        this.setupMenuTriggers();
        this.setupScrollHandling();
        
        // Listen for viewport changes
        window.addEventListener('resize', () => this.handleResize());
    }

    detectViewport() {
        const width = window.innerWidth;
        const oldViewport = this.currentViewport;
        
        if (width < 768) {
            this.currentViewport = 'mobile';
        } else if (width >= 768 && width < 1024) {
            this.currentViewport = 'tablet';
        } else {
            this.currentViewport = 'desktop';
        }
        
        return oldViewport !== this.currentViewport;
    }

    handleResize() {
        const viewportChanged = this.detectViewport();
        if (viewportChanged) {
            this.updateMenuTriggers();
            this.updateMenuPosition();
            // Notify playerManager of viewport change
            if (window.playerManager) {
                window.playerManager.handleViewportChange();
            }
        }
    }

    setupMenuTriggers() {
        // Setup menu triggers for all viewports
        const mobileMenuTrigger = document.getElementById('menu-trigger');
        const desktopMenuTrigger = document.getElementById('desktop-menu-trigger');
        const dropdownMenu = document.getElementById('dropdown-menu');
        const dropdownClose = document.getElementById('dropdown-close');
        
        // Mobile trigger (from navbar, only visible on mobile)
        if (mobileMenuTrigger && dropdownMenu) {
            mobileMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }
        
        // Desktop/Tablet trigger (fixed button, visible on tablet and desktop)
        if (desktopMenuTrigger && dropdownMenu) {
            desktopMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }
        
        // Close button
        if (dropdownClose && dropdownMenu) {
            dropdownClose.addEventListener('click', () => {
                this.closeMenu();
            });
        }
        
        // Close on overlay click (desktop/tablet only)
        if (dropdownMenu) {
            dropdownMenu.addEventListener('click', (e) => {
                if (e.target === dropdownMenu && this.currentViewport !== 'mobile') {
                    this.closeMenu();
                }
            });
        }
        
        this.updateMenuTriggers();
    }

    updateMenuTriggers() {
        const mobileMenuTrigger = document.getElementById('menu-trigger');
        const desktopMenuTrigger = document.getElementById('desktop-menu-trigger');
        
        if (this.currentViewport === 'mobile') {
            // Show mobile trigger (in navbar)
            if (mobileMenuTrigger) mobileMenuTrigger.style.display = '';
            // Hide desktop trigger
            if (desktopMenuTrigger) desktopMenuTrigger.style.display = 'none';
        } else {
            // Hide mobile trigger (navbar is hidden on tablet/desktop)
            if (mobileMenuTrigger) mobileMenuTrigger.style.display = 'none';
            // Show desktop trigger
            if (desktopMenuTrigger) desktopMenuTrigger.style.display = 'flex';
        }
    }

    updateMenuPosition() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        if (!dropdownMenu) return;
        
        // CSS handles positioning via media queries, but we ensure correct state
        dropdownMenu.classList.remove('show');
        this.menuOpen = false;
    }

    toggleMenu() {
        if (this.menuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.classList.add('show');
            this.menuOpen = true;
        }
    }

    closeMenu() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.classList.remove('show');
            this.menuOpen = false;
        }
    }

    ensureScrollability() {
        // Fix scrolling issues in bento grid cards
        const bentoCards = document.querySelectorAll('.bentoCard');
        bentoCards.forEach(card => {
            // Ensure cards don't have overflow: visible which prevents scrolling
            const computedStyle = window.getComputedStyle(card);
            if (computedStyle.overflow === 'visible') {
                card.style.overflow = 'hidden';
            }
        });
        
        // Ensure card content areas are scrollable
        const cardContents = document.querySelectorAll('.card-content');
        cardContents.forEach(content => {
            content.style.overflowY = 'auto';
            content.style.overflowX = 'hidden';
        });
    }

    setupScrollHandling() {
        // Ensure main content area is scrollable
        const mainArea = document.getElementById('mainArea');
        if (mainArea) {
            mainArea.style.overflowY = 'auto';
            mainArea.style.overflowX = 'hidden';
        }
    }

    switchView(newView, options = {}) {
        this.currentView = newView;
        
        // Ensure scrollability after view switch
        setTimeout(() => {
            this.ensureScrollability();
        }, 100);
        
        // Return a promise for compatibility with existing code
        return Promise.resolve();
    }

    transitionIn(view) {
        // Placeholder for view transition logic if needed
        return this.switchView(view);
    }

    getCurrentViewport() {
        return this.currentViewport;
    }
}

// Create and export singleton instance
const viewManager = new ViewManager();

// Make available globally for compatibility
if (typeof window !== 'undefined') {
    window.viewManager = viewManager;
}

export default viewManager;
