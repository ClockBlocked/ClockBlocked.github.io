

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
    this.showLoading(true);
    await this.initializeComponents();
    await this.loadData();
    this.initRouter();
    this.setupEventListeners();
    this.showLoading(false);
  }

  async initializeComponents() {
    if (!window.storage) window.storage = new StorageManager();
    if (!window.router) window.router = new Router();
    if (!window.components) window.components = new Components();
    if (!window.editor) window.editor = new CodeEditor();
  }

  async loadData() {
    try {
      const data = await storage.getData();
      this.state.snippets = data.snippets || [];
      this.state.filteredSnippets = [...this.state.snippets];
      this.updateUserStats();
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
    if (this.state.currentPage === 'profile') this.renderProfile();
  }

  showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.style.opacity = show ? '1' : '0';
      spinner.style.pointerEvents = show ? 'all' : 'none';
      if (!show) setTimeout(() => spinner.style.display = 'none', 300);
    }
  }

  showProgress(progress) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) setTimeout(() => progressBar.style.width = '0', 300);
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
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-page') === this.state.currentPage) link.classList.add('active');
    });
    document.querySelectorAll('.bottom-nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-page') === this.state.currentPage) link.classList.add('active');
    });
  }

renderPage(page, params = {}) {
    const mainContent = document.getElementById('main-content');
    this.showProgress(30);
    let html = '';
    switch(page) {
        case 'home': html = this.renderGallery(); break;
        case 'view': html = this.renderSnippetViewer(params.id); break;
        case 'edit': html = this.renderEditor(params.id); break;
        case 'new': html = this.renderEditor(); break;
        case 'profile': html = this.renderProfile(); break;
        default: html = this.renderGallery();
    }
    mainContent.innerHTML = html;
    this.showProgress(100);
    this.initializePage(page, params);
    
    // Trigger syntax highlighting after page loads
    setTimeout(() => {
        if (window.components && window.components.highlightAllCodeBlocks) {
            window.components.highlightAllCodeBlocks();
        }
    }, 500);
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
                            <div class="filter-options" id="language-filters"></div>
                        </div>
                        <div class="filter-section">
                            <h4 class="filter-title">Visibility</h4>
                            <div class="filter-options">
                                <label class="filter-option">
                                    <input type="radio" name="visibility" value="all" checked onchange="app.updateFilter('visibility', 'all')"> All
                                </label>
                                <label class="filter-option">
                                    <input type="radio" name="visibility" value="public" onchange="app.updateFilter('visibility', 'public')"> Public
                                </label>
                                <label class="filter-option">
                                    <input type="radio" name="visibility" value="private" onchange="app.updateFilter('visibility', 'private')"> Private
                                </label>
                            </div>
                        </div>
                        <div class="filter-section">
                            <button class="btn btn-secondary w-full" onclick="app.clearFilters()">Clear Filters</button>
                        </div>
                    </div>
                    <div class="gallery-main">${this.renderSnippetGrid()}</div>
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
            ${this.state.filteredSnippets.map(snippet => {
                const firstFile = snippet.files && snippet.files[0];
                const language = firstFile ? firstFile.language : 'text';
                const previewContent = firstFile ? this.escapeHtml(firstFile.content.substring(0, 200)) : '';
                
                return `
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
                        
                        ${firstFile ? `
                            <div class="snippet-preview">
                                <pre class="line-numbers language-${language}"><code class="language-${language}">${previewContent}</code></pre>
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
                `;
            }).join('')}
        </div>
    `;
}

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

    const hasMultipleFiles = snippet.files.length > 1;
    const shouldShowSidebar = hasMultipleFiles && window.innerWidth > 768;
    const firstFile = snippet.files[0];
    const language = firstFile ? firstFile.language : 'text';

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
                                    <span id="current-filename">${firstFile?.filename || 'Untitled'}</span>
                                </div>
                                <div class="code-actions">
                                    <button class="btn-icon" onclick="app.copyCurrentFileContent('${id}')" title="Copy code">
                                        <i class="far fa-copy"></i>
                                    </button>
                                    <button class="btn-icon" onclick="app.downloadCurrentFile('${id}')" title="Download file">
                                        <i class="fas fa-download"></i>
                                    </button>
                                    ${!shouldShowSidebar && hasMultipleFiles ? `
                                        <select class="file-selector" onchange="app.selectViewerFile(this.value)" style="margin-right: 8px; padding: 4px 8px; border-radius: 4px; background-color: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);">
                                            ${snippet.files.map((file, index) => `<option value="${index}" ${index === 0 ? 'selected' : ''}>${file.filename}</option>`).join('')}
                                        </select>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="code-content">
                                <pre class="line-numbers language-${language}"><code class="language-${language}" id="code-content">${this.escapeHtml(firstFile?.content || '')}</code></pre>
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

    this.currentViewingSnippetId = id;
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
        const codeElement = document.getElementById('code-content');
        if (codeElement) {
            const file = snippet.files[0];
            const language = file.language || 'text';
            
            // Remove any existing classes
            const preElement = codeElement.parentElement;
            if (preElement) {
                preElement.className = `line-numbers language-${language}`;
            }
            codeElement.className = `language-${language}`;
            
            // Apply Prism highlighting
            Prism.highlightElement(codeElement);
            
            // Apply line numbers
            if (window.Prism && window.Prism.plugins && window.Prism.plugins.lineNumbers) {
                window.Prism.plugins.lineNumbers.highlight(codeElement.parentElement);
            }
        }
        
        // Also highlight any previews in the gallery
        document.querySelectorAll('pre code').forEach((el) => {
            if (!el.classList.contains('language-')) {
                const parentPre = el.parentElement;
                if (parentPre && parentPre.classList.contains('line-numbers')) {
                    const langClass = Array.from(parentPre.classList).find(cls => cls.startsWith('language-'));
                    if (langClass) {
                        el.className = langClass;
                        Prism.highlightElement(el);
                        if (window.Prism && window.Prism.plugins && window.Prism.plugins.lineNumbers) {
                            window.Prism.plugins.lineNumbers.highlight(parentPre);
                        }
                    }
                }
            }
        });
    }, 300);
}

selectViewerFile(index) {
    const snippet = this.state.snippets.find(s => s.id === this.currentViewingSnippetId);
    if (!snippet || !snippet.files[index]) return;

    const file = snippet.files[index];
    const language = file.language || 'text';
    
    // Update filename display
    const filenameElement = document.getElementById('current-filename');
    if (filenameElement) {
        filenameElement.textContent = file.filename;
    }
    
    // Update code content
    const codeElement = document.getElementById('code-content');
    if (codeElement) {
        codeElement.textContent = file.content;
        
        // Update classes for both pre and code elements
        const preElement = codeElement.parentElement;
        if (preElement) {
            preElement.className = `line-numbers language-${language}`;
        }
        codeElement.className = `language-${language}`;
        
        // Re-highlight syntax
        Prism.highlightElement(codeElement);
        
        // Apply line numbers
        if (window.Prism && window.Prism.plugins && window.Prism.plugins.lineNumbers) {
            window.Prism.plugins.lineNumbers.highlight(preElement);
        }
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
    const blob = new Blob([file.content], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
                        <div class="file-tabs" id="file-tabs"></div>
                        <div class="editor-toolbar">
                            <button class="btn-icon" onclick="editor.addNewFile()"><i class="fas fa-plus"></i></button>
                            <button class="btn-icon" onclick="editor.toggleSidebar()"><i class="fas fa-folder"></i></button>
                        </div>
                    </div>
                    <div class="editor-main">
                        <div class="file-sidebar" id="file-sidebar">
                            <div class="file-tree" id="file-tree"></div>
                        </div>
                        <div class="editor-wrapper">
                            <textarea id="code-editor" style="display: none;"></textarea>
                            <div id="editor-instance"></div>
                        </div>
                    </div>
                    <div class="editor-footer">
                        <div class="editor-status">
                            <div class="status-item"><i class="fas fa-code"></i><span id="language-display">JavaScript</span></div>
                            <div class="status-item"><i class="fas fa-ruler"></i><span id="line-count">1 line</span></div>
                            <div class="status-item"><i class="fas fa-font"></i><span id="character-count">0 chars</span></div>
                        </div>
                        <div class="editor-actions">
                            <button class="btn btn-secondary" onclick="app.navigateTo('home')">Cancel</button>
                            <button class="btn btn-primary" onclick="editor.saveSnippet()">Save Snippet</button>
                        </div>
                    </div>
                </div>
                <div class="editor-settings" style="margin-top: var(--space-4);">
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-input" id="snippet-title" value="${snippet ? snippet.title : ''}" placeholder="Enter snippet title">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-input form-textarea" id="snippet-description" placeholder="Enter snippet description">${snippet ? snippet.description : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-group">
                            <input type="checkbox" id="snippet-public" ${snippet && snippet.isPublic ? 'checked' : 'checked'}>
                            <span class="checkbox-label">Public Snippet</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tags (comma-separated)</label>
                        <input type="text" class="form-input" id="snippet-tags" value="${snippet && snippet.tags ? snippet.tags.join(', ') : ''}" placeholder="e.g., javascript, react, hooks">
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
                    <div class="profile-avatar"><img src="${this.state.currentUser.avatar}" alt="Profile Avatar"></div>
                    <div class="profile-info">
                        <h1>${this.state.currentUser.username}</h1>
                        <p class="profile-bio">${this.state.currentUser.bio}</p>
                        <div class="profile-stats">
                            <div class="stat-item"><i class="fas fa-code"></i><span>${stats.totalSnippets} snippets</span></div>
                            <div class="stat-item"><i class="fas fa-globe"></i><span>${stats.publicSnippets} public</span></div>
                            <div class="stat-item"><i class="fas fa-lock"></i><span>${stats.privateSnippets} private</span></div>
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
                                    <div class="language-bar"><div class="language-progress" style="width: ${(count / stats.totalSnippets) * 100}%; background-color: ${this.getLanguageColor(lang)}"></div></div>
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
                                    <div style="display: flex; justify-content: space-between;"><span>${activity.action}</span><span style="color: var(--text-tertiary); font-size: 12px;">${this.formatTimeAgo(activity.timestamp)}</span></div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">${activity.details}</div>
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
      if (snippet.languageStats) Object.keys(snippet.languageStats).forEach(lang => stats[lang] = (stats[lang] || 0) + 1);
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
      if (snippet.updatedAt !== snippet.createdAt) activities.push({
        action: 'Updated snippet',
        details: snippet.title,
        timestamp: snippet.updatedAt
      });
    });
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
  }

  initializePage(page, params) {
    switch (page) {
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
    this.populateLanguageFilters();
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = this.state.filters.search;
      searchInput.addEventListener('input', (e) => this.updateFilter('search', e.target.value));
    }
  }

  populateLanguageFilters() {
    const languages = new Set();
    this.state.snippets.forEach(snippet => {
      if (snippet.languageStats) Object.keys(snippet.languageStats).forEach(lang => languages.add(lang));
    });
    const container = document.getElementById('language-filters');
    if (container) {
      const options = Array.from(languages).sort().map(lang => `
                <label class="filter-option">
                    <input type="radio" name="language" value="${lang}" ${this.state.filters.language === lang ? 'checked' : ''} onchange="app.updateFilter('language', '${lang}')">${lang}
                </label>
            `).join('');
      container.innerHTML = `
                <label class="filter-option"><input type="radio" name="language" value="all" ${this.state.filters.language === 'all' ? 'checked' : ''} onchange="app.updateFilter('language', 'all')">All Languages</label>${options}
            `;
    }
  }

  updateFilter(type, value) {
    this.state.filters[type] = value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.state.snippets];
    if (this.state.filters.search) {
      const searchTerm = this.state.filters.search.toLowerCase();
      filtered = filtered.filter(snippet =>
        snippet.title.toLowerCase().includes(searchTerm) ||
        snippet.description?.toLowerCase().includes(searchTerm) ||
        snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        snippet.files?.some(file => file.content.toLowerCase().includes(searchTerm) || file.filename.toLowerCase().includes(searchTerm))
      );
    }
    if (this.state.filters.language !== 'all') filtered = filtered.filter(snippet => snippet.languageStats && snippet.languageStats[this.state.filters.language]);
    if (this.state.filters.visibility !== 'all') filtered = filtered.filter(snippet => this.state.filters.visibility === 'public' ? snippet.isPublic : !snippet.isPublic);
    this.state.filteredSnippets = filtered;
    this.renderGalleryContent();
  }

  renderGalleryContent() {
    const galleryMain = document.querySelector('.gallery-main');
    if (galleryMain) galleryMain.innerHTML = this.renderSnippetGrid();
  }

  clearFilters() {
    this.state.filters = {
      language: 'all',
      visibility: 'all',
      tags: [],
      search: ''
    };
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    this.applyFilters();
    this.populateLanguageFilters();
  }

  toggleFilterSidebar() {
    const sidebar = document.getElementById('filter-sidebar');
    if (sidebar) sidebar.classList.toggle('active');
  }

  viewSnippet(id) {
    window.location.hash = `/snippet/${id}`;
  }
  editSnippet(id) {
    window.location.hash = `/edit/${id}`;
  }

  async deleteSnippet(id) {
    const confirmed = await components.showConfirm({
      title: 'Delete Snippet',
      content: 'Are you sure you want to delete this snippet? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
    if (!confirmed) return;
    try {
      this.showProgress(30);
      const index = this.state.snippets.findIndex(s => s.id === id);
      if (index !== -1) {
        this.state.snippets.splice(index, 1);
        this.state.filteredSnippets = this.state.filteredSnippets.filter(s => s.id !== id);
        await storage.saveData({
          snippets: this.state.snippets
        });
        this.updateUserStats();
        this.showToast('Snippet deleted successfully', 'success');
        if (this.state.currentPage === 'view') this.navigateTo('home');
        else this.renderGalleryContent();
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
    } else this.showToast('Private snippets cannot be shared', 'error');
  }

  async downloadSnippet(id) {
    const snippet = this.state.snippets.find(s => s.id === id);
    if (!snippet) return;
    try {
      this.showProgress(30);
      const zip = new JSZip();
      snippet.files.forEach(file => zip.file(file.filename, file.content));
      const metadata = {
        title: snippet.title,
        description: snippet.description,
        createdAt: snippet.createdAt,
        updatedAt: snippet.updatedAt,
        tags: snippet.tags,
        languageStats: snippet.languageStats
      };
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));
      const content = await zip.generateAsync({
        type: 'blob'
      });
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
    const snippet = this.state.snippets.find(s => s.files?.some(f => f.id === fileId));
    if (!snippet) return;
    const file = snippet.files.find(f => f.id === fileId);
    if (!file) return;
    const blob = new Blob([file.content], {
      type: 'text/plain'
    });
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
    const snippet = this.state.snippets.find(s => s.files?.some(f => f.id === fileId));
    if (!snippet) return;
    const file = snippet.files.find(f => f.id === fileId);
    if (!file) return;
    navigator.clipboard.writeText(file.content)
      .then(() => this.showToast('Code copied to clipboard', 'success'))
      .catch(() => this.showToast('Failed to copy code', 'error'));
  }

  initializeEditor(id) {
    if (id) {
      const snippet = this.state.snippets.find(s => s.id === id);
      if (snippet) editor.loadSnippet(snippet);
    } else editor.initialize();
  }

  initRouter() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash.substring(1) || '/';
    const parts = hash.split('/').filter(p => p);
    if (parts.length === 0 || parts[0] === '') this.navigateTo('home');
    else if (parts[0] === 'snippet' && parts[1]) this.navigateTo('view', {
      id: parts[1]
    });
    else if (parts[0] === 'edit' && parts[1]) this.navigateTo('edit', {
      id: parts[1]
    });
    else if (parts[0] === 'new') this.navigateTo('new');
    else if (parts[0] === 'profile') this.navigateTo('profile');
    else this.navigateTo('home');
  }

  setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', () => document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'dark-dimmed' ? 'light' : 'dark-dimmed'));
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    if (mobileNavToggle) mobileNavToggle.addEventListener('click', () => {
      const mobileNavContent = document.getElementById('mobile-nav-content');
      if (mobileNavContent) mobileNavContent.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      const mobileNavContent = document.getElementById('mobile-nav-content');
      const mobileNavToggle = document.getElementById('mobile-nav-toggle');
      if (mobileNavContent && mobileNavToggle && !mobileNavContent.contains(e.target) && !mobileNavToggle.contains(e.target)) mobileNavContent.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (this.state.currentPage === 'edit' || this.state.currentPage === 'new') editor.saveSnippet();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }
    });
  }

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
    if (!languageStats || Object.keys(languageStats).length === 0) return 'Text';
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
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new GistApp();
  window.app = app;
});