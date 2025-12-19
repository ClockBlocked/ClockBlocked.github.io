class ModalService {
  constructor() {
    this.activeModal = null;
    this.contextMenuId = "contextMenu";
  }
  setActive(name) {
    this.activeModal = name;
  }
  clearActive(name) {
    if (!name || this.activeModal === name) this.activeModal = null;
  }
  context = {
    show: (x, y, fileName, fileType) => {
      this.context.hide();
      const menu = document.createElement("div");
      menu.id = this.contextMenuId;
      menu.className = "fixed bg-github-canvas-overlay border border-github-border-default rounded-lg shadow-2xl py-2 z-50 min-w-[180px]";
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      let html = `<button onclick="window.viewFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-8.5A1.75 1.75 0 0 0 14.25 2H1.75ZM14.5 4.56 8 8.651 1.5 4.56V3.75c0-.138.112-.25.25-.25h12.5c.138 0 .25.112.25.25v.81ZM1.5 6.06l6.128 3.884a.75.75 0 0 0 .744 0L14.5 6.06v6.19c0 .138-.112.25-.25.25H1.75a.25.25 0 0 1-.25-.25V6.06Z"></path></svg><span>Open</span></button>`;
      if (fileType === "file") {
        html += `<button onclick="window.editFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61a1.75 1.75 0 0 1-.757.437l-3.26.88a.75.75 0 0 1-.918-.918l.88-3.26a1.75 1.75 0 0 1 .437-.757l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L11.26 3.3l1.44 1.44 1.113-1.113a.25.25 0 0 0 0-.354l-1.086-1.086Z"></path></svg><span>Edit</span></button>`;
        html += `<button onclick="window.downloadFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14H2.75Zm3.5-5.75a.75.75 0 0 1 1.5 0v-6.5a.75.75 0 0 1 1.5 0v6.5a.75.75 0 0 1 1.5 0l-2.25 2.5a.75.75 0 0 1-1.06 0l-2.24-2.5Z"></path></svg><span>Download</span></button>`;
        html += `<button onclick="window.previewFile && window.previewFile()" class="w-full text-left px-4 py-2 text-sm text-github-fg-default hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1.173 8.335c.15-.26.376-.594.663-.97C2.51 6.26 4.345 4 8 4s5.49 2.26 6.164 3.365c.287.376.513.71.663.97a.75.75 0 0 1 0 .67c-.15.26-.376.594-.663.97C13.49 9.74 11.655 12 8 12s-5.49-2.26-6.164-3.365a7.53 7.53 0 0 1-.663-.97.75.75 0 0 1 0-.67Zm1.327.165a6.06 6.06 0 0 0 .433.61C3.51 10.24 5.095 11.5 8 11.5s4.49-1.26 5.067-2.39a6.066 6.066 0 0 0 .433-.61 6.066 6.066 0 0 0-.433-.61C12.49 7.76 10.905 6.5 8 6.5s-4.49 1.26-5.067 2.39a6.06 6.06 0 0 0-.433.61ZM8 9.75a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm0-1.5a.25.25 0 1 0 0-.5.25.25 0 0 0 0 .5Z"></path></svg><span>Preview</span></button>`;
      }
      html += `<div class="border-t border-github-border-muted my-1"></div><button onclick="window.deleteFileFromContext('${fileName}')" class="w-full text-left px-4 py-2 text-sm text-github-danger-fg hover:bg-github-canvas-subtle flex items-center space-x-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M6.5 1a1.5 1.5 0 0 0-1.415 1H3.75a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-1.335A1.5 1.5 0 0 0 9.5 1h-3Zm-.25 4.75a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75Zm3.5 0a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75Z"></path><path d="M3.757 5.533a.75.75 0 0 1 .698-.533h7.09a.75.75 0 0 1 .698.533l1.219 4.5a2.25 2.25 0 0 1-2.178 2.842H4.716a2.25 2.25 0 0 1-2.178-2.842l1.219-4.5ZM5.342 6.5 4.31 10.25a.75.75 0 0 0 .727.95h6.157a.75.75 0 0 0 .727-.95L10.658 6.5H5.342Z"></path></svg><span>Delete</span></button>`;
      menu.innerHTML = html;
      document.body.appendChild(menu);
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) menu.style.left = `${x - rect.width}px`;
      if (rect.bottom > window.innerHeight) menu.style.top = `${y - rect.height}px`;
      this.setActive(this.contextMenuId);
    },
    hide: () => {
      const menu = document.getElementById(this.contextMenuId);
      if (menu) menu.remove();
      this.clearActive(this.contextMenuId);
    }
  };
  repository = {
    showCreate: () => {
      const modal = document.getElementById("createRepoModal");
      if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        const nameInput = document.getElementById("newRepoName");
        if (nameInput) nameInput.focus();
        this.setActive("createRepoModal");
      }
    },
    hideCreate: () => {
      const modal = document.getElementById("createRepoModal");
      if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        const nameInput = document.getElementById("newRepoName");
        const descInput = document.getElementById("repoDescriptionInput");
        const visibilityPublic = document.getElementById("visibilityPublic");
        const initReadme = document.getElementById("initReadme");
        if (nameInput) nameInput.value = "";
        if (descInput) descInput.value = "";
        if (visibilityPublic) visibilityPublic.checked = true;
        if (initReadme) initReadme.checked = true;
        this.clearActive("createRepoModal");
      }
    }
  };
  file = {
    showCreate: () => {
      const modal = document.getElementById("createFileModal");
      if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        const pathPrefix = document.getElementById("currentPathPrefix");
        if (pathPrefix) pathPrefix.textContent = window.currentState.repository + (window.currentState.path ? "/" + window.currentState.path : "") + "/";
        const nameInput = document.getElementById("newFileName");
        if (nameInput) nameInput.focus();
        this.setActive("createFileModal");
      }
    },
    hideCreate: () => {
      const modal = document.getElementById("createFileModal");
      if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        const nameInput = document.getElementById("newFileName");
        const categoryInput = document.getElementById("fileCategoryInput");
        const tagInput = document.getElementById("tagInput");
        if (nameInput) nameInput.value = "";
        if (categoryInput) categoryInput.value = "";
        if (tagInput) tagInput.value = "";
        if (window.initialContentEditor) window.initialContentEditor.setValue("");
        window.currentState.selectedTags = [];
        if (typeof window.updateSelectedTags === "function") window.updateSelectedTags();
        this.clearActive("createFileModal");
      }
    },
    showDelete: () => {
      if (!window.currentState.currentFile) return;
      const nameLabel = document.getElementById("fileToDeleteName");
      if (nameLabel) nameLabel.textContent = window.currentState.currentFile.name;
      const modal = document.getElementById("deleteFileModal");
      if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        this.setActive("deleteFileModal");
      }
    },
    hideDelete: () => {
      const modal = document.getElementById("deleteFileModal");
      if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        this.clearActive("deleteFileModal");
      }
    }
  };
  loading = {
    show: (text = "Loading...") => {
      const overlay = document.getElementById("loadingOverlay");
      const loadingText = document.getElementById("loadingText");
      if (typeof window.LoadingProgress !== "undefined") window.LoadingProgress.show();
      if (overlay && loadingText) {
        loadingText.textContent = text;
        overlay.classList.remove("hidden");
        overlay.style.display = "flex";
      }
      this.setActive("loadingOverlay");
    },
    hide: () => {
      const overlay = document.getElementById("loadingOverlay");
      if (typeof window.LoadingProgress !== "undefined") window.LoadingProgress.hide();
      if (overlay) {
        overlay.classList.add("hidden");
        overlay.style.display = "none";
      }
      this.clearActive("loadingOverlay");
    }
  };
  notification = {
    success: message => {
      const notification = document.createElement("div");
      notification.className = "fixed top-4 right-4 bg-github-success-fg text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-down";
      notification.innerHTML = `<div class="flex items-center space-x-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 .018-1.042.75.75 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg><span>${message}</span></div>`;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = "fadeOut 0.3s ease-in";
        setTimeout(() => notification.parentNode && notification.parentNode.removeChild(notification), 300);
      }, 3000);
    },
    error: message => {
      const notification = document.createElement("div");
      notification.className = "fixed top-4 right-4 bg-github-danger-fg text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-down";
      notification.dataset.notify = "error";
      notification.innerHTML = `<div class="flex items-center space-x-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16ZM7.25 4.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-1.5 0Zm.75 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path></svg><span>${message}</span></div>`;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = "fadeOut 0.5s ease-in";
        setTimeout(() => notification.parentNode && notification.parentNode.removeChild(notification), 300);
      }, 5000);
    }
  };
}
class DropdownService {
  constructor(modalService) {
    this.modalService = modalService;
    this.currentFile = null;
    this.currentPopover = null;
    this.file = {
      showMenu: (fileName, event) => this.showFileMenu(fileName, event),
      preview: fileName => this.previewFile(fileName),
      edit: fileName => this.editFileAction(fileName),
      download: fileName => this.downloadFile(fileName),
      duplicate: fileName => this.duplicateFile(fileName),
      rename: fileName => this.renameFile(fileName),
      move: fileName => this.moveFile(fileName),
      properties: fileName => this.fileProperties(fileName),
      delete: fileName => this.deleteFileAction(fileName),
      closePreview: () => this.closePreviewModal(),
      closeProps: () => this.closePropsModal()
    };
  }
  showFileMenu(fileName, event) {
    event.stopPropagation();
    event.preventDefault();
    this.closePopover();
    const buttonElement = event.currentTarget;
    const file = window.currentState.files.find(f => f.name === fileName);
    if (!file) return;
    this.currentFile = file;
    const popover = this.createPopover(file);
    document.body.appendChild(popover);
    this.positionPopover(popover, buttonElement);
    setTimeout(() => {
      popover.classList.add("show");
    }, 10);
    this.currentPopover = popover;
    setTimeout(() => {
      document.addEventListener("click", this.handleOutsideClick.bind(this), {
        once: true
      });
    }, 100);
  }
  createPopover(file) {
    const isFile = file.type === "file";
    const popover = document.createElement("div");
    popover.className = "file-menu-popover";
    popover.innerHTML = `
      <div class="file-menu-header">
        <i class="fas fa-file-code"></i>
        <span>${file.name}</span>
      </div>
      <div class="file-menu-divider"></div>
      <div class="file-menu-items">
        ${isFile ? `
          <button class="file-menu-item" onclick="window.dropdown.file.preview('${file.name}')">
            <i class="fas fa-eye"></i>
            <span>Preview</span>
            <span class="file-menu-shortcut">Ctrl+P</span>
          </button>
          <button class="file-menu-item" onclick="window.dropdown.file.edit('${file.name}')">
            <i class="fas fa-edit"></i>
            <span>Edit</span>
            <span class="file-menu-shortcut">Ctrl+E</span>
          </button>
          <button class="file-menu-item" onclick="window.dropdown.file.download('${file.name}')">
            <i class="fas fa-download"></i>
            <span>Download</span>
            <span class="file-menu-shortcut">Ctrl+D</span>
          </button>
          <div class="file-menu-divider"></div>
          <button class="file-menu-item" onclick="window.dropdown.file.duplicate('${file.name}')">
            <i class="fas fa-copy"></i>
            <span>Duplicate</span>
          </button>
          <button class="file-menu-item" onclick="window.dropdown.file.rename('${file.name}')">
            <i class="fas fa-signature"></i>
            <span>Rename</span>
            <span class="file-menu-shortcut">F2</span>
          </button>
          <button class="file-menu-item" onclick="window.dropdown.file.move('${file.name}')">
            <i class="fas fa-folder-open"></i>
            <span>Move to...</span>
          </button>
          <div class="file-menu-divider"></div>
          <button class="file-menu-item" onclick="window.dropdown.file.properties('${file.name}')">
            <i class="fas fa-info-circle"></i>
            <span>Properties</span>
          </button>
          <div class="file-menu-divider"></div>
          <button class="file-menu-item danger" onclick="window.dropdown.file.delete('${file.name}')">
            <i class="fas fa-trash"></i>
            <span>Delete</span>
            <span class="file-menu-shortcut">Del</span>
          </button>
        ` : `
          <button class="file-menu-item" onclick="window.dropdown.file.openFolder('${file.name}')">
            <i class="fas fa-folder-open"></i>
            <span>Open Folder</span>
          </button>
          <button class="file-menu-item" onclick="window.dropdown.file.rename('${file.name}')">
            <i class="fas fa-signature"></i>
            <span>Rename</span>
          </button>
          <div class="file-menu-divider"></div>
          <button class="file-menu-item danger" onclick="window.dropdown.file.delete('${file.name}')">
            <i class="fas fa-trash"></i>
            <span>Delete Folder</span>
          </button>
        `}
      </div>
    `;
    return popover;
  }
  positionPopover(popover, triggerElement) {
    const rect = triggerElement.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    let top = rect.bottom + 5;
    let left = rect.right - popoverRect.width;
    if (top + popoverRect.height > window.innerHeight) top = rect.top - popoverRect.height - 5;
    if (left < 0) left = rect.left;
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  }
  closePopover() {
    if (this.currentPopover) {
      this.currentPopover.classList.remove("show");
      setTimeout(() => {
        if (this.currentPopover && this.currentPopover.parentNode) this.currentPopover.parentNode.removeChild(this.currentPopover);
        this.currentPopover = null;
      }, 200);
    }
  }
  handleOutsideClick(event) {
    if (this.currentPopover && !this.currentPopover.contains(event.target)) this.closePopover();
  }
  previewFile(fileName) {
    this.closePopover();
    const file = window.currentState.files.find(f => f.name === fileName);
    if (!file) return;
    const filePath = file.path || ((window.currentState.path ? window.currentState.path + "/" : "") + fileName);
    const fileData = window.LocalStorageManager.getFile(window.currentState.repository, filePath);
    if (!fileData) {
      if (typeof window.showErrorMessage === "function") window.showErrorMessage("File not found");
      return;
    }
    this.showPreviewModal(fileName, fileData);
  }
  showPreviewModal(fileName, fileData) {
    const ext = fileName.split(".").pop().toLowerCase();
    let previewContent = "";
    if (["md", "markdown"].includes(ext)) {
      previewContent = `<div class="markdown-preview">${this.renderMarkdown(fileData.content)}</div>`;
    } else if (["html"].includes(ext)) {
      const safe = fileData.content.replace(/"/g, """);
      previewContent = `<iframe srcdoc="${safe}" class="preview-iframe"></iframe>`;
    } else if (["json"].includes(ext)) {
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
            <button onclick="window.dropdown.file.closePreview()" class="text-github-fg-muted hover:text-github-fg-default">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <div class="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            ${previewContent}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.modalService.setActive("previewModal");
  }
  renderMarkdown(text) {
    return text
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/gim, "<em>$1</em>")
      .replace(/```([^`]+)```/gim, "<pre><code>$1</code></pre>")
      .replace(/`([^`]+)`/gim, "<code>$1</code>")
      .replace(/\n/g, "<br>");
  }
  editFileAction(fileName) {
    this.closePopover();
    window.currentState.currentFile = window.currentState.files.find(f => f.name === fileName);
    if (typeof window.editFile === "function") window.editFile();
  }
  downloadFile(fileName) {
    this.closePopover();
    window.currentState.currentFile = window.currentState.files.find(f => f.name === fileName);
    if (typeof window.downloadCurrentFile === "function") window.downloadCurrentFile();
  }
  duplicateFile(fileName) {
    this.closePopover();
    const file = window.currentState.files.find(f => f.name === fileName);
    if (!file) return;
    const filePath = file.path;
    const fileData = window.LocalStorageManager.getFile(window.currentState.repository, filePath);
    if (!fileData) {
      if (typeof window.showErrorMessage === "function") window.showErrorMessage("File not found");
      return;
    }
    const nameParts = fileName.split(".");
    const ext = nameParts.pop();
    const baseName = nameParts.join(".");
    const newFileName = `${baseName}_copy.${ext}`;
    const newFilePath = filePath.replace(fileName, newFileName);
    const newFileData = {
      ...fileData,
      created: Date.now(),
      lastModified: Date.now(),
      lastCommit: `Duplicate of ${fileName}`
    };
    window.LocalStorageManager.saveFile(window.currentState.repository, newFilePath, newFileData);
    window.currentState.files.push({
      name: newFileName,
      type: "file",
      path: newFilePath,
      lastModified: newFileData.lastModified,
      lastCommit: newFileData.lastCommit,
      size: newFileData.size
    });
    if (typeof window.renderFileList === "function") window.renderFileList();
    if (typeof window.showSuccessMessage === "function") window.showSuccessMessage(`File duplicated as "${newFileName}"`);
  }
  renameFile(fileName) {
    this.closePopover();
    const newName = prompt("Enter new name:", fileName);
    if (!newName || newName === fileName) return;
    const file = window.currentState.files.find(f => f.name === fileName);
    if (!file) return;
    const oldPath = file.path;
    const newPath = oldPath.replace(fileName, newName);
    const fileData = window.LocalStorageManager.getFile(window.currentState.repository, oldPath);
    if (!fileData) return;
    window.LocalStorageManager.saveFile(window.currentState.repository, newPath, {
      ...fileData,
      lastModified: Date.now(),
      lastCommit: `Rename ${fileName} to ${newName}`
    });
    window.LocalStorageManager.deleteFile(window.currentState.repository, oldPath);
    const fileIndex = window.currentState.files.findIndex(f => f.name === fileName);
    if (fileIndex !== -1) {
      window.currentState.files[fileIndex].name = newName;
      window.currentState.files[fileIndex].path = newPath;
    }
    if (typeof window.renderFileList === "function") window.renderFileList();
    if (typeof window.showSuccessMessage === "function") window.showSuccessMessage(`Renamed to "${newName}"`);
  }
  moveFile(fileName) {
    this.closePopover();
    if (typeof window.showErrorMessage === "function") window.showErrorMessage("Move feature coming soon!");
  }
  fileProperties(fileName) {
    this.closePopover();
    const file = window.currentState.files.find(f => f.name === fileName);
    if (!file) return;
    const filePath = file.path;
    const fileData = window.LocalStorageManager.getFile(window.currentState.repository, filePath);
    if (!fileData) return;
    const props = `
      <div class="space-y-3">
        <div><strong>Name:</strong> ${fileName}</div>
        <div><strong>Path:</strong> ${filePath}</div>
        <div><strong>Size:</strong> ${(fileData.size / 1024).toFixed(2)} KB</div>
        <div><strong>Category:</strong> ${fileData.category || "General"}</div>
        <div><strong>Tags:</strong> ${fileData.tags?.join(", ") || "None"}</div>
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
            <button onclick="window.dropdown.file.closeProps()" class="text-github-fg-muted hover:text-github-fg-default">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <div class="p-6 text-github-fg-default text-sm">
            ${props}
          </div>
          <div class="p-4 border-t border-github-border-default">
            <button onclick="window.dropdown.file.closeProps()" class="w-full bg-github-success-emphasis text-white px-4 py-2 rounded-lg hover:bg-github-success-fg">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.modalService.setActive("propsModal");
  }
  deleteFileAction(fileName) {
    this.closePopover();
    window.currentState.currentFile = window.currentState.files.find(f => f.name === fileName);
    if (typeof window.showDeleteFileModal === "function") window.showDeleteFileModal();
  }
  openFolder(folderName) {
    this.closePopover();
    const folder = window.currentState.files.find(f => f.name === folderName && f.type === "folder");
    if (!folder) return;
    if (typeof window.navigateToFolder === "function") window.navigateToFolder(folderName);
  }
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  closePreviewModal() {
    const modal = document.getElementById("previewModal");
    if (modal) modal.remove();
    this.modalService.clearActive("previewModal");
  }
  closePropsModal() {
    const modal = document.getElementById("propsModal");
    if (modal) modal.remove();
    this.modalService.clearActive("propsModal");
  }
}
const modal = new ModalService();
const dropdown = new DropdownService(modal);
window.modal = modal;
window.dropdown = dropdown;
window.showContextMenu = (x, y, fileName, fileType) => modal.context.show(x, y, fileName, fileType);
window.hideContextMenu = () => modal.context.hide();
window.showCreateRepoModal = () => modal.repository.showCreate();
window.hideCreateRepoModal = () => modal.repository.hideCreate();
window.showCreateFileModal = () => modal.file.showCreate();
window.hideCreateFileModal = () => modal.file.hideCreate();
window.showDeleteFileModal = () => modal.file.showDelete();
window.hideDeleteFileModal = () => modal.file.hideDelete();
window.showLoading = text => modal.loading.show(text);
window.hideLoading = () => modal.loading.hide();
window.showSuccessMessage = message => modal.notification.success(message);
window.showErrorMessage = message => modal.notification.error(message);
window.fileMenuManager = {
  showFileMenu: (fileName, event) => dropdown.file.showMenu(fileName, event),
  previewFile: fileName => dropdown.file.preview(fileName),
  editFileAction: fileName => dropdown.file.edit(fileName),
  downloadFile: fileName => dropdown.file.download(fileName),
  duplicateFile: fileName => dropdown.file.duplicate(fileName),
  renameFile: fileName => dropdown.file.rename(fileName),
  moveFile: fileName => dropdown.file.move(fileName),
  fileProperties: fileName => dropdown.file.properties(fileName),
  deleteFileAction: fileName => dropdown.file.delete(fileName)
};
window.closePreviewModal = () => dropdown.file.closePreview();
window.closePropsModal = () => dropdown.file.closeProps();