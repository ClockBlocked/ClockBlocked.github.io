const MusicPlayerEnhanced = {
    state: {
        currentTab: 0,
        isCollapsed: false,
        isTransitioning: false,
        scrollThreshold: 150,
        isDragging: false,
        dragStartY: 0,
        dragDistance: 0,
        lastScrollTop: 0,
        scrollTimeout: null,
        transitionTimeout: null
    },

    init() {
        this.cacheDOMElements();
        this.injectRequiredHTML();
        this.bindEvents();
        this.setupObservers();
    },

    cacheDOMElements() {
        this.player = document.querySelector('.player');
        this.coverWrapper = document.querySelector('.player .coverWrapper');
        this.cover = document.querySelector('.player .cover');
        this.panels = document.querySelectorAll('.player .panel');
        this.dotIndicators = document.querySelectorAll('.player .dotIndicator');
        this.dragHandle = document.querySelector('.player .dragHandle');
    },

    injectRequiredHTML() {
        if (!this.coverWrapper || !this.cover) return;

        if (!this.cover.parentElement.classList.contains('coverImageContainer')) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'coverImageContainer';
            this.cover.parentNode.insertBefore(imageContainer, this.cover);
            imageContainer.appendChild(this.cover);
        }

        const existingGlow = this.coverWrapper.querySelector('.coverGlow');
        if (!existingGlow) {
            const glow = document.createElement('div');
            glow.className = 'coverGlow';
            this.coverWrapper.insertBefore(glow, this.coverWrapper.firstChild);
        }

        this.panels.forEach(panel => {
            const list = panel.querySelector('.list');
            if (list && !list.parentElement.classList.contains('listContainer')) {
                const listContainer = document.createElement('div');
                listContainer.className = 'listContainer';
                list.parentNode.insertBefore(listContainer, list);
                listContainer.appendChild(list);
            }
        });

        this.updateMiniHeaderElements();
    },

    bindEvents() {
        this.dotIndicators.forEach((dot, index) => {
            dot.addEventListener('click', () => this.switchTab(index));
        });

        this.panels.forEach((panel, index) => {
            const listContainer = panel.querySelector('.listContainer');
            if (listContainer) {
                listContainer.addEventListener('scroll', () => this.handleScroll(listContainer, index));
            }
        });

        if (this.dragHandle) {
            this.dragHandle.addEventListener('mousedown', (e) => this.handleDragStart(e));
            this.dragHandle.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: false });
        }

        if (this.coverWrapper) {
            this.coverWrapper.addEventListener('click', (e) => {
                if (this.state.isCollapsed && this.state.currentTab !== 0 && !this.state.isTransitioning) {
                    if (e.target.closest('.miniControlBtn')) return;
                    this.expandHeader();
                }
            });
        }

        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        document.addEventListener('mouseup', () => this.handleDragEnd());
        document.addEventListener('touchend', () => this.handleDragEnd());
    },

    setupObservers() {
        const mutationObserver = new MutationObserver(() => {
            this.addListItemInteractions();
        });

        this.panels.forEach(panel => {
            mutationObserver.observe(panel, {
                childList: true,
                subtree: true
            });
        });

        this.addListItemInteractions();
    },

    switchTab(index) {
        if (this.state.isTransitioning) return;
        
        this.state.currentTab = index;

        this.dotIndicators.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        this.panels.forEach((panel, i) => {
            if (i === index) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        if (index === 0) {
            this.expandHeader();
        } else {
            const activePanel = this.panels[index];
            const listContainer = activePanel.querySelector('.listContainer');
            
            if (listContainer && listContainer.scrollTop > this.state.scrollThreshold) {
                this.collapseHeader();
            } else {
                this.expandHeader();
            }
        }
    },

    handleScroll(listContainer, tabIndex) {
        if (this.state.isTransitioning || this.state.currentTab !== tabIndex || tabIndex === 0) {
            return;
        }

        const currentScrollTop = listContainer.scrollTop;
        const isScrollingDown = currentScrollTop > this.state.lastScrollTop;
        const scrollDelta = Math.abs(currentScrollTop - this.state.lastScrollTop);
        
        this.state.lastScrollTop = currentScrollTop;

        if (scrollDelta < 5) return;

        clearTimeout(this.state.scrollTimeout);

        this.state.scrollTimeout = setTimeout(() => {
            if (currentScrollTop > this.state.scrollThreshold && isScrollingDown && !this.state.isCollapsed) {
                this.collapseHeader();
            } else if (currentScrollTop < 50 && !isScrollingDown && this.state.isCollapsed) {
                this.expandHeader();
            }
        }, 50);
    },

    collapseHeader() {
        if (this.state.isCollapsed || this.state.isTransitioning || !this.coverWrapper) return;
        
        this.state.isTransitioning = true;
        this.state.isCollapsed = true;

        requestAnimationFrame(() => {
            this.coverWrapper.classList.add('is-collapsing');
            
            requestAnimationFrame(() => {
                this.coverWrapper.classList.add('collapsed');

                clearTimeout(this.state.transitionTimeout);
                this.state.transitionTimeout = setTimeout(() => {
                    this.coverWrapper.classList.remove('is-collapsing');
                    this.state.isTransitioning = false;
                }, 350);
            });
        });
    },

    expandHeader() {
        if (!this.state.isCollapsed || this.state.isTransitioning || !this.coverWrapper) return;
        
        this.state.isTransitioning = true;
        this.state.isCollapsed = false;

        requestAnimationFrame(() => {
            this.coverWrapper.classList.add('is-collapsing');
            
            requestAnimationFrame(() => {
                this.coverWrapper.classList.remove('collapsed');

                clearTimeout(this.state.transitionTimeout);
                this.state.transitionTimeout = setTimeout(() => {
                    this.coverWrapper.classList.remove('is-collapsing');
                    this.state.isTransitioning = false;
                }, 350);
            });
        });
    },

    updateMiniHeaderElements() {
        if (!this.coverWrapper) return;

        const titleElement = document.querySelector('.player .title');
        const artistElement = document.querySelector('.player .artist');

        let miniHeader = this.coverWrapper.querySelector('.miniHeader');
        if (!miniHeader) {
            miniHeader = document.createElement('div');
            miniHeader.className = 'miniHeader';
            this.coverWrapper.appendChild(miniHeader);
        }

        const title = titleElement ? titleElement.textContent : '';
        const artist = artistElement ? artistElement.textContent : '';

        miniHeader.innerHTML = `
            <div class="miniTitle">${this.escapeHTML(title)}</div>
            <div class="miniArtist">${this.escapeHTML(artist)}</div>
        `;

        let miniControls = this.coverWrapper.querySelector('.miniControls');
        if (!miniControls) {
            miniControls = document.createElement('div');
            miniControls.className = 'miniControls';
            this.coverWrapper.appendChild(miniControls);
        }

        const isPaused = !this.player || !this.player.classList.contains('isPlaying');
        const playIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-14 9V3z"/></svg>';
        const pauseIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';

        miniControls.innerHTML = `
            <button class="miniControlBtn" onclick="MusicPlayerEnhanced.togglePlayPause()">
                ${isPaused ? playIcon : pauseIcon}
            </button>
        `;
    },

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    togglePlayPause() {
        const primaryBtn = document.querySelector('.player .controlBtn.primary');
        if (primaryBtn) {
            primaryBtn.click();
            setTimeout(() => this.updateMiniHeaderElements(), 100);
        }
    },

    handleDragStart(e) {
        if (!this.coverWrapper || this.state.currentTab === 0 || this.state.isTransitioning) return;
        
        e.preventDefault();
        this.state.isDragging = true;
        this.state.dragStartY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        this.state.dragDistance = 0;
    },

    handleDragMove(e) {
        if (!this.state.isDragging || !this.coverWrapper) return;
        
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        this.state.dragDistance = currentY - this.state.dragStartY;
        
        if (this.state.isCollapsed && this.state.dragDistance < 0) {
            return;
        }
        
        if (!this.state.isCollapsed && this.state.dragDistance > 0) {
            return;
        }
    },

    handleDragEnd() {
        if (!this.state.isDragging || !this.coverWrapper) return;
        
        this.state.isDragging = false;
        
        const dragThreshold = 60;
        
        if (Math.abs(this.state.dragDistance) > dragThreshold) {
            if (this.state.dragDistance < 0 && !this.state.isCollapsed) {
                this.collapseHeader();
            } else if (this.state.dragDistance > 0 && this.state.isCollapsed) {
                this.expandHeader();
            }
        }
        
        this.state.dragDistance = 0;
    },

    addListItemInteractions() {
        const listItems = document.querySelectorAll('.list-item');
        
        listItems.forEach(item => {
            const artwork = item.querySelector('.item-artwork');
            if (!artwork) return;

            let wrapper = artwork.parentElement;
            if (!wrapper.classList.contains('item-artwork-wrapper')) {
                wrapper = document.createElement('div');
                wrapper.className = 'item-artwork-wrapper';
                artwork.parentNode.insertBefore(wrapper, artwork);
                wrapper.appendChild(artwork);
            }

            if (!wrapper.querySelector('.item-play-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'item-play-overlay';
                overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
                wrapper.appendChild(overlay);
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MusicPlayerEnhanced.init());
} else {
    MusicPlayerEnhanced.init();
}