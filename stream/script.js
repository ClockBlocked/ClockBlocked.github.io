(() => {
  'use strict';

  /* =========================================================
     Utilities
     ========================================================= */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover      = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);

  function formatTime(sec) {
    sec = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function debounce(fn, ms = 130) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  /* Deterministic RNG so hover previews are stable per-video */
  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* =========================================================
     Persistence layer
     ========================================================= */
  const LS = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota / private mode */ }
    }
  };

  /* =========================================================
     Mux helpers
     ========================================================= */
  const MUX_ASPECT = {
    landscape: [640, 360],
    portrait:  [540, 720],
    square:    [600, 600]
  };

  function muxThumb(playbackId, orientation = 'landscape', time = 3) {
    const [w, h] = MUX_ASPECT[orientation] || MUX_ASPECT.landscape;
    return `https://image.mux.com/${playbackId}/thumbnail.jpg` +
      `?width=${w}&height=${h}&fit_mode=smartcrop&time=${Math.max(0, time)}`;
  }

  /**
   * Build 8 evenly-distributed-but-jittered frame timestamps.
   * Deterministic per (playbackId + duration) so the preview is
   * stable across hover sessions.
   */
  function buildPreviewFrames(item) {
    const { playbackId, duration = 120, orientation = 'landscape' } = item;
    const rng = mulberry32(hashStr(playbackId + ':' + duration));
    const COUNT = 8;
    const start = 3;
    const end = Math.max(start + 8, duration - 4);
    const seg = (end - start) / COUNT;
    const frames = [];
    for (let i = 0; i < COUNT; i++) {
      const t = Math.floor(start + seg * i + rng() * seg * 0.85);
      frames.push(muxThumb(playbackId, orientation, t));
    }
    return frames;
  }

  /* =========================================================
     Store
     ========================================================= */
  const Store = {
    items: [],
    byId: new Map(),
    _promise: null,

    async load() {
      if (this.items.length) return this.items;
      if (this._promise) return this._promise;

      this._promise = fetch('library.json', { cache: 'no-cache' })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          this.items = Array.isArray(data) ? data : [];
          this.byId = new Map(this.items.map((v) => [v.id, v]));
          return this.items;
        })
        .finally(() => { this._promise = null; });

      return this._promise;
    },

    get(id) { return this.byId.get(id) || null; }
  };

  /* =========================================================
     Queue (persisted)
     ========================================================= */
  const Queue = {
    _set: new Set(LS.get('ls.queue', [])),
    has(id)   { return this._set.has(id); },
    add(id)   { this._set.add(id); this._save(); },
    remove(id){ this._set.delete(id); this._save(); },
    toggle(id) {
      this._set.has(id) ? this._set.delete(id) : this._set.add(id);
      this._save();
      return this._set.has(id);
    },
    all()  { return Array.from(this._set); },
    size() { return this._set.size; },
    _save() {
      LS.set('ls.queue', Array.from(this._set));
      updateQueueBadge();
    }
  };

  /* =========================================================
     Hidden (library-only visibility)
     ========================================================= */
  const Hidden = {
    _set: new Set(LS.get('ls.hidden', [])),
    has(id) { return this._set.has(id); },
    add(id) { this._set.add(id); LS.set('ls.hidden', Array.from(this._set)); },
    remove(id) { this._set.delete(id); LS.set('ls.hidden', Array.from(this._set)); }
  };

  /* =========================================================
     Watch progress (persisted)
     ========================================================= */
  const Progress = {
    _map: LS.get('ls.progress', {}),

    get(id) { return this._map[id] || 0; },

    ratio(id, duration) {
      const t = this.get(id);
      if (!t || !duration) return 0;
      return clamp(t / duration, 0, 1);
    },

    set(id, time, duration) {
      if (!id || !duration || !isFinite(duration)) return;
      if (!time || time < 1) return;
      this._map[id] = (time >= duration - 2) ? duration : time;
      LS.set('ls.progress', this._map);
    },

    clear(id) {
      delete this._map[id];
      LS.set('ls.progress', this._map);
    }
  };

  /* =========================================================
     Toast
     ========================================================= */
  function toast(message, icon = 'fa-circle-check') {
    const container = $('#toasts');
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<i class="fa-solid ${icon}"></i><span></span>`;
    el.querySelector('span').textContent = message;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('is-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 2400);
  }

  function updateQueueBadge() {
    const badge = $('#queue-badge');
    if (!badge) return;
    const n = Queue.size();
    badge.textContent = n > 99 ? '99+' : String(n);
    badge.hidden = n === 0;
  }

  /* =========================================================
     Preview engine  (hover → slideshow of video frames)
     ========================================================= */
  const Preview = {
    _timers: new WeakMap(),     // card → setTimeout id
    _session: null,             // { card, frameEl, frames, i, timer, alive }

    HOVER_DELAY: 1250,
    FRAME_INTERVAL: 700,

    init() {
      if (!canHover()) return;

      document.addEventListener('pointerover', (e) => {
        const card = e.target.closest?.('.card');
        if (!card) return;
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;
        this._onEnter(card);
      }, true);

      document.addEventListener('pointerout', (e) => {
        const card = e.target.closest?.('.card');
        if (!card) return;
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;
        this._onLeave(card);
      }, true);
    },

    _onEnter(card) {
      if (reducedMotion()) return;
      if (this._timers.has(card)) return;

      const id = setTimeout(() => {
        this._timers.delete(card);
        this._start(card);
      }, this.HOVER_DELAY);

      this._timers.set(card, id);
    },

    _onLeave(card) {
      const t = this._timers.get(card);
      if (t) { clearTimeout(t); this._timers.delete(card); }
      this._stop(card);
    },

    _start(card) {
      if (this._session && this._session.card === card) return;
      this._stopAll();

      const id = card.dataset.id;
      const item = Store.get(id);
      if (!item) return;

      const frameEl = card.querySelector('.thumb-frame');
      if (!frameEl) return;

      const frames = buildPreviewFrames(item);
      const session = { card, frameEl, frames, i: 0, timer: null, alive: true };
      this._session = session;

      /* Preload the first frame before fading in */
      const preload = new Image();
      preload.onload = () => {
        if (!session.alive) return;
        frameEl.src = frames[0];
        card.classList.add('is-previewing');
        session.i = 1;
        session.timer = setInterval(() => this._tick(session), this.FRAME_INTERVAL);
      };
      preload.onerror = () => { session.alive = false; };
      preload.src = frames[0];
    },

    _tick(session) {
      if (!session.alive) return;
      const { frames, frameEl } = session;
      const url = frames[session.i % frames.length];
      session.i++;

      const img = new Image();
      img.onload = () => {
        if (!session.alive) return;
        frameEl.src = url;
      };
      img.src = url;
    },

    _stop(card) {
      const session = this._session;
      if (!session || session.card !== card) return;
      this._stopAll();
    },

    _stopAll() {
      const session = this._session;
      if (!session) return;
      session.alive = false;
      clearInterval(session.timer);

      const { card, frameEl } = session;
      card.classList.remove('is-previewing');

      setTimeout(() => {
        if (!card.classList.contains('is-previewing')) {
          frameEl.removeAttribute('src');
        }
      }, 450);

      this._session = null;
    }
  };

  /* =========================================================
     Card factory
     ========================================================= */
  function createCard(item) {
    const el = document.createElement('article');
    el.className = 'card';
    el.dataset.id = item.id;
    el.dataset.openId = item.id;
    el.dataset.search = `${item.title} ${item.orientation || ''}`.toLowerCase();

    const ratio = Progress.ratio(item.id, item.duration);
    const inQueue = Queue.has(item.id);
    const orientation = item.orientation || 'landscape';
    const orientationLabel =
      orientation === 'portrait' ? 'Portrait' :
      orientation === 'square'   ? 'Square'   : 'Landscape';

    const status = ratio >= 1
      ? 'Watched'
      : ratio > 0
        ? `${Math.round(ratio * 100)}% watched`
        : 'Not started';

    el.innerHTML = `
      <div class="card-thumb" data-orientation="${orientation}">
        <img class="thumb-base" src="${muxThumb(item.playbackId, orientation, 3)}"
             alt="" loading="lazy" decoding="async">
        <img class="thumb-frame" alt="" aria-hidden="true">
        <div class="thumb-shade"></div>

        <div class="card-play" aria-hidden="true"><i class="fa-solid fa-play"></i></div>

        <div class="card-actions">
          <button class="icon-btn${inQueue ? ' is-active' : ''}" data-act="queue"
                  aria-label="${inQueue ? 'Remove from queue' : 'Add to queue'}"
                  aria-pressed="${inQueue}">
            <i class="fa-solid ${inQueue ? 'fa-check' : 'fa-plus'}"></i>
          </button>
          <button class="icon-btn" data-act="menu" aria-label="More options">
            <i class="fa-solid fa-ellipsis"></i>
          </button>
        </div>

        <span class="card-badge">${formatTime(item.duration)}</span>
        ${ratio > 0 ? `<div class="card-progress"><span style="width:${(ratio * 100).toFixed(2)}%"></span></div>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-sub">${orientationLabel} · ${status}</p>
      </div>
    `;

    return el;
  }

  /* Entrance observer */
  const CardObserver = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      }
    }
  }, { rootMargin: '120px 0px' });

  function observeCards(root) {
    $$('.card', root).forEach((c) => CardObserver.observe(c));
  }

  /* =========================================================
     Skeletons
     ========================================================= */
  function renderSkeletons(grid, count = 8) {
    const shapes = ['landscape', 'portrait', 'landscape', 'square',
                    'landscape', 'portrait', 'square', 'landscape'];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'sk-card';
      el.innerHTML = `
        <div class="sk-thumb" data-orientation="${shapes[i % shapes.length]}"></div>
        <div class="sk-line"></div>
        <div class="sk-line short"></div>
      `;
      frag.appendChild(el);
    }
    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  /* =========================================================
     Floating menu
     ========================================================= */
  const Menu = {
    el: null,

    open(anchor, item) {
      this.close();

      const el = document.createElement('div');
      el.className = 'menu';
      el.setAttribute('role', 'menu');

      const inQueue = Queue.has(item.id);
      el.innerHTML = `
        <button class="menu-item" data-m="queue" role="menuitem">
          <i class="fa-solid ${inQueue ? 'fa-check' : 'fa-plus'}"></i>
          <span>${inQueue ? 'Remove from queue' : 'Add to queue'}</span>
        </button>
        <button class="menu-item" data-m="copy" role="menuitem">
          <i class="fa-solid fa-link"></i><span>Copy link</span>
        </button>
        <button class="menu-item" data-m="stream" role="menuitem">
          <i class="fa-solid fa-code"></i><span>Copy stream URL</span>
        </button>
        <div class="menu-sep"></div>
        <button class="menu-item danger" data-m="hide" role="menuitem">
          <i class="fa-solid fa-eye-slash"></i><span>Hide from library</span>
        </button>
      `;

      document.body.appendChild(el);
      this.el = el;

      /* Position relative to the anchor, clamped to viewport */
      const a = anchor.getBoundingClientRect();
      const mw = el.offsetWidth;
      const mh = el.offsetHeight;
      const pad = 8;

      let left = a.right - mw;
      let top  = a.bottom + 6;

      if (left < pad) left = pad;
      if (left + mw > window.innerWidth - pad) left = window.innerWidth - mw - pad;
      if (top + mh > window.innerHeight - pad) top = a.top - mh - 6;
      if (top < pad) top = pad;

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;

      el.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-m]');
        if (!btn) return;
        this._act(btn.dataset.m, item, el);
      });

      setTimeout(() => {
        document.addEventListener('pointerdown', this._outside, true);
        document.addEventListener('keydown', this._key, true);
      }, 0);

      window.addEventListener('scroll', this._scroll, true);
    },

    _outside: null,
    _key: null,
    _scroll: null,

    _act(action, item, menuEl) {
      switch (action) {
        case 'queue': {
          const added = Queue.toggle(item.id);
          toast(added ? 'Added to queue' : 'Removed from queue',
                added ? 'fa-circle-check' : 'fa-circle-minus');
          syncCardQueueState(item.id);
          this.close();
          break;
        }
        case 'copy': {
          const url = `${location.origin}${location.pathname}#/watch/${item.id}`;
          copyText(url).then(() => toast('Link copied to clipboard', 'fa-link'));
          this.close();
          break;
        }
        case 'stream': {
          const url = `https://stream.mux.com/${item.playbackId}.m3u8`;
          copyText(url).then(() => toast('Stream URL copied', 'fa-code'));
          this.close();
          break;
        }
        case 'hide': {
          Hidden.add(item.id);
          const card = document.querySelector(`.card[data-id="${CSS.escape(item.id)}"]`);
          if (card) {
            card.style.transition = 'opacity .25s ease, transform .25s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(.96)';
            setTimeout(() => card.remove(), 260);
          }
          toast('Hidden from library', 'fa-eye-slash');
          this.close();
          break;
        }
      }
    },

    close() {
      if (!this.el) return;
      this.el.remove();
      this.el = null;
      document.removeEventListener('pointerdown', this._outside, true);
      document.removeEventListener('keydown', this._key, true);
      window.removeEventListener('scroll', this._scroll, true);
    },

    installHandlers() {
      this._outside = (e) => {
        if (this.el && !this.el.contains(e.target) &&
            !e.target.closest('[data-act="menu"]')) {
          this.close();
        }
      };
      this._key = (e) => { if (e.key === 'Escape') this.close(); };
      this._scroll = () => this.close();
    }
  };
  Menu.installHandlers();

  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* noop */ }
    ta.remove();
  }

  function syncCardQueueState(id) {
    $$(`.card[data-id="${CSS.escape(id)}"]`).forEach((card) => {
      const btn = card.querySelector('[data-act="queue"]');
      if (!btn) return;
      const inQueue = Queue.has(id);
      btn.classList.toggle('is-active', inQueue);
      btn.setAttribute('aria-pressed', String(inQueue));
      btn.setAttribute('aria-label', inQueue ? 'Remove from queue' : 'Add to queue');
      btn.innerHTML = `<i class="fa-solid ${inQueue ? 'fa-check' : 'fa-plus'}"></i>`;
    });
  }

  /* =========================================================
     Player
     ========================================================= */
  const Player = {
    root: null,
    video: null,
    titleEl: null,
    subEl: null,
    spinner: null,
    hls: null,
    currentId: null,
    currentItem: null,
    lastSavedAt: 0,

    init() {
      this.root    = $('#player');
      this.video   = $('#video');
      this.titleEl = $('#player-title');
      this.subEl   = $('#player-sub');
      this.spinner = $('#player-spinner');

      $('#btn-close').addEventListener('click', () => this.close());
      $('#btn-mini').addEventListener('click',  () => this.toggleMini());
      $('#btn-pip').addEventListener('click',   () => this.togglePip());

      this._bindMediaEvents();
      this._bindDrag();
      this._bindKeyboard();
    },

    /* ---------- Public API ---------- */
    async open(item) {
      if (!item) return;

      this.currentItem = item;
      this.currentId = item.id;

      this.titleEl.textContent = item.title;
      this.subEl.textContent = `${formatTime(item.duration)} · ${
        item.orientation === 'portrait' ? 'Portrait'
        : item.orientation === 'square' ? 'Square' : 'Landscape'
      }`;

      this._loadSource(item.playbackId);

      /* Reset any mini inline positioning */
      this.root.style.left = '';
      this.root.style.top = '';
      this.root.style.right = '';
      this.root.style.bottom = '';

      this.root.classList.add('is-open');
      this.root.classList.remove('is-mini');
      this.root.setAttribute('aria-hidden', 'false');
    },

    close() {
      if (!this.root.classList.contains('is-open')) return;

      this._saveProgress();
      this.video.pause();

      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }

      this.root.classList.remove('is-open', 'is-mini');
      this.root.setAttribute('aria-hidden', 'true');
      this.root.style.left = '';
      this.root.style.top = '';
      this.root.style.right = '';
      this.root.style.bottom = '';

      const id = this.currentId;
      setTimeout(() => {
        if (this.root.classList.contains('is-open')) return;
        this._destroySource();
        this.currentId = null;
        this.currentItem = null;
      }, 550);

      /* Leaving a /watch/:id deep link returns to the library */
      if (location.hash.startsWith('#/watch/')) {
        history.replaceState(null, '', location.pathname + location.search + '#/');
        Router.currentPath = '/';
        Router.updateNav('/');
      }

      /* Refresh card progress for the video we just watched */
      if (id) refreshCardProgress(id);
    },

    toggleMini() {
      if (this.root.classList.contains('is-mini')) {
        this.root.classList.remove('is-mini');
        this.root.style.left = '';
        this.root.style.top = '';
        this.root.style.right = '';
        this.root.style.bottom = '';
      } else {
        this.root.classList.add('is-mini');
      }
    },

    async togglePip() {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled && this.video.requestPictureInPicture) {
          await this.video.requestPictureInPicture();
        } else {
          toast('Picture-in-picture unavailable', 'fa-triangle-exclamation');
        }
      } catch {
        toast('Picture-in-picture unavailable', 'fa-triangle-exclamation');
      }
    },

    /* ---------- Source management ---------- */
    _loadSource(playbackId) {
      this._destroySource();

      const src = `https://stream.mux.com/${playbackId}.m3u8`;
      this.spinner.classList.add('is-on');

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          enableWorker: true,
          lowLatencyMode: false
        });
        this.hls = hls;
        hls.loadSource(src);
        hls.attachMedia(this.video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          this._resumeAndPlay();
        });

        hls.on(window.Hls.Events.ERROR, (_evt, data) => {
          if (!data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            toast('Playback error', 'fa-triangle-exclamation');
            this._destroySource();
          }
        });
      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.video.src = src;
        this.video.addEventListener('loadedmetadata', () => this._resumeAndPlay(), { once: true });
      } else {
        toast('HLS playback is not supported in this browser', 'fa-triangle-exclamation');
        this.spinner.classList.remove('is-on');
      }
    },

    _resumeAndPlay() {
      const id = this.currentId;
      const d = this.video.duration;

      if (id && isFinite(d) && d > 0) {
        const saved = Progress.get(id);
        if (saved > 3 && saved < d - 5) {
          try { this.video.currentTime = saved; } catch { /* noop */ }
        }
      }
      this.video.play().catch(() => { /* autoplay may be blocked */ });
    },

    _destroySource() {
      if (this.hls) {
        try { this.hls.destroy(); } catch { /* noop */ }
        this.hls = null;
      }
      if (this.video.getAttribute('src')) {
        this.video.removeAttribute('src');
        this.video.load();
      }
      this.spinner.classList.remove('is-on');
    },

    /* ---------- Media events ---------- */
    _bindMediaEvents() {
      const v = this.video;

      const showSpinner = () => this.spinner.classList.add('is-on');
      const hideSpinner = () => this.spinner.classList.remove('is-on');

      v.addEventListener('waiting', showSpinner);
      v.addEventListener('seeking', showSpinner);
      v.addEventListener('playing', hideSpinner);
      v.addEventListener('canplay', hideSpinner);

      v.addEventListener('timeupdate', () => {
        if (!this.currentId) return;
        const now = performance.now();
        if (now - this.lastSavedAt < 2000) return;
        this.lastSavedAt = now;
        this._saveProgress();
      });

      v.addEventListener('pause', () => this._saveProgress());
      v.addEventListener('ended', () => this._saveProgress());
      v.addEventListener('loadedmetadata', () => { this.lastSavedAt = 0; });
    },

    _saveProgress() {
      if (!this.currentId || !this.video) return;
      if (this.video.readyState < 1) return;
      Progress.set(this.currentId, this.video.currentTime, this.video.duration);
    },

    /* ---------- Drag (dismiss in full, move in mini) ---------- */
    _bindDrag() {
      const top = $('#player-top');
      const root = this.root;
      let drag = null;

      top.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        if (e.target.closest('button')) return;
        if (!root.classList.contains('is-open')) return;

        const rect = root.getBoundingClientRect();
        const mini = root.classList.contains('is-mini');

        drag = {
          mini,
          startX: e.clientX,
          startY: e.clientY,
          rect,
          moved: false
        };

        if (mini) {
          root.style.right = 'auto';
          root.style.bottom = 'auto';
          root.style.left = `${rect.left}px`;
          root.style.top  = `${rect.top}px`;
        }

        root.style.transition = 'none';
        top.setPointerCapture(e.pointerId);
      });

      top.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;

        if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        if (!drag.moved) return;

        if (drag.mini) {
          const w = drag.rect.width;
          const h = drag.rect.height;
          const left = clamp(drag.rect.left + dx, 8, window.innerWidth - w - 8);
          const top  = clamp(drag.rect.top  + dy, 8, window.innerHeight - h - 8);
          root.style.left = `${left}px`;
          root.style.top  = `${top}px`;
        } else {
          const offset = Math.max(0, dy);
          root.style.transform = `translateY(${offset}px)`;
          root.style.opacity = String(1 - Math.min(offset / 620, 0.6));
        }
      });

      const end = (e) => {
        if (!drag) return;
        const { mini, moved, startY } = drag;
        const dy = (e.clientY ?? startY) - startY;
        drag = null;

        root.style.transition = '';
        root.style.transform = '';
        root.style.opacity = '';

        if (!mini && moved && dy > 110) {
          this.close();
        }
      };

      top.addEventListener('pointerup', end);
      top.addEventListener('pointercancel', end);
    },

    /* ---------- Keyboard ---------- */
    _bindKeyboard() {
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (Menu.el) return; // menu handles its own Escape

        if (this.root.classList.contains('is-mini')) {
          this.root.classList.remove('is-mini');
          this.root.style.left = '';
          this.root.style.top = '';
          this.root.style.right = '';
          this.root.style.bottom = '';
        } else if (this.root.classList.contains('is-open')) {
          this.close();
        }
      });
    }
  };

  /* Refresh a visible card's progress bar after watching */
  function refreshCardProgress(id) {
    const item = Store.get(id);
    if (!item) return;

    $$(`.card[data-id="${CSS.escape(id)}"]`).forEach((card) => {
      const ratio = Progress.ratio(id, item.duration);
      const thumb = card.querySelector('.card-thumb');
      let bar = card.querySelector('.card-progress');

      if (ratio > 0) {
        if (!bar) {
          bar = document.createElement('div');
          bar.className = 'card-progress';
          bar.innerHTML = '<span></span>';
          thumb.appendChild(bar);
        }
        bar.firstElementChild.style.width = `${(ratio * 100).toFixed(2)}%`;
      } else if (bar) {
        bar.remove();
      }

      const sub = card.querySelector('.card-sub');
      if (sub) {
        const label = item.orientation === 'portrait' ? 'Portrait'
                    : item.orientation === 'square' ? 'Square' : 'Landscape';
        const status = ratio >= 1 ? 'Watched'
                     : ratio > 0 ? `${Math.round(ratio * 100)}% watched`
                     : 'Not started';
        sub.textContent = `${label} · ${status}`;
      }
    });
  }

  /* =========================================================
     Views
     ========================================================= */
  const Views = {

    /* ---------------- Library ---------------- */
    async library(container) {
      container.innerHTML = `
        <header class="page-head">
          <div>
            <h1 class="page-title">Library</h1>
            <p class="page-sub" id="lib-sub">Loading…</p>
          </div>
          <label class="search">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input id="lib-search" type="search" placeholder="Search your library…"
                   autocomplete="off" spellcheck="false" aria-label="Search library">
            <button type="button" class="search-clear" id="lib-clear" hidden aria-label="Clear search">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </label>
        </header>

        <div class="masonry" id="grid"></div>

        <div class="empty" id="lib-empty" hidden>
          <i class="fa-solid fa-film"></i>
          <h3 id="lib-empty-title">No videos found</h3>
          <p id="lib-empty-text">Try a different search term.</p>
        </div>
      `;

      const grid = container.querySelector('#grid');
      renderSkeletons(grid, 8);

      let items;
      try {
        items = await Store.load();
      } catch (err) {
        container.innerHTML = `
          <div class="empty">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <h3>Couldn't load your library</h3>
            <p>${escapeHtml(err.message || 'Unknown error')}</p>
            <button class="btn" onclick="location.reload()">
              <i class="fa-solid fa-rotate-right"></i> Retry
            </button>
          </div>
        `;
        return;
      }

      /* Filter out anything the user has hidden */
      const visible = items.filter((v) => !Hidden.has(v.id));
      const totalTime = visible.reduce((sum, v) => sum + (v.duration || 0), 0);

      container.querySelector('#lib-sub').textContent =
        `${visible.length} video${visible.length === 1 ? '' : 's'} · ${formatTime(totalTime)} total`;

      grid.innerHTML = '';
      const frag = document.createDocumentFragment();
      visible.forEach((item) => frag.appendChild(createCard(item)));
      grid.appendChild(frag);
      observeCards(grid);

      /* Search */
      const input  = container.querySelector('#lib-search');
      const clear  = container.querySelector('#lib-clear');
      const empty  = container.querySelector('#lib-empty');
      const emptyT = container.querySelector('#lib-empty-title');
      const emptyX = container.querySelector('#lib-empty-text');

      const applyFilter = debounce(() => {
        const q = input.value.trim().toLowerCase();
        let matches = 0;

        grid.querySelectorAll('.card').forEach((card) => {
          const hit = !q || card.dataset.search.includes(q);
          card.hidden = !hit;
          if (hit) matches++;
        });

        clear.hidden = !q;
        empty.hidden = matches !== 0;

        if (q && matches === 0) {
          emptyT.textContent = 'No matches';
          emptyX.textContent = `Nothing in your library matches “${input.value.trim()}”.`;
        }
      }, 120);

      input.addEventListener('input', applyFilter);
      clear.addEventListener('click', () => {
        input.value = '';
        applyFilter();
        input.focus();
      });
    },

    /* ---------------- Explore ---------------- */
    async explore(container) {
      const items = await Store.load();
      if (!items.length) {
        container.innerHTML = `
          <div class="empty">
            <i class="fa-solid fa-compass"></i>
            <h3>Nothing to explore yet</h3>
            <p>Add videos to your library to see them here.</p>
          </div>
        `;
        return;
      }

      const featured = items[0];
      const inProgress = items.filter((v) => {
        const r = Progress.ratio(v.id, v.duration);
        return r > 0 && r < 1;
      });
      const rest = items.slice(1);

      container.innerHTML = `
        <header class="page-head">
          <div>
            <h1 class="page-title">Explore</h1>
            <p class="page-sub">Discover what's in your library</p>
          </div>
        </header>

        <section class="hero" data-open-id="${featured.id}" role="button" tabindex="0"
                 aria-label="Play ${escapeHtml(featured.title)}">
          <img src="${muxThumb(featured.playbackId, 'landscape', 6)}" alt="" loading="eager" decoding="async">
          <div class="hero-shade"></div>
          <div class="hero-info">
            <span class="hero-tag">Featured</span>
            <h2 class="hero-title">${escapeHtml(featured.title)}</h2>
            <p class="hero-sub">${formatTime(featured.duration)} · ${
              featured.orientation === 'portrait' ? 'Portrait'
              : featured.orientation === 'square' ? 'Square' : 'Landscape'
            }</p>
            <span class="btn"><i class="fa-solid fa-play"></i> Play now</span>
          </div>
        </section>

        ${inProgress.length ? `
          <h2 class="section-title">Continue watching</h2>
          <div class="row" id="explore-row"></div>
        ` : ''}

        <h2 class="section-title">All videos</h2>
        <div class="masonry" id="explore-grid"></div>
      `;

      if (inProgress.length) {
        const row = container.querySelector('#explore-row');
        inProgress.forEach((item) => row.appendChild(createCard(item)));
        observeCards(row);
      }

      const grid = container.querySelector('#explore-grid');
      const frag = document.createDocumentFragment();
      rest.forEach((item) => frag.appendChild(createCard(item)));
      grid.appendChild(frag);
      observeCards(grid);
    },

    /* ---------------- Queue ---------------- */
    async queue(container) {
      const items = await Store.load();
      const ids = Queue.all();
      const queued = ids.map((id) => items.find((v) => v.id === id)).filter(Boolean);

      container.innerHTML = `
        <header class="page-head">
          <div>
            <h1 class="page-title">Queue</h1>
            <p class="page-sub" id="queue-sub">${
              queued.length
                ? `${queued.length} video${queued.length === 1 ? '' : 's'} · ${formatTime(queued.reduce((s, v) => s + (v.duration || 0), 0))} total`
                : 'Nothing queued'
            }</p>
          </div>
          ${queued.length ? `
            <button class="btn" id="queue-clear" style="background:var(--surface-2);color:var(--text-strong)">
              <i class="fa-solid fa-broom"></i> Clear queue
            </button>
          ` : ''}
        </header>

        <div class="qlist" id="queue-list"></div>

        ${!queued.length ? `
          <div class="empty">
            <i class="fa-solid fa-list-ul"></i>
            <h3>Your queue is empty</h3>
            <p>Tap the <i class="fa-solid fa-plus" style="font-size:12px"></i> button on any video to save it for later.</p>
            <a class="btn" href="#/"><i class="fa-solid fa-house"></i> Browse library</a>
          </div>
        ` : ''}
      `;

      const list = container.querySelector('#queue-list');
      queued.forEach((item, i) => {
        const row = document.createElement('div');
        row.className = 'qrow';
        row.dataset.id = item.id;
        row.dataset.openId = item.id;
        row.setAttribute('role', 'button');
        row.tabIndex = 0;

        row.innerHTML = `
          <span class="qindex">${i + 1}</span>
          <div class="qthumb">
            <img src="${muxThumb(item.playbackId, item.orientation || 'landscape', 3)}"
                 alt="" loading="lazy" decoding="async">
          </div>
          <div class="qinfo">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${formatTime(item.duration)} · ${
              item.orientation === 'portrait' ? 'Portrait'
              : item.orientation === 'square' ? 'Square' : 'Landscape'
            }</p>
          </div>
          <div class="qactions">
            <button class="icon-btn" data-act="queue-remove" aria-label="Remove from queue">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `;
        list.appendChild(row);
      });

      const clearBtn = container.querySelector('#queue-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          Queue.all().forEach((id) => Queue.remove(id));
          toast('Queue cleared', 'fa-broom');
          Router.navigate('/queue', { force: true });
        });
      }
    }
  };

  /* =========================================================
     Router
     ========================================================= */
  const Router = {
    currentPath: '/',
    _scrollPositions: new Map(),
    _busy: false,

    routes: [
      { test: (p) => p === '/',              name: 'library' },
      { test: (p) => p === '/explore',       name: 'explore' },
      { test: (p) => p === '/queue',         name: 'queue'   },
      { test: (p) => /^\/watch\/([\w-]+)$/.test(p),
        name: 'watch',
        params: (p) => ({ id: /^\/watch\/([\w-]+)$/.exec(p)[1] }) }
    ],

    init() {
      window.addEventListener('hashchange', () => this.handle());
      window.addEventListener('load', () => {
        if (!location.hash) {
          history.replaceState(null, '', location.pathname + location.search + '#/');
        }
        this.handle();
      });
    },

    resolve(path) {
      for (const route of this.routes) {
        if (route.test(path)) {
          return {
            name: route.name,
            params: route.params ? route.params(path) : {}
          };
        }
      }
      return { name: 'library', params: {} };
    },

    async handle() {
      const path = location.hash.slice(1) || '/';
      await this.navigate(path);
    },

    async navigate(path, { force = false } = {}) {
      if (this._busy) return;
      if (!force && path === this.currentPath) return;

      this._busy = true;

      const app  = $('#app');
      const view = $('#view');
      const loader = $('#route-loader');

      /* Remember scroll position of the outgoing view */
      if (this.currentPath) {
        this._scrollPositions.set(this.currentPath, app.scrollTop);
      }

      this.currentPath = path;
      this.updateNav(path);

      loader.classList.add('is-loading');
      view.classList.add('is-loading');

      await sleep(reducedMotion() ? 0 : 150);

      const route = this.resolve(path);

      try {
        switch (route.name) {
          case 'explore':
            await Views.explore(view);
            break;
          case 'queue':
            await Views.queue(view);
            break;
          case 'watch': {
            await Views.library(view);
            const item = Store.get(route.params.id);
            if (item) Player.open(item);
            break;
          }
          case 'library':
          default:
            await Views.library(view);
        }
      } catch (err) {
        view.innerHTML = `
          <div class="empty">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <h3>Something went wrong</h3>
            <p>${escapeHtml(err.message || 'Unknown error')}</p>
          </div>
        `;
      }

      /* Restore scroll */
      const saved = this._scrollPositions.get(path) ?? 0;
      app.scrollTop = saved;

      await nextFrame();
      view.classList.remove('is-loading');
      loader.classList.remove('is-loading');

      this._busy = false;
    },

    updateNav(path) {
      const normalized =
        path === '/explore' ? '/explore'
        : path === '/queue' ? '/queue'
        : '/';

      $$('.nav-item').forEach((a) => {
        a.classList.toggle('is-active', a.dataset.nav === normalized);
      });
    }
  };

  /* =========================================================
     Global click delegation
     ========================================================= */
  function bindGlobalClicks() {
    document.addEventListener('click', (e) => {
      /* 1. Explicit action buttons */
      const actBtn = e.target.closest('[data-act]');
      if (actBtn) {
        const act = actBtn.dataset.act;
        const holder = actBtn.closest('[data-id]');
        const id = holder?.dataset.id;
        const item = id ? Store.get(id) : null;

        if (act === 'queue' && item) {
          e.preventDefault();
          e.stopPropagation();
          const added = Queue.toggle(item.id);
          toast(added ? 'Added to queue' : 'Removed from queue',
                added ? 'fa-circle-check' : 'fa-circle-minus');
          syncCardQueueState(item.id);
          return;
        }

        if (act === 'menu' && item) {
          e.preventDefault();
          e.stopPropagation();
          Menu.open(actBtn, item);
          return;
        }

        if (act === 'queue-remove' && item) {
          e.preventDefault();
          e.stopPropagation();
          Queue.remove(item.id);
          toast('Removed from queue', 'fa-circle-minus');
          Router.navigate('/queue', { force: true });
          return;
        }
      }

      /* 2. Anything with data-open-id opens the player */
      const opener = e.target.closest('[data-open-id]');
      if (opener) {
        /* Don't open if the user clicked the menu button */
        if (e.target.closest('[data-act="menu"]')) return;

        const item = Store.get(opener.dataset.openId);
        if (!item) return;

        e.preventDefault();
        Player.open(item);
      }
    });

    /* Keyboard activation of role=button cards */
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const opener = e.target.closest('[data-open-id][role="button"]');
      if (!opener) return;
      e.preventDefault();
      const item = Store.get(opener.dataset.openId);
      if (item) Player.open(item);
    });
  }

  /* =========================================================
     Boot
     ========================================================= */
  function boot() {
    Player.init();
    Preview.init();
    bindGlobalClicks();
    updateQueueBadge();
    Router.init();

    /* Warm the data cache so the first route resolves instantly */
    Store.load().catch(() => { /* handled per-view */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();