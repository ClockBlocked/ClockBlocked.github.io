/**
 * importExport.js - Import/Export System for GitDev
 * Features: Import from GitHub/GitLab/Bitbucket, Export as ZIP, JSON export
 * 
 * C R E A T E D  B Y
 * William Hanson
 * Chevrolay@Outlook.com
 * m.me/Chevrolay
 */
/**
import { LocalStorageManager } from './storage.js';
import { showSuccessMessage, showErrorMessage, showLoading, hideLoading } from './overlays.js';
import { renderFileList } from './pageUpdates.js';
**/
class ImportExportManager {
    constructor() {
        this.githubRawBaseUrl = 'https://raw.githubusercontent.com';
        this.gitlabRawBaseUrl = 'https://gitlab.com';
        this.bitbucketRawBaseUrl = 'https://bitbucket.org';
    }

    // Parse repository URL
    parseRepoUrl(url) {
        // GitHub: https://github.com/user/repo/blob/main/file.js
        // GitLab: https://gitlab.com/user/repo/-/blob/main/file.js
        // Bitbucket: https://bitbucket.org/user/repo/src/main/file.js
        // Raw: https://raw.githubusercontent.com/user/repo/main/file.js

        const patterns = {
            github: /github\.com\/([^\/]+)\/([^\/]+)\/(blob|tree)\/([^\/]+)\/(.+)/,
            githubRaw: /raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/,
            gitlab: /gitlab\.com\/([^\/]+)\/([^\/]+)\/-\/(blob|tree)\/([^\/]+)\/(.+)/,
            bitbucket: /bitbucket\.org\/([^\/]+)\/([^\/]+)\/src\/([^\/]+)\/(.+)/
        };

        for (const [platform, pattern] of Object.entries(patterns)) {
            const match = url.match(pattern);
            if (match) {
                if (platform === 'githubRaw') {
                    return {
                        platform: 'github',
                        user: match[1],
                        repo: match[2],
                        branch: match[3],
                        path: match[4],
                        rawUrl: url,
                        isDirectory: false
                    };
                } else {
                    const [_, user, repo, type, branch, path] = match;
                    return {
                        platform,
                        user,
                        repo,
                        branch,
                        path,
                        isDirectory: type === 'tree',
                        rawUrl: this.getRawUrl(platform, user, repo, branch, path)
                    };
                }
            }
        }

        return null;
    }

    // Get raw URL for file
    getRawUrl(platform, user, repo, branch, path) {
        switch (platform) {
            case 'github':
                return `${this.githubRawBaseUrl}/${user}/${repo}/${branch}/${path}`;
            case 'gitlab':
                return `${this.gitlabRawBaseUrl}/${user}/${repo}/-/raw/${branch}/${path}`;
            case 'bitbucket':
                return `${this.bitbucketRawBaseUrl}/${user}/${repo}/raw/${branch}/${path}`;
            default:
                return null;
        }
    }

    // Import file from URL
    async importFromUrl(url, targetRepo = null) {
        showLoading('Importing from URL...');

        try {
            const parsedUrl = this.parseRepoUrl(url);

            if (!parsedUrl) {
                throw new Error('Invalid repository URL');
            }

            if (parsedUrl.isDirectory) {
                throw new Error('Directory import not yet supported. Please provide a direct file URL.');
            }

            // Fetch file content
            const response = await fetch(parsedUrl.rawUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
            }

            const content = await response.text();
            const fileName = parsedUrl.path.split('/').pop();

            // Use current repo or prompt for new
            const repository = targetRepo || window.currentState?.repository;

            if (!repository) {
                throw new Error('Please select a repository first');
            }

            // Get file path
            const currentPath = window.currentState?.path || '';
            const filePath = currentPath ? `${currentPath}/${fileName}` : fileName;

            // Check if file exists
            const existingFile = LocalStorageManager.getFile(repository, filePath);
            if (existingFile) {
                if (!confirm(`File "${fileName}" already exists. Overwrite?`)) {
                    hideLoading();
                    return;
                }
            }

            // Save file
            const fileData = {
                content: content,
                category: this.detectCategory(fileName),
                tags: ['imported', parsedUrl.platform],
                created: existingFile?.created || Date.now(),
                lastModified: Date.now(),
                lastCommit: `Import from ${parsedUrl.platform}`,
                size: new Blob([content]).size,
                sourceUrl: url
            };

            LocalStorageManager.saveFile(repository, filePath, fileData);

            // Update file list
            if (!existingFile && window.currentState) {
                window.currentState.files.push({
                    name: fileName,
                    type: 'file',
                    path: filePath,
                    lastModified: fileData.lastModified,
                    lastCommit: fileData.lastCommit,
                    size: fileData.size
                });
            }

            hideLoading();
            renderFileList();
            showSuccessMessage(`Successfully imported "${fileName}" from ${parsedUrl.platform}`);

        } catch (error) {
            hideLoading();
            showErrorMessage(`Import failed: ${error.message}`);
        }
    }

    // Import multiple files from URLs
    async importMultipleFiles(urls) {
        showLoading(`Importing ${urls.length} file(s)...`);

        let successCount = 0;
        let errorCount = 0;

        for (const url of urls) {
            try {
                await this.importFromUrl(url);
                successCount++;
            } catch (error) {
                errorCount++;
            }
        }

        hideLoading();
        showSuccessMessage(`Imported ${successCount} file(s). Failed: ${errorCount}`);
    }

    // Export repository as ZIP
    async exportAsZip(repoName) {
        showLoading('Creating ZIP archive...');

        try {
            // Check if JSZip is loaded
            if (typeof JSZip === 'undefined') {
                throw new Error('JSZip library not loaded');
            }

            const zip = new JSZip();
            const repoData = LocalStorageManager.getRepositoryFiles(repoName);
            const repo = LocalStorageManager.getRepository(repoName);

            if (!repo) {
                throw new Error('Repository not found');
            }

            // Add README
            const readmeContent = `# ${repoName}\n\n${repo.description || 'No description'}\n\nExported from GitDev on ${new Date().toISOString()}`;
            zip.file('README.md', readmeContent);

            // Add all files
            Object.keys(repoData).forEach(filePath => {
                const fileData = repoData[filePath];
                zip.file(filePath, fileData.content);
            });

            // Generate ZIP
            const blob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 9 }
            });

            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${repoName}-${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            hideLoading();
            showSuccessMessage(`Repository "${repoName}" exported successfully`);

        } catch (error) {
            hideLoading();
            showErrorMessage(`Export failed: ${error.message}`);
        }
    }

    // Export as JSON
    exportAsJson(repoName) {
        try {
            const repo = LocalStorageManager.getRepository(repoName);
            const repoData = LocalStorageManager.getRepositoryFiles(repoName);

            const exportData = {
                repository: repo,
                files: repoData,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${repoName}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showSuccessMessage(`Repository exported as JSON`);

        } catch (error) {
            showErrorMessage(`Export failed: ${error.message}`);
        }
    }

    // Import from JSON
    async importFromJson(file) {
        showLoading('Importing from JSON...');

        try {
            const content = await this.readFileAsText(file);
            const data = JSON.parse(content);

            if (!data.repository || !data.files) {
                throw new Error('Invalid JSON format');
            }

            // Check if repo exists
            const existingRepo = LocalStorageManager.getRepository(data.repository.name);
            if (existingRepo) {
                if (!confirm(`Repository "${data.repository.name}" already exists. Merge files?`)) {
                    hideLoading();
                    return;
                }
            } else {
                LocalStorageManager.saveRepository(data.repository);
            }

            // Import all files
            Object.keys(data.files).forEach(filePath => {
                LocalStorageManager.saveFile(
                    data.repository.name,
                    filePath,
                    data.files[filePath]
                );
            });

            hideLoading();
            showSuccessMessage(`Repository "${data.repository.name}" imported successfully`);

        } catch (error) {
            hideLoading();
            showErrorMessage(`Import failed: ${error.message}`);
        }
    }

    // Helper: Read file as text
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Detect category from filename
    detectCategory(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const categories = {
            'Documentation': ['md', 'txt'],
            'Frontend': ['html', 'css', 'jsx', 'tsx'],
            'Backend': ['js', 'ts', 'py', 'java'],
            'Config': ['json', 'yml', 'yaml']
        };

        for (const [category, extensions] of Object.entries(categories)) {
            if (extensions.includes(ext)) return category;
        }
        return 'General';
    }
}

// Initialize manager
const importExportManager = new ImportExportManager();

// Show import modal
function showImportModal() {
    const modal = document.getElementById('importModal');
    if (!modal) {
        createImportModal();
    }
    document.getElementById('importModal').classList.remove('hidden');
    document.getElementById('importModal').classList.add('flex');
    document.getElementById('importUrlInput').focus();
}

// Hide import modal
function hideImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.getElementById('importUrlInput').value = '';
    }
}

// Create import modal
function createImportModal() {
    const modalHTML = `
        <div id="importModal" class="fixed inset0 bgBlack bg-opacity-50 hidden itemsCenter justifyCenter z50">
            <div class="bgCanvasDefault roundedLg shadow2xl wFull maxW2xl borderDefault">
                <div class="flex itemsCenter justifyBetween p6 borderB borderDefault">
                    <h2 class="textXl fontSemibold textFgDefault">
                        <i class="fas fa-download mr-2"></i>Import from URL
                    </h2>
                    <button onclick="hideImportModal()" class="textFgMuted hoverTextDefault">
                        <i class="fas fa-times textXl"></i>
                    </button>
                </div>

                <div class="p6">
                    <div class="mb4">
                        <label class="block textSm fontSemibold textFgDefault mb2">
                            GitHub/GitLab/Bitbucket URL
                        </label>
                        <input 
                            type="url" 
                            id="importUrlInput" 
                            placeholder="https://github.com/user/repo/blob/main/file.js"
                            class="wFull bgCanvasInset textFgDefault px4 py3 roundedMd borderDefault focusOutlineNone focus:border-github-accent-emphasis"
                        />
                        <p class="textXs textFgMuted mt2">
                            <i class="fas fa-info-circle mr-1"></i>
                            Paste a direct link to a file from GitHub, GitLab, or Bitbucket
                        </p>
                    </div>

                    <div class="bgCanvasInset roundedLg p4 mb4">
                        <p class="textSm fontSemibold textFgDefault mb2">Examples:</p>
                        <ul class="textXs textFgMuted spaceY1 fontMono">
                            <li>â€¢ https://github.com/user/repo/blob/main/src/index.js</li>
                            <li>â€¢ https://gitlab.com/user/repo/-/blob/main/config.json</li>
                            <li>â€¢ https://raw.githubusercontent.com/user/repo/main/file.md</li>
                        </ul>
                    </div>

                    <div class="flex gap3">
                        <button 
                            onclick="performImport()" 
                            class="flex1 bgSuccessEmph textWhite px6 py3 roundedLg hoverBgSuccess transitionAll fontSemibold"
                        >
                            <i class="fas fa-download mr-2"></i>Import File
                        </button>
                        <button 
                            onclick="hideImportModal()" 
                            class="px6 py3 borderDefault roundedLg hover:bg-github-canvas-overlay transitionAll textFgDefault"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Enter key to import
    document.getElementById('importUrlInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performImport();
        }
    });
}

// Perform import
async function performImport() {
    const url = document.getElementById('importUrlInput').value.trim();

    if (!url) {
        showErrorMessage('Please enter a URL');
        return;
    }

    if (!window.currentState || !window.currentState.repository) {
        showErrorMessage('Please select a repository first');
        return;
    }

    hideImportModal();
    await importExportManager.importFromUrl(url);
}

// Show export modal
function showExportModal(repoName) {
    const modal = document.getElementById('exportModal');
    if (!modal) {
        createExportModal();
    }

    document.getElementById('exportRepoName').textContent = repoName;
    document.getElementById('exportModal').setAttribute('data-repo', repoName);
    document.getElementById('exportModal').classList.remove('hidden');
    document.getElementById('exportModal').classList.add('flex');
}

// Hide export modal
function hideExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Create export modal
function createExportModal() {
    const modalHTML = `
        <div id="exportModal" class="fixed inset0 bgBlack bg-opacity-50 hidden itemsCenter justifyCenter z50">
            <div class="bgCanvasDefault roundedLg shadow2xl wFull maxWMd borderDefault">
                <div class="flex itemsCenter justifyBetween p6 borderB borderDefault">
                    <h2 class="textXl fontSemibold textFgDefault">
                        <i class="fas fa-file-export mr-2"></i>Export Repository
                    </h2>
                    <button onclick="hideExportModal()" class="textFgMuted hoverTextDefault">
                        <i class="fas fa-times textXl"></i>
                    </button>
                </div>

                <div class="p6">
                    <p class="textFgMuted mb4">
                        Export <span id="exportRepoName" class="fontSemibold textFgDefault"></span>
                    </p>

                    <div class="space-y-3">
                        <button 
                            onclick="exportRepositoryAsZip()" 
                            class="wFull bgCanvasOverlay borderDefault px6 py4 roundedLg hover:border-github-accent-emphasis transitionAll textLeft"
                        >
                            <div class="flex itemsCenter">
                                <i class="fas fa-file-archive text2xl textAccentFg mr-4"></i>
                                <div>
                                    <div class="fontSemibold textFgDefault">ZIP Archive</div>
                                    <div class="textSm textFgMuted">Download as .zip file</div>
                                </div>
                            </div>
                        </button>

                        <button 
                            onclick="exportRepositoryAsJson()" 
                            class="wFull bgCanvasOverlay borderDefault px6 py4 roundedLg hover:border-github-accent-emphasis transitionAll textLeft"
                        >
                            <div class="flex itemsCenter">
                                <i class="fas fa-code text2xl textAccentFg mr-4"></i>
                                <div>
                                    <div class="fontSemibold textFgDefault">JSON Export</div>
                                    <div class="textSm textFgMuted">Export as .json file</div>
                                </div>
                            </div>
                        </button>
                    </div>

                    <button 
                        onclick="hideExportModal()" 
                        class="wFull mt-4 px6 py3 borderDefault roundedLg hover:bg-github-canvas-overlay transitionAll textFgDefault"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Export functions
function exportRepositoryAsZip() {
    const repoName = document.getElementById('exportModal').getAttribute('data-repo');
    hideExportModal();
    importExportManager.exportAsZip(repoName);
}

function exportRepositoryAsJson() {
    const repoName = document.getElementById('exportModal').getAttribute('data-repo');
    hideExportModal();
    importExportManager.exportAsJson(repoName);
}

// Load JSZip dynamically
function loadJSZip() {
    if (typeof JSZip === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        document.head.appendChild(script);
    }
}

// Load on init
loadJSZip();
/**
export {
    ImportExportManager,
    importExportManager,
    showImportModal,
    hideImportModal,
    showExportModal,
    hideExportModal
};
**/
// Attach to window
window.showImportModal = showImportModal;
window.hideImportModal = hideImportModal;
window.performImport = performImport;
window.showExportModal = showExportModal;
window.hideExportModal = hideExportModal;
window.exportRepositoryAsZip = exportRepositoryAsZip;
window.exportRepositoryAsJson = exportRepositoryAsJson;
window.importExportManager = importExportManager;