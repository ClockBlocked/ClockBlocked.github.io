(() => {
  'use strict';

  const THUMB_EXT = 'jpg';

  const DIMS = {
    landscape: { w: 640, h: 360 },
    portrait:  { w: 480, h: 640 },
    square:    { w: 560, h: 560 }
  };

  const PREVIEW_HOVER_DELAY = 1000;   // ms before the slideshow starts
  const PREVIEW_INTERVAL    = 300;    // ms between frames
  const PREVIEW_START       = 3;      // first timestamp sampled
  const PREVIEW_STEP        = 4;      // seconds added each frame
  const PREVIEW_END_PAD     = 4;      // seconds trimmed from the end

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const nextFrame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover      = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

  const ESC_MAP = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ESC_MAP[c]);

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${m}:${String(s).padStart(2,'0')}`;
  }

  function debounce(fn, ms = 130) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  const LS = {
    get(k, fb) { try { const r = localStorage.getItem(k); return r == null ? fb : JSON.parse(r); } catch { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  function muxThumbUrl(playbackId, orientation = 'landscape', time = 3) {
    const { w, h } = DIMS[orientation] || DIMS.landscape;
    return `https://image.mux.com/${playbackId}/thumbnail.${THUMB_EXT}` +
           `?width=${w}&height=${h}&time=${Math.max(0, time)}`;
  }

  function muxStreamUrl(playbackId) {
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }

  const Store = {
    items: [],
    byId: new Map(),
    _p: null,
    async load() {
      if (this.items.length) return this.items;
      if (this._p) return this._p;
      this._p = fetch('library.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(d => {
          this.items = Array.isArray(d) ? d : [];
          this.byId = new Map(this.items.map(v => [v.id, v]));
          return this.items;
        })
        .finally(() => { this._p = null; });
      return this._p;
    },
    get(id) { return this.byId.get(id) || null; }
  };

  const Queue = {
    _s: new Set(LS.get('ls.queue', [])),
    has(id)    { return this._s.has(id); },
    add(id)    { this._s.add(id); this._save(); },
    remove(id) { this._s.delete(id); this._save(); },
    toggle(id) {
      this._s.has(id) ? this._s.delete(id) : this._s.add(id);
      this._save();
      return this._s.has(id);
    },
    all() { return Array.from(this._s); },
    size() { return this._s.size; },
    _save() { LS.set('ls.queue', Array.from(this._s)); updateQueueBadge(); }
  };

  const Hidden = {
    _s: new Set(LS.get('ls.hidden', [])),
    has(id) { return this._s.has(id); },
    add(id) { this._s.add(id); LS.set('ls.hidden', Array.from(this._s)); }
  };

  const Progress = {
    _m: LS.get('ls.progress', {}),
    get(id) { return this._m[id] || 0; },
    ratio(id, dur) {
      const t = this.get(id);
      if (!t || !dur) return 0;
      return clamp(t / dur, 0, 1);
    },
    set(id, time, dur) {
      if (!id || !dur || !isFinite(dur)) return;
      if (!time || time < 1) return;
      this._m[id] = time >= dur - 2 ? dur : time;
      LS.set('ls.progress', this._m);
    }
  };

  function toast(msg, icon = 'fa-circle-check') {
    const wrap = $('#toasts');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<i class="fa-solid ${icon}"></i><span></span>`;
    el.querySelector('span').textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 2400);
  }

  function updateQueueBadge() {
    const b = $('#queue-badge');
    if (!b) return;
    const n = Queue.size();
    b.textContent = n > 99 ? '99+' : String(n);
    b.hidden = n === 0;
  }


const Preview = {
  _hoverTimers:   new WeakMap(),  // desktop: card → timeout id
  _session:       null,           // active slideshow
  _suppressClick: new WeakMap(),  // mobile: card → timestamp
  _mobileTimer:   null,
  _mobileCard:    null,
  _mobileX:       0,
  _mobileY:       0,

  init() {
    const isTouchOnly = !canHover();

    /* -------- Desktop hover (skipped on pure-touch) -------- */
    if (!isTouchOnly) {
      document.addEventListener('pointerover', (e) => {
        if (e.pointerType === 'touch') return;   // hybrid devices
        const card = e.target.closest?.('.card');
        if (!card) return;
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;
        this._enter(card);
      }, true);

      document.addEventListener('pointerout', (e) => {
        if (e.pointerType === 'touch') return;
        const card = e.target.closest?.('.card');
        if (!card) return;
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;
        this._leave(card);
      }, true);
    }

    /* -------- Mobile press-and-hold (works everywhere) -------- */
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      const card = e.target.closest?.('.card');
      if (!card) return;
      if (e.target.closest('[data-act]')) return;   // let buttons behave normally
      this._startHold(card, e.clientX, e.clientY);
    }, { passive: true, capture: true });

    document.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'touch' || !this._mobileTimer) return;
      const dx = e.clientX - this._mobileX;
      const dy = e.clientY - this._mobileY;
      // > 12 px of movement before the hold fires = user is scrolling
      if (Math.abs(dx) + Math.abs(dy) > 12) this._cancelHold();
    }, { passive: true, capture: true });

    document.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'touch') return;
      this._endHold();
    }, { capture: true });

    document.addEventListener('pointercancel', (e) => {
      if (e.pointerType !== 'touch') return;
      this._cancelHold();
    }, { capture: true });

    /* Kill OS long-press menus so the hold gesture gets a clean run */
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest?.('.card')) e.preventDefault();
    });
  },

  /* ---------- Desktop path ---------- */
  _enter(card) {
    if (this._hoverTimers.has(card)) return;
    const t = setTimeout(() => {
      this._hoverTimers.delete(card);
      this._start(card);
    }, PREVIEW_HOVER_DELAY);
    this._hoverTimers.set(card, t);
  },

  _leave(card) {
    const t = this._hoverTimers.get(card);
    if (t) { clearTimeout(t); this._hoverTimers.delete(card); }
    if (this._session && this._session.card === card) this._stop();
  },

  /* ---------- Mobile path ---------- */
  _startHold(card, x, y) {
    this._cancelHold();
    this._mobileCard = card;
    this._mobileX = x;
    this._mobileY = y;
    this._mobileTimer = setTimeout(() => {
      this._mobileTimer = null;
      this._start(card);
    }, 400);
  },

  _endHold() {
    const card = this._mobileCard;
    if (!card) return;
    clearTimeout(this._mobileTimer);
    this._mobileTimer = null;
    this._mobileCard  = null;

    // Preview was actually running → suppress the click that's about to fire
    if (this._session && this._session.card === card) {
      this._suppressClick.set(card, Date.now());
      this._stop();
    }
  },

  _cancelHold() {
    clearTimeout(this._mobileTimer);
    this._mobileTimer = null;
    this._mobileCard  = null;
    if (this._session) this._stop();
  },

  /* ---------- Called by the global click handler ---------- */
  wasJustPreviewed(card) {
    const ts = this._suppressClick.get(card);
    if (!ts) return false;
    this._suppressClick.delete(card);
    return Date.now() - ts < 400;   // fresh enough to belong to this lift
  },

  /* ---------- Shared slideshow engine ---------- */
  _start(card) {
    if (reducedMotion()) return;
    if (this._session && this._session.card === card) return;
    this._stop();

    const item = Store.get(card.dataset.id);
    if (!item) return;

    const frameEl = card.querySelector('.thumb-frame');
    if (!frameEl) return;

    const orientation = item.orientation || 'landscape';
    const duration    = item.duration || 120;
    const maxTime     = Math.max(PREVIEW_START + PREVIEW_STEP, duration - PREVIEW_END_PAD);

    const session = {
      card, frameEl,
      playbackId:  item.playbackId,
      orientation,
      current:     PREVIEW_START,
      maxTime,
      timer:       null,
      alive:       true
    };
    this._session = session;

    const tick = () => {
      if (!session.alive) return;
      const url = muxThumbUrl(session.playbackId, session.orientation, session.current);

      // Preload before swap — no flicker, no half-decoded frames
      const pre = new Image();
      pre.onload = () => {
        if (!session.alive) return;
        frameEl.src = url;
        card.classList.add('is-previewing');
      };
      pre.src = url;

      // Strictly increasing timestamp, loop on end
      session.current += PREVIEW_STEP;
      if (session.current >= session.maxTime) session.current = PREVIEW_START;
    };

    tick();
    session.timer = setInterval(tick, PREVIEW_INTERVAL);
  },

  _stop() {
    const s = this._session;
    if (!s) return;
    s.alive = false;
    clearInterval(s.timer);
    s.card.classList.remove('is-previewing');
    setTimeout(() => {
      if (!s.card.classList.contains('is-previewing')) {
        s.frameEl.removeAttribute('src');
      }
    }, 450);
    this._session = null;
  }
};



  function createCard(item) {
    const el = document.createElement('article');
    el.className = 'card';
    el.dataset.id = item.id;
    el.dataset.openId = item.id;
    el.dataset.search = `${item.title} ${item.orientation || ''}`.toLowerCase();

    const orientation = item.orientation || 'landscape';
    const ratio = Progress.ratio(item.id, item.duration);
    const inQueue = Queue.has(item.id);

    const orientationLabel =
      orientation === 'portrait' ? 'Portrait' :
      orientation === 'square'   ? 'Square'   : 'Landscape';

    const statusLabel =
      ratio >= 1 ? 'Watched' :
      ratio > 0  ? `${Math.round(ratio * 100)}% watched` :
      'Not started';

    let statusPill = '';
    if (ratio >= 1) {
      statusPill = `<span class="card-status watched"><i class="fa-solid fa-check" style="font-size:9px"></i> Watched</span>`;
    } else if (ratio > 0) {
      statusPill = `<span class="card-status progress"><i class="fa-solid fa-play" style="font-size:8px"></i> Continue</span>`;
    } else {
      statusPill = `<span class="card-status new">New</span>`;
    }

    el.innerHTML = `
      <div class="card-thumb" data-orientation="${orientation}">
        <img class="thumb-base" src="${muxThumbUrl(item.playbackId, orientation, 3)}"
             alt="" loading="lazy" decoding="async">
        <img class="thumb-frame" alt="" aria-hidden="true">
        <div class="thumb-shade"></div>

        <div class="card-play" aria-hidden="true"><i class="fa-solid fa-play"></i></div>

        ${statusPill}

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

        <span class="card-badge">${fmtTime(item.duration)}</span>
        ${ratio > 0 ? `<div class="card-progress"><span style="width:${(ratio*100).toFixed(2)}%"></span></div>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(item.title)}</h3>
        <p class="card-sub">${orientationLabel} · ${statusLabel}</p>
      </div>
    `;

    return el;
  }

  const CardObserver = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      }
    }
  }, { rootMargin: '120px 0px' });

  function observeCards(root) {
    $$('.card', root).forEach(c => CardObserver.observe(c));
  }

  function renderSkeletons(grid, n = 8) {
    const shapes = ['landscape','portrait','landscape','square','landscape','portrait','square','landscape'];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
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

      const a = anchor.getBoundingClientRect();
      const mw = el.offsetWidth;
      const mh = el.offsetHeight;
      const pad = 8;

      let left = a.right - mw;
      let top  = a.bottom + 6;
      if (left < pad) left = pad;
      if (left + mw > innerWidth - pad) left = innerWidth - mw - pad;
      if (top + mh > innerHeight - pad) top = a.top - mh - 6;
      if (top < pad) top = pad;

      el.style.left = `${left}px`;
      el.style.top  = `${top}px`;

      el.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-m]');
        if (btn) this._act(btn.dataset.m, item);
      });

      setTimeout(() => {
        document.addEventListener('pointerdown', this._outside, true);
        document.addEventListener('keydown', this._key, true);
      }, 0);
      addEventListener('scroll', this._scroll, true);
    },

    _outside: null,
    _key: null,
    _scroll: null,

    _act(action, item) {
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
          copyText(url).then(() => toast('Link copied', 'fa-link'));
          this.close();
          break;
        }
        case 'stream': {
          copyText(muxStreamUrl(item.playbackId))
            .then(() => toast('Stream URL copied', 'fa-code'));
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
      removeEventListener('scroll', this._scroll, true);
    },

    install() {
      this._outside = (e) => {
        if (this.el && !this.el.contains(e.target) &&
            !e.target.closest('[data-act="menu"]')) this.close();
      };
      this._key = (e) => { if (e.key === 'Escape') this.close(); };
      this._scroll = () => this.close();
    }
  };
  Menu.install();

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
    try { document.execCommand('copy'); } catch {}
    ta.remove();
  }

  function syncCardQueueState(id) {
    $$(`.card[data-id="${CSS.escape(id)}"]`).forEach(card => {
      const btn = card.querySelector('[data-act="queue"]');
      if (!btn) return;
      const inQ = Queue.has(id);
      btn.classList.toggle('is-active', inQ);
      btn.setAttribute('aria-pressed', String(inQ));
      btn.setAttribute('aria-label', inQ ? 'Remove from queue' : 'Add to queue');
      btn.innerHTML = `<i class="fa-solid ${inQ ? 'fa-check' : 'fa-plus'}"></i>`;
    });
  }

  const Player = {
    root: null, video: null, titleEl: null, subEl: null, spinner: null,
    hls: null, currentId: null, _lastSaveAt: 0,

    init() {
      this.root    = $('#player');
      this.video   = $('#video');
      this.titleEl = $('#player-title');
      this.subEl   = $('#player-sub');
      this.spinner = $('#player-spinner');

      $('#btn-close').addEventListener('click', () => this.close());
      $('#btn-mini').addEventListener('click',  () => this.toggleMini());
      $('#btn-pip').addEventListener('click',   () => this.togglePip());

      this._bindMedia();
      this._bindDrag();
      this._bindKeys();
    },

    async open(item) {
      if (!item) return;
      this.currentId = item.id;

      this.titleEl.textContent = item.title;
      this.subEl.textContent = `${fmtTime(item.duration)} · ${
        item.orientation === 'portrait' ? 'Portrait'
        : item.orientation === 'square' ? 'Square' : 'Landscape'
      }`;

      this._loadSource(item.playbackId);

      this.root.style.left = '';
      this.root.style.top  = '';
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
      if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});

      this.root.classList.remove('is-open', 'is-mini');
      this.root.setAttribute('aria-hidden', 'true');
      this.root.style.left = '';
      this.root.style.top  = '';
      this.root.style.right = '';
      this.root.style.bottom = '';

      const id = this.currentId;
      setTimeout(() => {
        if (this.root.classList.contains('is-open')) return;
        this._destroySource();
        this.currentId = null;
      }, 550);

      if (location.hash.startsWith('#/watch/')) {
        history.replaceState(null, '', location.pathname + location.search + '#/');
        Router.currentPath = '/';
        Router.updateNav('/');
      }
      if (id) refreshCardProgress(id);
    },

    toggleMini() {
      if (this.root.classList.contains('is-mini')) {
        this.root.classList.remove('is-mini');
        this.root.style.left = '';
        this.root.style.top  = '';
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

    _loadSource(playbackId) {
      this._destroySource();
      const src = muxStreamUrl(playbackId);
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
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => this._resumeAndPlay());
        hls.on(window.Hls.Events.ERROR, (_e, d) => {
          if (!d.fatal) return;
          if (d.type === window.Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (d.type === window.Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else { toast('Playback error', 'fa-triangle-exclamation'); this._destroySource(); }
        });
      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.video.src = src;
        this.video.addEventListener('loadedmetadata', () => this._resumeAndPlay(), { once: true });
      } else {
        toast('HLS playback not supported', 'fa-triangle-exclamation');
        this.spinner.classList.remove('is-on');
      }
    },

    _resumeAndPlay() {
      const id = this.currentId;
      const d = this.video.duration;
      if (id && isFinite(d) && d > 0) {
        const saved = Progress.get(id);
        if (saved > 3 && saved < d - 5) {
          try { this.video.currentTime = saved; } catch {}
        }
      }
      this.video.play().catch(() => {});
    },

    _destroySource() {
      if (this.hls) { try { this.hls.destroy(); } catch {} this.hls = null; }
      if (this.video.getAttribute('src')) {
        this.video.removeAttribute('src');
        this.video.load();
      }
      this.spinner.classList.remove('is-on');
    },

    _bindMedia() {
      const v = this.video;
      v.addEventListener('waiting', () => this.spinner.classList.add('is-on'));
      v.addEventListener('seeking', () => this.spinner.classList.add('is-on'));
      v.addEventListener('playing', () => this.spinner.classList.remove('is-on'));
      v.addEventListener('canplay', () => this.spinner.classList.remove('is-on'));
      v.addEventListener('timeupdate', () => {
        if (!this.currentId) return;
        const now = performance.now();
        if (now - this._lastSaveAt < 2000) return;
        this._lastSaveAt = now;
        this._saveProgress();
      });
      v.addEventListener('pause',  () => this._saveProgress());
      v.addEventListener('ended',  () => this._saveProgress());
      v.addEventListener('loadedmetadata', () => { this._lastSaveAt = 0; });
    },

    _saveProgress() {
      if (!this.currentId || !this.video || this.video.readyState < 1) return;
      Progress.set(this.currentId, this.video.currentTime, this.video.duration);
    },

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
        drag = { mini, x: e.clientX, y: e.clientY, rect, moved: false };

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
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        if (!drag.moved) return;

        if (drag.mini) {
          const w = drag.rect.width, h = drag.rect.height;
          root.style.left = `${clamp(drag.rect.left + dx, 8, innerWidth - w - 8)}px`;
          root.style.top  = `${clamp(drag.rect.top  + dy, 8, innerHeight - h - 8)}px`;
        } else {
          const offset = Math.max(0, dy);
          root.style.transform = `translateY(${offset}px)`;
          root.style.opacity = String(1 - Math.min(offset / 620, 0.6));
        }
      });

      const end = (e) => {
        if (!drag) return;
        const { mini, moved } = drag;
        const dy = (e.clientY ?? drag.y) - drag.y;
        drag = null;
        root.style.transition = '';
        root.style.transform = '';
        root.style.opacity = '';
        if (!mini && moved && dy > 110) this.close();
      };
      top.addEventListener('pointerup', end);
      top.addEventListener('pointercancel', end);
    },

    _bindKeys() {
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || Menu.el) return;
        if (this.root.classList.contains('is-mini')) {
          this.root.classList.remove('is-mini');
          this.root.style.left = this.root.style.top = this.root.style.right = this.root.style.bottom = '';
        } else if (this.root.classList.contains('is-open')) {
          this.close();
        }
      });
    }
  };

  function refreshCardProgress(id) {
    const item = Store.get(id);
    if (!item) return;
    $$(`.card[data-id="${CSS.escape(id)}"]`).forEach(card => {
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
      } else if (bar) bar.remove();

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

  const Views = {

    async library(container) {
      container.innerHTML = `
        <header class="flex items-end justify-between gap-6 flex-wrap mb-8">
          <div>
            <h1 class="page-title">Library</h1>
            <p class="page-sub mt-1.5" id="lib-sub">Loading…</p>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <label class="search">
              <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              <input id="lib-search" type="search" placeholder="Search your library…"
                     autocomplete="off" spellcheck="false" aria-label="Search library">
              <button type="button" class="search-clear" id="lib-clear" hidden aria-label="Clear search">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </label>
          </div>
        </header>

        <div id="lib-continue" hidden>
          <h2 class="section-title">Continue watching</h2>
          <div class="row" id="lib-continue-row"></div>
        </div>

        <div class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4" id="grid"></div>

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
            <p>${esc(err.message || 'Unknown error')}</p>
            <button class="btn" onclick="location.reload()">
              <i class="fa-solid fa-rotate-right"></i> Retry
            </button>
          </div>
        `;
        return;
      }

      const visible = items.filter(v => !Hidden.has(v.id));
      const totalTime = visible.reduce((s, v) => s + (v.duration || 0), 0);

      container.querySelector('#lib-sub').textContent =
        `${visible.length} video${visible.length === 1 ? '' : 's'} · ${fmtTime(totalTime)} total`;

      /* Continue watching */
      const inProgress = visible.filter(v => {
        const r = Progress.ratio(v.id, v.duration);
        return r > 0 && r < 1;
      });
      if (inProgress.length) {
        const wrap = container.querySelector('#lib-continue');
        const row = container.querySelector('#lib-continue-row');
        wrap.hidden = false;
        inProgress.forEach(v => row.appendChild(createCard(v)));
        observeCards(row);
      }

      grid.innerHTML = '';
      const frag = document.createDocumentFragment();
      visible.forEach(v => frag.appendChild(createCard(v)));
      grid.appendChild(frag);
      observeCards(grid);

      /* Search */
      const input  = container.querySelector('#lib-search');
      const clear  = container.querySelector('#lib-clear');
      const empty  = container.querySelector('#lib-empty');
      const emptyT = container.querySelector('#lib-empty-title');
      const emptyX = container.querySelector('#lib-empty-text');

      const apply = debounce(() => {
        const q = input.value.trim().toLowerCase();
        let matches = 0;
        grid.querySelectorAll('.card').forEach(card => {
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

      input.addEventListener('input', apply);
      clear.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
    },

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
      const rest = items.slice(1);
      const inProgress = items.filter(v => {
        const r = Progress.ratio(v.id, v.duration);
        return r > 0 && r < 1;
      });

      container.innerHTML = `
        <header class="mb-8">
          <h1 class="page-title">Explore</h1>
          <p class="page-sub mt-1.5">Discover what's in your library</p>
        </header>

        <section class="hero" data-open-id="${featured.id}" role="button" tabindex="0"
                 aria-label="Play ${esc(featured.title)}">
          <img src="${muxThumbUrl(featured.playbackId, 'landscape', 6)}" alt=""
               loading="eager" decoding="async">
          <div class="hero-shade"></div>
          <div class="hero-info">
            <span class="hero-tag"><i class="fa-solid fa-star" style="font-size:10px"></i> Featured</span>
            <h2 class="hero-title">${esc(featured.title)}</h2>
            <p class="hero-sub">${fmtTime(featured.duration)} · ${
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
        <div class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4" id="explore-grid"></div>
      `;

      if (inProgress.length) {
        const row = container.querySelector('#explore-row');
        inProgress.forEach(v => row.appendChild(createCard(v)));
        observeCards(row);
      }

      const grid = container.querySelector('#explore-grid');
      const frag = document.createDocumentFragment();
      rest.forEach(v => frag.appendChild(createCard(v)));
      grid.appendChild(frag);
      observeCards(grid);
    },

    async queue(container) {
      const items = await Store.load();
      const queued = Queue.all().map(id => items.find(v => v.id === id)).filter(Boolean);
      const totalTime = queued.reduce((s, v) => s + (v.duration || 0), 0);

      container.innerHTML = `
        <header class="flex items-end justify-between gap-6 flex-wrap mb-8">
          <div>
            <h1 class="page-title">Queue</h1>
            <p class="page-sub mt-1.5">${
              queued.length
                ? `${queued.length} video${queued.length === 1 ? '' : 's'} · ${fmtTime(totalTime)} total`
                : 'Nothing queued'
            }</p>
          </div>
          ${queued.length ? `
            <button class="btn secondary" id="queue-clear">
              <i class="fa-solid fa-broom"></i> Clear queue
            </button>
          ` : ''}
        </header>

        <div class="qlist" id="queue-list"></div>

        ${!queued.length ? `
          <div class="empty">
            <i class="fa-solid fa-list-ul"></i>
            <h3>Your queue is empty</h3>
            <p>Tap the <i class="fa-solid fa-plus" style="font-size:11px;color:#539bf5"></i>
               button on any video to save it for later.</p>
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
            <img src="${muxThumbUrl(item.playbackId, item.orientation || 'landscape', 3)}"
                 alt="" loading="lazy" decoding="async">
          </div>
          <div class="qinfo">
            <h3>${esc(item.title)}</h3>
            <p>${fmtTime(item.duration)} · ${
              item.orientation === 'portrait' ? 'Portrait'
              : item.orientation === 'square' ? 'Square' : 'Landscape'
            }</p>
          </div>
          <div class="flex gap-1.5 shrink-0">
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
          Queue.all().forEach(id => Queue.remove(id));
          toast('Queue cleared', 'fa-broom');
          Router.navigate('/queue', { force: true });
        });
      }
    }
  };

  const Router = {
    currentPath: '/',
    _positions: new Map(),
    _busy: false,

    routes: [
      { test: p => p === '/',        name: 'library' },
      { test: p => p === '/explore', name: 'explore' },
      { test: p => p === '/queue',   name: 'queue'   },
      { test: p => /^\/watch\/([\w-]+)$/.test(p),
        name: 'watch',
        params: p => ({ id: /^\/watch\/([\w-]+)$/.exec(p)[1] }) }
    ],

    init() {
      addEventListener('hashchange', () => this.handle());
      addEventListener('load', () => {
        if (!location.hash) {
          history.replaceState(null, '', location.pathname + location.search + '#/');
        }
        this.handle();
      });
    },

    resolve(path) {
      for (const r of this.routes) {
        if (r.test(path)) return { name: r.name, params: r.params ? r.params(path) : {} };
      }
      return { name: 'library', params: {} };
    },

    async handle() { await this.navigate(location.hash.slice(1) || '/'); },

    async navigate(path, { force = false } = {}) {
      if (this._busy) return;
      if (!force && path === this.currentPath) return;
      this._busy = true;

      const app = $('#app'), view = $('#view'), loader = $('#route-loader');
      if (this.currentPath) this._positions.set(this.currentPath, app.scrollTop);

      this.currentPath = path;
      this.updateNav(path);
      loader.classList.add('is-loading');
      view.classList.add('is-loading');

      await sleep(reducedMotion() ? 0 : 130);

      const route = this.resolve(path);
      try {
        if (route.name === 'explore')      await Views.explore(view);
        else if (route.name === 'queue')   await Views.queue(view);
        else if (route.name === 'watch') {
          await Views.library(view);
          const item = Store.get(route.params.id);
          if (item) Player.open(item);
        } else await Views.library(view);
      } catch (err) {
        view.innerHTML = `
          <div class="empty">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <h3>Something went wrong</h3>
            <p>${esc(err.message || 'Unknown error')}</p>
          </div>
        `;
      }

      app.scrollTop = this._positions.get(path) ?? 0;
      await nextFrame();
      view.classList.remove('is-loading');
      loader.classList.remove('is-loading');

      /* Preline re-init for dynamically added components */
      if (window.HSStaticMethods?.autoInit) {
        try { window.HSStaticMethods.autoInit(); } catch {}
      }

      this._busy = false;
    },

    updateNav(path) {
      const norm = path === '/explore' ? '/explore' : path === '/queue' ? '/queue' : '/';
      $$('.nav-btn').forEach(a => a.classList.toggle('is-active', a.dataset.nav === norm));
    }
  };

  function bindClicks() {
    document.addEventListener('click', (e) => {
      const actBtn = e.target.closest('[data-act]');
      if (actBtn) {
        const act = actBtn.dataset.act;
        const id = actBtn.closest('[data-id]')?.dataset.id;
        const item = id ? Store.get(id) : null;

        if (act === 'queue' && item) {
          e.preventDefault(); e.stopPropagation();
          const added = Queue.toggle(item.id);
          toast(added ? 'Added to queue' : 'Removed from queue',
                added ? 'fa-circle-check' : 'fa-circle-minus');
          syncCardQueueState(item.id);
          return;
        }
        if (act === 'menu' && item) {
          e.preventDefault(); e.stopPropagation();
          Menu.open(actBtn, item);
          return;
        }
        if (act === 'queue-remove' && item) {
          e.preventDefault(); e.stopPropagation();
          Queue.remove(item.id);
          toast('Removed from queue', 'fa-circle-minus');
          Router.navigate('/queue', { force: true });
          return;
        }
      }


      const opener = e.target.closest('[data-open-id]');
      if (opener) {
        if (e.target.closest('[data-act="menu"]')) return;

        // If the user just held this card to preview it, eat the click
        // that the OS synthesized on lift-off.
        if (Preview.wasJustPreviewed(opener)) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        const item = Store.get(opener.dataset.openId);
        if (!item) return;
        e.preventDefault();
        Player.open(item);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const opener = e.target.closest('[data-open-id][role="button"]');
      if (!opener) return;
      e.preventDefault();
      const item = Store.get(opener.dataset.openId);
      if (item) Player.open(item);
    });
  }


  function boot() {
    Player.init();
    Preview.init();
    bindClicks();
    updateQueueBadge();
    Router.init();
    Store.load().catch(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();