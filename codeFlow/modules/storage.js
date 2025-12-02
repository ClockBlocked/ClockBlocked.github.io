// IndexedDB Storage Manager
class StorageManager {
    constructor() {
        this.dbName = 'gist-clone-db';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Failed to open IndexedDB');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create snippets store
                if (!db.objectStoreNames.contains('snippets')) {
                    const snippetsStore = db.createObjectStore('snippets', { keyPath: 'id' });
                    snippetsStore.createIndex('createdAt', 'createdAt', { unique: false });
                    snippetsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                    snippetsStore.createIndex('isPublic', 'isPublic', { unique: false });
                    snippetsStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                }

                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'id' });
                }
            };
        });
    }

    async getData() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snippets', 'settings'], 'readonly');
            const snippetsStore = transaction.objectStore('snippets');
            const settingsStore = transaction.objectStore('settings');

            const snippetsRequest = snippetsStore.getAll();
            const settingsRequest = settingsStore.get('global');

            const data = {
                snippets: [],
                settings: this.getDefaultSettings()
            };

            snippetsRequest.onsuccess = () => {
                data.snippets = snippetsRequest.result;
            };

            settingsRequest.onsuccess = () => {
                if (settingsRequest.result) {
                    data.settings = { ...data.settings, ...settingsRequest.result };
                }
            };

            transaction.oncomplete = () => {
                resolve(data);
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }

    async saveData(data) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snippets', 'settings'], 'readwrite');
            const snippetsStore = transaction.objectStore('snippets');
            const settingsStore = transaction.objectStore('settings');

            // Clear existing snippets
            snippetsStore.clear();

            // Add new snippets
            data.snippets.forEach(snippet => {
                snippetsStore.add(snippet);
            });

            // Save settings
            settingsStore.put({
                id: 'global',
                ...data.settings
            });

            transaction.oncomplete = () => {
                console.log('Data saved successfully');
                resolve();
            };

            transaction.onerror = () => {
                console.error('Error saving data:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    async saveSnippet(snippet) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snippets'], 'readwrite');
            const store = transaction.objectStore('snippets');

            const request = store.put(snippet);

            request.onsuccess = () => {
                console.log('Snippet saved successfully');
                resolve(snippet);
            };

            request.onerror = () => {
                console.error('Error saving snippet:', request.error);
                reject(request.error);
            };
        });
    }

    async deleteSnippet(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snippets'], 'readwrite');
            const store = transaction.objectStore('snippets');

            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('Snippet deleted successfully');
                resolve();
            };

            request.onerror = () => {
                console.error('Error deleting snippet:', request.error);
                reject(request.error);
            };
        });
    }

    async getSnippet(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snippets'], 'readonly');
            const store = transaction.objectStore('snippets');

            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async searchSnippets(query, filters = {}) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snippets'], 'readonly');
            const store = transaction.objectStore('snippets');

            const request = store.getAll();

            request.onsuccess = () => {
                let snippets = request.result;

                // Apply search query
                if (query) {
                    const searchTerm = query.toLowerCase();
                    snippets = snippets.filter(snippet => 
                        snippet.title.toLowerCase().includes(searchTerm) ||
                        snippet.description?.toLowerCase().includes(searchTerm) ||
                        snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
                    );
                }

                // Apply filters
                if (filters.language && filters.language !== 'all') {
                    snippets = snippets.filter(snippet => 
                        snippet.languageStats && 
                        snippet.languageStats[filters.language]
                    );
                }

                if (filters.visibility !== 'all') {
                    snippets = snippets.filter(snippet => 
                        filters.visibility === 'public' ? snippet.isPublic : !snippet.isPublic
                    );
                }

                // Sort by updated date (newest first)
                snippets.sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );

                resolve(snippets);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async updateSettings(settings) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');

            const request = store.put({
                id: 'global',
                ...settings
            });

            request.onsuccess = () => {
                console.log('Settings updated successfully');
                resolve();
            };

            request.onerror = () => {
                console.error('Error updating settings:', request.error);
                reject(request.error);
            };
        });
    }

    getDefaultSettings() {
        return {
            theme: 'dark-dimmed',
            defaultVisibility: 'public',
            editor: {
                fontSize: 14,
                wordWrap: 'on',
                minimap: true,
                autoSave: true,
                tabSize: 2,
                lineNumbers: true
            },
            gallery: {
                view: 'grid',
                sortBy: 'updated',
                sortOrder: 'desc'
            }
        };
    }

    async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!data.snippets || !Array.isArray(data.snippets)) {
                throw new Error('Invalid data format');
            }

            // Merge with existing data
            const existingData = await this.getData();
            const mergedSnippets = [...existingData.snippets, ...data.snippets];
            
            // Remove duplicates by id
            const uniqueSnippets = Array.from(
                new Map(mergedSnippets.map(s => [s.id, s])).values()
            );

            await this.saveData({
                snippets: uniqueSnippets,
                settings: { ...existingData.settings, ...data.settings }
            });

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }

    async exportData() {
        const data = await this.getData();
        return JSON.stringify(data, null, 2);
    }

    async clearAllData() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['snippets', 'settings'], 'readwrite');
            const snippetsStore = transaction.objectStore('snippets');
            const settingsStore = transaction.objectStore('settings');

            snippetsStore.clear();
            settingsStore.clear();

            transaction.oncomplete = () => {
                console.log('All data cleared');
                resolve();
            };

            transaction.onerror = () => {
                console.error('Error clearing data:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    async getStatistics() {
        const data = await this.getData();
        const snippets = data.snippets;

        const stats = {
            totalSnippets: snippets.length,
            totalFiles: snippets.reduce((sum, snippet) => sum + (snippet.files?.length || 0), 0),
            totalSize: snippets.reduce((sum, snippet) => 
                sum + (snippet.files?.reduce((fileSum, file) => fileSum + (file.size || 0), 0) || 0), 0),
            languageDistribution: {},
            visibilityStats: {
                public: snippets.filter(s => s.isPublic).length,
                private: snippets.filter(s => !s.isPublic).length
            },
            dateStats: {
                today: snippets.filter(s => {
                    const date = new Date(s.createdAt);
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
                }).length,
                thisWeek: snippets.filter(s => {
                    const date = new Date(s.createdAt);
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return date >= weekAgo;
                }).length,
                thisMonth: snippets.filter(s => {
                    const date = new Date(s.createdAt);
                    const now = new Date();
                    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    return date >= monthAgo;
                }).length
            }
        };

        // Calculate language distribution
        snippets.forEach(snippet => {
            if (snippet.languageStats) {
                Object.keys(snippet.languageStats).forEach(language => {
                    stats.languageDistribution[language] = 
                        (stats.languageDistribution[language] || 0) + 1;
                });
            }
        });

        return stats;
    }
}