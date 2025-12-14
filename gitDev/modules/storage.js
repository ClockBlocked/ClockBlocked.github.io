const LocalStorageManager = (() => {
    const STORAGE_PREFIX = 'gitcodr_';
    
    function saveRepository(repo) {
        try {
            const repos = getRepositories();
            const existingIndex = repos.findIndex(r => r.name === repo.name);
            if (existingIndex !== -1) {
                repos[existingIndex] = { ...repos[existingIndex], ...repo };
            } else {
                repos.push(repo);
            }
            localStorage.setItem(`${STORAGE_PREFIX}repositories`, JSON.stringify(repos));
            return true;
        } catch (error) {
            console.error('Failed to save repository:', error);
            return false;
        }
    }
    
    function getRepository(name) {
        try {
            const repos = getRepositories();
            return repos.find(r => r.name === name);
        } catch (error) {
            console.error('Failed to get repository:', error);
            return null;
        }
    }
    
    function getRepositories() {
        try {
            const data = localStorage.getItem(`${STORAGE_PREFIX}repositories`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get repositories:', error);
            return [];
        }
    }
    
    function deleteRepository(name) {
        try {
            const repos = getRepositories().filter(r => r.name !== name);
            localStorage.setItem(`${STORAGE_PREFIX}repositories`, JSON.stringify(repos));
            
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${STORAGE_PREFIX}repo_${name}`)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Failed to delete repository:', error);
            return false;
        }
    }
    
    function saveFile(repoName, filePath, fileData) {
        try {
            const key = `${STORAGE_PREFIX}repo_${repoName}`;
            let repoData = localStorage.getItem(key);
            repoData = repoData ? JSON.parse(repoData) : {};
            
            repoData[filePath] = {
                ...fileData,
                lastModified: Date.now()
            };
            
            localStorage.setItem(key, JSON.stringify(repoData));
            return true;
        } catch (error) {
            console.error('Failed to save file:', error);
            return false;
        }
    }
    
    function getFile(repoName, filePath) {
        try {
            const key = `${STORAGE_PREFIX}repo_${repoName}`;
            const repoData = localStorage.getItem(key);
            if (!repoData) return null;
            const files = JSON.parse(repoData);
            return files[filePath] || null;
        } catch (error) {
            console.error('Failed to get file:', error);
            return null;
        }
    }
    
    function deleteFile(repoName, filePath) {
        try {
            const key = `${STORAGE_PREFIX}repo_${repoName}`;
            let repoData = localStorage.getItem(key);
            if (!repoData) return false;
            
            repoData = JSON.parse(repoData);
            delete repoData[filePath];
            localStorage.setItem(key, JSON.stringify(repoData));
            return true;
        } catch (error) {
            console.error('Failed to delete file:', error);
            return false;
        }
    }
    
    function listFiles(repoName, pathPrefix = '') {
        try {
            const key = `${STORAGE_PREFIX}repo_${repoName}`;
            const repoData = localStorage.getItem(key);
            if (!repoData) return [];
            
            const files = JSON.parse(repoData);
            const fileList = [];
            
            for (const [path, data] of Object.entries(files)) {
                if (path.startsWith(pathPrefix)) {
                    const relativePath = path.substring(pathPrefix.length);
                    const parts = relativePath.split('/');
                    
                    if (parts.length === 1 && parts[0]) {
                        fileList.push({
                            name: parts[0],
                            type: 'file',
                            path: path,
                            lastModified: data.lastModified || Date.now(),
                            lastCommit: data.lastCommit || 'Initial commit',
                            size: data.size || 0
                        });
                    } else if (parts.length > 1 && parts[0]) {
                        if (!fileList.find(f => f.name === parts[0] && f.type === 'directory')) {
                            fileList.push({
                                name: parts[0],
                                type: 'directory',
                                path: pathPrefix + parts[0]
                            });
                        }
                    }
                }
            }
            
            return fileList;
        } catch (error) {
            console.error('Failed to list files:', error);
            return [];
        }
    }
    
    return {
        saveRepository,
        getRepository,
        getRepositories,
        deleteRepository,
        saveFile,
        getFile,
        deleteFile,
        listFiles
    };
})();

window.LocalStorageManager = LocalStorageManager;
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