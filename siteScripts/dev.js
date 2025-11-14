const MusicPlayerEnhanced = {
    /**
     * APPLICATION STATE MANAGEMENT
     * 
     * This object tracks the current state of the music player:
     * - currentTab: Which panel/tab is currently active (0 = first tab)
     * - isCollapsed: Whether the header/cover section is minimized
     * - isTransitioning: Prevents conflicts during animation transitions
     * - scrollThreshold: How far to scroll before triggering header collapse
     * - isDraggingHeader: Tracks if user is currently dragging the header
     * - dragStartY/dragDistance: Track drag gesture positions and movement
     * - lastScrollTop: Remembers previous scroll position for scroll direction detection
     * - scrollTimeout/transitionTimeout: Manage timing of scroll and transition events
     */
    state: {
        currentTab: 0,
        isCollapsed: false,
        isTransitioning: false,
        scrollThreshold: 150,
        isDraggingHeader: false,
        dragStartY: 0,
        dragDistance: 0,
        lastScrollTop: 0,
        scrollTimeout: null,
        transitionTimeout: null
    },

    /**
     * INITIALIZATION FUNCTION
     * 
     * This is the entry point that sets up the music player.
     * Call this once when the page loads to initialize all functionality.
     */
    init() {
        this.cacheDOMElements();
        this.injectRequiredHTML();
        this.bindEvents();
        this.setupObservers();
    },



    /**
     * DOM ELEMENT CACHING
     * 
     * Stores references to key DOM elements for easy access later.
     * This improves performance by avoiding repeated DOM queries.
     */
    cacheDOMElements() {
        // Main player container element
        this.player = document.querySelector('.player');
        
        
        // Wrapper element for the album cover/header section
        this.coverWrapper = document.querySelector('.player .coverWrapper');
        // The actual album cover image element
        this.cover = document.querySelector('.player .cover');
        
        
        // All tab panels (likely "Now Playing", "Playlist", "Queue" etc.)
        this.panels = document.querySelectorAll('.player .panel');
        
        // Tabs 
        this.recentTab = document.querySelector('.panel[data-tab="playlist"]');
        this.queueTab = document.querySelector('.panel[data-tab="queue"]');
        
        
        // The dot indicators at bottom for switching between tabs
        this.dotIndicators = document.querySelectorAll('.player .dotIndicator');
        // Handle element for drag interactions (if present)
        this.dragHandle = document.querySelector('.player .dragHandle');
    },

    /**
     * DYNAMIC HTML INJECTION
     * 
     * Adds necessary wrapper elements and decorative elements that
     * are required for the enhanced UI but might not be in the base HTML.
     * 
     * This creates:
     * - Container for cover image with special styling
     * - Glow effect behind the cover
     * - Containers for scrollable lists
     * - Mini header elements for collapsed state
     */
    injectRequiredHTML() {
        // Safety check - exit if essential elements don't exist
        if (!this.coverWrapper || !this.cover) return;

        // Create container for cover image if it doesn't exist
        // This allows for special styling and effects on the container
        if (!this.cover.parentElement.classList.contains('coverImageContainer')) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'coverImageContainer';
            this.cover.parentNode.insertBefore(imageContainer, this.cover);
            imageContainer.appendChild(this.cover);
        }

        // Add glow effect behind the album cover
        // This creates the visual "halo" effect around the cover
        const existingGlow = this.coverWrapper.querySelector('.coverGlow');
        if (!existingGlow) {
            const glow = document.createElement('div');
            glow.className = 'coverGlow';
            this.coverWrapper.insertBefore(glow, this.coverWrapper.firstChild);
        }

        // Wrap all list elements in containers for better scroll management
        // This enables the custom scroll behavior and header collapsing
        this.panels.forEach(panel => {
            const list = panel.querySelector('.list');
            if (list && !list.parentElement.classList.contains('listContainer')) {
                const listContainer = document.createElement('div');
                listContainer.className = 'listContainer';
                list.parentNode.insertBefore(listContainer, list);
                listContainer.appendChild(list);
            }
        });

        // Create or update the mini header that shows when collapsed
        this.updateMiniHeaderElements();
    },

    /**
     * EVENT BINDING
     * 
     * Attaches all event listeners for user interactions:
     * - Tab switching via dot indicators
     * - Scroll detection in list containers
     * - Drag gestures on header
     * - Click interactions
     */
    bindEvents() {
        // Bind click events to dot indicators for tab switching
        this.dotIndicators.forEach((dot, index) => {
            dot.addEventListener('click', () => this.switchTab(index));
        });

        // Bind scroll events to each list container for header collapse/expand
        this.panels.forEach((panel, index) => {
            const listContainer = panel.querySelector('.listContainer');
            if (listContainer) {
                listContainer.addEventListener('scroll', () => this.handleScroll(listContainer, index));
            }
        });

        // Header drag and click interactions
        if (this.coverWrapper) {
            // Drag start events for header collapse/expand gestures
//            this.coverWrapper.addEventListener('mousedown', (e) => this.handleHeaderDragStart(e));
//            this.coverWrapper.addEventListener('touchstart', (e) => this.handleHeaderDragStart(e), { passive: false });
  
  
            this.recentTab.addEventListener('mousedown', (e) => this.handleHeaderDragStart(e));
            this.recentTab.addEventListener('touchstart', (e) => this.handleHeaderDragStart(e), { passive: false });
            this.queueTab.addEventListener('mousedown', (e) => this.handleHeaderDragStart(e));
            this.queueTab.addEventListener('touchstart', (e) => this.handleHeaderDragStart(e), { passive: false });


            
            // Click to expand header when collapsed (except on mini controls)
            this.coverWrapper.addEventListener('click', (e) => {
                if (this.state.isCollapsed && this.state.currentTab !== 0 && !this.state.isTransitioning) {
                    if (e.target.closest('.miniControlBtn')) return;
                    this.expandHeader();
                }
            });
        }

        // Global drag events (bound to document to track drag outside original element)
        document.addEventListener('mousemove', (e) => this.handleHeaderDragMove(e));
        document.addEventListener('touchmove', (e) => this.handleHeaderDragMove(e), { passive: false });
        document.addEventListener('mouseup', () => this.handleHeaderDragEnd());
        document.addEventListener('touchend', () => this.handleHeaderDragEnd());
    },

    /**
     * MUTATION OBSERVER SETUP
     * 
     * Watches for dynamic changes to the DOM (like adding new songs to playlists)
     * and ensures new elements get the proper interactive features.
     */
    setupObservers() {
        const mutationObserver = new MutationObserver(() => {
            this.interactions.songLists();
        });

        // Observe all panels for changes to their content
        this.panels.forEach(panel => {
            mutationObserver.observe(panel, {
                childList: true,  // Watch for elements being added/removed
                subtree: true     // Watch all nested elements within panels
            });
        });

        // Apply interactions to any existing list items
        this.interactions.songLists();
    },

    /**
     * TAB SWITCHING FUNCTION
     * 
     * Handles switching between different panels/tabs and manages
     * the header state based on which tab is active.
     * 
     * @param {number} index - The index of the tab to switch to (0-based)
     */
    switchTab(index) {
        // Prevent tab switching during animations to avoid conflicts
        if (this.state.isTransitioning) return;
        
        // Update current tab state
        this.state.currentTab = index;

        // Update dot indicator visual states
        this.dotIndicators.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Show/hide panels based on active tab
        this.panels.forEach((panel, i) => {
            if (i === index) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Special handling for first tab (usually "Now Playing")
        // Always expand header when switching to first tab
        if (index === 0) {
            this.expandHeader();
        } else {
            // For other tabs, check scroll position to determine header state
            const activePanel = this.panels[index];
            const listContainer = activePanel.querySelector('.listContainer');
            
            if (listContainer && listContainer.scrollTop > this.state.scrollThreshold) {
                this.collapseHeader();
            } else {
                this.expandHeader();
            }
        }
    },

    /**
     * SCROLL HANDLING
     * 
     * Monitors scrolling in list containers and triggers header
     * collapse/expand based on scroll direction and position.
     * 
     * @param {HTMLElement} listContainer - The scrolling container element
     * @param {number} tabIndex - Which tab this scroll event belongs to
     */
    handleScroll(listContainer, tabIndex) {
        // Only process scroll events for active tab, and skip first tab
        if (this.state.isTransitioning || this.state.currentTab !== tabIndex || tabIndex === 0) {
            return;
        }

        const currentScrollTop = listContainer.scrollTop;
        const isScrollingDown = currentScrollTop > this.state.lastScrollTop;
        const scrollDelta = Math.abs(currentScrollTop - this.state.lastScrollTop);
        
        // Update last scroll position for next comparison
        this.state.lastScrollTop = currentScrollTop;

        // Ignore tiny scroll movements to prevent jittery behavior
        if (scrollDelta < 5) return;

        // Clear previous timeout to prevent multiple triggers
        clearTimeout(this.state.scrollTimeout);

        // Use timeout to "debounce" the scroll events
        this.state.scrollTimeout = setTimeout(() => {
            // Collapse header when scrolling down past threshold
            if (currentScrollTop > this.state.scrollThreshold && isScrollingDown && !this.state.isCollapsed) {
                this.collapseHeader();
            } 
            // Expand header when scrolling up near the top
            else if (currentScrollTop < 50 && !isScrollingDown && this.state.isCollapsed) {
                this.expandHeader();
            }
        }, 50); // 50ms delay provides smooth scrolling experience
    },

    /**
     * HEADER COLLAPSE ANIMATION
     * 
     * Animates the header/cover section to a minimized state.
     * This creates more space for content in the list views.
     */
    collapseHeader() {
        // Prevent collapse during transitions or if already collapsed
        if (this.state.isCollapsed || this.state.isTransitioning || !this.coverWrapper) return;
        
        // Update state flags
        this.state.isTransitioning = true;
        this.state.isCollapsed = true;

        // Use double requestAnimationFrame for reliable CSS transition triggering
        requestAnimationFrame(() => {
            this.coverWrapper.classList.add('is-collapsing');
            
            requestAnimationFrame(() => {
                this.coverWrapper.classList.add('collapsed');

                // Clear any existing timeout and set new one for transition end
                clearTimeout(this.state.transitionTimeout);
                this.state.transitionTimeout = setTimeout(() => {
                    this.coverWrapper.classList.remove('is-collapsing');
                    this.state.isTransitioning = false;
                }, 350); // Matches CSS transition duration
            });
        });
    },

    /**
     * HEADER EXPAND ANIMATION
     * 
     * Animates the header/cover section back to its full expanded state.
     * This reveals the full album art and track information.
     */
    expandHeader() {
        // Prevent expand during transitions or if already expanded
        if (!this.state.isCollapsed || this.state.isTransitioning || !this.coverWrapper) return;
        
        // Update state flags
        this.state.isTransitioning = true;
        this.state.isCollapsed = false;

        // Use double requestAnimationFrame for reliable CSS transition triggering
        requestAnimationFrame(() => {
            this.coverWrapper.classList.add('is-collapsing');
            
            requestAnimationFrame(() => {
                this.coverWrapper.classList.remove('collapsed');

                // Clear any existing timeout and set new one for transition end
                clearTimeout(this.state.transitionTimeout);
                this.state.transitionTimeout = setTimeout(() => {
                    this.coverWrapper.classList.remove('is-collapsing');
                    this.state.isTransitioning = false;
                }, 350); // Matches CSS transition duration
            });
        });
    },

    /**
     * MINI HEADER ELEMENTS UPDATE
     * 
     * Creates or updates the compact header that appears when
     * the main header is collapsed. Shows track info and play controls.
     */
    updateMiniHeaderElements() {
        if (!this.coverWrapper) return;

        // Get current track information from the main player
        const titleElement = document.querySelector('.player .title');
        const artistElement = document.querySelector('.player .artist');

        // Create or get the mini header container
        let miniHeader = this.coverWrapper.querySelector('.miniHeader');
        if (!miniHeader) {
            miniHeader = document.createElement('div');
            miniHeader.className = 'miniHeader';
            this.coverWrapper.appendChild(miniHeader);
        }

        // Extract text content safely (empty string if elements don't exist)
        const title = titleElement ? titleElement.textContent : '';
        const artist = artistElement ? artistElement.textContent : '';

        // Build mini header HTML with escaped content for safety
        miniHeader.innerHTML = `
            <div class="miniTitle">${this.escapeHTML(title)}</div>
            <div class="miniArtist">${this.escapeHTML(artist)}</div>
        `;

        // Create or get the mini controls container
        let miniControls = this.coverWrapper.querySelector('.miniControls');
        if (!miniControls) {
            miniControls = document.createElement('div');
            miniControls.className = 'miniControls';
            this.coverWrapper.appendChild(miniControls);
        }

        // Determine current play state and appropriate icon
        const isPaused = !this.player || !this.player.classList.contains('isPlaying');
        const playIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-14 9V3z"/></svg>';
        const pauseIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';

        // Build mini controls HTML
        miniControls.innerHTML = `
            <button class="miniControlBtn" onclick="MusicPlayerEnhanced.togglePlayPause()">
                ${isPaused ? playIcon : pauseIcon}
            </button>
        `;
    },

    /**
     * HTML ESCAPE UTILITY
     * 
     * Safely escapes HTML strings to prevent XSS vulnerabilities
     * when inserting dynamic content into the DOM.
     * 
     * @param {string} str - The string to escape
     * @returns {string} - The safely escaped string
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * PLAY/PAUSE TOGGLE
     * 
     * Triggers the main play/pause functionality by simulating
     * a click on the primary control button.
     */
    togglePlayPause() {
        const primaryBtn = document.querySelector('.player .controlBtn.primary');
        if (primaryBtn) {
            primaryBtn.click();
            // Update mini header after a short delay to ensure state has changed
            setTimeout(() => this.updateMiniHeaderElements(), 100);
        }
    },

    /**
     * HEADER DRAG START HANDLER
     * 
     * Initiates drag interaction for collapsing/expanding the header
     * via drag gestures (mouse or touch).
     * 
     * @param {Event} e - The mouse or touch start event
     */
    handleHeaderDragStart(e) {
        // Only allow dragging on non-first tabs and when not transitioning
        if (!this.coverWrapper || this.state.currentTab === 0 || this.state.isTransitioning) return;
        
        // Don't start drag if clicking on mini controls
        if (e.target.closest('.miniControlBtn')) return;
        
        // Verify the click originated from within the cover wrapper
        const targetElement = e.target;
        if (!targetElement.closest('.coverWrapper')) return;

        // Initialize drag state
        this.state.isDraggingHeader = true;
        this.state.dragStartY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        this.state.dragDistance = 0;
    },

    /**
     * HEADER DRAG MOVE HANDLER
     * 
     * Tracks drag movement and calculates drag distance for
     * determining when to trigger collapse/expand.
     * 
     * @param {Event} e - The mouse or touch move event
     */
    handleHeaderDragMove(e) {
        // Only process if drag is active
        if (!this.state.isDraggingHeader || !this.coverWrapper) return;
        
        // Calculate current drag position and distance
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        this.state.dragDistance = currentY - this.state.dragStartY;
        
        // Prevent dragging up when already collapsed
        if (this.state.isCollapsed && this.state.dragDistance < 0) {
            return;
        }
        
        // Prevent dragging down when already expanded
        if (!this.state.isCollapsed && this.state.dragDistance > 0) {
            return;
        }
    },

    /**
     * HEADER DRAG END HANDLER
     * 
     * Completes drag interaction and triggers collapse/expand
     * based on final drag distance and direction.
     */
    handleHeaderDragEnd() {
        // Only process if drag was active
        if (!this.state.isDraggingHeader || !this.coverWrapper) return;
        
        // Reset drag state
        this.state.isDraggingHeader = false;
        
        // Minimum drag distance required to trigger action
        const dragThreshold = 60;
        
        // Trigger collapse/expand based on drag distance and direction
        if (Math.abs(this.state.dragDistance) > dragThreshold) {
            if (this.state.dragDistance < 0 && !this.state.isCollapsed) {
                this.collapseHeader();
            } else if (this.state.dragDistance > 0 && this.state.isCollapsed) {
                this.expandHeader();
            }
        }
        
        // Reset drag distance
        this.state.dragDistance = 0;
    },

    
    
    
    
    
interactions: {
  
  songLists: () => {
    /**
     * LIST ITEM INTERACTIONS SETUP
     * 
     * Enhances list items (songs, albums, etc.) with:
     * - Artwork wrappers for consistent styling
     * - Play button overlays on hover
     * 
     * This is called initially and whenever new items are added dynamically.
     */
        const listItems = document.querySelectorAll('.list-item');
        
        listItems.forEach(item => {
            const artwork = item.querySelector('.item-artwork');
            if (!artwork) return;

            // Wrap artwork in container for consistent styling
            let wrapper = artwork.parentElement;
            if (!wrapper.classList.contains('item-artwork-wrapper')) {
                wrapper = document.createElement('div');
                wrapper.className = 'item-artwork-wrapper';
                artwork.parentNode.insertBefore(wrapper, artwork);
                wrapper.appendChild(artwork);
            }

            // Add play button overlay that appears on hover
            if (!wrapper.querySelector('.item-play-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'item-play-overlay';
                overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
                wrapper.appendChild(overlay);
            }
        });
  }
  
}
    
    
    
};










////////////////////////////////////////////////////////////
////////////////////////////  PAGE LOADER EVENTS ///////////
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MusicPlayerEnhanced.init());
} else {
    MusicPlayerEnhanced.init();
}
////////////////////////////////////////////////////////////























/**
 * 
 *  C R E A T E D  B Y
 * 
 *  William Hanson 
 * 
 *  Chevrolay@Outlook.com
 * 
 *  m.me/Chevrolay
 * 
 */