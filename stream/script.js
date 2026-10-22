class GithubPagesRouter {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.loader = document.getElementById('route-loader');
        this.routes = {
            '/': this.renderLibrary.bind(this),
            '/explore': this.renderExplore.bind(this),
            '/queue': this.renderQueue.bind(this)
        };
        
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => {
            if (!window.location.hash) window.location.hash = '#/';
            this.handleRoute();
        });
    }

    async handleRoute() {
        const path = window.location.hash.slice(1) || '/';
        const handler = this.routes[path] || this.routes['/'];
        
        this.loader.classList.add('route-loading');
        this.loader.style.transform = 'scaleX(1)';
        this.mainContent.style.opacity = '0.4';
        this.mainContent.style.transform = 'scale(0.98)';
        
        await new Promise(r => setTimeout(r, 150));
        await handler();
        
        this.mainContent.style.opacity = '1';
        this.mainContent.style.transform = 'scale(1)';
        this.loader.classList.remove('route-loading');
        this.loader.style.transform = 'scaleX(0)';
        
        window.HSStaticMethods.autoInit();
    }

    async renderLibrary() {
        const template = document.getElementById('library-view-template').content.cloneNode(true);
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(template);
        
        try {
            const response = await fetch('library.json');
            const data = await response.json();
            const grid = document.getElementById('video-grid');
            const cardTemplate = document.getElementById('video-card-template');
            
            data.forEach((item, index) => {
                const clone = cardTemplate.content.cloneNode(true);
                const card = clone.querySelector('.video-card');
                const wrapper = clone.querySelector('.thumbnail-wrapper');
                const img = clone.querySelector('.thumbnail-img');
                const title = clone.querySelector('.video-title');
                const progress = clone.querySelector('.progress-bar');
                const progressContainer = clone.querySelector('.progress-container');
                
                card.dataset.playbackId = item.playbackId;
                card.dataset.duration = item.duration;
                card.style.animationDelay = `${index * 50}ms`;
                card.classList.add('fade-in');
                
                wrapper.dataset.orientation = item.orientation;
                img.src = `https://image.mux.com/${item.playbackId}/thumbnail.png?width=640&height=${item.orientation === 'portrait' ? 960 : 360}&time=5`;
                
                title.textContent = item.title;
                
                if (item.progress > 0) {
                    progress.style.width = `${item.progress}%`;
                } else {
                    progressContainer.style.display = 'none';
                }
                
                grid.appendChild(clone);
            });
            
            window.AppInteraction.attachDelegation(grid);
        } catch (e) {
            this.mainContent.innerHTML = `<div class="text-center text-ghText mt-20"><i class="fa-solid fa-triangle-exclamation text-4xl mb-4"></i><p>Failed to load library.</p></div>`;
        }
    }

    async renderExplore() {
        this.mainContent.innerHTML = `<div class="text-center text-ghText mt-20 fade-in"><i class="fa-solid fa-compass text-4xl mb-4"></i><h2 class="text-2xl font-bold text-white">Explore</h2><p>Discover new content.</p></div>`;
    }

    async renderQueue() {
        this.mainContent.innerHTML = `<div class="text-center text-ghText mt-20 fade-in"><i class="fa-solid fa-list-ul text-4xl mb-4"></i><h2 class="text-2xl font-bold text-white">Your Queue</h2><p>Items saved for later.</p></div>`;
    }
}

class MuxPreviewEngine {
    constructor() {
        this.hoverTimers = new WeakMap();
        this.intervalTimers = new WeakMap();
        this.handleOver = this.handleOver.bind(this);
        this.handleOut = this.handleOut.bind(this);
    }

    attachDelegation(container) {
        container.removeEventListener('mouseover', this.handleOver);
        container.removeEventListener('mouseout', this.handleOut);
        container.addEventListener('mouseover', this.handleOver);
        container.addEventListener('mouseout', this.handleOut);
    }

    handleOver(e) {
        const card = e.target.closest('.video-card');
        const actionBtn = e.target.closest('.action-btn');
        const dropdownMenu = e.target.closest('.hs-dropdown-menu');
        if (!card || actionBtn || dropdownMenu || this.hoverTimers.has(card)) return;

        const timer = setTimeout(() => this.beginPreview(card), 1250);
        this.hoverTimers.set(card, timer);
    }

    handleOut(e) {
        const card = e.target.closest('.video-card');
        if (!card) return;
        if (card.contains(e.relatedTarget)) return;

        clearTimeout(this.hoverTimers.get(card));
        this.hoverTimers.delete(card);
        this.endPreview(card);
    }

    beginPreview(card) {
        const playbackId = card.dataset.playbackId;
        const duration = parseInt(card.dataset.duration, 10) || 120;
        const img = card.querySelector('.thumbnail-img');
        const orientation = card.querySelector('.thumbnail-wrapper').dataset.orientation;
        
        if (!card.dataset.originalSrc) {
            card.dataset.originalSrc = img.src;
        }

        let currentTime = 10;
        const increment = Math.max(5, Math.floor(duration / 20));
        const width = 640;
        const height = orientation === 'portrait' ? 960 : 360;

        const cycle = () => {
            const nextUrl = `https://image.mux.com/${playbackId}/thumbnail.png?width=${width}&height=${height}&time=${currentTime}`;
            
            const preloader = new Image();
            preloader.src = nextUrl;
            preloader.onload = () => {
                if (!this.intervalTimers.has(card)) return; 
                img.style.opacity = '0.8';
                setTimeout(() => {
                    img.src = nextUrl;
                    img.style.opacity = '1';
                }, 50);
            };

            currentTime += increment;
            if (currentTime >= duration - 5) currentTime = 10;
        };

        cycle();
        const intervalId = setInterval(cycle, 400);
        this.intervalTimers.set(card, intervalId);
    }

    endPreview(card) {
        if (this.intervalTimers.has(card)) {
            clearInterval(this.intervalTimers.get(card));
            this.intervalTimers.delete(card);
        }
        const img = card.querySelector('.thumbnail-img');
        if (img && card.dataset.originalSrc) {
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = card.dataset.originalSrc;
                img.style.opacity = '1';
            }, 150);
        }
    }
}

class HlsPlayerEngine {
    constructor() {
        this.wrapper = document.getElementById('offcanvas-player');
        this.video = document.getElementById('primary-video');
        this.hls = null;
        
        document.getElementById('btn-close').addEventListener('click', () => this.close());
        document.getElementById('btn-pip').addEventListener('click', () => this.togglePip());
        document.getElementById('btn-mini').addEventListener('click', () => this.toggleMini());
        
        document.body.addEventListener('click', (e) => {
            const card = e.target.closest('.video-card');
            const actionBtn = e.target.closest('.action-btn');
            const dropdownMenu = e.target.closest('.hs-dropdown-menu');
            
            if (card && !actionBtn && !dropdownMenu) {
                const loader = card.querySelector('.loading-overlay');
                loader.style.opacity = '1';
                
                setTimeout(() => {
                    loader.style.opacity = '0';
                    this.loadAndPlay(card.dataset.playbackId);
                }, 400);
            }
        });

        this.video.addEventListener('leavepictureinpicture', () => {
            if (this.wrapper.style.transform === 'translateY(100%)' || this.wrapper.classList.contains('closed')) {
                this.video.pause();
            }
        });
    }

    loadAndPlay(playbackId) {
        const src = `https://stream.mux.com/${playbackId}.m3u8`;
        
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        if (Hls.isSupported()) {
            this.hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 600
            });
            this.hls.loadSource(src);
            this.hls.attachMedia(this.video);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.video.play().catch(() => {});
            });
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            this.video.src = src;
            this.video.addEventListener('loadedmetadata', () => {
                this.video.play().catch(() => {});
            });
        }

        this.wrapper.style.transform = 'translateY(0)';
        this.wrapper.classList.remove('mini');
    }

    close() {
        this.wrapper.style.transform = 'translateY(100%)';
        this.wrapper.classList.remove('mini');
        
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else {
            this.video.pause();
            setTimeout(() => {
                if (this.hls) {
                    this.hls.destroy();
                    this.hls = null;
                }
                this.video.removeAttribute('src');
                this.video.load();
            }, 500);
        }
    }

    async togglePip() {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            await this.video.requestPictureInPicture();
        }
    }

    toggleMini() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        }
        this.wrapper.classList.toggle('mini');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.AppInteraction = new MuxPreviewEngine();
    window.AppRouter = new GithubPagesRouter();
    window.AppPlayer = new HlsPlayerEngine();
});
