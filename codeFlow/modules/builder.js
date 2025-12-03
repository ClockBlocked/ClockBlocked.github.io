
class GitHubUIManager {
    constructor() {
        this.currentSnippet = null;
        this.currentFileIndex = 0;
        this.viewMode = 'viewer'; // 'viewer' or 'editor'
        this.octicons = this.getOcticons();
    }

    // Octicons SVG definitions
    getOcticons() {
        return {
            file: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16H3.75A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073Zm.75 9.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 2a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>`,
            person: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 9.5a.5.5 0 0 1 0-1h9a.5.5 0 0 1 0 1h-9Z"></path><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"></path></svg>`,
            clock: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v3.25a.75.75 0 0 0 .22.53l1.5 1.5a.75.75 0 0 0 1.06-1.06L9.5 7.44V4.75a.75.75 0 0 0-1.5 0Z"></path></svg>`,
            eye: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.796 10.831.88 9.577.43 8.9a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"></path></svg>`,
            globe: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7.25-5.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-3.5-1.4A.75.75 0 0 1 6.75 6H4.25a.75.75 0 0 1 0-1.5h1.989A6.47 6.47 0 0 0 1.5 8c0 .59.074 1.161.213 1.706a.75.75 0 0 1-1.457.288A8 8 0 0 1 0 8a8 8 0 0 1 8-8Z"></path></svg>`,
            lock: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 4a4 4 0 1 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15H3.75A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm1.5 2V4a2.5 2.5 0 0 1 5 0v2ZM3.75 7.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25Z"></path></svg>`,
            tag: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2.5 7.775V2.75a.25.25 0 0 1 .25-.25h5.025a.25.25 0 0 1 .177.073l6.25 6.25a.25.25 0 0 1 0 .354l-5.025 5.025a.25.25 0 0 1-.354 0l-6.25-6.25a.25.25 0 0 1-.073-.177Zm-1.5 0V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .909.184 1.237.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.75 1.75 0 0 1 1 7.775ZM6 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
            copy: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>`,
            download: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M7.47 10.78a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 0 0-1.06-1.06L8.75 8.44V1.75a.75.75 0 0 0-1.5 0v6.69L5.28 6.47a.75.75 0 0 0-1.06 1.06l3.25 3.25ZM3.75 13a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"></path></svg>`,
            pencil: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"></path></svg>`,
            repoforked: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>`,
            code: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"></path></svg>`,
            share: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.25 3a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 11.75 14h-7.5A2.25 2.25 0 0 1 2 11.75v-7.5A2.25 2.25 0 0 1 4.25 2h2a.75.75 0 0 1 0 1.5h-2Z"></path><path d="m6.194 5.72 4.25-4.25v2.865a.75.75 0 0 0 1.5 0V.75A.75.75 0 0 0 11.75 0H8.155a.75.75 0 1 0 0 1.5h2.84L5.47 6.97a.75.75 0 0 0 1.06 1.06l4.526-4.525v2.84a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.691L6.194 5.72Z"></path></svg>`,
            trash: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3zM2 3.5a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5h-.75V12a2 2 0 0 1-2 2H4.75a2 2 0 0 1-2-2V4.25H2.75A.75.75 0 0 1 2 3.5Zm1.75 7.25V7h8.5v3.75a.5.5 0 0 1-.5.5h-7.5a.5.5 0 0 1-.5-.5Z"></path></svg>`,
            plus: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path></svg>`,
            folderg: `<svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"></path></svg>`
        };
    }

    // Render GitHub-like snippet viewer
    renderSnippetViewer(snippet) {
        this.currentSnippet = snippet;
        this.currentFileIndex = 0;
        this.viewMode = 'viewer';

        return `
            <div class="github-viewer">
                ${this.renderViewerHeader(snippet)}
                <div class="github-viewer-body">
                    ${snippet.files.length > 1 ? this.renderFileSidebar(snippet) : ''}
                    ${this.renderCodeViewer(snippet)}
                </div>
                ${this.renderViewerActions(snippet)}
            </div>
        `;
    }

    renderViewerHeader(snippet) {
        return `
            <div class="viewer-header github-header">
                <div class="github-title-section">
                    <h1 class="github-title">
                        ${this.octicons.file}
                        ${this.escapeHtml(snippet.title)}
                    </h1>
                    ${snippet.description ? `<p class="github-description">${this.escapeHtml(snippet.description)}</p>` : ''}
                </div>
                
                <div class="github-meta">
                    <div class="github-meta-item">
                        ${this.octicons.person}
                        <span>${this.escapeHtml(window.app?.state?.currentUser?.username || 'user')}</span>
                    </div>
                    <div class="github-meta-item">
                        ${this.octicons.clock}
                        <span>Created ${this.formatDate(snippet.createdAt)}</span>
                    </div>
                    <div class="github-meta-item">
                        ${this.octicons.eye}
                        <span>Updated ${this.formatTimeAgo(snippet.updatedAt)}</span>
                    </div>
                    <div class="github-meta-item">
                        ${snippet.isPublic ? this.octicons.globe : this.octicons.lock}
                        <span>${snippet.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                </div>
                
                ${snippet.tags && snippet.tags.length > 0 ? `
                    <div class="github-tag-container">
                        ${snippet.tags.map(tag => `
                            <span class="github-tag">
                                ${this.octicons.tag}
                                ${this.escapeHtml(tag)}
                            </span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderFileSidebar(snippet) {
        return `
            <div class="github-file-sidebar">
                <div class="github-file-tree">
                    ${snippet.files.map((file, index) => `
                        <div class="github-file-item ${index === this.currentFileIndex ? 'active' : ''}" 
                             data-file-index="${index}"
                             onclick="githubUI.selectFile(${index})">
                            ${this.octicons.file}
                            <span class="github-file-name">${this.escapeHtml(file.filename)}</span>
                            <span class="github-file-size">${this.formatFileSize(file.size)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCodeViewer(snippet) {
        const hasSidebar = snippet.files.length > 1;
        const file = snippet.files[this.currentFileIndex] || snippet.files[0];
        
        return `
            <div class="github-code-viewer" ${!hasSidebar ? 'style="width: 100%;"' : ''}>
                <div class="github-code-container">
                    <div class="github-code-header">
                        <div class="github-code-filename">
                            ${this.octicons.file}
                            <span id="current-filename">${this.escapeHtml(file?.filename || 'Untitled')}</span>
                            <span class="github-file-language">${this.getLanguageName(file?.language)}</span>
                        </div>
                        <div class="github-code-actions">
                            ${snippet.files.length > 1 && !hasSidebar ? `
                                <select class="github-select" onchange="githubUI.selectFile(this.value)">
                                    ${snippet.files.map((f, index) => `
                                        <option value="${index}" ${index === this.currentFileIndex ? 'selected' : ''}>
                                            ${this.escapeHtml(f.filename)}
                                        </option>
                                    `).join('')}
                                </select>
                            ` : ''}
                            <button class="github-btn github-btn-icon" onclick="githubUI.copyCode()" title="Copy code">
                                ${this.octicons.copy}
                            </button>
                            <button class="github-btn github-btn-icon" onclick="githubUI.downloadFile()" title="Download file">
                                ${this.octicons.download}
                            </button>
                        </div>
                    </div>
                    <div class="code-content github-scrollable github-selectable github-syntax">
                        <pre id="code-display" class="line-numbers"><code id="code-content" class="language-${this.getPrismLanguage(file?.language)}"></code></pre>
                    </div>
                </div>
            </div>
        `;
    }

    renderViewerActions(snippet) {
        return `
            <div class="github-actions-bar">
                <button class="github-btn github-btn-primary" onclick="app.editSnippet('${snippet.id}')">
                    ${this.octicons.pencil}
                    Edit
                </button>
                <button class="github-btn github-btn-outline" onclick="app.forkSnippet('${snippet.id}')">
                    ${this.octicons.repoforked}
                    Fork
                </button>
                <button class="github-btn github-btn-outline" onclick="githubUI.rawView()">
                    ${this.octicons.code}
                    Raw
                </button>
                <button class="github-btn github-btn-outline" onclick="app.shareSnippet('${snippet.id}')">
                    ${this.octicons.share}
                    Share
                </button>
                <button class="github-btn github-btn-outline" onclick="app.downloadSnippet('${snippet.id}')">
                    ${this.octicons.download}
                    Download ZIP
                </button>
                <button class="github-btn github-btn-danger" onclick="app.deleteSnippet('${snippet.id}')">
                    ${this.octicons.trash}
                    Delete
                </button>
            </div>
        `;
    }

    // Render GitHub-like editor interface
    renderEditor(snippet = null) {
        const isEditing = snippet !== null;
        const files = snippet?.files || [{ filename: 'script.js', language: 'javascript', content: '// Start coding here...\nconsole.log("Hello, World!");', size: 0 }];
        
        return `
            <div class="github-viewer">
                <div class="viewer-header github-header">
                    <h1 class="github-title">
                        ${isEditing ? this.octicons.pencil : this.octicons.plus}
                        ${isEditing ? 'Edit Snippet' : 'New Snippet'}
                    </h1>
                </div>
                
                <div class="github-editor-container">
                    <div class="github-file-tabs" id="github-file-tabs">
                        ${files.map((file, index) => `
                            <div class="github-file-tab ${index === 0 ? 'active' : ''}" onclick="githubUI.switchEditorFile(${index})">
                                ${this.octicons.file}
                                <span class="github-tab-filename">${this.truncateFilename(file.filename, 15)}</span>
                                ${files.length > 1 ? `<span class="github-tab-close" onclick="event.stopPropagation(); githubUI.removeEditorFile(${index})">×</span>` : ''}
                            </div>
                        `).join('')}
                        <button class="github-btn github-btn-icon" onclick="githubUI.addEditorFile()" title="Add new file">
                            ${this.octicons.plus}
                        </button>
                    </div>
                    
                    <div class="github-viewer-body">
                        <div class="github-file-sidebar" id="github-editor-sidebar">
                            <div class="github-file-tree" id="github-editor-file-tree">
                                ${files.map((file, index) => `
                                    <div class="github-file-item ${index === 0 ? 'active' : ''}" onclick="githubUI.switchEditorFile(${index})">
                                        ${this.octicons.file}
                                        <span class="github-file-name">${this.truncateFilename(file.filename, 20)}</span>
                                        <div class="file-actions">
                                            <button class="github-btn github-btn-icon" onclick="event.stopPropagation(); githubUI.renameEditorFile(${index})" title="Rename">
                                                ${this.octicons.pencil}
                                            </button>
                                            ${files.length > 1 ? `<button class="github-btn github-btn-icon" onclick="event.stopPropagation(); githubUI.removeEditorFile(${index})" title="Delete">
                                                ${this.octicons.trash}
                                            </button>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="github-code-viewer" style="width: 100%;">
                            <div class="github-code-container">
                                <div class="github-code-header">
                                    <div class="github-code-filename">
                                        ${this.octicons.file}
                                        <span id="editor-filename">${files[0]?.filename || 'Untitled'}</span>
                                        <span class="github-file-language">${this.getLanguageName(files[0]?.language)}</span>
                                    </div>
                                    <div class="github-code-actions">
                                        <button class="github-btn github-btn-outline" onclick="githubUI.formatCode()">
                                            ${this.octicons.code}
                                            Format
                                        </button>
                                    </div>
                                </div>
                                <div id="editor-instance" class="github-editor-instance"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="github-editor-status">
                        <div class="github-status-item">
                            <span id="language-display">${this.getLanguageName(files[0]?.language)}</span>
                        </div>
                        <div class="github-status-item">
                            <span id="line-count">1 line</span>
                        </div>
                        <div class="github-status-item">
                            <span id="character-count">0 chars</span>
                        </div>
                    </div>
                </div>
                
                <div class="github-actions-bar">
                    <div class="github-editor-form" style="width: 100%; padding: var(--space-4);">
                        <div class="form-group">
                            <label class="form-label">Title</label>
                            <input type="text" class="form-input" id="snippet-title" value="${snippet?.title || ''}" placeholder="Enter snippet title">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea class="form-input form-textarea" id="snippet-description" placeholder="Enter snippet description">${snippet?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-group">
                                <input type="checkbox" id="snippet-public" ${snippet?.isPublic !== false ? 'checked' : ''}>
                                <span class="checkbox-label">Public Snippet</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tags (comma-separated)</label>
                            <input type="text" class="form-input" id="snippet-tags" value="${snippet?.tags ? snippet.tags.join(', ') : ''}" placeholder="e.g., javascript, react, hooks">
                        </div>
                    </div>
                    
                    <div style="width: 100%; padding: 0 var(--space-4) var(--space-4); display: flex; gap: var(--space-2);">
                        <button class="github-btn github-btn-outline" onclick="app.navigateTo('home')" style="flex: 1;">
                            Cancel
                        </button>
                        <button class="github-btn github-btn-primary" onclick="githubUI.saveSnippet()" style="flex: 1;">
                            ${isEditing ? 'Update Snippet' : 'Create Snippet'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Interactive methods
    selectFile(index) {
        if (!this.currentSnippet || !this.currentSnippet.files[index]) return;
        
        this.currentFileIndex = parseInt(index);
        const file = this.currentSnippet.files[this.currentFileIndex];
        
        // Update UI
        const filenameElement = document.getElementById('current-filename');
        if (filenameElement) {
            filenameElement.textContent = file.filename;
        }
        
        const languageElement = document.querySelector('.github-file-language');
        if (languageElement) {
            languageElement.textContent = this.getLanguageName(file.language);
        }
        
        // Update code content
        this.updateCodeContent(file);
        
        // Update active states
        this.updateActiveFileStates();
    }

    updateCodeContent(file) {
        const codeElement = document.getElementById('code-content');
        if (!codeElement) return;
        
        codeElement.textContent = file.content || '';
        codeElement.className = `language-${this.getPrismLanguage(file.language)}`;
        codeElement.parentElement.className = `line-numbers language-${this.getPrismLanguage(file.language)}`;
        
        // Apply syntax highlighting
        if (window.Prism) {
            Prism.highlightElement(codeElement);
            if (window.Prism.plugins && window.Prism.plugins.lineNumbers) {
                window.Prism.plugins.lineNumbers.highlight(codeElement.parentElement);
            }
        }
    }

    updateActiveFileStates() {
        // Update sidebar items
        document.querySelectorAll('.github-file-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.github-file-item[data-file-index="${this.currentFileIndex}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // Update select dropdown
        const select = document.querySelector('.github-select');
        if (select) {
            select.value = this.currentFileIndex;
        }
    }

    copyCode() {
        if (!this.currentSnippet || !this.currentSnippet.files[this.currentFileIndex]) return;
        
        const file = this.currentSnippet.files[this.currentFileIndex];
        navigator.clipboard.writeText(file.content)
            .then(() => {
                const btn = document.querySelector('[title="Copy code"]');
                if (btn) {
                    btn.classList.add('copied');
                    btn.setAttribute('title', 'Copied!');
                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.setAttribute('title', 'Copy code');
                    }, 2000);
                }
                app?.showToast('Code copied to clipboard', 'success');
            })
            .catch(() => {
                app?.showToast('Failed to copy code', 'error');
            });
    }

    downloadFile() {
        if (!this.currentSnippet || !this.currentSnippet.files[this.currentFileIndex]) return;
        
        const file = this.currentSnippet.files[this.currentFileIndex];
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        app?.showToast('File downloaded', 'success');
    }

    rawView() {
        if (!this.currentSnippet || !this.currentSnippet.files[this.currentFileIndex]) return;
        
        const file = this.currentSnippet.files[this.currentFileIndex];
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
    }

    // Editor methods
    switchEditorFile(index) {
        // Implementation for editor file switching
        if (window.editor) {
            window.editor.switchToFile(index);
        }
    }

    addEditorFile() {
        if (window.editor) {
            window.editor.addNewFile();
        }
    }

    removeEditorFile(index) {
        if (window.editor) {
            window.editor.removeFile(index);
        }
    }

    renameEditorFile(index) {
        if (window.editor) {
            window.editor.renameFile(index);
        }
    }

    formatCode() {
        if (window.editor) {
            window.editor.formatCode();
        }
    }

    saveSnippet() {
        if (window.editor) {
            window.editor.saveSnippet();
        }
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return this.formatDate(dateString);
    }

    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    getLanguageName(language) {
        const languageMap = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'htmlmixed': 'HTML',
            'css': 'CSS',
            'python': 'Python',
            'php': 'PHP',
            'java': 'Java',
            'c': 'C',
            'cpp': 'C++',
            'csharp': 'C#',
            'go': 'Go',
            'rust': 'Rust',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'ruby': 'Ruby',
            'sql': 'SQL',
            'shell': 'Shell',
            'bash': 'Bash',
            'markdown': 'Markdown',
            'json': 'JSON',
            'yaml': 'YAML',
            'xml': 'XML',
            'text': 'Text'
        };
        return languageMap[language] || language || 'Text';
    }

    getPrismLanguage(language) {
        const mapping = {
            'javascript': 'javascript',
            'typescript': 'typescript',
            'htmlmixed': 'html',
            'css': 'css',
            'python': 'python',
            'php': 'php',
            'java': 'java',
            'c': 'clike',
            'cpp': 'clike',
            'csharp': 'csharp',
            'go': 'go',
            'rust': 'rust',
            'swift': 'swift',
            'kotlin': 'kotlin',
            'ruby': 'ruby',
            'sql': 'sql',
            'shell': 'bash',
            'bash': 'bash',
            'markdown': 'markdown',
            'json': 'json',
            'yaml': 'yaml',
            'xml': 'xml',
            'text': 'none'
        };
        return mapping[language] || 'none';
    }

    truncateFilename(filename, maxLength) {
        if (filename.length <= maxLength) return filename;
        const extensionIndex = filename.lastIndexOf('.');
        if (extensionIndex === -1) return filename.substring(0, maxLength - 3) + '...';
        const name = filename.substring(0, extensionIndex);
        const extension = filename.substring(extensionIndex);
        const maxNameLength = maxLength - extension.length - 3;
        if (name.length <= maxNameLength) return filename;
        return name.substring(0, maxNameLength) + '...' + extension;
    }
}

// Initialize global instance
let githubUI = new GitHubUIManager();
window.githubUI = githubUI;