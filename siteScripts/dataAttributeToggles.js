/**
 * Data Attribute Toggle System for Music Player and Dropdown Menu
 * Usage: Add data-toggle-drawer or data-toggle-menu to any element
 */

class DataAttributeToggles {
    constructor() {
        this.drawer = document.getElementById('drawer');
        this.dropdownMenu = document.getElementById('dropdown-menu');
        
        this.init();
    }
    
    init() {
        this.setupDrawerToggles();
        this.setupMenuToggles();
        this.setupCloseOnOutsideClick();
    }
    
    // ==================== MUSIC PLAYER DRAWER ====================
    setupDrawerToggles() {
        // Handle all elements with data-toggle-drawer
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-toggle-drawer]');
            if (!trigger) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const action = trigger.dataset.toggleDrawer; // 'open', 'close', or 'toggle'
            
            switch(action) {
                case 'open':
                    this.openDrawer();
                    break;
                case 'close':
                    this.closeDrawer();
                    break;
                case 'toggle':
                default:
                    this.toggleDrawer();
                    break;
            }
        });
    }
    
    openDrawer() {
        if (!this.drawer) return;
        
        if (typeof this.drawer.showPopover === 'function') {
            this.drawer.showPopover();
        } else {
            this.drawer.classList.add('open');
        }
        
        // Update aria attributes
        this.updateDrawerAria(true);
    }
    
    closeDrawer() {
        if (!this.drawer) return;
        
        if (typeof this.drawer.hidePopover === 'function') {
            this.drawer.hidePopover();
        } else {
            this.drawer.classList.remove('open');
        }
        
        // Update aria attributes
        this.updateDrawerAria(false);
    }
    
    toggleDrawer() {
        const isOpen = this.isDrawerOpen();
        
        if (isOpen) {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    }
    
    isDrawerOpen() {
        if (!this.drawer) return false;
        
        try {
            return this.drawer.matches(':popover-open') || this.drawer.classList.contains('open');
        } catch {
            return this.drawer.classList.contains('open');
        }
    }
    
    updateDrawerAria(isOpen) {
        // Update all drawer triggers
        document.querySelectorAll('[data-toggle-drawer]').forEach(trigger => {
            trigger.setAttribute('aria-expanded', isOpen);
        });
    }
    
    // ==================== DROPDOWN MENU ====================
    setupMenuToggles() {
        // Handle all elements with data-toggle-menu
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-toggle-menu]');
            if (!trigger) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const action = trigger.dataset.toggleMenu; // 'open', 'close', or 'toggle'
            
            switch(action) {
                case 'open':
                    this.openMenu();
                    break;
                case 'close':
                    this.closeMenu();
                    break;
                case 'toggle':
                default:
                    this.toggleMenu();
                    break;
            }
        });
    }
    
    openMenu() {
        if (!this.dropdownMenu) return;
        
        this.dropdownMenu.classList.add('show');
        this.updateMenuAria(true);
        
        // Close drawer if open (optional - remove if you want both open)
        // this.closeDrawer();
    }
    
    closeMenu() {
        if (!this.dropdownMenu) return;
        
        this.dropdownMenu.classList.remove('show');
        this.updateMenuAria(false);
    }
    
    toggleMenu() {
        const isOpen = this.isMenuOpen();
        
        if (isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    isMenuOpen() {
        return this.dropdownMenu?.classList.contains('show') || false;
    }
    
    updateMenuAria(isOpen) {
        // Update all menu triggers
        document.querySelectorAll('[data-toggle-menu]').forEach(trigger => {
            trigger.setAttribute('aria-expanded', isOpen);
        });
    }
    
    // ==================== OUTSIDE CLICK HANDLING ====================
    setupCloseOnOutsideClick() {
        document.addEventListener('click', (e) => {
            // Don't close if clicking a toggle button
            if (e.target.closest('[data-toggle-drawer]') || e.target.closest('[data-toggle-menu]')) {
                return;
            }
            
            // Close menu if clicking outside
            if (this.dropdownMenu && this.isMenuOpen()) {
                if (!this.dropdownMenu.contains(e.target)) {
                    this.closeMenu();
                }
            }
            
            // Close drawer if clicking on curtain/backdrop
            if (this.drawer && this.isDrawerOpen()) {
                const clickedCurtain = e.target.classList.contains('drawerCurtain');
                const clickedBackdrop = e.target === this.drawer && !e.target.querySelector('.drawerContent')?.contains(e.target);
                
                if (clickedCurtain || clickedBackdrop) {
                    this.closeDrawer();
                }
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dataAttributeToggles = new DataAttributeToggles();
    });
} else {
    window.dataAttributeToggles = new DataAttributeToggles();
}

// Export for module usage
export default DataAttributeToggles;