


/**
 * 
import { LoadingProgress } from 'https://gitdev.wuaze.com/modules/router.js';
import { currentState } from 'https://gitdev.wuaze.com/modules/core.js';
import { updateSelectedTags } from 'https://gitdev.wuaze.com/modules/pageUpdates.js';
// import { ProgressBar } from 'https://gitdev.wuaze.com/modules/router.js';
**/



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

function hideContextMenu() {
  const menu = document.getElementById('contextMenu');
  if (menu) menu.remove();
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

function showLoading(text = 'Loading...') {
  const overlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');
  
//  ProgressBar.show();
  LoadingProgress.show();
  
  if (overlay && loadingText) {
    loadingText.textContent = text;
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  
//  ProgressBar.hide();
  LoadingProgress.hide();
  
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }
}

function showSuccessMessage(message) {
  LoadingProgress.show();
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-github-success-fg text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-down';
  notification.innerHTML = `<div class="flex items-center space-x-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg><span>${message}</span></div>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    LoadingProgress.hide();
    notification.style.animation = 'fadeOut 0.3s ease-in';
    setTimeout(() => notification.parentNode?.removeChild(notification), 300);
  }, 3000);
}

function showErrorMessage(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-github-danger-fg text-white px-4 py-3 rounded-lg shadow-lg animate-slide-down';
  notification.dataset.notify = 'error';
  notification.innerHTML = `<div class="flex items-center space-x-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16ZM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646Z"/></svg><span>${message}</span></div>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.5s ease-in';
    setTimeout(() => notification.parentNode?.removeChild(notification), 300);
  }, 5000);
}
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