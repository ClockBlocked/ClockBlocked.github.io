


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
  const coderElement = document.getElementById('coder');
  
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
  
  const coderElement = document.getElementById('coder');
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
    const coderElement = document.getElementById('coder');
    
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
const LoadingSpinner = (() => {
  let spinnerElement = null;
  let hideTimeout = null;
  let isActive = false;

  let config = {
    message: 'Loading...',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    spinnerColor: '#1c7eec',
    fadeDuration: 300,
    zIndex: 10000
  };

  function init() {
    if (spinnerElement) return;
    
    // Create spinner element
    spinnerElement = document.createElement('div');
    spinnerElement.id = 'loadingSpinner';
    spinnerElement.setAttribute('data-active', 'false');
    spinnerElement.className = 'loading-spinner';
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'spinner-overlay';
    
    // Create spinner content container
    const content = document.createElement('div');
    content.className = 'spinner-content';
    
    // Create actual spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    // Create loading text
    const text = document.createElement('p');
    text.className = 'spinner-text';
    text.textContent = config.message;
    
    // Build structure
    content.appendChild(spinner);
    content.appendChild(text);
    overlay.appendChild(content);
    spinnerElement.appendChild(overlay);
    
    // Create and inject styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .loading-spinner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: ${config.zIndex};
        opacity: 0;
        visibility: hidden;
        transition: opacity ${config.fadeDuration}ms ease-in-out, visibility ${config.fadeDuration}ms ease-in-out;
        pointer-events: none;
      }
      
      .loading-spinner[data-active="true"] {
        opacity: 1;
        visibility: visible;
        pointer-events: all;
      }
      
      .spinner-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: ${config.backgroundColor};
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .spinner-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        animation: spinner-enter 0.4s ease-out;
      }
      
      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: ${config.spinnerColor};
        border-radius: 50%;
        animation: spinner-rotate 1s linear infinite;
      }
      
      .spinner-text {
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 1rem;
        margin: 0;
        text-align: center;
        animation: text-fade 0.5s ease-out;
      }
      
      @keyframes spinner-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes spinner-enter {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      @keyframes text-fade {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    
    document.head.appendChild(styleElement);
    document.body.appendChild(spinnerElement);
  }

  function show() {
    if (!spinnerElement) init();
    
    clearTimeout(hideTimeout);
    isActive = true;
    
    // Force reflow to ensure transition triggers
    spinnerElement.style.display = 'block';
    void spinnerElement.offsetWidth;
    
    spinnerElement.setAttribute('data-active', 'true');
  }

  function hide() {
    if (!spinnerElement || !isActive) return;
    
    isActive = false;
    spinnerElement.setAttribute('data-active', 'false');
    
    // Clean up element after fade out
    hideTimeout = setTimeout(() => {
      if (!isActive) {
        spinnerElement.style.display = 'none';
      }
    }, config.fadeDuration);
  }

  function toggle() {
    if (isActive) {
      hide();
    } else {
      show();
    }
  }

  function updateMessage(newMessage) {
    if (!spinnerElement) return;
    
    config.message = newMessage;
    const textElement = spinnerElement.querySelector('.spinner-text');
    if (textElement) {
      textElement.textContent = newMessage;
    }
  }

  function configOptions(options = {}) {
    config = { ...config, ...options };
    
    if (spinnerElement) {
      // Update spinner color
      const spinner = spinnerElement.querySelector('.spinner');
      if (spinner) {
        spinner.style.borderTopColor = config.spinnerColor;
      }
      
      // Update overlay background
      const overlay = spinnerElement.querySelector('.spinner-overlay');
      if (overlay) {
        overlay.style.backgroundColor = config.backgroundColor;
      }
      
      // Update z-index
      spinnerElement.style.zIndex = config.zIndex;
      
      // Update transition duration
      spinnerElement.style.transition = `opacity ${config.fadeDuration}ms ease-in-out, visibility ${config.fadeDuration}ms ease-in-out`;
    }
  }

  function isVisible() {
    return isActive;
  }

  function destroy() {
    if (spinnerElement && spinnerElement.parentNode) {
      spinnerElement.parentNode.removeChild(spinnerElement);
      spinnerElement = null;
    }
    clearTimeout(hideTimeout);
    isActive = false;
  }

  return {
    config: configOptions,
    show,
    hide,
    toggle,
    updateMessage,
    isVisible,
    destroy
  };
})();

window.navigateToRoot = navigateToRoot;
window.navigateToPath = navigateToPath;
window.showFileEditor = showFileEditor;
window.showRepoSelector = showRepoSelector;
window.showFileViewer = showFileViewer;
window.showExplorer = showExplorer;

window.LoadingProgress = LoadingProgress;
window.LoadingSpinner = LoadingSpinner;
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