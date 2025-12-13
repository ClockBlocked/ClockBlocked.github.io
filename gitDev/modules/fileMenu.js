/**
 * fileMenu.js - File Context Menu with Popover API
 * Features: Preview, Edit, Download, Delete, More options with smooth popovers
 * 
 * C R E A T E D  B Y
 * William Hanson
 * Chevrolay@Outlook.com
 * m.me/Chevrolay
 */
/**
import { LocalStorageManager } from './storage.js';
import { showSuccessMessage, showErrorMessage } from './overlays.js';
import { viewFile, editFile, downloadCurrentFile } from './core.js';
import { showExportModal } from './importExport.js';
**/
class FileMenuManager {
    constructor() {
        this.currentFile = null;
        this.currentPopover = null;
    }

    // Show file menu popover
    showFileMenu(fileName, event) {
        event.stopPropagation();
        event.preventDefault();

        // Close existing popover
        this.closePopover();

        const buttonElement = event.currentTarget;
        const file = window.currentState.files.find(f => f.name === fileName);

        if (!file) return;

        this.currentFile = file;

        // Create popover
        const popover = this.createPopover(file);
        document.body.appendChild(popover);

        // Position popover near button
        this.positionPopover(popover, buttonElement);

        // Show popover with animation
        setTimeout(() => {
            popover.classList.add('show');
        }, 10);

        this.currentPopover = popover;

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick.bind(this), { once: true });
        }, 100);
    }

    // Create popover HTML
    createPopover(file) {
        const popover = document.createElement('div');
        popover.className = 'file-menu-popover';
        popover.innerHTML = `
            <div class="file-menu-header">
                <i class="fas fa-file-code"></i>
                <span>${file.name}</span>
            </div>
            <div class="file-menu-divider"></div>
            <div class="file-menu-items">
                ${file.type === 'file' ? `
                    <button class="file-menu-item" onclick="fileMenuManager.previewFile('${file.name}')">
                        <i class="fas fa-eye"></i>
                        <span>Preview</span>
                        <span class="file-menu-shortcut">Ctrl+P</span>
                    </button>
                    <button class="file-menu-item" onclick="fileMenuManager.editFileAction('${file.name}')">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                        <span class="file-menu-shortcut">Ctrl+E</span>
                    </button>
                    <button class="file-menu-item" onclick="fileMenuManager.downloadFile('${file.name}')">
                        <i class="fas fa-download"></i>
                        <span>Download</span>
                        <span class="file-menu-shortcut">Ctrl+D</span>
                    </button>
                    <div class="file-menu-divider"></div>
                    <button class="file-menu-item" onclick="fileMenuManager.duplicateFile('${file.name}')">
                        <i class="fas fa-copy"></i>
                        <span>Duplicate</span>
                    </button>
                    <button class="file-menu-item" onclick="fileMenuManager.renameFile('${file.name}')">
                        <i class="fas fa-signature"></i>
                        <span>Rename</span>
                        <span class="file-menu-shortcut">F2</span>
                    </button>
                    <button class="file-menu-item" onclick="fileMenuManager.moveFile('${file.name}')">
                        <i class="fas fa-folder-open"></i>
                        <span>Move to...</span>
                    </button>
                    <div class="file-menu-divider"></div>
                    <button class="file-menu-item" onclick="fileMenuManager.fileProperties('${file.name}')">
                        <i class="fas fa-info-circle"></i>
                        <span>Properties</span>
                    </button>
                    <div class="file-menu-divider"></div>
                    <button class="file-menu-item danger" onclick="fileMenuManager.deleteFileAction('${file.name}')">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                        <span class="file-menu-shortcut">Del</span>
                    </button>
                ` : `
                    <button class="file-menu-item" onclick="fileMenuManager.openFolder('${file.name}')">
                        <i class="fas fa-folder-open"></i>
                        <span>Open Folder</span>
                    </button>
                    <button class="file-menu-item" onclick="fileMenuManager.renameFile('${file.name}')">
                        <i class="fas fa-signature"></i>
                        <span>Rename</span>
                    </button>
                    <div class="file-menu-divider"></div>
                    <button class="file-menu-item danger" onclick="fileMenuManager.deleteFolder('${file.name}')">
                        <i class="fas fa-trash"></i>
                        <span>Delete Folder</span>
                    </button>
                `}
            </div>
        `;

        return popover;
    }

    // Position popover near trigger element
    positionPopover(popover, triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();

        let top = rect.bottom + 5;
        let left = rect.right - popoverRect.width;

        // Adjust if out of viewport
        if (top + popoverRect.height > window.innerHeight) {
            top = rect.top - popoverRect.height - 5;
        }

        if (left < 0) {
            left = rect.left;
        }

        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
    }

    // Close popover
    closePopover() {
        if (this.currentPopover) {
            this.currentPopover.classList.remove('show');
            setTimeout(() => {
                if (this.currentPopover && this.currentPopover.parentNode) {
                    this.currentPopover.parentNode.removeChild(this.currentPopover);
                }
                this.currentPopover = null;
            }, 200);
        }
    }

    // Handle outside click
    handleOutsideClick(event) {
        if (this.currentPopover && !this.currentPopover.contains(event.target)) {
            this.closePopover();
        }
    }

    // Preview file in modal
    previewFile(fileName) {
        this.closePopover();

        const file = window.currentState.files.find(f => f.name === fileName);
        if (!file) return;

        const filePath = file.path || ((window.currentState.path ? window.currentState.path + '/' : '') + fileName);
        const fileData = LocalStorageManager.getFile(window.currentState.repository, filePath);

        if (!fileData) {
            showErrorMessage('File not found');
            return;
        }

        // Create preview modal
        this.showPreviewModal(fileName, fileData);
    }

    // Show preview modal
    showPreviewModal(fileName, fileData) {
        const ext = fileName.split('.').pop().toLowerCase();
        let previewContent = '';

        if (['md', 'markdown'].includes(ext)) {
            previewContent = `<div class="markdown-preview">${this.renderMarkdown(fileData.content)}</div>`;
        } else if (['html'].includes(ext)) {
            previewContent = `<iframe srcdoc="${fileData.content.replace(/"/g, '&quot;')}" class="preview-iframe"></iframe>`;
        } else if (['json'].includes(ext)) {
            try {
                const formatted = JSON.stringify(JSON.parse(fileData.content), null, 2);
                previewContent = `<pre class="preview-code"><code>${this.escapeHtml(formatted)}</code></pre>`;
            } catch {
                previewContent = `<pre class="preview-code"><code>${this.escapeHtml(fileData.content)}</code></pre>`;
            }
        } else {
            previewContent = `<pre class="preview-code"><code>${this.escapeHtml(fileData.content)}</code></pre>`;
        }

        const modalHTML = `
            <div id="previewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-github-canvas-default rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-github-border-default">
                    <div class="flex items-center justify-between p-4 border-b border-github-border-default">
                        <h3 class="text-lg font-semibold text-github-fg-default">
                            <i class="fas fa-eye mr-2"></i>Preview: ${fileName}
                        </h3>
                        <button onclick="closePreviewModal()" class="text-github-fg-muted hover:text-github-fg-default">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                        ${previewContent}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Simple markdown renderer
    renderMarkdown(text) {
        return text
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/gim, '<em>$1</em>')
            .replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // Edit file
    editFileAction(fileName) {
        this.closePopover();
        window.currentState.currentFile = window.currentState.files.find(f => f.name === fileName);
        editFile();
    }

    // Download file
    downloadFile(fileName) {
        this.closePopover();
        window.currentState.currentFile = window.currentState.files.find(f => f.name === fileName);
        downloadCurrentFile();
    }

    // Duplicate file
    duplicateFile(fileName) {
        this.closePopover();

        const file = window.currentState.files.find(f => f.name === fileName);
        if (!file) return;

        const filePath = file.path;
        const fileData = LocalStorageManager.getFile(window.currentState.repository, filePath);

        if (!fileData) {
            showErrorMessage('File not found');
            return;
        }

        // Create duplicate with suffix
        const nameParts = fileName.split('.');
        const ext = nameParts.pop();
        const baseName = nameParts.join('.');
        const newFileName = `${baseName}_copy.${ext}`;
        const newFilePath = filePath.replace(fileName, newFileName);

        // Save duplicate
        const newFileData = {
            ...fileData,
            created: Date.now(),
            lastModified: Date.now(),
            lastCommit: `Duplicate of ${fileName}`
        };

        LocalStorageManager.saveFile(window.currentState.repository, newFilePath, newFileData);

        // Update file list
        window.currentState.files.push({
            name: newFileName,
            type: 'file',
            path: newFilePath,
            lastModified: newFileData.lastModified,
            lastCommit: newFileData.lastCommit,
            size: newFileData.size
        });

        if (window.renderFileList) {
            window.renderFileList();
        }

        showSuccessMessage(`File duplicated as "${newFileName}"`);
    }

    // Rename file
    renameFile(fileName) {
        this.closePopover();

        const newName = prompt('Enter new name:', fileName);
        if (!newName || newName === fileName) return;

        const file = window.currentState.files.find(f => f.name === fileName);
        if (!file) return;

        const oldPath = file.path;
        const newPath = oldPath.replace(fileName, newName);

        // Get file data
        const fileData = LocalStorageManager.getFile(window.currentState.repository, oldPath);
        if (!fileData) return;

        // Save with new name
        LocalStorageManager.saveFile(window.currentState.repository, newPath, {
            ...fileData,
            lastModified: Date.now(),
            lastCommit: `Rename ${fileName} to ${newName}`
        });

        // Delete old
        LocalStorageManager.deleteFile(window.currentState.repository, oldPath);

        // Update file list
        const fileIndex = window.currentState.files.findIndex(f => f.name === fileName);
        if (fileIndex !== -1) {
            window.currentState.files[fileIndex].name = newName;
            window.currentState.files[fileIndex].path = newPath;
        }

        if (window.renderFileList) {
            window.renderFileList();
        }

        showSuccessMessage(`Renamed to "${newName}"`);
    }

    // Move file
    moveFile(fileName) {
        this.closePopover();
        showErrorMessage('Move feature coming soon!');
    }

    // File properties
    fileProperties(fileName) {
        this.closePopover();

        const file = window.currentState.files.find(f => f.name === fileName);
        if (!file) return;

        const filePath = file.path;
        const fileData = LocalStorageManager.getFile(window.currentState.repository, filePath);

        if (!fileData) return;

        const props = `
            <div class="space-y-3">
                <div><strong>Name:</strong> ${fileName}</div>
                <div><strong>Path:</strong> ${filePath}</div>
                <div><strong>Size:</strong> ${(fileData.size / 1024).toFixed(2)} KB</div>
                <div><strong>Category:</strong> ${fileData.category || 'General'}</div>
                <div><strong>Tags:</strong> ${fileData.tags?.join(', ') || 'None'}</div>
                <div><strong>Created:</strong> ${new Date(fileData.created).toLocaleString()}</div>
                <div><strong>Modified:</strong> ${new Date(fileData.lastModified).toLocaleString()}</div>
                <div><strong>Last Commit:</strong> ${fileData.lastCommit}</div>
            </div>
        `;

        const modalHTML = `
            <div id="propsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-github-canvas-default rounded-lg shadow-2xl w-full max-w-md border border-github-border-default">
                    <div class="flex items-center justify-between p-4 border-b border-github-border-default">
                        <h3 class="text-lg font-semibold text-github-fg-default">
                            <i class="fas fa-info-circle mr-2"></i>File Properties
                        </h3>
                        <button onclick="closePropsModal()" class="text-github-fg-muted hover:text-github-fg-default">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="p-6 text-github-fg-default text-sm">
                        ${props}
                    </div>
                    <div class="p-4 border-t border-github-border-default">
                        <button onclick="closePropsModal()" class="w-full bg-github-success-emphasis text-white px-4 py-2 rounded-lg hover:bg-github-success-fg">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Delete file
    deleteFileAction(fileName) {
        this.closePopover();
        window.currentState.currentFile = window.currentState.files.find(f => f.name === fileName);
        if (window.showDeleteFileModal) {
            window.showDeleteFileModal();
        }
    }

    // Helper: Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize manager
const fileMenuManager = new FileMenuManager();

// Close preview modal
function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.remove();
    }
}

// Close properties modal
function closePropsModal() {
    const modal = document.getElementById('propsModal');
    if (modal) {
        modal.remove();
    }
}
/**
export {
    FileMenuManager,
    fileMenuManager
};
**/
// Attach to window
window.fileMenuManager = fileMenuManager;
window.closePreviewModal = closePreviewModal;
window.closePropsModal = closePropsModal;