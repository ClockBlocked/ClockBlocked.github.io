const currentState = {
    repository: null,
    path: '',
    files: [],
    currentFile: null,
    searchResults: []
};

window.currentState = currentState;

function openRepository(repoName) {
    if (!repoName) {
        showErrorMessage('Repository name is required');
        return;
    }

    currentState.repository = repoName;
    currentState.path = '';
    
    fetchData(`Opening ${repoName}...`, () => {
        const repo = LocalStorageManager.getRepository(repoName);
        if (!repo) {
            throw new Error(`Repository "${repoName}" not found`);
        }
        
        currentState.files = LocalStorageManager.listFiles(repoName, '');
        showExplorer();
        renderFileList();
        updateBreadcrumb();
        updateStats();
        
        if (typeof SidebarManager !== 'undefined') {
            SidebarManager.selectRepository(repoName);
        }
        
        return repo;
    }).catch((error) => {
        showErrorMessage('Failed to open repository: ' + error.message);
        showRepoSelector();
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
        
        if (window.codeViewerEditor) {
            codeViewerEditor.loadFile(filename, fileData);
        } else {
            console.error('CodeViewerEditor not initialized!');
            showErrorMessage('Code viewer not available');
        }
        
        showFileViewer();
        updateStats();
        return fileData;
    }).catch((error) => {
        showErrorMessage('Failed to load file: ' + error.message);
    });
}

function createNewRepository() {
    const repoNameInput = document.getElementById('newRepoName');
    const repoDescInput = document.getElementById('repoDescriptionInput');
    const initReadmeCheck = document.getElementById('initReadme');
    const visibilityPublic = document.getElementById('visibilityPublic');
    
    if (!repoNameInput) {
        showErrorMessage('Repository name input not found');
        return;
    }
    
    const repoName = repoNameInput.value.trim();
    
    if (!repoName) {
        showErrorMessage('Please enter a repository name');
        return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(repoName)) {
        showErrorMessage('Repository name can only contain letters, numbers, hyphens, and underscores');
        return;
    }
    
    const existingRepo = LocalStorageManager.getRepository(repoName);
    if (existingRepo) {
        showErrorMessage(`Repository "${repoName}" already exists`);
        return;
    }
    
    fetchData('Creating repository...', () => {
        const repo = {
            name: repoName,
            description: repoDescInput ? repoDescInput.value.trim() : '',
            visibility: visibilityPublic && visibilityPublic.checked ? 'public' : 'private',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        if (!LocalStorageManager.saveRepository(repo)) {
            throw new Error('Failed to save repository');
        }
        
        if (initReadmeCheck && initReadmeCheck.checked) {
            const readmeContent = `# ${repoName}\n\n${repo.description || 'A new repository'}`;
            LocalStorageManager.saveFile(repoName, 'README.md', {
                content: readmeContent,
                type: 'file',
                category: 'Documentation',
                tags: ['readme'],
                lastCommit: 'Initial commit',
                size: readmeContent.length
            });
        }
        
        if (repoNameInput) repoNameInput.value = '';
        if (repoDescInput) repoDescInput.value = '';
        if (initReadmeCheck) initReadmeCheck.checked = true;
        if (visibilityPublic) visibilityPublic.checked = true;
        
        modals.hide('create');
        renderRepositoryList();
        openRepository(repoName);
        showSuccessMessage(`Repository "${repoName}" created successfully`);
        
        return repo;
    }).catch((error) => {
        showErrorMessage(error.message);
    });
}

function createFile() {
    const fileNameInput = document.getElementById('newFileName');
    const fileCategoryInput = document.getElementById('fileCategoryInput');
    
    if (!fileNameInput) {
        showErrorMessage('File name input not found');
        return;
    }
    
    const fileName = fileNameInput.value.trim();
    
    if (!fileName) {
        showErrorMessage('Please enter a file name');
        return;
    }
    
    if (!currentState.repository) {
        showErrorMessage('No repository selected');
        return;
    }
    
    const fullPath = currentState.path ? `${currentState.path}/${fileName}` : fileName;
    
    const existingFile = LocalStorageManager.getFile(currentState.repository, fullPath);
    if (existingFile) {
        showErrorMessage(`File "${fileName}" already exists`);
        return;
    }
    
    fetchData('Creating file...', () => {
        let initialContent = '';
        if (window.createFileEditor && typeof window.createFileEditor.getValue === 'function') {
            initialContent = window.createFileEditor.getValue();
        }
        
        const fileData = {
            content: initialContent,
            type: 'file',
            category: fileCategoryInput ? fileCategoryInput.value.trim() || 'General' : 'General',
            tags: window.selectedFileTags || [],
            lastCommit: 'Created file',
            size: initialContent.length
        };
        
        if (!LocalStorageManager.saveFile(currentState.repository, fullPath, fileData)) {
            throw new Error('Failed to save file');
        }
        
        if (fileNameInput) fileNameInput.value = '';
        if (fileCategoryInput) fileCategoryInput.value = '';
        if (window.createFileEditor && typeof window.createFileEditor.setValue === 'function') {
            window.createFileEditor.setValue('');
        }
        window.selectedFileTags = [];
        const selectedTagsDiv = document.getElementById('selectedTags');
        if (selectedTagsDiv) selectedTagsDiv.innerHTML = '';
        
        modals.hide('createFile');
        
        currentState.files = LocalStorageManager.listFiles(currentState.repository, currentState.path ? currentState.path + '/' : '');
        renderFileList();
        showSuccessMessage(`File "${fileName}" created successfully`);
        
        return fileData;
    }).catch((error) => {
        showErrorMessage(error.message);
    });
}

function confirmDeleteFile() {
    const fileToDeleteName = document.getElementById('fileToDeleteName');
    if (!fileToDeleteName) return;
    
    const fileName = fileToDeleteName.textContent;
    const filePath = window.fileToDelete;
    
    if (!filePath || !currentState.repository) {
        showErrorMessage('Invalid file or repository');
        return;
    }
    
    fetchData('Deleting file...', () => {
        if (!LocalStorageManager.deleteFile(currentState.repository, filePath)) {
            throw new Error('Failed to delete file');
        }
        
        modals.hide('deleteFile');
        
        currentState.files = LocalStorageManager.listFiles(currentState.repository, currentState.path ? currentState.path + '/' : '');
        renderFileList();
        showSuccessMessage(`File "${fileName}" deleted successfully`);
        
        return true;
    }).catch((error) => {
        showErrorMessage(error.message);
    });
}

function deleteRepository(repoName) {
    if (!confirm(`Are you sure you want to delete repository "${repoName}"? This action cannot be undone.`)) {
        return;
    }
    
    fetchData('Deleting repository...', () => {
        if (!LocalStorageManager.deleteRepository(repoName)) {
            throw new Error('Failed to delete repository');
        }
        
        if (currentState.repository === repoName) {
            currentState.repository = null;
            currentState.path = '';
            currentState.files = [];
            showRepoSelector();
        }
        
        renderRepositoryList();
        showSuccessMessage(`Repository "${repoName}" deleted successfully`);
        
        return true;
    }).catch((error) => {
        showErrorMessage(error.message);
    });
}

function fetchData(message, callback) {
    return new Promise((resolve, reject) => {
        LoadingProgress.show();
        
        setTimeout(() => {
            try {
                const result = callback();
                LoadingProgress.hide();
                resolve(result);
            } catch (error) {
                LoadingProgress.hide();
                reject(error);
            }
        }, 100);
    });
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    toast.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    toast.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function setupCodeViewerEditor() {
    if (typeof CodeViewerEditor !== 'undefined') {
        window.codeViewerEditor = new CodeViewerEditor();
        codeViewerEditor.init();
        console.log('✅ CodeViewerEditor initialized successfully');
    } else {
        console.error('❌ CodeViewerEditor class not loaded');
    }
}

function addToRecentFiles(filename, repoName, filePath) {
    try {
        const recent = JSON.parse(localStorage.getItem('gitcodr_recent_files') || '[]');
        const entry = {
            filename,
            repoName,
            filePath,
            timestamp: Date.now()
        };
        
        const filtered = recent.filter(r => !(r.filename === filename && r.repoName === repoName && r.filePath === filePath));
        filtered.unshift(entry);
        
        const limited = filtered.slice(0, 10);
        localStorage.setItem('gitcodr_recent_files', JSON.stringify(limited));
        
        if (typeof renderRecentFilesList === 'function') {
            renderRecentFilesList();
        }
    } catch (error) {
        console.error('Failed to update recent files:', error);
    }
}

function updateStats() {
    const stats = {
        repositories: LocalStorageManager.getRepositories().length,
        files: currentState.files.length,
        currentRepo: currentState.repository
    };
    console.log('Stats updated:', stats);
}

function initializeApp() {
    console.log('🚀 Initializing GitDev Application...');
    
    LoadingProgress.config({
        incrementPace: 'realistic',
        minimum: 0.08,
        maximum: 0.994
    });
    
    setupCodeViewerEditor();
    
    const repos = LocalStorageManager.getRepositories();
    
    if (repos.length === 0) {
        showRepoSelector();
    } else {
        renderRepositoryList();
        const lastRepo = repos[0];
        if (lastRepo) {
            openRepository(lastRepo.name);
        }
    }
    
    renderRecentFilesList();
    updateStats();
    
    console.log('✅ GitDev Application Initialized');
}

window.initializeApp = initializeApp;
window.openRepository = openRepository;
window.createNewRepository = createNewRepository;
window.createFile = createFile;
window.confirmDeleteFile = confirmDeleteFile;
window.deleteRepository = deleteRepository;
window.viewFile = viewFile;
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