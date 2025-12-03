
class CodeEditor {
    constructor() {
        this.editor = null;
        this.currentSnippet = null;
        this.files = [];
        this.currentFileIndex = 0;
        this.editorSettings = { fontSize: 14, wordWrap: 'on', minimap: false, theme: 'github-dark-dimmed', lineNumbers: true, lineWrapping: true, autoCloseBrackets: true, matchBrackets: true, indentUnit: 2, tabSize: 2 };
        this.isInitialized = false;
    }

    async initialize() {
        console.log('Initializing editor...');
        if (this.files.length === 0) this.files = [{ id: this.generateId(), filename: 'script.js', language: 'javascript', content: '// Start coding here...\nconsole.log("Hello, World!");', size: 0 }];
        this.initEditor();
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
    const currentFile = this.files[this.currentFileIndex];
    textarea.value = currentFile?.content || '';

    try {
        // Initialize CodeMirror with GitHub-like theme
        this.editor = CodeMirror.fromTextArea(textarea, {
            value: currentFile?.content || '',
            mode: this.getLanguageMode(currentFile?.language || 'javascript'),
            theme: 'dracula', // GitHub-like dark theme
            lineNumbers: true,
            lineWrapping: this.editorSettings.wordWrap === 'on',
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: this.editorSettings.indentUnit,
            tabSize: this.editorSettings.tabSize,
            scrollbarStyle: 'overlay',
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
                "Shift-Tab": "indentLess",
                "Ctrl-S": function(cm) {
                    editor.saveSnippet();
                }
            }
        });

        // Set editor size to fill container
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

        // Update status on mode change
        this.editor.on('optionChange', (instance, option) => {
            if (option === 'mode') {
                this.updateEditorStatus();
            }
        });

        // Set initial status
        this.updateEditorStatus();

        console.log('CodeMirror editor created successfully with syntax highlighting');

    } catch (error) {
        console.error('Failed to create CodeMirror editor:', error);
        
        // Fallback to simple textarea with syntax highlighting classes
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
        if (this.files.length === 0) this.files = [{ id: this.generateId(), filename: 'script.js', language: 'javascript', content: '// Start coding here...', size: 0 }];
        const titleInput = document.getElementById('snippet-title');
        const descriptionInput = document.getElementById('snippet-description');
        const publicInput = document.getElementById('snippet-public');
        const tagsInput = document.getElementById('snippet-tags');
        if (titleInput) titleInput.value = snippet.title || '';
        if (descriptionInput) descriptionInput.value = snippet.description || '';
        if (publicInput) publicInput.checked = snippet.isPublic !== false;
        if (tagsInput) tagsInput.value = snippet.tags ? snippet.tags.join(', ') : '';
        if (this.isInitialized) { this.switchToFile(0); this.renderFileTabs(); this.renderFileTree(); }
        else this.initialize();
    }

    renderFileTabs() {
        const container = document.getElementById('file-tabs');
        if (!container) return;
        container.innerHTML = this.files.map((file, index) => `
            <button class="file-tab ${index === this.currentFileIndex ? 'active' : ''}" onclick="editor.switchToFile(${index})" title="${file.filename}">
                <i class="fas fa-file-code"></i>
                <span class="tab-filename">${this.truncateFilename(file.filename, 15)}</span>
                <span class="tab-close" onclick="event.stopPropagation(); editor.removeFile(${index})" title="Close ${file.filename}"><i class="fas fa-times"></i></span>
            </button>
        `).join('');
    }

    renderFileTree() {
        const container = document.getElementById('file-tree');
        if (!container) return;
        container.innerHTML = this.files.map((file, index) => `
            <div class="file-item ${index === this.currentFileIndex ? 'active' : ''}" onclick="editor.switchToFile(${index})" title="${file.filename}">
                <i class="fas fa-file-code file-icon"></i>
                <span class="file-name">${this.truncateFilename(file.filename, 20)}</span>
                <div class="file-actions" style="margin-left: auto; display: flex; gap: 4px;">
                    <button class="file-action-btn" onclick="event.stopPropagation(); editor.renameFile(${index})" title="Rename"><i class="fas fa-edit"></i></button>
                    ${this.files.length > 1 ? `<button class="file-action-btn" onclick="event.stopPropagation(); editor.removeFile(${index})" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
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
        
        // Set the correct language mode
        const languageMode = this.getLanguageMode(file.language);
        this.editor.setOption('mode', languageMode);
        
        // Refresh editor to ensure proper rendering
        setTimeout(() => {
            if (this.editor) {
                this.editor.refresh();
                this.updateEditorStatus();
            }
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

    async addNewFile() {
        const result = await components.showModal({
            title: 'New File',
            content: '<div class="form-group"><label class="form-label">Filename (with extension)</label><input type="text" id="new-filename" class="form-input" value="newfile.js" placeholder="script.js"></div>',
            confirmText: 'Create',
            cancelText: 'Cancel'
        });
        if (!result) return;
        const filename = document.getElementById('new-filename').value.trim();
        if (!filename) { app.showToast('Please enter a filename', 'error'); return; }
        if (this.files.some(f => f.filename === filename)) { app.showToast('A file with this name already exists!', 'error'); return; }
        const language = this.detectLanguageFromFilename(filename);
        const newFile = { id: this.generateId(), filename: filename, language: language, content: this.getDefaultContent(language), size: 0 };
        this.files.push(newFile);
        this.switchToFile(this.files.length - 1);
        app.showToast(`Created ${filename}`, 'success');
    }

    async renameFile(index) {
        const currentName = this.files[index].filename;
        const result = await components.showModal({
            title: 'Rename File',
            content: `<div class="form-group"><label class="form-label">New filename</label><input type="text" id="rename-filename" class="form-input" value="${currentName}" placeholder="${currentName}"></div>`,
            confirmText: 'Rename',
            cancelText: 'Cancel'
        });
        if (!result) return;
        const newName = document.getElementById('rename-filename').value.trim();
        if (!newName || newName === currentName) return;
        if (!newName.trim()) { app.showToast('Please enter a valid filename', 'error'); return; }
        if (this.files.some((f, i) => i !== index && f.filename === newName)) { app.showToast('A file with this name already exists!', 'error'); return; }
        this.files[index].filename = newName;
        this.files[index].language = this.detectLanguageFromFilename(newName);
        this.renderFileTabs();
        this.renderFileTree();
        if (index === this.currentFileIndex && this.editor) this.editor.setOption('mode', this.getLanguageMode(this.files[index].language));
        app.showToast(`Renamed to ${newName}`, 'success');
    }

    async removeFile(index) {
        if (this.files.length <= 1) { app.showToast('Cannot delete the last file!', 'error'); return; }
        const filename = this.files[index].filename;
        const confirmed = await components.showConfirm({
            title: 'Delete File',
            content: `Are you sure you want to delete "${filename}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;
        const wasActive = index === this.currentFileIndex;
        this.files.splice(index, 1);
        if (wasActive) {
            this.currentFileIndex = Math.max(0, Math.min(this.currentFileIndex, this.files.length - 1));
            this.switchToFile(this.currentFileIndex);
        } else if (this.currentFileIndex > index) this.currentFileIndex--;
        app.showToast(`Deleted ${filename}`, 'success');
    }

    async saveSnippet() {
        try {
            this.updateCurrentFileContent();
            const titleInput = document.getElementById('snippet-title');
            const descriptionInput = document.getElementById('snippet-description');
            const publicInput = document.getElementById('snippet-public');
            const tagsInput = document.getElementById('snippet-tags');
            if (!titleInput || !descriptionInput || !publicInput || !tagsInput) throw new Error('Form elements not found');
            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();
            const isPublic = publicInput.checked;
            const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            if (!title) { app.showToast('Please enter a title for your snippet', 'error'); titleInput.focus(); return; }
            if (this.files.length === 0) { app.showToast('Please add at least one file', 'error'); return; }
            for (const file of this.files) {
                if (!file.filename.trim()) { app.showToast('All files must have a filename', 'error'); return; }
                if (!file.content && file.content !== '') { app.showToast('File content cannot be undefined', 'error'); return; }
            }
            const languageStats = this.calculateLanguageStats();
            const snippet = {
                id: this.currentSnippet?.id || this.generateId(),
                title: title,
                description: description || '',
                isPublic: isPublic,
                createdAt: this.currentSnippet?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tags: tags,
                languageStats: languageStats,
                files: this.files.map(file => ({ ...file, size: new Blob([file.content]).size })),
                metadata: { starCount: this.currentSnippet?.metadata?.starCount || 0, forkCount: this.currentSnippet?.metadata?.forkCount || 0, viewCount: this.currentSnippet?.metadata?.viewCount || 0 }
            };
            app.showProgress(30);
            await storage.saveSnippet(snippet);
            if (this.currentSnippet) {
                const index = app.state.snippets.findIndex(s => s.id === snippet.id);
                if (index !== -1) app.state.snippets[index] = snippet;
            } else { app.state.snippets.unshift(snippet); this.currentSnippet = snippet; }
            app.applyFilters();
            app.updateUserStats();
            app.showToast('Snippet saved successfully!', 'success');
            app.showProgress(100);
            setTimeout(() => window.location.hash = `/snippet/${snippet.id}`, 500);
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
        const total = this.files.length;
        Object.keys(stats).forEach(lang => stats[lang] = Math.round((stats[lang] / total) * 100));
        return stats;
    }

    updateEditorStatus() {
        if (!this.editor) return;
        const lineCount = this.editor.lineCount();
        const charCount = this.editor.getValue().length;
        const currentFile = this.files[this.currentFileIndex];
        const lineCountEl = document.getElementById('line-count');
        const charCountEl = document.getElementById('character-count');
        const languageDisplayEl = document.getElementById('language-display');
        if (lineCountEl) lineCountEl.textContent = `${lineCount} line${lineCount !== 1 ? 's' : ''}`;
        if (charCountEl) charCountEl.textContent = `${charCount} char${charCount !== 1 ? 's' : ''}`;
        if (languageDisplayEl && currentFile) languageDisplayEl.textContent = currentFile.language || 'Text';
    }

    applySettings() {
        if (!this.editor) return;
        this.editor.setOption('lineWrapping', this.editorSettings.wordWrap === 'on');
        this.editor.setOption('theme', this.editorSettings.theme);
        setTimeout(() => this.editor.refresh(), 0);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('file-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('hidden');
            if (this.editor) setTimeout(() => this.editor.refresh(), 300);
        }
    }

    generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
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

    detectLanguage(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const languageMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'mjs': 'javascript',
        'cjs': 'javascript',
        'html': 'htmlmixed',
        'htm': 'htmlmixed',
        'xhtml': 'htmlmixed',
        'css': 'css',
        'scss': 'css',
        'sass': 'css',
        'less': 'css',
        'json': 'javascript',
        'json5': 'javascript',
        'md': 'markdown',
        'markdown': 'markdown',
        'py': 'python',
        'pyw': 'python',
        'rb': 'ruby',
        'php': 'php',
        'phtml': 'php',
        'java': 'clike',
        'c': 'clike',
        'h': 'clike',
        'cpp': 'clike',
        'cc': 'clike',
        'cxx': 'clike',
        'hpp': 'clike',
        'cs': 'clike',
        'go': 'go',
        'rs': 'rust',
        'swift': 'swift',
        'kt': 'kotlin',
        'kts': 'kotlin',
        'sql': 'sql',
        'sh': 'shell',
        'bash': 'shell',
        'zsh': 'shell',
        'yml': 'yaml',
        'yaml': 'yaml',
        'xml': 'xml',
        'svg': 'xml',
        'txt': 'text',
        'text': 'text',
        'log': 'text',
        'ini': 'properties',
        'toml': 'properties',
        'cfg': 'properties',
        'conf': 'properties'
    };

    return languageMap[extension] || 'text';
}

getLanguageMode(language) {
    const modeMap = {
        'javascript': 'javascript',
        'typescript': 'javascript',
        'jsx': 'javascript',
        'tsx': 'javascript',
        'html': 'htmlmixed',
        'htmlmixed': 'htmlmixed',
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
        'c#': 'clike',
        'go': 'go',
        'rust': 'rust',
        'swift': 'swift',
        'kotlin': 'clike',
        'sql': 'sql',
        'shell': 'shell',
        'bash': 'shell',
        'yaml': 'yaml',
        'xml': 'xml',
        'text': 'text',
        'plaintext': 'text',
        'properties': 'properties'
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

    formatCode() {
        if (!this.editor) return;
        const currentFile = this.files[this.currentFileIndex];
        if (currentFile.language === 'javascript') {
            try {
                const code = this.editor.getValue();
                const formatted = code.replace(/\s*{\s*/g, ' { ').replace(/\s*}\s*/g, ' } ').replace(/\s*\(\s*/g, ' (').replace(/\s*\)\s*/g, ') ').replace(/\s*,\s*/g, ', ').replace(/\s*;\s*/g, '; ').replace(/\s+$/gm, '').replace(/^\s+/gm, '');
                this.editor.setValue(formatted);
                app.showToast('Code formatted', 'success');
            } catch (error) {
                console.error('Error formatting code:', error);
                app.showToast('Error formatting code', 'error');
            }
        } else app.showToast('Formatting not available for this language', 'info');
    }
}