const modals = {
    create: {
        id: 'createRepoModal',
        icon: '<svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 16 16"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/></svg>',
        message: 'Create new repository',
        actions: [
            {
                text: 'Create repository',
                type: 'primary',
                onClick: 'createRepository()'
            },
            {
                text: 'Cancel',
                type: 'secondary',
                onClick: 'modals.hide("create")'
            }
        ]
    },
    
    createFile: {
        id: 'createFileModal',
        icon: '<svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 16 16"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/></svg>',
        message: 'Create new file',
        actions: [
            {
                text: 'Create file',
                type: 'primary',
                onClick: 'createFile()'
            },
            {
                text: 'Cancel',
                type: 'secondary',
                onClick: 'modals.hide("createFile")'
            }
        ]
    },
    
    deleteFile: {
        id: 'deleteFileModal',
        icon: '<svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16ZM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646Z"/></svg>',
        message: 'Delete file',
        warning: true,
        actions: [
            {
                text: 'Delete file',
                type: 'danger',
                onClick: 'confirmDeleteFile()'
            },
            {
                text: 'Cancel',
                type: 'secondary',
                onClick: 'modals.hide("deleteFile")'
            }
        ]
    },

    show: function(modalType, data = {}) {
        const modalConfig = this[modalType];
        if (!modalConfig) {
            console.error(`Modal type "${modalType}" not found`);
            return;
        }

        let modal = document.getElementById(modalConfig.id);
        if (!modal) {
            this.createModalElement(modalConfig);
            modal = document.getElementById(modalConfig.id);
        }

        this.updateModalContent(modalType, data);

        modal.classList.remove('hidden');
        modal.classList.add('flex');
          setTimeout(() => {
              const firstInput = modal.querySelector('input, textarea, select');
              if (firstInput) firstInput.focus();
          }, 100);
    },
    hide: function(modalType) {
        const modalConfig = this[modalType];
        if (!modalConfig) return;

        const modal = document.getElementById(modalConfig.id);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            
            // Clear forms
            if (modalType === 'create') {
                document.getElementById('newRepoName').value = '';
                document.getElementById('repoDescriptionInput').value = '';
                document.getElementById('visibilityPublic').checked = true;
                document.getElementById('initReadme').checked = true;
            } else if (modalType === 'createFile') {
                document.getElementById('newFileName').value = '';
                document.getElementById('fileCategoryInput').value = '';
                document.getElementById('tagInput').value = '';
                if (window.initialContentEditor) initialContentEditor.setValue('');
                if (window.currentState) {
                    currentState.selectedTags = [];
                    if (window.updateSelectedTags) updateSelectedTags();
                }
            }
        }
    },


    createModalElement: function(config) {
        let modalHTML = '';
        
        if (config.id === 'createRepoModal') {
            modalHTML = this.createRepoModalHTML();
        } else if (config.id === 'createFileModal') {
            modalHTML = this.createFileModalHTML();
        } else if (config.id === 'deleteFileModal') {
            modalHTML = this.deleteFileModalHTML();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add click outside to close
        const modal = document.getElementById(config.id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide(Object.keys(this).find(key => this[key] === config));
                }
            });
        }
    },
    createRepoModalHTML: function() {
        return `
            <div id="createRepoModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                <div class="bg-github-canvas-default rounded-lg shadow-2xl w-full max-w-md border border-github-border-default">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            ${this.create.icon}
                            <h2 class="text-xl font-semibold text-github-fg-default">${this.create.message}</h2>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-github-fg-default mb-2">
                                    Repository name
                                </label>
                                <input type="text" id="newRepoName" placeholder="my-new-repo" class="w-full px-3 py-2 bg-github-canvas-inset border border-github-border-default rounded-md text-github-fg-default placeholder-github-fg-muted focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-github-fg-default mb-2">
                                    Description (optional)
                                </label>
                                <textarea id="repoDescriptionInput" rows="3" placeholder="A brief description of your repository" class="w-full px-3 py-2 bg-github-canvas-inset border border-github-border-default rounded-md text-github-fg-default placeholder-github-fg-muted focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-transparent resize-none"></textarea>
                            </div>
                            
                            <div class="space-y-3">
                                <label class="block text-sm font-semibold text-github-fg-default mb-2">
                                    Visibility
                                </label>
                                <div class="flex items-center space-x-4">
                                    <label class="flex items-center">
                                        <input type="radio" id="visibilityPublic" name="visibility" value="public" checked class="mr-2">
                                        <span class="text-github-fg-default">Public</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" id="visibilityPrivate" name="visibility" value="private" class="mr-2">
                                        <span class="text-github-fg-default">Private</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="flex items-center">
                                <input type="checkbox" id="initReadme" checked class="mr-2">
                                <label for="initReadme" class="text-github-fg-default text-sm">Initialize with a README</label>
                            </div>
                        </div>
                        
                        <div class="flex gap-3 mt-6">
                            ${this.create.actions.map(action => `
                                <button onclick="${action.onClick}" class="flex-1 px-4 py-2 ${this.getButtonClass(action.type)} rounded-md font-medium transition-colors">
                                    ${action.text}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    createFileModalHTML: function() {
        return `
            <div id="createFileModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                <div class="bg-github-canvas-default rounded-lg shadow-2xl w-full max-w-2xl border border-github-border-default">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            ${this.createFile.icon}
                            <h2 class="text-xl font-semibold text-github-fg-default">${this.createFile.message}</h2>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-github-fg-default mb-2">
                                File name
                            </label>
                            <div class="flex items-center">
                                <span class="px-3 py-2 bg-github-canvas-inset border border-github-border-default border-r-0 rounded-l-md text-github-fg-muted" id="currentPathPrefix">
                                    ${currentState.repository + (currentState.path ? '/' + currentState.path : '')}/
                                </span>
                                <input type="text" id="newFileName" placeholder="index.js" class="flex-1 px-3 py-2 bg-github-canvas-inset border border-github-border-default rounded-r-md text-github-fg-default placeholder-github-fg-muted focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-transparent">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-semibold text-github-fg-default mb-2">
                                    Category
                                </label>
                                <input type="text" id="fileCategoryInput" placeholder="General" class="w-full px-3 py-2 bg-github-canvas-inset border border-github-border-default rounded-md text-github-fg-default placeholder-github-fg-muted focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-github-fg-default mb-2">
                                    Tags
                                </label>
                                <div class="flex">
                                    <input type="text" id="tagInput" placeholder="Add tags..." class="flex-1 px-3 py-2 bg-github-canvas-inset border border-github-border-default rounded-l-md text-github-fg-default placeholder-github-fg-muted focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-transparent">
                                    <button onclick="addTag()" class="px-4 py-2 bg-github-btn-primary-bg hover:bg-github-btn-primary-hover text-white rounded-r-md">
                                        Add
                                    </button>
                                </div>
                                <div id="selectedTags" class="flex flex-wrap gap-1 mt-2"></div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-github-fg-default mb-2">
                                Initial content (optional)
                            </label>
                            <div id="initialContentEditor" class="h-48"></div>
                        </div>
                        
                        <div class="flex gap-3 mt-6">
                            ${this.createFile.actions.map(action => `
                                <button onclick="${action.onClick}" class="flex-1 px-4 py-2 ${this.getButtonClass(action.type)} rounded-md font-medium transition-colors">
                                    ${action.text}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },


    deleteFileModalHTML: function() {
        return `
            <div id="deleteFileModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                <div class="bg-github-canvas-default rounded-lg shadow-2xl w-full max-w-md border border-github-border-default">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            ${this.deleteFile.icon}
                            <h2 class="text-xl font-semibold text-github-fg-default">${this.deleteFile.message}</h2>
                        </div>
                        
                        <p class="text-github-fg-muted mb-6">
                            Are you sure you want to delete <span id="fileToDeleteName" class="font-semibold text-github-fg-default"></span>? This action cannot be undone.
                        </p>
                        
                        <div class="flex gap-3">
                            ${this.deleteFile.actions.map(action => `
                                <button onclick="${action.onClick}" class="flex-1 px-4 py-2 ${this.getButtonClass(action.type)} rounded-md font-medium transition-colors">
                                    ${action.text}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },


    updateModalContent: function(modalType, data) {
        if (modalType === 'createFile') {
            const prefix = document.getElementById('currentPathPrefix');
            if (prefix && currentState.repository) {
                prefix.textContent = currentState.repository + (currentState.path ? '/' + currentState.path : '') + '/';
            }
        } else if (modalType === 'deleteFile') {
            const fileNameEl = document.getElementById('fileToDeleteName');
            if (fileNameEl && currentState.currentFile) {
                fileNameEl.textContent = currentState.currentFile.name;
            }
        }
    },
    getButtonClass: function(type) {
        switch(type) {
            case 'primary':
                return 'bg-github-btn-primary-bg hover:bg-github-btn-primary-hover text-white';
            case 'danger':
                return 'bg-github-danger-fg hover:bg-red-700 text-white';
            case 'secondary':
                return 'border border-github-border-default hover:bg-github-canvas-overlay text-github-fg-default';
            default:
                return 'border border-github-border-default hover:bg-github-canvas-overlay text-github-fg-default';
        }
    }
};

function showContextMenu(x, y, fileName, fileType) {
    hideContextMenu();
    const menu = document.createElement('div');
    menu.id = 'contextMenu';
    menu.className = 'fixed bg-github-canvas-overlay border border-github-border-default rounded-lg shadow-2xl py-2 z-50 min-w-[160px]';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    let html = `<button onclick="viewFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/></svg><span>View</span></button>`;
    
    if (fileType === 'file') {
        html += `
            <button onclick="editFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"/>
                </svg>
                <span>Edit</span>
            </button>
            <button onclick="downloadFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
                    <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
                </svg>
                <span>Download</span>
            </button>
        `;
    }
    
    html += `
        <div class="border-t border-github-border-muted my-1"></div>
        <button onclick="deleteFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-danger-fg hover:bg-github-canvas-subtle flex items-center space-x-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.748 1.748 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/>
            </svg>
            <span>Delete</span>
        </button>
    `;
    
    menu.innerHTML = html;
    document.body.appendChild(menu);
    
    // Position adjustment
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = `${x - rect.width}px`;
    if (rect.bottom > window.innerHeight) menu.style.top = `${y - rect.height}px`;
}
function hideContextMenu() {
    const menu = document.getElementById('contextMenu');
    if (menu) menu.remove();
}


function showLoading(text = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    LoadingProgress.show();
    
    if (overlay && loadingText) {
        loadingText.textContent = text;
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    }
}
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    
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
        setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
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
        setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
// Allows multiple referencing for:
    // Modals
    window.showCreateRepoModal = function() { modals.show('create'); };
    window.showCreateFileModal = function() { modals.show('createFile'); };
    window.showDeleteFileModal = function() { modals.show('deleteFile'); };
    
    // Modals ( hiding )
    window.hideCreateRepoModal = function() { modals.hide('create'); };
    window.hideCreateFileModal = function() { modals.hide('createFile'); };
    window.hideDeleteFileModal = function() { modals.hide('deleteFile'); };
    
    // Right-click Context Menu
    window.hideContextMenu = hideContextMenu;
});

window.modals = modals;
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