// ===== GitHub Dark UI System - Complete Implementation =====

(function(window, document) {
  'use strict';

  // ===== Utility Functions =====
  const Utils = {
    // Generate unique ID
    generateId: (prefix = 'gh') => {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Debounce function
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle function
    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // Deep merge objects
    deepMerge: (target, ...sources) => {
      if (!sources.length) return target;
      const source = sources.shift();

      if (Utils.isObject(target) && Utils.isObject(source)) {
        for (const key in source) {
          if (Utils.isObject(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            Utils.deepMerge(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }
      return Utils.deepMerge(target, ...sources);
    },

    // Check if object
    isObject: (item) => {
      return item && typeof item === 'object' && !Array.isArray(item);
    },

    // Parse HTML string
    parseHTML: (html) => {
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstChild;
    },

    // Escape HTML
    escapeHTML: (str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    // Get scroll parent
    getScrollParent: (element) => {
      if (!element) return document.body;
      
      const isScrollable = (el) => {
        const style = getComputedStyle(el);
        const overflow = style.overflow + style.overflowY + style.overflowX;
        return /(auto|scroll)/.test(overflow);
      };

      let parent = element.parentElement;
      while (parent) {
        if (isScrollable(parent)) return parent;
        parent = parent.parentElement;
      }
      return document.body;
    },

    // Animation frame helper
    nextFrame: (callback) => {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          callback?.();
          resolve();
        });
      });
    },

    // Trap focus within element
    trapFocus: (element) => {
      const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      const handleKeydown = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      };

      element.addEventListener('keydown', handleKeydown);
      return () => element.removeEventListener('keydown', handleKeydown);
    }
  };

  // ===== Event Emitter =====
  class EventEmitter {
    constructor() {
      this.events = {};
    }

    on(event, listener) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
      return () => this.off(event, listener);
    }

    off(event, listener) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event, ...args) {
      if (!this.events[event]) return;
      this.events[event].forEach(listener => listener(...args));
    }

    once(event, listener) {
      const unsubscribe = this.on(event, (...args) => {
        unsubscribe();
        listener(...args);
      });
      return unsubscribe;
    }
  }

  // ===== Position Manager =====
  class PositionManager {
    static calculatePosition(trigger, target, placement = 'auto', offset = 8) {
      const triggerRect = trigger.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const positions = {
        top: {
          top: triggerRect.top - targetRect.height - offset,
          left: triggerRect.left + (triggerRect.width - targetRect.width) / 2,
          placement: 'top'
        },
        bottom: {
          top: triggerRect.bottom + offset,
          left: triggerRect.left + (triggerRect.width - targetRect.width) / 2,
          placement: 'bottom'
        },
        left: {
          top: triggerRect.top + (triggerRect.height - targetRect.height) / 2,
          left: triggerRect.left - targetRect.width - offset,
          placement: 'left'
        },
        right: {
          top: triggerRect.top + (triggerRect.height - targetRect.height) / 2,
          left: triggerRect.right + offset,
          placement: 'right'
        },
        'top-start': {
          top: triggerRect.top - targetRect.height - offset,
          left: triggerRect.left,
          placement: 'top-start'
        },
        'top-end': {
          top: triggerRect.top - targetRect.height - offset,
          left: triggerRect.right - targetRect.width,
          placement: 'top-end'
        },
        'bottom-start': {
          top: triggerRect.bottom + offset,
          left: triggerRect.left,
          placement: 'bottom-start'
        },
        'bottom-end': {
          top: triggerRect.bottom + offset,
          left: triggerRect.right - targetRect.width,
          placement: 'bottom-end'
        }
      };

      // Auto placement logic
      if (placement === 'auto') {
        const spaceTop = triggerRect.top;
        const spaceBottom = viewport.height - triggerRect.bottom;
        const spaceLeft = triggerRect.left;
        const spaceRight = viewport.width - triggerRect.right;

        if (spaceBottom >= targetRect.height + offset) {
          placement = 'bottom';
        } else if (spaceTop >= targetRect.height + offset) {
          placement = 'top';
        } else if (spaceRight >= targetRect.width + offset) {
          placement = 'right';
        } else if (spaceLeft >= targetRect.width + offset) {
          placement = 'left';
        } else {
          placement = 'bottom'; // Fallback
        }
      }

      let position = positions[placement] || positions.bottom;

      // Boundary checking and adjustment
      position.top = Math.max(
        offset,
        Math.min(position.top, viewport.height - targetRect.height - offset)
      );
      position.left = Math.max(
        offset,
        Math.min(position.left, viewport.width - targetRect.width - offset)
      );

      // Add scroll offsets
      position.top += window.scrollY;
      position.left += window.scrollX;

      return position;
    }

    static applyPosition(element, position) {
      element.style.top = `${position.top}px`;
      element.style.left = `${position.left}px`;
      element.setAttribute('data-placement', position.placement);
    }
  }

  // ===== Base Component Class =====
  class BaseComponent extends EventEmitter {
    constructor(options = {}) {
      super();
      this.options = Utils.deepMerge(this.constructor.defaults, options);
      this.id = Utils.generateId(this.constructor.name.toLowerCase());
      this.element = null;
      this.isShown = false;
      this.isDestroyed = false;
      this._listeners = [];
    }

    static get defaults() {
      return {
        animation: true,
        appendTo: document.body,
        className: '',
        destroyOnHide: false
      };
    }

    show() {
      if (this.isShown || this.isDestroyed) return Promise.resolve();

      return new Promise(async (resolve) => {
        this.emit('show');
        
        if (!this.element) {
          this.render();
        }

        await Utils.nextFrame();
        this.element.classList.add('gh-show');
        this.isShown = true;
        
        this.emit('shown');
        resolve();
      });
    }

    hide() {
      if (!this.isShown || this.isDestroyed) return Promise.resolve();

      return new Promise(async (resolve) => {
        this.emit('hide');
        
        this.element.classList.remove('gh-show');
        
        if (this.options.animation) {
          await new Promise(r => setTimeout(r, 250));
        }

        this.isShown = false;
        
        if (this.options.destroyOnHide) {
          this.destroy();
        }

        this.emit('hidden');
        resolve();
      });
    }

    toggle() {
      return this.isShown ? this.hide() : this.show();
    }

    render() {
      // To be implemented by subclasses
    }

    destroy() {
      if (this.isDestroyed) return;

      this.emit('destroy');
      
      this._listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this._listeners = [];

      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      this.element = null;
      this.isDestroyed = true;
      this.isShown = false;
      
      this.emit('destroyed');
    }

    _addEventListener(element, event, handler) {
//////////////////////////////////////////////////////////////
/////  Issue 001 /////////////////////////////////////////////
      element.addEventListener(event, handler);
//////////////////////////////////////////////////////////////
      this._listeners.push({ element, event, handler });
    }
  }

  // ===== Tooltip Component =====
  class Tooltip extends BaseComponent {
    constructor(trigger, options = {}) {
      super(options);
      this.trigger = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
      this.content = options.content || this.trigger.getAttribute('data-tooltip') || '';
      this._bindEvents();
    }

    static get defaults() {
      return {
        ...BaseComponent.defaults,
        placement: 'auto',
        offset: 8,
        delay: { show: 200, hide: 0 },
        html: true,
        interactive: false,
        className: 'gh-tooltip',
        appendTo: document.body
      };
    }

    render() {
      this.element = document.createElement('div');
      this.element.className = `gh-floating ${this.options.className}`;
      this.element.id = this.id;
      
      if (this.options.html) {
        this.element.innerHTML = this.content;
      } else {
        this.element.textContent = this.content;
      }

      this.options.appendTo.appendChild(this.element);
      this.updatePosition();
    }

    updatePosition() {
      if (!this.element || !this.trigger) return;
      
      const position = PositionManager.calculatePosition(
        this.trigger,
        this.element,
        this.options.placement,
        this.options.offset
      );
      
      PositionManager.applyPosition(this.element, position);
    }

    _bindEvents() {
      this._showTimeout = null;
      this._hideTimeout = null;

      const showEvents = ['mouseenter', 'focus'];
      const hideEvents = ['mouseleave', 'blur'];

      showEvents.forEach(event => {
        this._addEventListener(this.trigger, event, () => {
          clearTimeout(this._hideTimeout);
          this._showTimeout = setTimeout(() => this.show(), this.options.delay.show);
        });
      });

      hideEvents.forEach(event => {
        this._addEventListener(this.trigger, event, () => {
          clearTimeout(this._showTimeout);
          this._hideTimeout = setTimeout(() => this.hide(), this.options.delay.hide);
        });
      });

      if (this.options.interactive) {
        this._addEventListener(document, 'mousemove', (e) => {
          if (this.element && this.element.contains(e.target)) {
            clearTimeout(this._hideTimeout);
          }
        });
      }

      // Update position on scroll/resize
      const updatePosition = Utils.throttle(() => this.updatePosition(), 100);
      this._addEventListener(window, 'scroll', updatePosition);
      this._addEventListener(window, 'resize', updatePosition);
    }

    setContent(content) {
      this.content = content;
      if (this.element) {
        if (this.options.html) {
          this.element.innerHTML = content;
        } else {
          this.element.textContent = content;
        }
        this.updatePosition();
      }
    }
  }

// ===== Popover Component =====
  class Popover extends BaseComponent {
    constructor(trigger, options = {}) {
      super(options);
      this.trigger = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
      this.content = options.content || this.trigger.getAttribute('data-popover') || '';
//////////////////////////////////////////////////////////////
/////  Issue 002  ////////////////////////////////////////////
      this._bindEvents();
//////////////////////////////////////////////////////////////
    }

    static get defaults() {
      return {
        ...BaseComponent.defaults,
        placement: 'auto',
        offset: 8,
        trigger: 'click', // 'click', 'hover', 'focus', 'manual'
        title: '',
        html: true,
        dismissible: true,
        className: 'gh-popover',
        expandable: false,
        expandedContent: null
      };
    }

    render() {
      this.element = document.createElement('div');
      this.element.className = `gh-floating ${this.options.className}`;
      this.element.id = this.id;

      let html = '';
      if (this.options.title) {
        html += `<div class="gh-popover-header">${this.options.title}</div>`;
      }
      
      html += `<div class="gh-popover-content">`;
      if (this.options.html) {
        html += this.content;
      } else {
        html += Utils.escapeHTML(this.content);
      }
      html += `</div>`;

      if (this.options.expandable) {
        html += `<div class="gh-popover-footer">
          <button class="gh-btn gh-btn-sm" data-expand>Show More</button>
        </div>`;
      }

      this.element.innerHTML = html;
      this.options.appendTo.appendChild(this.element);
      
      this._bindPopoverEvents();
      this.updatePosition();
    }

    _bindPopoverEvents() {
      if (!this.element) return;

      // Expand functionality
      if (this.options.expandable) {
        const expandBtn = this.element.querySelector('[data-expand]');
        if (expandBtn) {
          this._addEventListener(expandBtn, 'click', () => {
            this.expand();
          });
        }
      }

      // Dismissible functionality
      if (this.options.dismissible) {
        this._addEventListener(document, 'click', (e) => {
          if (this.isShown && 
              !this.element.contains(e.target) && 
              !this.trigger.contains(e.target)) {
            this.hide();
          }
        });

        this._addEventListener(document, 'keydown', (e) => {
          if (e.key === 'Escape' && this.isShown) {
            this.hide();
          }
        });
      }
    }

    expand() {
      if (!this.element || !this.options.expandedContent) return;

      this.element.classList.add('gh-expanded');
      
      const contentEl = this.element.querySelector('.gh-popover-content');
      if (contentEl) {
        contentEl.innerHTML = this.options.expandedContent;
      }

      const footerEl = this.element.querySelector('.gh-popover-footer');
      if (footerEl) {
        footerEl.remove();
      }

      this.updatePosition();
      this.emit('expanded');
    }

    updatePosition() {
      if (!this.element || !this.trigger) return;
      
      const position = PositionManager.calculatePosition(
        this.trigger,
        this.element,
        this.options.placement,
        this.options.offset
      );
      
      PositionManager.applyPosition(this.element, position);
    }

    _bindEvents() {
      const { trigger } = this.options;

      if (trigger === 'click') {
//////////////////////////////////////////////////////////////
/////  Issue 003  ////////////////////////////////////////////
        this._addEventListener(this.trigger, 'click', (e) => {
//////////////////////////////////////////////////////////////
          e.stopPropagation();
          this.toggle();
        });
      } else if (trigger === 'hover') {
        this._addEventListener(this.trigger, 'mouseenter', () => this.show());
        this._addEventListener(this.trigger, 'mouseleave', () => this.hide());
        
        this._addEventListener(document, 'mousemove', (e) => {
          if (this.element && this.element.contains(e.target)) {
            clearTimeout(this._hideTimeout);
          }
        });
      } else if (trigger === 'focus') {
        this._addEventListener(this.trigger, 'focus', () => this.show());
        this._addEventListener(this.trigger, 'blur', () => this.hide());
      }

      // Update position on scroll/resize
      const updatePosition = Utils.throttle(() => this.updatePosition(), 100);
      this._addEventListener(window, 'scroll', updatePosition);
      this._addEventListener(window, 'resize', updatePosition);
    }
  }

  // ===== Dropdown Component =====
  class Dropdown extends BaseComponent {
    constructor(trigger, options = {}) {
      super(options);
      this.trigger = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
      this.items = options.items || this._parseTemplate();
      this.selectedIndex = -1;
      this._bindEvents();
    }

    static get defaults() {
      return {
        ...BaseComponent.defaults,
        placement: 'bottom-start',
        offset: 4,
        className: 'gh-dropdown',
        closeOnSelect: true,
        searchable: false,
        multiSelect: false,
        selectedItems: []
      };
    }

    _parseTemplate() {
      const template = this.trigger.querySelector('template');
      if (!template) return [];

      const content = template.content.cloneNode(true);
      const items = [];
      
      content.querySelectorAll('.gh-dropdown-item').forEach(el => {
        items.push({
          label: el.textContent.trim(),
          value: el.dataset.value || el.textContent.trim(),
          icon: el.dataset.icon,
          disabled: el.classList.contains('gh-disabled'),
          divider: false
        });
      });

      content.querySelectorAll('.gh-dropdown-divider, .gh-separator').forEach(() => {
        items.push({ divider: true });
      });

      return items;
    }

    render() {
      this.element = document.createElement('div');
      this.element.className = `gh-floating ${this.options.className}`;
      this.element.id = this.id;

      let html = '';

      if (this.options.searchable) {
        html += `
          <div class="gh-dropdown-search">
            <input type="text" class="gh-form-input gh-form-input-sm" 
                   placeholder="Search..." data-search>
          </div>
        `;
      }

      html += '<div class="gh-dropdown-items">';
      
      this.items.forEach((item, index) => {
        if (item.divider) {
          html += '<div class="gh-dropdown-divider"></div>';
        } else if (item.header) {
          html += `<div class="gh-dropdown-header">${item.header}</div>`;
        } else {
          const isSelected = this.options.selectedItems.includes(item.value);
          html += `
            <div class="gh-dropdown-item ${item.disabled ? 'gh-disabled' : ''} ${isSelected ? 'gh-active' : ''}" 
                 data-index="${index}" 
                 data-value="${item.value}">
              ${item.icon ? `<span class="gh-dropdown-item-icon">${item.icon}</span>` : ''}
              <span class="gh-dropdown-item-label">${item.label}</span>
              ${item.shortcut ? `<span class="gh-dropdown-item-shortcut">${item.shortcut}</span>` : ''}
              ${this.options.multiSelect && !item.disabled ? `
                <input type="checkbox" ${isSelected ? 'checked' : ''} style="margin-left: auto;">
              ` : ''}
            </div>
          `;
        }
      });

      html += '</div>';

      this.element.innerHTML = html;
      this.options.appendTo.appendChild(this.element);
      
      this._bindDropdownEvents();
      this.updatePosition();
    }

    _bindDropdownEvents() {
      if (!this.element) return;

      // Item click
      this.element.querySelectorAll('.gh-dropdown-item:not(.gh-disabled)').forEach(item => {
        this._addEventListener(item, 'click', (e) => {
          e.stopPropagation();
          const index = parseInt(item.dataset.index);
          const value = item.dataset.value;
          
          if (this.options.multiSelect) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.checked = !checkbox.checked;
              if (checkbox.checked) {
                this.options.selectedItems.push(value);
                item.classList.add('gh-active');
              } else {
                const idx = this.options.selectedItems.indexOf(value);
                if (idx > -1) this.options.selectedItems.splice(idx, 1);
                item.classList.remove('gh-active');
              }
              this.emit('select', this.options.selectedItems);
            }
          } else {
            this.selectItem(index);
            if (this.options.closeOnSelect) {
              this.hide();
            }
          }
        });

        // Hover effect
        this._addEventListener(item, 'mouseenter', () => {
          this.highlightItem(parseInt(item.dataset.index));
        });
      });

      // Search functionality
      if (this.options.searchable) {
        const searchInput = this.element.querySelector('[data-search]');
        if (searchInput) {
          this._addEventListener(searchInput, 'input', (e) => {
            this.filterItems(e.target.value);
          });

          this._addEventListener(searchInput, 'click', (e) => {
            e.stopPropagation();
          });

          // Focus search input when dropdown opens
          setTimeout(() => searchInput.focus(), 100);
        }
      }

      // Keyboard navigation
      this._addEventListener(document, 'keydown', (e) => {
        if (!this.isShown) return;

        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            this.highlightNext();
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.highlightPrevious();
            break;
          case 'Enter':
            e.preventDefault();
            if (this.selectedIndex >= 0) {
              this.selectItem(this.selectedIndex);
              if (this.options.closeOnSelect && !this.options.multiSelect) {
                this.hide();
              }
            }
            break;
          case 'Escape':
            this.hide();
            break;
        }
      });
    }

    highlightItem(index) {
      this.element.querySelectorAll('.gh-dropdown-item').forEach((item, i) => {
        item.classList.toggle('gh-hover', i === index);
      });
      this.selectedIndex = index;
    }

    highlightNext() {
      const items = this.element.querySelectorAll('.gh-dropdown-item:not(.gh-disabled)');
      const maxIndex = items.length - 1;
      const nextIndex = this.selectedIndex < maxIndex ? this.selectedIndex + 1 : 0;
      this.highlightItem(nextIndex);
      items[nextIndex]?.scrollIntoView({ block: 'nearest' });
    }

    highlightPrevious() {
      const items = this.element.querySelectorAll('.gh-dropdown-item:not(.gh-disabled)');
      const maxIndex = items.length - 1;
      const prevIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : maxIndex;
      this.highlightItem(prevIndex);
      items[prevIndex]?.scrollIntoView({ block: 'nearest' });
    }

    selectItem(index) {
      const item = this.items[index];
      if (!item || item.disabled || item.divider) return;

      this.emit('select', item);
    }

    filterItems(query) {
      const lowerQuery = query.toLowerCase();
      this.element.querySelectorAll('.gh-dropdown-item').forEach(item => {
        const label = item.querySelector('.gh-dropdown-item-label');
        if (label) {
          const text = label.textContent.toLowerCase();
          item.style.display = text.includes(lowerQuery) ? '' : 'none';
        }
      });
    }

    updatePosition() {
      if (!this.element || !this.trigger) return;
      
      const position = PositionManager.calculatePosition(
        this.trigger,
        this.element,
        this.options.placement,
        this.options.offset
      );
      
      PositionManager.applyPosition(this.element, position);
    }

    _bindEvents() {
      this._addEventListener(this.trigger, 'click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      this._addEventListener(document, 'click', (e) => {
        if (this.isShown && !this.element.contains(e.target)) {
          this.hide();
        }
      });

      // Update position on scroll/resize
      const updatePosition = Utils.throttle(() => this.updatePosition(), 100);
      this._addEventListener(window, 'scroll', updatePosition);
      this._addEventListener(window, 'resize', updatePosition);
    }
  }

// ===== Modal Component =====
  class Modal extends BaseComponent {
    constructor(options = {}) {
      super(options);
      this.backdrop = null;
      this.focusTrap = null;
      this.previousFocus = null;
    }

    static get defaults() {
      return {
        ...BaseComponent.defaults,
        title: '',
        content: '',
        size: 'md', // 'sm', 'md', 'lg', 'xl', 'full'
        closable: true,
        closeOnBackdrop: true,
        closeOnEscape: true,
        backdrop: true,
        keyboard: true,
        focus: true,
        className: 'gh-modal',
        buttons: [],
        onShow: null,
        onHide: null
      };
    }

    render() {
      // Create backdrop
      if (this.options.backdrop) {
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'gh-backdrop';
        document.body.appendChild(this.backdrop);

        if (this.options.closeOnBackdrop) {
          this._addEventListener(this.backdrop, 'click', () => this.hide());
        }
      }

      // Create modal
      this.element = document.createElement('div');
      this.element.className = `${this.options.className} gh-modal-${this.options.size}`;
      this.element.id = this.id;
      this.element.setAttribute('role', 'dialog');
      this.element.setAttribute('aria-modal', 'true');
      
      if (this.options.title) {
        this.element.setAttribute('aria-labelledby', `${this.id}-title`);
      }

      let html = `
        <div class="gh-modal-header">
          ${this.options.title ? `<h3 class="gh-modal-title" id="${this.id}-title">${this.options.title}</h3>` : ''}
          ${this.options.closable ? `
            <button class="gh-modal-close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="gh-modal-body">
          ${this.options.content}
        </div>
      `;

      if (this.options.buttons && this.options.buttons.length > 0) {
        html += '<div class="gh-modal-footer">';
        this.options.buttons.forEach((button, index) => {
          const btnClass = button.class || 'gh-btn';
          const btnId = `${this.id}-btn-${index}`;
          html += `<button class="${btnClass}" id="${btnId}" ${button.disabled ? 'disabled' : ''}>${button.text}</button>`;
        });
        html += '</div>';
      }

      this.element.innerHTML = html;
      document.body.appendChild(this.element);

      this._bindModalEvents();
    }

    _bindModalEvents() {
      // Close button
      if (this.options.closable) {
        const closeBtn = this.element.querySelector('.gh-modal-close');
        if (closeBtn) {
          this._addEventListener(closeBtn, 'click', () => this.hide());
        }
      }

      // Button actions
      if (this.options.buttons) {
        this.options.buttons.forEach((button, index) => {
          const btn = this.element.querySelector(`#${this.id}-btn-${index}`);
          if (btn && button.onClick) {
            this._addEventListener(btn, 'click', () => {
              button.onClick(this);
            });
          }
        });
      }

      // Keyboard events
      if (this.options.keyboard) {
        this._addEventListener(document, 'keydown', (e) => {
          if (e.key === 'Escape' && this.isShown && this.options.closeOnEscape) {
            this.hide();
          }
        });
      }
    }

    async show() {
      if (this.isShown) return;

      this.previousFocus = document.activeElement;

      await super.show();

      if (this.backdrop) {
        await Utils.nextFrame();
        this.backdrop.classList.add('gh-show');
      }

      // Focus management
      if (this.options.focus) {
        this.focusTrap = Utils.trapFocus(this.element);
        const firstFocusable = this.element.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      if (this.options.onShow) {
        this.options.onShow(this);
      }
    }

    async hide() {
      if (!this.isShown) return;

      if (this.options.onHide) {
        const result = this.options.onHide(this);
        if (result === false) return;
      }

      if (this.backdrop) {
        this.backdrop.classList.remove('gh-show');
      }

      await super.hide();

      // Restore focus
      if (this.previousFocus && this.previousFocus.focus) {
        this.previousFocus.focus();
      }

      // Restore body scroll
      document.body.style.overflow = '';

      // Clean up backdrop
      if (this.backdrop && this.backdrop.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
        this.backdrop = null;
      }
    }

    setContent(content) {
      const body = this.element?.querySelector('.gh-modal-body');
      if (body) {
        body.innerHTML = content;
      }
    }

    setTitle(title) {
      const titleEl = this.element?.querySelector('.gh-modal-title');
      if (titleEl) {
        titleEl.textContent = title;
      }
    }
  }

  // ===== Dialog Component (Specialized Modal) =====
  class Dialog extends Modal {
    constructor(options = {}) {
      super(options);
    }

    static get defaults() {
      return {
        ...Modal.defaults,
        type: 'info', // 'success', 'warning', 'danger', 'info'
        icon: true,
        size: 'sm',
        className: 'gh-modal gh-dialog',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        onCancel: null
      };
    }

    render() {
      // Create backdrop
      if (this.options.backdrop) {
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'gh-backdrop';
        document.body.appendChild(this.backdrop);
      }

      // Create dialog
      this.element = document.createElement('div');
      this.element.className = `${this.options.className} gh-modal-${this.options.size}`;
      this.element.id = this.id;
      this.element.setAttribute('role', 'alertdialog');
      this.element.setAttribute('aria-modal', 'true');

      const iconSvg = this._getIcon();

      let html = `
        <div class="gh-modal-body">
          ${this.options.icon ? `
            <div class="gh-dialog-icon gh-dialog-${this.options.type}">
              ${iconSvg}
            </div>
          ` : ''}
          <div class="gh-dialog-content">
            ${this.options.title ? `<div class="gh-dialog-title">${this.options.title}</div>` : ''}
            ${this.options.content ? `<div class="gh-dialog-message">${this.options.content}</div>` : ''}
          </div>
        </div>
        <div class="gh-modal-footer">
          ${this.options.onCancel ? `
            <button class="gh-btn gh-btn-ghost" data-action="cancel">${this.options.cancelText}</button>
          ` : ''}
          <button class="gh-btn gh-btn-${this._getButtonClass()}" data-action="confirm">${this.options.confirmText}</button>
        </div>
      `;

      this.element.innerHTML = html;
      document.body.appendChild(this.element);

      this._bindDialogEvents();
    }

    _getIcon() {
      const icons = {
        success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
        warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
        danger: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>',
        info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
      };
      return icons[this.options.type] || icons.info;
    }

    _getButtonClass() {
      const classes = {
        success: 'success',
        warning: 'warning',
        danger: 'danger',
        info: 'primary'
      };
      return classes[this.options.type] || 'primary';
    }

    _bindDialogEvents() {
      const confirmBtn = this.element.querySelector('[data-action="confirm"]');
      const cancelBtn = this.element.querySelector('[data-action="cancel"]');

      if (confirmBtn) {
        this._addEventListener(confirmBtn, 'click', () => {
          if (this.options.onConfirm) {
            const result = this.options.onConfirm(this);
            if (result !== false) {
              this.hide();
            }
          } else {
            this.hide();
          }
        });
      }

      if (cancelBtn) {
        this._addEventListener(cancelBtn, 'click', () => {
          if (this.options.onCancel) {
            this.options.onCancel(this);
          }
          this.hide();
        });
      }

      // ESC key
      this._addEventListener(document, 'keydown', (e) => {
        if (e.key === 'Escape' && this.isShown) {
          if (this.options.onCancel) {
            this.options.onCancel(this);
          }
          this.hide();
        }
      });
    }
  }

  // ===== Toast Component =====
  class Toast extends BaseComponent {
    constructor(options = {}) {
      super(options);
      this.progressBar = null;
      this.progressInterval = null;
      this.autoHideTimeout = null;
    }

    static get defaults() {
      return {
        ...BaseComponent.defaults,
        title: '',
        message: '',
        type: 'info', // 'success', 'warning', 'danger', 'info'
        duration: 5000,
        position: 'top-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
        closable: true,
        progress: true,
        pauseOnHover: true,
        actions: [], // [{text: 'Undo', onClick: Function}]
        className: 'gh-toast',
        icon: true
      };
    }

    static container = null;

    static getContainer(position) {
      if (!Toast.container) {
        Toast.container = document.createElement('div');
        Toast.container.className = 'gh-toast-container';
        document.body.appendChild(Toast.container);
      }

      // Update container position based on toast position
      const positions = {
        'top-left': { top: '20px', left: '20px', right: 'auto', bottom: 'auto' },
        'top-right': { top: '20px', right: '20px', left: 'auto', bottom: 'auto' },
        'bottom-left': { bottom: '20px', left: '20px', right: 'auto', top: 'auto' },
        'bottom-right': { bottom: '20px', right: '20px', left: 'auto', top: 'auto' }
      };

      const pos = positions[position] || positions['top-right'];
      Object.assign(Toast.container.style, pos);

      return Toast.container;
    }

    render() {
      const container = Toast.getContainer(this.options.position);
      
      this.element = document.createElement('div');
      this.element.className = `${this.options.className} gh-toast-${this.options.type}`;
      this.element.id = this.id;

      const iconSvg = this._getIcon();

      let html = `
        ${this.options.icon ? `<div class="gh-toast-icon">${iconSvg}</div>` : ''}
        <div class="gh-toast-content">
          ${this.options.title ? `<div class="gh-toast-title">${this.options.title}</div>` : ''}
          ${this.options.message ? `<div class="gh-toast-message">${this.options.message}</div>` : ''}
          ${this.options.actions.length > 0 ? `
            <div class="gh-toast-actions">
              ${this.options.actions.map((action, i) => 
                `<button class="gh-toast-action" data-action="${i}">${action.text}</button>`
              ).join('')}
            </div>
          ` : ''}
        </div>
        ${this.options.closable ? `
          <button class="gh-toast-close" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 011.06 0L7 5.94l2.22-2.22a.75.75 0 111.06 1.06L8.06 7l2.22 2.22a.75.75 0 11-1.06 1.06L7 8.06l-2.22 2.22a.75.75 0 01-1.06-1.06L5.94 7 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        ` : ''}
        ${this.options.progress ? `<div class="gh-toast-progress"></div>` : ''}
      `;

      this.element.innerHTML = html;
      container.appendChild(this.element);

      this._bindToastEvents();
      
      if (this.options.progress) {
        this.progressBar = this.element.querySelector('.gh-toast-progress');
        this.startProgress();
      }

      if (this.options.duration > 0) {
        this.startAutoHide();
      }
    }

_getIcon() {
      const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 5L8 14l-4-4"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2C5.48 2 2 5.48 2 10s3.48 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H9v-2h2v2zm0-4H9V6h2v5z"/></svg>',
        danger: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2C5.47 2 2 5.47 2 10s3.47 8 8 8 8-3.47 8-8-3.47-8-8-8zm4 11.59L12.59 14 10 11.41 7.41 14 6 12.59 8.59 10 6 7.41 7.41 6 10 8.59 12.59 6 14 7.41 11.41 10 14 12.59z"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2C5.48 2 2 5.48 2 10s3.48 8 8 8 8-3.48 8-8-3.48-8-8-8zm1 13H9v-5h2v5zm0-7H9V6h2v2z"/></svg>'
      };
      return icons[this.options.type] || icons.info;
    }

    _bindToastEvents() {
      // Close button
      if (this.options.closable) {
        const closeBtn = this.element.querySelector('.gh-toast-close');
        if (closeBtn) {
          this._addEventListener(closeBtn, 'click', () => this.hide());
        }
      }

      // Action buttons
      this.options.actions.forEach((action, index) => {
        const btn = this.element.querySelector(`[data-action="${index}"]`);
        if (btn) {
          this._addEventListener(btn, 'click', () => {
            if (action.onClick) {
              action.onClick(this);
            }
            if (action.closeOnClick !== false) {
              this.hide();
            }
          });
        }
      });

      // Pause on hover
      if (this.options.pauseOnHover && this.options.duration > 0) {
        this._addEventListener(this.element, 'mouseenter', () => {
          this.pauseProgress();
          clearTimeout(this.autoHideTimeout);
        });

        this._addEventListener(this.element, 'mouseleave', () => {
          this.resumeProgress();
          this.startAutoHide();
        });
      }
    }

    startProgress() {
      if (!this.progressBar || this.options.duration <= 0) return;

      const duration = this.options.duration;
      const interval = 50; // Update every 50ms
      const steps = duration / interval;
      let currentStep = 0;

      this.progressBar.style.width = '100%';
      this.progressBar.style.transition = `width ${duration}ms linear`;

      requestAnimationFrame(() => {
        this.progressBar.style.width = '0%';
      });

      this.progressStartTime = Date.now();
      this.progressPausedAt = null;
    }

    pauseProgress() {
      if (!this.progressBar) return;
      
      const elapsed = Date.now() - this.progressStartTime;
      const remaining = Math.max(0, this.options.duration - elapsed);
      const percentRemaining = (remaining / this.options.duration) * 100;
      
      this.progressBar.style.transition = 'none';
      this.progressBar.style.width = `${percentRemaining}%`;
      
      this.progressPausedAt = Date.now();
    }

    resumeProgress() {
      if (!this.progressBar || !this.progressPausedAt) return;
      
      const elapsed = this.progressPausedAt - this.progressStartTime;
      const remaining = Math.max(0, this.options.duration - elapsed);
      
      this.progressBar.style.transition = `width ${remaining}ms linear`;
      requestAnimationFrame(() => {
        this.progressBar.style.width = '0%';
      });
      
      this.progressStartTime = Date.now() - elapsed;
      this.progressPausedAt = null;
    }

    startAutoHide() {
      if (this.options.duration <= 0) return;
      
      clearTimeout(this.autoHideTimeout);
      
      const remaining = this.progressPausedAt 
        ? this.options.duration - (this.progressPausedAt - this.progressStartTime)
        : this.options.duration;
      
      this.autoHideTimeout = setTimeout(() => {
        this.hide();
      }, remaining);
    }

    async hide() {
      if (!this.isShown) return;

      clearTimeout(this.autoHideTimeout);
      clearInterval(this.progressInterval);

      this.element.classList.add('gh-toast-removing');
      
      await new Promise(resolve => setTimeout(resolve, 250));
      
      await super.hide();
    }

    static show(options) {
      const toast = new Toast(options);
      toast.show();
      return toast;
    }

    static success(message, title = 'Success', options = {}) {
      return Toast.show({ ...options, message, title, type: 'success' });
    }

    static error(message, title = 'Error', options = {}) {
      return Toast.show({ ...options, message, title, type: 'danger' });
    }

    static warning(message, title = 'Warning', options = {}) {
      return Toast.show({ ...options, message, title, type: 'warning' });
    }

    static info(message, title = 'Info', options = {}) {
      return Toast.show({ ...options, message, title, type: 'info' });
    }
  }

  // ===== Banner Component =====
  class Banner extends BaseComponent {
    constructor(options = {}) {
      super(options);
    }

    static get defaults() {
      return {
        ...BaseComponent.defaults,
        title: '',
        message: '',
        type: 'info', // 'success', 'warning', 'danger', 'info'
        position: 'top', // 'top', 'bottom'
        closable: true,
        actions: [],
        icon: true,
        className: 'gh-banner',
        sticky: true
      };
    }

    render() {
      this.element = document.createElement('div');
      this.element.className = `${this.options.className} gh-banner-${this.options.type}`;
      this.element.id = this.id;
      
      if (this.options.position === 'bottom') {
        this.element.style.bottom = '0';
        this.element.style.top = 'auto';
      }

      const iconSvg = this._getIcon();

      let html = `
        ${this.options.icon ? `<div class="gh-banner-icon">${iconSvg}</div>` : ''}
        <div class="gh-banner-content">
          ${this.options.title ? `<span class="gh-banner-title">${this.options.title}</span>` : ''}
          ${this.options.message ? `<span class="gh-banner-message">${this.options.message}</span>` : ''}
        </div>
        ${this.options.actions.length > 0 ? `
          <div class="gh-banner-actions">
            ${this.options.actions.map((action, i) => 
              `<button class="gh-btn gh-btn-sm ${action.class || ''}" data-action="${i}">${action.text}</button>`
            ).join('')}
          </div>
        ` : ''}
        ${this.options.closable ? `
          <button class="gh-banner-dismiss" aria-label="Dismiss">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        ` : ''}
      `;

      this.element.innerHTML = html;
      document.body.appendChild(this.element);

      this._bindBannerEvents();
      
      // Add padding to body to prevent content overlap
      if (this.options.sticky) {
        const height = this.element.offsetHeight;
        if (this.options.position === 'top') {
          document.body.style.paddingTop = `${height}px`;
        } else {
          document.body.style.paddingBottom = `${height}px`;
        }
      }
    }

    _getIcon() {
      const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 6.707l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 1.414z"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 3a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 8a1 1 0 100 2 1 1 0 000-2z"/></svg>',
        danger: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 10.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 011.414-1.414L10 8.586l2.293-2.293a1 1 0 011.414 1.414L11.414 10l2.293 2.293z"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 3a1 1 0 011 1 1 1 0 11-2 0 1 1 0 011-1zm-1 4h2v5H9V9z"/></svg>'
      };
      return icons[this.options.type] || icons.info;
    }

    _bindBannerEvents() {
      // Close button
      if (this.options.closable) {
        const dismissBtn = this.element.querySelector('.gh-banner-dismiss');
        if (dismissBtn) {
          this._addEventListener(dismissBtn, 'click', () => this.hide());
        }
      }

      // Action buttons
      this.options.actions.forEach((action, index) => {
        const btn = this.element.querySelector(`[data-action="${index}"]`);
        if (btn) {
          this._addEventListener(btn, 'click', () => {
            if (action.onClick) {
              action.onClick(this);
            }
          });
        }
      });
    }

    async hide() {
      // Remove body padding
      if (this.options.sticky) {
        if (this.options.position === 'top') {
          document.body.style.paddingTop = '';
        } else {
          document.body.style.paddingBottom = '';
        }
      }

      await super.hide();
    }
  }

  // ===== Search Modal Component =====
  class SearchModal extends Modal {
    constructor(options = {}) {
      super(options);
      this.selectedIndex = -1;
      this.searchResults = [];
    }

    static get defaults() {
      return {
        ...Modal.defaults,
        title: 'Search',
        placeholder: 'Type to search...',
        className: 'gh-modal gh-search-modal',
        size: 'md',
        dataSource: null, // Function or array
        onSelect: null,
        minChars: 1,
        debounceDelay: 300,
        noResultsText: 'No results found',
        loadingText: 'Searching...'
      };
    }

    render() {
      super.render();
      
      const body = this.element.querySelector('.gh-modal-body');
      if (body) {
        body.innerHTML = `
          <div class="gh-search-input-wrapper">
            <svg class="gh-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
            </svg>
            <input type="text" class="gh-search-input" placeholder="${this.options.placeholder}" autocomplete="off">
            <button class="gh-search-clear" aria-label="Clear">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M3.72 3.72a.75.75 0 011.06 0L7 5.94l2.22-2.22a.75.75 0 111.06 1.06L8.06 7l2.22 2.22a.75.75 0 11-1.06 1.06L7 8.06l-2.22 2.22a.75.75 0 01-1.06-1.06L5.94 7 3.72 4.78a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          </div>
          <div class="gh-search-results"></div>
          <div class="gh-search-shortcuts">
            <div class="gh-search-shortcut">
              <span class="gh-kbd">↑↓</span> Navigate
            </div>
            <div class="gh-search-shortcut">
              <span class="gh-kbd">Enter</span> Select
            </div>
            <div class="gh-search-shortcut">
              <span class="gh-kbd">Esc</span> Close
            </div>
          </div>
        `;
      }

      this._bindSearchEvents();
    }

    _bindSearchEvents() {
      const input = this.element.querySelector('.gh-search-input');
      const clearBtn = this.element.querySelector('.gh-search-clear');
      const resultsContainer = this.element.querySelector('.gh-search-results');

      if (input) {
        // Focus input when modal opens
        setTimeout(() => input.focus(), 100);

        // Search on input
        const search = Utils.debounce(async (query) => {
          if (query.length < this.options.minChars) {
            this.clearResults();
            return;
          }

          await this.search(query);
        }, this.options.debounceDelay);

        this._addEventListener(input, 'input', (e) => {
          search(e.target.value);
        });

        // Clear button
        if (clearBtn) {
          this._addEventListener(clearBtn, 'click', () => {
            input.value = '';
            input.focus();
            this.clearResults();
          });
        }

        // Keyboard navigation
        this._addEventListener(input, 'keydown', (e) => {
          switch(e.key) {
            case 'ArrowDown':
              e.preventDefault();
              this.selectNext();
              break;
            case 'ArrowUp':
              e.preventDefault();
              this.selectPrevious();
              break;
            case 'Enter':
              e.preventDefault();
              if (this.selectedIndex >= 0) {
                this.selectResult(this.searchResults[this.selectedIndex]);
              }
              break;
          }
        });
      }
    }

async search(query) {
      const resultsContainer = this.element.querySelector('.gh-search-results');
      if (!resultsContainer) return;

      // Show loading state
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--gh-text-muted);">
          ${this.options.loadingText}
        </div>
      `;

      try {
        let results = [];
        
        if (typeof this.options.dataSource === 'function') {
          results = await this.options.dataSource(query);
        } else if (Array.isArray(this.options.dataSource)) {
          // Simple filtering for array data source
          const lowerQuery = query.toLowerCase();
          results = this.options.dataSource.filter(item => {
            const searchableText = typeof item === 'string' 
              ? item 
              : (item.title + ' ' + item.description).toLowerCase();
            return searchableText.includes(lowerQuery);
          });
        }

        this.searchResults = results;
        this.renderResults(results);
      } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
          <div style="text-align: center; padding: 20px; color: var(--gh-accent-danger);">
            An error occurred while searching
          </div>
        `;
      }
    }

    renderResults(results) {
      const resultsContainer = this.element.querySelector('.gh-search-results');
      if (!resultsContainer) return;

      if (results.length === 0) {
        resultsContainer.innerHTML = `
          <div style="text-align: center; padding: 20px; color: var(--gh-text-muted);">
            ${this.options.noResultsText}
          </div>
        `;
        return;
      }

      let html = '';
      results.forEach((result, index) => {
        const isActive = index === this.selectedIndex;
        html += `
          <div class="gh-search-result ${isActive ? 'gh-active' : ''}" data-index="${index}">
            ${result.icon ? `
              <div class="gh-search-result-icon">
                ${result.icon}
              </div>
            ` : ''}
            <div class="gh-search-result-content">
              <div class="gh-search-result-title">${result.title || result}</div>
              ${result.description ? `
                <div class="gh-search-result-description">${result.description}</div>
              ` : ''}
            </div>
          </div>
        `;
      });

      resultsContainer.innerHTML = html;

      // Bind click events to results
      resultsContainer.querySelectorAll('.gh-search-result').forEach(el => {
        this._addEventListener(el, 'click', () => {
          const index = parseInt(el.dataset.index);
          this.selectResult(results[index]);
        });

        this._addEventListener(el, 'mouseenter', () => {
          this.selectedIndex = parseInt(el.dataset.index);
          this.updateSelection();
        });
      });
    }

    selectNext() {
      if (this.searchResults.length === 0) return;
      
      this.selectedIndex = (this.selectedIndex + 1) % this.searchResults.length;
      this.updateSelection();
    }

    selectPrevious() {
      if (this.searchResults.length === 0) return;
      
      this.selectedIndex = this.selectedIndex <= 0 
        ? this.searchResults.length - 1 
        : this.selectedIndex - 1;
      this.updateSelection();
    }

    updateSelection() {
      const results = this.element.querySelectorAll('.gh-search-result');
      results.forEach((el, index) => {
        el.classList.toggle('gh-active', index === this.selectedIndex);
        if (index === this.selectedIndex) {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      });
    }

    selectResult(result) {
      if (this.options.onSelect) {
        this.options.onSelect(result, this);
      }
      this.hide();
    }

    clearResults() {
      const resultsContainer = this.element.querySelector('.gh-search-results');
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
      }
      this.searchResults = [];
      this.selectedIndex = -1;
    }
  }

  // ===== Form Modal Component =====
  class FormModal extends Modal {
    constructor(options = {}) {
      super(options);
      this.formData = {};
    }

    static get defaults() {
      return {
        ...Modal.defaults,
        title: 'Form',
        fields: [],
        className: 'gh-modal gh-form-modal',
        size: 'md',
        submitText: 'Submit',
        cancelText: 'Cancel',
        onSubmit: null,
        onCancel: null,
        validation: true
      };
    }

    render() {
      super.render();
      
      const body = this.element.querySelector('.gh-modal-body');
      if (body) {
        body.innerHTML = this.renderForm();
      }

      // Update footer buttons
      const footer = this.element.querySelector('.gh-modal-footer');
      if (footer) {
        footer.innerHTML = `
          <button class="gh-btn gh-btn-ghost" data-action="cancel">${this.options.cancelText}</button>
          <button class="gh-btn gh-btn-primary" data-action="submit">${this.options.submitText}</button>
        `;
      }

      this._bindFormEvents();
    }

    renderForm() {
      let html = '<form class="gh-form" novalidate>';
      
      this.options.fields.forEach(field => {
        html += this.renderField(field);
      });

      html += '</form>';
      return html;
    }

    renderField(field) {
      const fieldId = `${this.id}-${field.name}`;
      const required = field.required ? 'required' : '';
      const value = field.value || '';

      let html = '<div class="gh-form-group">';
      
      if (field.type !== 'checkbox' && field.type !== 'radio') {
        html += `
          <label class="gh-form-label" for="${fieldId}">
            ${field.label}
            ${field.required ? '<span style="color: var(--gh-accent-danger);">*</span>' : ''}
          </label>
        `;
      }

      switch(field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
        case 'tel':
        case 'url':
          html += `
            <input type="${field.type}" 
                   id="${fieldId}" 
                   name="${field.name}"
                   class="gh-form-input" 
                   placeholder="${field.placeholder || ''}"
                   value="${value}"
                   ${required}
                   ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
                   ${field.min !== undefined ? `min="${field.min}"` : ''}
                   ${field.max !== undefined ? `max="${field.max}"` : ''}>
          `;
          break;

        case 'textarea':
          html += `
            <textarea id="${fieldId}" 
                      name="${field.name}"
                      class="gh-form-textarea" 
                      placeholder="${field.placeholder || ''}"
                      ${required}
                      ${field.rows ? `rows="${field.rows}"` : ''}
                      ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}>${value}</textarea>
          `;
          break;

        case 'select':
          html += `
            <select id="${fieldId}" 
                    name="${field.name}"
                    class="gh-form-select" 
                    ${required}>
              ${field.placeholder ? `<option value="">${field.placeholder}</option>` : ''}
              ${field.options.map(opt => {
                const optValue = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const selected = value === optValue ? 'selected' : '';
                return `<option value="${optValue}" ${selected}>${optLabel}</option>`;
              }).join('')}
            </select>
          `;
          break;

        case 'checkbox':
          html += `
            <label class="gh-form-checkbox">
              <input type="checkbox" 
                     id="${fieldId}" 
                     name="${field.name}"
                     value="${field.value || 'on'}"
                     ${field.checked ? 'checked' : ''}>
              <span>${field.label}</span>
            </label>
          `;
          break;

        case 'radio':
          field.options.forEach((opt, i) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const optId = `${fieldId}-${i}`;
            html += `
              <label class="gh-form-radio">
                <input type="radio" 
                       id="${optId}" 
                       name="${field.name}"
                       value="${optValue}"
                       ${value === optValue ? 'checked' : ''}>
                <span>${optLabel}</span>
              </label>
            `;
          });
          break;
      }

      if (field.helper) {
        html += `<div class="gh-form-helper">${field.helper}</div>`;
      }

      html += '<div class="gh-form-error" style="display: none;"></div>';
      html += '</div>';

      return html;
    }

    _bindFormEvents() {
      const form = this.element.querySelector('.gh-form');
      const submitBtn = this.element.querySelector('[data-action="submit"]');
      const cancelBtn = this.element.querySelector('[data-action="cancel"]');

      if (form) {
        // Real-time validation
        if (this.options.validation) {
          form.querySelectorAll('input, textarea, select').forEach(field => {
            this._addEventListener(field, 'blur', () => {
              this.validateField(field);
            });

            this._addEventListener(field, 'input', () => {
              if (field.classList.contains('gh-invalid')) {
                this.validateField(field);
              }
            });
          });
        }

        // Form submission
        this._addEventListener(form, 'submit', (e) => {
          e.preventDefault();
          this.submit();
        });
      }

      if (submitBtn) {
        this._addEventListener(submitBtn, 'click', (e) => {
          e.preventDefault();
          this.submit();
        });
      }

      if (cancelBtn) {
        this._addEventListener(cancelBtn, 'click', () => {
          if (this.options.onCancel) {
            this.options.onCancel(this);
          }
          this.hide();
        });
      }
    }

    validateField(field) {
      const formGroup = field.closest('.gh-form-group');
      const errorEl = formGroup?.querySelector('.gh-form-error');
      
      if (!errorEl) return true;

      let error = '';

      // Required validation
      if (field.hasAttribute('required') && !field.value.trim()) {
        error = 'This field is required';
      }

      // Email validation
      if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
          error = 'Please enter a valid email address';
        }
      }

      // Number validation
      if (field.type === 'number' && field.value) {
        const min = parseFloat(field.getAttribute('min'));
        const max = parseFloat(field.getAttribute('max'));
        const value = parseFloat(field.value);
        
        if (!isNaN(min) && value < min) {
          error = `Value must be at least ${min}`;
        } else if (!isNaN(max) && value > max) {
          error = `Value must be at most ${max}`;
        }
      }

      // URL validation
      if (field.type === 'url' && field.value) {
        try {
          new URL(field.value);
        } catch {
          error = 'Please enter a valid URL';
        }
      }

      if (error) {
        field.classList.add('gh-invalid');
        errorEl.textContent = error;
        errorEl.style.display = 'block';
        return false;
      } else {
        field.classList.remove('gh-invalid');
        errorEl.style.display = 'none';
        return true;
      }
    }

    validateForm() {
      const form = this.element.querySelector('.gh-form');
      if (!form) return true;

      let isValid = true;
      form.querySelectorAll('input, textarea, select').forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    }

    getFormData() {
      const form = this.element.querySelector('.gh-form');
      if (!form) return {};

      const data = {};
      const formData = new FormData(form);
      
      // Handle regular fields
      for (let [key, value] of formData.entries()) {
        if (data[key]) {
          // Handle multiple values (e.g., multiple checkboxes with same name)
          if (!Array.isArray(data[key])) {
            data[key] = [data[key]];
          }
          data[key].push(value);
        } else {
          data[key] = value;
        }
      }

      // Handle unchecked checkboxes
      form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (!checkbox.checked && !data[checkbox.name]) {
          data[checkbox.name] = false;
        } else if (checkbox.checked && !Array.isArray(data[checkbox.name])) {
          data[checkbox.name] = true;
        }
      });

      return data;
    }

    async submit() {
      if (this.options.validation && !this.validateForm()) {
        return;
      }

      const dat