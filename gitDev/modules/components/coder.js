class CodeViewerEditor {
    constructor() {
        this.currentFile = null;
        this.fileData = null;
        this.isEditing = false;
        this.codeMirrorEditor = null;
        this.elements = {};
        this.state = {
            fontSize: 12,
            lineHeight: 1.5,
            selectedLines: new Set(),
            currentLine: 1,
            currentColumn: 1,
            totalLines: 0,
            wrapEnabled: true,
            minimapEnabled: false,
            isModified: false
        };
    }

/////////////  S E T U P  /////
    init() {
        this.setupStyles();
        this.cacheElements();
        this.bindEvents();
    }

    setupStyles() {
        // Add transition styles for smooth mode switching
        const styleElement = document.createElement('style');
        styleElement.innerHTML = `
            .code-viewer-container {
                display: flex;
                flex-direction: column;
                background-color: #1c2128;
                border: 1px solid #444c56;
                border-radius: 6px;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
                color: #adbac7;
                height: 100%;
                transition: all 0.3s ease;
            }

            .edit-mode .code-viewer-container {
                border-color: #347d39;
                box-shadow: 0 0 0 1px rgba(52, 125, 57, 0.3);
            }

            .loading-transition {
                position: relative;
                min-height: 300px;
                overflow: hidden;
            }

            .loading-transition::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(28, 33, 40, 0.95);
                backdrop-filter: blur(2px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }

            .loading-transition.loading::after {
                opacity: 1;
                pointer-events: auto;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #373e47;
                border-top-color: #539bf5;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                z-index: 101;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .file-name-input {
                background: transparent;
                border: 2px solid transparent;
                border-radius: 4px;
                color: #adbac7;
                font-size: 14px;
                font-weight: 600;
                padding: 2px 6px;
                margin: -2px;
                min-width: 150px;
                transition: all 0.2s ease;
            }

            .file-name-input:focus {
                border-color: #539bf5;
                background: rgba(65, 132, 228, 0.1);
                outline: none;
            }

            .file-name-input:hover:not(:focus) {
                background: rgba(99, 110, 123, 0.1);
            }

            .edit-mode .header-left .file-icon {
                background: linear-gradient(135deg, #347d39 0%, #2b6a30 100%);
            }

            .edit-mode .edit-btn {
                background: linear-gradient(180deg, #e5534b 0%, #c93c37 100%);
            }

            .edit-mode .edit-btn span {
                content: "Cancel";
            }

            .commit-panel {
                max-height: 0;
                overflow: hidden;
                opacity: 0;
                transition: all 0.3s ease;
                background: #22272e;
                border-top: 1px solid #373e47;
            }

            .edit-mode .commit-panel {
                max-height: 200px;
                opacity: 1;
                padding: 16px;
            }

            .commit-input {
                width: 100%;
                padding: 8px 12px;
                background: #1c2128;
                border: 1px solid #444c56;
                border-radius: 6px;
                color: #adbac7;
                font-size: 14px;
                margin-bottom: 8px;
                transition: all 0.2s ease;
            }

            .commit-input:focus {
                border-color: #539bf5;
                outline: none;
                box-shadow: 0 0 0 3px rgba(65, 132, 228, 0.15);
            }

            .commit-textarea {
                width: 100%;
                padding: 8px 12px;
                background: #1c2128;
                border: 1px solid #444c56;
                border-radius: 6px;
                color: #adbac7;
                font-size: 14px;
                min-height: 80px;
                resize: vertical;
                transition: all 0.2s ease;
            }

            .commit-textarea:focus {
                border-color: #539bf5;
                outline: none;
                box-shadow: 0 0 0 3px rgba(65, 132, 228, 0.15);
            }

            .commit-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 12px;
            }

            .commit-btn {
                padding: 8px 16px;
                background: linear-gradient(180deg, #347d39 0%, #2b6a30 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .commit-btn:hover {
                background: linear-gradient(180deg, #3d8b40 0%, #347d39 100%);
            }

            .cancel-btn {
                padding: 8px 16px;
                background: transparent;
                border: 1px solid #444c56;
                border-radius: 6px;
                color: #adbac7;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .cancel-btn:hover {
                background: rgba(99, 110, 123, 0.1);
                border-color: #545d68;
            }

            .file-details-panel {
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .edit-mode .file-details-panel {
                max-height: 0;
                opacity: 0;
                padding: 0;
                margin: 0;
                border: none;
            }

            .CodeMirror {
                height: auto;
                min-height: 300px;
                background: transparent;
                color: #adbac7;
                font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
                font-size: 12px;
                line-height: 1.5;
            }

            .CodeMirror-gutters {
                background: #1c2128;
                border-right: 1px solid #444c56;
            }

            .CodeMirror-linenumber {
                color: #545d68;
            }

            .CodeMirror-line {
                color: #adbac7;
            }

            .CodeMirror-cursor {
                border-left: 2px solid #539bf5;
            }

            /* Rest of the styles from previous implementation... */
            /* ... (include all the CSS from the previous codeViewer.js here) ... */
        `;
        document.head.appendChild(styleElement);
    }
    cacheElements() {
        this.elements = {
            fileViewer: document.getElementById('fileViewer'),
            fileEditor: document.getElementById('fileEditor')
        };
    }
    bindEvents() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && this.isEditing) {
                e.preventDefault();
                this.saveChanges();
            }
            if (e.key === 'Escape' && this.isEditing) {
                this.cancelEdit();
            }
        });
    }


////////////  V I E W E R  ////
    createViewer() {
        if (!this.elements.fileViewer) return false;

        // Clear existing content
        this.elements.fileViewer.innerHTML = '';

        const viewerHTML = `
            <div class="code-viewer-container" id="codeViewerContainer">
                <!-- Header -->
                <div class="code-viewer-header">
                    <div class="header-left">
                        <div class="file-icon">
                            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                <path d="M3.75 1.5a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V6H9.75A1.75 1.75 0 0 1 8 4.25V1.5H3.75Zm5.75.56 2.44 2.44H9.75a.25.25 0 0 1-.25-.25V2.06ZM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25V1.75Z"/>
                            </svg>
                        </div>
                        <input type="text" class="file-name-input" id="fileNameInput" value="" readonly>
                        <div class="file-badge" id="encodingBadge">UTF-8</div>
                        <div class="file-badge" id="eolBadge">LF</div>
                    </div>
                    <div class="header-center">
                        <div class="breadcrumb-trail" id="codeViewerBreadcrumb"></div>
                    </div>
                    <div class="header-right">
                        <div class="header-stats">
                            <span class="stat-item">
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                    <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25Zm7.47 3.97a.75.75 0 0 1 1.06 0l2 2a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 1 1-1.06-1.06l1.47-1.47-1.47-1.47a.75.75 0 0 1 0-1.06Zm-3.44 0a.75.75 0 0 1 0 1.06L4.31 8l1.47 1.47a.75.75 0 1 1-1.06 1.06l-2-2a.75.75 0 0 1 0-1.06l2-2a.75.75 0 0 1 1.06 0Z"/>
                                </svg>
                                <span id="lineCountStat">0 lines</span>
                            </span>
                            <span class="stat-item">
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                    <path d="M2 1.75C2 .784 2.784 0 3.75 0h8.5C13.216 0 14 .784 14 1.75v12.5A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25ZM4.75 6h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5Zm0 2.5h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5ZM4.75 11h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5Z"/>
                                </svg>
                                <span id="fileSizeStat">0 KB</span>
                            </span>
                        </div>
                        <div class="header-actions">
                            <button class="action-btn" data-tooltip="Copy file" id="copyFileBtn">
                                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                                    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                                </svg>
                            </button>
                            <button class="action-btn" data-tooltip="Download" id="downloadFileBtn">
                                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
                                    <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
                                </svg>
                            </button>
                            <div class="action-divider"></div>
                            <button class="action-btn edit-btn" id="editToggleBtn">
                                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                    <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/>
                                </svg>
                                <span>Edit</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Toolbar -->
                <div class="code-viewer-toolbar">
                    <div class="toolbar-left">
                        <button class="toolbar-btn active" id="codeViewBtn">
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                <path d="M4 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"/>
                            </svg>
                            <span>Code</span>
                        </button>
                    </div>
                    <div class="toolbar-center">
                        <div class="search-container">
                            <svg class="search-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/>
                            </svg>
                            <input type="text" class="search-input" id="codeSearchInput" placeholder="Search in file...">
                            <div class="search-shortcuts">
                                <kbd>Ctrl</kbd><kbd>F</kbd>
                            </div>
                        </div>
                    </div>
                    <div class="toolbar-right">
                        <div class="view-options">
                            <button class="view-btn active" data-tooltip="Wrap lines" id="wrapLinesBtn">
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                    <path d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5ZM3 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
                                </svg>
                            </button>
                            <button class="view-btn" data-tooltip="Minimap" id="minimapBtn">
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                    <path d="M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75C0 1.784.784 1 1.75 1Zm12.5 1.5H1.75a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25Zm-9.5 2h-1v2h1v-2Zm0 3.5h-1V10h1V8Zm0 3.5h-1V13h1v-1.5Z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="toolbar-divider"></div>
                        <div class="font-size-control">
                            <button class="font-btn" data-action="decrease" id="decreaseFontBtn">
                                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                    <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Z"/>
                                </svg>
                            </button>
                            <span class="font-size-display" id="fontSizeDisplay">12px</span>
                            <button class="font-btn" data-action="increase" id="increaseFontBtn">
                                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                    <path d="M7.25 3.75a.75.75 0 0 1 1.5 0V7.25h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Code Area -->
                <div class="code-viewer-body loading-transition" id="codeArea">
                    <div class="gutter-container">
                        <div class="gutter-fold-column"></div>
                        <div class="gutter-line-numbers" id="codeViewerLineNumbers"></div>
                        <div class="gutter-diff-column"></div>
                    </div>
                    <div class="code-container" id="codeContainer">
                        <div id="codeEditorWrapper"></div>
                        <div class="minimap-container">
                            <div class="minimap-viewport" id="minimapViewport"></div>
                            <canvas class="minimap-canvas" id="minimapCanvas"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Commit Panel (hidden in view mode) -->
                <div class="commit-panel" id="commitPanel">
                    <div class="space-y-3">
                        <input type="text" 
                               id="commitTitleInput" 
                               class="commit-input" 
                               placeholder="Update filename.ext">
                        <textarea 
                            id="commitDescriptionInput" 
                            class="commit-textarea" 
                            placeholder="Add an optional extended description..."
                            rows="3"></textarea>
                        <div class="commit-actions">
                            <button class="cancel-btn" id="cancelEditBtn">Cancel</button>
                            <button class="commit-btn" id="saveChangesBtn">Commit changes</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.elements.fileViewer.insertAdjacentHTML('beforeend', viewerHTML);
        this.updateCachedElements();
        this.bindViewerEvents();
        
        return true;
    }
    updateCachedElements() {
        this.elements = {
            ...this.elements,
            container: document.getElementById('codeViewerContainer'),
            codeArea: document.getElementById('codeArea'),
            fileNameInput: document.getElementById('fileNameInput'),
            breadcrumb: document.getElementById('codeViewerBreadcrumb'),
            lineCountStat: document.getElementById('lineCountStat'),
            fileSizeStat: document.getElementById('fileSizeStat'),
            editToggleBtn: document.getElementById('editToggleBtn'),
            copyFileBtn: document.getElementById('copyFileBtn'),
            downloadFileBtn: document.getElementById('downloadFileBtn'),
            codeEditorWrapper: document.getElementById('codeEditorWrapper'),
            commitPanel: document.getElementById('commitPanel'),
            commitTitleInput: document.getElementById('commitTitleInput'),
            commitDescriptionInput: document.getElementById('commitDescriptionInput'),
            cancelEditBtn: document.getElementById('cancelEditBtn'),
            saveChangesBtn: document.getElementById('saveChangesBtn'),
            wrapLinesBtn: document.getElementById('wrapLinesBtn'),
            minimapBtn: document.getElementById('minimapBtn'),
            increaseFontBtn: document.getElementById('increaseFontBtn'),
            decreaseFontBtn: document.getElementById('decreaseFontBtn'),
            searchInput: document.getElementById('codeSearchInput')
        };
    }
    bindViewerEvents() {
        const self = this;

        // Edit toggle button
        if (this.elements.editToggleBtn) {
            this.elements.editToggleBtn.addEventListener('click', () => {
                if (this.isEditing) {
                    this.cancelEdit();
                } else {
                    this.enterEditMode();
                }
            });
        }

        // File name inline editing
        if (this.elements.fileNameInput) {
            this.elements.fileNameInput.addEventListener('dblclick', () => {
                if (this.isEditing) {
                    this.elements.fileNameInput.readOnly = false;
                    this.elements.fileNameInput.select();
                }
            });

            this.elements.fileNameInput.addEventListener('blur', () => {
                this.elements.fileNameInput.readOnly = true;
                const newName = this.elements.fileNameInput.value.trim();
                if (newName && newName !== this.currentFile) {
                    this.renameFile(newName);
                }
            });

            this.elements.fileNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.elements.fileNameInput.blur();
                }
                if (e.key === 'Escape') {
                    this.elements.fileNameInput.value = this.currentFile;
                    this.elements.fileNameInput.blur();
                }
            });
        }

        // Save and cancel buttons
        if (this.elements.saveChangesBtn) {
            this.elements.saveChangesBtn.addEventListener('click', () => {
                this.saveChanges();
            });
        }

        if (this.elements.cancelEditBtn) {
            this.elements.cancelEditBtn.addEventListener('click', () => {
                this.cancelEdit();
            });
        }

        // Copy button
        if (this.elements.copyFileBtn) {
            this.elements.copyFileBtn.addEventListener('click', () => {
                this.copyCode();
            });
        }

        // Download button
        if (this.elements.downloadFileBtn) {
            this.elements.downloadFileBtn.addEventListener('click', () => {
                this.downloadCurrentFile();
            });
        }

        // Font size controls
        if (this.elements.increaseFontBtn) {
            this.elements.increaseFontBtn.addEventListener('click', () => {
                this.changeFontSize(1);
            });
        }

        if (this.elements.decreaseFontBtn) {
            this.elements.decreaseFontBtn.addEventListener('click', () => {
                this.changeFontSize(-1);
            });
        }

        // Search
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', () => {
                this.handleSearch(this.elements.searchInput.value);
            });
        }

        // Wrap lines
        if (this.elements.wrapLinesBtn) {
            this.elements.wrapLinesBtn.addEventListener('click', () => {
                this.toggleWordWrap();
            });
        }

        // Minimap
        if (this.elements.minimapBtn) {
            this.elements.minimapBtn.addEventListener('click', () => {
                this.toggleMinimap();
            });
        }

        // CodeMirror changes
        if (this.codeMirrorEditor) {
            this.codeMirrorEditor.on('change', () => {
                this.state.isModified = true;
                this.updateCommitMessage();
            });
        }
    }
    displayFileContent(filename, fileData) {
        if (!this.createViewer()) {
            console.error('Failed to create code viewer');
            return;
        }

        this.currentFile = filename;
        this.fileData = fileData;
        this.isEditing = false;

        const content = fileData.content || '';
        const ext = filename.split('.').pop().toLowerCase();
        const language = getLanguageName(ext);
        const lines = content.split('\n');
        const lineCount = lines.length;
        const fileSize = new Blob([content]).size;

        // Update UI elements
        if (this.elements.fileNameInput) {
            this.elements.fileNameInput.value = filename;
        }

        if (this.elements.lineCountStat) {
            this.elements.lineCountStat.textContent = `${lineCount} lines`;
        }

        if (this.elements.fileSizeStat) {
            this.elements.fileSizeStat.textContent = formatFileSize(fileSize);
        }

        // Update breadcrumb
        this.updateBreadcrumb();

        // Display content in viewer mode
        this.displayViewMode(content, ext);

        // Reset editing state
        this.exitEditMode();
    }
    displayViewMode(content, ext) {
        if (this.codeMirrorEditor) {
            this.codeMirrorEditor.toTextArea();
            this.codeMirrorEditor = null;
        }

        // Create read-only display
        const codeWrapper = this.elements.codeEditorWrapper;
        codeWrapper.innerHTML = `
            <pre id="codeContent" class="code-content">
                <code id="codeBlock" class="language-${ext}">${escapeHtml(content)}</code>
            </pre>
        `;

        // Render line numbers
        this.renderLineNumbers(content);

        // Apply syntax highlighting
        setTimeout(() => {
            if (window.Prism) {
                const codeBlock = document.getElementById('codeBlock');
                if (codeBlock) {
                    try {
                        Prism.highlightElement(codeBlock);
                    } catch (error) {
                        console.warn('Prism highlighting failed:', error);
                    }
                }
            }
        }, 50);
    }


//////////////  E D I T  //////
    async enterEditMode() {
        if (!this.currentFile || !this.fileData) return;

        const self = this;
        
        // Show loading transition
        this.elements.codeArea.classList.add('loading');

        // Simulate loading delay (like GitHub)
        setTimeout(async () => {
            try {
                // Switch to edit mode UI
                this.isEditing = true;
                this.elements.container.classList.add('edit-mode');
                
                // Update edit button
                if (this.elements.editToggleBtn) {
                    const span = this.elements.editToggleBtn.querySelector('span');
                    if (span) span.textContent = 'Cancel';
                }

                // Initialize CodeMirror editor
                if (typeof CodeMirror !== 'undefined') {
                    const mode = this.getCodeMirrorMode(this.currentFile);
                    
                    this.codeMirrorEditor = CodeMirror(this.elements.codeEditorWrapper, {
                        value: this.fileData.content || '',
                        mode: mode,
                        theme: 'material-darker',
                        lineNumbers: true,
                        lineWrapping: this.state.wrapEnabled,
                        tabSize: 2,
                        indentUnit: 2,
                        smartIndent: true,
                        matchBrackets: true,
                        autoCloseBrackets: true,
                        scrollbarStyle: 'native',
                        viewportMargin: Infinity,
                        readOnly: false,
                        extraKeys: {
                            "Ctrl-S": function(cm) {
                                self.saveChanges();
                            },
                            "Cmd-S": function(cm) {
                                self.saveChanges();
                            }
                        }
                    });

                    // Set initial size
                    this.codeMirrorEditor.setSize('100%', 'auto');
                    
                    // Focus the editor
                    setTimeout(() => {
                        this.codeMirrorEditor.focus();
                        this.codeMirrorEditor.setCursor(0, 0);
                    }, 100);
                } else {
                    // Fallback to textarea
                    const textarea = document.createElement('textarea');
                    textarea.className = 'code-editor-textarea';
                    textarea.value = this.fileData.content || '';
                    textarea.style.width = '100%';
                    textarea.style.height = '300px';
                    textarea.style.background = 'transparent';
                    textarea.style.color = '#adbac7';
                    textarea.style.fontFamily = "'SF Mono', 'Cascadia Code', monospace";
                    textarea.style.fontSize = '12px';
                    textarea.style.border = 'none';
                    textarea.style.outline = 'none';
                    textarea.style.resize = 'vertical';
                    
                    this.elements.codeEditorWrapper.innerHTML = '';
                    this.elements.codeEditorWrapper.appendChild(textarea);
                    
                    // Store reference for fallback
                    this.fallbackEditor = textarea;
                }

                // Pre-fill commit message
                this.updateCommitMessage();

                // Hide loading
                this.elements.codeArea.classList.remove('loading');

            } catch (error) {
                console.error('Failed to enter edit mode:', error);
                this.elements.codeArea.classList.remove('loading');
                showErrorMessage('Failed to load editor');
            }
        }, 800); // GitHub-like delay
    }
    async saveChanges() {
        if (!this.currentFile || !this.fileData) return;

        const commitTitle = this.elements.commitTitleInput ? 
            this.elements.commitTitleInput.value.trim() : '';
        const commitDescription = this.elements.commitDescriptionInput ? 
            this.elements.commitDescriptionInput.value.trim() : '';

        if (!commitTitle) {
            showErrorMessage('Please enter a commit message');
            return;
        }

        // Get content from editor
        let newContent = '';
        if (this.codeMirrorEditor) {
            newContent = this.codeMirrorEditor.getValue();
        } else if (this.fallbackEditor) {
            newContent = this.fallbackEditor.value;
        }

        // Show loading
        showLoading('Saving changes...');

        try {
            // Update file data
            this.fileData.content = newContent;
            this.fileData.lastModified = Date.now();
            this.fileData.lastCommit = commitTitle;
            this.fileData.size = new Blob([newContent]).size;

            // Save to storage
            const filePath = (currentState.path ? currentState.path + '/' : '') + this.currentFile;
            LocalStorageManager.saveFile(currentState.repository, filePath, this.fileData);

            // Update UI
            showSuccessMessage(`File "${this.currentFile}" saved successfully!`);
            
            // Switch back to view mode
            this.displayViewMode(newContent, this.currentFile.split('.').pop().toLowerCase());
            this.exitEditMode();

            // Clear commit inputs
            if (this.elements.commitTitleInput) this.elements.commitTitleInput.value = '';
            if (this.elements.commitDescriptionInput) this.elements.commitDescriptionInput.value = '';

            // Update file list if needed
            if (window.renderFileList) {
                window.renderFileList();
            }

        } catch (error) {
            showErrorMessage('Failed to save file: ' + error.message);
        } finally {
            hideLoading();
        }
    }
    updateCommitMessage() {
        if (!this.currentFile || !this.elements.commitTitleInput) return;

        if (!this.elements.commitTitleInput.value.trim()) {
            this.elements.commitTitleInput.value = `Update ${this.currentFile}`;
        }
    }
    
    renameFile(newName) {
        if (!this.currentFile || !currentState.repository) return;

        const oldName = this.currentFile;
        if (newName === oldName) return;

        if (!isValidFilename(newName)) {
            showErrorMessage('Invalid file name');
            this.elements.fileNameInput.value = oldName;
            return;
        }

        // Get file path
        const oldPath = (currentState.path ? currentState.path + '/' : '') + oldName;
        const newPath = (currentState.path ? currentState.path + '/' : '') + newName;

        // Check if new name already exists
        const existingFile = LocalStorageManager.getFile(currentState.repository, newPath);
        if (existingFile) {
            showErrorMessage('A file with that name already exists');
            this.elements.fileNameInput.value = oldName;
            return;
        }

        // Get file data
        const fileData = LocalStorageManager.getFile(currentState.repository, oldPath);
        if (!fileData) {
            showErrorMessage('File not found');
            this.elements.fileNameInput.value = oldName;
            return;
        }

        // Rename in storage
        LocalStorageManager.saveFile(currentState.repository, newPath, {
            ...fileData,
            lastModified: Date.now(),
            lastCommit: `Rename ${oldName} to ${newName}`
        });

        LocalStorageManager.deleteFile(currentState.repository, oldPath);

        // Update current state
        this.currentFile = newName;
        
        // Update file in file list
        const fileIndex = currentState.files.findIndex(f => f.name === oldName);
        if (fileIndex !== -1) {
            currentState.files[fileIndex].name = newName;
            currentState.files[fileIndex].path = newPath;
        }

        // Update UI
        showSuccessMessage(`Renamed to "${newName}"`);
        
        // Update file list
        if (window.renderFileList) {
            window.renderFileList();
        }
    }
    getCodeMirrorMode(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const modeMap = {
            'js': 'javascript',
            'javascript': 'javascript',
            'ts': 'javascript',
            'typescript': 'javascript',
            'jsx': 'javascript',
            'tsx': 'javascript',
            'html': 'htmlmixed',
            'htm': 'htmlmixed',
            'css': 'css',
            'scss': 'css',
            'less': 'css',
            'json': 'javascript',
            'md': 'markdown',
            'markdown': 'markdown',
            'py': 'python',
            'python': 'python',
            'php': 'php',
            'java': 'text/x-java',
            'cpp': 'text/x-c++src',
            'c': 'text/x-csrc',
            'cs': 'text/x-csharp',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'yml': 'yaml',
            'yaml': 'yaml',
            'xml': 'xml',
            'sql': 'sql'
        };
        return modeMap[ext] || 'text';
    }
    
    exitEditMode() {
        this.isEditing = false;
        this.state.isModified = false;
        
        if (this.elements.container) {
            this.elements.container.classList.remove('edit-mode');
        }

        if (this.elements.editToggleBtn) {
            const span = this.elements.editToggleBtn.querySelector('span');
            if (span) span.textContent = 'Edit';
        }

        // Clear commit inputs
        if (this.elements.commitTitleInput) {
            this.elements.commitTitleInput.value = '';
        }
        if (this.elements.commitDescriptionInput) {
            this.elements.commitDescriptionInput.value = '';
        }
    }
    cancelEdit() {
        if (!this.state.isModified || confirm('You have unsaved changes. Discard changes?')) {
            this.displayViewMode(this.fileData.content || '', 
                this.currentFile.split('.').pop().toLowerCase());
            this.exitEditMode();
        }
    }



    renderLineNumbers() {
        if (!this.elements.lineNumbers || !this.elements.codeBlock) return;

        const code = this.elements.codeBlock.textContent || '';
        const lines = code.split('\n');
        this.state.totalLines = lines.length;

        let html = '';
        for (let i = 1; i <= lines.length; i++) {
            html += `<div class="line-number" data-line="${i}">${i}</div>`;
        }

        this.elements.lineNumbers.innerHTML = html;
    }

    updateBreadcrumb() {
        if (!this.elements.breadcrumb || !currentState) return;

        let html = '';
        if (currentState.repository) {
            html += `<span class="breadcrumb-item" onclick="navigateToRoot()">${currentState.repository}</span>`;
            
            if (currentState.path) {
                const segments = currentState.path.split('/');
                let currentPath = '';
                segments.forEach((segment, index) => {
                    currentPath += (currentPath ? '/' : '') + segment;
                    html += `
                        <span class="breadcrumb-separator">/</span>
                        <span class="breadcrumb-item" onclick="navigateToPath('${currentPath}')">${segment}</span>
                    `;
                });
            }
            
            html += `<span class="breadcrumb-separator">/</span>`;
        }
        
        html += `<span class="breadcrumb-item active">${this.currentFile}</span>`;
        
        this.elements.breadcrumb.innerHTML = html;
    }

    changeFontSize(delta) {
        const minSize = 8;
        const maxSize = 24;
        let newSize = this.state.fontSize + delta;

        if (newSize < minSize) newSize = minSize;
        if (newSize > maxSize) newSize = maxSize;

        this.state.fontSize = newSize;

        if (this.elements.codeContent) {
            this.elements.codeContent.style.fontSize = newSize + 'px';
        }
        if (this.elements.lineNumbers) {
            this.elements.lineNumbers.style.fontSize = newSize + 'px';
        }
        if (this.elements.fontSizeDisplay) {
            this.elements.fontSizeDisplay.textContent = newSize + 'px';
        }

        this.renderLineNumbers();
    }

    toggleWordWrap() {
        if (this.elements.wrapLinesBtn) {
            this.state.wrapEnabled = !this.state.wrapEnabled;
            this.elements.wrapLinesBtn.classList.toggle('active', this.state.wrapEnabled);
        }

        if (this.elements.codeContent) {
            if (this.state.wrapEnabled) {
                this.elements.codeContent.style.whiteSpace = 'pre-wrap';
                this.elements.codeContent.style.wordBreak = 'break-word';
            } else {
                this.elements.codeContent.style.whiteSpace = 'pre';
                this.elements.codeContent.style.wordBreak = 'normal';
            }
        }
    }

    toggleMinimap() {
        if (this.elements.minimapBtn) {
            this.state.minimapEnabled = !this.state.minimapEnabled;
            this.elements.minimapBtn.classList.toggle('active', this.state.minimapEnabled);
        }

        const minimap = document.querySelector('.minimap-container');
        if (minimap) {
            if (this.state.minimapEnabled) {
                minimap.style.opacity = '1';
                minimap.style.pointerEvents = 'auto';
                this.renderMinimap();
            } else {
                minimap.style.opacity = '0';
                minimap.style.pointerEvents = 'none';
            }
        }
    }

    renderMinimap() {
        if (!this.elements.minimapCanvas || !this.elements.codeBlock) return;

        const canvas = this.elements.minimapCanvas;
        const ctx = canvas.getContext('2d');
        const code = this.elements.codeBlock.textContent || '';
        const lines = code.split('\n');

        canvas.width = 80;
        canvas.height = Math.min(lines.length * 2, 400);

        ctx.fillStyle = '#1c2128';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        lines.forEach(function(line, index) {
            const y = index * 2;
            const lineLength = Math.min(line.length, 60);
            
            if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
                ctx.fillStyle = '#768390';
            } else if (line.includes('function') || line.includes('const') || line.includes('let')) {
                ctx.fillStyle = '#f47067';
            } else if (line.includes('"') || line.includes("'")) {
                ctx.fillStyle = '#96d0ff';
            } else {
                ctx.fillStyle = '#545d68';
            }

            ctx.fillRect(4, y, lineLength, 1);
        });

        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        if (!this.elements.minimapViewport || !this.elements.codeContainer) return;

        const container = this.elements.codeContainer;
        const scrollRatio = container.scrollTop / (container.scrollHeight - container.clientHeight);
        const viewportHeight = (container.clientHeight / container.scrollHeight) * 400;
        const maxTop = 400 - viewportHeight;

        if (this.elements.minimapViewport) {
            this.elements.minimapViewport.style.height = Math.max(viewportHeight, 30) + 'px';
            this.elements.minimapViewport.style.top = (scrollRatio * maxTop) + 'px';
        }
    }

    syncScroll() {
        if (this.elements.codeContainer && this.elements.lineNumbers) {
            this.elements.lineNumbers.style.transform = 
                `translateY(-${this.elements.codeContainer.scrollTop}px)`;
        }
    }

    copyCode() {
        const code = this.elements.codeBlock ? this.elements.codeBlock.textContent : '';
        const self = this;

        navigator.clipboard.writeText(code).then(function() {
            self.showCopyFeedback();
        }).catch(function(err) {
            console.error('Failed to copy:', err);
        });
    }

    showCopyFeedback() {
        const copyBtn = this.elements.copyFileBtn;
        if (copyBtn) {
            const originalTooltip = copyBtn.dataset.tooltip;
            copyBtn.dataset.tooltip = 'Copied!';
            copyBtn.classList.add('copied');

            setTimeout(function() {
                copyBtn.dataset.tooltip = originalTooltip;
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    }

    downloadCurrentFile() {
        if (!this.currentFile) return;
        
        if (window.downloadCurrentFile && typeof window.downloadCurrentFile === 'function') {
            window.downloadCurrentFile();
        }
    }

    handleSearch(query) {
        this.clearSearchHighlights();
        
        if (!query || query.length < 2) return;

        const codeText = this.elements.codeBlock.textContent;
        const regex = new RegExp(this.escapeRegex(query), 'gi');
        let match;
        const matches = [];

        while ((match = regex.exec(codeText)) !== null) {
            matches.push({
                index: match.index,
                length: match[0].length
            });
        }

        if (matches.length > 0) {
            this.highlightSearchMatches(matches, query);
        }
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    highlightSearchMatches(matches, query) {
        const codeHtml = this.elements.codeBlock.innerHTML;
        let newHtml = codeHtml;
        const regex = new RegExp('(' + this.escapeRegex(query) + ')', 'gi');
        
        newHtml = newHtml.replace(regex, '<mark class="search-highlight">$1</mark>');
        this.elements.codeBlock.innerHTML = newHtml;

        const firstMatch = document.querySelector('.search-highlight');
        if (firstMatch) {
            firstMatch.classList.add('current');
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    clearSearchHighlights() {
        const highlights = this.elements.codeBlock ? this.elements.codeBlock.querySelectorAll('.search-highlight') : [];
        highlights.forEach(function(el) {
            const text = el.textContent;
            el.replaceWith(text);
        });
    }

    updateSelectionInfo() {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        const charCount = selectedText.length;
        const lineCount = selectedText ? selectedText.split('\n').length : 0;

        if (this.elements.selectionInfo) {
            if (charCount > 0) {
                this.elements.selectionInfo.innerHTML = 
                    `<span>${charCount} char${charCount !== 1 ? 's' : ''}</span>` +
                    (lineCount > 1 ? `<span>, ${lineCount} lines</span>` : '');
            } else {
                this.elements.selectionInfo.innerHTML = '<span>0 selected</span>';
            }
        }
    }
}


function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

const codeViewerEditor = new CodeViewerEditor();

window.codeViewerEditor = codeViewerEditor;
window.CodeViewerEditor = CodeViewerEditor;
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