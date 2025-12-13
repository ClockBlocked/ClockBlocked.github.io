function isValidFilename(filename) {
  if (!filename || filename.length > 255) return false;
  if (/[<>:"|?*\\\/]/.test(filename)) return false;
  const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  const nameWithoutExt = filename.split('.')[0];
  if (reserved.includes(nameWithoutExt.toUpperCase())) return false;
  return true;
}

function formatFileSize(bytes) {
  if (typeof bytes !== 'number') return '0 KB';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'now';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
  if (diff < 604800000) return Math.floor(diff / 86400000) + ' days ago';
  return date.toLocaleDateString();
}

function getLanguageColor(ext) {
  const colors = {
    'html': '#e34c26', 'htm': '#e34c26', 'css': '#1572b6', 'js': '#f1e05a', 'javascript': '#f1e05a',
    'ts': '#2b7489', 'typescript': '#2b7489', 'md': '#083fa1', 'markdown': '#083fa1', 'json': '#f1e05a',
    'php': '#4f5d95', 'py': '#3572a5', 'python': '#3572a5', 'java': '#b07219', 'cpp': '#f34b7d',
    'c': '#555555', 'cs': '#239120', 'rb': '#701516', 'ruby': '#701516', 'go': '#00add8',
    'rs': '#dea584', 'rust': '#dea584', 'yml': '#cb171e', 'yaml': '#cb171e', 'xml': '#0060ac',
    'sql': '#e38c00'
  };
  return colors[ext] || '#7d8590';
}

function getLanguageName(ext) {
  const languages = {
    'html': 'HTML', 'htm': 'HTML', 'css': 'CSS', 'js': 'JavaScript', 'javascript': 'JavaScript',
    'ts': 'TypeScript', 'typescript': 'TypeScript', 'json': 'JSON', 'md': 'Markdown', 'markdown': 'Markdown',
    'php': 'PHP', 'py': 'Python', 'python': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C',
    'cs': 'C#', 'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'yml': 'YAML', 'yaml': 'YAML', 'xml': 'XML',
    'sql': 'SQL'
  };
  return languages[ext] || 'Text';
}

function getFileIcon(filename, type) {
  if (type === 'folder') {
    return `<svg class="w-4 h-4 text-github-accent-fg" fill="currentColor" viewBox="0 0 16 16"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"/></svg>`;
  }
  const ext = filename.split('.').pop().toLowerCase();
  const iconColor = getLanguageColor(ext);
  return `<svg class="w-4 h-4" style="color: ${iconColor}" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>`;
}

function getPrismLanguage(ext) {
  const languageMap = {
    'js': 'javascript', 'javascript': 'javascript', 'ts': 'typescript', 'typescript': 'typescript',
    'html': 'html', 'htm': 'html', 'css': 'css', 'scss': 'scss', 'sass': 'sass', 'less': 'less',
    'json': 'json', 'md': 'markdown', 'markdown': 'markdown', 'py': 'python', 'python': 'python',
    'php': 'php', 'sql': 'sql', 'yml': 'yaml', 'yaml': 'yaml', 'xml': 'xml', 'java': 'java',
    'cpp': 'cpp', 'c': 'c', 'cs': 'csharp', 'rb': 'ruby', 'rust': 'rust', 'go': 'go',
    'txt': 'text', 'text': 'text'
  };
  return languageMap[ext] || 'text';
}

function adjustCodeBlockHeight() {
  const lineNumbers = document.getElementById('lineNumbers');
  const codeBlock = document.getElementById('codeBlock');
  
  if (lineNumbers && codeBlock) {
    const content = codeBlock.textContent || '';
    const lineCount = content.split('\n').length;
    
    lineNumbers.innerHTML = '';
    for (let i = 1; i <= lineCount; i++) {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'line-number';
      lineDiv.textContent = i;
      lineNumbers.appendChild(lineDiv);
    }
  }
}
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