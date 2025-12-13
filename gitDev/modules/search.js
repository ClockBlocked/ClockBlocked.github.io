/**
 * search.js - Comprehensive Search System for GitDev
 * Features: Full-text search, fuzzy matching, regex support, filter by language/date
 * 
 * C R E A T E D  B Y
 * William Hanson
 * Chevrolay@Outlook.com
 * m.me/Chevrolay
 */
/**
import { LocalStorageManager } from './storage.js';
import { showSuccessMessage, showErrorMessage } from './overlays.js';
import { viewFile, openRepository } from './core.js';
import { getLanguageName, formatDate } from './dependencies.js';
**/


class SearchEngine {
    constructor() {
        this.searchIndex = new Map();
        this.searchHistory = JSON.parse(localStorage.getItem('gitdev_search_history') || '[]');
        this.maxHistoryItems = 20;
    }

    // Build search index from all repositories
    buildSearchIndex() {
        this.searchIndex.clear();
        const repositories = LocalStorageManager.getRepositories();

        repositories.forEach(repo => {
            const files = LocalStorageManager.getRepositoryFiles(repo.name);

            Object.keys(files).forEach(filePath => {
                const fileData = files[filePath];
                this.searchIndex.set(`${repo.name}::${filePath}`, {
                    repository: repo.name,
                    path: filePath,
                    fileName: filePath.split('/').pop(),
                    content: fileData.content || '',
                    category: fileData.category || 'General',
                    tags: fileData.tags || [],
                    lastModified: fileData.lastModified,
                    size: fileData.size || 0
                });
            });
        });

        return this.searchIndex.size;
    }

    // Full-text search across all files
    searchFiles(query, options = {}) {
        const {
            caseSensitive = false,
            useRegex = false,
            searchInContent = true,
            searchInFilenames = true,
            filterByLanguage = null,
            filterByRepository = null,
            filterByDate = null,
            maxResults = 100
        } = options;

        if (!query || query.trim().length === 0) {
            return [];
        }

        this.addToHistory(query);

        const results = [];
        let searchPattern;

        try {
            if (useRegex) {
                searchPattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
            } else {
                const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                searchPattern = new RegExp(escapedQuery, caseSensitive ? 'g' : 'gi');
            }
        } catch (e) {
            showErrorMessage('Invalid regex pattern');
            return [];
        }

        this.searchIndex.forEach((fileData, key) => {
            // Apply filters
            if (filterByRepository && fileData.repository !== filterByRepository) {
                return;
            }

            if (filterByLanguage) {
                const ext = fileData.fileName.split('.').pop();
                const lang = getLanguageName(ext);
                if (lang !== filterByLanguage) {
                    return;
                }
            }

            if (filterByDate) {
                const fileDate = new Date(fileData.lastModified);
                const filterDate = new Date(filterByDate);
                if (fileDate < filterDate) {
                    return;
                }
            }

            let matchFound = false;
            let matchDetails = {
                ...fileData,
                matches: [],
                score: 0
            };

            // Search in filename
            if (searchInFilenames) {
                const filenameMatches = fileData.fileName.match(searchPattern);
                if (filenameMatches) {
                    matchFound = true;
                    matchDetails.score += 10 * filenameMatches.length;
                    matchDetails.matches.push({
                        type: 'filename',
                        count: filenameMatches.length
                    });
                }
            }

            // Search in content
            if (searchInContent) {
                const contentMatches = fileData.content.match(searchPattern);
                if (contentMatches) {
                    matchFound = true;
                    matchDetails.score += contentMatches.length;

                    // Extract context around matches (first 3)
                    const contexts = this.extractContexts(fileData.content, searchPattern, 3);
                    matchDetails.matches.push({
                        type: 'content',
                        count: contentMatches.length,
                        contexts: contexts
                    });
                }
            }

            // Search in tags
            const tagMatches = fileData.tags.filter(tag => 
                searchPattern.test(tag)
            );
            if (tagMatches.length > 0) {
                matchFound = true;
                matchDetails.score += 5 * tagMatches.length;
                matchDetails.matches.push({
                    type: 'tags',
                    matched: tagMatches
                });
            }

            if (matchFound) {
                results.push(matchDetails);
            }
        });

        // Sort by score (relevance)
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, maxResults);
    }

    // Extract context around matches
    extractContexts(content, pattern, maxContexts = 3) {
        const contexts = [];
        const lines = content.split('\n');
        let foundCount = 0;

        for (let i = 0; i < lines.length && foundCount < maxContexts; i++) {
            if (pattern.test(lines[i])) {
                const start = Math.max(0, i - 1);
                const end = Math.min(lines.length, i + 2);
                contexts.push({
                    lineNumber: i + 1,
                    before: lines[start],
                    match: lines[i],
                    after: lines[end - 1]
                });
                foundCount++;
            }
        }

        return contexts;
    }

    // Fuzzy search by filename
    fuzzySearch(query, threshold = 0.6) {
        const results = [];

        this.searchIndex.forEach((fileData, key) => {
            const score = this.calculateFuzzyScore(
                query.toLowerCase(), 
                fileData.fileName.toLowerCase()
            );

            if (score >= threshold) {
                results.push({
                    ...fileData,
                    fuzzyScore: score
                });
            }
        });

        results.sort((a, b) => b.fuzzyScore - a.fuzzyScore);
        return results;
    }

    // Simple fuzzy matching algorithm
    calculateFuzzyScore(query, target) {
        if (target.includes(query)) return 1.0;

        let queryIndex = 0;
        let targetIndex = 0;
        let matches = 0;

        while (queryIndex < query.length && targetIndex < target.length) {
            if (query[queryIndex] === target[targetIndex]) {
                matches++;
                queryIndex++;
            }
            targetIndex++;
        }

        return matches / query.length;
    }

    // Add search to history
    addToHistory(query) {
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        this.searchHistory.unshift(query);

        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        }

        localStorage.setItem('gitdev_search_history', JSON.stringify(this.searchHistory));
    }

    // Get search history
    getHistory() {
        return this.searchHistory;
    }

    // Clear search history
    clearHistory() {
        this.searchHistory = [];
        localStorage.removeItem('gitdev_search_history');
    }
}

// Initialize search engine
const searchEngine = new SearchEngine();

// Show search modal
function showSearchModal() {
    const modal = document.getElementById('searchModal');
    if (!modal) {
        createSearchModal();
    }

    searchEngine.buildSearchIndex();
    document.getElementById('searchModal').classList.remove('hidden');
    document.getElementById('searchModal').classList.add('flex');
    document.getElementById('searchInput').focus();

    renderSearchHistory();
}

// Hide search modal
function hideSearchModal() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Create search modal HTML
function createSearchModal() {
    const modalHTML = `
        <div id="searchModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-github-canvas-default rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-github-border-default">
                <!-- Search Header -->
                <div class="bg-github-canvas-overlay border-b border-github-border-default p-4">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-search text-github-fg-muted"></i>
                        <input 
                            type="text" 
                            id="searchInput" 
                            placeholder="Search files, content, tags..." 
                            class="flex-1 bg-github-canvas-inset text-github-fg-default px-4 py-2 rounded-md border border-github-border-default focus:outline-none focus:border-github-accent-emphasis"
                        />
                        <button onclick="hideSearchModal()" class="text-github-fg-muted hover:text-github-fg-default">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <!-- Search Options -->
                    <div class="mt-3 flex gap-3 flex-wrap">
                        <label class="flex items-center gap-2 text-sm text-github-fg-default">
                            <input type="checkbox" id="searchCaseSensitive" class="rounded">
                            Case Sensitive
                        </label>
                        <label class="flex items-center gap-2 text-sm text-github-fg-default">
                            <input type="checkbox" id="searchUseRegex" class="rounded">
                            Regex
                        </label>
                        <label class="flex items-center gap-2 text-sm text-github-fg-default">
                            <input type="checkbox" id="searchInContent" checked class="rounded">
                            Content
                        </label>
                        <label class="flex items-center gap-2 text-sm text-github-fg-default">
                            <input type="checkbox" id="searchInFilenames" checked class="rounded">
                            Filenames
                        </label>
                        <select id="searchFilterLanguage" class="bg-github-canvas-inset text-github-fg-default px-3 py-1 rounded border border-github-border-default text-sm">
                            <option value="">All Languages</option>
                            <option value="JavaScript">JavaScript</option>
                            <option value="Python">Python</option>
                            <option value="HTML">HTML</option>
                            <option value="CSS">CSS</option>
                            <option value="JSON">JSON</option>
                            <option value="Markdown">Markdown</option>
                        </select>
                    </div>
                </div>

                <!-- Search Results -->
                <div id="searchResults" class="overflow-y-auto max-h-[60vh] p-4"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup event listeners
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(), 300);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideSearchModal();
        } else if (e.key === 'Enter') {
            performSearch();
        }
    });

    document.querySelectorAll('#searchCaseSensitive, #searchUseRegex, #searchInContent, #searchInFilenames, #searchFilterLanguage').forEach(el => {
        el.addEventListener('change', performSearch);
    });
}

// Perform search
function performSearch() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('searchResults');

    if (!query || query.trim().length === 0) {
        renderSearchHistory();
        return;
    }

    const options = {
        caseSensitive: document.getElementById('searchCaseSensitive').checked,
        useRegex: document.getElementById('searchUseRegex').checked,
        searchInContent: document.getElementById('searchInContent').checked,
        searchInFilenames: document.getElementById('searchInFilenames').checked,
        filterByLanguage: document.getElementById('searchFilterLanguage').value || null
    };

    const results = searchEngine.searchFiles(query, options);

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center py-12 text-github-fg-muted">
                <i class="fas fa-search text-4xl mb-4"></i>
                <p>No results found for "${query}"</p>
            </div>
        `;
        return;
    }

    let html = `<div class="space-y-3">`;
    html += `<div class="text-sm text-github-fg-muted mb-3">Found ${results.length} result${results.length !== 1 ? 's' : ''}</div>`;

    results.forEach(result => {
        html += `
            <div class="bg-github-canvas-overlay border border-github-border-default rounded-lg p-4 hover:border-github-accent-emphasis cursor-pointer transition-all" onclick="openSearchResult('${result.repository}', '${result.path}')">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-file-code text-github-accent-fg"></i>
                            <span class="font-semibold text-github-fg-default">${result.fileName}</span>
                            <span class="text-xs text-github-fg-muted">${result.repository}</span>
                        </div>
                        <div class="text-xs text-github-fg-muted mb-2">${result.path}</div>
        `;

        // Show match details
        result.matches.forEach(match => {
            if (match.type === 'content' && match.contexts) {
                match.contexts.forEach(ctx => {
                    html += `
                        <div class="bg-github-canvas-inset p-2 rounded text-xs font-mono mt-2">
                            <div class="text-github-fg-muted">Line ${ctx.lineNumber}:</div>
                            <div class="text-github-fg-default">${escapeHtml(ctx.match)}</div>
                        </div>
                    `;
                });
            } else if (match.type === 'tags') {
                html += `<div class="flex gap-1 mt-2">`;
                match.matched.forEach(tag => {
                    html += `<span class="px-2 py-1 bg-github-accent-emphasis text-white text-xs rounded">${tag}</span>`;
                });
                html += `</div>`;
            }
        });

        html += `
                    </div>
                    <div class="text-xs text-github-fg-muted">${formatDate(result.lastModified)}</div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    resultsContainer.innerHTML = html;
}

// Render search history
function renderSearchHistory() {
    const resultsContainer = document.getElementById('searchResults');
    const history = searchEngine.getHistory();

    if (history.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center py-12 text-github-fg-muted">
                <i class="fas fa-history text-4xl mb-4"></i>
                <p>No search history</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-github-fg-default">Recent Searches</h3>
            <button onclick="clearSearchHistory()" class="text-xs text-github-danger-fg hover:text-github-danger-emphasis">Clear History</button>
        </div>
        <div class="space-y-2">
    `;

    history.forEach(query => {
        html += `
            <div class="bg-github-canvas-overlay border border-github-border-default rounded px-4 py-2 hover:border-github-accent-emphasis cursor-pointer transition-all" onclick="useHistorySearch('${escapeHtml(query)}')">
                <i class="fas fa-history text-github-fg-muted mr-2"></i>
                <span class="text-github-fg-default">${escapeHtml(query)}</span>
            </div>
        `;
    });

    html += `</div>`;
    resultsContainer.innerHTML = html;
}

// Use history search
function useHistorySearch(query) {
    document.getElementById('searchInput').value = query;
    performSearch();
}

// Clear search history
function clearSearchHistory() {
    searchEngine.clearHistory();
    renderSearchHistory();
    showSuccessMessage('Search history cleared');
}

// Open search result
function openSearchResult(repository, filePath) {
    hideSearchModal();
    const fileName = filePath.split('/').pop();

    // Set current state and open file
    if (window.currentState) {
        window.currentState.repository = repository;
        const pathParts = filePath.split('/');
        if (pathParts.length > 1) {
            window.currentState.path = pathParts.slice(0, -1).join('/');
        } else {
            window.currentState.path = '';
        }
    }

    setTimeout(() => {
        openRepository(repository);
        setTimeout(() => viewFile(fileName), 500);
    }, 100);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


/**
// Export functions
export {
    SearchEngine,
    searchEngine,
    showSearchModal,
    hideSearchModal,
    performSearch,
    clearSearchHistory
};
**/

// Attach to window for inline onclick handlers
window.showSearchModal = showSearchModal;
window.hideSearchModal = hideSearchModal;
window.performSearch = performSearch;
window.clearSearchHistory = clearSearchHistory;
window.openSearchResult = openSearchResult;
window.useHistorySearch = useHistorySearch;