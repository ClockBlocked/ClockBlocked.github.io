let currentState = {
  repository: null,
  branch: 'main',
  path: '',
  currentFile: null,
  selectedTags: [],
  files: [],
  repositories: []
};

let codeEditor = null;
let initialContentEditor = null;
let terminalHistory = [];
let terminalIndex = 0;
let starredRepos = JSON.parse(localStorage.getItem('gitcodr_starred') || '[]');
let activityLog = JSON.parse(localStorage.getItem('gitcodr_activity') || '[]');

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
    this.logActivity('edit', repoName, filePath.split('/').pop());
  },
  deleteFile: function(repoName, filePath) {
    const repoData = this.getRepositoryFiles(repoName);
    delete repoData[filePath];
    this.saveRepositoryFiles(repoName, repoData);
    this.logActivity('delete', repoName, filePath.split('/').pop());
  },
  listFiles: function(repoName, pathPrefix = '') {
    const repoData = this.getRepositoryFiles(repoName);
    const files = [];
    const folders = new Set();
    Object.keys(repoData).forEach(filePath => {
      if (pathPrefix === '') {
        const parts = filePath.split('/');
        if (parts.length === 1) {
          files.push({
            name: parts[0],
            type: 'file',
            path: filePath,
            lastModified: repoData[filePath].lastModified || Date.now(),
            lastCommit: repoData[filePath].lastCommit || 'Initial commit',
            size: repoData[filePath].size || 0
          });
        } else if (parts.length > 1) {
          folders.add(parts[0]);
        }
      } else {
        if (filePath.startsWith(pathPrefix)) {
          const relativePath = filePath.substring(pathPrefix.length);
          const parts = relativePath.split('/');
          if (parts.length === 1 && parts[0]) {
            files.push({
              name: parts[0],
              type: 'file',
              path: filePath,
              lastModified: repoData[filePath].lastModified || Date.now(),
              lastCommit: repoData[filePath].lastCommit || 'Initial commit',
              size: repoData[filePath].size || 0
            });
          } else if (parts.length > 1 && parts[0]) {
            folders.add(parts[0]);
          }
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
  },
  logActivity: function(action, repo, file) {
    activityLog.unshift({
      action: action,
      repo: repo,
      file: file,
      timestamp: Date.now()
    });
    if (activityLog.length > 50) activityLog = activityLog.slice(0, 50);
    localStorage.setItem('gitcodr_activity', JSON.stringify(activityLog));
  }
};

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
    return `<svg class="w-4 h-4 file-icon-folder" fill="currentColor" viewBox="0 0 16 16"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"/></svg>`;
  }
  const ext = filename.split('.').pop().toLowerCase();
  const iconColor = getLanguageColor(ext);
  return `<svg class="w-4 h-4" style="color: ${iconColor}" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>`;
}
function updateSelectedTags() {
  const container = document.getElementById('selectedTags');
  if (!container) return;
  container.innerHTML = currentState.selectedTags.map(tag => `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-github-accent-emphasis/20 border border-github-accent-emphasis/30 text-github-accent-fg">
      ${tag}
      <button onclick="removeTag('${tag}')" class="ml-1.5 w-3.5 h-3.5 rounded-full hover:bg-github-accent-emphasis/30 flex items-center justify-center">
        <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 16 16"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>
      </button>
    </span>
  `).join('');
}
function updateBreadcrumb() {
  const breadcrumb = document.getElementById('pathBreadcrumb');
  if (!breadcrumb) return;
  let html = `
    <a href="#" onclick="showRepoSelector()" class="text-github-accent-fg hover:underline font-semibold">Repositories</a>
    <span class="text-github-fg-muted">/</span>
    <a href="#" onclick="navigateToRoot()" class="text-github-accent-fg hover:underline font-semibold">${currentState.repository}</a>
  `;
  if (currentState.path) {
    const segments = currentState.path.split('/');
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += (currentPath ? '/' : '') + segment;
      html += `
        <span class="text-github-fg-muted">/</span>
        <a href="#" onclick="navigateToPath('${currentPath}')" class="text-github-accent-fg hover:underline font-semibold">${segment}</a>
      `;
    });
  }
  breadcrumb.innerHTML = html;
}
function updateEditorMode(editor, fileName) {
  if (!editor || !fileName) return;
  const ext = fileName.split('.').pop().toLowerCase();
  const modeMap = {
    'js': 'javascript', 'javascript': 'javascript', 'ts': 'javascript', 'typescript': 'javascript',
    'html': 'htmlmixed', 'htm': 'htmlmixed', 'xml': 'xml', 'css': 'css', 'scss': 'css', 'sass': 'css',
    'less': 'css', 'json': 'javascript', 'py': 'python', 'python': 'python', 'php': 'php', 'sql': 'sql',
    'md': 'markdown', 'markdown': 'markdown', 'yml': 'yaml', 'yaml': 'yaml', 'rb': 'ruby', 'rs': 'rust',
    'go': 'go', 'java': 'clike', 'cpp': 'clike', 'c': 'clike', 'cs': 'clike'
  };
  const mode = modeMap[ext] || 'text';
  editor.setOption('mode', mode);
}
function updateCommitMessage() {
  if (!currentState.currentFile) return;
  const commitTitle = document.getElementById('commitTitle');
  if (commitTitle && !commitTitle.value.trim()) {
    commitTitle.value = `Update ${currentState.currentFile.name}`;
  }
}
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
function showLoading(text = 'Loading...') {
  const overlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');
  ProgressBar.show();
  if (overlay && loadingText) {
    loadingText.textContent = text;
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
  }
}
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  ProgressBar.hide();
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }
}
function showSuccessMessage(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-github-success-fg text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-down';
  notification.innerHTML = `<div class="flex items-center space-x-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg><span>${message}</span></div>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-in';
    setTimeout(() => notification.parentNode?.removeChild(notification), 300);
  }, 3000);
}
function showErrorMessage(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-github-danger-fg text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-down';
  notification.innerHTML = `<div class="flex items-center space-x-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16ZM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646Z"/></svg><span>${message}</span></div>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-in';
    setTimeout(() => notification.parentNode?.removeChild(notification), 300);
  }, 5000);
}
function hideContextMenu() {
  const menu = document.getElementById('contextMenu');
  if (menu) menu.remove();
}
function showContextMenu(x, y, fileName, fileType) {
  hideContextMenu();
  const menu = document.createElement('div');
  menu.id = 'contextMenu';
  menu.className = 'fixed bg-github-canvas-overlay border border-github-border-default rounded-lg shadow-2xl py-2 z-50 min-w-[160px]';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  let html = `<button onclick="viewFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/></svg><span>View</span></button>`;
  if (fileType === 'file') {
    html += `<button onclick="editFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"/></svg><span>Edit</span></button><button onclick="downloadFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/><path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/></svg><span>Download</span></button>`;
  }
  html += `<div class="border-t border-github-border-muted my-1"></div><button onclick="deleteFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-danger-fg hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.748 1.748 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/></svg><span>Delete</span></button>`;
  menu.innerHTML = html;
  document.body.appendChild(menu);
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) menu.style.left = `${x - rect.width}px`;
  if (rect.bottom > window.innerHeight) menu.style.top = `${y - rect.height}px`;
}
function showFileViewer() {
  document.getElementById('explorerView').classList.add('hidden');
  document.getElementById('fileEditor').classList.add('hidden');
  document.getElementById('repoSelectorView').classList.add('hidden');
  document.getElementById('fileViewer').classList.remove('hidden');
}
function showFileEditor() {
  document.getElementById('explorerView').classList.add('hidden');
  document.getElementById('fileViewer').classList.add('hidden');
  document.getElementById('repoSelectorView').classList.add('hidden');
  document.getElementById('fileEditor').classList.remove('hidden');
}
function showCreateRepoModal() {
  document.getElementById('createRepoModal').classList.remove('hidden');
  document.getElementById('createRepoModal').classList.add('flex');
  document.getElementById('newRepoName').focus();
}
function hideCreateRepoModal() {
  document.getElementById('createRepoModal').classList.add('hidden');
  document.getElementById('createRepoModal').classList.remove('flex');
  document.getElementById('newRepoName').value = '';
  document.getElementById('repoDescriptionInput').value = '';
  document.getElementById('visibilityPublic').checked = true;
  document.getElementById('initReadme').checked = true;
}
function showCreateFileModal() {
  document.getElementById('createFileModal').classList.remove('hidden');
  document.getElementById('createFileModal').classList.add('flex');
  document.getElementById('currentPathPrefix').textContent = currentState.repository + (currentState.path ? '/' + currentState.path : '') + '/';
  document.getElementById('newFileName').focus();
}
function hideCreateFileModal() {
  document.getElementById('createFileModal').classList.add('hidden');
  document.getElementById('createFileModal').classList.remove('flex');
  document.getElementById('newFileName').value = '';
  document.getElementById('fileCategoryInput').value = '';
  document.getElementById('tagInput').value = '';
  if (initialContentEditor) initialContentEditor.setValue('');
  currentState.selectedTags = [];
  updateSelectedTags();
}
function showDeleteFileModal() {
  if (!currentState.currentFile) return;
  document.getElementById('fileToDeleteName').textContent = currentState.currentFile.name;
  document.getElementById('deleteFileModal').classList.remove('hidden');
  document.getElementById('deleteFileModal').classList.add('flex');
}
function hideDeleteFileModal() {
  document.getElementById('deleteFileModal').classList.add('hidden');
  document.getElementById('deleteFileModal').classList.remove('flex');
}
function confirmDeleteFile() {
  deleteCurrentFile();
  hideDeleteFileModal();
}
function deleteCurrentFile() {
  if (!currentState.currentFile) return;
  showLoading(`Deleting file ${currentState.currentFile.name}...`);
  setTimeout(() => {
    try {
      const filePath = (currentState.path ? currentState.path + '/' : '') + currentState.currentFile.name;
      LocalStorageManager.deleteFile(currentState.repository, filePath);
      currentState.files = currentState.files.filter(f => f.name !== currentState.currentFile.name);
      renderFileList();
      hideDeleteFileModal();
      hideLoading();
      showSuccessMessage(`File "${currentState.currentFile.name}" deleted successfully!`);
      setTimeout(() => showExplorer(), 500);
    } catch (error) {
      hideLoading();
      showErrorMessage('Failed to delete file: ' + error.message);
    }
  }, 300);
}
function downloadCurrentFile() {
  if (!currentState.currentFile) return;
  try {
    const filePath = (currentState.path ? currentState.path + '/' : '') + currentState.currentFile.name;
    const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
    if (fileData && fileData.content) {
      const blob = new Blob([fileData.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentState.currentFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccessMessage(`File "${currentState.currentFile.name}" downloaded successfully!`);
    }
  } catch (error) {
    showErrorMessage('Failed to download file: ' + error.message);
  }
}
function createRepository() {
  const repoName = document.getElementById('newRepoName').value.trim();
  const description = document.getElementById('repoDescriptionInput').value.trim();
  const initReadme = document.getElementById('initReadme').checked;
  if (!repoName) {
    showErrorMessage('Please enter a repository name');
    return;
  }
  if (!isValidFilename(repoName)) {
    showErrorMessage('Invalid repository name. Please use only letters, numbers, hyphens and underscores.');
    return;
  }
  const existingRepo = LocalStorageManager.getRepository(repoName);
  if (existingRepo) {
    showErrorMessage('Repository already exists');
    return;
  }
  showLoading('Creating repository...');
  setTimeout(() => {
    try {
      const repo = {
        name: repoName,
        description: description,
        created: Date.now(),
        lastModified: Date.now(),
        defaultBranch: 'main',
        branches: ['main'],
        visibility: document.getElementById('visibilityPublic').checked ? 'public' : 'private'
      };
      LocalStorageManager.saveRepository(repo);
      if (initReadme) {
        const readmeContent = `# ${repoName}\n\n${description ? description + '\n\n' : ''}## Getting Started\n\nThis repository was created with GitHub Clone.\n`;
        const readmeData = {
          content: readmeContent,
          category: 'Documentation',
          tags: ['readme'],
          created: Date.now(),
          lastModified: Date.now(),
          lastCommit: 'Initial commit',
          size: new Blob([readmeContent]).size
        };
        LocalStorageManager.saveFile(repoName, 'README.md', readmeData);
        LocalStorageManager.logActivity('create', repoName, 'README.md');
      }
      currentState.repositories.push(repo);
      renderRepositoryList();
      hideCreateRepoModal();
      hideLoading();
      showSuccessMessage(`Repository "${repoName}" created successfully!`);
      createConfetti();
      setTimeout(() => openRepository(repoName), 500);
    } catch (error) {
      hideLoading();
      showErrorMessage('Failed to create repository: ' + error.message);
    }
  }, 300);
}
function deleteRepository(repoName) {
  if (!confirm(`Are you sure you want to delete the repository "${repoName}"? This action cannot be undone.`)) return;
  showLoading(`Deleting repository ${repoName}...`);
  setTimeout(() => {
    try {
      LocalStorageManager.deleteRepository(repoName);
      currentState.repositories = currentState.repositories.filter(r => r.name !== repoName);
      if (currentState.repository === repoName) {
        currentState.repository = null;
        showRepoSelector();
      }
      renderRepositoryList();
      hideLoading();
      showSuccessMessage(`Repository "${repoName}" deleted successfully!`);
    } catch (error) {
      hideLoading();
      showErrorMessage('Failed to delete repository: ' + error.message);
    }
  }, 300);
}
function createFile() {
  const fileName = document.getElementById('newFileName').value.trim();
  const category = document.getElementById('fileCategoryInput').value.trim() || 'General';
  const content = initialContentEditor ? initialContentEditor.getValue() : '';
  if (!fileName) {
    showErrorMessage('Please enter a file name');
    return;
  }
  if (!isValidFilename(fileName)) {
    showErrorMessage('Invalid file name. Please use only letters, numbers, dots, underscores and hyphens.');
    return;
  }
  showLoading('Creating file...');
  setTimeout(() => {
    try {
      const filePath = (currentState.path ? currentState.path + '/' : '') + fileName;
      const existingFile = LocalStorageManager.getFile(currentState.repository, filePath);
      if (existingFile) {
        hideLoading();
        showErrorMessage('File already exists');
        return;
      }
      const fileContent = content || `// ${fileName}\n// Created on ${new Date().toLocaleDateString()}\n\n`;
      const fileData = {
        content: fileContent,
        category: category,
        tags: currentState.selectedTags,
        created: Date.now(),
        lastModified: Date.now(),
        lastCommit: 'Initial commit',
        size: new Blob([fileContent]).size
      };
      LocalStorageManager.saveFile(currentState.repository, filePath, fileData);
      LocalStorageManager.logActivity('create', currentState.repository, fileName);
      currentState.files.push({
        name: fileName,
        type: 'file',
        path: filePath,
        lastModified: fileData.lastModified,
        lastCommit: fileData.lastCommit
      });
      renderFileList();
      hideCreateFileModal();
      hideLoading();
      showSuccessMessage(`File "${fileName}" created successfully!`);
      createParticles();
    } catch (error) {
      hideLoading();
      showErrorMessage('Failed to create file: ' + error.message);
    }
  }, 300);
}
function loadRepositories() {
  showLoading('Loading repositories...');
  setTimeout(() => {
    currentState.repositories = LocalStorageManager.getRepositories();
    renderRepositoryList();
    hideLoading();
    updateStarredUI();
  }, 500);
}
function renderRepositoryList() {
  const repoList = document.getElementById('repoList');
  if (!repoList) return;
  repoList.innerHTML = '';
  if (currentState.repositories.length === 0) {
    repoList.innerHTML = `<div class="col-span-full text-center py-12"><svg class="w-12 h-12 mx-auto text-github-fg-muted mb-4" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg><h3 class="text-lg font-medium text-github-fg-default mb-2">No repositories yet</h3><p class="text-github-fg-muted mb-4">Create your first repository to get started</p><button onclick="showCreateRepoModal()" class="inline-flex items-center px-4 py-2 bg-github-btn-primary-bg hover:bg-github-btn-primary-hover text-white rounded-md text-sm font-medium transition-colors"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/></svg>Create repository</button></div>`;
    return;
  }
  currentState.repositories.forEach(repo => {
    const repoCard = document.createElement('div');
    repoCard.className = 'bg-github-canvas-overlay border border-github-border-default rounded-lg p-4 hover:border-github-accent-fg transition-colors cursor-pointer file-preview-3d';
    const isStarred = starredRepos.includes(repo.name);
    repoCard.innerHTML = `<div class="flex items-start justify-between"><div class="flex-1"><div class="flex items-center justify-between mb-1"><h3 class="text-lg font-semibold text-github-accent-fg">${repo.name}</h3><button onclick="event.stopPropagation();toggleStarRepo('${repo.name}')" class="text-github-fg-muted hover:text-yellow-400 ${isStarred ? 'starred' : ''}"><svg class="w-4 h-4" fill="${isStarred ? 'currentColor' : 'none'}" viewBox="0 0 16 16"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg></button></div><p class="text-sm text-github-fg-muted mb-2">${repo.description || 'No description'}</p><div class="flex items-center space-x-4 text-xs text-github-fg-muted"><span>${formatDate(repo.created)}</span><span class="flex items-center space-x-1"><div class="w-3 h-3 rounded-full bg-github-accent-fg"></div><span>${repo.defaultBranch || 'main'}</span></span></div></div></div>`;
    repoCard.addEventListener('click', () => openRepository(repo.name));
    repoList.appendChild(repoCard);
  });
}
function renderFileList() {
  const tbody = document.getElementById('fileListBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (currentState.files.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="px-4 py-8 text-center text-github-fg-muted"><svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg><p>No files in this directory</p><button onclick="showCreateFileModal()" class="mt-2 text-github-accent-fg hover:underline text-sm">Create your first file</button></td></tr>`;
    return;
  }
  currentState.files.forEach(file => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-github-canvas-subtle transition-colors cursor-pointer';
    const fileIcon = getFileIcon(file.name, file.type);
    row.innerHTML = `<td class="px-4 py-3"><div class="flex items-center space-x-3">${fileIcon}<span class="text-github-accent-fg hover:underline font-medium">${file.name}</span></div></td><td class="px-4 py-3 text-github-fg-muted text-sm max-w-md truncate">${file.lastCommit || 'Initial commit'}</td><td class="px-4 py-3 text-github-fg-muted text-sm text-right">${formatDate(file.lastModified)}</td>`;
    row.addEventListener('click', () => viewFile(file.name));
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, file.name, file.type);
    });
    row.addEventListener('dragover', (e) => e.preventDefault());
    row.addEventListener('drop', (e) => handleFileDrop(e, file));
    tbody.appendChild(row);
  });
}
function editFile() {
  if (!currentState.currentFile) return;
  showLoading('Loading editor...');
  setTimeout(() => {
    try {
      const filePath = (currentState.path ? currentState.path + '/' : '') + currentState.currentFile.name;
      const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
      if (fileData && fileData.content) {
        const editingFileName = document.getElementById('editingFileName');
        const commitTitle = document.getElementById('commitTitle');
        const fileCategoryInput = document.getElementById('fileCategoryInput');
        if (editingFileName) editingFileName.textContent = currentState.currentFile.name;
        if (commitTitle) commitTitle.value = `Update ${currentState.currentFile.name}`;
        if (codeEditor) {
          codeEditor.setValue(fileData.content);
          updateEditorMode(codeEditor, currentState.currentFile.name);
        }
        if (fileCategoryInput) fileCategoryInput.value = fileData.category || '';
        currentState.selectedTags = fileData.tags || [];
        updateSelectedTags();
        hideLoading();
        showFileEditor();
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      hideLoading();
      showErrorMessage('Failed to load file for editing: ' + error.message);
    }
  }, 300);
}
function saveFile() {
  if (!currentState.currentFile) return;
  const commitTitle = document.getElementById('commitTitle');
  const commitDescription = document.getElementById('commitDescription');
  if (!commitTitle || !commitTitle.value.trim()) {
    showErrorMessage('Please enter a commit message');
    return;
  }
  showLoading('Saving changes...');
  setTimeout(() => {
    try {
      const filePath = (currentState.path ? currentState.path + '/' : '') + currentState.currentFile.name;
      const content = codeEditor ? codeEditor.getValue() : '';
      const fileCategoryInput = document.getElementById('fileCategoryInput');
      const fileData = {
        content: content,
        category: fileCategoryInput ? fileCategoryInput.value.trim() || 'General' : 'General',
        tags: currentState.selectedTags,
        lastModified: Date.now(),
        created: LocalStorageManager.getFile(currentState.repository, filePath)?.created || Date.now(),
        lastCommit: commitTitle.value.trim(),
        size: new Blob([content]).size
      };
      LocalStorageManager.saveFile(currentState.repository, filePath, fileData);
      const fileIndex = currentState.files.findIndex(f => f.name === currentState.currentFile.name);
      if (fileIndex !== -1) {
        currentState.files[fileIndex].lastModified = fileData.lastModified;
        currentState.files[fileIndex].lastCommit = fileData.lastCommit;
      }
      if (commitDescription) commitDescription.value = '';
      hideLoading();
      showSuccessMessage(`File "${currentState.currentFile.name}" saved successfully!`);
      createParticles();
      setTimeout(() => viewFile(currentState.currentFile.name), 500);
    } catch (error) {
      hideLoading();
      showErrorMessage('Failed to save file: ' + error.message);
    }
  }, 300);
}
function previewFile() {
  if (!codeEditor || !currentState.currentFile) return;
  const content = codeEditor.getValue();
  const ext = currentState.currentFile.name.split('.').pop().toLowerCase();
  const previewWindow = window.open('', '_blank');
  if (ext === 'md' || ext === 'markdown') {
    previewWindow.document.write(`<!DOCTYPE html><html><head><title>Preview: ${currentState.currentFile.name}</title><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:#24292f;background-color:#ffffff;max-width:980px;margin:0 auto;padding:45px;}@media(max-width:767px){body{padding:15px;}}h1,h2,h3,h4,h5,h6{margin-top:24px;margin-bottom:16px;font-weight:600;line-height:1.25;}h1{font-size:2em;border-bottom:1px solid #eaecef;padding-bottom:.3em;}h2{font-size:1.5em;border-bottom:1px solid #eaecef;padding-bottom:.3em;}p{margin-bottom:16px;}code{background-color:rgba(175,184,193,0.2);padding:2px 4px;border-radius:3px;font-size:85%;}pre{background-color:#f6f8fa;padding:16px;overflow:auto;border-radius:6px;}blockquote{padding:0 1em;color:#6a737d;border-left:0.25em solid #dfe2e5;margin:0 0 16px 0;}</style></head><body><pre>${content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`);
  } else {
    previewWindow.document.write(`<!DOCTYPE html><html><head><title>Preview: ${currentState.currentFile.name}</title><style>body{font-family:'JetBrains Mono',monospace;background:#22272e;color:#adbac7;margin:0;padding:16px;}pre{margin:0;white-space:pre-wrap;}</style></head><body><pre>${content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`);
  }
  previewWindow.document.close();
}
function navigateToRoot() {
  currentState.path = '';
  showLoading('Loading repository root...');
  setTimeout(() => {
    try {
      currentState.files = LocalStorageManager.listFiles(currentState.repository, '');
      renderFileList();
      updateBreadcrumb();
      hideLoading();
    } catch (error) {
      hideLoading();
      showErrorMessage('Failed to load repository root: ' + error.message);
    }
  }, 300);
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
      hideLoading();
    } catch (error) {
      hideLoading();
      showErrorMessage(`Failed to load path ${path}: ` + error.message);
    }
  }, 300);
}
function addTag() {
  const input = document.getElementById('tagInput');
  const tag = input.value.trim();
  if (tag && !currentState.selectedTags.includes(tag)) {
    currentState.selectedTags.push(tag);
    updateSelectedTags();
    input.value = '';
  }
}
function removeTag(tag) {
  currentState.selectedTags = currentState.selectedTags.filter(t => t !== tag);
  updateSelectedTags();
}
function viewFileFromContext(fileName) {
  hideContextMenu();
  viewFile(fileName);
}
function editFileFromContext(fileName) {
  hideContextMenu();
  currentState.currentFile = currentState.files.find(f => f.name === fileName);
  editFile();
}
function downloadFileFromContext(fileName) {
  hideContextMenu();
  currentState.currentFile = currentState.files.find(f => f.name === fileName);
  downloadCurrentFile();
}
function deleteFileFromContext(fileName) {
  hideContextMenu();
  currentState.currentFile = currentState.files.find(f => f.name === fileName);
  showDeleteFileModal();
}
function setupEventListeners() {
  const tagInput = document.getElementById('tagInput');
  if (tagInput) tagInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  });
  const branchSelector = document.getElementById('branchSelector');
  if (branchSelector) branchSelector.addEventListener('click', function(e) {
    e.stopPropagation();
    const branchDropdown = document.getElementById('branchDropdown');
    if (branchDropdown) branchDropdown.classList.toggle('hidden');
  });
  document.addEventListener('click', function() {
    const branchDropdown = document.getElementById('branchDropdown');
    if (branchDropdown) branchDropdown.classList.add('hidden');
  });
  const newFileName = document.getElementById('newFileName');
  if (newFileName) newFileName.addEventListener('input', function(e) {
    const fileName = e.target.value;
    if (fileName && initialContentEditor) updateEditorMode(initialContentEditor, fileName);
  });
}
function setupCodeEditors() {
  if (typeof CodeMirror !== 'undefined') {
    const editorConfig = {
      lineNumbers: true,
      lineWrapping: false,
      theme: 'material-darker',
      mode: 'javascript',
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
      smartIndent: true,
      viewportMargin: Infinity,
      cursorBlinkRate: 530,
      cursorScrollMargin: 12,
      cursorHeight: 1,
      showCursorWhenSelecting: true,
      scrollbarStyle: 'native',
      autofocus: false,
      dragDrop: true,
      allowDropFileTypes: ["text/plain", "text/javascript", "text/css", "text/html"],
      undoDepth: 300,
      historyEventDelay: 1250,
      readOnly: false,
      styleActiveLine: { nonEmpty: true, className: "cm-active-line-highlight" },
      matchBrackets: true,
      autoCloseBrackets: true,
      matchTags: { bothTags: true },
      autoCloseTags: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      highlightSelectionMatches: { minChars: 2, showToken: /\w/, annotateScrollbar: true },
      placeholder: "Start typing your code...",
      lineHeight: 1.2,
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      extraKeys: {
        "Ctrl-S": function (cm) {
          const fileEditor = document.getElementById('fileEditor');
          if (fileEditor && !fileEditor.classList.contains('hidden')) saveFile();
        },
        "Ctrl-F": "findPersistent",
        "Ctrl-Space": "autocomplete",
        "Ctrl-D": function(cm) { cm.execCommand("duplicateLine"); },
        "Ctrl-/": "toggleComment",
        "Shift-Tab": "indentLess",
        "Tab": function(cm) {
          if (cm.somethingSelected()) cm.indentSelection("add");
          else cm.execCommand("insertSoftTab");
        }
      }
    };
    setTimeout(() => {
      const editorContainer = document.getElementById('codeEditorContainer');
      const initialContentContainer = document.getElementById('initialContentEditor');
      if (editorContainer) {
        codeEditor = CodeMirror(editorContainer, editorConfig);
        codeEditor.on('change', updateCommitMessage);
        setTimeout(() => {
          if (codeEditor) codeEditor.refresh();
        }, 100);
      }
      if (initialContentContainer) {
        initialContentEditor = CodeMirror(initialContentContainer, {
          ...editorConfig,
          lineNumbers: false,
          height: '192px'
        });
        initialContentEditor.on('change', function() {
          const fileName = document.getElementById('newFileName');
          if (fileName && fileName.value) updateEditorMode(initialContentEditor, fileName.value);
        });
      }
    }, 100);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('editorSaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (typeof saveFile === "function") saveFile();
    });
  }
  const formatBtn = document.getElementById('editorFormatBtn');
  if (formatBtn) {
    formatBtn.addEventListener('click', () => {
      if (codeEditor) {
        try {
          const current = codeEditor.getValue();
          const ext = currentState.currentFile?.name.split('.').pop().toLowerCase();
          let formatted = current;
          if (ext === 'js' || ext === 'javascript') {
            formatted = js_beautify(current, { indent_size: 2 });
          } else if (ext === 'css') {
            formatted = css_beautify(current, { indent_size: 2 });
          } else if (ext === 'html') {
            formatted = html_beautify(current, { indent_size: 2 });
          }
          codeEditor.setValue(formatted);
          showSuccessMessage('Code formatted successfully!');
        } catch (e) {
          console.error("Format failed:", e);
        }
      }
    });
  }
});
function setupButtonEventListeners() {
  setTimeout(() => {
    const createRepoBtn = document.querySelector('button[onclick*="showCreateRepoModal"]');
    if (createRepoBtn) createRepoBtn.onclick = showCreateRepoModal;
    const createFileBtn = document.querySelector('button[onclick*="showCreateFileModal"]');
    if (createFileBtn) createFileBtn.onclick = showCreateFileModal;
  }, 100);
}
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); showCreateFileModal(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') { e.preventDefault(); showCreateRepoModal(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      const editor = document.getElementById('fileEditor');
      if (editor && !editor.classList.contains('hidden')) { e.preventDefault(); saveFile(); }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); showCommandPalette(); }
    if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); toggleTerminal(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') { e.preventDefault(); takeScreenshot(); }
    if (e.key === 'Escape') {
      const modals = ['createFileModal', 'createRepoModal', 'deleteFileModal', 'commandPalette', 'aiAssistant', 'terminalWindow', 'activityFeed', 'uploadModal'];
      for (const modalId of modals) {
        const modal = document.getElementById(modalId);
        if (modal && !modal.classList.contains('hidden')) {
          const hideBtn = modal.querySelector('button[onclick*="hide"]');
          if (hideBtn) hideBtn.click();
          return;
        }
      }
      showExplorer();
    }
  });
  document.addEventListener('click', hideContextMenu);
}
let recentFiles = JSON.parse(localStorage.getItem('gitcodr_recent_files') || '[]');
function addToRecentFiles(fileName, repoName, filePath) {
  const existingIndex = recentFiles.findIndex(f => 
    f.filePath === filePath && f.repoName === repoName
  );
  if (existingIndex !== -1) {
    recentFiles.splice(existingIndex, 1);
  }
  recentFiles.unshift({
    fileName,
    repoName,
    filePath,
    timestamp: Date.now()
  });
  if (recentFiles.length > 10) {
    recentFiles = recentFiles.slice(0, 10);
  }
  localStorage.setItem('gitcodr_recent_files', JSON.stringify(recentFiles));
  updateRecentFilesUI();
}
function updateRecentFilesUI() {
  const recentFilesList = document.getElementById('recentFilesList');
  const recentFilesCount = document.getElementById('topRecentFilesCount');
  const topRecentFilesList = document.getElementById('topRecentFilesList');
  if (recentFilesList) {
    if (recentFiles.length === 0) {
      recentFilesList.innerHTML = `<div class="text-center py-4 text-github-fg-muted text-sm">No recent files</div>`;
    } else {
      recentFilesList.innerHTML = recentFiles.map(file => `
        <button onclick="openRecentFile('${file.repoName}', '${file.filePath}', '${file.fileName}')" class="w-full flex items-center justify-between p-2 rounded hover:bg-github-canvas-subtle text-left group">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <svg class="w-3 h-3 text-github-fg-muted flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
              </svg>
              <span class="text-sm text-github-fg-default truncate">${file.fileName}</span>
            </div>
            <div class="text-xs text-github-fg-muted truncate mt-1">${file.repoName}</div>
          </div>
          <svg class="w-4 h-4 text-github-fg-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z"/>
          </svg>
        </button>
      `).join('');
    }
  }
  if (topRecentFilesList) {
    if (recentFiles.length === 0) {
      topRecentFilesList.innerHTML = `<div class="text-center py-4 text-github-fg-muted text-sm">No recent files</div>`;
    } else {
      topRecentFilesList.innerHTML = recentFiles.map(file => `
        <button onclick="openRecentFile('${file.repoName}', '${file.filePath}', '${file.fileName}')" class="w-full flex items-center justify-between p-2 rounded hover:bg-github-canvas-subtle text-left group">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <svg class="w-3 h-3 text-github-fg-muted flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
              </svg>
              <span class="text-sm text-github-fg-default truncate">${file.fileName}</span>
            </div>
            <div class="text-xs text-github-fg-muted truncate mt-1">${file.repoName}</div>
          </div>
          <svg class="w-4 h-4 text-github-fg-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z"/>
          </svg>
        </button>
      `).join('');
    }
  }
  if (recentFilesCount) {
    recentFilesCount.textContent = recentFiles.length.toString();
  }
}
function openRecentFile(repoName, filePath, fileName) {
  currentState.repository = repoName;
  const pathParts = filePath.split('/');
  if (pathParts.length > 1) {
    currentState.path = pathParts.slice(0, -1).join('/');
  } else {
    currentState.path = '';
  }
  try {
    currentState.files = LocalStorageManager.listFiles(repoName, currentState.path ? currentState.path + '/' : '');
    renderFileList();
    updateBreadcrumb();
    const currentRepoName = document.getElementById('currentRepoName');
    const repoNameInViewer = document.getElementById('repoNameInViewer');
    const repoNameInEditor = document.getElementById('repoNameInEditor');
    if (currentRepoName) currentRepoName.textContent = repoName;
    if (repoNameInViewer) repoNameInViewer.textContent = repoName;
    if (repoNameInEditor) repoNameInEditor.textContent = repoName;
    viewFile(fileName);
  } catch (error) {
    showErrorMessage('Failed to open recent file: ' + error.message);
  }
}
function updateStats() {
  const statsText = document.getElementById('statsText');
  const topStatsText = document.getElementById('topStatsText');
  if ((statsText || topStatsText) && currentState.repository) {
    try {
      const files = LocalStorageManager.listFiles(currentState.repository, '');
      const totalFiles = files.filter(f => f.type === 'file').length;
      const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
      const sizeText = formatFileSize(totalSize);
      const displayText = `${totalFiles} files • ${sizeText}`;
      if (statsText) statsText.textContent = displayText;
      if (topStatsText) topStatsText.textContent = displayText;
    } catch (error) {
      if (statsText) statsText.textContent = '0 files';
      if (topStatsText) topStatsText.textContent = '0 files';
    }
  }
}
function viewFile(filename) {
  if (!currentState.repository) {
    showErrorMessage('No repository selected');
    return;
  }
  const file = currentState.files.find(f => f.name === filename);
  if (!file) {
    showErrorMessage(`File "${filename}" not found in current view`);
    return;
  }
  currentState.currentFile = file;
  try {
    const filePath = file.path || ((currentState.path ? currentState.path + '/' : '') + filename);
    const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
    if (!fileData) {
      throw new Error(`File data not found for ${filePath}`);
    }
    addToRecentFiles(filename, currentState.repository, filePath);
    displayFileContent(filePath, file.name, fileData.content);
    showFileViewer();
    updateStats();
  } catch (error) {
    showErrorMessage('Failed to load file: ' + error.message);
  }
}
function displayFileContent(filePath, filename, content) {
  if (typeof filename !== "string") {
    filename = String(filename?.name || filename || "unknown");
  }
  const fileNameLabel = document.getElementById('editorFileName');
  if (fileNameLabel) fileNameLabel.textContent = filename;
  const mode = detectModeFromFilename(filename);
  const langLabel = document.getElementById('editorFileLanguage');
  if (langLabel) langLabel.textContent = getLanguageName(filename.split('.').pop().toLowerCase());
  if (codeEditor) {
    codeEditor.setOption("mode", mode);
    codeEditor.setValue(content || '');
    codeEditor.refresh();
  }
  const currentFileName = document.getElementById('currentFileName');
  if (currentFileName) currentFileName.textContent = filename;
  const fileLinesCount = document.getElementById('fileLinesCount');
  if (fileLinesCount) fileLinesCount.textContent = `${content.split('\n').length} lines`;
  const fileSize = document.getElementById('fileSize');
  if (fileSize) fileSize.textContent = formatFileSize(new Blob([content]).size);
  const fileLanguageDisplay = document.getElementById('fileLanguageDisplay');
  if (fileLanguageDisplay) fileLanguageDisplay.textContent = getLanguageName(filename.split('.').pop().toLowerCase());
  const fileCreated = document.getElementById('fileCreated');
  const fileModified = document.getElementById('fileModified');
  const fileLanguage = document.getElementById('fileLanguage');
  const fileCategory = document.getElementById('fileCategory');
  const fileTags = document.getElementById('fileTags');
  if (fileCreated) fileCreated.textContent = formatDate(Date.now());
  if (fileModified) fileModified.textContent = formatDate(Date.now());
  if (fileLanguage) fileLanguage.textContent = getLanguageName(filename.split('.').pop().toLowerCase());
  if (fileCategory) fileCategory.textContent = 'General';
  if (fileTags) {
    const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
    if (fileData && fileData.tags && fileData.tags.length > 0) {
      fileTags.innerHTML = fileData.tags.map(tag => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-github-accent-emphasis/20 border border-github-accent-emphasis/30 text-github-accent-fg">${tag}</span>`).join('');
    } else {
      fileTags.innerHTML = '<span class="text-github-fg-muted text-sm">No tags</span>';
    }
  }
}
function detectModeFromFilename(filename) {
  if (typeof filename !== "string") {
    return "javascript";
  }
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js': return 'javascript';
    case 'json': return 'application/json';
    case 'html': return 'htmlmixed';
    case 'css': return 'css';
    case 'md': return 'markdown';
    case 'py': return 'python';
    case 'php': return 'php';
    case 'xml': return 'xml';
    case 'yaml':
    case 'yml': return 'yaml';
    case 'rb': return 'ruby';
    case 'rs': return 'rust';
    case 'go': return 'go';
    case 'java':
    case 'cpp':
    case 'c':
    case 'cs': return 'clike';
    default: return 'javascript';
  }
}
function openRepository(repoName) {
  currentState.repository = repoName;
  currentState.path = '';
  ProgressBar.show();
  setTimeout(() => {
    try {
      currentState.files = LocalStorageManager.listFiles(repoName, '');
      renderFileList();
      updateBreadcrumb();
      const currentRepoName = document.getElementById('currentRepoName');
      const repoNameInViewer = document.getElementById('repoNameInViewer');
      const repoNameInEditor = document.getElementById('repoNameInEditor');
      if (currentRepoName) currentRepoName.textContent = repoName;
      if (repoNameInViewer) repoNameInViewer.textContent = repoName;
      if (repoNameInEditor) repoNameInEditor.textContent = repoName;
      const repo = LocalStorageManager.getRepository(repoName);
      if (repo) {
        const repoDescription = document.getElementById('repoDescription');
        if (repoDescription) repoDescription.textContent = repo.description || 'No description provided.';
      }
      showExplorer();
      updateStats();
      ProgressBar.hide();
    } catch (error) {
      ProgressBar.hide();
      showErrorMessage('Failed to open repository: ' + error.message);
    } }, 300);
}
function showRepoSelector() {
  document.getElementById('explorerView').classList.add('hidden');
  document.getElementById('fileViewer').classList.add('hidden');
  document.getElementById('fileEditor').classList.add('hidden');
  document.getElementById('repoSelectorView').classList.remove('hidden');
}
function showExplorer() {
  if (currentState.repository) {
    document.getElementById('fileViewer').classList.add('hidden');
    document.getElementById('fileEditor').classList.add('hidden');
    document.getElementById('repoSelectorView').classList.add('hidden');
    document.getElementById('explorerView').classList.remove('hidden');
  }
}
function initializeApp() {
  setupEventListeners();
  setupButtonEventListeners();
  setupKeyboardShortcuts();
  setupCodeEditors();
  updateRecentFilesUI();
  setupDragAndDrop();
  setupTerminal();
  updateActivityFeed();
  setTimeout(() => {
    loadRepositories();
    showSuccessMessage('GitHub Clone v2.0 loaded successfully!');
  }, 500);
}
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('gitcodr_theme', newTheme);
  const themeIcon = document.getElementById('topThemeIcon');
  if (themeIcon) {
    if (newTheme === 'dark') {
      themeIcon.innerHTML = `<path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0Zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13ZM.5 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5Zm13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5Z"/>`;
    } else {
      themeIcon.innerHTML = `<path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278Z"/>`;
    }
  }
  showSuccessMessage(`Switched to ${newTheme} mode`);
}
function showCommandPalette() {
  const palette = document.getElementById('commandPalette');
  if (palette) {
    palette.classList.remove('hidden');
    palette.classList.add('flex');
    const input = document.getElementById('commandInput');
    if (input) {
      input.focus();
      input.value = '';
    }
    updateCommandResults('');
  }
}
function hideCommandPalette() {
  const palette = document.getElementById('commandPalette');
  if (palette) {
    palette.classList.add('hidden');
    palette.classList.remove('flex');
  }
}
function updateCommandResults(query) {
  const results = document.getElementById('commandResults');
  if (!results) return;
  const commands = [
    { name: 'New File', action: 'showCreateFileModal()', shortcut: 'Ctrl+N' },
    { name: 'New Repository', action: 'showCreateRepoModal()', shortcut: 'Ctrl+Shift+N' },
    { name: 'Save File', action: 'saveFile()', shortcut: 'Ctrl+S' },
    { name: 'Toggle Terminal', action: 'toggleTerminal()', shortcut: 'Ctrl+`' },
    { name: 'Toggle Theme', action: 'toggleTheme()', shortcut: 'Ctrl+T' },
    { name: 'Take Screenshot', action: 'takeScreenshot()', shortcut: 'Ctrl+Shift+P' },
    { name: 'Show Activity Feed', action: 'showActivityFeed()', shortcut: 'Ctrl+Shift+A' },
    { name: 'Export All Data', action: 'exportAllData()', shortcut: 'Ctrl+Shift+E' },
    { name: 'AI Assistant', action: 'showAIAssistant()', shortcut: 'Ctrl+Shift+I' },
    { name: 'Go to Root', action: 'navigateToRoot()', shortcut: 'Ctrl+R' }
  ];
  const filtered = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase()) || 
    cmd.shortcut.toLowerCase().includes(query.toLowerCase())
  );
  if (filtered.length === 0) {
    results.innerHTML = `<div class="px-3 py-2 text-sm text-github-fg-muted">No commands found</div>`;
    return;
  }
  results.innerHTML = filtered.map(cmd => `
    <button onclick="${cmd.action}; hideCommandPalette();" class="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-github-canvas-subtle text-left">
      <span class="text-github-fg-default">${cmd.name}</span>
      <span class="text-xs text-github-fg-muted font-mono">${cmd.shortcut}</span>
    </button>
  `).join('');
}
function showTerminal() {
  const terminal = document.getElementById('terminalWindow');
  if (terminal) {
    terminal.classList.remove('hidden');
    const input = document.getElementById('terminalInput');
    if (input) input.focus();
  }
}
function hideTerminal() {
  const terminal = document.getElementById('terminalWindow');
  if (terminal) terminal.classList.add('hidden');
}
function toggleTerminal() {
  const terminal = document.getElementById('terminalWindow');
  if (terminal) {
    if (terminal.classList.contains('hidden')) {
      showTerminal();
    } else {
      hideTerminal();
    }
  }
}
function setupTerminal() {
  const input = document.getElementById('terminalInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = input.value.trim();
        if (command) {
          executeTerminalCommand(command);
          terminalHistory.unshift(command);
          terminalIndex = 0;
          input.value = '';
        }
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (terminalIndex < terminalHistory.length) {
          terminalIndex++;
          input.value = terminalHistory[terminalIndex - 1] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (terminalIndex > 0) {
          terminalIndex--;
          input.value = terminalHistory[terminalIndex - 1] || '';
        }
      }
    });
  }
}
function executeTerminalCommand(cmd) {
  const output = document.getElementById('terminalOutput');
  if (!output) return;
  const addLine = (text, color = 'text-github-fg-default') => {
    const line = document.createElement('div');
    line.className = `${color} mb-1`;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  };
  addLine(`$ ${cmd}`, 'text-green-400');
  const args = cmd.split(' ');
  switch (args[0]) {
    case 'ls':
      if (currentState.repository) {
        const files = LocalStorageManager.listFiles(currentState.repository, currentState.path ? currentState.path + '/' : '');
        files.forEach(file => {
          addLine(`${file.type === 'folder' ? '📁' : '📄'} ${file.name}`, file.type === 'folder' ? 'text-blue-400' : 'text-github-fg-default');
        });
      } else {
        addLine('No repository selected', 'text-yellow-400');
      }
      break;
    case 'cd':
      if (args[1] === '..') {
        const segments = currentState.path.split('/');
        segments.pop();
        currentState.path = segments.join('/');
        navigateToPath(currentState.path);
      } else if (args[1]) {
        navigateToPath(currentState.path ? `${currentState.path}/${args[1]}` : args[1]);
      }
      addLine(`Changed directory to: ${currentState.path || 'root'}`);
      break;
    case 'pwd':
      addLine(currentState.path || '/');
      break;
    case 'clear':
      output.innerHTML = '<div class="text-green-400">$</div>';
      break;
    case 'help':
      addLine('Available commands: ls, cd, pwd, clear, help, stats, repos');
      break;
    case 'stats':
      if (currentState.repository) {
        const files = LocalStorageManager.listFiles(currentState.repository, '');
        const totalFiles = files.filter(f => f.type === 'file').length;
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        addLine(`Repository: ${currentState.repository}`);
        addLine(`Files: ${totalFiles}`);
        addLine(`Size: ${formatFileSize(totalSize)}`);
      }
      break;
    case 'repos':
      const repos = LocalStorageManager.getRepositories();
      repos.forEach(repo => {
        addLine(`📁 ${repo.name}`, 'text-blue-400');
      });
      break;
    default:
      addLine(`Command not found: ${args[0]}`, 'text-red-400');
  }
}
function showAIAssistant() {
  const assistant = document.getElementById('aiAssistant');
  if (assistant) {
    assistant.classList.remove('hidden');
    const input = document.getElementById('aiPrompt');
    if (input) input.focus();
  }
}
function hideAIAssistant() {
  const assistant = document.getElementById('aiAssistant');
  if (assistant) assistant.classList.add('hidden');
}
function generateWithAI() {
  const prompt = document.getElementById('aiPrompt')?.value.trim();
  if (!prompt) {
    showErrorMessage('Please enter a prompt');
    return;
  }
  showLoading('AI is generating...');
  setTimeout(() => {
    const responses = [
      "Here's a suggested implementation:\n\nfunction example() {\n  console.log('Hello from AI!');\n}",
      "Consider this pattern:\n\nconst data = {\n  id: 1,\n  name: 'Example',\n  value: 42\n};",
      "Try this approach:\n\nexport default class Component {\n  constructor() {\n    this.state = {};\n  }\n}",
      "Suggested fix:\n\n// Fix: Added missing semicolon\nconst x = 5;",
      "Code snippet:\n\nasync function fetchData(url) {\n  const response = await fetch(url);\n  return response.json();\n}"
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    if (codeEditor) {
      codeEditor.setValue(codeEditor.getValue() + '\n\n' + response);
      showSuccessMessage('AI suggestion added!');
    }
    hideLoading();
    hideAIAssistant();
  }, 1500);
}
function showAISuggestions() {
  if (!codeEditor || !currentState.currentFile) return;
  const ext = currentState.currentFile.name.split('.').pop().toLowerCase();
  const suggestions = {
    'js': "// Add error handling\ntry {\n  // your code here\n} catch (error) {\n  console.error('Error:', error);\n}",
    'html': "<!-- Add accessibility attributes -->\n<button aria-label=\"Submit form\">Submit</button>",
    'css': "/* Add responsive design */\n@media (max-width: 768px) {\n  .container {\n    padding: 1rem;\n  }\n}",
    'py': "# Add type hints\ndef function_name(param: str) -> bool:\n    return True"
  };
  const suggestion = suggestions[ext] || "// Consider adding comments to explain complex logic";
  codeEditor.setValue(codeEditor.getValue() + '\n\n' + suggestion);
  showSuccessMessage('AI suggestion added!');
}
function takeScreenshot() {
  showLoading('Capturing screenshot...');
  setTimeout(() => {
    try {
      document.body.classList.add('screenshot-mode');
      html2canvas(document.querySelector('#pageContainer')).then(canvas => {
        const link = document.createElement('a');
        link.download = `screenshot-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.classList.remove('screenshot-mode');
        hideLoading();
        showSuccessMessage('Screenshot saved!');
      });
    } catch (error) {
      document.body.classList.remove('screenshot-mode');
      hideLoading();
      showErrorMessage('Failed to take screenshot');
    }
  }, 300);
}
function toggleStar() {
  const starBtn = document.getElementById('starRepoBtn');
  const starText = document.getElementById('starText');
  const starCount = document.getElementById('starCount');
  if (!starBtn || !currentState.repository) return;
  const isStarred = starBtn.classList.contains('starred');
  if (isStarred) {
    starBtn.classList.remove('starred');
    if (starText) starText.textContent = 'Star';
    const count = parseInt(starCount.textContent) - 1;
    starCount.textContent = Math.max(0, count).toString();
  } else {
    starBtn.classList.add('starred');
    if (starText) starText.textContent = 'Unstar';
    const count = parseInt(starCount.textContent) + 1;
    starCount.textContent = count.toString();
    createConfetti();
  }
  localStorage.setItem(`starred_${currentState.repository}`, (!isStarred).toString());
}
function toggleStarRepo(repoName) {
  const index = starredRepos.indexOf(repoName);
  if (index === -1) {
    starredRepos.push(repoName);
  } else {
    starredRepos.splice(index, 1);
  }
  localStorage.setItem('gitcodr_starred', JSON.stringify(starredRepos));
  renderRepositoryList();
}
function updateStarredUI() {
  starredRepos = JSON.parse(localStorage.getItem('gitcodr_starred') || '[]');
}
function showUploadModal() {
  const modal = document.getElementById('uploadModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}
function hideUploadModal() {
  const modal = document.getElementById('uploadModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    const progress = document.getElementById('uploadProgress');
    if (progress) progress.classList.add('hidden');
  }
}
function setupDragAndDrop() {
  const dropZone = document.getElementById('dropZone');
  const fileDropZone = document.getElementById('fileDropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      handleFileUpload(files);
    });
    dropZone.addEventListener('click', () => {
      document.getElementById('fileUploadInput')?.click();
    });
  }
  if (fileDropZone) {
    fileDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropZone.classList.add('drag-over');
    });
    fileDropZone.addEventListener('dragleave', () => {
      fileDropZone.classList.remove('drag-over');
    });
    fileDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropZone.classList.remove('drag-over');
      if (!currentState.repository) {
        showErrorMessage('Please select a repository first');
        return;
      }
      const files = e.dataTransfer.files;
      handleFileUpload(files);
    });
  }
  const fileInput = document.getElementById('fileUploadInput');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      handleFileUpload(e.target.files);
    });
  }
}
function handleFileUpload(files) {
  if (!files.length || !currentState.repository) return;
  const progress = document.getElementById('uploadProgress');
  const progressBar = document.getElementById('uploadProgressBar');
  const status = document.getElementById('uploadStatus');
  if (progress) progress.classList.remove('hidden');
  let uploaded = 0;
  const total = files.length;
  Array.from(files).forEach((file, index) => {
    if (file.size > 10 * 1024 * 1024) {
      showErrorMessage(`File ${file.name} is too large (max 10MB)`);
      uploaded++;
      updateProgress();
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const filePath = (currentState.path ? currentState.path + '/' : '') + file.name;
      const fileData = {
        content: content,
        category: 'Uploaded',
        tags: ['uploaded'],
        created: Date.now(),
        lastModified: Date.now(),
        lastCommit: 'Uploaded file',
        size: file.size
      };
      LocalStorageManager.saveFile(currentState.repository, filePath, fileData);
      LocalStorageManager.logActivity('upload', currentState.repository, file.name);
      uploaded++;
      updateProgress();
      if (uploaded === total) {
        setTimeout(() => {
          currentState.files = LocalStorageManager.listFiles(currentState.repository, currentState.path ? currentState.path + '/' : '');
          renderFileList();
          hideUploadModal();
          showSuccessMessage(`Uploaded ${total} file(s) successfully!`);
          createParticles();
        }, 500);
      }
    };
    reader.readAsText(file);
  });
  function updateProgress() {
    const percent = Math.round((uploaded / total) * 100);
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (status) status.textContent = `${uploaded}/${total} files (${percent}%)`;
  }
}
function startUpload() {
  const fileInput = document.getElementById('fileUploadInput');
  if (fileInput && fileInput.files.length > 0) {
    handleFileUpload(fileInput.files);
  } else {
    showErrorMessage('Please select files to upload');
  }
}
function showActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (feed) {
    feed.classList.remove('hidden');
    updateActivityFeed();
  }
}
function hideActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (feed) feed.classList.add('hidden');
}
function updateActivityFeed() {
  const list = document.getElementById('activityList');
  if (!list) return;
  if (activityLog.length === 0) {
    list.innerHTML = `<div class="text-center py-4 text-github-fg-muted text-sm">No recent activity</div>`;
    return;
  }
  list.innerHTML = activityLog.slice(0, 10).map(activity => {
    let icon = '📝';
    let color = 'text-blue-400';
    if (activity.action === 'create') {
      icon = '✨';
      color = 'text-green-400';
    } else if (activity.action === 'delete') {
      icon = '🗑️';
      color = 'text-red-400';
    } else if (activity.action === 'upload') {
      icon = '📤';
      color = 'text-purple-400';
    }
    return `
      <div class="flex items-start space-x-3 p-3 border-b border-github-border-muted last:border-b-0">
        <div class="${color} text-lg">${icon}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-github-fg-default">${activity.file}</p>
          <p class="text-xs text-github-fg-muted">${activity.repo} • ${formatDate(activity.timestamp)}</p>
        </div>
      </div>
    `;
  }).join('');
}
function toggleFullscreen() {
  const element = document.getElementById('fileViewer');
  if (!document.fullscreenElement) {
    element.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}
function duplicateFile() {
  if (!currentState.currentFile) return;
  const original = currentState.currentFile.name;
  const extIndex = original.lastIndexOf('.');
  const name = extIndex > 0 ? original.substring(0, extIndex) : original;
  const ext = extIndex > 0 ? original.substring(extIndex) : '';
  const newName = `${name}-copy${ext}`;
  showLoading('Duplicating file...');
  setTimeout(() => {
    try {
      const filePath = (currentState.path ? currentState.path + '/' : '') + original;
      const newFilePath = (currentState.path ? currentState.path + '/' : '') + newName;
      const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
      if (fileData) {
        const newFileData = {
          ...fileData,
          created: Date.now(),
          lastModified: Date.now(),
          lastCommit: `Copy of ${original}`
        };
        LocalStorageManager.saveFile(currentState.repository, newFilePath, newFileData);
        LocalStorageManager.logActivity('create', currentState.repository, newName);
        currentState.files = LocalStorageManager.listFiles(currentState.repository, currentState.path ? currentState.path + '/' : '');
        renderFileList();
        hideLoading();
        showSuccessMessage(`File duplicated as "${newName}"`);
        setTimeout(() => viewFile(newName), 300);
      }
    } catch (error) {
      hideLoading();
      showErrorMessage('Failed to duplicate file: ' + error.message);
    }
  }, 300);
}
function exportAllData() {
  showLoading('Exporting data...');
  setTimeout(() => {
    try {
      const data = {
        repositories: LocalStorageManager.getRepositories(),
        recentFiles: recentFiles,
        starredRepos: starredRepos,
        activityLog: activityLog,
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `github-clone-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      hideLoading();
      showSuccessMessage('Data exported successfully!');
    } catch (error) {
      hideLoading();
      showErrorMessage('Failed to export data: ' + error.message);
    }
  }, 500);
}
function createConfetti() {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    document.body.appendChild(confetti);
    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 2000,
      easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
    });
    animation.onfinish = () => confetti.remove();
  }
}
function createParticles() {
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.top = Math.random() * 100 + 'vh';
    particle.style.width = particle.style.height = Math.random() * 5 + 2 + 'px';
    particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    document.body.appendChild(particle);
    particle.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: `scale(0) translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`, opacity: 0 }
    ], {
      duration: 500 + Math.random() * 1000,
      easing: 'ease-out'
    }).onfinish = () => particle.remove();
  }
}
window.showCreateRepoModal = showCreateRepoModal;
window.hideCreateRepoModal = hideCreateRepoModal;
window.showCreateFileModal = showCreateFileModal;
window.hideCreateFileModal = hideCreateFileModal;
window.showDeleteFileModal = showDeleteFileModal;
window.hideDeleteFileModal = hideDeleteFileModal;
window.createRepository = createRepository;
window.createFile = createFile;
window.confirmDeleteFile = confirmDeleteFile;
window.deleteRepository = deleteRepository;
window.openRepository = openRepository;
window.viewFile = viewFile;
window.editFile = editFile;
window.saveFile = saveFile;
window.downloadCurrentFile = downloadCurrentFile;
window.previewFile = previewFile;
window.showRepoSelector = showRepoSelector;
window.showExplorer = showExplorer;
window.showFileViewer = showFileViewer;
window.showFileEditor = showFileEditor;
window.navigateToRoot = navigateToRoot;
window.navigateToPath = navigateToPath;
window.addTag = addTag;
window.removeTag = removeTag;
window.viewFileFromContext = viewFileFromContext;
window.editFileFromContext = editFileFromContext;
window.downloadFileFromContext = downloadFileFromContext;
window.deleteFileFromContext = deleteFileFromContext;
window.openRecentFile = openRecentFile;
window.toggleTheme = toggleTheme;
window.showCommandPalette = showCommandPalette;
window.hideCommandPalette = hideCommandPalette;
window.showTerminal = showTerminal;
window.hideTerminal = hideTerminal;
window.toggleTerminal = toggleTerminal;
window.showAIAssistant = showAIAssistant;
window.hideAIAssistant = hideAIAssistant;
window.generateWithAI = generateWithAI;
window.showAISuggestions = showAISuggestions;
window.takeScreenshot = takeScreenshot;
window.toggleStar = toggleStar;
window.showUploadModal = showUploadModal;
window.hideUploadModal = hideUploadModal;
window.startUpload = startUpload;
window.showActivityFeed = showActivityFeed;
window.hideActivityFeed = hideActivityFeed;
window.toggleFullscreen = toggleFullscreen;
window.duplicateFile = duplicateFile;
window.exportAllData = exportAllData;
document.addEventListener('DOMContentLoaded', initializeApp);