/* Notification Smart Dock

Places a Dock Icon on the RIGHT side of your fixed Breadcrumbs Navbar (#navbar)

Groups notifications within a 5s window; only first in group triggers tada animation

Live unread counter badge

Drawer slides in from right on click showing: all unread + up to 10 notifications immediately preceding them

Integrates with your existing notifications.show(...) by calling integrateWithNotifications()


USAGE:

1. Include this script after your map.js (so global IDs like NAVBAR exist)

2. Call: notifications.init();

3. Optionally: notifications.integrateWithNotifications();

This file injects its CSS into <head> automatically. */

export const notifications = (() => {
    const GROUP_WINDOW = 5000; // 5 seconds grouping window
    const MAX_HISTORY_BEFORE_UNREAD = 10;
    
    // state
    const log = []; // {id, type, title, message, timestamp, read}
    let unreadCount = 0;
    let lastNotificationTs = 0;
    let dockEl = null;
    let badgeEl = null;
    let drawerEl = null;
    let listEl = null;
    let tadaPendingForGroup = false;

    function generateId() {
        return 'n_' + Math.random().toString(36).slice(2, 9);
    }

    function injectStyles() {
        if (document.getElementById('nsd-styles')) return;
        
        const css = `
            #notification-dock {
                position: relative;
                display: inline-block;
            }
            
            #notification-dock-btn {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                border-radius: 8px;
                background: transparent;
                border: 0;
                cursor: pointer;
            }
            
            #notification-dock-btn .nsd-icon {
                width: 20px;
                height: 20px;
                display: block;
            }
            
            #notification-badge {
                position: absolute;
                top: 4px;
                right: 4px;
                min-width: 18px;
                height: 18px;
                padding: 0 6px;
                border-radius: 999px;
                background: #ef4444;
                color: #fff;
                font-size: 12px;
                line-height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transform-origin: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            
            #notification-badge.hidden {
                opacity: 0;
                transform: scale(0.6);
                transition: transform 220ms cubic-bezier(.2,.8,.25,1), opacity 200ms linear;
            }

            /* drawer */
            #notification-drawer {
                position: fixed;
                top: 0;
                right: -420px;
                width: 380px;
                height: 100vh;
                background: var(--panel-bg, #0b1220);
                color: var(--panel-fg, #e6eef8);
                box-shadow: -40px 0 80px rgba(2,6,23,0.6);
                transition: right 360ms cubic-bezier(.2,.8,.25,1);
                z-index: 9999;
                display: flex;
                flex-direction: column;
            }
            
            #notification-drawer.open {
                right: 0;
            }
            
            #notification-drawer .nsd-header {
                padding: 18px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255,255,255,0.04);
            }
            
            #notification-drawer .nsd-header h3 {
                margin: 0;
                font-size: 14px;
            }
            
            #notification-drawer .nsd-list {
                overflow: auto;
                padding: 12px;
                flex: 1 1 auto;
            }
            
            .nsd-item {
                background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
                padding: 10px;
                border-radius: 8px;
                margin-bottom: 10px;
                display: flex;
                gap: 8px;
                align-items: flex-start;
            }
            
            .nsd-item .icon {
                width: 34px;
                height: 34px;
                flex: 0 0 34px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .nsd-item .content {
                flex: 1 1 auto;
            }
            
            .nsd-item .meta {
                font-size: 12px;
                opacity: 0.7;
                margin-top: 6px;
            }
            
            .nsd-item.unread {
                box-shadow: 0 8px 24px rgba(2,6,23,0.6);
                border: 1px solid rgba(255,255,255,0.03);
            }

            /* small animations */
            @keyframes nsd-tada {
                0% { transform: scale(1) rotate(0deg); }
                10% { transform: scale(1.08) rotate(-8deg); }
                20% { transform: scale(1.06) rotate(6deg); }
                30% { transform: scale(1.04) rotate(-4deg); }
                40% { transform: scale(1.02) rotate(2deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            
            .nsd-tada {
                animation: nsd-tada 700ms cubic-bezier(.2,.8,.25,1);
            }
            
            /* badge pop */
            @keyframes nsd-pop {
                0% { transform: scale(0.6); opacity: 0; }
                60% { transform: scale(1.12); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .nsd-badge-pop {
                animation: nsd-pop 260ms cubic-bezier(.2,.8,.25,1);
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'nsd-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function buildDock() {
        if (dockEl) return dockEl;
        
        injectStyles();
        
        dockEl = document.createElement('div');
        dockEl.id = 'notification-dock';
        
        const btn = document.createElement('button');
        btn.id = 'notification-dock-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Notifications');
        
        const icon = document.createElement('span');
        icon.className = 'nsd-icon';
        // simple bell svg (can be swapped)
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a3 3 0 00-3 3v.26A7.001 7.001 0 005 12v3l-1 1v1h16v-1l-1-1v-3a7.001 7.001 0 00-4-6.74V5a3 3 0 00-3-3zM8 20a4 4 0 008 0H8z"/></svg>';
        btn.appendChild(icon);
        
        badgeEl = document.createElement('span');
        badgeEl.id = 'notification-badge';
        badgeEl.className = 'hidden';
        badgeEl.textContent = '0';
        
        dockEl.appendChild(btn);
        dockEl.appendChild(badgeEl);
        
        btn.addEventListener('click', () => toggleDrawer());
        
        // Attach to right side of navbar
        const nav = document.querySelector((window.NAVBAR && window.NAVBAR.root) || '#navbar');
        if (nav) {
            // prefer to append to right-most area; if there is a .nav-actions container, append there
            const rightArea = nav.querySelector('.nav-actions') || nav.querySelector('.navbar-right') || nav;
            rightArea.appendChild(dockEl);
        } else {
            // fallback to body
            document.body.appendChild(dockEl);
            console.warn('notifications: #navbar not found; dock appended to body');
        }
        
        return dockEl;
    }

    function buildDrawer() {
        if (drawerEl) return drawerEl;
        
        drawerEl = document.createElement('aside');
        drawerEl.id = 'notification-drawer';
        drawerEl.innerHTML = `
            <div class="nsd-header">
                <h3>Notifications</h3>
                <div style="display:flex;gap:8px;align-items:center">
                    <button id="nsd-mark-all-read" title="Mark all read" style="background:transparent;border:0;color:inherit;cursor:pointer;">Mark all read</button>
                    <button id="nsd-close" title="Close" style="background:transparent;border:0;color:inherit;cursor:pointer;">✕</button>
                </div>
            </div>
            <div class="nsd-list" id="nsd-list"></div>
        `;
        
        document.body.appendChild(drawerEl);
        listEl = drawerEl.querySelector('#nsd-list');
        
        drawerEl.querySelector('#nsd-close').addEventListener('click', () => closeDrawer());
        drawerEl.querySelector('#nsd-mark-all-read').addEventListener('click', () => {
            markAllRead();
            renderList();
            updateBadge();
        });
        
        // close on outside click
        document.addEventListener('click', (e) => {
            if (!drawerEl.classList.contains('open')) return;
            const target = e.target;
            if (dockEl && (dockEl.contains(target) || (drawerEl && drawerEl.contains(target)))) return;
            closeDrawer();
        });
        
        return drawerEl;
    }

    function recordNotification({
        type = 'info',
        title = '',
        message = '',
        timestamp = Date.now()
    } = {}) {
        const id = generateId();
        const item = {
            id,
            type,
            title,
            message,
            timestamp,
            read: false
        };
        
        log.push(item);
        unreadCount += 1;
        updateBadge();
        
        // grouping logic
        const gap = timestamp - lastNotificationTs;
        const isNewGroup = gap > GROUP_WINDOW;
        
        if (isNewGroup) {
            // trigger tada
            triggerTadaOnceForGroup();
        }
        
        lastNotificationTs = timestamp;
        
        // render if drawer open
        if (drawerEl && drawerEl.classList.contains('open')) {
            // open drawer shows unread + last 10 before them, so re-render
            renderList();
        }
        
        return item;
    }

    function triggerTadaOnceForGroup() {
        // only trigger once per group; set a short lock while group window is open
        if (tadaPendingForGroup) return;
        tadaPendingForGroup = true;
        
        const btn = dockEl && dockEl.querySelector('#notification-dock-btn');
        if (btn) {
            btn.classList.add('nsd-tada');
            setTimeout(() => btn.classList.remove('nsd-tada'), 800);
        }
        
        // unlock after group window to allow next group's animation
        setTimeout(() => {
            tadaPendingForGroup = false;
        }, GROUP_WINDOW + 60);
    }

    function updateBadge() {
        if (!badgeEl) return;
        
        badgeEl.textContent = String(unreadCount);
        
        if (unreadCount > 0) {
            badgeEl.classList.remove('hidden');
            // quick pop animation
            badgeEl.classList.remove('nsd-badge-pop');
            // force reflow
            void badgeEl.offsetWidth;
            badgeEl.classList.add('nsd-badge-pop');
        } else {
            // shrink and hide
            badgeEl.classList.add('hidden');
        }
    }

    function toggleDrawer() {
        buildDrawer();
        const open = drawerEl.classList.toggle('open');
        if (open) {
            onDrawerOpen();
        }
    }

    function openDrawer() {
        buildDrawer();
        if (!drawerEl.classList.contains('open')) {
            drawerEl.classList.add('open');
            onDrawerOpen();
        }
    }

    function closeDrawer() {
        if (!drawerEl) return;
        drawerEl.classList.remove('open');
    }

    function onDrawerOpen() {
        // when drawer opens, shrink and hide badge quickly
        if (badgeEl) {
            badgeEl.classList.add('hidden');
        }
        
        // mark unread notifications as read and re-render list
        const unreadIds = log.filter(i => !i.read).map(i => i.id);
        if (unreadIds.length) {
            for (const id of unreadIds) {
                const it = log.find(x => x.id === id);
                if (it) it.read = true;
            }
            unreadCount = 0;
            updateBadge();
        }
        
        renderList();
    }

    function markAllRead() {
        for (const it of log) it.read = true;
        unreadCount = 0;
    }

    function renderList() {
        if (!listEl) return;
        
        // determine which items to show: all unread + up to 10 items immediately before the earliest unread
        const unread = log.filter(i => !i.read);
        let earliestUnreadIndex = Infinity;
        
        if (unread.length) {
            const earliestTs = Math.min(...unread.map(i => i.timestamp));
            earliestUnreadIndex = log.findIndex(i => i.timestamp === earliestTs);
        }
        
        let startIdx = Math.max(0, earliestUnreadIndex - MAX_HISTORY_BEFORE_UNREAD);
        if (earliestUnreadIndex === Infinity) {
            // no unread -> show last MAX_HISTORY_BEFORE_UNREAD items
            startIdx = Math.max(0, log.length - MAX_HISTORY_BEFORE_UNREAD);
        }
        
        const toShow = log.slice(startIdx, log.length);
        listEl.innerHTML = '';
        
        for (const item of toShow.reverse()) { // newest first
            const node = renderItem(item);
            listEl.appendChild(node);
        }
    }

    function renderItem(item) {
        const el = document.createElement('div');
        el.className = 'nsd-item' + (item.read ? '' : ' unread');
        
        const ico = document.createElement('div');
        ico.className = 'icon';
        ico.innerHTML = typeToIcon(item.type);
        
        const content = document.createElement('div');
        content.className = 'content';
        
        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = item.title || (item.type || '').toUpperCase();
        
        const msg = document.createElement('div');
        msg.className = 'message';
        msg.textContent = item.message;
        
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = new Date(item.timestamp).toLocaleString();
        
        content.appendChild(title);
        content.appendChild(msg);
        content.appendChild(meta);
        
        el.appendChild(ico);
        el.appendChild(content);
        
        return el;
    }

    function typeToIcon(type) {
        const NOTIFICATION_TYPES = window.NOTIFICATION_TYPES || {
            INFO: 'info',
            SUCCESS: 'success',
            WARNING: 'warning',
            ERROR: 'error'
        };
        
        const TOAST_ICONS = window.TOAST_ICONS || {
            [NOTIFICATION_TYPES.INFO]: 'ℹ️',
            [NOTIFICATION_TYPES.SUCCESS]: '✅',
            [NOTIFICATION_TYPES.WARNING]: '⚠️',
            [NOTIFICATION_TYPES.ERROR]: '❌'
        };
        
        switch (type) {
            case NOTIFICATION_TYPES.SUCCESS:
                return TOAST_ICONS[NOTIFICATION_TYPES.SUCCESS];
            case NOTIFICATION_TYPES.WARNING:
                return TOAST_ICONS[NOTIFICATION_TYPES.WARNING];
            case NOTIFICATION_TYPES.ERROR:
                return TOAST_ICONS[NOTIFICATION_TYPES.ERROR];
            default:
                return TOAST_ICONS[NOTIFICATION_TYPES.INFO];
        }
    }

    // Public API
    return {
        init() {
            buildDock();
            buildDrawer();
            updateBadge();
        },
        
        notify({
            type = (window.NOTIFICATION_TYPES && window.NOTIFICATION_TYPES.INFO) || 'info',
            title = '',
            message = ''
        } = {}) {
            const item = recordNotification({
                type,
                title,
                message,
                timestamp: Date.now()
            });
            return item;
        },
        
        // monkeypatch integration helper: calls dock.recordNotification whenever notifications.show is used
        integrateWithNotifications() {
            if (typeof window !== 'undefined' && window.notifications && typeof window.notifications.show === 'function') {
                const originalShow = window.notifications.show.bind(window.notifications);
                window.notifications.show = function(message, type = (window.NOTIFICATION_TYPES && window.NOTIFICATION_TYPES.INFO) || 'info', undoCallback = null, options = {}) {
                    // preserve original behaviour
                    const toast = originalShow(message, type, undoCallback, options);
                    
                    // add to dock
                    try {
                        const title = options.title || '';
                        const payload = {
                            type,
                            title,
                            message: String(message)
                        };
                        notifications.notify(payload);
                    } catch (err) {
                        console.error('notifications: integrateWithNotifications error', err);
                    }
                    
                    return toast;
                };
                console.info('notifications: integrated with window.notifications.show');
            } else {
                console.warn('notifications: window.notifications.show not found. Call notifications.notify(...) yourself or integrate later.');
            }
        },
        
        // expose for debugging / inspection
        _log: log,
        _getUnreadCount() {
            return unreadCount;
        }
    };
})();

// Expose globally so user can call notifications.init() easily
if (typeof window !== 'undefined') {
    window.notifications = notifications;
}

// Remove export default for browser compatibility
// export default notifications;