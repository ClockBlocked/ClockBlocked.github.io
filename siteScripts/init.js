// Main Initialization Module
// Orchestrates all standalone modules for the application

import { bustCache } from './cacheBuster.js';
import { initTheme } from './theme.js';
import { initPWABanner } from './pwa.js';
import { registerServiceWorker } from './serviceWorker.js';
import { initBreadcrumbBorder } from './breadcrumb.js';
import { initDesktopLayout } from './desktopLayout.js';

// Run cache buster immediately
bustCache();

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPWABanner();
  initBreadcrumbBorder();
  initDesktopLayout();
});

// Register service worker
registerServiceWorker();
