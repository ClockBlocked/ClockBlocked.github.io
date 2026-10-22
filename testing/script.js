/*!
 * modern-spf v1.0.0
 * Zero-dependency SPF-style navigation (streaming, prefetch, view transitions)
 * MIT License
 */
(function (global) {
  'use strict';

  const NAV      = typeof global.navigation !== 'undefined' && typeof global.navigation.addEventListener === 'function';
  const VT       = typeof document !== 'undefined' && 'startViewTransition' in document;
  const STREAMS  = typeof ReadableStream !== 'undefined' && typeof TextDecoder !== 'undefined';
  const IO       = typeof IntersectionObserver !== 'undefined';

  const DEFAULTS = {
    fragmentSelector: '[data-spf-fragment]',
    linkSelector:     'a[data-spf-link]',
    cache:            true,
    cacheLimit:       50,
    cacheStorage:     'sessionStorage',   // 'memory' | 'sessionStorage' | 'localStorage'
    prefetch:         true,
    prefetchMargin:   '200px',
    viewTransitions:  true,
    scrollRestoration:true,
    streaming:        true,
    timeout:          15000,
    headers:          {},
    requestParam:     'spf',              // adds ?spf=navigate to requests
    debug:            false
  };

  /* ---------------- helpers ---------------- */
  function emit(name, detail) {
    const ev = new CustomEvent('spf:' + name, { detail });
    document.dispatchEvent(ev);
  }
  function abs(href) { return new URL(href, location.href).href; }

  /* ---------------- NDJSON line parser ---------------- */
  function lineParser(onLine) {
    let buf = '';
    return function (chunk) {
      buf += chunk;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        try { onLine(JSON.parse(line)); } catch (_) { /* skip malformed */ }
      }
    };
  }

  /* ---------------- cache ---------------- */
  function createCache(opts) {
    const mem = new Map();
    const KEY = '__spf_cache_v1__';
    let storage = null;
    if (opts.cacheStorage === 'sessionStorage' && typeof sessionStorage !== 'undefined') storage = sessionStorage;
    if (opts.cacheStorage === 'localStorage'   && typeof localStorage   !== 'undefined') storage = localStorage;

    try {
      const raw = storage && storage.getItem(KEY);
      if (raw) JSON.parse(raw) && Object.entries(JSON.parse(raw)).forEach(([k, v]) => mem.set(k, v));
    } catch (_) {}

    function persist() {
      if (!storage) return;
      try {
        const obj = {};
        let n = 0;
        mem.forEach((v, k) => { if (n++ < opts.cacheLimit) obj[k] = v; });
        storage.setItem(KEY, JSON.stringify(obj));
      } catch (_) {}
    }

    return {
      get(url) {
        if (!mem.has(url)) return null;
        const v = mem.get(url);
        mem.delete(url); mem.set(url, v);           // LRU bump
        return v;
      },
      set(url, data) {
        mem.set(url, data);
        if (mem.size > opts.cacheLimit) mem.delete(mem.keys().next().value);
        persist();
      },
      has(url) { return mem.has(url); },
      clear()  { mem.clear(); if (storage) try { storage.removeItem(KEY); } catch (_) {} }
    };
  }

  /* ---------------- script re-execution ---------------- */
  function executeScripts(nodes) {
    return nodes.map(function (node) {
      if (node.nodeName === 'SCRIPT') {
        const s = document.createElement('script');
        for (const a of node.attributes) s.setAttribute(a.name, a.value);
        s.textContent = node.textContent;
        return s;
      }
      if (node.querySelectorAll) {
        node.querySelectorAll('script').forEach(function (old) {
          const s = document.createElement('script');
          for (const a of old.attributes) s.setAttribute(a.name, a.value);
          s.textContent = old.textContent;
          old.replaceWith(s);
        });
      }
      return node;
    });
  }

  /* ---------------- core factory ---------------- */
  function create(userOpts) {
    const opts = Object.assign({}, DEFAULTS, userOpts || {});
    const cache = createCache(opts);
    const scrollPositions = new Map();

    let currentUrl = location.href;
    let inflight = null;
    let started  = false;
    let teardown = [];

    /* ---- apply one fragment ---- */
    function applyFragment(id, html) {
      const existing = document.getElementById(id);
      if (!existing) { if (opts.debug) console.warn('[spf] missing fragment', id); return; }

      const tpl = document.createElement('template');
      tpl.innerHTML = html.trim();
      let nodes = Array.from(tpl.content.childNodes).filter(
        n => !(n.nodeType === 3 && !n.textContent.trim())
      );
      if (!nodes.length) return;

      nodes = executeScripts(nodes);
      existing.replaceWith(...nodes);
      emit('fragment', { id });
    }

    /* ---- fetch + parse ---- */
    async function fetchRoute(url, { signal, silent = false, dryRun = false } = {}) {
      if (opts.cache) {
        const cached = cache.get(url);
        if (cached) {
          if (!silent) emit('cache-hit', { url });
          return { ...cached, fromCache: true, streamed: false };
        }
      }
      if (!silent) emit('request', { url });

      const target = new URL(url, location.href);
      if (opts.requestParam) target.searchParams.set(opts.requestParam, 'navigate');

      const accept = [];
      if (opts.streaming && STREAMS) accept.push('application/x-ndjson');
      accept.push('text/html;q=0.9', 'application/json;q=0.8');

      const headers = Object.assign({ Accept: accept.join(', ') }, opts.headers);

      const timeoutCtrl = new AbortController();
      const timeoutId = setTimeout(() => timeoutCtrl.abort(), opts.timeout);
      const combined  = signal ? anySignal([signal, timeoutCtrl.signal]) : timeoutCtrl.signal;

      let res;
      try {
        res = await fetch(target.href, { headers, signal: combined, credentials: 'same-origin' });
      } finally {
        clearTimeout(timeoutId);
      }
      if (!res.ok) throw new Error('HTTP ' + res.status + ' @ ' + url);

      const ct = (res.headers.get('Content-Type') || '').toLowerCase();
      let data;

      if (opts.streaming && STREAMS && ct.includes('application/x-ndjson')) {
        data = await consumeNDJSON(res, { dryRun });
        data.streamed = true;
      } else if (ct.includes('application/json')) {
        data = normalizeJson(await res.json());
      } else {
        data = await consumeHTML(res);
      }

      if (opts.cache) cache.set(url, { fragments: data.fragments, title: data.title });
      return data;
    }

    function anySignal(signals) {
      const c = new AbortController();
      const onAbort = () => c.abort();
      signals.forEach(s => s.aborted ? c.abort() : s.addEventListener('abort', onAbort, { once: true }));
      return c.signal;
    }

    /* ---- NDJSON stream (progressive) ---- */
    async function consumeNDJSON(res, { dryRun }) {
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      const fragments = {};
      let title = null, done = false;

      const push = lineParser(line => {
        if (line.title) { title = line.title; document.title = line.title; }
        if (line.id && typeof line.html === 'string') {
          fragments[line.id] = line.html;
          if (!dryRun) applyFragment(line.id, line.html);
        }
        if (line.done) done = true;
      });

      while (!done) {
        const { value, done: rdone } = await reader.read();
        if (rdone) break;
        push(decoder.decode(value, { stream: true }));
      }
      push('\n');
      return { fragments, title };
    }

    /* ---- full HTML document → fragments ---- */
    async function consumeHTML(res) {
      const html = await res.text();
      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const fragments = {};
      doc.querySelectorAll(opts.fragmentSelector).forEach(el => {
        fragments[el.id] = el.outerHTML;
      });
      const t = doc.querySelector('title');
      return { fragments, title: t ? t.textContent : '' };
    }

    /* ---- JSON map (your original PHP contract) ---- */
    function normalizeJson(json) {
      const fragments = {};
      let title = '';
      if (json && typeof json === 'object') {
        Object.keys(json).forEach(k => {
          if (k === 'document-title' || k === 'title') title = json[k];
          else if (k === 'done' || k === 'url') return;
          else fragments[k] = json[k];
        });
      }
      return { fragments, title };
    }

    /* ---- apply everything (with optional view transition) ---- */
    async function applyAll(data) {
      const apply = () => {
        Object.keys(data.fragments).forEach(id => applyFragment(id, data.fragments[id]));
        if (data.title) document.title = data.title;
      };
      if (opts.viewTransitions && VT && !document.hidden) {
        try { await document.startViewTransition(apply).finished; }
        catch (_) { apply(); }
      } else {
        apply();
      }
      emit('swap', { fragments: Object.keys(data.fragments) });
    }

    /* ---- history helpers ---- */
    function rememberScroll() { scrollPositions.set(currentUrl, window.scrollY); }
    function restoreScroll(url) {
      if (!opts.scrollRestoration) return;
      const y = scrollPositions.get(url);
      window.scrollTo(0, y === undefined ? 0 : y);
    }

    /* ---- the main navigation loop ---- */
    async function doNavigate(url, { push = true, replace = false } = {}) {
      url = abs(url);
      if (url === currentUrl && !replace) return;

      if (inflight) inflight.abort();
      inflight = new AbortController();
      const signal = inflight.signal;

      const fromUrl = currentUrl;
      rememberScroll();
      document.documentElement.classList.add('spf-loading');
      emit('navigate', { from: fromUrl, to: url });

      try {
        const data = await fetchRoute(url, { signal });
        if (signal.aborted) return;

        emit('process', { url, data });
        if (!data.streamed) await applyAll(data);

        currentUrl = url;

        if (push || replace) {
          const state = Object.assign({}, history.state, {
            spf: true, url, scrollY: scrollPositions.get(url)
          });
          (replace ? history.replaceState : history.pushState).call(history, state, '', url);
        }
        restoreScroll(url);
        emit('done', { url, from: fromUrl });
      } catch (err) {
        if (err.name === 'AbortError') return;
        emit('error', { url, error: err });
        if (opts.debug) console.error('[spf]', err);
        location.assign(url);            // hard fallback
      } finally {
        document.documentElement.classList.remove('spf-loading');
        inflight = null;
      }
    }

    /* ---- prefetch (never touches DOM) ---- */
    function prefetch(url) {
      url = abs(url);
      if (url === currentUrl || cache.has(url)) return;
      fetchRoute(url, { silent: true, dryRun: true }).catch(() => {});
    }

    /* ---- click interception (fallback path) ---- */
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest(opts.linkSelector);
      if (!link) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;
      if (link.getAttribute('rel') === 'external') return;

      let u; try { u = new URL(link.href, location.href); } catch (_) { return; }
      if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search && u.hash) return;

      e.preventDefault();
      doNavigate(u.href, { push: true });
    }

    function onPopState(e) {
      if (!e.state || !e.state.spf) return;
      doNavigate(location.href, { push: false });
    }

    /* ---- Navigation API (primary path) ---- */
    function setupNavigationAPI() {
      if (!NAV) return false;
      const onNav = (e) => {
        if (!e.canIntercept || e.hashChange || e.downloadRequest !== null) return;
        let u; try { u = new URL(e.destination.url); } catch (_) { return; }
        if (u.origin !== location.origin) return;
        if (u.href === currentUrl) return;
        e.intercept({
          handler: () => doNavigate(u.href, { push: false }),
          focusReset: 'manual',
          scroll: 'manual'
        });
      };
      global.navigation.addEventListener('navigate', onNav);
      teardown.push(() => global.navigation.removeEventListener('navigate', onNav));
      return true;
    }

    /* ---- prefetch setup ---- */
    function setupPrefetch() {
      if (!opts.prefetch) return;
      const seen = new WeakSet();
      const tryIt = (link) => {
        if (seen.has(link)) return;
        seen.add(link);
        const d = link.getAttribute('data-spf-prefetch');
        if (d === 'false' || d === 'off') return;
        try {
          const u = new URL(link.href, location.href);
          if (u.origin === location.origin) prefetch(u.href);
        } catch (_) {}
      };
      const onOver = (e) => { const l = e.target.closest(opts.linkSelector); if (l) tryIt(l); };
      document.addEventListener('mouseover', onOver, { passive: true });
      document.addEventListener('focusin',  onOver);
      teardown.push(() => {
        document.removeEventListener('mouseover', onOver);
        document.removeEventListener('focusin',  onOver);
      });

      if (IO) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(en => { if (en.isIntersecting) { tryIt(en.target); io.unobserve(en.target); } });
        }, { rootMargin: opts.prefetchMargin });
        document.querySelectorAll(opts.linkSelector).forEach(a => io.observe(a));
        teardown.push(() => io.disconnect());
      }
    }

    /* ---- init ---- */
    function init() {
      if (started) return; started = true;

      if (opts.scrollRestoration && 'scrollRestoration' in history) history.scrollRestoration = 'manual';
      history.replaceState(
        Object.assign({}, history.state, { spf: true, url: location.href, scrollY: 0 }),
        '', location.href
      );

      const navUsed = setupNavigationAPI();
      if (!navUsed) {
        document.addEventListener('click', onClick);
        window.addEventListener('popstate', onPopState);
        teardown.push(() => {
          document.removeEventListener('click', onClick);
          window.removeEventListener('popstate', onPopState);
        });
      }
      setupPrefetch();
      emit('init', { url: location.href });
    }

    /* ---- public API ---- */
    return {
      init,
      navigate: (url, o) => doNavigate(url, o),
      prefetch,
      cache,
      options: opts,
      on:  (n, fn) => document.addEventListener('spf:' + n, fn),
      off: (n, fn) => document.removeEventListener('spf:' + n, fn),
      get currentUrl() { return currentUrl; },
      destroy() { teardown.forEach(fn => fn()); teardown = []; if (inflight) inflight.abort(); }
    };
  }

  /* ---------------- default instance convenience ---------------- */
  let def = null;
  const SPF = {
    version: '1.0.0',
    create,
    init(options) { if (def) def.destroy(); def = create(options); def.init(); return def; },
    get instance() { return def; },
    navigate(...a) { return def.navigate(...a); },
    prefetch(...a) { return def.prefetch(...a); },
    on(...a)  { return def.on(...a); },
    off(...a) { return def.off(...a); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SPF;
  if (!global.SPF) global.SPF = SPF;
})(typeof globalThis !== 'undefined' ? globalThis : window);
