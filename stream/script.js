const videoCatalog = [
    { id: 'v1_landscape', url: 'media/vid1.mp4', poster: 'poster1.jpg', progress: 85, orientation: 'landscape' },
    { id: 'v2_portrait', url: 'media/vid2.mp4', poster: 'poster2.jpg', progress: 0, orientation: 'portrait' },
    { id: 'v3_landscape', url: 'media/vid3.mp4', poster: 'poster3.jpg', progress: 12, orientation: 'landscape' },
    { id: 'v4_portrait', url: 'media/vid4.mp4', poster: 'poster4.jpg', progress: 100, orientation: 'portrait' },
    { id: 'v5_landscape', url: 'media/vid5.mp4', poster: 'poster5.jpg', progress: 0, orientation: 'landscape' }
];

window.MUX_PREVIEW_URL = "";

function generateVideoCards() {
    return videoCatalog.map((video) => {
        const progressHtml = video.progress > 0
            ? '<div class="progress-bar-container"><div class="progress-bar" style="width: ' + video.progress + '%;"></div></div>'
            : '';

        return `
        <div class="video-card ${video.orientation}" data-playback-id="${video.id}" data-video-url="${video.url}">
            <div class="thumbnail-wrapper">
                <img src="${video.poster}" class="thumbnail-img" loading="lazy" alt="Thumbnail">
                ${progressHtml}
            </div>
            <div class="card-actions">
                <button class="action-btn queue-btn" type="button" aria-label="Queue video"><i class="fa-solid fa-plus"></i></button>
                <button class="action-btn menu-btn" type="button" aria-label="More options"><i class="fa-solid fa-ellipsis"></i></button>
            </div>
        </div>`;
    }).join('');
}

class DynamicSPFRouter {
    constructor() {
        this.cache = new Map();
        this.isRouting = false;
        this.loader = document.getElementById('spf-loader');
        this.mainContainer = document.getElementById('main-content');

        if (!this.loader || !this.mainContainer) {
            return;
        }

        window.addEventListener('popstate', (e) => this.restoreState(e));
        this.attachLinkInterceptors();
    }

    attachLinkInterceptors() {
        const links = document.querySelectorAll('a[data-spf]');
        if (!links.length) {
            return;
        }

        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-spf]');
            if (link) {
                e.preventDefault();
                const url = link.getAttribute('href');
                if (url && window.location.pathname !== url) {
                    this.executeNavigation(url);
                }
            }
        });
    }

    async executeNavigation(url, isHistoryPop = false) {
        if (this.isRouting || !this.loader || !this.mainContainer) return;
        this.isRouting = true;

        this.loader.classList.add('active');
        this.mainContainer.classList.add('navigating');

        try {
            const payload = await this.fetchFragments(url);

            if (!isHistoryPop) {
                history.pushState({ url }, payload.title, url);
            }
            document.title = payload.title;

            await this.injectFragments(payload.fragments);
            window.dispatchEvent(new CustomEvent('app:dom-updated'));
        } catch (error) {
            window.location.href = url;
        } finally {
            this.loader.classList.remove('active');
            this.mainContainer.classList.remove('navigating');
            this.isRouting = false;
        }
    }

    async fetchFragments(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        const response = await fetch(url, {
            headers: { 'X-SPF-Request': 'true' }
        });

        if (!response.ok) throw new Error('SPF Request Failed');
        const data = await response.json();
        this.cache.set(url, data);
        return data;
    }

    async injectFragments(fragments) {
        const mutations = Object.entries(fragments).map(async ([id, htmlString]) => {
            const targetElement = document.getElementById(id);
            if (targetElement) {
                targetElement.innerHTML = htmlString;
            }
        });
        await Promise.all(mutations);
    }

    restoreState(e) {
        if (e.state && e.state.url) {
            this.executeNavigation(e.state.url, true);
        }
    }
}

class MediaInteractionEngine {
    constructor() {
        this.hoverDelegationTimers = new WeakMap();
        this.activeMuxIntervals = new WeakMap();
        this.grid = document.getElementById('video-grid');

        if (!this.grid) {
            return;
        }

        this.initDelegation();
        window.addEventListener('app:dom-updated', () => this.initDelegation());
    }

    initDelegation() {
        const grid = document.getElementById('video-grid');
        if (!grid) return;

        grid.removeEventListener('mouseover', this.handleMouseOver);
        grid.removeEventListener('mouseout', this.handleMouseOut);

        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);

        grid.addEventListener('mouseover', this.handleMouseOver);
        grid.addEventListener('mouseout', this.handleMouseOut);
    }

    handleMouseOver(e) {
        const card = e.target.closest('.video-card');
        if (!card || this.hoverDelegationTimers.has(card)) return;

        const timer = setTimeout(() => {
            this.executeMuxPreviewSequence(card);
        }, 1250);

        this.hoverDelegationTimers.set(card, timer);
    }

    handleMouseOut(e) {
        const card = e.target.closest('.video-card');
        if (!card) return;

        const related = e.relatedTarget;
        if (card.contains(related)) return;

        clearTimeout(this.hoverDelegationTimers.get(card));
        this.hoverDelegationTimers.delete(card);
        this.terminateMuxPreviewSequence(card);
    }

    executeMuxPreviewSequence(card) {
        if (!window.MUX_PREVIEW_URL) return;

        const playbackId = card.dataset.playbackId;
        const imgNode = card.querySelector('.thumbnail-img');

        if (!card.dataset.originalPoster) {
            card.dataset.originalPoster = imgNode.src;
        }

        const timestamps = Array.from({ length: 8 }, () => Math.floor(Math.random() * 120));
        let sequenceIndex = 0;

        const cycleFrame = () => {
            if (sequenceIndex >= timestamps.length) sequenceIndex = 0;
            const targetTime = timestamps[sequenceIndex];
            const dynamicUrl = window.MUX_PREVIEW_URL
                .replace('{PLAYBACK_ID}', playbackId)
                .replace('{TIME}', targetTime);

            const bufferImg = new Image();
            bufferImg.src = dynamicUrl;
            bufferImg.onload = () => {
                imgNode.style.opacity = '0.7';
                setTimeout(() => {
                    imgNode.src = dynamicUrl;
                    imgNode.style.opacity = '1';
                }, 100);
            };
            sequenceIndex++;
        };

        cycleFrame();
        const intervalId = setInterval(cycleFrame, 800);
        this.activeMuxIntervals.set(card, intervalId);
    }

    terminateMuxPreviewSequence(card) {
        if (this.activeMuxIntervals.has(card)) {
            clearInterval(this.activeMuxIntervals.get(card));
            this.activeMuxIntervals.delete(card);
        }

        const imgNode = card.querySelector('.thumbnail-img');
        if (imgNode && card.dataset.originalPoster) {
            imgNode.style.opacity = '0';
            setTimeout(() => {
                imgNode.src = card.dataset.originalPoster;
                imgNode.style.opacity = '1';
            }, 150);
        }
    }
}

class OffCanvasPlayerContext {
    constructor() {
        this.ui = {
            wrapper: document.getElementById('offcanvas-player'),
            video: document.getElementById('primary-video'),
            btnClose: document.getElementById('btn-close'),
            btnPip: document.getElementById('btn-pip'),
            btnMini: document.getElementById('btn-mini'),
            dragHandle: document.querySelector('.player-drag-handle')
        };

        if (!this.ui.wrapper || !this.ui.video) {
            return;
        }

        this.attachGlobalListeners();
        this.attachControls();
    }

    attachGlobalListeners() {
        document.body.addEventListener('click', (e) => {
            const card = e.target.closest('.video-card');
            const actionBtn = e.target.closest('.action-btn');

            if (card && !actionBtn) {
                this.invokePlayer(card.dataset.videoUrl);
            }
        });
    }

    attachControls() {
        if (this.ui.btnClose) {
            this.ui.btnClose.addEventListener('click', () => this.dismissPlayer());
        }
        if (this.ui.btnPip) {
            this.ui.btnPip.addEventListener('click', () => this.togglePictureInPicture());
        }
        if (this.ui.btnMini) {
            this.ui.btnMini.addEventListener('click', () => this.toggleMiniWindow());
        }

        this.ui.video.addEventListener('leavepictureinpicture', () => {
            if (this.ui.wrapper.classList.contains('closed')) {
                this.ui.video.pause();
            }
        });
    }

    invokePlayer(streamUrl) {
        this.ui.video.src = streamUrl;
        this.ui.wrapper.classList.remove('closed');
        this.ui.wrapper.classList.add('open');
        this.ui.wrapper.classList.remove('mini');

        this.ui.video.play().catch((e) => console.error('Autoplay constrained:', e));
    }

    dismissPlayer() {
        this.ui.wrapper.classList.add('closed');
        this.ui.wrapper.classList.remove('open');
        this.ui.wrapper.classList.remove('mini');

        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else {
            this.ui.video.pause();
            setTimeout(() => {
                this.ui.video.src = '';
            }, 500);
        }
    }

    async togglePictureInPicture() {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            try {
                await this.ui.video.requestPictureInPicture();
            } catch (err) {
                console.error('PiP Initialization Failed:', err);
            }
        }
    }

    toggleMiniWindow() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        }
        this.ui.wrapper.classList.toggle('mini');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('video-grid');
    if (grid && !grid.dataset.initialized) {
        grid.innerHTML = generateVideoCards();
        grid.dataset.initialized = 'true';
    }

    if (document.getElementById('main-content') && document.getElementById('spf-loader')) {
        window.StreamApp = {
            Router: new DynamicSPFRouter(),
            Interaction: new MediaInteractionEngine(),
            Player: new OffCanvasPlayerContext()
        };
    } else {
        window.StreamApp = {
            Interaction: new MediaInteractionEngine(),
            Player: new OffCanvasPlayerContext()
        };
    }
});
