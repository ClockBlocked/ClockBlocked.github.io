// Global function exports - Declare early to prevent loading issues
window.showCreateRepoModal = function() {
  const modal = document.getElementById('createRepoModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.hideCreateRepoModal = function() {
  const modal = document.getElementById('createRepoModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.showCreateFileModal = function() {
  const modal = document.getElementById('createFileModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.hideCreateFileModal = function() {
  const modal = document.getElementById('createFileModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.showDeleteFileModal = function(fileName) {
  const modal = document.getElementById('deleteFileModal');
  const fileToDeleteName = document.getElementById('fileToDeleteName');
  
  if (modal && fileToDeleteName && fileName) {
    fileToDeleteName.textContent = fileName;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.dataset.fileName = fileName;
  }
};

window.hideDeleteFileModal = function() {
  const modal = document.getElementById('deleteFileModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.showDeleteRepoModal = function(repoName) {
  const modal = document.getElementById('deleteRepoModal');
  const repoToDeleteName = document.getElementById('repoToDeleteName');
  
  if (modal && repoToDeleteName && repoName) {
    repoToDeleteName.textContent = repoName;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.dataset.repoName = repoName;
  }
};

window.hideDeleteRepoModal = function() {
  const modal = document.getElementById('deleteRepoModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.toggleTheme = function() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  
  if (isDark) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};

// Initialize basic functionality immediately
(function() {
  'use strict';
  
  // Set theme immediately to prevent flash
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();

// Safe DOM query helper
function safeGetElement(id, context = document) {
  try {
    const element = context.getElementById ? context.getElementById(id) : context.querySelector('#' + id);
    if (!element) {
      console.warn(`Element with ID '${id}' not found`);
    }
    return element;
  } catch (error) {
    console.error(`Error getting element '${id}':`, error);
    return null;
  }
}

// Safe value extraction helper
function safeGetValue(element, defaultValue = '') {
  try {
    if (!element) return defaultValue;
    return element.value ? element.value.trim() : defaultValue;
  } catch (error) {
    console.error('Error getting element value:', error);
    return defaultValue;
  }
}

// Safe text content helper
function safeSetText(element, text) {
  try {
    if (element && typeof text === 'string') {
      element.textContent = text;
      return true;
    }
  } catch (error) {
    console.error('Error setting text content:', error);
  }
  return false;
}

let currentState = {
  repository: null,
  branch: 'main',
  path: '',
  currentFile: null,
  selectedTags: [],
  files: [],
  repositories: [],
  isLoading: false,
  navState: 'repositories' // Track navigation state
};

let codeEditor = null;
let initialContentEditor = null;
let loadingProgressTimer = null;

// Enhanced Loading Progress Bar Management
function showLoadingProgress() {
  const progressBar = document.getElementById('loadingProgressBar');
  if (progressBar) {
    currentState.isLoading = true;
    progressBar.classList.remove('hide');
    progressBar.classList.add('show');
    progressBar.style.transform = 'scaleX(0.1)';
    progressBar.style.transformOrigin = 'left';
    
    // Animate progress
    let progress = 0.1;
    clearInterval(loadingProgressTimer);
    loadingProgressTimer = setInterval(() => {
      progress += Math.random() * 0.3;
      if (progress > 0.95) progress = 0.95;
      progressBar.style.transform = `scaleX(${progress})`;
    }, 200);
  }
}

function hideLoadingProgress() {
  const progressBar = document.getElementById('loadingProgressBar');
  if (progressBar && currentState.isLoading) {
    currentState.isLoading = false;
    clearInterval(loadingProgressTimer);
    
    // Complete the progress
    progressBar.style.transform = 'scaleX(1)';
    
    setTimeout(() => {
      progressBar.classList.remove('show');
      progressBar.classList.add('hide');
      setTimeout(() => {
        progressBar.style.transform = 'scaleX(0)';
        progressBar.style.transformOrigin = 'right';
        progressBar.classList.remove('hide');
      }, 300);
    }, 200);
  }
}

// Enhanced Notification System
function showNotification(message, type = 'info', duration = 4000) {
  const container = document.getElementById('notificationContainer');
  if (!container) {
    console.warn('Notification container not found');
    return;
  }
  
  if (!message) {
    console.warn('No message provided for notification');
    return;
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type} p-4 mb-3 max-w-sm`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  
  notification.innerHTML = `
    <div class="flex items-center space-x-3">
      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
        ${icon}
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium text-github-fg-default">${message}</p>
      </div>
      <button onclick="this.closest('.notification').remove()" class="text-github-fg-muted hover:text-github-fg-default">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
        </svg>
      </button>
    </div>
  `;
  
  container.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Auto remove
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 400);
  }, duration);
  
  return notification;
}

function showSuccessMessage(message) {
  showNotification(message, 'success');
}

function showErrorMessage(message) {
  showNotification(message, 'error');
}

// Enhanced Top Navigation Management
function updateTopNavigation() {
  const currentRepoNameNav = document.getElementById('currentRepoNameNav');
  const repoCountBadge = document.getElementById('repoCountBadge');
  const recentFilesCount = document.getElementById('recentFilesCount');
  const statsText = document.getElementById('statsText');
  
  if (currentRepoNameNav) {
    if (currentState.repository) {
      currentRepoNameNav.textContent = currentState.repository;
    } else {
      currentRepoNameNav.textContent = 'Repositories';
    }
  }
  
  if (repoCountBadge) {
    const repoCount = currentState.repositories.length;
    repoCountBadge.textContent = repoCount;
    if (repoCount > 0) {
      repoCountBadge.classList.remove('hidden');
    } else {
      repoCountBadge.classList.add('hidden');
    }
  }
  
  // Update recent files count
  const recentFiles = getRecentFiles();
  if (recentFilesCount) {
    recentFilesCount.textContent = recentFiles.length;
  }
  
  // Update stats
  if (statsText) {
    let statsMessage = '0 files';
    if (currentState.navState === 'repositories') {
      statsMessage = `${currentState.repositories.length} repositories`;
    } else if (currentState.navState === 'explorer' && currentState.files) {
      const fileCount = currentState.files.filter(f => f.type === 'file').length;
      const folderCount = currentState.files.filter(f => f.type === 'folder').length;
      statsMessage = `${fileCount} files, ${folderCount} folders`;
    } else if (currentState.navState === 'viewer' && currentState.currentFile) {
      statsMessage = `Viewing: ${currentState.currentFile.name}`;
    }
    statsText.textContent = statsMessage;
  }
}

// Enhanced Dropdown Management
function showQuickActionsDropdown() {
  hideAllDropdowns();
  const dropdown = document.getElementById('quickActionsDropdown');
  const icon = document.getElementById('quickActionsIcon');
  
  if (dropdown) {
    dropdown.classList.add('show');
    if (icon) icon.style.transform = 'rotate(180deg)';
  }
}

function hideQuickActionsDropdown() {
  const dropdown = document.getElementById('quickActionsDropdown');
  const icon = document.getElementById('quickActionsIcon');
  
  if (dropdown) {
    dropdown.classList.remove('show');
    if (icon) icon.style.transform = 'rotate(0deg)';
  }
}

function showRecentFilesDropdown() {
  hideAllDropdowns();
  const dropdown = document.getElementById('recentFilesDropdown');
  
  if (dropdown) {
    updateRecentFilesUI();
    dropdown.classList.add('show');
  }
}

function hideRecentFilesDropdown() {
  const dropdown = document.getElementById('recentFilesDropdown');
  if (dropdown) {
    dropdown.classList.remove('show');
  }
}

function hideAllDropdowns() {
  hideQuickActionsDropdown();
  hideRecentFilesDropdown();
}

// Enhanced State Management with Loading
function startPageTransition() {
  showLoadingProgress();
  // Add any page transition effects here
}

function completePageTransition() {
  hideLoadingProgress();
  updateTopNavigation();
  // Complete any page transition effects here
}

// Local Storage Manager (keeping existing functionality)
const LocalStorageManager = {
  getRepositories: function() {
    return JSON.parse(localStorage.getItem('gitcodr_repositories') || '[]');
  },

  saveRepositories: function(repositories) {
    localStorage.setItem('gitcodr_repositories', JSON.stringify(repositories));
  },

  getRepository: function(repoName) {
    const repos = this.getRepositories();
    return repos.find(r => r.name === repoName);
  },

  saveRepository: function(repo) {
    const repos = this.getRepositories();
    const index = repos.findIndex(r => r.name === repo.name);
    if (index !== -1) {
      repos[index] = repo;
    } else {
      repos.push(repo);
    }
    this.saveRepositories(repos);
  },

  deleteRepository: function(repoName) {
    const repos = this.getRepositories();
    const filtered = repos.filter(r => r.name !== repoName);
    this.saveRepositories(filtered);
    localStorage.removeItem(`gitcodr_repo_${repoName}`);
  },

  getRepositoryFiles: function(repoName) {
    const key = `gitcodr_repo_${repoName}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  },

  saveRepositoryFiles: function(repoName, files) {
    const key = `gitcodr_repo_${repoName}`;
    localStorage.setItem(key, JSON.stringify(files));
  },

  getFile: function(repoName, filePath) {
    const repoData = this.getRepositoryFiles(repoName);
    return repoData[filePath] || null;
  },

  saveFile: function(repoName, filePath, fileData) {
    const repoData = this.getRepositoryFiles(repoName);
    repoData[filePath] = fileData;
    this.saveRepositoryFiles(repoName, repoData);
  },

  deleteFile: function(repoName, filePath) {
    const repoData = this.getRepositoryFiles(repoName);
    delete repoData[filePath];
    this.saveRepositoryFiles(repoName, repoData);
  },

  listFiles: function(repoName, pathPrefix = '') {
    const repoData = this.getRepositoryFiles(repoName);
    const files = [];
    const folders = new Set();

    Object.keys(repoData).forEach(filePath => {
      if (filePath.startsWith(pathPrefix)) {
        const relativePath = filePath.substring(pathPrefix.length);
        const parts = relativePath.split('/');
        
        if (parts.length === 1 && parts[0]) {
          files.push({
            name: parts[0],
            type: 'file',
            path: filePath,
            ...repoData[filePath]
          });
        } else if (parts.length > 1 && parts[0]) {
          folders.add(parts[0]);
        }
      }
    });

    folders.forEach(folderName => {
      files.push({
        name: folderName,
        type: 'folder',
        path: pathPrefix + folderName + '/',
        lastModified: Date.now(),
        lastCommit: 'Folder'
      });
    });

    return files.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }
};

// Recent Files Management
function getRecentFiles() {
  return JSON.parse(localStorage.getItem('gitcodr_recent_files') || '[]');
}

function addToRecentFiles(fileName, repoName, filePath) {
  const recentFiles = getRecentFiles();
  const fileInfo = {
    name: fileName,
    repository: repoName,
    path: filePath,
    timestamp: Date.now()
  };
  
  // Remove existing entry if it exists
  const existingIndex = recentFiles.findIndex(f => 
    f.repository === repoName && f.path === filePath
  );
  
  if (existingIndex !== -1) {
    recentFiles.splice(existingIndex, 1);
  }
  
  // Add to beginning
  recentFiles.unshift(fileInfo);
  
  // Keep only last 10 files
  const trimmed = recentFiles.slice(0, 10);
  
  localStorage.setItem('gitcodr_recent_files', JSON.stringify(trimmed));
  updateRecentFilesUI();
}

function updateRecentFilesUI() {
  const recentFilesList = document.getElementById('recentFilesList');
  const recentFiles = getRecentFiles();
  
  if (!recentFilesList) return;
  
  if (recentFiles.length === 0) {
    recentFilesList.innerHTML = `
      <div class="text-center py-8 text-github-fg-muted">
        <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
        </svg>
        <p class="text-sm">No recent files</p>
      </div>
    `;
  } else {
    recentFilesList.innerHTML = recentFiles.map(file => `
      <div class="flex items-center justify-between p-2 rounded-lg hover:bg-github-canvas-subtle/50 transition-colors cursor-pointer" 
           onclick="openRecentFile('${file.repository}', '${file.path}')">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <div class="flex-shrink-0">
            ${getFileIcon(file.name, 'file')}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-github-fg-default truncate">${file.name}</p>
            <p class="text-xs text-github-fg-muted truncate">${file.repository}</p>
          </div>
        </div>
        <div class="text-xs text-github-fg-muted">
          ${formatDate(file.timestamp)}
        </div>
      </div>
    `).join('');
  }
}

function openRecentFile(repoName, filePath) {
  hideAllDropdowns();
  startPageTransition();
  
  currentState.repository = repoName;
  
  // Parse path to determine directory and file
  const pathParts = filePath.split('/');
  const fileName = pathParts.pop();
  currentState.path = pathParts.join('/');
  
  setTimeout(() => {
    const fileData = LocalStorageManager.getFile(repoName, filePath);
    if (fileData) {
      currentState.currentFile = {
        name: fileName,
        type: 'file',
        path: filePath,
        ...fileData
      };
      currentState.navState = 'viewer';
      displayFileContent(fileName, fileData);
      showFileViewer();
    } else {
      showErrorMessage('File not found');
      showRepoSelector();
    }
    completePageTransition();
  }, 300);
}

// Utility Functions (keeping existing ones)
function isValidFilename(filename) {
  if (!filename || filename.length > 255) return false;
  if (/[<>:"|?*\\\/]/.test(filename)) return false;
  
  const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  const nameWithoutExt = filename.split('.')[0];
  if (reserved.includes(nameWithoutExt.toUpperCase())) return false;
  
  return true;
}

function formatFileSize(bytes) {
  if (typeof bytes !== 'number') return '0 KB';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'now';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
  if (diff < 604800000) return Math.floor(diff / 86400000) + ' days ago';
  
  return date.toLocaleDateString();
}

function getLanguageColor(ext) {
  const colors = {
    'html': '#e34c26', 'htm': '#e34c26', 'css': '#1572b6', 'js': '#f1e05a', 'javascript': '#f1e05a',
    'ts': '#2b7489', 'typescript': '#2b7489', 'md': '#083fa1', 'markdown': '#083fa1', 'json': '#f1e05a',
    'php': '#4f5d95', 'py': '#3572a5', 'python': '#3572a5', 'java': '#b07219', 'cpp': '#f34b7d',
    'c': '#555555', 'cs': '#239120', 'rb': '#701516', 'ruby': '#701516', 'go': '#00add8',
    'rs': '#dea584', 'rust': '#dea584', 'yml': '#cb171e', 'yaml': '#cb171e', 'xml': '#0060ac',
    'sql': '#e38c00'
  };
  return colors[ext] || '#7d8590';
}

function getLanguageName(ext) {
  const languages = {
    'html': 'HTML', 'htm': 'HTML', 'css': 'CSS', 'js': 'JavaScript', 'javascript': 'JavaScript',
    'ts': 'TypeScript', 'typescript': 'TypeScript', 'json': 'JSON', 'md': 'Markdown', 'markdown': 'Markdown',
    'php': 'PHP', 'py': 'Python', 'python': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C',
    'cs': 'C#', 'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'yml': 'YAML', 'yaml': 'YAML', 'xml': 'XML',
    'sql': 'SQL'
  };
  return languages[ext] || 'Text';
}

function getFileIcon(filename, type) {
  if (type === 'folder') {
    return `<svg class="w-4 h-4 text-github-accent-fg" fill="currentColor" viewBox="0 0 16 16"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"/></svg>`;
  }
  
  const ext = filename.split('.').pop().toLowerCase();
  const iconColor = getLanguageColor(ext);
  
  return `<svg class="w-4 h-4" style="color: ${iconColor}" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>`;
}

// Navigation Functions with Enhanced Loading
function showRepoSelector() {
  startPageTransition();
  currentState.navState = 'repositories';
  
  setTimeout(() => {
    document.getElementById('explorerView').classList.add('hidden');
    document.getElementById('fileViewer').classList.add('hidden');
    document.getElementById('fileEditor').classList.add('hidden');
    document.getElementById('repoSelectorView').classList.remove('hidden');
    
    loadRepositories(); // Refresh repository list
    completePageTransition();
  }, 300);
}

function showExplorer() {
  if (currentState.repository) {
    startPageTransition();
    currentState.navState = 'explorer';
    
    setTimeout(() => {
      document.getElementById('fileViewer').classList.add('hidden');
      document.getElementById('fileEditor').classList.add('hidden');
      document.getElementById('repoSelectorView').classList.add('hidden');
      document.getElementById('explorerView').classList.remove('hidden');
      
      completePageTransition();
    }, 300);
  }
}

function showFileViewer() {
  if (currentState.currentFile) {
    startPageTransition();
    currentState.navState = 'viewer';
    
    setTimeout(() => {
      document.getElementById('explorerView').classList.add('hidden');
      document.getElementById('repoSelectorView').classList.add('hidden');
      document.getElementById('fileEditor').classList.add('hidden');
      document.getElementById('fileViewer').classList.remove('hidden');
      
      completePageTransition();
    }, 300);
  }
}

function showFileEditor() {
  if (currentState.currentFile) {
    startPageTransition();
    currentState.navState = 'editor';
    
    setTimeout(() => {
      document.getElementById('explorerView').classList.add('hidden');
      document.getElementById('repoSelectorView').classList.add('hidden');
      document.getElementById('fileViewer').classList.add('hidden');
      document.getElementById('fileEditor').classList.remove('hidden');
      
      setupCodeEditor();
      completePageTransition();
    }, 300);
  }
}

// Enhanced Repository Management
function loadRepositories() {
  try {
    currentState.repositories = LocalStorageManager.getRepositories();
    renderRepositories();
    updateTopNavigation();
  } catch (error) {
    showErrorMessage('Failed to load repositories: ' + error.message);
  }
}

function renderRepositories() {
  const grid = document.getElementById('repositoriesGrid');
  const emptyState = document.getElementById('emptyRepositories');
  
  if (!grid || !emptyState) return;
  
  if (currentState.repositories.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
  } else {
    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    grid.innerHTML = currentState.repositories.map(repo => `
      <div class="repo-card bg-github-canvas-overlay rounded-xl p-6 cursor-pointer transition-all duration-300 animate-fade-in-up" 
           onclick="openRepository('${repo.name}')">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-github-accent-fg to-purple-500 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-github-fg-default text-lg">${repo.name}</h3>
              <p class="text-github-fg-muted text-sm">Updated ${formatDate(repo.lastModified)}</p>
            </div>
          </div>
          <div class="relative">
            <button onclick="event.stopPropagation(); showRepoOptions('${repo.name}')" 
                    class="p-2 text-github-fg-muted hover:text-github-fg-default hover:bg-github-canvas-subtle rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <p class="text-github-fg-muted text-sm mb-4 line-clamp-2">
          ${repo.description || 'No description provided.'}
        </p>
        
        ${repo.tags && repo.tags.length > 0 ? `
          <div class="flex flex-wrap gap-2 mb-4">
            ${repo.tags.slice(0, 3).map(tag => `
              <span class="tag px-2 py-1 rounded-full text-xs">${tag}</span>
            `).join('')}
            ${repo.tags.length > 3 ? `<span class="text-xs text-github-fg-muted">+${repo.tags.length - 3} more</span>` : ''}
          </div>
        ` : ''}
        
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center space-x-4 text-github-fg-muted">
            <span class="flex items-center space-x-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
              </svg>
              <span>${getFileCount(repo.name)} files</span>
            </span>
            <span class="flex items-center space-x-1">
              <div class="w-2 h-2 rounded-full bg-github-success-fg"></div>
              <span>Active</span>
            </span>
          </div>
          <span class="text-github-accent-fg font-medium">Open →</span>
        </div>
      </div>
    `).join('');
  }
}

function getFileCount(repoName) {
  try {
    const files = LocalStorageManager.getRepositoryFiles(repoName);
    return Object.keys(files).length;
  } catch (error) {
    return 0;
  }
}

// Enhanced File Operations
function viewFile(filename) {
  const file = currentState.files.find(f => f.name === filename);
  if (!file) return;
  
  currentState.currentFile = file;
  startPageTransition();
  
  if (file.type === 'folder') {
    currentState.path += (currentState.path ? '/' : '') + filename;
    
    setTimeout(() => {
      try {
        const pathPrefix = currentState.path ? currentState.path + '/' : '';
        currentState.files = LocalStorageManager.listFiles(currentState.repository, pathPrefix);
        renderFileList();
        updateBreadcrumb();
        completePageTransition();
      } catch (error) {
        showErrorMessage('Failed to load directory: ' + error.message);
        completePageTransition();
      }
    }, 300);
  } else {
    setTimeout(() => {
      try {
        const filePath = (currentState.path ? currentState.path + '/' : '') + filename;
        const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
        
        if (fileData) {
          // Add to recent files
          addToRecentFiles(filename, currentState.repository, filePath);
          
          displayFileContent(filename, fileData);
          showFileViewer();
          completePageTransition();
        } else {
          throw new Error('File not found');
        }
      } catch (error) {
        showErrorMessage('Failed to load file: ' + error.message);
        completePageTransition();
      }
    }, 300);
  }
}

// Repository Operations
function openRepository(repoName) {
  startPageTransition();
  
  currentState.repository = repoName;
  currentState.path = '';
  
  setTimeout(() => {
    try {
      currentState.files = LocalStorageManager.listFiles(repoName, '');
      renderFileList();
      updateBreadcrumb();
      
      // Update repository info in UI
      const elements = {
        currentRepoName: document.getElementById('currentRepoName'),
        repoNameInViewer: document.getElementById('repoNameInViewer'),
        repoNameInEditor: document.getElementById('repoNameInEditor')
      };
      
      Object.values(elements).forEach(el => {
        if (el) el.textContent = repoName;
      });
      
      const repo = LocalStorageManager.getRepository(repoName);
      if (repo) {
        const repoDescription = document.getElementById('repoDescription');
        if (repoDescription) repoDescription.textContent = repo.description || 'No description provided.';
      }
      
      showExplorer();
      completePageTransition();
    } catch (error) {
      showErrorMessage('Failed to open repository: ' + error.message);
      completePageTransition();
    }
  }, 500);
}

function navigateToRoot() {
  if (!currentState.repository) return;
  
  startPageTransition();
  currentState.path = '';
  
  setTimeout(() => {
    try {
      currentState.files = LocalStorageManager.listFiles(currentState.repository, '');
      renderFileList();
      updateBreadcrumb();
      showExplorer();
      completePageTransition();
    } catch (error) {
      showErrorMessage('Failed to navigate to root: ' + error.message);
      completePageTransition();
    }
  }, 300);
}

function navigateToPath(path) {
  if (!currentState.repository) return;
  
  startPageTransition();
  currentState.path = path;
  
  setTimeout(() => {
    try {
      const pathPrefix = path ? path + '/' : '';
      currentState.files = LocalStorageManager.listFiles(currentState.repository, pathPrefix);
      renderFileList();
      updateBreadcrumb();
      showExplorer();
      completePageTransition();
    } catch (error) {
      showErrorMessage('Failed to navigate to path: ' + error.message);
      completePageTransition();
    }
  }, 300);
}

// Enhanced File List Rendering
function renderFileList() {
  const fileList = document.getElementById('fileList');
  const emptyState = document.getElementById('emptyFileList');
  
  if (!fileList || !emptyState) return;
  
  if (currentState.files.length === 0) {
    fileList.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    
    fileList.innerHTML = currentState.files.map(file => `
      <tr class="file-list-item group hover:bg-github-canvas-subtle/30 transition-all duration-200">
        <td class="px-6 py-4">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              ${getFileIcon(file.name, file.type)}
            </div>
            <div class="min-w-0 flex-1">
              <button onclick="viewFile('${file.name}')" 
                      class="file-name-link text-left font-medium text-github-fg-default hover:text-github-accent-fg transition-colors">
                ${file.name}
              </button>
              ${file.type === 'file' ? `
                <p class="text-xs text-github-fg-muted mt-0.5">
                  ${getLanguageName(file.name.split('.').pop())} • ${formatFileSize(file.size || 0)}
                </p>
              ` : ''}
            </div>
          </div>
        </td>
        <td class="px-6 py-4 text-sm text-github-fg-muted hidden lg:table-cell">
          ${file.lastCommit || 'Initial commit'}
        </td>
        <td class="px-6 py-4 text-sm text-github-fg-muted hidden md:table-cell">
          ${formatDate(file.lastModified)}
        </td>
        <td class="px-6 py-4 text-sm text-github-fg-muted hidden sm:table-cell">
          ${file.type === 'file' ? formatFileSize(file.size || 0) : '—'}
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex items-center justify-end space-x-2">
            ${file.type === 'file' ? `
              <button onclick="editFileFromList('${file.name}')" 
                      class="p-1.5 text-github-fg-muted hover:text-github-fg-default hover:bg-github-canvas-subtle rounded transition-colors"
                      title="Edit file">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"/>
                </svg>
              </button>
              <button onclick="downloadFileFromList('${file.name}')" 
                      class="p-1.5 text-github-fg-muted hover:text-github-fg-default hover:bg-github-canvas-subtle rounded transition-colors"
                      title="Download file">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
              </button>
              <button onclick="showDeleteFileModal('${file.name}')" 
                      class="p-1.5 text-github-fg-muted hover:text-github-danger-fg hover:bg-red-500/10 rounded transition-colors"
                      title="Delete file">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1Z"/>
                </svg>
              </button>
            ` : `
              <button onclick="viewFile('${file.name}')" 
                      class="px-3 py-1.5 text-xs font-medium text-github-accent-fg hover:bg-github-accent-emphasis/20 rounded transition-colors">
                Open
              </button>
            `}
          </div>
        </td>
      </tr>
    `).join('');
  }
}

function updateBreadcrumb() {
  const breadcrumb = document.getElementById('pathBreadcrumb');
  if (!breadcrumb) return;
  
  let html = `
    <a href="#" onclick="showRepoSelector()" class="text-github-accent-fg hover:underline font-medium transition-colors">Repositories</a>
    <span class="text-github-fg-muted mx-2">/</span>
    <a href="#" onclick="navigateToRoot()" class="text-github-accent-fg hover:underline font-medium transition-colors">${currentState.repository}</a>
  `;
  
  if (currentState.path) {
    const segments = currentState.path.split('/');
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += (currentPath ? '/' : '') + segment;
      html += `
        <span class="text-github-fg-muted mx-2">/</span>
        <a href="#" onclick="navigateToPath('${currentPath}')" class="text-github-accent-fg hover:underline font-medium transition-colors">${segment}</a>
      `;
    });
  }
  
  breadcrumb.innerHTML = html;
}

// File Content Display
function displayFileContent(fileName, fileData) {
  const currentFileName = document.getElementById('currentFileName');
  const repoNameInViewer = document.getElementById('repoNameInViewer');
  const fileSizeDisplay = document.getElementById('fileSizeDisplay');
  const fileLanguageDisplay = document.getElementById('fileLanguageDisplay');
  const lineCount = document.getElementById('lineCount');
  const charCount = document.getElementById('charCount');
  const lineNumbers = document.getElementById('lineNumbers');
  const codeDisplay = document.getElementById('codeDisplay');
  
  if (currentFileName) currentFileName.textContent = fileName;
  if (repoNameInViewer) repoNameInViewer.textContent = currentState.repository;
  if (fileSizeDisplay) fileSizeDisplay.textContent = formatFileSize(fileData.size || 0);
  
  const ext = fileName.split('.').pop().toLowerCase();
  const language = getLanguageName(ext);
  if (fileLanguageDisplay) fileLanguageDisplay.textContent = language;
  
  const content = fileData.content || '';
  const lines = content.split('\n');
  
  if (lineCount) lineCount.textContent = `${lines.length} lines`;
  if (charCount) charCount.textContent = `${content.length} characters`;
  
  // Generate line numbers
  if (lineNumbers) {
    lineNumbers.innerHTML = lines.map((_, index) => 
      `<div>${index + 1}</div>`
    ).join('');
  }
  
  // Display code with syntax highlighting
  if (codeDisplay) {
    codeDisplay.innerHTML = '';
    codeDisplay.className = `language-${getLanguageForPrism(ext)}`;
    codeDisplay.textContent = content;
    
    // Apply syntax highlighting if Prism is available
    if (typeof Prism !== 'undefined') {
      Prism.highlightElement(codeDisplay);
    }
  }
}

function getLanguageForPrism(ext) {
  const mapping = {
    'js': 'javascript',
    'ts': 'typescript',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'py': 'python',
    'php': 'php',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': 'json',
    'md': 'markdown',
    'xml': 'xml',
    'sql': 'sql'
  };
  return mapping[ext] || 'text';
}

// File Editor Functions
function editFile() {
  if (!currentState.currentFile) return;
  showFileEditor();
}

function editFileFromList(fileName) {
  const file = currentState.files.find(f => f.name === fileName);
  if (file && file.type === 'file') {
    currentState.currentFile = file;
    const filePath = (currentState.path ? currentState.path + '/' : '') + fileName;
    const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
    
    if (fileData) {
      currentState.currentFile = { ...file, ...fileData };
      showFileEditor();
    } else {
      showErrorMessage('File not found');
    }
  }
}

function setupCodeEditor() {
  const editorContainer = document.getElementById('editorContainer');
  const initialContentEditor = document.getElementById('initialContentEditor');
  
  if (!editorContainer || !initialContentEditor || !currentState.currentFile) return;
  
  const filePath = currentState.currentFile.path || 
    (currentState.path ? currentState.path + '/' : '') + currentState.currentFile.name;
  const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
  
  initialContentEditor.value = fileData?.content || '';
  
  // Update file name in editor
  const currentFileNameEditor = document.getElementById('currentFileNameEditor');
  const repoNameInEditor = document.getElementById('repoNameInEditor');
  
  if (currentFileNameEditor) currentFileNameEditor.textContent = currentState.currentFile.name;
  if (repoNameInEditor) repoNameInEditor.textContent = currentState.repository;
  
  // Initialize CodeMirror if available
  if (typeof CodeMirror !== 'undefined') {
    if (codeEditor) {
      codeEditor.toTextArea();
    }
    
    const ext = currentState.currentFile.name.split('.').pop().toLowerCase();
    const mode = getCodeMirrorMode(ext);
    
    codeEditor = CodeMirror.fromTextArea(initialContentEditor, {
      mode: mode,
      theme: 'material-darker',
      lineNumbers: true,
      lineWrapping: false,
      autoCloseBrackets: true,
      matchBrackets: true,
      styleActiveLine: true,
      indentUnit: 2,
      tabSize: 2,
      extraKeys: {
        'Ctrl-S': saveFile,
        'Cmd-S': saveFile,
        'Ctrl-/': 'toggleComment',
        'Cmd-/': 'toggleComment',
        'F11': function(cm) {
          cm.setOption('fullScreen', !cm.getOption('fullScreen'));
        },
        'Esc': function(cm) {
          if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
        }
      }
    });
    
    // Update line count and cursor position
    codeEditor.on('change', updateEditorStats);
    codeEditor.on('cursorActivity', updateCursorPosition);
    
    updateEditorStats();
    updateCursorPosition();
  }
}

function getCodeMirrorMode(ext) {
  const modes = {
    'js': 'javascript',
    'javascript': 'javascript',
    'ts': 'javascript',
    'typescript': 'javascript',
    'html': 'htmlmixed',
    'htm': 'htmlmixed',
    'xml': 'xml',
    'css': 'css',
    'scss': 'css',
    'sass': 'css',
    'py': 'python',
    'python': 'python',
    'php': 'php',
    'java': 'text/x-java',
    'c': 'text/x-csrc',
    'cpp': 'text/x-c++src',
    'cs': 'text/x-csharp',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': { name: 'javascript', json: true },
    'md': 'markdown',
    'sql': 'sql'
  };
  return modes[ext] || 'text';
}

function updateEditorStats() {
  if (!codeEditor) return;
  
  const lineCount = codeEditor.lineCount();
  const editorLineCount = document.getElementById('editorLineCount');
  
  if (editorLineCount) {
    editorLineCount.textContent = `${lineCount} lines`;
  }
}

function updateCursorPosition() {
  if (!codeEditor) return;
  
  const cursor = codeEditor.getCursor();
  const cursorPosition = document.getElementById('cursorPosition');
  
  if (cursorPosition) {
    cursorPosition.textContent = `Ln ${cursor.line + 1}, Col ${cursor.ch + 1}`;
  }
}

function saveFile() {
  if (!currentState.currentFile || !currentState.repository) {
    showErrorMessage('No file to save');
    return;
  }
  
  try {
    let content = '';
    
    if (codeEditor) {
      content = codeEditor.getValue();
    } else {
      const textarea = document.getElementById('initialContentEditor');
      content = textarea ? textarea.value : '';
    }
    
    const filePath = currentState.currentFile.path || 
      (currentState.path ? currentState.path + '/' : '') + currentState.currentFile.name;
    
    const fileData = {
      content: content,
      size: new Blob([content]).size,
      lastModified: Date.now(),
      type: 'file'
    };
    
    LocalStorageManager.saveFile(currentState.repository, filePath, fileData);
    
    showSuccessMessage('File saved successfully');
    
    // Update current file data
    currentState.currentFile = {
      ...currentState.currentFile,
      ...fileData
    };
    
  } catch (error) {
    showErrorMessage('Failed to save file: ' + error.message);
  }
}

function cancelEdit() {
  if (currentState.currentFile) {
    showFileViewer();
  } else {
    showExplorer();
  }
}

// Download Functions
function downloadFile() {
  if (!currentState.currentFile) return;
  downloadFileData(currentState.currentFile.name, currentState.currentFile.content || '');
}

function downloadFileFromList(fileName) {
  const file = currentState.files.find(f => f.name === fileName);
  if (file && file.type === 'file') {
    const filePath = (currentState.path ? currentState.path + '/' : '') + fileName;
    const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
    
    if (fileData) {
      downloadFileData(fileName, fileData.content || '');
    }
  }
}

function downloadFileData(fileName, content) {
  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccessMessage(`Downloaded ${fileName}`);
  } catch (error) {
    showErrorMessage('Failed to download file: ' + error.message);
  }
}

// Modal Functions
function showCreateRepoModal() {
  const modal = document.getElementById('createRepoModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Clear form
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // Focus first input
    const firstInput = modal.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }
}

function hideCreateRepoModal() {
  const modal = document.getElementById('createRepoModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function showCreateFileModal() {
  if (!currentState.repository) {
    showErrorMessage('Please select a repository first');
    return;
  }
  
  const modal = document.getElementById('createFileModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Clear form
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // Focus first input
    const firstInput = modal.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }
}

function hideCreateFileModal() {
  const modal = document.getElementById('createFileModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function showDeleteFileModal(fileName) {
  const modal = document.getElementById('deleteFileModal');
  const fileToDeleteName = document.getElementById('fileToDeleteName');
  
  if (modal && fileToDeleteName) {
    fileToDeleteName.textContent = fileName;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.dataset.fileName = fileName;
  }
}

function hideDeleteFileModal() {
  const modal = document.getElementById('deleteFileModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function showDeleteRepoModal(repoName) {
  const modal = document.getElementById('deleteRepoModal');
  const repoToDeleteName = document.getElementById('repoToDeleteName');
  
  if (modal && repoToDeleteName) {
    repoToDeleteName.textContent = repoName;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.dataset.repoName = repoName;
  }
}

function hideDeleteRepoModal() {
  const modal = document.getElementById('deleteRepoModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Create Operations
function createRepository(event) {
  event.preventDefault();
  
  const repoNameEl = safeGetElement('repoName');
  const repoDescriptionEl = safeGetElement('repoDescription');
  const repoTagsEl = safeGetElement('repoTags');
  
  if (!repoNameEl || !repoDescriptionEl || !repoTagsEl) {
    console.error('Required form elements not found');
    alert('Form is not properly loaded. Please refresh the page and try again.');
    return;
  }
  
  const repoName = safeGetValue(repoNameEl);
  const repoDescription = safeGetValue(repoDescriptionEl);
  const repoTags = safeGetValue(repoTagsEl);
  
  if (!repoName) {
    showErrorMessage('Repository name is required');
    return;
  }
  
  if (!isValidFilename(repoName)) {
    showErrorMessage('Invalid repository name');
    return;
  }
  
  // Check if repository already exists
  const existing = LocalStorageManager.getRepository(repoName);
  if (existing) {
    showErrorMessage('Repository already exists');
    return;
  }
  
  try {
    const repo = {
      name: repoName,
      description: repoDescription,
      tags: repoTags ? repoTags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      created: Date.now(),
      lastModified: Date.now()
    };
    
    LocalStorageManager.saveRepository(repo);
    
    hideCreateRepoModal();
    showSuccessMessage(`Repository "${repoName}" created successfully`);
    
    // Refresh repository list
    loadRepositories();
    
  } catch (error) {
    showErrorMessage('Failed to create repository: ' + error.message);
  }
}

function createFile(event) {
  event.preventDefault();
  
  const fileNameEl = safeGetElement('fileName');
  const initialContentEl = safeGetElement('initialContent');
  
  if (!fileNameEl || !initialContentEl) {
    console.error('Required form elements not found');
    alert('Form is not properly loaded. Please refresh the page and try again.');
    return;
  }
  
  const fileName = safeGetValue(fileNameEl);
  const initialContent = safeGetValue(initialContentEl, '');
  
  if (!fileName) {
    showErrorMessage('File name is required');
    return;
  }
  
  if (!isValidFilename(fileName)) {
    showErrorMessage('Invalid file name');
    return;
  }
  
  try {
    const filePath = (currentState.path ? currentState.path + '/' : '') + fileName;
    
    // Check if file already exists
    const existing = LocalStorageManager.getFile(currentState.repository, filePath);
    if (existing) {
      showErrorMessage('File already exists');
      return;
    }
    
    const fileData = {
      content: initialContent,
      size: new Blob([initialContent]).size,
      lastModified: Date.now(),
      type: 'file'
    };
    
    LocalStorageManager.saveFile(currentState.repository, filePath, fileData);
    
    hideCreateFileModal();
    showSuccessMessage(`File "${fileName}" created successfully`);
    
    // Refresh file list
    const pathPrefix = currentState.path ? currentState.path + '/' : '';
    currentState.files = LocalStorageManager.listFiles(currentState.repository, pathPrefix);
    renderFileList();
    
  } catch (error) {
    showErrorMessage('Failed to create file: ' + error.message);
  }
}

// Delete Operations
function confirmDeleteFile() {
  const modal = document.getElementById('deleteFileModal');
  const fileName = modal?.dataset?.fileName;
  
  if (!fileName) return;
  
  try {
    const filePath = (currentState.path ? currentState.path + '/' : '') + fileName;
    LocalStorageManager.deleteFile(currentState.repository, filePath);
    
    hideDeleteFileModal();
    showSuccessMessage(`File "${fileName}" deleted successfully`);
    
    // Refresh file list
    const pathPrefix = currentState.path ? currentState.path + '/' : '';
    currentState.files = LocalStorageManager.listFiles(currentState.repository, pathPrefix);
    renderFileList();
    
    // If we're viewing the deleted file, go back to explorer
    if (currentState.currentFile && currentState.currentFile.name === fileName) {
      currentState.currentFile = null;
      showExplorer();
    }
    
  } catch (error) {
    showErrorMessage('Failed to delete file: ' + error.message);
  }
}

function confirmDeleteRepository() {
  const modal = document.getElementById('deleteRepoModal');
  const repoName = modal?.dataset?.repoName;
  
  if (!repoName) return;
  
  try {
    LocalStorageManager.deleteRepository(repoName);
    
    hideDeleteRepoModal();
    showSuccessMessage(`Repository "${repoName}" deleted successfully`);
    
    // If we're in the deleted repository, go back to repository list
    if (currentState.repository === repoName) {
      currentState.repository = null;
      currentState.currentFile = null;
      currentState.path = '';
      showRepoSelector();
    }
    
    // Refresh repository list
    loadRepositories();
    
  } catch (error) {
    showErrorMessage('Failed to delete repository: ' + error.message);
  }
}

// Theme Toggle
function toggleTheme() {
  const html = document.documentElement;
  const themeIcon = document.getElementById('themeIcon');
  
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    if (themeIcon) {
      themeIcon.innerHTML = `<path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>`;
    }
    showNotification('Switched to light theme', 'info');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    if (themeIcon) {
      themeIcon.innerHTML = `<path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>`;
    }
    showNotification('Switched to dark theme', 'info');
  }
}

// Event Listeners Setup
function setupTopNavEventListeners() {
  // Quick Actions
  const quickActionsBtn = document.getElementById('quickActionsBtn');
  if (quickActionsBtn) {
    quickActionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = document.getElementById('quickActionsDropdown');
      if (dropdown && dropdown.classList.contains('show')) {
        hideQuickActionsDropdown();
      } else {
        showQuickActionsDropdown();
      }
    });
  }
  
  // Recent Files
  const recentFilesBtn = document.getElementById('recentFilesBtn');
  if (recentFilesBtn) {
    recentFilesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = document.getElementById('recentFilesDropdown');
      if (dropdown && dropdown.classList.contains('show')) {
        hideRecentFilesDropdown();
      } else {
        showRecentFilesDropdown();
      }
    });
  }
  
  // Repository Selector
  const repoSelectorBtn = document.getElementById('repoSelectorBtn');
  if (repoSelectorBtn) {
    repoSelectorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showRepoSelector();
    });
  }
  
  // Search Button
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // TODO: Implement search functionality
      showNotification('Search functionality coming soon!', 'info');
    });
  }
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#quickActionsDropdown') && !e.target.closest('#quickActionsBtn')) {
      hideQuickActionsDropdown();
    }
    if (!e.target.closest('#recentFilesDropdown') && !e.target.closest('#recentFilesBtn')) {
      hideRecentFilesDropdown();
    }
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      showNotification('Search functionality coming soon!', 'info');
    }
    
    // Escape to close modals and dropdowns
    if (e.key === 'Escape') {
      hideAllDropdowns();
      
      // Close modals
      const modals = document.querySelectorAll('[id$="Modal"]');
      modals.forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    }
    
    // Ctrl/Cmd + N for new file
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && currentState.repository) {
      e.preventDefault();
      showCreateFileModal();
    }
    
    // Ctrl/Cmd + Shift + N for new repository
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      showCreateRepoModal();
    }
  });
}

// Initialize Theme
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Application Initialization with Error Handling
function initializeApp() {
  try {
    initializeTheme();
    setupTopNavEventListeners();
    setupKeyboardShortcuts();
    
    // Load and display repositories
    loadRepositories();
    updateTopNavigation();
    updateRecentFilesUI();
    
    // Show welcome message
    setTimeout(() => {
      showSuccessMessage('Welcome to GitExplorer! Create your first repository to get started.');
    }, 1000);
    
    console.log('GitExplorer initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Fallback notification without showSuccessMessage
    setTimeout(() => {
      alert('GitExplorer loaded with basic functionality. Some features may be limited.');
    }, 1000);
  }
}

// Safe function declarations with error handling
function safeCreateRepository(event) {
  try {
    return createRepository(event);
  } catch (error) {
    console.error('Error in createRepository:', error);
    alert('Failed to create repository. Please check the form and try again.');
  }
}

function safeCreateFile(event) {
  try {
    return createFile(event);
  } catch (error) {
    console.error('Error in createFile:', error);
    alert('Failed to create file. Please check the form and try again.');
  }
}

function safeOpenRepository(repoName) {
  try {
    if (!repoName || typeof repoName !== 'string') {
      throw new Error('Invalid repository name');
    }
    return openRepository(repoName);
  } catch (error) {
    console.error('Error in openRepository:', error);
    alert('Failed to open repository: ' + repoName);
  }
}

function safeViewFile(fileName) {
  try {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid file name');
    }
    return viewFile(fileName);
  } catch (error) {
    console.error('Error in viewFile:', error);
    alert('Failed to open file: ' + fileName);
  }
}

// Update global exports with safe versions
window.createRepository = safeCreateRepository;
window.createFile = safeCreateFile;
window.openRepository = safeOpenRepository;
window.viewFile = safeViewFile;
window.confirmDeleteFile = confirmDeleteFile;
window.confirmDeleteRepository = confirmDeleteRepository;
window.editFile = editFile;
window.editFileFromList = editFileFromList;
window.downloadFile = downloadFile;
window.downloadFileFromList = downloadFileFromList;
window.saveFile = saveFile;
window.cancelEdit = cancelEdit;
window.showRepoSelector = showRepoSelector;
window.showExplorer = showExplorer;
window.showFileViewer = showFileViewer;
window.showFileEditor = showFileEditor;
window.navigateToRoot = navigateToRoot;
window.navigateToPath = navigateToPath;
window.openRecentFile = openRecentFile;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}