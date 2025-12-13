const App = {
    state: {
        repository: null,
        path: '',
        currentFile: null,
        repositories: [],
        files: [],
        recentFiles: []
    },

    async init() {
        this.setupEventListeners();
        this.setupRouter();
        this.loadInitialData();
        this.setupSidebars();
        
        await router.handleRoute();
        
        console.log('GitDev initialized');
    },

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.showSearchModal();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showCreateFileModal();
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.showCreateRepoModal();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.state.currentFile) this.saveFile();
            }
            if (e.key === 'Escape') this.closeAllModals();
        });
    },

    setupRouter() {
        router.register('/', () => this.showRepoSelector());
        router.register('/repo/:repoName', (data) => this.showRepository(data.repoName));
        router.register('/repo/:repoName/edit/:filePath*', (data) => this.editFile(data.repoName, data.filePath));
        router.register('/repo/:repoName/view/:filePath*', (data) => this.viewFile(data.repoName, data.filePath));
        router.register('/settings', () => this.showSettings());
    },

    async loadInitialData() {
        this.state.repositories = LocalStorageManager.getRepositories();
        this.state.recentFiles = JSON.parse(localStorage.getItem('gitcodr_recent_files') || '[]');
    },

    async showRepoSelector() {
        App.showGlobalLoading('Loading repositories...');
        
        try {
            await templateManager.render('repoSelector', document.getElementById('mainContent'), {
                repositories: this.state.repositories
            });
            this.setupRepoSelectorEvents();
        } catch (error) {
            this.showErrorMessage('Failed to load repositories');
        }
    },

    async showRepository(repoName) {
        App.showGlobalLoading(`Opening ${repoName}...`);
        
        try {
            this.state.repository = repoName;
            this.state.path = '';
            this.state.files = LocalStorageManager.listFiles(repoName, '');
            
            await templateManager.render('repository', document.getElementById('mainContent'), {
                repoName: repoName,
                files: this.state.files,
                repo: LocalStorageManager.getRepository(repoName)
            });
            
            this.setupRepositoryEvents();
            this.updateSidebars();
        } catch (error) {
            this.showErrorMessage('Failed to open repository');
        }
    },

    async viewFile(repoName, filePath) {
        App.showGlobalLoading(`Loading ${filePath}...`);
        
        try {
            const fileData = LocalStorageManager.getFile(repoName, filePath);
            if (!fileData) throw new Error('File not found');
            
            this.state.currentFile = {
                name: filePath.split('/').pop(),
                path: filePath,
                data: fileData
            };
            
            await templateManager.render('fileViewer', document.getElementById('mainContent'), {
                fileName: this.state.currentFile.name,
                fileData: fileData,
                repoName: repoName
            });
            
            this.setupFileViewerEvents();
            this.addToRecentFiles(this.state.currentFile.name, repoName, filePath);
        } catch (error) {
            this.showErrorMessage('Failed to load file');
        }
    },

    async editFile(repoName, filePath) {
        App.showEditorLoading();
        
        try {
            const fileData = LocalStorageManager.getFile(repoName, filePath);
            if (!fileData) throw new Error('File not found');
            
            this.state.currentFile = {
                name: filePath.split('/').pop(),
                path: filePath,
                data: fileData
            };
            
            await templateManager.render('fileEditor', document.getElementById('mainContent'), {
                fileName: this.state.currentFile.name,
                fileData: fileData,
                repoName: repoName
            });
            
            this.setupCodeEditor();
            this.setupFileEditorEvents();
        } catch (error) {
            this.showErrorMessage('Failed to load editor');
        } finally {
            App.hideEditorLoading();
        }
    },

    async saveFile() {
        if (!this.state.currentFile || !this.state.repository) return;
        
        App.showEditorLoading('Saving...');
        
        try {
            const editor = window.codeEditor;
            if (!editor) throw new Error('Editor not found');
            
            const content = editor.getValue();
            const commitMessage = document.getElementById('commitTitle')?.value || `Update ${this.state.currentFile.name}`;
            
            const fileData = {
                content: content,
                category: document.getElementById('fileCategoryInput')?.value || 'General',
                tags: this.state.selectedTags || [],
                lastModified: Date.now(),
                created: this.state.currentFile.data.created || Date.now(),
                lastCommit: commitMessage,
                size: new Blob([content]).size
            };
            
            LocalStorageManager.saveFile(this.state.repository, this.state.currentFile.path, fileData);
            
            App.showSuccessMessage(`Saved ${this.state.currentFile.name}`);
            
            setTimeout(() => {
                router.navigate(`/repo/${this.state.repository}/view/${this.state.currentFile.path}`);
            }, 500);
        } catch (error) {
            this.showErrorMessage('Failed to save file');
        } finally {
            App.hideEditorLoading();
        }
    },

    showGlobalLoading(message = 'Loading...') {
        const progress = document.getElementById('globalProgress');
        const loadingText = document.getElementById('loadingText');
        
        if (progress) {
            progress.classList.remove('hidden');
            progress.classList.add('visible');
        }
        
        if (loadingText) loadingText.textContent = message;
        
        document.body.style.cursor = 'wait';
    },

    hideGlobalLoading() {
        const progress = document.getElementById('globalProgress');
        if (progress) {
            progress.classList.remove('visible');
            setTimeout(() => progress.classList.add('hidden'), 300);
        }
        
        document.body.style.cursor = 'default';
    },

    showEditorLoading(message = '') {
        const editorContainer = document.getElementById('codeEditorContainer');
        if (!editorContainer) return;
        
        const loader = document.createElement('div');
        loader.className = 'code-editor-loading';
        loader.innerHTML = `
            <div class="flex flex-col items-center">
                <div class="w-8 h-8 border-2 border-github-accent-fg border-t-transparent rounded-full animate-spin mb-2"></div>
                ${message ? `<p class="text-github-fg-muted text-sm">${message}</p>` : ''}
            </div>
        `;
        
        editorContainer.style.position = 'relative';
        editorContainer.appendChild(loader);
    },

    hideEditorLoading() {
        const editorContainer = document.getElementById('codeEditorContainer');
        if (!editorContainer) return;
        
        const loader = editorContainer.querySelector('.code-editor-loading');
        if (loader) loader.remove();
    },

    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-github-success-fg text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-down';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-check"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    },

    showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-github-danger-fg text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-down';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    },

    setupSidebars() {
        this.updateLeftSidebar();
        this.updateRightSidebar();
        this.setupSidebarEvents();
    },

    updateLeftSidebar() {
        const sidebar = document.getElementById('leftSidebar');
        if (!sidebar) return;
        
        sidebar.innerHTML = `
            <div class="p-4 h-full overflow-y-auto">
                <div class="profile-section">
                    <img src="https://dev.wuaze.com/banner.png" alt="Profile" class="profile-avatar">
                    <div class="profile-info">
                        <h3 class="profile-name">GitDev</h3>
                        <span class="profile-username">Local File Manager</span>
                    </div>
                    <button onclick="App.showCreateRepoModal()" class="w-full mt-3 px-3 py-2 bg-github-btn-primary-bg hover:bg-github-btn-primary-hover text-white rounded-md text-sm font-medium transition-colors">
                        <i class="fas fa-plus mr-2"></i>
                        New Repository
                    </button>
                </div>
                
                <div class="mb-6">
                    <span class="sidebar-title">Quick Actions</span>
                    <div class="space-y-1">
                        <button onclick="App.showCreateFileModal()" class="sidebar-link">
                            <i class="fas fa-file mr-2"></i>
                            New File
                        </button>
                        <button onclick="router.navigate('/')" class="sidebar-link">
                            <i class="fas fa-folder mr-2"></i>
                            Browse Repositories
                        </button>
                    </div>
                </div>
                
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="sidebar-title">Repositories</span>
                        <span class="text-xs text-github-fg-muted">${this.state.repositories.length}</span>
                    </div>
                    <div id="repoListSidebar" class="space-y-1">
                        ${this.state.repositories.map(repo => `
                            <div class="repo-item ${this.state.repository === repo.name ? 'active' : ''}" 
                                 onclick="router.navigate('/repo/${repo.name}')">
                                <i class="fas fa-folder repo-icon ${repo.visibility === 'public' ? 'public' : ''}"></i>
                                <span class="flex-1 truncate">${repo.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    updateRightSidebar() {
        const sidebar = document.getElementById('rightSidebar');
        if (!sidebar) return;
        
        sidebar.innerHTML = `
            <div class="p-4 h-full overflow-y-auto">
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="sidebar-title">Recent Files</span>
                        <button onclick="App.refreshRecentFiles()" class="text-xs text-github-accent-fg hover:underline">
                            Refresh
                        </button>
                    </div>
                    <div id="recentFilesList" class="space-y-2">
                        ${this.state.recentFiles.slice(0, 5).map(file => `
                            <button onclick="App.openRecentFile('${file.repoName}', '${file.filePath}')" 
                                    class="w-full flex items-center justify-between p-2 rounded hover:bg-github-canvas-subtle text-left group">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-file text-sm text-github-fg-muted"></i>
                                        <span class="text-sm text-github-fg-default truncate">${file.fileName}</span>
                                    </div>
                                    <div class="text-xs text-github-fg-muted truncate mt-1">${file.repoName}</div>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                ${this.state.repository ? `
                <div class="mb-6">
                    <span class="sidebar-title">Current Repository</span>
                    <div class="p-3 bg-github-canvas-subtle rounded-md mt-2">
                        <h4 class="font-semibold text-github-fg-default mb-1">${this.state.repository}</h4>
                        <div class="flex items-center justify-between text-xs mt-2">
                            <span class="text-github-fg-muted">Files:</span>
                            <span class="font-medium">${this.state.files.length}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    },

    setupSidebarEvents() {
        const leftTrigger = document.getElementById('leftSidebarTrigger');
        const rightTrigger = document.getElementById('rightSidebarTrigger');
        const overlay = document.getElementById('globalOverlay');
        
        if (leftTrigger) {
            leftTrigger.addEventListener('click', () => this.toggleSidebar('left'));
        }
        
        if (rightTrigger) {
            rightTrigger.addEventListener('click', () => this.toggleSidebar('right'));
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => this.closeSidebars());
        }
    },

    toggleSidebar(side) {
        const sidebar = document.getElementById(`${side}Sidebar`);
        const overlay = document.getElementById('globalOverlay');
        
        if (window.innerWidth <= 1200) {
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                overlay.classList.add('hidden');
            } else {
                this.closeSidebars();
                sidebar.classList.add('open');
                overlay.classList.remove('hidden');
            }
        }
    },

    closeSidebars() {
        document.querySelectorAll('.sidebar').forEach(sidebar => {
            sidebar.classList.remove('open');
        });
        document.getElementById('globalOverlay').classList.add('hidden');
    },

    async openRecentFile(repoName, filePath) {
        await router.navigate(`/repo/${repoName}/view/${filePath}`);
    },

    refreshRecentFiles() {
        this.state.recentFiles = JSON.parse(localStorage.getItem('gitcodr_recent_files') || '[]');
        this.updateRightSidebar();
        this.showSuccessMessage('Recent files refreshed');
    },

    addToRecentFiles(fileName, repoName, filePath) {
        const existingIndex = this.state.recentFiles.findIndex(f => 
            f.filePath === filePath && f.repoName === repoName
        );
        
        if (existingIndex !== -1) {
            this.state.recentFiles.splice(existingIndex, 1);
        }
        
        this.state.recentFiles.unshift({
            fileName,
            repoName,
            filePath,
            timestamp: Date.now()
        });
        
        if (this.state.recentFiles.length > 10) {
            this.state.recentFiles = this.state.recentFiles.slice(0, 10);
        }
        
        localStorage.setItem('gitcodr_recent_files', JSON.stringify(this.state.recentFiles));
        this.updateRightSidebar();
    },

    toggleTheme() {
        const html = document.documentElement;
        const themeIcons = document.querySelectorAll('#themeIcon, #sidebarThemeIcon');
        const isDark = html.getAttribute('data-theme') === 'dark';
        
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeIcons.forEach(icon => {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
        
        localStorage.setItem('gitcodr_theme', isDark ? 'light' : 'dark');
    },

    showCreateRepoModal() {
        templateManager.render('modalCreateRepo', document.getElementById('modalsContainer'));
    },

    showCreateFileModal() {
        if (!this.state.repository) {
            this.showErrorMessage('Please select a repository first');
            return;
        }
        templateManager.render('modalCreateFile', document.getElementById('modalsContainer'), {
            repoName: this.state.repository,
            path: this.state.path
        });
    },

    showSearchModal() {
        templateManager.render('modalSearch', document.getElementById('modalsContainer'));
    },

    closeAllModals() {
        document.getElementById('modalsContainer').innerHTML = '';
    }
};

window.App = App;