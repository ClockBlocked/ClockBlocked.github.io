const MusicPlayerEnhanced = {
    state: {
        currentTab: 'nowPlaying',
        isCollapsed: false,
        scrollThreshold: 100,
        isDragging: false,
        dragStartY: 0,
        dragDistance: 0,
        lastScrollTop: 0
    },

    init() {
        this.cacheDOMElements();
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
        this.lists = document.querySelectorAll('.player .list');
    },

    bindEvents() {
        this.dotIndicators.forEach((dot, index) => {
            dot.addEventListener('click', () => this.switchTab(index));
        });

        this.lists.forEach(list => {
            list.addEventListener('scroll', () => this.handleListScroll(list));
        });

        if (this.dragHandle) {
            this.dragHandle.addEventListener('mousedown', (e) => this.handleDragStart(e));
            this.dragHandle.addEventListener('touchstart', (e) => this.handleDragStart(e));
        }

        if (this.coverWrapper) {
            this.coverWrapper.addEventListener('click', () => {
                if (this.state.isCollapsed && this.state.currentTab !== 0) {
                    this.expandHeader();
                }
            });
        }

        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('touchmove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', () => this.handleDragEnd());
        document.addEventListener('touchend', () => this.handleDragEnd());
    },

    setupObservers() {
        const resizeObserver = new ResizeObserver(() => {
            if (this.state.isCollapsed) {
                this.updateCollapsedState();
            }
        });
        
        if (this.coverWrapper) {
            resizeObserver.observe(this.coverWrapper);
        }
    },

    switchTab(index) {
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
            const activeList = this.panels[index].querySelector('.list');
            if (activeList && activeList.scrollTop > this.state.scrollThreshold) {
                this.collapseHeader();
            } else {
                this.expandHeader();
            }
        }
    },

    handleListScroll(list) {
        const currentScrollTop = list.scrollTop;
        const isScrollingDown = currentScrollTop > this.state.lastScrollTop;
        this.state.lastScrollTop = currentScrollTop;

        if (this.state.currentTab === 0) {
            return;
        }

        if (currentScrollTop > this.state.scrollThreshold && isScrollingDown) {
            if (!this.state.isCollapsed) {
                this.collapseHeader();
            }
        } else if (currentScrollTop < 50) {
            if (this.state.isCollapsed) {
                this.expandHeader();
            }
        }

        this.applyParallaxEffect(list);
    },

    applyParallaxEffect(list) {
        if (!this.coverWrapper || this.state.currentTab === 0) return;

        const scrollTop = list.scrollTop;
        const maxScroll = this.state.scrollThreshold;
        const scrollPercentage = Math.min(scrollTop / maxScroll, 1);
        
        const scale = 1 - (scrollPercentage * 0.7);
        const opacity = 1 - (scrollPercentage * 0.15);
        
        if (!this.state.isCollapsed && scrollPercentage < 1) {
            this.cover.style.transform = `scale(${scale})`;
            this.cover.style.opacity = opacity;
        }
    },

    collapseHeader() {
        if (this.state.isCollapsed || !this.coverWrapper) return;
        
        this.state.isCollapsed = true;
        this.coverWrapper.classList.add('collapsing');
        
        requestAnimationFrame(() => {
            this.coverWrapper.classList.add('collapsed');
            
            setTimeout(() => {
                this.coverWrapper.classList.remove('collapsing');
                this.updateMiniHeader();
            }, 400);
        });
    },

    expandHeader() {
        if (!this.state.isCollapsed || !this.coverWrapper) return;
        
        this.state.isCollapsed = false;
        this.coverWrapper.classList.add('collapsing');
        
        requestAnimationFrame(() => {
            this.coverWrapper.classList.remove('collapsed');
            this.cover.style.transform = '';
            this.cover.style.opacity = '';
            
            setTimeout(() => {
                this.coverWrapper.classList.remove('collapsing');
            }, 400);
        });
    },

    updateMiniHeader() {
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
            <div class="miniTitle">${title}</div>
            <div class="miniArtist">${artist}</div>
        `;

        let miniControls = this.coverWrapper.querySelector('.miniControls');
        if (!miniControls) {
            miniControls = document.createElement('div');
            miniControls.className = 'miniControls';
            this.coverWrapper.appendChild(miniControls);
        }

        const isPaused = !this.player.classList.contains('isPlaying');
        const playIcon = isPaused ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-14 9V3z"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';

        miniControls.innerHTML = `
            <button class="miniControlBtn" onclick="MusicPlayerEnhanced.togglePlayPause()">
                ${playIcon}
            </button>
        `;
    },

    togglePlayPause() {
        const primaryBtn = document.querySelector('.player .controlBtn.primary');
        if (primaryBtn) {
            primaryBtn.click();
        }
    },

    handleDragStart(e) {
        if (!this.coverWrapper || this.state.currentTab === 0) return;
        
        this.state.isDragging = true;
        this.state.dragStartY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        this.state.dragDistance = 0;
        
        this.coverWrapper.style.transition = 'none';
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
        
        const dragThreshold = 60;
        const progress = Math.min(Math.abs(this.state.dragDistance) / dragThreshold, 1);
        
        if (!this.state.isCollapsed) {
            const currentHeight = 40;
            const targetHeight = 100;
            const height = currentHeight - ((currentHeight - targetHeight) * progress);
            this.coverWrapper.style.height = `${height}vh`;
        }
    },

    handleDragEnd() {
        if (!this.state.isDragging || !this.coverWrapper) return;
        
        this.state.isDragging = false;
        this.coverWrapper.style.transition = '';
        
        const dragThreshold = 60;
        
        if (Math.abs(this.state.dragDistance) > dragThreshold) {
            if (this.state.dragDistance < 0 && !this.state.isCollapsed) {
                this.collapseHeader();
            } else if (this.state.dragDistance > 0 && this.state.isCollapsed) {
                this.expandHeader();
            }
        } else {
            this.coverWrapper.style.height = '';
        }
        
        this.state.dragDistance = 0;
    },

    updateCollapsedState() {
        if (this.state.isCollapsed) {
            this.updateMiniHeader();
        }
    },

    addListItemInteractions() {
        const listItems = document.querySelectorAll('.list-item');
        
        listItems.forEach(item => {
            const artwork = item.querySelector('.item-artwork');
            if (artwork && !artwork.querySelector('.item-play-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'item-play-overlay';
                overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
                artwork.parentElement.style.position = 'relative';
                artwork.parentElement.appendChild(overlay);
            }
        });
    }
};




document.addEventListener('DOMContentLoaded', () => {
    MusicPlayerEnhanced.init();
});

const originalPanelObserver = new MutationObserver(() => {
    MusicPlayerEnhanced.addListItemInteractions();
});

if (document.querySelector('.player .main')) {
    originalPanelObserver.observe(document.querySelector('.player .main'), {
        childList: true,
        subtree: true
    });
}