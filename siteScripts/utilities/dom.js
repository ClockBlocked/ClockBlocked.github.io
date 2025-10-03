// utilities/dom.js

// event delegation
export const on = (root, event, selector, handler, opts) => {
  root.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  }, opts);
};

// safe JSON for data-* attributes
export const toDataJSON = (obj) => JSON.stringify(obj).replaceAll('"', '&quot;');

// delay
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// keyboard helpers
export const isEnterOrSpace = (e) => e.key === 'Enter' || e.key === ' ' || e.code === 'Space';

// try/catch wrapper
export const safe = (fn, fallback = undefined) => {
  try { return fn(); } catch { return fallback; }
};