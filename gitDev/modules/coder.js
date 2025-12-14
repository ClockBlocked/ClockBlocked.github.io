/**
*
*  coderViewEdit.js - Unified Code Viewer/Editor
*  Uses single CodeMirror instance with readOnly toggle
*
**/
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
        this.setupStyles();
        this.createContainer();
        this.bindEvents();
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #coder {
                display: flex;
                flex-direction: column;
                background: #1c2128;
                border: 1px solid #444c56;
                border-radius: 6px;
                overflow: hidden;
                height: 100%;
                transition: all 0.3s ease;
            }
            
            #coder[data-state="edit"] {
                border-color: #347d39;
                box-shadow: 0 0 0 1px rgba(52, 125, 57, 0.3);
            }
            
            .code-viewer-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 16px;
                background: linear-gradient(180deg, #2d333b 0%, #282e36 100%);
                border-bottom: 1px solid #444c56;
                min-height: 44px;
                gap: 16px;
            }
            
            .header-left {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
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
            
            .header-actions {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .action-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 6px 8px;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 6px;
                color: #768390;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            
            .edit-btn {
                background: linear-gradient(180deg, #347d39 0%, #2b6a30 100%);
                border-color: rgba(0, 0, 0, 0.2);
                color: #ffffff;
                font-size: 12px;
                font-weight: 500;
                padding: 6px 12px;
            }
            
            #coder[data-state="edit"] .edit-btn {
                background: linear-gradient(180deg, #e5534b 0%, #c93c37 100%);
            }
            
            #coder[data-state="edit"] .edit-btn span {
                content: "Cancel";
            }
            
            .code-viewer-body {
                position: relative;
                flex: 1;
                overflow: hidden;
                min-height: 300px;
            }
            
            .loading-transition {
                transition: opacity 0.3s ease;
            }
            
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(28, 33, 40, 0.9);
                backdrop-filter: blur(4px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 16px;
                z-index: 100;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            
            .loading-overlay.active {
                opacity: 1;
                pointer-events: all;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #373e47;
                border-top-color: #539bf5;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .code-container {
                height: 100%;
                overflow: auto;
            }
            
            .CodeMirror {
                height: 100%;
                background: transparent !important;
                color: #adbac7;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 12px;
                line-height: 1.5;
            }
            
            .CodeMirror-gutters {
                background: #1c2128 !important;
                border-right: 1px solid #444c56 !important;
            }
            
            .CodeMirror-linenumber {
                color: #545d68 !important;
            }
            
            .CodeMirror-cursor {
                border-left: 2px solid #539bf5 !important;
            }
            
            .CodeMirror-readonly .CodeMirror-cursor {
                display: none !important;
            }
            
            .commit-panel {
                max-height: 0;
                overflow: hidden;
                opacity: 0;
                transition: all 0.3s ease;
                background: #22272e;
                border-top: 1px solid #373e47;
            }
            
            #coder[data-state="edit"] .commit-panel {
                max-height: 200px;
                opacity: 1;
                padding: 16px;
            }
            
            .commit-input, .commit-textarea {
                width: 100%;
                padding: 8px 12px;
                background: #1c2128;
                border: 1px solid #444c56;
                border-radius: 6px;
                color: #adbac7;
                font-size: 14px;
                transition: all 0.2s ease;
            }
            
            .commit-input:focus, .commit-textarea:focus {
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
            }
            
            .cancel-btn {
                padding: 8px 16px;
                background: transparent;
                border: 1px solid #444c56;
                border-radius: 6px;
                color: #adbac7;
                font-weight: 500;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    createContainer() {
        // Remove existing fileViewer and fileEditor
        const fileViewer = document.getElementById('fileViewer');
        const fileEditor = document.getElementById('fileEditor');
        if (fileViewer) fileViewer.remove();
        if (fileEditor) fileEditor.remove();
        
        // Create the unified coder container
        const coderHTML = `
            <div id="coder" class="hidden" data-state="view">
                <!-- Header, Toolbar, Code Area, Commit Panel as shown above -->
            </div>
        `;
        
        // Insert where fileViewer was
        const mainContainer = document.querySelector('main') || document.body;
        mainContainer.insertAdjacentHTML('beforeend', coderHTML);
        
        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            coder: document.getElementById('coder'),
            fileNameInput: document.getElementById('fileNameInput'),
            editToggleBtn: document.getElementById('editToggleBtn'),
            copyBtn: document.getElementById('copyBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            codeMirrorContainer: document.getElementById('codeMirrorContainer'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            commitPanel: document.getElementById('commitPanel'),
            commitTitleInput: document.getElementById('commitTitleInput'),
            commitDescriptionInput: document.getElementById('commitDescriptionInput'),
            cancelEditBtn: document.getElementById('cancelEditBtn'),
            saveChangesBtn: document.getElementById('saveChangesBtn')
        };
    }

    bindEvents() {
        // Edit toggle
        if (this.elements.editToggleBtn) {
            this.elements.editToggleBtn.addEventListener('click', () => {
                if (this.isEditing) {
                    this.cancelEdit();
                } else {
                    this.enterEditMode();
                }
            });
        }

        // Save changes
        if (this.elements.saveChangesBtn) {
            this.elements.saveChangesBtn.addEventListener('click', () => {
                this.saveChanges();
            });
        }

        // Cancel edit
        if (this.elements.cancelEditBtn) {
            this.elements.cancelEditBtn.addEventListener('click', () => {
                this.cancelEdit();
            });
        }

        // Copy button
        if (this.elements.copyBtn) {
            this.elements.copyBtn.addEventListener('click', () => {
                this.copyCode();
            });
        }

        // Download button
        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.addEventListener('click', () => {
                this.downloadFile();
            });
        }

        // File name editing
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

        // Keyboard shortcuts
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

    show() {
        if (this.elements.coder) {
            this.elements.coder.classList.remove('hidden');
        }
    }

    hide() {
        if (this.elements.coder) {
            this.elements.coder.classList.add('hidden');
            this.exitEditMode();
        }
    }

    displayFile(filename, fileData) {
        this.currentFile = filename;
        this.fileData = fileData;
        this.originalContent = fileData.content || '';
        
        // Update UI
        if (this.elements.fileNameInput) {
            this.elements.fileNameInput.value = filename;
        }
        
        // Initialize CodeMirror if it doesn't exist
        if (!this.codeMirror && typeof CodeMirror !== 'undefined') {
            this.initializeCodeMirror();
        }
        
        // Set content
        if (this.codeMirror) {
            this.codeMirror.setValue(this.originalContent);
            this.setCodeMirrorMode(filename);
            this.setReadOnly(true);
        }
        
        // Show the coder
        this.show();
        this.exitEditMode();
    }

    initializeCodeMirror() {
        if (!this.elements.codeMirrorContainer || typeof CodeMirror === 'undefined') return;
        
        this.codeMirror = CodeMirror(this.elements.codeMirrorContainer, {
            value: '',
            mode: 'javascript',
            theme: 'material-darker',
            lineNumbers: true,
            lineWrapping: this.state.wrapLines,
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
        
        // Add readonly class when in view mode
        this.codeMirror.on('change', () => {
            if (this.isEditing) {
                this.updateCommitMessage();
            }
        });
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
        
        // Toggle readonly class for CSS styling
        const cmElement = this.codeMirror.getWrapperElement();
        if (readOnly) {
            cmElement.classList.add('CodeMirror-readonly');
            cmElement.style.pointerEvents = 'none';
        } else {
            cmElement.classList.remove('CodeMirror-readonly');
            cmElement.style.pointerEvents = 'all';
        }
    }

    showLoading(message = 'Loading...') {
        if (!this.elements.loadingOverlay) return;
        
        this.isLoading = true;
        const textEl = this.elements.loadingOverlay.querySelector('.loading-text');
        if (textEl) textEl.textContent = message;
        
        this.elements.loadingOverlay.classList.add('active');
    }

    hideLoading() {
        if (!this.elements.loadingOverlay) return;
        
        this.isLoading = false;
        this.elements.loadingOverlay.classList.remove('active');
    }

    async enterEditMode() {
        if (!this.currentFile || this.isLoading) return;
        
        this.showLoading('Switching to edit mode...');
        
        // Simulate loading delay (like GitHub)
        setTimeout(() => {
            try {
                this.isEditing = true;
                this.elements.coder.setAttribute('data-state', 'edit');
                
                // Switch to edit mode
                this.setReadOnly(false);
                
                // Focus the editor
                setTimeout(() => {
                    if (this.codeMirror) {
                        this.codeMirror.focus();
                        this.codeMirror.setCursor(0, 0);
                    }
                }, 100);
                
                // Pre-fill commit message
                this.updateCommitMessage();
                
                this.hideLoading();
                
            } catch (error) {
                console.error('Failed to enter edit mode:', error);
                this.hideLoading();
                showErrorMessage('Failed to load editor');
            }
        }, 800); // GitHub-like delay
    }

    exitEditMode() {
        this.isEditing = false;
        this.elements.coder.setAttribute('data-state', 'view');
        
        if (this.codeMirror) {
            this.setReadOnly(true);
        }
        
        // Reset commit inputs
        if (this.elements.commitTitleInput) {
            this.elements.commitTitleInput.value = '';
        }
        if (this.elements.commitDescriptionInput) {
            this.elements.commitDescriptionInput.value = '';
        }
        
        // Update edit button text
        const editBtnSpan = this.elements.editToggleBtn.querySelector('span');
        if (editBtnSpan) editBtnSpan.textContent = 'Edit';
    }

    cancelEdit() {
        if (!confirm('Discard changes?')) return;
        
        this.showLoading('Reverting changes...');
        
        setTimeout(() => {
            // Restore original content
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

    async saveChanges() {
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
        
        setTimeout(async () => {
            try {
                // Get new content
                const newContent = this.codeMirror ? this.codeMirror.getValue() : '';
                
                // Update file data
                this.fileData.content = newContent;
                this.fileData.lastModified = Date.now();
                this.fileData.lastCommit = commitTitle;
                this.fileData.size = new Blob([newContent]).size;
                
                // Save to storage
                const filePath = (currentState.path ? currentState.path + '/' : '') + this.currentFile;
                LocalStorageManager.saveFile(currentState.repository, filePath, this.fileData);
                
                // Update original content
                this.originalContent = newContent;
                
                // Show success
                showSuccessMessage(`Saved ${this.currentFile}`);
                
                // Exit edit mode
                this.exitEditMode();
                
                // Clear commit inputs
                if (this.elements.commitTitleInput) this.elements.commitTitleInput.value = '';
                if (this.elements.commitDescriptionInput) this.elements.commitDescriptionInput.value = '';
                
                // Update file list if needed
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

    renameFile(newName) {
        // Your existing rename logic here
        console.log('Renaming to:', newName);
    }
}

// Initialize and expose
const coderviewedit = new coderViewEdit();
window.coderViewEdit = coderViewEdit;