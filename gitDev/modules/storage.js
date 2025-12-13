const LocalStorageManager = {
  getRepositories: function() {
    return JSON.parse(localStorage.getItem('gitcodr_repositories') || '[]');
  },
  saveRepositories: function(repositories) {
    localStorage.setItem('gitcodr_repositories', JSON.stringify(repositories));
  },
  getRepository: function(repoName) {
    const repos = this.getRepositories();
    return repos.find(r => r.name === repoName);
  },
  saveRepository: function(repo) {
    const repos = this.getRepositories();
    const index = repos.findIndex(r => r.name === repo.name);
    if (index !== -1) {
      repos[index] = repo;
    } else {
      repos.push(repo);
    }
    this.saveRepositories(repos);
  },
  deleteRepository: function(repoName) {
    const repos = this.getRepositories();
    const filtered = repos.filter(r => r.name !== repoName);
    this.saveRepositories(filtered);
    localStorage.removeItem(`gitcodr_repo_${repoName}`);
  },
  getRepositoryFiles: function(repoName) {
    const key = `gitcodr_repo_${repoName}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  },
  saveRepositoryFiles: function(repoName, files) {
    const key = `gitcodr_repo_${repoName}`;
    localStorage.setItem(key, JSON.stringify(files));
  },
  getFile: function(repoName, filePath) {
    const repoData = this.getRepositoryFiles(repoName);
    return repoData[filePath] || null;
  },
  saveFile: function(repoName, filePath, fileData) {
    const repoData = this.getRepositoryFiles(repoName);
    repoData[filePath] = fileData;
    this.saveRepositoryFiles(repoName, repoData);
  },
  deleteFile: function(repoName, filePath) {
    const repoData = this.getRepositoryFiles(repoName);
    delete repoData[filePath];
    this.saveRepositoryFiles(repoName, repoData);
  },
  listFiles: function(repoName, pathPrefix = '') {
    const repoData = this.getRepositoryFiles(repoName);
    const files = [];
    const folders = new Set();

    Object.keys(repoData).forEach(filePath => {
      if (pathPrefix === '') {
        const parts = filePath.split('/');
        if (parts.length === 1) {
          files.push({
            name: parts[0],
            type: 'file',
            path: filePath,
            lastModified: repoData[filePath].lastModified || Date.now(),
            lastCommit: repoData[filePath].lastCommit || 'Initial commit',
            size: repoData[filePath].size || 0
          });
        } else if (parts.length > 1) {
          folders.add(parts[0]);
        }
      } else {
        if (filePath.startsWith(pathPrefix)) {
          const relativePath = filePath.substring(pathPrefix.length);
          const parts = relativePath.split('/');
          
          if (parts.length === 1 && parts[0]) {
            files.push({
              name: parts[0],
              type: 'file',
              path: filePath,
              lastModified: repoData[filePath].lastModified || Date.now(),
              lastCommit: repoData[filePath].lastCommit || 'Initial commit',
              size: repoData[filePath].size || 0
            });
          } else if (parts.length > 1 && parts[0]) {
            folders.add(parts[0]);
          }
        }
      }
    });

    folders.forEach(folderName => {
      files.push({
        name: folderName,
        type: 'folder',
        path: pathPrefix + folderName + '/',
        lastModified: Date.now(),
        lastCommit: 'Folder'
      });
    });

    return files.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }
};
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