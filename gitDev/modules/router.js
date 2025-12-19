function showRepoSelector() {
  const explorerView = document.getElementById("explorerView");
  const fileView = document.querySelector('. pages[data-page="file"]');
  const repoSelector = document.getElementById("repoSelectorView");
  if (explorerView) explorerView.classList. add("hidden");
  if (fileView) fileView.classList. add("hidden");
  if (repoSelector) repoSelector.classList.remove("hidden");
  LoadingProgress.show();
  setTimeout(() => LoadingProgress.hide(), 400);
}

function showExplorer() {
  if (! window.currentState || ! window.currentState. repository) return;
  const repoSelector = document.getElementById("repoSelectorView");
  const fileView = document.querySelector('.pages[data-page="file"]');
  const explorerView = document.getElementById("explorerView");
  if (repoSelector) repoSelector.classList.add("hidden");
  if (fileView) fileView.classList. add("hidden");
  if (explorerView) explorerView.classList.remove("hidden");
  if (typeof updateStats === "function") updateStats();
  LoadingProgress.show();
  setTimeout(() => LoadingProgress.hide(), 300);
}

function showFileViewer() {
  const repoSelector = document. getElementById("repoSelectorView");
  const explorerView = document. getElementById("explorerView");
  const fileView = document.querySelector('.pages[data-page="file"]');
  if (repoSelector) repoSelector.classList.add("hidden");
  if (explorerView) explorerView.classList.add("hidden");
  if (fileView) {
    fileView. classList.remove("hidden");
    if (window.coderViewEdit && typeof window.coderViewEdit.init === "function" && ! window.coderViewEdit.isInitialized) {
      window.coderViewEdit.init();
    }
  }
  LoadingProgress. show();
  setTimeout(() => LoadingProgress.hide(), 300);
}

function showFileEditor() {
  showFileViewer();
}

function navigateToRoot() {
  if (! window.currentState) return;
  window.currentState.path = "";
  if (typeof showLoading === "function") showLoading("Loading repository root...");
  setTimeout(() => {
    try {
      if (typeof LocalStorageManager !== "undefined") {
        window.currentState.files = LocalStorageManager.listFiles(window.currentState. repository, "");
      }
      if (typeof renderFileList === "function") renderFileList();
      if (typeof updateBreadcrumb === "function") updateBreadcrumb();
    } catch (error) {}
    if (typeof hideLoading === "function") hideLoading();
  }, 150);
}

function navigateToPath(path) {
  if (!window. currentState) return;
  window.currentState.path = path;
  if (typeof showLoading === "function") showLoading("Loading directory...");
  setTimeout(() => {
    try {
      const pathPrefix = path ?  path + "/" : "";
      if (typeof LocalStorageManager !== "undefined") {
        window.currentState. files = LocalStorageManager.listFiles(window.currentState. repository, pathPrefix);
      }
      if (typeof renderFileList === "function") renderFileList();
      if (typeof updateBreadcrumb === "function") updateBreadcrumb();
    } catch (error) {}
    if (typeof hideLoading === "function") hideLoading();
  }, 150);
}

function navigateToFolder(folderName) {
  if (!window. currentState) return;
  const newPath = window.currentState.path ?  window.currentState. path + "/" + folderName : folderName;
  navigateToPath(newPath);
}

const LoadingProgress = (() => {
  let progressElement = null;
  let fillElement = null;
  let hideTimeout = null;
  let progressInterval = null;
  let currentProgress = 0;
  let showTime = null;
  let isShowing = false;
  const config = {
    minimum: 0.08,
    maximum:  0.994,
    minDisplayTime: 600
  };
  function init() {
    if (progressElement) return;
    const style = document.createElement("style");
    style.id = "loadingProgressStyles";
    style.textContent = `
      . gh-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 2. 5px;
        z-index: 9999;
        background-color: transparent;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .gh-progress--visible {
        opacity: 1;
      }
      .gh-progress-fill {
        display: block;
        height: 100%;
        width: 0;
        background:  linear-gradient(90deg, #dc2626, #ef4444, #f87171);
        box-shadow: 0 0 10px rgba(220, 38, 38, 0.5), 0 0 20px rgba(220, 38, 38, 0.3);
        transition:  width 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    progressElement = document.createElement("div");
    progressElement.className = "gh-progress";
    fillElement = document.createElement("div");
    fillElement.className = "gh-progress-fill";
    progressElement.appendChild(fillElement);
    document.body.appendChild(progressElement);
  }
  function show() {
    if (! progressElement) init();
    if (isShowing) return;
    isShowing = true;
    clearTimeout(hideTimeout);
    clearTimeout(progressInterval);
    currentProgress = config.minimum * 100;
    showTime = Date.now();
    fillElement.style.transition = "none";
    fillElement.style.width = "0%";
    void fillElement.offsetWidth;
    fillElement.style.transition = "width 0.3s ease-out";
    progressElement.classList.add("gh-progress--visible");
    fillElement.style.width = currentProgress + "%";
    simulateProgress();
  }
  function hide() {
    if (! progressElement || !isShowing) return;
    clearTimeout(progressInterval);
    const elapsed = Date.now() - (showTime || 0);
    const remaining = Math.max(0, config.minDisplayTime - elapsed);
    hideTimeout = setTimeout(() => {
      fillElement.style.width = "100%";
      setTimeout(() => {
        progressElement.classList.remove("gh-progress--visible");
        setTimeout(() => {
          fillElement.style.width = "0%";
          currentProgress = 0;
          showTime = null;
          isShowing = false;
        }, 300);
      }, 150);
    }, remaining);
  }
  function simulateProgress() {
    function update() {
      if (currentProgress >= config.maximum * 100 || ! isShowing) return;
      let increment, delay;
      if (currentProgress < 60) {
        increment = Math.random() * 5 + 3;
        delay = Math.random() * 60 + 20;
      } else if (currentProgress < 90) {
        increment = Math.random() * 2 + 1;
        delay = Math.random() * 250 + 150;
      } else {
        increment = Math.random() * 0.5 + 0.3;
        delay = Math.random() * 500 + 500;
      }
      currentProgress = Math.min(config.maximum * 100, currentProgress + increment);
      fillElement.style.width = currentProgress + "%";
      progressInterval = setTimeout(update, delay);
    }
    update();
  }
  function isVisible() {
    return isShowing;
  }
  return { show, hide, isVisible };
})();

const LoadingSpinner = (() => {
  let spinnerElement = null;
  let hideTimeout = null;
  let isActive = false;
  let showTime = null;
  const config = {
    fadeDuration: 300,
    minDisplayTime: 600,
    selector: "#loadingSpinner"
  };
  function init(selector) {
    if (selector) config.selector = selector;
    spinnerElement = document. querySelector(config.selector);
    return !!spinnerElement;
  }
  function show() {
    if (!spinnerElement && !init()) return;
    clearTimeout(hideTimeout);
    isActive = true;
    showTime = Date.now();
    spinnerElement.setAttribute("data-active", "true");
  }
  function hide() {
    if (!spinnerElement || !isActive) return;
    const elapsed = Date.now() - (showTime || 0);
    const remaining = Math.max(0, config.minDisplayTime - elapsed);
    hideTimeout = setTimeout(() => {
      isActive = false;
      showTime = null;
      if (spinnerElement) spinnerElement.setAttribute("data-active", "false");
    }, remaining);
  }
  function toggle() {
    isActive ?  hide() : show();
  }
  function isVisible() {
    return isActive;
  }
  function configure(options) {
    Object.assign(config, options);
  }
  function destroy() {
    clearTimeout(hideTimeout);
    if (spinnerElement) spinnerElement.setAttribute("data-active", "false");
    spinnerElement = null;
    isActive = false;
    showTime = null;
  }
  return { init, show, hide, toggle, isVisible, configure, destroy };
})();

window.LoadingProgress = LoadingProgress;
window. LoadingSpinner = LoadingSpinner;
window.showRepoSelector = showRepoSelector;
window.showExplorer = showExplorer;
window.showFileViewer = showFileViewer;
window.showFileEditor = showFileEditor;
window. navigateToRoot = navigateToRoot;
window.navigateToPath = navigateToPath;
window.navigateToFolder = navigateToFolder;