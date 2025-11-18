(() => {
  if (window.__musicProgressDebug) {
    console.warn('musicProgressDebug already active');
    return;
  }

  const getEl = (id) => document.getElementById(id);
  const bar = getEl('music-player-progress-bar');
  const fill = getEl('music-player-progress-fill');
  const thumb = getEl('music-player-progress-thumb');
  const current = getEl('music-player-current-time');
  const total = getEl('music-player-total-time');

  if (!bar || !fill || !thumb) {
    console.warn('Progress elements missing.');
    return;
  }

  const format = (t) => {
    if (!Number.isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  const state = () => {
    const rect = bar.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const fillRect = fill.getBoundingClientRect();
    const percent = parseFloat(bar.getAttribute('aria-valuenow') || '0');
    return {
      percent: `${percent.toFixed(2)}%`,
      barWidth: `${rect.width.toFixed(2)}px`,
      fillWidth: `${fillRect.width.toFixed(2)}px`,
      thumbLeft: `${thumbRect.left - rect.left}px`,
      thumbWidth: `${thumbRect.width.toFixed(2)}px`,
      ariaNow: bar.getAttribute('aria-valuenow'),
      audioTime: (() => {
        const audio = window.appState?.audio;
        return audio ? `${format(audio.currentTime)} / ${format(audio.duration)}` : 'no audio';
      })(),
    };
  };

  const logState = (label) => {
    console.log(`\n[${label}]`, state());
  };

  const track = (type) => (event) => {
    const x = event.clientX ?? 0;
    const rect = bar.getBoundingClientRect();
    const pct = rect.width ? (((x - rect.left) / rect.width) * 100).toFixed(2) : 'n/a';
    console.log(`${type}: x=${x.toFixed(2)} pct=${pct}%`, state());
  };

  const listeners = [
    ['pointerdown', track('down')],
    ['pointermove', track('move')],
    ['pointerup', track('up')],
    ['pointercancel', track('cancel')],
  ];

  listeners.forEach(([type, handler]) => bar.addEventListener(type, handler));

  const uiSyncInterval = setInterval(() => logState('interval'), 1500);

  const clear = () => {
    listeners.forEach(([type, handler]) => bar.removeEventListener(type, handler));
    clearInterval(uiSyncInterval);
    delete window.__musicProgressDebug;
    console.log('musicProgressDebug stopped');
  };

  window.__musicProgressDebug = { logState, stop: clear };

  logState('init');
  console.log('musicProgressDebug active. Call window.__musicProgressDebug.stop() to remove.');
})();
