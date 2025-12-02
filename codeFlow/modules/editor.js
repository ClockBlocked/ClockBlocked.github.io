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
            minimap: true,
            theme: 'dark-dimmed'
        };
    }

    initialize() {
        // Create default file
        this.files = [{
            id: this.generateId(),
            filename: 'script.js',
            language: 'javascript',
            content: '// Start coding here...\nconsole.log("Hello, World!");',
            size: 0
        }];

        // Initialize editor
        this.initEditor();
        this.renderFileTabs();
        this.renderFileTree();
        this.updateEditorStatus();
    }

    initEditor() {
        const editorElement = document.getElementById('editor-instance');
        if (!editorElement) return;

        // Create CodeMirror editor
        this.editor = CodeMirror.fromTextArea(
            document.getElementById('code-editor'),
            {
                value: this.files[this.currentFileIndex].content,
                mode: this.getLanguageMode('javascript'),
                theme: 'dracula',
                lineNumbers: true,
                lineWrapping: true,
                tabSize: 2,
                indentUnit: 2,
                smartIndent: true,
                electricChars: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                autoCloseTags: true,
                showCursorWhenSelecting: true,
                styleActiveLine: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                extraKeys: {
                    'Ctrl-Space': 'autocomplete',
                    'Ctrl-S': () => this.saveSnippet(),
                    'Tab': 'indentMore',
                    'Shift-Tab': 'indentLess',
                    'Ctrl-/': 'toggleComment',
                    'Shift-Ctrl-/': 'toggleComment'
                }
            }
        );

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

        // Apply settings
        this.applySettings();
    }

    loadSnippet(snippet) {
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
        document.getElementById('snippet-title').value = snippet.title || '';
        document.getElementById('snippet-description').value = snippet.description || '';
        document.getElementById('snippet-public').checked = snippet.isPublic !== false;
        document.getElementById('snippet-tags').value = snippet.tags ? snippet.tags.join(', ') : '';

        // Initialize editor if not already initialized
        if (!this.editor) {
            this.initEditor();
        } else {
            this.switchToFile(0);
        }

        this.renderFileTabs();
        this.renderFileTree();
        this.updateEditorStatus();
    }

    renderFileTabs() {
        const container = document.getElementById('file-tabs');
        if (!container) return;

        container.innerHTML = this.files.map((file, index) => `
            <button class="file-tab ${index === this.currentFileIndex ? 'active' : ''}" 
                    onclick="editor.switchToFile(${index})">
                <i class="fas fa-file"></i>
                <span>${file.filename}</span>
                <span class="tab-close" onclick="event.stopPropagation(); editor.removeFile(${index})">
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
                 onclick="editor.switchToFile(${index})">
                <i class="fas fa-file file-icon"></i>
                <span>${file.filename}</span>
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
            this.editor.setValue(file.content);
            this.editor.setOption('mode', this.getLanguageMode(file.language));
        }

        // Update UI
        this.renderFileTabs();
        this.renderFileTree();
        this.updateEditorStatus();
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
    }

    renameFile(index) {
        const newName = prompt('Enter new filename:', this.files[index].filename);
        if (!newName) return;

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
    }

    removeFile(index) {
        if (this.files.length <= 1) {
            alert('Cannot delete the last file!');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${this.files[index].filename}"?`)) {
            return;
        }

        this.files.splice(index, 1);

        // Adjust current file index if needed
        if (this.currentFileIndex >= index && this.currentFileIndex > 0) {
            this.currentFileIndex--;
        }

        // Update UI
        this.switchToFile(this.currentFileIndex);
    }

    async saveSnippet() {
        try {
            // Update current file content
            this.updateCurrentFileContent();

            // Get form values
            const title = document.getElementById('snippet-title').value.trim();
            const description = document.getElementById('snippet-description').value.trim();
            const isPublic = document.getElementById('snippet-public').checked;
            const tags = document.getElementById('snippet-tags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            // Validate
            if (!title) {
                alert('Please enter a title for your snippet');
                return;
            }

            if (this.files.length === 0) {
                alert('Please add at least one file');
                return;
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
            app.showToast('Error saving snippet', 'error');
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

        if (languageDisplayEl) {
            languageDisplayEl.textContent = currentFile.language || 'Text';
        }
    }

    applySettings() {
        if (!this.editor) return;

        this.editor.setOption('lineWrapping', this.editorSettings.wordWrap === 'on');
        this.editor.setOption('fontSize', this.editorSettings.fontSize);
        
        // Note: CodeMirror doesn't have a minimap feature by default
        // You would need a separate minimap implementation
    }

    toggleSidebar() {
        const sidebar = document.getElementById('file-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('hidden');
        }
    }

    // Utility methods
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    detectLanguage(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        
        const languageMap = {
            'js': 'javascript',
            'jsx': 'jsx',
            'ts': 'typescript',
            'tsx': 'tsx',
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'sass',
            'less': 'less',
            'json': 'json',
            'md': 'markdown',
            'py': 'python',
            'rb': 'ruby',
            'php': 'php',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'swift': 'swift',
            'kt': 'kotlin',
            'sql': 'sql',
            'sh': 'shell',
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
            'jsx': 'jsx',
            'typescript': 'javascript',
            'tsx': 'jsx',
            'html': 'htmlmixed',
            'css': 'css',
            'scss': 'css',
            'sass': 'sass',
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
            'xml': 'xml'
        };

        return modeMap[language] || 'text';
    }

    getDefaultContent(language) {
        const defaults = {
            'javascript': '// JavaScript file\nconsole.log("Hello, World!");',
            'jsx': '// React component\nimport React from "react";\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Hello, World!</h1>\n    </div>\n  );\n}',
            'typescript': '// TypeScript file\nconst message: string = "Hello, World!";\nconsole.log(message);',
            'html': '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
            'css': '/* CSS file */\nbody {\n    margin: 0;\n    padding: 0;\n    font-family: sans-serif;\n}',
            'markdown': '# Markdown File\n\nStart writing your markdown here...',
            'python': '# Python file\nprint("Hello, World!")',
            'java': '// Java file\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
            'php': '<?php\n// PHP file\necho "Hello, World!";\n?>',
            'sql': '-- SQL file\nSELECT * FROM users;',
            'json': '{\n  "key": "value"\n}'
        };

        return defaults[language] || `// ${language} file\nStart coding here...`;
    }

    // Search functionality
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

    // Format code
    formatCode() {
        if (!this.editor) return;

        const currentFile = this.files[this.currentFileIndex];
        
        // Simple formatting for JavaScript
        if (currentFile.language === 'javascript') {
            try {
                const formatted = prettier.format(this.editor.getValue(), {
                    parser: 'babel',
                    plugins: prettierPlugins
                });
                this.editor.setValue(formatted);
            } catch (error) {
                console.error('Error formatting code:', error);
            }
        }
    }

    // Insert snippet
    insertSnippet(snippetText) {
        if (!this.editor) return;

        const cursor = this.editor.getCursor();
        this.editor.replaceRange(snippetText, cursor);
    }
}