// PWA Install Banner Module
// Manages Progressive Web App install prompts and banners

export function initPWABanner() {
  let deferredPrompt;
  const banner = document.getElementById("pwa-install-banner");
  const installLink = document.getElementById("pwa-download-link");
  const dismissBtn = document.getElementById("pwa-dismiss");

  if (!banner || !installLink || !dismissBtn) {
    return;
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showPWABanner();
  });

  function showPWABanner() {
    banner.style.opacity = "1";
    banner.style.pointerEvents = "auto";
    banner.classList.remove("translate-y-5");
  }
  
  function hidePWABanner() {
    banner.style.opacity = "0";
    banner.style.pointerEvents = "none";
  }

  installLink.addEventListener("click", async (e) => {
    e.preventDefault();
    hidePWABanner();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
  });
  
  dismissBtn.addEventListener("click", hidePWABanner);
  
  window.addEventListener("DOMContentLoaded", () => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
    } else if ("getInstalledRelatedApps" in navigator) {
      navigator.getInstalledRelatedApps().then((relatedApps) => {
        if (relatedApps.length > 0) {
          showPWABanner();
        } else {
        }
      });
    }
  });
}
