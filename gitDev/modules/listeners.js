class EventListenersManager {
    constructor() {
        this.sidebarManager = null;
        this.currentState = window.currentState || {
            repository: null,
            branch: "main",
            path: "",
            currentFile: null,
            selectedTags: [],
            files: [],
            repositories: []
        };
    }
    init(sidebarManager) {
        this.sidebarManager = sidebarManager || null;
        this.setupAllEventListeners();
        this.setupGlobalEventDelegation();
    }
    setupAllEventListeners() {
        const actionHandlers = {
            "create-repo": () => this.handleCreateRepo(),
            "show-create-repo": () => this.handleShowCreateRepo(),
            "hide-create-repo-modal": () => this.handleHideCreateRepoModal(),
            "create-file": () => this.handleCreateFile(),
            "show-create-file": () => this.handleShowCreateFile(),
            "hide-create-file-modal": () => this.handleHideCreateFileModal(),
            "edit-file": () => this.handleEditFile(),
            "download-file": () => this.handleDownloadFile(),
            "delete-file": () => this.handleDeleteFile(),
            "preview-file": () => this.handlePreviewFile(),
            "show-repo-selector": () => this.handleShowRepoSelector(),
            "navigate-root": () => this.handleNavigateRoot(),
            "show-explorer": () => this.handleShowExplorer(),
            "show-file-viewer": () => this.handleShowFileViewer(),
            "star-repo": () => this.handleStarRepo(),
            "fork-repo": () => this.handleForkRepo(),
            "toggle-theme": () => this.handleToggleTheme(),
            "add-tag": () => this.handleAddTag(),
            "confirm-delete-file": () => this.handleConfirmDeleteFile(),
            "hide-delete-file-modal": () => this.handleHideDeleteFileModal()
        };
        Object.keys(actionHandlers).forEach(action => {
            document.querySelectorAll(`[data-action="${action}"]`).forEach(element => {
                element.addEventListener("click", e => {
                    e.preventDefault();
                    e.stopPropagation();
                    actionHandlers[action]();
                });
            });
        });
        this.setupKeyboardShortcuts();
        this.setupFormInteractions();
        this.setupModalInteractions();
        this.setupAdditionalListeners();
    }
    handleCreateRepo() {
        if (window.createRepository && typeof window.createRepository === "function") window.createRepository();
    }
    handleShowCreateRepo() {
        if (window.showCreateRepoModal && typeof window.showCreateRepoModal === "function") window.showCreateRepoModal();
    }
    handleHideCreateRepoModal() {
        if (window.hideCreateRepoModal && typeof window.hideCreateRepoModal === "function") window.hideCreateRepoModal();
    }
    handleCreateFile() {
        if (window.createFile && typeof window.createFile === "function") window.createFile();
    }
    handleShowCreateFile() {
        if (window.showCreateFileModal && typeof window.showCreateFileModal === "function") window.showCreateFileModal();
    }
    handleHideCreateFileModal() {
        if (window.hideCreateFileModal && typeof window.hideCreateFileModal === "function") window.hideCreateFileModal();
    }
    handleEditFile() {
        if (window.editFile && typeof window.editFile === "function") window.editFile();
        else this.handleShowFileViewer();
    }
    handleDownloadFile() {
        if (window.downloadCurrentFile && typeof window.downloadCurrentFile === "function") window.downloadCurrentFile();
    }
    handleDeleteFile() {
        if (window.showDeleteFileModal && typeof window.showDeleteFileModal === "function") window.showDeleteFileModal();
    }
    handlePreviewFile() {
        if (window.previewFile && typeof window.previewFile === "function") window.previewFile();
    }
    handleShowRepoSelector() {
        if (window.showRepoSelector && typeof window.showRepoSelector === "function") window.showRepoSelector();
    }
    handleNavigateRoot() {
        if (window.navigateToRoot && typeof window.navigateToRoot === "function") window.navigateToRoot();
    }
    handleShowExplorer() {
        if (window.showExplorer && typeof window.showExplorer === "function") window.showExplorer();
    }
    handleShowFileViewer() {
        if (window.showFileViewer && typeof window.showFileViewer === "function") window.showFileViewer();
        else {
            const coder = document.getElementById("coder");
            const repoSelector = document.getElementById("repoSelectorView");
            const explorerView = document.getElementById("explorerView");
            if (coder) coder.classList.remove("hidden");
            if (repoSelector) repoSelector.classList.add("hidden");
            if (explorerView) explorerView.classList.add("hidden");
        }
    }
    handleStarRepo() {
        if (this.currentState.repository) this.showNotification(`Starred ${this.currentState.repository}`);
    }
    handleForkRepo() {
        if (this.currentState.repository) this.showNotification(`Forked ${this.currentState.repository}`);
    }
    handleToggleTheme() {
        if (window.coderViewEdit && typeof window.coderViewEdit.toggleTheme === "function") window.coderViewEdit.toggleTheme();
        else this.toggleThemeFallback();
    }
    handleAddTag() {
        if (window.addTag && typeof window.addTag === "function") window.addTag();
    }
    handleConfirmDeleteFile() {
        if (window.confirmDeleteFile && typeof window.confirmDeleteFile === "function") window.confirmDeleteFile();
    }
    handleHideDeleteFileModal() {
        if (window.hideDeleteFileModal && typeof window.hideDeleteFileModal === "function") window.hideDeleteFileModal();
    }
    toggleThemeFallback() {
        const html = document.documentElement;
        const themeIcons = document.querySelectorAll("#themeIcon, #sidebarThemeIcon");
        const isDarkTheme = html.getAttribute("data-theme") === "dark";
        if (isDarkTheme) {
            html.setAttribute("data-theme", "light");
            themeIcons.forEach(icon => icon.className = "fas fa-sun");
        } else {
            html.setAttribute("data-theme", "dark");
            themeIcons.forEach(icon => icon.className = "fas fa-moon");
        }
        localStorage.setItem("gitcodr_theme", isDarkTheme ? "light" : "dark");
    }
    setupKeyboardShortcuts() {
        document.addEventListener("keydown", e => {
            if (e.key === "Escape") {
                this.handleHideCreateRepoModal();
                this.handleHideCreateFileModal();
                this.handleHideDeleteFileModal();
                if (window.hideContextMenu && typeof window.hideContextMenu === "function") window.hideContextMenu();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "n" && !e.shiftKey) {
                e.preventDefault();
                this.handleShowCreateFile();
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "n") {
                e.preventDefault();
                this.handleShowCreateRepo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                if (window.saveFile && typeof window.saveFile === "function") window.saveFile();
            }
        });
    }
    setupFormInteractions() {
        const tagInput = document.getElementById("tagInput");
        if (tagInput) {
            tagInput.addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.handleAddTag();
                }
            });
        }
        const newFileName = document.getElementById("newFileName");
        if (newFileName) newFileName.addEventListener("focus", () => newFileName.select());
        const newRepoName = document.getElementById("newRepoName");
        if (newRepoName) newRepoName.addEventListener("focus", () => newRepoName.select());
    }
    setupModalInteractions() {
        const createRepoModal = document.getElementById("createRepoModal");
        if (createRepoModal) {
            createRepoModal.addEventListener("click", e => {
                if (e.target === createRepoModal) this.handleHideCreateRepoModal();
            });
        }
        const createFileModal = document.getElementById("createFileModal");
        if (createFileModal) {
            createFileModal.addEventListener("click", e => {
                if (e.target === createFileModal) this.handleHideCreateFileModal();
            });
        }
        const deleteFileModal = document.getElementById("deleteFileModal");
        if (deleteFileModal) {
            deleteFileModal.addEventListener("click", e => {
                if (e.target === deleteFileModal) this.handleHideDeleteFileModal();
            });
        }
    }
    setupAdditionalListeners() {
        const branchSelector = document.getElementById("branchSelector");
        if (branchSelector) {
            branchSelector.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();
                const branchDropdown = document.getElementById("branchDropdown");
                if (branchDropdown) branchDropdown.classList.toggle("hidden");
            });
        }
        document.addEventListener("click", e => {
            const branchDropdown = document.getElementById("branchDropdown");
            if (branchDropdown && !branchDropdown.contains(e.target) && e.target !== branchSelector) branchDropdown.classList.add("hidden");
        });
        const leftSidebarTrigger = document.getElementById("leftSidebarTrigger");
        if (leftSidebarTrigger) {
            leftSidebarTrigger.addEventListener("click", e => {
                e.stopPropagation();
                if (this.sidebarManager && this.sidebarManager.toggleLeftSidebar && typeof this.sidebarManager.toggleLeftSidebar === "function") this.sidebarManager.toggleLeftSidebar();
            });
        }
        const rightSidebarTrigger = document.getElementById("rightSidebarTrigger");
        if (rightSidebarTrigger) {
            rightSidebarTrigger.addEventListener("click", e => {
                e.stopPropagation();
                if (this.sidebarManager && this.sidebarManager.toggleRightSidebar && typeof this.sidebarManager.toggleRightSidebar === "function") this.sidebarManager.toggleRightSidebar();
            });
        }
        const overlay = document.getElementById("overlay");
        if (overlay) {
            overlay.addEventListener("click", () => {
                if (!this.sidebarManager) return;
                if (this.sidebarManager.closeLeftSidebar && typeof this.sidebarManager.closeLeftSidebar === "function") this.sidebarManager.closeLeftSidebar();
                if (this.sidebarManager.closeRightSidebar && typeof this.sidebarManager.closeRightSidebar === "function") this.sidebarManager.closeRightSidebar();
            });
        }
    }
    setupGlobalEventDelegation() {
        document.addEventListener("click", e => {
            const repoCard = e.target.closest(".bg-github-canvas-overlay.border");
            if (repoCard && repoCard.querySelector("h3.text-github-accent-fg")) {
                const repoName = repoCard.querySelector("h3").textContent;
                if (repoName && window.openRepository && typeof window.openRepository === "function") {
                    e.preventDefault();
                    window.openRepository(repoName);
                }
            }
            const repoItem = e.target.closest(".repo-item");
            if (repoItem) {
                const repoName = repoItem.querySelector("span:not(.text-github-fg-muted)")?.textContent;
                if (repoName && window.openRepository && typeof window.openRepository === "function") {
                    e.preventDefault();
                    window.openRepository(repoName);
                }
            }
            const recentFileItem = e.target.closest(".recent-file-item");
            if (recentFileItem) {
                const fileName = recentFileItem.querySelector(".text-github-fg-default")?.textContent;
                const repoName = recentFileItem.querySelector(".text-github-fg-muted")?.textContent;
                if (fileName && repoName && window.openRecentFile && typeof window.openRecentFile === "function") {
                    e.preventDefault();
                    window.openRecentFile(repoName, "", fileName);
                }
            }
            const fileRow = e.target.closest("tbody tr");
            if (fileRow && fileRow.parentElement.id === "fileListBody") {
                const fileName = fileRow.querySelector("td:first-child span")?.textContent;
                if (fileName && window.viewFile && typeof window.viewFile === "function") {
                    e.preventDefault();
                    window.viewFile(fileName);
                }
            }
            const breadcrumbLink = e.target.closest("#pathBreadcrumb a");
            if (breadcrumbLink) {
                e.preventDefault();
                const text = breadcrumbLink.textContent;
                if (text === "Repositories" && window.showRepoSelector && typeof window.showRepoSelector === "function") window.showRepoSelector();
                else if (text === this.currentState.repository && window.navigateToRoot && typeof window.navigateToRoot === "function") window.navigateToRoot();
            }
            const editBtn = e.target.closest("#editToggleBtn, .edit-btn");
            if (editBtn && window.coderViewEdit && typeof window.coderViewEdit.enterEditMode === "function") {
                e.preventDefault();
                window.coderViewEdit.enterEditMode();
            }
            const saveBtn = e.target.closest("#saveChangesBtn, .commit-btn");
            if (saveBtn && window.coderViewEdit && typeof window.coderViewEdit.saveChanges === "function") {
                e.preventDefault();
                window.coderViewEdit.saveChanges();
            }
            const cancelBtn = e.target.closest("#cancelEditBtn, .cancel-btn");
            if (cancelBtn && window.coderViewEdit && typeof window.coderViewEdit.cancelEdit === "function") {
                e.preventDefault();
                window.coderViewEdit.cancelEdit();
            }
        });
        document.addEventListener("click", () => {
            if (window.hideContextMenu && typeof window.hideContextMenu === "function") window.hideContextMenu();
        });
    }
    showNotification(message) {
        const notification = document.createElement("div");
        notification.className = "fixed top-4 right-4 bg-github-canvas-overlay border border-github-border-default rounded-lg p-4 shadow-lg z-50 animate-slide-down";
        notification.innerHTML = `<div class="flex items-center space-x-3"><svg class="w-5 h-5 text-github-success-fg" fill="currentColor" viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg><span class="text-github-fg-default text-sm">${message}</span></div>`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = "fadeOut 0.3s ease-in";
            setTimeout(() => {
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 300);
        }, 3000);
    }
}
window.EventListenersManager = EventListenersManager;
window.eventListeners = new EventListenersManager();
window.setupEventListeners = sidebarManager => window.eventListeners.init(sidebarManager);
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