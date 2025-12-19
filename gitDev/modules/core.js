let currentState = {
  repository: null,
  branch: "main",
  path: "",
  currentFile: null,
  selectedTags: [],
  files: [],
  repositories: []
};
window.currentState = currentState;
let codeEditor = null;
let initialContentEditor = null;
let recentFiles = JSON.parse(localStorage.getItem("gitcodr_recent_files") || "[]");
function setupCodeEditors() {
  if (typeof CodeMirror === "undefined") return;
  const editorConfig = {
    lineNumbers: true,
    lineWrapping: false,
    theme: "one-dark",
    mode: "javascript",
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    smartIndent: true,
    viewportMargin: Infinity,
    cursorBlinkRate: 530,
    cursorScrollMargin: 12,
    cursorHeight: 1,
    showCursorWhenSelecting: true,
    scrollbarStyle: "native",
    autofocus: false,
    dragDrop: true,
    allowDropFileTypes: ["text/plain", "text/javascript", "text/css", "text/html"],
    undoDepth: 300,
    historyEventDelay: 1250,
    readOnly: false,
    styleActiveLine: {
      nonEmpty: true,
      className: "cm-active-line-highlight"
    },
    matchBrackets: true,
    autoCloseBrackets: true,
    matchTags: { bothTags: true },
    autoCloseTags: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    lint: true,
    highlightSelectionMatches: {
      minChars: 2,
      showToken: /\w/,
      annotateScrollbar: true
    },
    placeholder: "Start typing your code...",
    lineHeight: 1,
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    extraKeys: {
      "Ctrl-S": cm => {
        const fileEditor = document.getElementById("fileEditor");
        if (fileEditor && !fileEditor.classList.contains("hidden")) saveFile();
      },
      "Ctrl-F": "findPersistent",
      "Ctrl-Space": "autocomplete",
      "Ctrl-D": cm => cm.execCommand("duplicateLine"),
      "Ctrl-/": "toggleComment",
      "Shift-Tab": "indentLess",
      "Tab": cm => {
        if (cm.somethingSelected()) cm.indentSelection("add");
        else cm.execCommand("insertSoftTab");
      }
    }
  };
  setTimeout(() => {
    const editorContainer = document.getElementById("codeEditorContainer");
    const initialContentContainer = document.getElementById("initialContentEditor");
    if (editorContainer) {
      codeEditor = CodeMirror(editorContainer, editorConfig);
      codeEditor.on("change", updateCommitMessage);
      setTimeout(() => {
        if (codeEditor) codeEditor.refresh();
      }, 100);
    }
    if (initialContentContainer) {
      initialContentEditor = CodeMirror(initialContentContainer, {
        ...editorConfig,
        lineNumbers: true,
        height: "100%",
        width: "100%"
      });
      initialContentEditor.on("change", () => {
        const fileName = document.getElementById("newFileName");
        if (fileName && fileName.value) updateEditorMode(initialContentEditor, fileName.value);
      });
    }
  }, 100);
}
function fetchData(operationName, callback) {
  return new Promise((resolve, reject) => {
    LoadingProgress.show();
    setTimeout(() => {
      try {
        const result = callback();
        LoadingProgress.hide();
        resolve(result);
      } catch (error) {
        LoadingProgress.hide();
        reject(error);
      }
    }, 100);
  });
}
function loadRepositories() {
  return fetchData("Loading repositories...", () => {
    currentState.repositories = LocalStorageManager.getRepositories();
    renderRepositoryList();
    return currentState.repositories;
  }).catch(error => {
    showErrorMessage("Failed to load repositories: " + error.message);
  });
}
function createRepository() {
  const repoName = document.getElementById("newRepoName").value.trim();
  const description = document.getElementById("repoDescriptionInput").value.trim();
  const initReadme = document.getElementById("initReadme").checked;
  if (!repoName) {
    showErrorMessage("Please enter a repository name");
    return;
  }
  if (!isValidFilename(repoName)) {
    showErrorMessage("Invalid repository name. Please use only letters, numbers, hyphens and underscores.");
    return;
  }
  const existingRepo = LocalStorageManager.getRepository(repoName);
  if (existingRepo) {
    showErrorMessage("Repository already exists");
    return;
  }
  LoadingProgress.show();
  setTimeout(() => {
    try {
      const repo = {
        name: repoName,
        description: description,
        created: Date.now(),
        lastModified: Date.now(),
        defaultBranch: "main",
        branches: ["main"],
        visibility: document.getElementById("visibilityPublic").checked ? "public" : "private"
      };
      LocalStorageManager.saveRepository(repo);
      if (initReadme) {
        const readmeContent = `# ${repoName}\n\n${description ? description + "\n\n" : ""}## Getting Started\n\nThis repository was created with GitHub Clone.\n`;
        const readmeData = {
          content: readmeContent,
          category: "Documentation",
          tags: ["readme"],
          created: Date.now(),
          lastModified: Date.now(),
          lastCommit: "Initial commit",
          size: new Blob([readmeContent]).size
        };
        LocalStorageManager.saveFile(repoName, "README.md", readmeData);
      }
      currentState.repositories.push(repo);
      renderRepositoryList();
      hideCreateRepoModal();
      showSuccessMessage(`Repository "${repoName}" created successfully!`);
      setTimeout(() => {
        LoadingProgress.hide();
        openRepository(repoName);
      }, 500);
    } catch (error) {
      LoadingProgress.hide();
      showErrorMessage("Failed to create repository: " + error.message);
    }
  }, 1500);
}
function deleteRepository(repoName) {
  if (!confirm(`Are you sure you want to delete the repository "${repoName}"? This action cannot be undone.`)) return;
  LoadingProgress.show();
  setTimeout(() => {
    try {
      LocalStorageManager.deleteRepository(repoName);
      currentState.repositories = currentState.repositories.filter(r => r.name !== repoName);
      if (currentState.repository === repoName) {
        currentState.repository = null;
        showRepoSelector();
      }
      renderRepositoryList();
      showSuccessMessage(`Repository "${repoName}" deleted successfully!`);
      LoadingProgress.hide();
    } catch (error) {
      LoadingProgress.hide();
      showErrorMessage("Failed to delete repository: " + error.message);
    }
  }, 1500);
}
function createFile() {
  const fileName = document.getElementById("newFileName").value.trim();
  const category = document.getElementById("fileCategoryInput").value.trim() || "General";
  const content = initialContentEditor ? initialContentEditor.getValue() : "";
  if (!fileName) {
    showErrorMessage("Please enter a file name");
    return;
  }
  if (!isValidFilename(fileName)) {
    showErrorMessage("Invalid file name. Please use only letters, numbers, dots, underscores and hyphens.");
    return;
  }
  LoadingProgress.show();
  setTimeout(() => {
    try {
      const filePath = (currentState.path ? currentState.path + "/" : "") + fileName;
      const existingFile = LocalStorageManager.getFile(currentState.repository, filePath);
      if (existingFile) throw new Error("File already exists");
      const fileContent = content || `// ${fileName}\n// Created on ${new Date().toLocaleDateString()}\n\n`;
      const fileData = {
        content: fileContent,
        category: category,
        tags: currentState.selectedTags,
        created: Date.now(),
        lastModified: Date.now(),
        lastCommit: "Initial commit",
        size: new Blob([fileContent]).size
      };
      LocalStorageManager.saveFile(currentState.repository, filePath, fileData);
      currentState.files.push({
        name: fileName,
        type: "file",
        path: filePath,
        lastModified: fileData.lastModified,
        lastCommit: fileData.lastCommit
      });
      renderFileList();
      hideCreateFileModal();
      showSuccessMessage(`File "${fileName}" created successfully!`);
      LoadingProgress.hide();
    } catch (error) {
      LoadingProgress.hide();
      showErrorMessage("Failed to create file: " + error.message);
    }
  }, 1500);
}
function confirmDeleteFile() {
  deleteCurrentFile();
  hideDeleteFileModal();
}
function deleteCurrentFile() {
  if (!currentState.currentFile) return;
  LoadingProgress.show();
  setTimeout(() => {
    try {
      const filePath = (currentState.path ? currentState.path + "/" : "") + currentState.currentFile.name;
      LocalStorageManager.deleteFile(currentState.repository, filePath);
      currentState.files = currentState.files.filter(f => f.name !== currentState.currentFile.name);
      renderFileList();
      hideDeleteFileModal();
      showSuccessMessage(`File "${currentState.currentFile.name}" deleted successfully!`);
      LoadingProgress.hide();
      setTimeout(() => showExplorer(), 500);
    } catch (error) {
      LoadingProgress.hide();
      showErrorMessage("Failed to delete file: " + error.message);
    }
  }, 1500);
}
function downloadCurrentFile() {
  if (!currentState.currentFile) return;
  try {
    const filePath = (currentState.path ? currentState.path + "/" : "") + currentState.currentFile.name;
    const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
    if (fileData) {
      const blob = new Blob([fileData.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentState.currentFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccessMessage(`File "${currentState.currentFile.name}" downloaded successfully!`);
    }
  } catch (error) {
    showErrorMessage("Failed to download file: " + error.message);
  }
}
function previewFile() {
  if (!codeEditor || !currentState.currentFile) return;
  const content = codeEditor.getValue();
  const ext = currentState.currentFile.name.split(".").pop().toLowerCase();
  if (ext === "md" || ext === "markdown") {
    const previewWindow = window.open("", "_blank");
    previewWindow.document.write(`<!DOCTYPE html><html><head><title>Preview: ${currentState.currentFile.name}</title><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;line-height:1.6;background:#0d1117;color:#c9d1d9;}h1,h2,h3,h4,h5,h6{color:#58a6ff;}pre{background:#161b22;padding:12px;border-radius:8px;overflow:auto;}code{background:#161b22;padding:2px 4px;border-radius:4px;}a{color:#58a6ff;}</style></head><body>${marked.parse(content)}</body></html>`);
    previewWindow.document.close();
  } else {
    const previewWindow = window.open("", "_blank");
    previewWindow.document.write(`<!DOCTYPE html><html><head><title>Preview: ${currentState.currentFile.name}</title><meta charset="utf-8"><style>body{font-family:'JetBrains Mono',monospace;background:#0d1117;color:#c9d1d9;padding:24px;white-space:pre;}</style></head><body>${content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</body></html>`);
    previewWindow.document.close();
  }
}
function addTag() {
  const input = document.getElementById("tagInput");
  const tag = input.value.trim();
  if (tag && !currentState.selectedTags.includes(tag)) {
    currentState.selectedTags.push(tag);
    updateSelectedTags();
    input.value = "";
  }
}
function removeTag(tag) {
  currentState.selectedTags = currentState.selectedTags.filter(t => t !== tag);
  updateSelectedTags();
}
function viewFileFromContext(fileName) {
  hideContextMenu();
  viewFile(fileName);
}
function editFileFromContext(fileName) {
  hideContextMenu();
  currentState.currentFile = currentState.files.find(f => f.name === fileName);
  editFile();
}
function downloadFileFromContext(fileName) {
  hideContextMenu();
  currentState.currentFile = currentState.files.find(f => f.name === fileName);
  downloadCurrentFile();
}
function deleteFileFromContext(fileName) {
  hideContextMenu();
  currentState.currentFile = currentState.files.find(f => f.name === fileName);
  showDeleteFileModal();
}
function addToRecentFiles(fileName, repoName, filePath) {
  const existingIndex = recentFiles.findIndex(f => f.filePath === filePath && f.repoName === repoName);
  if (existingIndex !== -1) recentFiles.splice(existingIndex, 1);
  recentFiles.unshift({ fileName, repoName, filePath, timestamp: Date.now() });
  if (recentFiles.length > 10) recentFiles = recentFiles.slice(0, 10);
  localStorage.setItem("gitcodr_recent_files", JSON.stringify(recentFiles));
  updateRecentFilesUI();
}
function openRecentFile(repoName, filePath, fileName) {
  currentState.repository = repoName;
  const pathParts = filePath.split("/");
  if (pathParts.length > 1) currentState.path = pathParts.slice(0, -1).join("/");
  else currentState.path = "";
  LoadingProgress.show();
  setTimeout(() => {
    try {
      currentState.files = LocalStorageManager.listFiles(repoName, currentState.path ? currentState.path + "/" : "");
      renderFileList();
      updateBreadcrumb();
      const currentRepoName = document.getElementById("currentRepoName");
      const repoNameInViewer = document.getElementById("repoNameInViewer");
      const repoNameInEditor = document.getElementById("repoNameInEditor");
      if (currentRepoName) currentRepoName.textContent = repoName;
      if (repoNameInViewer) repoNameInViewer.textContent = repoName;
      if (repoNameInEditor) repoNameInEditor.textContent = repoName;
      viewFile(fileName);
      LoadingProgress.hide();
    } catch (error) {
      LoadingProgress.hide();
      showErrorMessage("Failed to open recent file: " + error.message);
    }
  }, 1500);
}
function viewFile(filename) {
  if (!currentState.repository) {
    showErrorMessage("No repository selected");
    return;
  }
  const file = currentState.files.find(f => f.name === filename);
  if (!file) {
    showErrorMessage(`File "${filename}" not found in current view`);
    return;
  }
  currentState.currentFile = file;
  LoadingProgress.show();
  LoadingSpinner.show();
  setTimeout(() => {
    try {
      const filePath = file.path || ((currentState.path ? currentState.path + "/" : "") + filename);
      const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
      if (!fileData) throw new Error(`File data not found for ${filePath}`);
      addToRecentFiles(filename, currentState.repository, filePath);
      if (window.coderViewEdit && typeof window.coderViewEdit.displayFile === "function") window.coderViewEdit.displayFile(filename, fileData);
      else displayFileContent(filename, fileData);
      showFileViewer();
      updateStats();
      LoadingProgress.hide();
      LoadingSpinner.hide();
    } catch (error) {
      LoadingProgress.hide();
      LoadingSpinner.hide();
      showErrorMessage("Failed to load file: " + error.message);
    }
  }, 1500);
}
function editFile() {
  if (!currentState.currentFile) return;
  LoadingSpinner.show();
  setTimeout(() => {
    try {
      const filePath = (currentState.path ? currentState.path + "/" : "") + currentState.currentFile.name;
      const fileData = LocalStorageManager.getFile(currentState.repository, filePath);
      if (fileData) {
        const editingFileName = document.getElementById("editingFileName");
        const commitTitle = document.getElementById("commitTitle");
        const fileCategoryInput = document.getElementById("fileCategoryInput");
        if (editingFileName) editingFileName.textContent = currentState.currentFile.name;
        if (commitTitle) commitTitle.value = `Update ${currentState.currentFile.name}`;
        if (window.coderViewEdit && typeof window.coderViewEdit.displayFile === "function") {
          window.coderViewEdit.displayFile(currentState.currentFile.name, fileData);
          setTimeout(() => {
            if (window.coderViewEdit.enterEditMode && typeof window.coderViewEdit.enterEditMode === "function") window.coderViewEdit.enterEditMode();
            else showFileViewer();
            LoadingSpinner.hide();
          }, 100);
        } else if (codeEditor) {
          codeEditor.setValue(fileData.content);
          updateEditorMode(codeEditor, currentState.currentFile.name);
          showFileEditor();
          LoadingSpinner.hide();
        }
        if (fileCategoryInput) fileCategoryInput.value = fileData.category || "";
        currentState.selectedTags = fileData.tags || [];
        updateSelectedTags();
      } else throw new Error("File not found");
    } catch (error) {
      LoadingSpinner.hide();
      showErrorMessage("Failed to load file for editing: " + error.message);
    }
  }, 1500);
}
function saveFile() {
  if (!currentState.currentFile) return;
  if (window.coderViewEdit && typeof window.coderViewEdit.saveChanges === "function") {
    window.coderViewEdit.saveChanges();
    return;
  }
  const commitTitle = document.getElementById("commitTitle");
  const commitDescription = document.getElementById("commitDescription");
  if (!commitTitle || !commitTitle.value.trim()) {
    showErrorMessage("Please enter a commit message");
    return;
  }
  LoadingProgress.show();
  setTimeout(() => {
    try {
      const filePath = (currentState.path ? currentState.path + "/" : "") + currentState.currentFile.name;
      const content = codeEditor ? codeEditor.getValue() : "";
      const fileCategoryInput = document.getElementById("fileCategoryInput");
      const fileData = {
        content: content,
        category: fileCategoryInput ? fileCategoryInput.value.trim() || "General" : "General",
        tags: currentState.selectedTags,
        lastModified: Date.now(),
        created: LocalStorageManager.getFile(currentState.repository, filePath)?.created || Date.now(),
        lastCommit: commitTitle.value.trim(),
        size: new Blob([content]).size
      };
      LocalStorageManager.saveFile(currentState.repository, filePath, fileData);
      const fileIndex = currentState.files.findIndex(f => f.name === currentState.currentFile.name);
      if (fileIndex !== -1) {
        currentState.files[fileIndex].lastModified = fileData.lastModified;
        currentState.files[fileIndex].lastCommit = fileData.lastCommit;
      }
      if (commitDescription) commitDescription.value = "";
      showSuccessMessage(`File "${currentState.currentFile.name}" saved successfully!`);
      setTimeout(() => {
        LoadingProgress.hide();
        viewFile(currentState.currentFile.name);
      }, 500);
    } catch (error) {
      LoadingProgress.hide();
      showErrorMessage("Failed to save file: " + error.message);
    }
  }, 1500);
}
function openRepository(repoName) {
  currentState.repository = repoName;
  currentState.path = "";
  LoadingProgress.show();
  setTimeout(() => {
    try {
      currentState.files = LocalStorageManager.listFiles(repoName, "");
      renderFileList();
      updateBreadcrumb();
      const currentRepoName = document.getElementById("currentRepoName");
      const repoNameInViewer = document.getElementById("repoNameInViewer");
      const repoNameInEditor = document.getElementById("repoNameInEditor");
      if (currentRepoName) currentRepoName.textContent = repoName;
      if (repoNameInViewer) repoNameInViewer.textContent = repoName;
      if (repoNameInEditor) repoNameInEditor.textContent = repoName;
      const repo = LocalStorageManager.getRepository(repoName);
      if (repo) {
        const repoDescription = document.getElementById("repoDescription");
        if (repoDescription) repoDescription.textContent = repo.description || "No description provided.";
      }
      showExplorer();
      updateStats();
      LoadingProgress.hide();
    } catch (error) {
      LoadingProgress.hide();
      showErrorMessage("Failed to open repository: " + error.message);
    }
  }, 1500);
}
function showCreateRepoModal() {
  const modal = document.getElementById("createRepoModal");
  if (modal) modal.classList.remove("hidden");
}
function hideCreateRepoModal() {
  const modal = document.getElementById("createRepoModal");
  if (modal) modal.classList.add("hidden");
}
function showCreateFileModal() {
  const modal = document.getElementById("createFileModal");
  if (modal) modal.classList.remove("hidden");
}
function hideCreateFileModal() {
  const modal = document.getElementById("createFileModal");
  if (modal) modal.classList.add("hidden");
}
function showDeleteFileModal() {
  const modal = document.getElementById("deleteFileModal");
  if (modal) modal.classList.remove("hidden");
}
function hideDeleteFileModal() {
  const modal = document.getElementById("deleteFileModal");
  if (modal) modal.classList.add("hidden");
}
function showExplorer() {
  const explorer = document.getElementById("explorerView");
  const repoSelector = document.getElementById("repoSelectorView");
  const coder = document.getElementById("coder");
  if (explorer) explorer.classList.remove("hidden");
  if (repoSelector) repoSelector.classList.add("hidden");
  if (coder) coder.classList.add("hidden");
}
function showFileViewer() {
  const explorer = document.getElementById("explorerView");
  const repoSelector = document.getElementById("repoSelectorView");
  const coder = document.getElementById("coder");
  if (explorer) explorer.classList.add("hidden");
  if (repoSelector) repoSelector.classList.add("hidden");
  if (coder) coder.classList.remove("hidden");
}
function initializeApp() {
  setupEventListeners(SidebarManager || null);
  setupCodeEditors();
  updateRecentFilesUI();
  LoadingProgress.show();
  setTimeout(() => {
    try {
      loadRepositories();
      showSuccessMessage("Welcome back");
      LoadingProgress.hide();
    } catch (error) {
      LoadingProgress.hide();
      console.error("Initialization error:", error);
    }
  }, 1500);
}
document.addEventListener("DOMContentLoaded", initializeApp);
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