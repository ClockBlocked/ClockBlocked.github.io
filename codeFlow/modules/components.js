// UI Components Manager
class Components {
    constructor() {
        this.toastQueue = [];
        this.isShowingToast = false;
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = { id: Date.now(), message: message, type: type, duration: duration };
        this.toastQueue.push(toast);
        this.processToastQueue();
    }

    processToastQueue() {
        if (this.isShowingToast || this.toastQueue.length === 0) return;
        this.isShowingToast = true;
        const toast = this.toastQueue.shift();
        this.displayToast(toast);
    }

    displayToast(toast) {
        const container = document.getElementById('toast-container');
        if (!container) { this.isShowingToast = false; this.processToastQueue(); return; }
        const toastElement = document.createElement('div');
        toastElement.className = `toast toast-${toast.type}`;
        toastElement.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${this.getToastTitle(toast.type)}</div>
                <div class="toast-message">${toast.message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(toastElement);
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.style.opacity = '0';
                toastElement.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toastElement.parentNode) toastElement.parentNode.removeChild(toastElement);
                    this.isShowingToast = false;
                    this.processToastQueue();
                }, 300);
            } else { this.isShowingToast = false; this.processToastQueue(); }
        }, toast.duration);
    }

    getToastTitle(type) {
        const titles = { 'success': 'Success', 'error': 'Error', 'warning': 'Warning', 'info': 'Info' };
        return titles[type] || 'Notification';
    }

    showModal(options) {
        return new Promise((resolve) => {
            const { title, content, confirmText = 'Confirm', cancelText = 'Cancel', showCancel = true, size = 'md' } = options;
            this.closeModal();
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            modalOverlay.id = 'modal-overlay';
            const modalSizeClass = `modal-${size}`;
            modalOverlay.innerHTML = `
                <div class="modal ${modalSizeClass}">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="components.closeModal()"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">${content}</div>
                    <div class="modal-footer">
                        ${showCancel ? `<button class="btn btn-secondary" id="modal-cancel">${cancelText}</button>` : ''}
                        <button class="btn btn-primary" id="modal-confirm">${confirmText}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalOverlay);
            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');
            if (confirmBtn) confirmBtn.addEventListener('click', () => { this.closeModal(); resolve(true); });
            if (cancelBtn) cancelBtn.addEventListener('click', () => { this.closeModal(); resolve(false); });
            const closeOnEscape = (e) => { if (e.key === 'Escape') { this.closeModal(); resolve(false); document.removeEventListener('keydown', closeOnEscape); } };
            document.addEventListener('keydown', closeOnEscape);
            modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) { this.closeModal(); resolve(false); } });
            setTimeout(() => { const input = modalOverlay.querySelector('input'); if (input) input.focus(); }, 100);
        });
    }

    closeModal() {
        const existingModal = document.getElementById('modal-overlay');
        if (existingModal) existingModal.remove();
    }

    showConfirm(options) {
        return new Promise((resolve) => {
            this.showModal({ ...options, onConfirm: () => resolve(true), onCancel: () => resolve(false) });
        });
    }

    showLoadingOverlay(message = 'Loading...') {
        this.closeLoadingOverlay();
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    closeLoadingOverlay() {
        const existingOverlay = document.getElementById('loading-overlay');
        if (existingOverlay) existingOverlay.remove();
    }

    // Dropdown Component
    createDropdown(buttonId, dropdownId, items) {
        const button = document.getElementById(buttonId);
        const dropdown = document.getElementById(dropdownId);

        if (!button || !dropdown) return;

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Add items to dropdown
        items.forEach(item => {
            const itemElement = document.createElement('a');
            itemElement.href = item.href || '#';
            itemElement.className = 'dropdown-item';
            itemElement.innerHTML = `
                ${item.icon ? `<i class="${item.icon}"></i>` : ''}
                <span>${item.text}</span>
            `;
            
            if (item.onClick) {
                itemElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    item.onClick();
                    dropdown.classList.add('hidden');
                });
            }

            dropdown.appendChild(itemElement);
        });
    }

    // Tabs Component
    createTabs(containerId, tabs, activeIndex = 0) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'tabs';

        const contentContainer = document.createElement('div');
        contentContainer.className = 'tabs-content';

        tabs.forEach((tab, index) => {
            // Create tab button
            const tabButton = document.createElement('button');
            tabButton.className = `tab-button ${index === activeIndex ? 'active' : ''}`;
            tabButton.textContent = tab.title;
            tabButton.addEventListener('click', () => {
                // Update active tab
                tabsContainer.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                tabButton.classList.add('active');

                // Update content
                contentContainer.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.add('hidden');
                });
                contentContainer.children[index].classList.remove('hidden');
            });

            tabsContainer.appendChild(tabButton);

            // Create tab content
            const tabContent = document.createElement('div');
            tabContent.className = `tab-pane ${index === activeIndex ? '' : 'hidden'}`;
            tabContent.innerHTML = tab.content;

            contentContainer.appendChild(tabContent);
        });

        container.innerHTML = '';
        container.appendChild(tabsContainer);
        container.appendChild(contentContainer);
    }

    // Progress Bar
    updateProgressBar(progress) {
        let progressBar = document.getElementById('app-progress-bar');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'app-progress-bar';
            progressBar.className = 'progress-bar';
            document.body.appendChild(progressBar);
        }

        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            setTimeout(() => {
                progressBar.style.width = '0';
            }, 300);
        }
    }

    // Tooltip System
    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = tooltipText;
                
                document.body.appendChild(tooltip);
                
                // Position tooltip
                const rect = element.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
                tooltip.style.left = (rect.left + (rect.width - tooltip.offsetWidth) / 2) + 'px';
                
                element._tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', () => {
                if (element._tooltip) {
                    element._tooltip.remove();
                    delete element._tooltip;
                }
            });
        });
    }

    // File Upload Component
    createFileUpload(options) {
        const {
            containerId,
            accept = '*',
            multiple = false,
            onUpload
        } = options;

        const container = document.getElementById(containerId);
        if (!container) return;

        const uploadArea = document.createElement('div');
        uploadArea.className = 'file-upload-area';
        uploadArea.innerHTML = `
            <input type="file" id="file-input" 
                   accept="${accept}" 
                   ${multiple ? 'multiple' : ''} 
                   style="display: none;">
            <div class="upload-content">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop files here or click to browse</p>
                <button class="btn btn-secondary" onclick="document.getElementById('file-input').click()">
                    Browse Files
                </button>
            </div>
            <div class="upload-progress hidden">
                <div class="progress-bar"></div>
                <div class="progress-text">Uploading...</div>
            </div>
        `;

        container.appendChild(uploadArea);

        const fileInput = document.getElementById('file-input');
        if (!fileInput) return;

        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (onUpload) {
                onUpload(files);
            }
        });

        // Handle drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            if (onUpload) {
                onUpload(files);
            }
        });
    }

    // Tag Input Component
    createTagInput(containerId, initialTags = []) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tagInput = document.createElement('div');
        tagInput.className = 'tag-input';
        tagInput.innerHTML = `
            <div class="tags-container">
                ${initialTags.map(tag => `
                    <span class="tag">
                        ${tag}
                        <button class="tag-remove" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </span>
                `).join('')}
                <input type="text" class="tag-input-field" placeholder="Add a tag...">
            </div>
        `;

        container.appendChild(tagInput);

        const inputField = tagInput.querySelector('.tag-input-field');
        const tagsContainer = tagInput.querySelector('.tags-container');

        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && inputField.value.trim()) {
                e.preventDefault();
                this.addTag(inputField.value.trim(), tagsContainer);
                inputField.value = '';
            } else if (e.key === 'Backspace' && !inputField.value && tagsContainer.lastChild.previousSibling) {
                tagsContainer.lastChild.previousSibling.remove();
            }
        });

        inputField.addEventListener('blur', () => {
            if (inputField.value.trim()) {
                this.addTag(inputField.value.trim(), tagsContainer);
                inputField.value = '';
            }
        });
    }

    addTag(tagText, container) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `
            ${tagText}
            <button class="tag-remove" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.insertBefore(tag, container.lastChild);
    }

    // Search Component
    createSearch(containerId, options) {
        const {
            placeholder = 'Search...',
            onSearch,
            debounceDelay = 300
        } = options;

        const container = document.getElementById(containerId);
        if (!container) return;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <i class="fas fa-search search-icon"></i>
            <input type="text" class="search-input" placeholder="${placeholder}">
            <button class="search-clear hidden">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(searchContainer);

        const input = searchContainer.querySelector('.search-input');
        const clearBtn = searchContainer.querySelector('.search-clear');

        let debounceTimer;

        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            
            debounceTimer = setTimeout(() => {
                if (onSearch) {
                    onSearch(e.target.value);
                }
            }, debounceDelay);

            // Show/hide clear button
            if (e.target.value) {
                clearBtn.classList.remove('hidden');
            } else {
                clearBtn.classList.add('hidden');
            }
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.classList.add('hidden');
            if (onSearch) {
                onSearch('');
            }
            input.focus();
        });
    }

    // Pagination Component
    createPagination(containerId, options) {
        const {
            currentPage = 1,
            totalPages = 1,
            onPageChange
        } = options;

        const container = document.getElementById(containerId);
        if (!container) return;

        const pagination = document.createElement('div');
        pagination.className = 'pagination';

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1 && onPageChange) {
                onPageChange(currentPage - 1);
            }
        });
        pagination.appendChild(prevButton);

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            const firstButton = document.createElement('button');
            firstButton.className = 'pagination-btn';
            firstButton.textContent = '1';
            firstButton.addEventListener('click', () => {
                if (onPageChange) onPageChange(1);
            });
            pagination.appendChild(firstButton);

            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                if (onPageChange) onPageChange(i);
            });
            pagination.appendChild(pageButton);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }

            const lastButton = document.createElement('button');
            lastButton.className = 'pagination-btn';
            lastButton.textContent = totalPages;
            lastButton.addEventListener('click', () => {
                if (onPageChange) onPageChange(totalPages);
            });
            pagination.appendChild(lastButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages && onPageChange) {
                onPageChange(currentPage + 1);
            }
        });
        pagination.appendChild(nextButton);

        container.appendChild(pagination);
    }

    // Sortable List
    createSortableList(containerId, items, onSort) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        container.className = 'sortable-list';

        let draggedItem = null;

        items.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'sortable-item';
            listItem.draggable = true;
            listItem.dataset.index = index;
            listItem.innerHTML = `
                <div class="sortable-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="sortable-content">
                    ${item}
                </div>
            `;

            listItem.addEventListener('dragstart', (e) => {
                draggedItem = listItem;
                listItem.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            listItem.addEventListener('dragend', () => {
                listItem.classList.remove('dragging');
                draggedItem = null;
            });

            listItem.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            listItem.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem && draggedItem !== listItem) {
                    const fromIndex = parseInt(draggedItem.dataset.index);
                    const toIndex = parseInt(listItem.dataset.index);
                    
                    // Reorder items
                    const [movedItem] = items.splice(fromIndex, 1);
                    items.splice(toIndex, 0, movedItem);
                    
                    // Update UI
                    this.createSortableList(containerId, items, onSort);
                    
                    // Callback
                    if (onSort) {
                        onSort(items);
                    }
                }
            });

            container.appendChild(listItem);
        });
    }
}



