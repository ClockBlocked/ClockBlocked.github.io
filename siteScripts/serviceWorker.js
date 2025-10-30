// Service Worker Registration Module
// Registers the service worker for PWA functionality

export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./system/serviceWorker.js")
        .then((registration) => {
          // Service Worker registered successfully
        })
        .catch((err) => {
          // Service Worker registration failed
        });
    });
  }
}
