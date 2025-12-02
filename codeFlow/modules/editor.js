// Code Editor Manager
class CodeEditor {
    constructor() {
        this.editor = null;
        this.currentSnippet = null;
        this.files = [];
        this.currentFileIndex = 0;
        this.editorSettings = {
            fontSize: 14,
            wordWrap: 'on',
            minimap: false,
            theme: 'dracula',
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2
        };
        this.isInitialized = false;
    }

    async initialize() {
        console.log('Initializing editor...');
        
        // Create default file if none exist
        if (this.files.length === 0) {
            this.files = [{
                id: this.generateId(),
                filename: 'script.js',
                language: 'javascript',
                content: '// Start coding here...\nconsole.log("Hello, World!");',
                size: 0
            }];
        }

        // Initialize editor
        this.initEditor();
        
        // Render UI components
        this.renderFileTabs();
        this.renderFileTree();
        this.updateEditorStatus();
        
        this.isInitialized = true;
        console.log('Editor initialized successfully');
    }

    initEditor() {
        const editorElement = document.getElementById('editor-instance');
        if (!editorElement) {
            console.error('Editor element not found');
            return;
        }

        // Clear existing editor
        if (this.editor) {
            this.editor.toTextArea();
            this.editor = null;
        }

        // Create textarea for CodeMirror
        const textarea = document.getElementById('code-editor');
        if (!textarea) {
            console.error('Code editor textarea not found');
            return;
        }

        // Set initial content
        textarea.value = this.files[this.currentFileIndex]?.content || '';

        try {
            // Initialize CodeMirror
            this.editor = CodeMirror.fromTextArea(textarea, {
                value: this.files[this.currentFileIndex]?.content || '',
                mode: this.getLanguageMode(this.files[this.currentFileIndex]?.language || 'javascript'),
                theme: this.editorSettings.theme,
                lineNumbers: this.editorSettings.lineNumbers,
                lineWrapping: this.editorSettings.lineWrapping,
                autoCloseBrackets: this.editorSettings.autoCloseBrackets,
                matchBrackets: this.editorSettings.matchBrackets,
                indentUnit: this.editorSettings.indentUnit,
                tabSize: this.editorSettings.tabSize,
                scrollbarStyle: 'simple',
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                extraKeys: {
                    "Ctrl-Space": "autocomplete",
                    "Tab": function(cm) {
                        if (cm.somethingSelected()) {
                            cm.indentSelection("add");
                        } else {
                            cm.replaceSelection("  ", "end");
                        }
                    },
                    "Shift-Tab": "indentLess"
                }
            });

            // Set editor size
            this.editor.setSize('100%', '100%');

            // Listen for changes
            this.editor.on('change', () => {
                this.updateCurrentFileContent();
                this.updateEditorStatus();
            });

            // Listen for cursor activity
            this.editor.on('cursorActivity', () => {
                this.updateEditorStatus();
            });

            // Handle focus
            this.editor.on('focus', () => {
                editorElement.classList.add('focused');
            });

            this.editor.on('blur', () => {
                editorElement.classList.remove('focused');
            });

            console.log('CodeMirror editor created successfully');

        } catch (error) {
            console.error('Failed to create CodeMirror editor:', error);
            
            // Fallback to simple textarea
            textarea.style.display = 'block';
            textarea.style.width = '100%';
            textarea.style.height = '100%';
            textarea.style.fontFamily = 'var(--font-mono)';
            textarea.style.fontSize = '14px';
            textarea.style.backgroundColor = 'var(--bg-primary)';
            textarea.style.color = 'var(--text-primary)';
            textarea.style.border = 'none';
            textarea.style.padding = 'var(--space-3)';
            textarea.style.resize = 'none';
            
            textarea.addEventListener('input', () => {
                this.updateCurrentFileContent();
                this.updateEditorStatus();
            });
        }
    }

    loadSnippet(snippet) {
        console.log('Loading snippet:', snippet);
        this.currentSnippet = snippet;
        this.files = JSON.parse(JSON.stringify(snippet.files || []));
        
        if (this.files.length === 0) {
            this.files = [{
                id: this.generateId(),
                filename: 'script.js',
                language: 'javascript',
                content: '// Start coding here...',
                size: 0
            }];
        }

        // Update form fields
        const titleInput = document.getElementById('snippet-title');
        const descriptionInput = document.getElementById('snippet-description');
        const publicInput = document.getElementById('snippet-public');
        const tagsInput = document.getElementById('snippet-tags');
        
        if (titleInput) titleInput.value = snippet.title || '';
        if (descriptionInput) descriptionInput.value = snippet.description || '';
        if (publicInput) publicInput.checked = snippet.isPublic !== false;
        if (tagsInput) tagsInput.value = snippet.tags ? snippet.tags.join(', ') : '';

        // Initialize or update editor
        if (this.isInitialized) {
            this.switchToFile(0);
            this.renderFileTabs();
            this.renderFileTree();
        } else {
            this.initialize();
        }
    }

    renderFileTabs() {
        const container = document.getElementById('file-tabs');
        if (!container) return;

        container.innerHTML = this.files.map((file, index) => `
            <button class="file-tab ${index === this.currentFileIndex ? 'active' : ''}" 
                    onclick="editor.switchToFile(${index})"
                    title="${file.filename}">
                <i class="fas fa-file-code"></i>
                <span class="tab-filename">${this.truncateFilename(file.filename, 15)}</span>
                <span class="tab-close" onclick="event.stopPropagation(); editor.removeFile(${index})" 
                      title="Close ${file.filename}">
                    <i class="fas fa-times"></i>
                </span>
            </button>
        `).join('');
    }

    renderFileTree() {
        const container = document.getElementById('file-tree');
        if (!container) return;

        container.innerHTML = this.files.map((file, index) => `
            <div class="file-item ${index === this.currentFileIndex ? 'active' : ''}" 
                 onclick="editor.switchToFile(${index})"
                 title="${file.filename}">
                <i class="fas fa-file-code file-icon"></i>
                <span class="file-name">${this.truncateFilename(file.filename, 20)}</span>
                <div class="file-actions" style="margin-left: auto; display: flex; gap: 4px;">
                    <button class="file-action-btn" onclick="event.stopPropagation(); editor.renameFile(${index})" 
                            title="Rename">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${this.files.length > 1 ? `
                        <button class="file-action-btn" onclick="event.stopPropagation(); editor.removeFile(${index})" 
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    switchToFile(index) {
        if (index < 0 || index >= this.files.length) return;

        // Save current file content
        this.updateCurrentFileContent();

        // Update current file index
        this.currentFileIndex = index;

        // Update editor content
        const file = this.files[index];
        if (this.editor) {
            this.editor.setValue(file.content || '');
            this.editor.setOption('mode', this.getLanguageMode(file.language));
            
            // Refresh editor to ensure proper rendering
            setTimeout(() => {
                this.editor.refresh();
            }, 0);
        }

        // Update UI
        this.renderFileTabs();
        this.renderFileTree();
        this.updateEditorStatus();
        
        // Focus editor
        if (this.editor) {
            setTimeout(() => {
                this.editor.focus();
            }, 100);
        }
    }

    updateCurrentFileContent() {
        if (!this.editor || this.currentFileIndex >= this.files.length) return;

        const content = this.editor.getValue();
        this.files[this.currentFileIndex].content = content;
        this.files[this.currentFileIndex].size = new Blob([content]).size;
    }

    addNewFile() {
        const filename = prompt('Enter filename (with extension):', 'newfile.js');
        if (!filename) return;

        // Validate filename
        if (!filename.trim()) {
            alert('Please enter a valid filename');
            return;
        }

        // Check for duplicate filenames
        if (this.files.some(f => f.filename === filename)) {
            alert('A file with this name already exists!');
            return;
        }

        // Detect language from extension
        const language = this.detectLanguage(filename);

        const newFile = {
            id: this.generateId(),
            filename: filename,
            language: language,
            content: this.getDefaultContent(language),
            size: 0
        };

        this.files.push(newFile);
        this.switchToFile(this.files.length - 1);
        
        // Show success message
        app.showToast(`Created ${filename}`, 'success');
    }

    renameFile(index) {
        const currentName = this.files[index].filename;
        const newName = prompt('Enter new filename:', currentName);
        if (!newName || newName === currentName) return;

        // Validate new name
        if (!newName.trim()) {
            alert('Please enter a valid filename');
            return;
        }

        // Check for duplicate filenames
        if (this.files.some((f, i) => i !== index && f.filename === newName)) {
            alert('A file with this name already exists!');
            return;
        }

        this.files[index].filename = newName;
        this.files[index].language = this.detectLanguage(newName);
        
        this.renderFileTabs();
        this.renderFileTree();
        
        if (index === this.currentFileIndex && this.editor) {
            this.editor.setOption('mode', this.getLanguageMode(this.files[index].language));
        }
        
        app.showToast(`Renamed to ${newName}`, 'success');
    }

    removeFile(index) {
        if (this.files.length <= 1) {
            alert('Cannot delete the last file!');
            return;
        }

        const filename = this.files[index].filename;
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }

        const wasActive = index === this.currentFileIndex;
        this.files.splice(index, 1);

        // Adjust current file index if needed
        if (wasActive) {
            this.currentFileIndex = Math.max(0, Math.min(this.currentFileIndex, this.files.length - 1));
            this.switchToFile(this.currentFileIndex);
        } else if (this.currentFileIndex > index) {
            this.currentFileIndex--;
        }

        app.showToast(`Deleted ${filename}`, 'success');
    }

    async saveSnippet() {
        try {
            // Update current file content
            this.updateCurrentFileContent();

            // Get form values
            const titleInput = document.getElementById('snippet-title');
            const descriptionInput = document.getElementById('snippet-description');
            const publicInput = document.getElementById('snippet-public');
            const tagsInput = document.getElementById('snippet-tags');
            
            if (!titleInput || !descriptionInput || !publicInput || !tagsInput) {
                throw new Error('Form elements not found');
            }

            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();
            const isPublic = publicInput.checked;
            const tags = tagsInput.value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            // Validate
            if (!title) {
                app.showToast('Please enter a title for your snippet', 'error');
                titleInput.focus();
                return;
            }

            if (this.files.length === 0) {
                app.showToast('Please add at least one file', 'error');
                return;
            }

            // Validate each file
            for (const file of this.files) {
                if (!file.filename.trim()) {
                    app.showToast('All files must have a filename', 'error');
                    return;
                }
                if (!file.content && file.content !== '') {
                    app.showToast('File content cannot be undefined', 'error');
                    return;
                }
            }

            // Calculate language stats
            const languageStats = this.calculateLanguageStats();

            // Create or update snippet
            const snippet = {
                id: this.currentSnippet?.id || this.generateId(),
                title: title,
                description: description || '',
                isPublic: isPublic,
                createdAt: this.currentSnippet?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tags: tags,
                languageStats: languageStats,
                files: this.files.map(file => ({
                    ...file,
                    size: new Blob([file.content]).size
                })),
                metadata: {
                    starCount: this.currentSnippet?.metadata?.starCount || 0,
                    forkCount: this.currentSnippet?.metadata?.forkCount || 0,
                    viewCount: this.currentSnippet?.metadata?.viewCount || 0
                }
            };

            // Show progress
            app.showProgress(30);

            // Save to storage
            await storage.saveSnippet(snippet);

            // Update app state
            if (this.currentSnippet) {
                // Update existing snippet
                const index = app.state.snippets.findIndex(s => s.id === snippet.id);
                if (index !== -1) {
                    app.state.snippets[index] = snippet;
                }
            } else {
                // Add new snippet
                app.state.snippets.unshift(snippet);
                this.currentSnippet = snippet;
            }

            // Update filtered snippets
            app.applyFilters();

            // Update user stats
            app.updateUserStats();

            // Show success message
            app.showToast('Snippet saved successfully!', 'success');
            app.showProgress(100);

            // Navigate to view page
            setTimeout(() => {
                window.location.hash = `/snippet/${snippet.id}`;
            }, 500);

        } catch (error) {
            console.error('Error saving snippet:', error);
            app.showToast('Error saving snippet: ' + error.message, 'error');
            app.showProgress(100);
        }
    }

    calculateLanguageStats() {
        const stats = {};
        
        this.files.forEach(file => {
            const lang = file.language || 'Text';
            stats[lang] = (stats[lang] || 0) + 1;
        });

        // Convert to percentages
        const total = this.files.length;
        Object.keys(stats).forEach(lang => {
            stats[lang] = Math.round((stats[lang] / total) * 100);
        });

        return stats;
    }

    updateEditorStatus() {
        if (!this.editor) return;

        const lineCount = this.editor.lineCount();
        const charCount = this.editor.getValue().length;
        const currentFile = this.files[this.currentFileIndex];

        // Update status display
        const lineCountEl = document.getElementById('line-count');
        const charCountEl = document.getElementById('character-count');
        const languageDisplayEl = document.getElementById('language-display');

        if (lineCountEl) {
            lineCountEl.textContent = `${lineCount} line${lineCount !== 1 ? 's' : ''}`;
        }

        if (charCountEl) {
            charCountEl.textContent = `${charCount} char${charCount !== 1 ? 's' : ''}`;
        }

        if (languageDisplayEl && currentFile) {
            languageDisplayEl.textContent = currentFile.language || 'Text';
        }
    }

    applySettings() {
        if (!this.editor) return;

        this.editor.setOption('lineWrapping', this.editorSettings.wordWrap === 'on');
        this.editor.setOption('theme', this.editorSettings.theme);
        
        // Refresh editor to apply settings
        setTimeout(() => {
            this.editor.refresh();
        }, 0);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('file-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('hidden');
            // Refresh editor after sidebar toggle
            if (this.editor) {
                setTimeout(() => {
                    this.editor.refresh();
                }, 300);
            }
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    truncateFilename(filename, maxLength) {
        if (filename.length <= maxLength) return filename;
        
        const extensionIndex = filename.lastIndexOf('.');
        if (extensionIndex === -1) {
            return filename.substring(0, maxLength - 3) + '...';
        }
        
        const name = filename.substring(0, extensionIndex);
        const extension = filename.substring(extensionIndex);
        const maxNameLength = maxLength - extension.length - 3;
        
        if (name.length <= maxNameLength) return filename;
        
        return name.substring(0, maxNameLength) + '...' + extension;
    }

    detectLanguage(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'javascript',
            'tsx': 'javascript',
            'html': 'htmlmixed',
            'htm': 'htmlmixed',
            'css': 'css',
            'scss': 'css',
            'sass': 'sass',
            'less': 'css',
            'json': 'javascript',
            'md': 'markdown',
            'py': 'python',
            'rb': 'ruby',
            'php': 'php',
            'java': 'clike',
            'c': 'clike',
            'cpp': 'clike',
            'cs': 'clike',
            'go': 'go',
            'rs': 'rust',
            'swift': 'swift',
            'kt': 'clike',
            'sql': 'sql',
            'sh': 'shell',
            'bash': 'shell',
            'yml': 'yaml',
            'yaml': 'yaml',
            'xml': 'xml',
            'svg': 'xml'
        };

        return languageMap[extension] || 'text';
    }

    getLanguageMode(language) {
        const modeMap = {
            'javascript': 'javascript',
            'jsx': 'javascript',
            'typescript': 'javascript',
            'tsx': 'javascript',
            'html': 'htmlmixed',
            'css': 'css',
            'scss': 'css',
            'sass': 'css',
            'less': 'css',
            'json': 'javascript',
            'markdown': 'markdown',
            'python': 'python',
            'ruby': 'ruby',
            'php': 'php',
            'java': 'clike',
            'c': 'clike',
            'cpp': 'clike',
            'csharp': 'clike',
            'go': 'go',
            'rust': 'rust',
            'swift': 'swift',
            'kotlin': 'clike',
            'sql': 'sql',
            'shell': 'shell',
            'yaml': 'yaml',
            'xml': 'xml',
            'text': 'text'
        };

        return modeMap[language] || 'text';
    }

    getDefaultContent(language) {
        const defaults = {
            'javascript': '// JavaScript file\nconsole.log("Hello, World!");',
            'htmlmixed': '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
            'css': '/* CSS file */\nbody {\n    margin: 0;\n    padding: 0;\n    font-family: sans-serif;\n}',
            'markdown': '# Markdown File\n\nStart writing your markdown here...',
            'python': '# Python file\nprint("Hello, World!")',
            'php': '<?php\n// PHP file\necho "Hello, World!";\n?>',
            'sql': '-- SQL file\nSELECT * FROM users;',
            'text': 'Text file\nStart typing here...'
        };

        return defaults[language] || `// ${language} file\nStart coding here...`;
    }

    // Format code
    formatCode() {
        if (!this.editor) return;

        const currentFile = this.files[this.currentFileIndex];
        
        // Simple formatting for JavaScript
        if (currentFile.language === 'javascript') {
            try {
                const code = this.editor.getValue();
                const formatted = code
                    .replace(/\s*{\s*/g, ' { ')
                    .replace(/\s*}\s*/g, ' } ')
                    .replace(/\s*\(\s*/g, ' (')
                    .replace(/\s*\)\s*/g, ') ')
                    .replace(/\s*,\s*/g, ', ')
                    .replace(/\s*;\s*/g, '; ')
                    .replace(/\s+$/gm, '')
                    .replace(/^\s+/gm, '');
                
                this.editor.setValue(formatted);
                app.showToast('Code formatted', 'success');
            } catch (error) {
                console.error('Error formatting code:', error);
                app.showToast('Error formatting code', 'error');
            }
        } else {
            app.showToast('Formatting not available for this language', 'info');
        }
    }

    // Find and replace
    findInFiles(searchTerm) {
        const results = [];
        
        this.files.forEach((file, fileIndex) => {
            const lines = file.content.split('\n');
            
            lines.forEach((line, lineIndex) => {
                if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push({
                        fileIndex: fileIndex,
                        lineIndex: lineIndex,
                        line: line,
                        filename: file.filename
                    });
                }
            });
        });

        return results;
    }

    // Insert snippet
    insertSnippet(snippetText) {
        if (!this.editor) return;

        const cursor = this.editor.getCursor();
        this.editor.replaceRange(snippetText, cursor);
        this.editor.focus();
    }
}