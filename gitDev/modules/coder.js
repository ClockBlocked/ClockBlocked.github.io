class coderViewEdit {
    constructor() {
        this.currentFile = null;
        this.fileData = null;
        this.codeMirror = null;
        this.isEditing = false;
        this.isLoading = false;
        this.originalContent = '';
        
        this.elements = {};
        this.state = {
            fontSize: 12,
            wrapLines: true,
            showMinimap: false
        };
    }

    init() {
        this.createContainer();
        this.bindEvents();
        this.setupCodeMirror();
    }

    createContainer() {
        const coder = document.getElementById('coder');
        if (!coder) return;
        
        coder.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <nav class="flex items-center space-x-1 text-sm">
                    <button onclick="showExplorer()" class="text-github-accent-fg hover:underline font-semibold">${currentState.repository || 'Repository'}</button>
                    <span class="text-github-fg-muted">/</span>
                    <input type="text" id="fileNameInput" class="bg-transparent border-none text-github-fg-default font-semibold focus:outline-none focus:bg-github-canvas-subtle px-1 rounded" value="" readonly>
                </nav>

                <div class="flex items-center space-x-2">
                    <button id="editToggleBtn" class="inline-flex items-center px-3 py-1.5 border border-github-border-default rounded-md text-sm font-medium text-github-fg-default bg-github-btn-secondary-bg hover:bg-github-btn-secondary-hover transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/>
                        </svg>
                        <span>Edit</span>
                    </button>
                    <button id="copyBtn" class="inline-flex items-center px-3 py-1.5 border border-github-border-default rounded-md text-sm font-medium text-github-fg-default bg-github-btn-secondary-bg hover:bg-github-btn-secondary-hover transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                        </svg>
                        Copy
                    </button>
                    <button id="downloadBtn" class="inline-flex items-center px-3 py-1.5 border border-github-border-default rounded-md text-sm font-medium text-github-fg-default bg-github-btn-secondary-bg hover:bg-github-btn-secondary-hover transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
                            <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
                        </svg>
                        Download
                    </button>
                </div>
            </div>

            <div class="bg-github-canvas-overlay border border-github-border-default rounded-t-lg px-4 py-2 flex items-center justify-between text-sm">
                <div class="flex items-center space-x-4 text-github-fg-muted" id="fileStats">
                    <span id="fileLinesCount">0 lines</span>
                    <span>•</span>
                    <span id="fileSize">0 KB</span>
                    <span>•</span>
                    <span id="fileLanguageDisplay">Text</span>
                </div>
                <div class="flex items-center space-x-1">
                    <button id="wrapLinesBtn" class="p-2 rounded hover:bg-github-canvas-subtle text-github-fg-muted hover:text-github-fg-default transition-colors" data-tooltip="Wrap lines">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5ZM3 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="bg-github-canvas-overlay border-x border-b border-github-border-default rounded-b-lg overflow-hidden relative">
                <div id="loadingOverlay" class="hidden absolute inset-0 bg-github-canvas-overlay/90 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div class="text-center">
                        <div class="w-8 h-8 border-2 border-github-border-default border-t-github-accent-fg rounded-full animate-spin mx-auto mb-2"></div>
                        <p class="text-github-fg-muted text-sm" id="loadingText">Loading...</p>
                    </div>
                </div>
                
                <div class="flex">
                    <div id="codeViewerLineNumbers" class="bg-github-canvas-inset border-r border-github-border-muted p-4 text-right text-github-fg-muted font-mono text-sm leading-5 select-none min-w-[3rem]">
                    </div>
                    <div class="flex-1 overflow-auto">
                        <div id="codeMirrorContainer" class="h-[500px]"></div>
                    </div>
                </div>
            </div>

            <div id="commitPanel" class="hidden mt-6 bg-github-canvas-overlay border border-github-border-default rounded-lg p-6">
                <h3 class="text-lg font-semibold text-github-fg-default mb-4">Commit changes</h3>
                <div class="space-y-4">
                    <div>
                        <input type="text" id="commitTitleInput" placeholder="Update filename.ext" class="w-full px-3 py-2 bg-github-canvas-inset border border-github-border-default rounded-md text-github-fg-default placeholder-github-fg-muted focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-transparent">
                    </div>
                    <div>
                        <textarea id="commitDescriptionInput" rows="4" placeholder="Add an optional extended description..." class="w-full px-3 py-2 bg-github-canvas-inset border border-github-border-default rounded-md text-github-fg-default placeholder-github-fg-muted focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-transparent resize-none"></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button id="cancelEditBtn" class="px-4 py-2 border border-github-border-default rounded-md text-sm font-medium text-github-fg-default bg-github-btn-secondary-bg hover:bg-github-btn-secondary-hover transition-colors">
                            Cancel
                        </button>
                        <button id="saveChangesBtn" class="px-4 py-2 bg-github-btn-primary-bg hover:bg-github-btn-primary-hover text-white rounded-md text-sm font-medium transition-colors">
                            Commit changes
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            coder: document.getElementById('coder'),
            fileNameInput: document.getElementById('fileNameInput'),
            editToggleBtn: document.getElementById('editToggleBtn'),
            copyBtn: document.getElementById('copyBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            fileStats: document.getElementById('fileStats'),
            fileLinesCount: document.getElementById('fileLinesCount'),
            fileSize: document.getElementById('fileSize'),
            fileLanguageDisplay: document.getElementById('fileLanguageDisplay'),
            wrapLinesBtn: document.getElementById('wrapLinesBtn'),
            codeMirrorContainer: document.getElementById('codeMirrorContainer'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),
            commitPanel: document.getElementById('commitPanel'),
            commitTitleInput: document.getElementById('commitTitleInput'),
            commitDescriptionInput: document.getElementById('commitDescriptionInput'),
            cancelEditBtn: document.getElementById('cancelEditBtn'),
            saveChangesBtn: document.getElementById('saveChangesBtn')
        };
    }

    bindEvents() {
        if (this.elements.editToggleBtn) {
            this.elements.editToggleBtn.addEventListener('click', () => {
                if (this.isEditing) {
                    this.cancelEdit();
                } else {
                    this.enterEditMode();
                }
            });
        }

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

        if (this.elements.copyBtn) {
            this.elements.copyBtn.addEventListener('click', () => {
                this.copyCode();
            });
        }

        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.addEventListener('click', () => {
                this.downloadFile();
            });
        }

        if (this.elements.wrapLinesBtn) {
            this.elements.wrapLinesBtn.addEventListener('click', () => {
                this.toggleWrapLines();
            });
        }

        if (this.elements.fileNameInput) {
            this.elements.fileNameInput.addEventListener('dblclick', () => {
                if (this.isEditing) {
                    this.elements.fileNameInput.readOnly = false;
                    this.elements.fileNameInput.select();
                }
            });

            this.elements.fileNameInput.addEventListener('blur', () => {
                this.elements.fileNameInput.readOnly = true;
                this.renameFile(this.elements.fileNameInput.value);
            });

            this.elements.fileNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.elements.fileNameInput.blur();
                if (e.key === 'Escape') {
                    this.elements.fileNameInput.value = this.currentFile;
                    this.elements.fileNameInput.blur();
                }
            });
        }

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

    setupCodeMirror() {
        if (typeof CodeMirror === 'undefined') {
            setTimeout(() => this.setupCodeMirror(), 100);
            return;
        }

        if (!this.elements.codeMirrorContainer || this.codeMirror) return;
        
        this.codeMirror = CodeMirror(this.elements.codeMirrorContainer, {
            value: '',
            mode: 'javascript',
            theme: 'material-darker',
            lineNumbers: false,
            lineWrapping: true,
            readOnly: true,
            tabSize: 2,
            indentUnit: 2,
            smartIndent: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            scrollbarStyle: 'native',
            viewportMargin: Infinity,
            cursorBlinkRate: 530,
            extraKeys: {
                "Ctrl-S": () => this.saveChanges(),
                "Cmd-S": () => this.saveChanges(),
                "Ctrl-F": "findPersistent",
                "Ctrl-D": (cm) => cm.execCommand("duplicateLine"),
                "Ctrl-/": "toggleComment"
            }
        });
        
        this.updateLineNumbers();
    }

    updateLineNumbers() {
        if (!this.codeMirror || !this.elements.codeViewerLineNumbers) return;
        
        const content = this.codeMirror.getValue();
        const lines = content.split('\n');
        this.elements.codeViewerLineNumbers.innerHTML = '';
        
        for (let i = 1; i <= lines.length; i++) {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'line-number';
            lineDiv.textContent = i;
            this.elements.codeViewerLineNumbers.appendChild(lineDiv);
        }
    }

    show() {
        if (this.elements.coder) {
            this.elements.coder.classList.remove('hidden');
        }
    }

    hide() {
        if (this.elements.coder) {
            this.elements.coder.classList.add('hidden');
        }
    }

    displayFile(filename, fileData) {
        this.currentFile = filename;
        this.fileData = fileData;
        this.originalContent = fileData.content || '';
        
        if (this.elements.fileNameInput) {
            this.elements.fileNameInput.value = filename;
        }
        
        const ext = filename.split('.').pop().toLowerCase();
        const language = getLanguageName(ext);
        const size = formatFileSize(new Blob([this.originalContent]).size);
        const lines = this.originalContent.split('\n').length;
        
        if (this.elements.fileLanguageDisplay) {
            this.elements.fileLanguageDisplay.textContent = language;
        }
        if (this.elements.fileLinesCount) {
            this.elements.fileLinesCount.textContent = `${lines} ${lines === 1 ? 'line' : 'lines'}`;
        }
        if (this.elements.fileSize) {
            this.elements.fileSize.textContent = size;
        }
        
        if (!this.codeMirror) {
            this.setupCodeMirror();
            setTimeout(() => {
                if (this.codeMirror) {
                    this.codeMirror.setValue(this.originalContent);
                    this.setCodeMirrorMode(filename);
                    this.updateLineNumbers();
                }
            }, 100);
        } else {
            this.codeMirror.setValue(this.originalContent);
            this.setCodeMirrorMode(filename);
            this.updateLineNumbers();
        }
        
        this.show();
        this.exitEditMode();
    }

    setCodeMirrorMode(filename) {
        if (!this.codeMirror) return;
        
        const ext = filename.split('.').pop().toLowerCase();
        const modeMap = {
            'js': 'javascript', 'javascript': 'javascript',
            'ts': 'javascript', 'typescript': 'javascript',
            'html': 'htmlmixed', 'htm': 'htmlmixed',
            'css': 'css', 'scss': 'css', 'less': 'css',
            'json': 'javascript', 'md': 'markdown',
            'py': 'python', 'php': 'php', 'java': 'text/x-java',
            'cpp': 'text/x-c++src', 'c': 'text/x-csrc',
            'xml': 'xml', 'sql': 'sql', 'yml': 'yaml'
        };
        
        this.codeMirror.setOption('mode', modeMap[ext] || 'text');
    }

    setReadOnly(readOnly) {
        if (!this.codeMirror) return;
        
        this.codeMirror.setOption('readOnly', readOnly);
        
        const cmElement = this.codeMirror.getWrapperElement();
        if (readOnly) {
            cmElement.style.pointerEvents = 'none';
            cmElement.style.cursor = 'default';
        } else {
            cmElement.style.pointerEvents = 'all';
            cmElement.style.cursor = 'text';
        }
    }

    showLoading(message = 'Loading...') {
        if (!this.elements.loadingOverlay || !this.elements.loadingText) return;
        
        this.isLoading = true;
        this.elements.loadingText.textContent = message;
        this.elements.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        if (!this.elements.loadingOverlay) return;
        
        this.isLoading = false;
        this.elements.loadingOverlay.classList.add('hidden');
    }

    enterEditMode() {
        if (!this.currentFile || this.isLoading) return;
        
        this.showLoading('Switching to edit mode...');
        
        setTimeout(() => {
            try {
                this.isEditing = true;
                
                if (this.elements.editToggleBtn) {
                    this.elements.editToggleBtn.innerHTML = `
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
                        </svg>
                        <span>Cancel</span>
                    `;
                    this.elements.editToggleBtn.classList.remove('bg-github-btn-secondary-bg');
                    this.elements.editToggleBtn.classList.add('bg-github-danger-emphasis', 'text-white');
                }
                
                this.setReadOnly(false);
                this.elements.commitPanel.classList.remove('hidden');
                
                setTimeout(() => {
                    if (this.codeMirror) {
                        this.codeMirror.focus();
                        this.codeMirror.setCursor(0, 0);
                    }
                }, 100);
                
                this.updateCommitMessage();
                this.hideLoading();
                
            } catch (error) {
                this.hideLoading();
                showErrorMessage('Failed to enter edit mode');
            }
        }, 800);
    }

    exitEditMode() {
        this.isEditing = false;
        
        if (this.elements.editToggleBtn) {
            this.elements.editToggleBtn.innerHTML = `
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/>
                </svg>
                <span>Edit</span>
            `;
            this.elements.editToggleBtn.classList.remove('bg-github-danger-emphasis', 'text-white');
            this.elements.editToggleBtn.classList.add('bg-github-btn-secondary-bg');
        }
        
        if (this.codeMirror) {
            this.setReadOnly(true);
        }
        
        this.elements.commitPanel.classList.add('hidden');
        
        if (this.elements.commitTitleInput) {
            this.elements.commitTitleInput.value = '';
        }
        if (this.elements.commitDescriptionInput) {
            this.elements.commitDescriptionInput.value = '';
        }
    }

    cancelEdit() {
        if (!confirm('Discard changes?')) return;
        
        this.showLoading('Reverting changes...');
        
        setTimeout(() => {
            if (this.codeMirror) {
                this.codeMirror.setValue(this.originalContent);
            }
            
            this.exitEditMode();
            this.hideLoading();
        }, 300);
    }

    updateCommitMessage() {
        if (!this.currentFile || !this.elements.commitTitleInput) return;
        
        if (!this.elements.commitTitleInput.value.trim()) {
            this.elements.commitTitleInput.value = `Update ${this.currentFile}`;
        }
    }

    saveChanges() {
        if (!this.currentFile || !this.fileData) return;
        
        const commitTitle = this.elements.commitTitleInput ? 
            this.elements.commitTitleInput.value.trim() : '';
        
        if (!commitTitle) {
            showErrorMessage('Please enter a commit message');
            return;
        }
        
        const commitDescription = this.elements.commitDescriptionInput ? 
            this.elements.commitDescriptionInput.value.trim() : '';
        
        this.showLoading('Saving changes...');
        
        setTimeout(() => {
            try {
                const newContent = this.codeMirror ? this.codeMirror.getValue() : '';
                
                this.fileData.content = newContent;
                this.fileData.lastModified = Date.now();
                this.fileData.lastCommit = commitTitle;
                this.fileData.size = new Blob([newContent]).size;
                
                const filePath = (currentState.path ? currentState.path + '/' : '') + this.currentFile;
                LocalStorageManager.saveFile(currentState.repository, filePath, this.fileData);
                
                this.originalContent = newContent;
                
                showSuccessMessage(`Saved ${this.currentFile}`);
                
                this.exitEditMode();
                
                if (this.elements.commitTitleInput) this.elements.commitTitleInput.value = '';
                if (this.elements.commitDescriptionInput) this.elements.commitDescriptionInput.value = '';
                
                if (window.renderFileList) {
                    window.renderFileList();
                }
                
                this.hideLoading();
                
            } catch (error) {
                this.hideLoading();
                showErrorMessage(`Save failed: ${error.message}`);
            }
        }, 500);
    }

    copyCode() {
        if (!this.codeMirror) return;
        
        const content = this.codeMirror.getValue();
        navigator.clipboard.writeText(content).then(() => {
            showSuccessMessage('Copied to clipboard');
        }).catch(err => {
            showErrorMessage('Failed to copy');
        });
    }

    downloadFile() {
        if (!this.currentFile || !this.fileData) return;
        
        const content = this.fileData.content || '';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccessMessage(`Downloaded ${this.currentFile}`);
    }

    toggleWrapLines() {
        if (!this.codeMirror) return;
        
        const current = this.codeMirror.getOption('lineWrapping');
        this.codeMirror.setOption('lineWrapping', !current);
        
        if (this.elements.wrapLinesBtn) {
            if (!current) {
                this.elements.wrapLinesBtn.classList.add('text-github-accent-fg');
            } else {
                this.elements.wrapLinesBtn.classList.remove('text-github-accent-fg');
            }
        }
    }

    renameFile(newName) {
        // Rename logic here
    }
}

window.coderViewEdit = new coderViewEdit();
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
