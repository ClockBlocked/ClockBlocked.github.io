/**
 * fileUpload.js - File Upload System for GitDev
 * Features: Drag & drop, device file picker, multiple files, folder upload
 * 
 * C R E A T E D  B Y
 * William Hanson
 * Chevrolay@Outlook.com
 * m.me/Chevrolay
 */
/**
import { LocalStorageManager } from './storage.js';
import { showSuccessMessage, showErrorMessage, showLoading, hideLoading } from './overlays.js';
import { isValidFilename } from './dependencies.js';
import { renderFileList } from './pageUpdates.js';
**/
class FileUploadManager {
    constructor() {
        this.uploadQueue = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB per file
        this.supportedTextTypes = [
            'text/plain', 'text/javascript', 'text/html', 'text/css',
            'application/json', 'application/xml', 'text/markdown',
            'application/javascript', 'text/x-python', 'text/x-java'
        ];
    }

    // Initialize drag & drop zones
    initializeDragAndDrop() {
        const dropZones = document.querySelectorAll('[data-drop-zone]');

        dropZones.forEach(zone => {
            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, preventDefaults, false);
                document.body.addEventListener(eventName, preventDefaults, false);
            });

            // Highlight drop zone when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => {
                zone.addEventListener(eventName, () => this.highlight(zone), false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, () => this.unhighlight(zone), false);
            });

            // Handle dropped files
            zone.addEventListener('drop', (e) => this.handleDrop(e, zone), false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    highlight(element) {
        element.classList.add('border-github-accent-emphasis', 'bg-github-accent-subtle', 'border-2');
    }

    unhighlight(element) {
        element.classList.remove('border-github-accent-emphasis', 'bg-github-accent-subtle', 'border-2');
    }

    // Handle dropped files
    async handleDrop(e, zone) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length === 0) return;

        // Check if repository is selected
        if (!window.currentState || !window.currentState.repository) {
            showErrorMessage('Please select a repository first');
            return;
        }

        await this.uploadFiles([...files]);
    }

    // Upload files from file input
    async uploadFilesFromInput(inputElement) {
        const files = [...inputElement.files];

        if (files.length === 0) return;

        if (!window.currentState || !window.currentState.repository) {
            showErrorMessage('Please select a repository first');
            return;
        }

        await this.uploadFiles(files);
        inputElement.value = ''; // Reset input
    }

    // Process and upload files
    async uploadFiles(files) {
        showLoading(`Uploading ${files.length} file(s)...`);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const file of files) {
            try {
                // Validate file
                if (file.size > this.maxFileSize) {
                    throw new Error(`File too large (max ${this.maxFileSize / 1024 / 1024}MB)`);
                }

                if (!this.isValidFileName(file.name)) {
                    throw new Error('Invalid filename');
                }

                // Check if file already exists
                const filePath = this.getFilePath(file.name);
                const existingFile = LocalStorageManager.getFile(
                    window.currentState.repository,
                    filePath
                );

                if (existingFile) {
                    if (!confirm(`File "${file.name}" already exists. Overwrite?`)) {
                        continue;
                    }
                }

                // Read file content
                const content = await this.readFileContent(file);

                // Save file
                const fileData = {
                    content: content,
                    category: this.detectCategory(file.name),
                    tags: ['uploaded'],
                    created: existingFile?.created || Date.now(),
                    lastModified: Date.now(),
                    lastCommit: `Upload ${file.name}`,
                    size: file.size
                };

                LocalStorageManager.saveFile(
                    window.currentState.repository,
                    filePath,
                    fileData
                );

                // Update file list
                if (!existingFile) {
                    window.currentState.files.push({
                        name: file.name,
                        type: 'file',
                        path: filePath,
                        lastModified: fileData.lastModified,
                        lastCommit: fileData.lastCommit,
                        size: fileData.size
                    });
                }

                successCount++;
            } catch (error) {
                errorCount++;
                errors.push(`${file.name}: ${error.message}`);
            }
        }

        hideLoading();

        // Refresh file list
        if (window.renderFileList) {
            renderFileList();
        }

        // Show results
        if (successCount > 0) {
            showSuccessMessage(`Successfully uploaded ${successCount} file(s)`);
        }

        if (errorCount > 0) {
            showErrorMessage(`Failed to upload ${errorCount} file(s):\n${errors.join('\n')}`);
        }
    }

    // Read file content as text
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));

            // Check if file is likely text
            if (this.isTextFile(file)) {
                reader.readAsText(file);
            } else {
                // For binary files, store as base64
                reader.readAsDataURL(file);
            }
        });
    }

    // Check if file is text
    isTextFile(file) {
        if (this.supportedTextTypes.includes(file.type)) {
            return true;
        }

        // Check by extension
        const ext = file.name.split('.').pop().toLowerCase();
        const textExtensions = [
            'txt', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'less',
            'json', 'xml', 'md', 'py', 'java', 'c', 'cpp', 'h', 'cs',
            'php', 'rb', 'go', 'rs', 'swift', 'kt', 'dart', 'yml', 'yaml',
            'toml', 'ini', 'conf', 'sh', 'bat', 'ps1'
        ];

        return textExtensions.includes(ext);
    }

    // Validate filename
    isValidFileName(name) {
        return isValidFilename(name);
    }

    // Get full file path
    getFilePath(fileName) {
        const path = window.currentState.path || '';
        return path ? `${path}/${fileName}` : fileName;
    }

    // Detect file category
    detectCategory(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();

        const categories = {
            'Documentation': ['md', 'txt', 'doc', 'pdf'],
            'Frontend': ['html', 'css', 'scss', 'less', 'jsx', 'tsx', 'vue'],
            'Backend': ['js', 'ts', 'py', 'java', 'php', 'rb', 'go', 'rs'],
            'Config': ['json', 'yml', 'yaml', 'toml', 'ini', 'conf'],
            'Database': ['sql', 'mongodb'],
            'Scripts': ['sh', 'bat', 'ps1']
        };

        for (const [category, extensions] of Object.entries(categories)) {
            if (extensions.includes(ext)) {
                return category;
            }
        }

        return 'General';
    }
}

// Initialize upload manager
const uploadManager = new FileUploadManager();

// Show upload modal
function showUploadModal() {
    if (!window.currentState || !window.currentState.repository) {
        showErrorMessage('Please select a repository first');
        return;
    }

    const modal = document.getElementById('uploadModal');
    if (!modal) {
        createUploadModal();
    }

    document.getElementById('uploadModal').classList.remove('hidden');
    document.getElementById('uploadModal').classList.add('flex');
}

// Hide upload modal
function hideUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Create upload modal
function createUploadModal() {
    const modalHTML = `
        <div id="uploadModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-github-canvas-default rounded-lg shadow-2xl w-full max-w-2xl border border-github-border-default">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-github-border-default">
                    <h2 class="text-xl font-semibold text-github-fg-default">
                        <i class="fas fa-upload mr-2"></i>Upload Files
                    </h2>
                    <button onclick="hideUploadModal()" class="text-github-fg-muted hover:text-github-fg-default">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <!-- Body -->
                <div class="p-6">
                    <!-- Drag & Drop Zone -->
                    <div 
                        id="uploadDropZone" 
                        data-drop-zone
                        class="border-2 border-dashed border-github-border-default rounded-lg p-12 text-center hover:border-github-accent-emphasis transition-all cursor-pointer"
                        onclick="document.getElementById('fileInput').click()"
                    >
                        <i class="fas fa-cloud-upload-alt text-6xl text-github-fg-muted mb-4"></i>
                        <p class="text-github-fg-default font-semibold mb-2">
                            Drag & drop files here
                        </p>
                        <p class="text-github-fg-muted text-sm mb-4">or</p>
                        <button class="bg-github-success-emphasis text-white px-6 py-2 rounded-lg hover:bg-github-success-fg transition-all">
                            <i class="fas fa-folder-open mr-2"></i>Browse Files
                        </button>
                        <p class="text-github-fg-muted text-xs mt-4">
                            Supported: Text files, code files (max 10MB each)
                        </p>
                    </div>

                    <!-- Hidden file input -->
                    <input 
                        type="file" 
                        id="fileInput" 
                        multiple 
                        accept=".txt,.js,.jsx,.ts,.tsx,.html,.css,.scss,.json,.md,.py,.java,.php,.rb,.go,.rs,.xml,.yml,.yaml"
                        class="hidden"
                        onchange="handleFileInputChange(this)"
                    />

                    <!-- Upload to path info -->
                    <div class="mt-4 p-4 bg-github-canvas-inset rounded-lg">
                        <p class="text-sm text-github-fg-muted">
                            <i class="fas fa-info-circle mr-2"></i>
                            Files will be uploaded to: 
                            <span class="text-github-accent-fg font-mono" id="uploadPath"></span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialize drag and drop
    uploadManager.initializeDragAndDrop();

    // Update path display when modal opens
    updateUploadPath();
}

// Update upload path display
function updateUploadPath() {
    const pathElement = document.getElementById('uploadPath');
    if (pathElement && window.currentState) {
        const fullPath = window.currentState.repository + 
            (window.currentState.path ? '/' + window.currentState.path : '');
        pathElement.textContent = fullPath;
    }
}

// Handle file input change
function handleFileInputChange(input) {
    uploadManager.uploadFilesFromInput(input);
    hideUploadModal();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add global drag and drop to file explorer
    const fileExplorer = document.getElementById('fileExplorer');
    if (fileExplorer) {
        fileExplorer.setAttribute('data-drop-zone', 'true');
        uploadManager.initializeDragAndDrop();
    }
});
/**
export {
    FileUploadManager,
    uploadManager,
    showUploadModal,
    hideUploadModal
};
**/
// Attach to window
window.showUploadModal = showUploadModal;
window.hideUploadModal = hideUploadModal;
window.handleFileInputChange = handleFileInputChange;
window.uploadManager = uploadManager;