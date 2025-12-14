


/**
import { LoadingProgress } from 'https://gitdev.wuaze.com/modules/router.js';
import { showLoading, hideLoading } from 'https://gitdev.wuaze.com/modules/overlays.js';
import { currentState } from 'https://gitdev.wuaze.com/modules/core.js';
import { LocalStorageManager } from 'https://gitdev.wuaze.com/modules/storage.js';
import { renderFileList, updateBreadcrumb, updateStats } from 'https://gitdev.wuaze.com/modules/pageUpdates.js';
**/




/**
const ProgressBar = {
  element: null,
  fillElement: null,
  hideTimeout: null,
  progressInterval: null,
  currentProgress: 0,
  
  init() {
    if (!this.element) {
      this.element = document.getElementById('pageProgress');
      if (this.element) {
        this.fillElement = this.element.querySelector('.progress-fill');
      }
    }
  },
  
  show() {
    this.init();
    if (!this.element) return;
    
    this.cleanup();
    this.currentProgress = 0;
    this.element.classList.remove('hidden');
    this.element.classList.add('visible');
    this.simulateRealisticLoad();
  },
  
  hide() {
    this.init();
    if (!this.element) return;
    
    if (this.fillElement) {
      this.currentProgress = 100;
      this.fillElement.style.width = '100%';
    }
    
    this.hideTimeout = setTimeout(() => {
      this.element.classList.remove('visible');
      
      setTimeout(() => {
        this.cleanup();
      }, 300);
    }, 150);
  },
  
  cleanup() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    
    if (this.element) {
      this.element.classList.add('hidden');
      this.element.classList.remove('visible');
    }
    if (this.fillElement) {
      this.fillElement.style.width = '0%';
    }
    this.currentProgress = 0;
  },
  
  simulateRealisticLoad() {
    if (!this.fillElement) return;
    
    const updateProgress = () => {
      if (this.currentProgress >= 95) {
        clearInterval(this.progressInterval);
        return;
      }
      
      let increment, delay;
      
      if (this.currentProgress < 60) {
        increment = Math.random() * 5 + 3;
        delay = Math.random() * 60 + 20;
      } else if (this.currentProgress < 90) {
        increment = Math.random() * 2 + 1;
        delay = Math.random() * 250 + 150;
      } else {
        increment = Math.random() * 0.5 + 0.3;
        delay = Math.random() * 500 + 500;
      }
      
      this.currentProgress = Math.min(95, this.currentProgress + increment);
      this.fillElement.style.width = `${this.currentProgress}%`;
      
      clearInterval(this.progressInterval);
      this.progressInterval = setTimeout(updateProgress, delay);
    };
    
    updateProgress();
  }
};
document.addEventListener('DOMContentLoaded', () => {
  ProgressBar.init();
  ProgressBar.show();
  
  setTimeout(() => {
    ProgressBar.hide();
  }, 800);
});
**/





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
  document.getElementById('explorerView').classList.add('hidden');
  document.getElementById('fileViewer').classList.add('hidden');
  document.getElementById('fileEditor').classList.add('hidden');
  document.getElementById('repoSelectorView').classList.remove('hidden');
  
//  ProgressBar.show();
  LoadingProgress.show();
  setTimeout(() => {
//    ProgressBar.hide();
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



// { ProgressBar };



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