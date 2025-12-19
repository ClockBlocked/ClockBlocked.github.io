class EventListenersManager {
  constructor() {
    this.sidebarManager = null;
    this. currentState = window.currentState || { repository: null, branch: "main", path: "", currentFile: null, selectedTags: [], files: [], repositories: [] };
  }
  init(sidebarManager) {
    this. sidebarManager = sidebarManager || null;
    this. setupAllEventListeners();
    this.setupGlobalEventDelegation();
  }
  setupAllEventListeners() {
    const actionHandlers = {
      "create-repo": () => window.createRepository(),
      "show-create-repo":  () => window.showCreateRepoModal(),
      "hide-create-repo-modal": () => window.hideCreateRepoModal(),
      "create-file": () => window.createFile(),
      "show-create-file":  () => window.showCreateFileModal(),
      "hide-create-file-modal":  () => window.hideCreateFileModal(),
      "edit-file": () => window.editFile(),
      "download-file": () => window.downloadCurrentFile(),
      "delete-file": () => window.showDeleteFileModal(),
      "preview-file": () => window.previewFile(),
      "show-repo-selector": () => window.showRepoSelector(),
      "navigate-root": () => window.navigateToRoot(),
      "show-explorer": () => window.showExplorer(),
      "show-file-viewer": () => window.showFileViewer(),
      "star-repo": () => this.showNotification(`Starred ${this.currentState. repository}`),
      "fork-repo": () => this.showNotification(`Forked ${this.currentState. repository}`),
      "toggle-theme":  () => window.coderViewEdit && window.coderViewEdit.toggleTheme(),
      "add-tag": () => window.addTag(),
      "confirm-delete-file": () => window.confirmDeleteFile(),
      "hide-delete-file-modal": () => window.hideDeleteFileModal()
    };
    Object.keys(actionHandlers).forEach(action => {
      document.querySelectorAll(`[data-action="${action}"]`).forEach(element => {
        element.addEventListener("click", e => { e. preventDefault(); e.stopPropagation(); actionHandlers[action](); });
      });
    });
    this.setupKeyboardShortcuts();
    this.setupFormInteractions();
    this.setupModalInteractions();
    this.setupAdditionalListeners();
  }
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", e => {
      if (e. key === "Escape") {
        window.hideCreateRepoModal();
        window.hideCreateFileModal();
        window.hideDeleteFileModal();
        window.hideContextMenu();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n" && !e.shiftKey) { e.preventDefault(); window.showCreateFileModal(); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "n") { e.preventDefault(); window.showCreateRepoModal(); }
      if ((e.ctrlKey || e. metaKey) && e.key === "s") { e.preventDefault(); window.saveFile(); }
    });
  }
  setupFormInteractions() {
    const tagInput = document. getElementById("tagInput");
    if (tagInput) tagInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); window.addTag(); } });
    const newFileName = document.getElementById("newFileName");
    if (newFileName) newFileName.addEventListener("focus", () => newFileName.select());
    const newRepoName = document.getElementById("newRepoName");
    if (newRepoName) newRepoName.addEventListener("focus", () => newRepoName. select());
  }
  setupModalInteractions() {
    const createRepoModal = document.getElementById("createRepoModal");
    if (createRepoModal) createRepoModal.addEventListener("click", e => { if (e. target === createRepoModal) window.hideCreateRepoModal(); });
    const createFileModal = document. getElementById("createFileModal");
    if (createFileModal) createFileModal.addEventListener("click", e => { if (e.target === createFileModal) window.hideCreateFileModal(); });
    const deleteFileModal = document.getElementById("deleteFileModal");
    if (deleteFileModal) deleteFileModal.addEventListener("click", e => { if (e.target === deleteFileModal) window.hideDeleteFileModal(); });
  }
  setupAdditionalListeners() {
    const branchSelector = document.getElementById("branchSelector");
    if (branchSelector) {
      branchSelector.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); const branchDropdown = document. getElementById("branchDropdown"); if (branchDropdown) branchDropdown.classList.toggle("hidden"); });
    }
    document.addEventListener("click", e => { const branchDropdown = document.getElementById("branchDropdown"); if (branchDropdown && ! branchDropdown. contains(e.target) && e.target !== branchSelector) branchDropdown. classList.add("hidden"); });
    const leftSidebarTrigger = document. getElementById("leftSidebarTrigger");
    if (leftSidebarTrigger) leftSidebarTrigger. addEventListener("click", e => { e.stopPropagation(); if (this.sidebarManager && this.sidebarManager.toggleLeftSidebar) this.sidebarManager.toggleLeftSidebar(); });
    const rightSidebarTrigger = document.getElementById("rightSidebarTrigger");
    if (rightSidebarTrigger) rightSidebarTrigger.addEventListener("click", e => { e.stopPropagation(); if (this.sidebarManager && this. sidebarManager. toggleRightSidebar) this.sidebarManager.toggleRightSidebar(); });
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        if (! this.sidebarManager) return;
        if (this.sidebarManager.closeLeftSidebar) this.sidebarManager.closeLeftSidebar();
        if (this.sidebarManager.closeRightSidebar) this.sidebarManager.closeRightSidebar();
      });
    }
  }
  setupGlobalEventDelegation() {
    document.addEventListener("click", e => {
      const repoCard = e.target.closest(".repo-card");
      if (repoCard && repoCard.querySelector(".repo-title")) {
        const repoName = repoCard.querySelector(".repo-title").textContent;
        if (repoName) { e.preventDefault(); window.openRepository(repoName); }
      }
      const repoItem = e.target. closest(".repo-item");
      if (repoItem) {
        const repoName = repoItem.querySelector("span: not(. text-github-fg-muted)")?.textContent;
        if (repoName) { e.preventDefault(); window.openRepository(repoName); }
      }
      const recentFileItem = e.target. closest(".recent-file-item");
      if (recentFileItem) {
        const fileName = recentFileItem.querySelector(". text-github-fg-default")?.textContent;
        const repoName = recentFileItem.querySelector(".text-github-fg-muted")?.textContent;
        if (fileName && repoName) { e.preventDefault(); window.openRecentFile(repoName, "", fileName); }
      }
      const fileRow = e.target. closest("tbody tr");
      if (fileRow && fileRow.parentElement.id === "fileListBody") {
        const fileName = fileRow. querySelector("td:first-child span")?.textContent;
        if (fileName) { e.preventDefault(); window.viewFile(fileName); }
      }
      const breadcrumbLink = e.target. closest("#pathBreadcrumb a");
      if (breadcrumbLink) {
        e.preventDefault();
        const text = breadcrumbLink.textContent;
        if (text === "Repositories") window.showRepoSelector();
        else if (text === this.currentState.repository) window.navigateToRoot();
      }
      const editBtn = e.target. closest("#editToggleBtn, . edit-btn");
      if (editBtn) { e.preventDefault(); window.coderViewEdit && window.coderViewEdit.enterEditMode(); }
      const saveBtn = e.target.closest("#saveChangesBtn, .commit-btn");
      if (saveBtn) { e.preventDefault(); window.coderViewEdit && window.coderViewEdit.saveChanges(); }
      const cancelBtn = e.target.closest("#cancelEditBtn, .cancel-btn");
      if (cancelBtn) { e.preventDefault(); window.coderViewEdit && window.coderViewEdit.cancelEdit(); }
    });
    document.addEventListener("click", () => window.hideContextMenu());
  }
  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "fixed top-4 right-4 bg-github-canvas-overlay border border-github-border-default rounded-lg p-4 shadow-lg z-50 animate-slide-down";
    notification. innerHTML = `<div class="flex items-center space-x-3"><svg class="w-5 h-5 text-github-success-fg" fill="currentColor" viewBox="0 0 16 16"><path d="M13. 78 4.22a. 75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 . 018-1.042. 751.751 0 0 1 1.042-. 018L6 10.94l6. 72-6.72a. 75.75 0 0 1 1.06 0Z"/></svg><span class="text-github-fg-default">${message}</span></div>`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = "fadeOut 0.3s ease-in";
      setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
    }, 3000);
  }
}

window.EventListenersManager = EventListenersManager;
window.eventListeners = new EventListenersManager();
window.setupEventListeners = sidebarManager => window.eventListeners. init(sidebarManager);