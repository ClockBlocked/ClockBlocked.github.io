const ValidationUtils = {
  isValidFilename(filename) {
    if (!filename || filename.length > 255) return false;
    if (/[<>:"|?*\\/]/.test(filename)) return false;
    const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const nameWithoutExt = filename.replace(/\.[^.]*$/, '') || filename;
    return !reserved.includes(nameWithoutExt.toUpperCase());
  }
};

const TIME_CONSTANTS = {
  MINUTE_MS: 60000,
  HOUR_MS: 3600000,
  DAY_MS: 86400000,
  WEEK_MS: 604800000
};

const FormatUtils = {
  formatFileSize(bytes) {
    if (typeof bytes !== 'number') return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < TIME_CONSTANTS.MINUTE_MS) return 'now';
    if (diff < TIME_CONSTANTS.HOUR_MS) return Math.floor(diff / TIME_CONSTANTS.MINUTE_MS) + ' minutes ago';
    if (diff < TIME_CONSTANTS.DAY_MS) return Math.floor(diff / TIME_CONSTANTS.HOUR_MS) + ' hours ago';
    if (diff < TIME_CONSTANTS.WEEK_MS) return Math.floor(diff / TIME_CONSTANTS.DAY_MS) + ' days ago';
    return date.toLocaleDateString();
  },

  formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    if (diff < TIME_CONSTANTS.MINUTE_MS) return 'now';
    if (diff < TIME_CONSTANTS.HOUR_MS) return Math.floor(diff / TIME_CONSTANTS.MINUTE_MS) + 'm';
    if (diff < TIME_CONSTANTS.DAY_MS) return Math.floor(diff / TIME_CONSTANTS.HOUR_MS) + 'h';
    if (diff < TIME_CONSTANTS.WEEK_MS) return Math.floor(diff / TIME_CONSTANTS.DAY_MS) + 'd';
    return Math.floor(diff / TIME_CONSTANTS.WEEK_MS) + 'w';
  }
};

const LanguageUtils = {
  getLanguageColor(ext) {
    const colors = {
      'html': '#e34c26', 'htm': '#e34c26', 'css': '#1572b6', 'js': '#f1e05a', 'javascript': '#f1e05a',
      'ts': '#2b7489', 'typescript': '#2b7489', 'md': '#083fa1', 'markdown': '#083fa1', 'json': '#f1e05a',
      'php': '#4f5d95', 'py': '#3572a5', 'python': '#3572a5', 'java': '#b07219', 'cpp': '#f34b7d',
      'c': '#555555', 'cs': '#239120', 'rb': '#701516', 'ruby': '#701516', 'go': '#00add8',
      'rs': '#dea584', 'rust': '#dea584', 'yml': '#cb171e', 'yaml': '#cb171e', 'xml': '#0060ac',
      'sql': '#e38c00'
    };
    return colors[ext] || '#7d8590';
  },

  getLanguageName(ext) {
    const languages = {
      'html': 'HTML', 'htm': 'HTML', 'css': 'CSS', 'js': 'JavaScript', 'javascript': 'JavaScript',
      'ts': 'TypeScript', 'typescript': 'TypeScript', 'json': 'JSON', 'md': 'Markdown', 'markdown': 'Markdown',
      'php': 'PHP', 'py': 'Python', 'python': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C',
      'cs': 'C#', 'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'yml': 'YAML', 'yaml': 'YAML', 'xml': 'XML',
      'sql': 'SQL'
    };
    return languages[ext] || 'Text';
  },

  getPrismLanguage(ext) {
    const languageMap = {
      'js': 'javascript', 'javascript': 'javascript', 'ts': 'typescript', 'typescript': 'typescript',
      'html': 'html', 'htm': 'html', 'css': 'css', 'scss': 'scss', 'sass': 'sass', 'less': 'less',
      'json': 'json', 'md': 'markdown', 'markdown': 'markdown', 'py': 'python', 'python': 'python',
      'php': 'php', 'sql': 'sql', 'yml': 'yaml', 'yaml': 'yaml', 'xml': 'xml', 'java': 'java',
      'cpp': 'cpp', 'c': 'c', 'cs': 'csharp', 'rb': 'ruby', 'rust': 'rust', 'go': 'go',
      'txt': 'text', 'text': 'text'
    };
    return languageMap[ext] || 'text';
  },

  getFileIcon(filename, type) {
    if (type === 'folder') {
      return `<svg class="w4 h4 textAccentFg" fill="currentColor" viewBox="0 0 16 16"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"/></svg>`;
    }
    if (!filename || typeof filename !== 'string') {
      return `<svg class="w4 h4" style="color: #7d8590" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>`;
    }
    const parts = filename.split('.');
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
    const iconColor = this.getLanguageColor(ext);
    return `<svg class="w4 h4" style="color: ${iconColor}" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>`;
  }
};

const NotificationUtils = {
  show(message, type = 'success') {
    const notification = document.createElement('div');
    const bgClass = type === 'error' ? 'bgDangerFg' : 'bgSuccessFg';
    notification.className = `fixed top4 right4 ${bgClass} textWhite px4 py3 roundedLg shadowLg z50 animateSlideDown`;
    
    const icon = type === 'error' 
      ? '<path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16ZM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646Z"/>'
      : '<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>';
    
    const container = document.createElement('div');
    container.className = 'flex itemsCenter spaceX2';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w5 h5');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.innerHTML = icon;
    
    const span = document.createElement('span');
    span.textContent = message;
    
    container.appendChild(svg);
    container.appendChild(span);
    notification.appendChild(container);
    
    if (type === 'error') {
      notification.dataset.notify = 'error';
    }
    
    document.body.appendChild(notification);
    
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },

  showSuccess(message) {
    this.show(message, 'success');
  },

  showError(message) {
    this.show(message, 'error');
  }
};

const LoadingUtils = {
  createProgressBar() {
    let progressElement = null;
    let fillElement = null;
    let hideTimeout = null;
    let progressInterval = null;
    let currentProgress = 0;
    let showTime = null;

    const config = {
      color: '#1c7eec',
      height: '2.5px',
      minimum: 0.08,
      maximum: 0.994,
      incrementPace: 'realistic',
      minDisplayTime: 600
    };

    function init() {
      if (progressElement) return;
      
      if (!document.getElementById('ghProgressStyles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'ghProgressStyles';
        styleElement.innerHTML = `
          .ghProgress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 2.5px;
            z-index: 9999;
            background-color: transparent;
            transition: opacity 0.5s linear;
            opacity: 0;
            pointer-events: none;
          }
          .ghProgress.visible {
            opacity: 1;
            transition: opacity 0.3s ease-in;
          }
          .ghProgressFill {
            display: block;
            height: 100%;
            width: 0;
            background: linear-gradient(90deg, #dc2626, #ef4444, #f87171);
            box-shadow: 0 0 10px rgba(220, 38, 38, 0.5), 0 0 20px rgba(220, 38, 38, 0.3);
            transition: width 0.5s ease-in-out;
          }
        `;
        document.head.appendChild(styleElement);
      }
      
      progressElement = document.createElement('div');
      progressElement.className = 'ghProgress';
      fillElement = document.createElement('div');
      fillElement.className = 'ghProgressFill';
      progressElement.appendChild(fillElement);
      document.body.appendChild(progressElement);
    }

    function show() {
      if (!progressElement) init();
      cleanup();
      currentProgress = 0;
      showTime = Date.now();
      progressElement.classList.remove('hidden');
      progressElement.classList.add('visible');
      if (config.incrementPace === 'realistic') simulateRealisticLoad();
    }

    function hide() {
      if (!progressElement) return;
      const elapsed = Date.now() - showTime;
      const remaining = Math.max(0, config.minDisplayTime - elapsed);
      if (remaining > 0) {
        setTimeout(actuallyHide, remaining);
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
      clearTimeout(progressInterval);
      if (progressElement) {
        progressElement.classList.add('hidden');
        progressElement.classList.remove('visible');
        fillElement.style.width = '0%';
      }
      currentProgress = 0;
      showTime = null;
    }

    function simulateRealisticLoad() {
      const updateProgress = () => {
        if (currentProgress >= config.maximum * 100) {
          clearTimeout(progressInterval);
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
        clearTimeout(progressInterval);
        progressInterval = setTimeout(updateProgress, delay);
      };
      updateProgress();
    }

    return { show, hide };
  },

  createSpinner(selector = "#loadingSpinner") {
    let spinnerElement = null;
    let hideTimeout = null;
    let isActive = false;
    let showTime = null;
    const config = { fadeDuration: 300, minDisplayTime: 600 };

    function init() {
      if (spinnerElement) return true;
      spinnerElement = document.querySelector(selector);
      return !!spinnerElement;
    }

    function show() {
      if (!spinnerElement && !init()) return;
      clearTimeout(hideTimeout);
      isActive = true;
      showTime = Date.now();
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
    }

    return { init, show, hide };
  }
};

if (typeof window !== 'undefined') {
  window.ValidationUtils = ValidationUtils;
  window.FormatUtils = FormatUtils;
  window.LanguageUtils = LanguageUtils;
  window.NotificationUtils = NotificationUtils;
  window.LoadingUtils = LoadingUtils;
}
