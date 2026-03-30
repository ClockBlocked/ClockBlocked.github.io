import { NOTIFICATION_TYPES, TOAST_ICONS } from '../map.js';
import { prefersReducedMotion } from '../utils/constants.js';
import { render, create } from '../utils/templates.js';

const notifications = {
  container: null,
  items: new Set(),

  initialize: function() {
    if (this.container && document.body.contains(this.container)) return;
    const existing = document.getElementById("toast-portal");
    this.container = existing || document.createElement("div");
    this.container.id = this.container.id || "toast-portal";
    if (!existing) document.body.appendChild(this.container);
  },

  show: function(message, type = NOTIFICATION_TYPES.INFO, undoCallback = null, options = {}) {
    notifications.initialize();

    const duration = Number.isFinite(options.duration) ? Math.max(1200, options.duration) : 5000;
    const title = options.title || null;
    const iconHtml = options.iconHtml || TOAST_ICONS[type] || TOAST_ICONS[NOTIFICATION_TYPES.INFO];

    const toastHtml = render.notification({
      type,
      iconHtml,
      title,
      message: notifications.escapeHtml(String(message)),
    });
    
    const toast = create(toastHtml);

    if (!prefersReducedMotion) {
      toast.style.animation = "toast-in 200ms cubic-bezier(.2,.8,.25,1) both";
    }

    const actions = toast.querySelector('.toast-actions');
    if (actions && typeof undoCallback === "function") {
      const undoBtn = document.createElement("button");
      undoBtn.type = "button";
      undoBtn.textContent = "Undo";
      undoBtn.addEventListener("click", () => {
        try { undoCallback(); } catch {}
        dismiss("undo");
      });
      actions.appendChild(undoBtn);
    }

    const progress = toast.querySelector('.toast-progress');

    notifications.container.prepend(toast);
    notifications.items.add(toast);

    const ctrl = notifications.createTimerController({
      duration,
      onTick: (ratioRemaining) => {
        progress.style.width = (ratioRemaining * 100).toFixed(2) + "%";
      },
      onEnd: () => dismiss("timeout"),
    });

    const pause = () => ctrl.pause();
    const resume = () => ctrl.resume();

    toast.addEventListener("mouseenter", pause);
    toast.addEventListener("mouseleave", resume);
    toast.addEventListener("touchstart", (e) => { pause(); touchStart(e); }, { passive: true });
    toast.addEventListener("touchend", (e) => { touchEnd(e); resume(); });
    toast.addEventListener("touchcancel", (e) => { touchEnd(e); resume(); });

    let drag = null;
    const threshold = 56;
    const maxFade = 80;

    const startDrag = (clientX) => {
      drag = { startX: clientX, lastX: clientX };
      toast.style.transition = "none";
    };
    const onDrag = (clientX) => {
      if (!drag) return;
      drag.lastX = clientX;
      const dx = clientX - drag.startX;
      toast.style.transform = `translateX(${dx}px)`;
      const abs = Math.min(Math.abs(dx), maxFade);
      const alpha = 1 - (abs / maxFade) * 0.85;
      toast.style.opacity = String(Math.max(0.15, alpha));
    };
    const endDrag = () => {
      if (!drag) return;
      const dx = drag.lastX - drag.startX;
      toast.style.transition = "transform 180ms cubic-bezier(.2,.8,.25,1), opacity 160ms linear";
      if (Math.abs(dx) >= threshold) {
        toast.style.animation = dx > 0 ? "toast-swipe-out-right 220ms both" : "toast-swipe-out-left 220ms both";
        setTimeout(() => dismiss("swipe"), 200);
      } else {
        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";
      }
      drag = null;
    };

    toast.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      ctrl.pause();
      toast.setPointerCapture?.(e.pointerId);
      startDrag(e.clientX);
    });
    toast.addEventListener("pointermove", (e) => {
      if (!drag) return;
      onDrag(e.clientX);
    });
    toast.addEventListener("pointerup", () => {
      endDrag();
      ctrl.resume();
    });
    toast.addEventListener("pointercancel", () => {
      endDrag();
      ctrl.resume();
    });

    function touchStart(e) {
      const t = e.changedTouches?.[0];
      if (!t) return;
      startDrag(t.clientX);
    }
    function touchEnd(e) {
      const t = e.changedTouches?.[0];
      if (!t) return;
      onDrag(t.clientX);
      endDrag();
    }

    const dismiss = () => {
      if (!notifications.items.has(toast)) return;
      ctrl.stop();
      notifications.items.delete(toast);
      if (!prefersReducedMotion) {
        toast.style.animation = "toast-out-up 180ms cubic-bezier(.2,.8,.25,1) forwards";
        setTimeout(() => toast.remove(), 160);
      } else {
        toast.remove();
      }
    };

    return toast;
  },

  createTimerController: function({ duration, onTick, onEnd }) {
    let start = performance.now();
    let remaining = duration;
    let raf = null;
    let running = true;

    function frame(now) {
      if (!running) return;
      const elapsed = now - start;
      const left = Math.max(0, remaining - elapsed);
      const ratioRemaining = left / duration;
      onTick?.(ratioRemaining);
      if (left <= 0) {
        running = false;
        onEnd?.();
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      pause() {
        if (!running) return;
        running = false;
        remaining -= performance.now() - start;
        if (raf) cancelAnimationFrame(raf);
      },
      resume() {
        if (running) return;
        running = true;
        start = performance.now();
        raf = requestAnimationFrame(frame);
      },
      stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      }
    };
  },

  escapeHtml: function(s) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};

export { notifications };
