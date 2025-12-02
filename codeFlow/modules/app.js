// Update the snippet viewer rendering to fix display issues
renderSnippetViewer(id) {
    const snippet = this.state.snippets.find(s => s.id === id);
    if (!snippet) {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3 class="empty-title">Snippet not found</h3>
                <p class="empty-description">
                    The snippet you're looking for doesn't exist or has been deleted.
                </p>
                <button class="btn btn-primary" onclick="app.navigateTo('home')">
                    Back to Snippets
                </button>
            </div>
        `;
    }

    // Calculate display properties
    const hasMultipleFiles = snippet.files.length > 1;
    const shouldShowSidebar = hasMultipleFiles && window.innerWidth > 768;

    return `
        <div class="page">
            <div class="viewer-container" style="height: ${hasMultipleFiles ? '70vh' : 'auto'};">
                <div class="viewer-header">
                    <h1 class="viewer-title">${snippet.title}</h1>
                    ${snippet.description ? `
                        <p class="viewer-description">${snippet.description}</p>
                    ` : ''}
                    
                    <div class="viewer-meta">
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span>${this.state.currentUser.username}</span>
                        </div>
                        <div class="meta-item">
                            <i class="far fa-clock"></i>
                            <span>Created ${this.formatDate(snippet.createdAt)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-sync"></i>
                            <span>Updated ${this.formatTimeAgo(snippet.updatedAt)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas ${snippet.isPublic ? 'fa-globe' : 'fa-lock'}"></i>
                            <span>${snippet.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                    </div>
                    
                    ${snippet.tags && snippet.tags.length > 0 ? `
                        <div class="tag-container">
                            ${snippet.tags.map(tag => `
                                <span class="tag">${tag}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="viewer-body">
                    ${shouldShowSidebar ? `
                        <div class="viewer-sidebar" id="viewer-sidebar">
                            <div class="file-tree">
                                ${snippet.files.map((file, index) => `
                                    <div class="file-item ${index === 0 ? 'active' : ''}" 
                                         data-file-index="${index}"
                                         onclick="app.selectViewerFile(${index})">
                                        <i class="fas fa-file-code file-icon"></i>
                                        <span>${file.filename}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="code-viewer" ${!shouldShowSidebar ? 'style="width: 100%;"' : ''}>
                        <div class="code-container">
                            <div class="code-header">
                                <div class="code-filename">
                                    <i class="fas fa-file-code"></i>
                                    <span id="current-filename">${snippet.files[0]?.filename || 'Untitled'}</span>
                                </div>
                                <div class="code-actions">
                                    <button class="btn-icon" onclick="app.copyCurrentFileContent('${id}')" title="Copy code">
                                        <i class="far fa-copy"></i>
                                    </button>
                                    <button class="btn-icon" onclick="app.downloadCurrentFile('${id}')" title="Download file">
                                        <i class="fas fa-download"></i>
                                    </button>
                                    ${!shouldShowSidebar && hasMultipleFiles ? `
                                        <button class="btn-icon" onclick="app.showFileSelector('${id}')" title="Select file">
                                            <i class="fas fa-list"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="code-content">
                                <pre id="code-display"><code class="language-${snippet.files[0]?.language || 'text'}" id="code-content">${this.escapeHtml(snippet.files[0]?.content || '')}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="viewer-actions">
                <button class="btn btn-primary" onclick="app.editSnippet('${snippet.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary" onclick="app.forkSnippet('${snippet.id}')">
                    <i class="fas fa-code-branch"></i> Fork
                </button>
                <button class="btn btn-secondary" onclick="app.shareSnippet('${snippet.id}')">
                    <i class="fas fa-share"></i> Share
                </button>
                <button class="btn btn-secondary" onclick="app.downloadSnippet('${snippet.id}')">
                    <i class="fas fa-download"></i> Download ZIP
                </button>
                <button class="btn btn-danger" onclick="app.deleteSnippet('${snippet.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

initializeViewer(id) {
    const snippet = this.state.snippets.find(s => s.id === id);
    if (!snippet) return;

    // Store current snippet ID for reference
    this.currentViewingSnippetId = id;
    
    // Highlight syntax for first file
    this.highlightCode();
    
    // Initialize file selector for mobile
    if (window.innerWidth <= 768 && snippet.files.length > 1) {
        this.initializeMobileFileSelector(snippet);
    }
}

highlightCode() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const codeElement = document.getElementById('code-content');
        if (codeElement) {
            // Remove existing Prism classes
            codeElement.className = '';
            
            // Get language from filename or use 'text' as default
            const snippet = this.state.snippets.find(s => s.id === this.currentViewingSnippetId);
            if (snippet && snippet.files.length > 0) {
                const file = snippet.files[0];
                const language = file.language || 'text';
                codeElement.className = `language-${language}`;
            }
            
            // Apply Prism highlighting
            Prism.highlightAll();
        }
    }, 100);
}

selectViewerFile(index) {
    const snippet = this.state.snippets.find(s => s.id === this.currentViewingSnippetId);
    if (!snippet || !snippet.files[index]) return;

    const file = snippet.files[index];
    
    // Update filename display
    const filenameElement = document.getElementById('current-filename');
    if (filenameElement) {
        filenameElement.textContent = file.filename;
    }
    
    // Update code content
    const codeElement = document.getElementById('code-content');
    if (codeElement) {
        codeElement.textContent = file.content;
        codeElement.className = `language-${file.language || 'text'}`;
        
        // Re-highlight syntax
        Prism.highlightElement(codeElement);
    }
    
    // Update active file in sidebar
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`.file-item[data-file-index="${index}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Scroll to top of code viewer
    const codeViewer = document.querySelector('.code-content');
    if (codeViewer) {
        codeViewer.scrollTop = 0;
    }
}

copyCurrentFileContent(snippetId) {
    const snippet = this.state.snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    const filenameElement = document.getElementById('current-filename');
    const currentFilename = filenameElement ? filenameElement.textContent : snippet.files[0].filename;
    
    const file = snippet.files.find(f => f.filename === currentFilename) || snippet.files[0];
    if (!file) return;

    navigator.clipboard.writeText(file.content)
        .then(() => this.showToast('Code copied to clipboard', 'success'))
        .catch(() => this.showToast('Failed to copy code', 'error'));
}

downloadCurrentFile(snippetId) {
    const snippet = this.state.snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    const filenameElement = document.getElementById('current-filename');
    const currentFilename = filenameElement ? filenameElement.textContent : snippet.files[0].filename;
    
    const file = snippet.files.find(f => f.filename === currentFilename) || snippet.files[0];
    if (!file) return;

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

showFileSelector(snippetId) {
    const snippet = this.state.snippets.find(s => s.id === snippetId);
    if (!snippet || snippet.files.length <= 1) return;

    const fileList = snippet.files.map((file, index) => 
        `${index + 1}. ${file.filename} (${file.language || 'text'})`
    ).join('\n');
    
    const selection = prompt(`Select a file:\n\n${fileList}\n\nEnter file number:`, '1');
    if (!selection) return;
    
    const index = parseInt(selection) - 1;
    if (index >= 0 && index < snippet.files.length) {
        this.selectViewerFile(index);
    }
}

initializeMobileFileSelector(snippet) {
    if (snippet.files.length <= 1) return;

    // Create a file selector dropdown for mobile
    const codeHeader = document.querySelector('.code-header');
    if (codeHeader) {
        const select = document.createElement('select');
        select.className = 'file-selector';
        select.style.marginRight = '8px';
        select.style.padding = '4px 8px';
        select.style.borderRadius = '4px';
        select.style.backgroundColor = 'var(--bg-tertiary)';
        select.style.color = 'var(--text-primary)';
        select.style.border = '1px solid var(--border-color)';
        
        snippet.files.forEach((file, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = file.filename;
            if (index === 0) option.selected = true;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            this.selectViewerFile(parseInt(e.target.value));
        });
        
        codeHeader.insertBefore(select, codeHeader.querySelector('.code-actions'));
    }
}







// Main Application Controller
class GistApp {
    constructor() {
        this.state = {
            currentPage: 'home',
            snippets: [],
            filteredSnippets: [],
            filters: {
                language: 'all',
                visibility: 'all',
                tags: [],
                search: ''
            },
            currentUser: {
                username: 'coder123',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
                bio: 'Passionate developer creating awesome snippets',
                stats: {
                    totalSnippets: 0,
                    publicSnippets: 0,
                    privateSnippets: 0
                }
            },
            editorSettings: {
                fontSize: 14,
                wordWrap: 'on',
                minimap: true,
                theme: 'dark-dimmed'
            },
            isLoading: true
        };

        this.init();
    }

    async init() {
        // Show loading spinner
        this.showLoading(true);

        // Initialize components
        await this.initializeComponents();

        // Load data
        await this.loadData();

        // Initialize router
        this.initRouter();

        // Set up event listeners
        this.setupEventListeners();

        // Hide loading spinner
        this.showLoading(false);
    }

    async initializeComponents() {
        // Initialize storage
        if (!window.storage) {
            window.storage = new StorageManager();
        }

        // Initialize router
        if (!window.router) {
            window.router = new Router();
        }

        // Initialize components
        if (!window.components) {
            window.components = new Components();
        }

        // Initialize editor
        if (!window.editor) {
            window.editor = new CodeEditor();
        }
    }

    async loadData() {
        try {
            // Load snippets from storage
            const data = await storage.getData();
            this.state.snippets = data.snippets || [];
            this.state.filteredSnippets = [...this.state.snippets];

            // Update user stats
            this.updateUserStats();

            // Apply any existing filters
            this.applyFilters();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading data', 'error');
        }
    }

    updateUserStats() {
        const stats = {
            totalSnippets: this.state.snippets.length,
            publicSnippets: this.state.snippets.filter(s => s.isPublic).length,
            privateSnippets: this.state.snippets.filter(s => !s.isPublic).length
        };
        
        this.state.currentUser.stats = stats;
        
        // Update UI if on profile page
        if (this.state.currentPage === 'profile') {
            this.renderProfile();
        }
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.opacity = show ? '1' : '0';
            spinner.style.pointerEvents = show ? 'all' : 'none';
            
            if (!show) {
                setTimeout(() => {
                    spinner.style.display = 'none';
                }, 300);
            }
        }
    }

    showProgress(progress) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                setTimeout(() => {
                    progressBar.style.width = '0';
                }, 300);
            }
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        window.components.showToast(message, type, duration);
    }

    navigateTo(page, params = {}) {
        this.state.currentPage = page;
        this.updateNavigation();
        this.renderPage(page, params);
    }

    updateNavigation() {
        // Update desktop nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === this.state.currentPage) {
                link.classList.add('active');
            }
        });

        // Update mobile bottom nav
        document.querySelectorAll('.bottom-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === this.state.currentPage) {
                link.classList.add('active');
            }
        });
    }

    renderPage(page, params = {}) {
        const mainContent = document.getElementById('main-content');
        
        // Show progress bar
        this.showProgress(30);

        let html = '';
        
        switch(page) {
            case 'home':
                html = this.renderGallery();
                break;
            case 'view':
                html = this.renderSnippetViewer(params.id);
                break;
            case 'edit':
                html = this.renderEditor(params.id);
                break;
            case 'new':
                html = this.renderEditor();
                break;
            case 'profile':
                html = this.renderProfile();
                break;
            default:
                html = this.renderGallery();
        }

        mainContent.innerHTML = html;
        
        // Complete progress
        this.showProgress(100);

        // Initialize page-specific functionality
        this.initializePage(page, params);
    }

    renderGallery() {
        return `
            <div class="page">
                <div class="gallery-header">
                    <h1 class="page-title">Your Snippets</h1>
                    <div class="gallery-controls">
                        <button class="btn btn-primary" onclick="app.navigateTo('new')">
                            <i class="fas fa-plus"></i> New Snippet
                        </button>
                        <button class="btn btn-secondary filter-toggle" onclick="app.toggleFilterSidebar()">
                            <i class="fas fa-filter"></i> Filter
                        </button>
                    </div>
                </div>
                
                <div class="gallery-content">
                    <div class="filter-sidebar" id="filter-sidebar">
                        <div class="filter-header">
                            <h3 class="filter-title">Filters</h3>
                            <button class="filter-close" onclick="app.toggleFilterSidebar()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="filter-section">
                            <h4 class="filter-title">Language</h4>
                            <div class="filter-options" id="language-filters">
                                <!-- Language filters will be populated dynamically -->
                            </div>
                        </div>
                        
                        <div class="filter-section">
                            <h4 class="filter-title">Visibility</h4>
                            <div class="filter-options">
                                <label class="filter-option">
                                    <input type="radio" name="visibility" value="all" checked 
                                           onchange="app.updateFilter('visibility', 'all')">
                                    All
                                </label>
                                <label class="filter-option">
                                    <input type="radio" name="visibility" value="public"
                                           onchange="app.updateFilter('visibility', 'public')">
                                    Public
                                </label>
                                <label class="filter-option">
                                    <input type="radio" name="visibility" value="private"
                                           onchange="app.updateFilter('visibility', 'private')">
                                    Private
                                </label>
                            </div>
                        </div>
                        
                        <div class="filter-section">
                            <button class="btn btn-secondary w-full" onclick="app.clearFilters()">
                                Clear Filters
                            </button>
                        </div>
                    </div>
                    
                    <div class="gallery-main">
                        ${this.renderSnippetGrid()}
                    </div>
                </div>
            </div>
        `;
    }

    renderSnippetGrid() {
        if (this.state.filteredSnippets.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-code"></i>
                    </div>
                    <h3 class="empty-title">No snippets found</h3>
                    <p class="empty-description">
                        ${this.state.snippets.length === 0 
                            ? 'Create your first snippet to get started!' 
                            : 'Try changing your filters or search query.'}
                    </p>
                    ${this.state.snippets.length === 0 ? `
                        <button class="btn btn-primary" onclick="app.navigateTo('new')">
                            Create First Snippet
                        </button>
                    ` : ''}
                </div>
            `;
        }

        return `
            <div class="gallery-grid">
                ${this.state.filteredSnippets.map(snippet => `
                    <div class="snippet-card" onclick="app.viewSnippet('${snippet.id}')">
                        <div class="snippet-header">
                            <div>
                                <h3 class="snippet-title">${snippet.title}</h3>
                                <p class="snippet-description">${snippet.description || 'No description'}</p>
                            </div>
                            <span class="visibility-badge">
                                ${snippet.isPublic ? 
                                    '<i class="fas fa-globe"></i>' : 
                                    '<i class="fas fa-lock"></i>'}
                            </span>
                        </div>
                        
                        ${snippet.files && snippet.files[0] ? `
                            <div class="snippet-preview">
                                <pre><code>${this.escapeHtml(snippet.files[0].content.substring(0, 200))}</code></pre>
                            </div>
                        ` : ''}
                        
                        <div class="snippet-footer">
                            <div class="snippet-meta">
                                <span class="snippet-language">
                                    <span class="language-color" 
                                          style="background-color: ${this.getLanguageColor(snippet.languageStats)}"></span>
                                    ${this.getPrimaryLanguage(snippet.languageStats)}
                                </span>
                                <span>
                                    <i class="far fa-file"></i> ${snippet.files?.length || 0}
                                </span>
                                <span>
                                    <i class="far fa-clock"></i> ${this.formatTimeAgo(snippet.updatedAt)}
                                </span>
                            </div>
                            
                            <div class="snippet-actions">
                                <button class="action-btn" onclick="event.stopPropagation(); app.editSnippet('${snippet.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn" onclick="event.stopPropagation(); app.deleteSnippet('${snippet.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }


//  N E W

// Update the snippet viewer rendering to fix display issues
renderSnippetViewer(id) {
    const snippet = this.state.snippets.find(s => s.id === id);
    if (!snippet) {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3 class="empty-title">Snippet not found</h3>
                <p class="empty-description">
                    The snippet you're looking for doesn't exist or has been deleted.
                </p>
                <button class="btn btn-primary" onclick="app.navigateTo('home')">
                    Back to Snippets
                </button>
            </div>
        `;
    }

    // Calculate display properties
    const hasMultipleFiles = snippet.files.length > 1;
    const shouldShowSidebar = hasMultipleFiles && window.innerWidth > 768;

    return `
        <div class="page">
            <div class="viewer-container" style="height: ${hasMultipleFiles ? '70vh' : 'auto'};">
                <div class="viewer-header">
                    <h1 class="viewer-title">${snippet.title}</h1>
                    ${snippet.description ? `
                        <p class="viewer-description">${snippet.description}</p>
                    ` : ''}
                    
                    <div class="viewer-meta">
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span>${this.state.currentUser.username}</span>
                        </div>
                        <div class="meta-item">
                            <i class="far fa-clock"></i>
                            <span>Created ${this.formatDate(snippet.createdAt)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-sync"></i>
                            <span>Updated ${this.formatTimeAgo(snippet.updatedAt)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas ${snippet.isPublic ? 'fa-globe' : 'fa-lock'}"></i>
                            <span>${snippet.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                    </div>
                    
                    ${snippet.tags && snippet.tags.length > 0 ? `
                        <div class="tag-container">
                            ${snippet.tags.map(tag => `
                                <span class="tag">${tag}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="viewer-body">
                    ${shouldShowSidebar ? `
                        <div class="viewer-sidebar" id="viewer-sidebar">
                            <div class="file-tree">
                                ${snippet.files.map((file, index) => `
                                    <div class="file-item ${index === 0 ? 'active' : ''}" 
                                         data-file-index="${index}"
                                         onclick="app.selectViewerFile(${index})">
                                        <i class="fas fa-file-code file-icon"></i>
                                        <span>${file.filename}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="code-viewer" ${!shouldShowSidebar ? 'style="width: 100%;"' : ''}>
                        <div class="code-container">
                            <div class="code-header">
                                <div class="code-filename">
                                    <i class="fas fa-file-code"></i>
                                    <span id="current-filename">${snippet.files[0]?.filename || 'Untitled'}</span>
                                </div>
                                <div class="code-actions">
                                    <button class="btn-icon" onclick="app.copyCurrentFileContent('${id}')" title="Copy code">
                                        <i class="far fa-copy"></i>
                                    </button>
                                    <button class="btn-icon" onclick="app.downloadCurrentFile('${id}')" title="Download file">
                                        <i class="fas fa-download"></i>
                                    </button>
                                    ${!shouldShowSidebar && hasMultipleFiles ? `
                                        <button class="btn-icon" onclick="app.showFileSelector('${id}')" title="Select file">
                                            <i class="fas fa-list"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="code-content">
                                <pre id="code-display"><code class="language-${snippet.files[0]?.language || 'text'}" id="code-content">${this.escapeHtml(snippet.files[0]?.content || '')}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="viewer-actions">
                <button class="btn btn-primary" onclick="app.editSnippet('${snippet.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary" onclick="app.forkSnippet('${snippet.id}')">
                    <i class="fas fa-code-branch"></i> Fork
                </button>
                <button class="btn btn-secondary" onclick="app.shareSnippet('${snippet.id}')">
                    <i class="fas fa-share"></i> Share
                </button>
                <button class="btn btn-secondary" onclick="app.downloadSnippet('${snippet.id}')">
                    <i class="fas fa-download"></i> Download ZIP
                </button>
                <button class="btn btn-danger" onclick="app.deleteSnippet('${snippet.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

initializeViewer(id) {
    const snippet = this.state.snippets.find(s => s.id === id);
    if (!snippet) return;

    // Store current snippet ID for reference
    this.currentViewingSnippetId = id;
    
    // Highlight syntax for first file
    this.highlightCode();
    
    // Initialize file selector for mobile
    if (window.innerWidth <= 768 && snippet.files.length > 1) {
        this.initializeMobileFileSelector(snippet);
    }
}

highlightCode() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const codeElement = document.getElementById('code-content');
        if (codeElement) {
            // Remove existing Prism classes
            codeElement.className = '';
            
            // Get language from filename or use 'text' as default
            const snippet = this.state.snippets.find(s => s.id === this.currentViewingSnippetId);
            if (snippet && snippet.files.length > 0) {
                const file = snippet.files[0];
                const language = file.language || 'text';
                codeElement.className = `language-${language}`;
            }
            
            // Apply Prism highlighting
            Prism.highlightAll();
        }
    }, 100);
}

selectViewerFile(index) {
    const snippet = this.state.snippets.find(s => s.id === this.currentViewingSnippetId);
    if (!snippet || !snippet.files[index]) return;

    const file = snippet.files[index];
    
    // Update filename display
    const filenameElement = document.getElementById('current-filename');
    if (filenameElement) {
        filenameElement.textContent = file.filename;
    }
    
    // Update code content
    const codeElement = document.getElementById('code-content');
    if (codeElement) {
        codeElement.textContent = file.content;
        codeElement.className = `language-${file.language || 'text'}`;
        
        // Re-highlight syntax
        Prism.highlightElement(codeElement);
    }
    
    // Update active file in sidebar
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`.file-item[data-file-index="${index}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Scroll to top of code viewer
    const codeViewer = document.querySelector('.code-content');
    if (codeViewer) {
        codeViewer.scrollTop = 0;
    }
}

copyCurrentFileContent(snippetId) {
    const snippet = this.state.snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    const filenameElement = document.getElementById('current-filename');
    const currentFilename = filenameElement ? filenameElement.textContent : snippet.files[0].filename;
    
    const file = snippet.files.find(f => f.filename === currentFilename) || snippet.files[0];
    if (!file) return;

    navigator.clipboard.writeText(file.content)
        .then(() => this.showToast('Code copied to clipboard', 'success'))
        .catch(() => this.showToast('Failed to copy code', 'error'));
}

downloadCurrentFile(snippetId) {
    const snippet = this.state.snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    const filenameElement = document.getElementById('current-filename');
    const currentFilename = filenameElement ? filenameElement.textContent : snippet.files[0].filename;
    
    const file = snippet.files.find(f => f.filename === currentFilename) || snippet.files[0];
    if (!file) return;

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

showFileSelector(snippetId) {
    const snippet = this.state.snippets.find(s => s.id === snippetId);
    if (!snippet || snippet.files.length <= 1) return;

    const fileList = snippet.files.map((file, index) => 
        `${index + 1}. ${file.filename} (${file.language || 'text'})`
    ).join('\n');
    
    const selection = prompt(`Select a file:\n\n${fileList}\n\nEnter file number:`, '1');
    if (!selection) return;
    
    const index = parseInt(selection) - 1;
    if (index >= 0 && index < snippet.files.length) {
        this.selectViewerFile(index);
    }
}

initializeMobileFileSelector(snippet) {
    if (snippet.files.length <= 1) return;

    // Create a file selector dropdown for mobile
    const codeHeader = document.querySelector('.code-header');
    if (codeHeader) {
        const select = document.createElement('select');
        select.className = 'file-selector';
        select.style.marginRight = '8px';
        select.style.padding = '4px 8px';
        select.style.borderRadius = '4px';
        select.style.backgroundColor = 'var(--bg-tertiary)';
        select.style.color = 'var(--text-primary)';
        select.style.border = '1px solid var(--border-color)';
        
        snippet.files.forEach((file, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = file.filename;
            if (index === 0) option.selected = true;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            this.selectViewerFile(parseInt(e.target.value));
        });
        
        codeHeader.insertBefore(select, codeHeader.querySelector('.code-actions'));
    }
}

//  N E W 







    renderEditor(id = null) {
        const isEditing = id !== null;
        const snippet = isEditing ? this.state.snippets.find(s => s.id === id) : null;
        
        return `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">${isEditing ? 'Edit Snippet' : 'New Snippet'}</h1>
                </div>
                
                <div class="editor-container" id="editor-container">
                    <div class="editor-header">
                        <div class="file-tabs" id="file-tabs">
                            <!-- File tabs will be populated dynamically -->
                        </div>
                        <div class="editor-toolbar">
                            <button class="btn-icon" onclick="editor.addNewFile()">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn-icon" onclick="editor.toggleSidebar()">
                                <i class="fas fa-folder"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="editor-main">
                        <div class="file-sidebar" id="file-sidebar">
                            <div class="file-tree" id="file-tree">
                                <!-- File tree will be populated dynamically -->
                            </div>
                        </div>
                        
                        <div class="editor-wrapper">
                            <textarea id="code-editor" style="display: none;"></textarea>
                            <div id="editor-instance"></div>
                        </div>
                    </div>
                    
                    <div class="editor-footer">
                        <div class="editor-status">
                            <div class="status-item">
                                <i class="fas fa-code"></i>
                                <span id="language-display">JavaScript</span>
                            </div>
                            <div class="status-item">
                                <i class="fas fa-ruler"></i>
                                <span id="line-count">1 line</span>
                            </div>
                            <div class="status-item">
                                <i class="fas fa-font"></i>
                                <span id="character-count">0 chars</span>
                            </div>
                        </div>
                        <div class="editor-actions">
                            <button class="btn btn-secondary" onclick="app.navigateTo('home')">
                                Cancel
                            </button>
                            <button class="btn btn-primary" onclick="editor.saveSnippet()">
                                Save Snippet
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="editor-settings" style="margin-top: var(--space-4);">
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-input" id="snippet-title" 
                               value="${snippet ? snippet.title : ''}" 
                               placeholder="Enter snippet title">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-input form-textarea" id="snippet-description" 
                                  placeholder="Enter snippet description">${snippet ? snippet.description : ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-group">
                            <input type="checkbox" id="snippet-public" ${snippet && snippet.isPublic ? 'checked' : 'checked'}>
                            <span class="checkbox-label">Public Snippet</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tags (comma-separated)</label>
                        <input type="text" class="form-input" id="snippet-tags" 
                               value="${snippet && snippet.tags ? snippet.tags.join(', ') : ''}" 
                               placeholder="e.g., javascript, react, hooks">
                    </div>
                </div>
            </div>
        `;
    }

    renderProfile() {
        const stats = this.state.currentUser.stats;
        const languageStats = this.calculateLanguageStats();
        
        return `
            <div class="page">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <img src="${this.state.currentUser.avatar}" alt="Profile Avatar">
                    </div>
                    <div class="profile-info">
                        <h1>${this.state.currentUser.username}</h1>
                        <p class="profile-bio">${this.state.currentUser.bio}</p>
                        <div class="profile-stats">
                            <div class="stat-item">
                                <i class="fas fa-code"></i>
                                <span>${stats.totalSnippets} snippets</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-globe"></i>
                                <span>${stats.publicSnippets} public</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-lock"></i>
                                <span>${stats.privateSnippets} private</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-content">
                    <div class="stats-card">
                        <h3 class="stats-title">Language Distribution</h3>
                        <div class="language-stats">
                            ${Object.entries(languageStats).slice(0, 10).map(([lang, count]) => `
                                <div class="language-stat">
                                    <span>${lang}</span>
                                    <div class="language-bar">
                                        <div class="language-progress" 
                                             style="width: ${(count / stats.totalSnippets) * 100}%;
                                                    background-color: ${this.getLanguageColor(lang)}"></div>
                                    </div>
                                    <span>${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <h3 class="stats-title">Recent Activity</h3>
                        <div class="activity-list">
                            ${this.getRecentActivity().map(activity => `
                                <div class="activity-item" style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border-color);">
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>${activity.action}</span>
                                        <span style="color: var(--text-tertiary); font-size: 12px;">
                                            ${this.formatTimeAgo(activity.timestamp)}
                                        </span>
                                    </div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        ${activity.details}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateLanguageStats() {
        const stats = {};
        this.state.snippets.forEach(snippet => {
            if (snippet.languageStats) {
                Object.keys(snippet.languageStats).forEach(lang => {
                    stats[lang] = (stats[lang] || 0) + 1;
                });
            }
        });
        return stats;
    }

    getRecentActivity() {
        const activities = [];
        this.state.snippets.forEach(snippet => {
            activities.push({
                action: 'Created snippet',
                details: snippet.title,
                timestamp: snippet.createdAt
            });
            if (snippet.updatedAt !== snippet.createdAt) {
                activities.push({
                    action: 'Updated snippet',
                    details: snippet.title,
                    timestamp: snippet.updatedAt
                });
            }
        });
        
        return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
    }

    initializePage(page, params) {
        switch(page) {
            case 'home':
                this.initializeGallery();
                break;
            case 'view':
                this.initializeViewer(params.id);
                break;
            case 'edit':
            case 'new':
                this.initializeEditor(params.id);
                break;
        }
    }

    initializeGallery() {
        // Populate language filters
        this.populateLanguageFilters();
        
        // Initialize search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = this.state.filters.search;
            searchInput.addEventListener('input', (e) => {
                this.updateFilter('search', e.target.value);
            });
        }
    }

    populateLanguageFilters() {
        const languages = new Set();
        this.state.snippets.forEach(snippet => {
            if (snippet.languageStats) {
                Object.keys(snippet.languageStats).forEach(lang => {
                    languages.add(lang);
                });
            }
        });

        const container = document.getElementById('language-filters');
        if (container) {
            const options = Array.from(languages).sort().map(lang => `
                <label class="filter-option">
                    <input type="radio" name="language" value="${lang}" 
                           ${this.state.filters.language === lang ? 'checked' : ''}
                           onchange="app.updateFilter('language', '${lang}')">
                    ${lang}
                </label>
            `).join('');
            
            container.innerHTML = `
                <label class="filter-option">
                    <input type="radio" name="language" value="all" 
                           ${this.state.filters.language === 'all' ? 'checked' : ''}
                           onchange="app.updateFilter('language', 'all')">
                    All Languages
                </label>
                ${options}
            `;
        }
    }

    updateFilter(type, value) {
        this.state.filters[type] = value;
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.state.snippets];

        // Apply search filter
        if (this.state.filters.search) {
            const searchTerm = this.state.filters.search.toLowerCase();
            filtered = filtered.filter(snippet => 
                snippet.title.toLowerCase().includes(searchTerm) ||
                snippet.description?.toLowerCase().includes(searchTerm) ||
                snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                snippet.files?.some(file => 
                    file.content.toLowerCase().includes(searchTerm) ||
                    file.filename.toLowerCase().includes(searchTerm)
                )
            );
        }

        // Apply language filter
        if (this.state.filters.language !== 'all') {
            filtered = filtered.filter(snippet => 
                snippet.languageStats && 
                snippet.languageStats[this.state.filters.language]
            );
        }

        // Apply visibility filter
        if (this.state.filters.visibility !== 'all') {
            filtered = filtered.filter(snippet => 
                this.state.filters.visibility === 'public' ? snippet.isPublic : !snippet.isPublic
            );
        }

        this.state.filteredSnippets = filtered;
        this.renderGalleryContent();
    }

    renderGalleryContent() {
        const galleryMain = document.querySelector('.gallery-main');
        if (galleryMain) {
            galleryMain.innerHTML = this.renderSnippetGrid();
        }
    }

    clearFilters() {
        this.state.filters = {
            language: 'all',
            visibility: 'all',
            tags: [],
            search: ''
        };
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.applyFilters();
        this.populateLanguageFilters();
    }

    toggleFilterSidebar() {
        const sidebar = document.getElementById('filter-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }

    viewSnippet(id) {
        window.location.hash = `/snippet/${id}`;
    }

    editSnippet(id) {
        window.location.hash = `/edit/${id}`;
    }

    async deleteSnippet(id) {
        if (!confirm('Are you sure you want to delete this snippet?')) {
            return;
        }

        try {
            this.showProgress(30);
            
            // Find snippet index
            const index = this.state.snippets.findIndex(s => s.id === id);
            if (index !== -1) {
                // Remove from arrays
                this.state.snippets.splice(index, 1);
                this.state.filteredSnippets = this.state.filteredSnippets.filter(s => s.id !== id);
                
                // Save to storage
                await storage.saveData({ snippets: this.state.snippets });
                
                // Update user stats
                this.updateUserStats();
                
                this.showToast('Snippet deleted successfully', 'success');
                
                // If we're on the snippet view, go back to gallery
                if (this.state.currentPage === 'view') {
                    this.navigateTo('home');
                } else {
                    this.renderGalleryContent();
                }
            }
            
            this.showProgress(100);
        } catch (error) {
            console.error('Error deleting snippet:', error);
            this.showToast('Error deleting snippet', 'error');
        }
    }

    forkSnippet(id) {
        const snippet = this.state.snippets.find(s => s.id === id);
        if (snippet) {
            // Create a fork
            const forkedSnippet = {
                ...JSON.parse(JSON.stringify(snippet)),
                id: this.generateId(),
                title: `${snippet.title} (Fork)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                metadata: {
                    ...snippet.metadata,
                    forkCount: (snippet.metadata.forkCount || 0) + 1
                }
            };
            
            // Navigate to editor with forked snippet
            editor.loadSnippet(forkedSnippet);
            this.navigateTo('new');
        }
    }

    shareSnippet(id) {
        const snippet = this.state.snippets.find(s => s.id === id);
        if (snippet && snippet.isPublic) {
            const url = `${window.location.origin}#/snippet/${id}`;
            navigator.clipboard.writeText(url)
                .then(() => this.showToast('Link copied to clipboard', 'success'))
                .catch(() => this.showToast('Failed to copy link', 'error'));
        } else {
            this.showToast('Private snippets cannot be shared', 'error');
        }
    }

    async downloadSnippet(id) {
        const snippet = this.state.snippets.find(s => s.id === id);
        if (!snippet) return;

        try {
            this.showProgress(30);
            
            // Create ZIP file
            const zip = new JSZip();
            
            // Add each file to the ZIP
            snippet.files.forEach(file => {
                zip.file(file.filename, file.content);
            });
            
            // Add metadata file
            const metadata = {
                title: snippet.title,
                description: snippet.description,
                createdAt: snippet.createdAt,
                updatedAt: snippet.updatedAt,
                tags: snippet.tags,
                languageStats: snippet.languageStats
            };
            zip.file('metadata.json', JSON.stringify(metadata, null, 2));
            
            // Generate and download ZIP
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${snippet.title.replace(/\s+/g, '_')}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showProgress(100);
            this.showToast('Snippet downloaded successfully', 'success');
        } catch (error) {
            console.error('Error downloading snippet:', error);
            this.showToast('Error downloading snippet', 'error');
        }
    }

    downloadFile(fileId, filename) {
        const snippet = this.state.snippets.find(s => 
            s.files?.some(f => f.id === fileId)
        );
        if (!snippet) return;

        const file = snippet.files.find(f => f.id === fileId);
        if (!file) return;

        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    copyFileContent(fileId) {
        const snippet = this.state.snippets.find(s => 
            s.files?.some(f => f.id === fileId)
        );
        if (!snippet) return;

        const file = snippet.files.find(f => f.id === fileId);
        if (!file) return;

        navigator.clipboard.writeText(file.content)
            .then(() => this.showToast('Code copied to clipboard', 'success'))
            .catch(() => this.showToast('Failed to copy code', 'error'));
    }

    selectViewerFile(index) {
        // Hide all file contents
        document.querySelectorAll('.code-container').forEach(container => {
            container.classList.add('hidden');
        });
        
        // Show selected file content
        const selected = document.getElementById(`file-content-${index}`);
        if (selected) {
            selected.classList.remove('hidden');
        }
        
        // Update active file in sidebar
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`.file-item[data-file-index="${index}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // Highlight syntax
        Prism.highlightAll();
    }

    initializeViewer(id) {
        this.selectViewerFile(0);
        Prism.highlightAll();
    }

    initializeEditor(id) {
        if (id) {
            const snippet = this.state.snippets.find(s => s.id === id);
            if (snippet) {
                editor.loadSnippet(snippet);
            }
        } else {
            editor.initialize();
        }
    }

    initRouter() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.substring(1) || '/';
        const parts = hash.split('/').filter(p => p);
        
        if (parts.length === 0 || parts[0] === '') {
            this.navigateTo('home');
        } else if (parts[0] === 'snippet' && parts[1]) {
            this.navigateTo('view', { id: parts[1] });
        } else if (parts[0] === 'edit' && parts[1]) {
            this.navigateTo('edit', { id: parts[1] });
        } else if (parts[0] === 'new') {
            this.navigateTo('new');
        } else if (parts[0] === 'profile') {
            this.navigateTo('profile');
        } else {
            this.navigateTo('home');
        }
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.documentElement.setAttribute('data-theme', 
                    document.documentElement.getAttribute('data-theme') === 'dark-dimmed' ? 'light' : 'dark-dimmed'
                );
            });
        }

        // Mobile navigation toggle
        const mobileNavToggle = document.getElementById('mobile-nav-toggle');
        if (mobileNavToggle) {
            mobileNavToggle.addEventListener('click', () => {
                const mobileNavContent = document.getElementById('mobile-nav-content');
                if (mobileNavContent) {
                    mobileNavContent.classList.toggle('active');
                }
            });
        }

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            const mobileNavContent = document.getElementById('mobile-nav-content');
            const mobileNavToggle = document.getElementById('mobile-nav-toggle');
            
            if (mobileNavContent && mobileNavToggle && 
                !mobileNavContent.contains(e.target) && 
                !mobileNavToggle.contains(e.target)) {
                mobileNavContent.classList.remove('active');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.state.currentPage === 'edit' || this.state.currentPage === 'new') {
                    editor.saveSnippet();
                }
            }
            
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    // Utility methods
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#3178c6',
            'Python': '#3572A5',
            'Java': '#b07219',
            'CSS': '#563d7c',
            'HTML': '#e34c26',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'C++': '#f34b7d',
            'C#': '#178600',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'Markdown': '#083fa1'
        };
        
        if (typeof language === 'object') {
            const primaryLang = Object.keys(language)[0];
            return colors[primaryLang] || '#58a6ff';
        }
        
        return colors[language] || '#58a6ff';
    }

    getPrimaryLanguage(languageStats) {
        if (!languageStats || Object.keys(languageStats).length === 0) {
            return 'Text';
        }
        
        return Object.keys(languageStats)[0];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + ' years ago';
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + ' months ago';
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + ' days ago';
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + ' hours ago';
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + ' minutes ago';
        }
        return Math.floor(seconds) + ' seconds ago';
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GistApp();
    window.app = app;
});