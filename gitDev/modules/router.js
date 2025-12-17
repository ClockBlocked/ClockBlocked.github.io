


/**
function navigateToRoot() {
  currentState.path = '';
  
  showLoading('Loading repository root...');
//  ProgressBar.show();
  
  setTimeout(() => {
    try {
      currentState.files = LocalStorageManager.listFiles(currentState.repository, '');
      renderFileList();
      updateBreadcrumb();
    } catch (error) {
      console.error('Failed to load repository root:', error);
    }
    
    hideLoading();
//    ProgressBar.hide();
  }, 150);
}

function navigateToPath(path) {
  currentState.path = path;
  
  showLoading(`Loading directory ${path}...`);
//  ProgressBar.show();
  
  setTimeout(() => {
    try {
      const pathPrefix = path ? path + '/' : '';
      currentState.files = LocalStorageManager.listFiles(currentState.repository, pathPrefix);
      renderFileList();
      updateBreadcrumb();
    } catch (error) {
      console.error(`Failed to load path ${path}:`, error);
    }
    
    hideLoading();
//    ProgressBar.hide();
  }, 150);
}



function showFileEditor() {
  document.getElementById('explorerView').classList.add('hidden');
  document.getElementById('fileViewer').classList.add('hidden');
  document.getElementById('repoSelectorView').classList.add('hidden');
  document.getElementById('fileEditor').classList.remove('hidden');
  
//  ProgressBar.show();
//  setTimeout(() => ProgressBar.hide(), 300);
  setTimeout(() => LoadingProgress.hide(), 300);
}

function showRepoSelector() {
    // Hide other views
    const explorerView = document.getElementById('explorerView');
    const coder = document.getElementById('coder');
    
    if (explorerView) explorerView.classList.add('hidden');
    if (coder) coder.classList.add('hidden');
    
    // Show repo selector
    const repoSelector = document.getElementById('repoSelectorView');
    if (repoSelector) {
        repoSelector.classList.remove('hidden');
    }
    
    LoadingProgress.show();
    setTimeout(() => {
        LoadingProgress.hide();
    }, 400);
}





// In router.js, update these functions:

function showFileViewer() {
    // Hide other views
    const repoSelector = document.getElementById('repoSelectorView');
    const explorerView = document.getElementById('explorerView');
    
    if (repoSelector) repoSelector.classList.add('hidden');
    if (explorerView) explorerView.classList.add('hidden');
    
    // Show the unified coder
    const coder = document.getElementById('coder');
    if (coder) {
        coder.classList.remove('hidden');
    }
    
    LoadingProgress.show();
    setTimeout(() => LoadingProgress.hide(), 300);
}

function showExplorer() {
    if (currentState.repository) {
        // Hide other views
        const repoSelector = document.getElementById('repoSelectorView');
        const coder = document.getElementById('coder');
        
        if (repoSelector) repoSelector.classList.add('hidden');
        if (coder) coder.classList.add('hidden');
        
        // Show explorer view
        const explorerView = document.getElementById('explorerView');
        if (explorerView) {
            explorerView.classList.remove('hidden');
        } else {
            console.error('explorerView element not found');
            return;
        }
        
        updateStats();
        LoadingProgress.show();
        setTimeout(() => {
            LoadingProgress.hide();
        }, 300);
    }
}






const loaderStyles = `
  .gh-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 2.5px;
    z-index: 9999;
    background-color: #e1e4e8;
    transition: opacity 0.5s linear;
    opacity: 0;
    pointer-events: none;
  }
  
  .gh-progress.visible {
    opacity: 1;
    transition: opacity 0.3s ease-in;
  }
  
  .gh-progress-fill {
    display: block;
    height: 100%;
    width: 0;
    background-color: #0366d6;
    transition: width 0.5s ease-in-out;
  }
`;

const LoadingProgress = (() => {

  let progressElement = null;
  let fillElement = null;
  let hideTimeout = null;
  let progressInterval = null;
  let currentProgress = 0;

  let config = {
    color: '#1c7eec',
    height: '2.5px', 
    minimum: 0.08,
    maximum: 0.994,
    incrementPace: 'realistic'
  };

  function init() {
    progressElement = document.createElement('div');
    progressElement.className = 'gh-progress';
    
    fillElement = document.createElement('div'); 
    fillElement.className = 'gh-progress-fill';
    
    progressElement.appendChild(fillElement);
    
    const styleElement = document.createElement('style');
    styleElement.innerHTML = loaderStyles;
    document.head.appendChild(styleElement);
    
    progressElement.style.height = config.height;
    fillElement.style.backgroundColor = config.color;
    
    document.body.appendChild(progressElement);
  }

  function show() {
    if (!progressElement) init();
    
    cleanup();
    currentProgress = 0;
    progressElement.classList.remove('hidden');  
    progressElement.classList.add('visible');
    
    if (config.incrementPace === 'realistic') {
      simulateRealisticLoad();
    } else if (config.incrementPace === 'linear') {
      simulateLinearLoad();
    } else {
      fillElement.style.width = `${config.minimum * 100}%`; 
    }
  }

  function hide() {
    if (!progressElement) return;
    
    currentProgress = 100;
    fillElement.style.width = '100%';
    
    hideTimeout = setTimeout(() => {
      progressElement.classList.remove('visible');
      setTimeout(cleanup, 300);  
    }, 150);
  }

  function cleanup() {
    clearTimeout(hideTimeout);
    hideTimeout = null;
    
    clearInterval(progressInterval);
    progressInterval = null;
    
    progressElement.classList.add('hidden');
    progressElement.classList.remove('visible');
    
    fillElement.style.width = '0%';
    currentProgress = 0;
  }

  function simulateRealisticLoad() {
    const updateProgress = () => {
      if (currentProgress >= config.maximum * 100) {
        clearInterval(progressInterval);
        return;
      }
      
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
      fillElement.style.width = `${currentProgress}%`;

      clearInterval(progressInterval);
      progressInterval = setTimeout(updateProgress, delay);
    };

    updateProgress();
  }

  function simulateLinearLoad() {
    const updateProgress = () => {
      currentProgress += 1;
      fillElement.style.width = `${currentProgress}%`;

      if (currentProgress < config.maximum * 100) {
        setTimeout(updateProgress, 16);
      }
    };

    updateProgress();
  }

  function configOptions(options = {}) {
    config = { ...config, ...options };

    if (progressElement) {
      progressElement.style.height = config.height;
      fillElement.style.backgroundColor = config.color;
    }
  }

  function isVisible() {
    return progressElement && !progressElement.classList.contains('hidden');
  }

  return {
    config: configOptions,
    show,
    hide,
    isVisible  
  };

})();
**/
 
 
 
 
 
 
function navigateToRoot() {
  currentState.path = '';
  
  showLoading('Loading repository root...');
  
  setTimeout(() => {
    try {
      currentState.files = LocalStorageManager.listFiles(currentState.repository, '');
      renderFileList();
      updateBreadcrumb();
    } catch (error) {}
    
    hideLoading();
  }, 150);
}

function navigateToPath(path) {
  currentState.path = path;
  
  showLoading(`Loading directory ${path}...`);
  
  setTimeout(() => {
    try {
      const pathPrefix = path ? path + '/' : '';
      currentState.files = LocalStorageManager.listFiles(currentState.repository, pathPrefix);
      renderFileList();
      updateBreadcrumb();
    } catch (error) {}
    
    hideLoading();
  }, 150);
}

function showFileEditor() {
  showFileViewer();
}

function showRepoSelector() {
  const explorerView = document.getElementById('explorerView');
  const coderElement = document.querySelector('.pages[data-page="file"]');
  
  if (explorerView) explorerView.classList.add('hidden');
  if (coderElement) coderElement.classList.add('hidden');
  
  const repoSelector = document.getElementById('repoSelectorView');
  if (repoSelector) {
    repoSelector.classList.remove('hidden');
  }
  
  LoadingProgress.show();
  setTimeout(() => {
    LoadingProgress.hide();
  }, 400);
}

function showFileViewer() {
  const repoSelector = document.getElementById('repoSelectorView');
  const explorerView = document.getElementById('explorerView');
  
  if (repoSelector) repoSelector.classList.add('hidden');
  if (explorerView) explorerView.classList.add('hidden');
  
  const coderElement = document.querySelector('.pages[data-page="file"]');
  if (coderElement) {
    coderElement.classList.remove('hidden');
    
    if (window.coderViewEdit && typeof window.coderViewEdit.init === 'function') {
      const hasHeader = coderElement.querySelector('.code-viewer-header');
      if (!hasHeader) {
        window.coderViewEdit.init();
      }
    }
  }
  
  LoadingProgress.show();
  setTimeout(() => LoadingProgress.hide(), 300);
}

function showExplorer() {
  if (currentState.repository) {
    const repoSelector = document.getElementById('repoSelectorView');
    const coderElement = document.querySelector('.pages[data-page="file"]');
    
    if (repoSelector) repoSelector.classList.add('hidden');
    if (coderElement) coderElement.classList.add('hidden');
    
    const explorerView = document.getElementById('explorerView');
    if (explorerView) {
      explorerView.classList.remove('hidden');
    }
    
    updateStats();
    LoadingProgress.show();
    setTimeout(() => {
      LoadingProgress.hide();
    }, 300);
  }
}




const LoadingProgress = (() => {
  let progressElement = null;
  let fillElement = null;
  let hideTimeout = null;
  let progressInterval = null;
  let currentProgress = 0;
  let showTime = null;

  let config = {
    color: '#1c7eec',
    height: '2.5px',
    minimum: 0.08,
    maximum: 0.994,
    incrementPace: 'realistic',
    minDisplayTime: 600
  };

  function init() {
    progressElement = document.createElement('div');
    progressElement.className = 'gh-progress';
    
    fillElement = document.createElement('div');
    fillElement.className = 'gh-progress-fill';
    
    progressElement.appendChild(fillElement);
    
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .gh-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 2.5px;
        z-index: 9999;
        background-color: #e1e4e8;
        transition: opacity 0.5s linear;
        opacity: 0;
        pointer-events: none;
      }
      
      .gh-progress.visible {
        opacity: 1;
        transition: opacity 0.3s ease-in;
      }
      
      .gh-progress-fill {
        display: block;
        height: 100%;
        width: 0;
        background-color: #0366d6;
        transition: width 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(styleElement);
    
    progressElement.style.height = config.height;
    fillElement.style.backgroundColor = config.color;
    
    document.body.appendChild(progressElement);
  }

  function show() {
    if (!progressElement) init();
    
    cleanup();
    currentProgress = 0;
    showTime = Date.now();
    progressElement.classList.remove('hidden');
    progressElement.classList.add('visible');
    
    if (config.incrementPace === 'realistic') {
      simulateRealisticLoad();
    } else if (config.incrementPace === 'linear') {
      simulateLinearLoad();
    } else {
      fillElement.style.width = `${config.minimum * 100}%`;
    }
  }

  function hide() {
    if (!progressElement) return;
    
    const elapsed = Date.now() - showTime;
    const remaining = Math.max(0, config.minDisplayTime - elapsed);
    
    if (remaining > 0) {
      setTimeout(() => {
        actuallyHide();
      }, remaining);
    } else {
      actuallyHide();
    }
  }

  function actuallyHide() {
    currentProgress = 100;
    fillElement.style.width = '100%';
    
    hideTimeout = setTimeout(() => {
      progressElement.classList.remove('visible');
      setTimeout(cleanup, 300);
    }, 150);
  }

  function cleanup() {
    clearTimeout(hideTimeout);
    hideTimeout = null;
    
    clearInterval(progressInterval);
    progressInterval = null;
    
    progressElement.classList.add('hidden');
    progressElement.classList.remove('visible');
    
    fillElement.style.width = '0%';
    currentProgress = 0;
    showTime = null;
  }

  function simulateRealisticLoad() {
    const updateProgress = () => {
      if (currentProgress >= config.maximum * 100) {
        clearInterval(progressInterval);
        return;
      }
      
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
      fillElement.style.width = `${currentProgress}%`;

      clearInterval(progressInterval);
      progressInterval = setTimeout(updateProgress, delay);
    };

    updateProgress();
  }

  function simulateLinearLoad() {
    const updateProgress = () => {
      currentProgress += 1;
      fillElement.style.width = `${currentProgress}%`;

      if (currentProgress < config.maximum * 100) {
        setTimeout(updateProgress, 16);
      }
    };

    updateProgress();
  }

  function configOptions(options = {}) {
    config = { ...config, ...options };

    if (progressElement) {
      progressElement.style.height = config.height;
      fillElement.style.backgroundColor = config.color;
    }
  }

  function isVisible() {
    return progressElement && !progressElement.classList.contains('hidden');
  }

  function getRemainingMinTime() {
    if (!showTime) return 0;
    const elapsed = Date.now() - showTime;
    return Math.max(0, config.minDisplayTime - elapsed);
  }

  return {
    config: configOptions,
    show,
    hide,
    isVisible,
    getRemainingMinTime
  };
})();

const LoadingSpinner = (() => {
  let spinnerElement = null;
  let hideTimeout = null;
  let isActive = false;
  let showTime = null;

  let config = {
    fadeDuration: 300,
    minDisplayTime: 600
  };

  function init(selector = "#loadingSpinner") {
    if (spinnerElement) return true;
    
    spinnerElement = document.querySelector(selector);
    return !!spinnerElement;
  }

  function show() {
    if (!spinnerElement && !init()) return;
    
    clearTimeout(hideTimeout);
    isActive = true;
    showTime = Date.now();
    
    spinnerElement.style.display = "block";
    void spinnerElement.offsetWidth;
    spinnerElement.setAttribute("data-active", "true");
  }

  function hide() {
    if (!spinnerElement || !isActive) return;
    
    const elapsed = Date.now() - showTime;
    const remaining = Math.max(0, config.minDisplayTime - elapsed);
    
    if (remaining > 0) {
      hideTimeout = setTimeout(actuallyHide, remaining);
    } else {
      actuallyHide();
    }
  }

  function actuallyHide() {
    isActive = false;
    
    if (spinnerElement) {
      spinnerElement.setAttribute("data-active", "false");
    }
    
    hideTimeout = setTimeout(() => {
      if (!isActive && spinnerElement) {
        spinnerElement.style.display = "none";
      }
    }, config.fadeDuration);
  }

  function toggle() {
    isActive ? hide() : show();
  }

  function isVisible() {
    return isActive;
  }

  function configure(options = {}) {
    config = { ...config, ...options };
  }

  function destroy() {
    clearTimeout(hideTimeout);
    
    if (spinnerElement) {
      spinnerElement.setAttribute("data-active", "false");
      spinnerElement.style.display = "none";
    }
    
    spinnerElement = null;
    isActive = false;
    showTime = null;
  }

  function getRemainingMinTime() {
    if (!showTime) return 0;
    const elapsed = Date.now() - showTime;
    return Math.max(0, config.minDisplayTime - elapsed);
  }

  return {
    init,
    show,
    hide,
    toggle,
    isVisible,
    configure,
    destroy,
    getRemainingMinTime
  };
})();

window.LoadingProgress = LoadingProgress;
window.LoadingSpinner = LoadingSpinner;

window.navigateToRoot = navigateToRoot;
window.navigateToPath = navigateToPath;
window.showFileEditor = showFileEditor;
window.showRepoSelector = showRepoSelector;
window.showFileViewer = showFileViewer;
window.showExplorer = showExplorer;
/**
 * 
 *  C R E A T E D  B Y
 * 
 *  William Hanson 
 * 
 *  Chevrolay@Outlook.com
 * 
 *  m.me/Chevrolay
 * 
 */