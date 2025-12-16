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

let recentFiles = JSON.parse(localStorage.getItem('gitcodr_recent_files') || '[]');

function fetchData(operationName, callback) {
  return new Promise((resolve, reject) => {
    showLoading(operationName);
    
    setTimeout(() => {
      try {
        const result = callback();
        hideLoading();
        resolve(result);
      } catch (error) {
        hideLoading();
        reject(error);
      }
    }, 100);
  });
}

function loadRepositories() {
  return fetchData('Loading repositories...', () => {
    currentState.repositories = LocalStorageManager.getRepositories();
    renderRepositoryList();
    return currentState.repositories;
  }).catch((error) => {
    showErrorMessage('Failed to load repositories: ' + error.message);
  });
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
  
  fetchData('Creating repository...', () => {
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
    }
    currentState.repositories.push(repo);
    renderRepositoryList();
    hideCreateRepoModal();
    showSuccessMessage(`Repository "${repoName}" created successfully!`);
    return repoName;
  }).then((createdRepoName) => {
    setTimeout(() => openRepository(createdRepoName), 500);
  }).catch((error) => {
    showErrorMessage('Failed to create repository: ' + error.message);
  });
}
function deleteRepository(repoName) {
  if (!confirm(`Are you sure you want to delete the repository "${repoName}"? This action cannot be undone.`)) return;
  
  fetchData(`Deleting repository ${repoName}...`, () => {
    LocalStorageManager.deleteRepository(repoName);
    currentState.repositories = currentState.repositories.filter(r => r.name !== repoName);
    if (currentState.repository === repoName) {
      currentState.repository = null;
      showRepoSelector();
    }
    renderRepositoryList();
    showSuccessMessage(`Repository "${repoName}" deleted successfully!`);
  }).catch((error) => {
    showErrorMessage('Failed to delete repository: ' + error.message);
  });
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
  
  fetchData('Creating file...', () => {
    const filePath = (currentState.path ? currentState.path + '/' : '') + fileName;
    const existingFile = LocalStorageManager.getFile(currentState.repository, filePath);
    if (existingFile) {
      throw new Error('File already exists');
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
    currentState.files.push({
      name: fileName,
      type: 'file',
      path: filePath,
      lastModified: fileData.lastModified,
      lastCommit: fileData.lastCommit
    });
    renderFileList();
    hideCreateFileModal();
    showSuccessMessage(`File "${fileName}" created successfully!`);
  }).catch((error) => {
    showErrorMessage('Failed to create file: ' + error.message);
  });
}



function confirmDeleteFile() {
  deleteCurrentFile();
  hideDeleteFileModal();
}
function deleteCurrentFile() {
  if (!currentState.currentFile) return;
  
  fetchData(`Deleting file ${currentState.currentFile.name}...`, () => {
    const filePath = (currentState.path ? currentState.path + '/' : '') + currentState.currentFile.name;
    LocalStorageManager.deleteFile(currentState.repository, filePath);
    currentState.files = currentState.files.filter(f => f.name !== currentState.currentFile.name);
    renderFileList();
    hideDeleteFileModal();
    showSuccessMessage(`File "${currentState.currentFile.name}" deleted successfully!`);
    setTimeout(() => showExplorer(), 500);
  }).catch((error) => {
    showErrorMessage('Failed to delete file: ' + error.message);
  });
}
function downloadCurrentFile() {
  if (!currentState.currentFile) return;
  try {
    const filePath = (currentState.path ? currentState.path + '/' : '') + currentState.currentFile.name;
    const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
    if (fileData) {
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




function previewFile() {
  if (!codeEditor || !currentState.currentFile) return;
  const content = codeEditor.getValue();
  const ext = currentState.currentFile.name.split('.').pop().toLowerCase();
  if (ext === 'md' || ext === 'markdown') {
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`<!DOCTYPE html><html><head><title>Preview: ${currentState.currentFile.name}</title><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:#24292f;background-color:#ffffff;max-width:980px;margin:0 auto;padding:45px;}@media(max-width:767px){body{padding:15px;}}h1,h2,h3,h4,h5,h6{margin-top:24px;margin-bottom:16px;font-weight:600;line-height:1.25;}h1{font-size:2em;border-bottom:1px solid #eaecef;padding-bottom:.3em;}h2{font-size:1.5em;border-bottom:1px solid #eaecef;padding-bottom:.3em;}p{margin-bottom:16px;}code{background-color:rgba(175,184,193,0.2);padding:2px 4px;border-radius:3px;font-size:85%;}pre{background-color:#f6f8fa;padding:16px;overflow:auto;border-radius:6px;}blockquote{padding:0 1em;color:#6a737d;border-left:0.25em solid #dfe2e5;margin:0 0 16px 0;}</style></head><body><pre>${content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`);
    previewWindow.document.close();
  } else {
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`<!DOCTYPE html><html><head><title>Preview: ${currentState.currentFile.name}</title><style>body{font-family:'JetBrains Mono',monospace;background:#22272e;color:#adbac7;margin:0;padding:16px;}pre{margin:0;white-space:pre-wrap;}</style></head><body><pre>${content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`);
    previewWindow.document.close();
  }
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



/**
 * All of these are functions that "run" in the background,
 * whenever an option is picked from the Context Menu on a File List,
 * ( when a File List item is right clicked )
 */
 /**
so i would rather something like:

const files = {
  contextMenu = {
    view: function(fileName) {
      
    },
    edit: function(fileName) {
      
    },
    download: function(fileName) {
      
    },
    delete: function(fileName) {
      
    }
  },
  
  
}




**/







// FROM THE FILE "core.js"
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


/**
function viewFile(filename) {
// Logic that is not relevant to my issue
}
function editFile() {
// Logic that is not relevant to my issue
}
**/
function showDeleteFileModal() {
// Logic that is not relevant to my issue
}
function downloadCurrentFile() {
// Logic that is not relevant to my issue
}




// FROM THE FILE "overlays.js"
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








// core.js

// Assume currentState and other functions (viewFile, editFile, downloadCurrentFile, showDeleteFileModal) 
// are defined elsewhere or remain in this file.

const files = {
  /**
   * Functions that run when an option is picked from the File List Context Menu
   */
  contextMenu: {
    // Helper to perform necessary cleanup before action
    _preAction: function() {
      // Assuming hideContextMenu is globally accessible or imported/defined here
      if (typeof hideContextMenu === 'function') {
        hideContextMenu();
      } else {
        console.warn("hideContextMenu not found. Context menu may persist.");
      }
    },

    view: function(fileName) {
      this._preAction();
      viewFile(fileName);
    },

    edit: function(fileName) {
      this._preAction();
      currentState.currentFile = currentState.files.find(f => f.name === fileName);
      editFile();
    },

    download: function(fileName) {
      this._preAction();
      // Logic to find and set current file is moved here
      currentState.currentFile = currentState.files.find(f => f.name === fileName);
      downloadCurrentFile();
    },

    delete: function(fileName) {
      this._preAction();
      // Logic to find and set current file is moved here
      currentState.currentFile = currentState.files.find(f => f.name === fileName);
      showDeleteFileModal();
    }
  }
};


// The original context wrapper functions are removed:
// REMOVE: function viewFileFromContext(fileName) { ... }
// REMOVE: function editFileFromContext(fileName) { ... }
// REMOVE: function downloadFileFromContext(fileName) { ... }
// REMOVE: function deleteFileFromContext(fileName) { ... }


// The other functions that perform the action remain:
// function viewFile(filename) { /* ... */ }
// function editFile() { /* ... */ }
// function downloadCurrentFile() { /* ... */ }
// function showDeleteFileModal() { /* ... */ }














function setupCodeEditors() {
  if (typeof CodeMirror !== 'undefined') {
    const editorConfig = {
      lineNumbers: true,
      lineWrapping: false,
      theme: 'one-dark',
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
      styleActiveLine: {
        nonEmpty: true,
        className: "cm-active-line-highlight"
      },
      matchBrackets: true,
      autoCloseBrackets: true,
      matchTags: { bothTags: true },
      autoCloseTags: true,
      foldGutter: true,
      gutters: [
        "CodeMirror-linenumbers",
        "CodeMirror-foldgutter"
      ],
      lint: true,
      highlightSelectionMatches: {
        minChars: 2,
        showToken: /\w/,
        annotateScrollbar: true
      },
      placeholder: "Start typing your code...",
      lineHeight: 1,
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
          lineNumbers: true,
          height: '100%',
          width: '100%'
        });
        initialContentEditor.on('change', function() {
          const fileName = document.getElementById('newFileName');
          if (fileName && fileName.value) updateEditorMode(initialContentEditor, fileName.value);
        });
      }
    }, 100);
  }
}
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
    if (e.key === 'Escape') {
      const modals = ['createFileModal', 'createRepoModal', 'deleteFileModal'];
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

function openRecentFile(repoName, filePath, fileName) {
  currentState.repository = repoName;
  const pathParts = filePath.split('/');
  if (pathParts.length > 1) {
    currentState.path = pathParts.slice(0, -1).join('/');
  } else {
    currentState.path = '';
  }
  
  fetchData('Opening recent file...', () => {
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
  }).catch((error) => {
    showErrorMessage('Failed to open recent file: ' + error.message);
  });
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
  
  fetchData(`Loading ${filename}...`, () => {
    const filePath = file.path || ((currentState.path ? currentState.path + '/' : '') + filename);
    const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
    
    if (!fileData) {
      throw new Error(`File data not found for ${filePath}`);
    }
    
    addToRecentFiles(filename, currentState.repository, filePath);
    
    if (window.coderViewEdit && typeof window.coderViewEdit.displayFile === 'function') {
      window.coderViewEdit.displayFile(filename, fileData);
    } else {
      displayFileContent(filename, fileData);
    }
    
    showFileViewer();
    updateStats();
    return fileData;
    
  }).catch((error) => {
    showErrorMessage('Failed to load file: ' + error.message);
  });
}
function editFile() {
  LoadingProgress.show();
  LoadingSpinner.show();
  
  if (!currentState.currentFile) {
    LoadingProgress.hide();
    LoadingSpinner.hide();
    return;
  }
  
  fetchData('Loading editor...', () => {
    const filePath = (currentState.path ? currentState.path + '/' : '') + currentState.currentFile.name;
    const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
    
    if (fileData) {
      const editingFileName = document.getElementById('editingFileName');
      const commitTitle = document.getElementById('commitTitle');
      const fileCategoryInput = document.getElementById('fileCategoryInput');
      
      if (editingFileName) editingFileName.textContent = currentState.currentFile.name;
      if (commitTitle) commitTitle.value = `Update ${currentState.currentFile.name}`;
      
      if (window.coderViewEdit && typeof window.coderViewEdit.displayFile === 'function') {
        window.coderViewEdit.displayFile(currentState.currentFile.name, fileData);
        
        setTimeout(() => {
          if (window.coderViewEdit.enterEditMode && typeof window.coderViewEdit.enterEditMode === 'function') {
            window.coderViewEdit.enterEditMode();
          } else {
            showFileViewer();
          }
          // Hide loaders AFTER everything is ready
          LoadingSpinner.hide();
          LoadingProgress.hide();
        }, 100);
        
      } else if (codeEditor) {
        codeEditor.setValue(fileData.content);
        updateEditorMode(codeEditor, currentState.currentFile.name);
        showFileEditor();
        // Hide loaders after editor is ready
        LoadingSpinner.hide();
        LoadingProgress.hide();
      }
      
      if (fileCategoryInput) fileCategoryInput.value = fileData.category || '';
      currentState.selectedTags = fileData.tags || [];
      updateSelectedTags();
      
    } else {
      throw new Error('File not found');
    }
    
  }).catch((error) => {
    showErrorMessage('Failed to load file for editing: ' + error.message);
    LoadingSpinner.hide();
    LoadingProgress.hide();
  });
}
function saveFile() {
    LoadingProgress.show();
  LoadingSpinner.show();

  if (!currentState.currentFile) return;
  
  if (window.coderViewEdit && typeof window.coderViewEdit.saveChanges === 'function') {
    window.coderViewEdit.saveChanges();
    return;
  }
  
  const commitTitle = document.getElementById('commitTitle');
  const commitDescription = document.getElementById('commitDescription');
  
  if (!commitTitle || !commitTitle.value.trim()) {
    showErrorMessage('Please enter a commit message');
    return;
  }
  
  fetchData('Saving changes...', () => {
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
    showSuccessMessage(`File "${currentState.currentFile.name}" saved successfully!`);
    return currentState.currentFile.name;
    
  }).then((fileName) => {
    setTimeout(() => viewFile(fileName), 500);
  }).catch((error) => {
    showErrorMessage('Failed to save file: ' + error.message);
  });
  
  
  setTimeout(() => {
    LoadingSpinner.hide();
    LoadingProgress.hide();
 }, 200);
}

function openRepository(repoName) {
    LoadingProgress.show();
  LoadingSpinner.show();

  currentState.repository = repoName;
  currentState.path = '';
  
  fetchData(`Opening ${repoName}...`, () => {
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
    return repoName;
  }).catch((error) => {
    showErrorMessage('Failed to open repository: ' + error.message);
  });
  
    
  setTimeout(() => {
    LoadingSpinner.hide();
    LoadingProgress.hide();
}, 200);
}




function initializeApp() {
  setupEventListeners();
  setupButtonEventListeners();
  setupKeyboardShortcuts();
  setupCodeEditors();
  updateRecentFilesUI();
  
  fetchData('Initializing app...', () => {
    eventListeners.init(SidebarManager || null);
    return loadRepositories();
  }).then(() => {
    showSuccessMessage('Welcome back');
  }).catch((error) => {
    console.error('Initialization error:', error);
  });
}

document.addEventListener('DOMContentLoaded', initializeApp);
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