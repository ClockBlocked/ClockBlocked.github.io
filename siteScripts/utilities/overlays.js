(function(window, document) {
  'use strict';

  /**
   *
   * Utility Functions
   *
   **/
  const Utils = {
    generateId: (prefix = 'gh') => {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

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

    isObject: (item) => {
      return item && typeof item === 'object' && !Array.isArray(item);
    },

    parseHTML: (html) => {
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstChild;
    },

    escapeHTML: (str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

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

    nextFrame: (callback) => {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          callback?.();
          resolve();
        });
      });
    },

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





  /**
   *
   * Event Emitter
   *
   **/
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





  /**
   *
   * Position Manager
   *
   **/
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
          placement = 'bottom';
        }
      }

      let position = positions[placement] || positions.bottom;

      position.top = Math.max(
        offset,
        Math.min(position.top, viewport.height - targetRect.height - offset)
      );
      position.left = Math.max(
        offset,
        Math.min(position.left, viewport.width - targetRect.width - offset)
      );

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





  /**
   *
   * Base Component Class
   *
   **/
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
      
    }

    destroy() {
      if (this.isDestroyed) return;

      this.emit('destroy');
      
      this._listeners.forEach(({ element, event, handler }) => {
        if (element && element.removeEventListener) {
          element.removeEventListener(event, handler);
        }
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
      if (!element || !element.addEventListener) {
        console.warn('Invalid element provided to _addEventListener:', element);
        return;
      }
      
      element.addEventListener(event, handler);
      this._listeners.push({ element, event, handler });
    }
  }





  /**
   *
   * Tooltips
   *
   **/
  class Tooltip extends BaseComponent {
    constructor(trigger, options = {}) {
      super(options);
      this.trigger = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
      
      if (!this.trigger) {
        console.warn('Tooltip trigger element not found');
        return;
      }
      
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
      if (!this.trigger) return;

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
          if (this.element && this.element.contains && this.element.contains(e.target)) {
            clearTimeout(this._hideTimeout);
          }
        });
      }

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





  /**
   *
   * Popovers
   *
   **/
  class Popover extends BaseComponent {
    constructor(trigger, options = {}) {
      super(options);
      this.trigger = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
      
      if (!this.trigger) {
        console.warn('Popover trigger element not found');
        return;
      }
      
      this.content = options.content || this.trigger.getAttribute('data-popover') || '';
      this._bindEvents();
    }

    static get defaults() {
      return {
        ...BaseComponent.defaults,
        placement: 'auto',
        offset: 8,
        trigger: 'click',
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

      if (this.options.expandable) {
        const expandBtn = this.element.querySelector('[data-expand]');
        if (expandBtn) {
          this._addEventListener(expandBtn, 'click', () => {
            this.expand();
          });
        }
      }

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
      if (!this.trigger) return;

      const { trigger } = this.options;

      if (trigger === 'click') {
        this._addEventListener(this.trigger, 'click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggle();
        });
      } else if (trigger === 'hover') {
        this._addEventListener(this.trigger, 'mouseenter', () => this.show());
        this._addEventListener(this.trigger, 'mouseleave', () => this.hide());
        
        this._addEventListener(document, 'mousemove', (e) => {
          if (this.element && this.element.contains && this.element.contains(e.target)) {
            clearTimeout(this._hideTimeout);
          }
        });
      } else if (trigger === 'focus') {
        this._addEventListener(this.trigger, 'focus', () => this.show());
        this._addEventListener(this.trigger, 'blur', () => this.hide());
      }

      const updatePosition = Utils.throttle(() => this.updatePosition(), 100);
      this._addEventListener(window, 'scroll', updatePosition);
      this._addEventListener(window, 'resize', updatePosition);
    }
  }





  /**
   *
   * Dropdowns
   *
   **/
  class Dropdown extends BaseComponent {
    constructor(trigger, options = {}) {
      super(options);
      this.trigger = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
      
      if (!this.trigger) {
        console.warn('Dropdown trigger element not found');
        return;
      }
      
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
      if (!this.trigger) return [];
      
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

        this._addEventListener(item, 'mouseenter', () => {
          this.highlightItem(parseInt(item.dataset.index));
        });
      });

      if (this.options.searchable) {
        const searchInput = this.element.querySelector('[data-search]');
        if (searchInput) {
          this._addEventListener(searchInput, 'input', (e) => {
            this.filterItems(e.target.value);
          });

          this._addEventListener(searchInput, 'click', (e) => {
            e.stopPropagation();
          });

          setTimeout(() => searchInput.focus(), 100);
        }
      }

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
      const items = this.element.querySelectorAll('.gh-dropdown-item');
      items.forEach((item, i) => {
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
      if (!this.trigger) return;

      this._addEventListener(this.trigger, 'click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      this._addEventListener(document, 'click', (e) => {
        if (this.isShown && !this.element.contains(e.target)) {
          this.hide();
        }
      });

      const updatePosition = Utils.throttle(() => this.updatePosition(), 100);
      this._addEventListener(window, 'scroll', updatePosition);
      this._addEventListener(window, 'resize', updatePosition);
    }
  }





  /**
   *
   * Modals
   *
   **/
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
        size: 'md',
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
      if (this.options.backdrop) {
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'gh-backdrop';
        document.body.appendChild(this.backdrop);

        if (this.options.closeOnBackdrop) {
          this._addEventListener(this.backdrop, 'click', () => this.hide());
        }
      }

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
      if (this.options.closable) {
        const closeBtn = this.element.querySelector('.gh-modal-close');
        if (closeBtn) {
          this._addEventListener(closeBtn, 'click', () => this.hide());
        }
      }

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

      if (this.options.focus) {
        this.focusTrap = Utils.trapFocus(this.element);
        const firstFocusable = this.element.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }

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

      if (this.previousFocus && this.previousFocus.focus) {
        this.previousFocus.focus();
      }

      document.body.style.overflow = '';

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





  /**
   *
   * UI Manager
   *
   **/
  class UIManager {
    constructor() {
      this.components = new Map();
      this.activeModals = [];
      this.activeToasts = [];
      this.init();
    }

    init() {
      this.initTooltips();
      this.initPopovers();
      this.initDropdowns();
      this.initKeyboardShortcuts();
    }

    initTooltips() {
      document.querySelectorAll('[data-tooltip]').forEach(el => {
        if (!el._tooltip) {
          el._tooltip = new Tooltip(el, {
            content: el.getAttribute('data-tooltip'),
            placement: el.getAttribute('data-tooltip-placement') || 'auto',
            html: el.hasAttribute('data-tooltip-html')
          });
          this.register('tooltip', el._tooltip);
        }
      });
    }

    initPopovers() {
      document.querySelectorAll('[data-popover]').forEach(el => {
        if (!el._popover) {
          el._popover = new Popover(el, {
            content: el.getAttribute('data-popover'),
            title: el.getAttribute('data-popover-title'),
            placement: el.getAttribute('data-popover-placement') || 'auto',
            trigger: el.getAttribute('data-popover-trigger') || 'click',
            html: true
          });
          this.register('popover', el._popover);
        }
      });
    }

    initDropdowns() {
      document.querySelectorAll('[data-dropdown]').forEach(el => {
        if (!el._dropdown) {
          el._dropdown = new Dropdown(el, {
            placement: el.getAttribute('data-dropdown-placement') || 'bottom-start'
          });
          this.register('dropdown', el._dropdown);
        }
      });
    }

    initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          this.showSearchModal();
        }

        if (e.key === 'Escape' && this.activeModals.length > 0) {
          const topModal = this.activeModals[this.activeModals.length - 1];
          if (topModal.options.closeOnEscape !== false) {
            topModal.hide();
          }
        }
      });
    }

    register(type, component) {
      if (!this.components.has(type)) {
        this.components.set(type, new Set());
      }
      this.components.get(type).add(component);
      
      if (component instanceof Modal) {
        component.on('show', () => {
          this.activeModals.push(component);
        });
        
        component.on('hide', () => {
          const index = this.activeModals.indexOf(component);
          if (index > -1) {
            this.activeModals.splice(index, 1);
          }
        });
      }

      return component;
    }

    createTooltip(element, options) {
      const tooltip = new Tooltip(element, options);
      this.register('tooltip', tooltip);
      return tooltip;
    }

    createPopover(element, options) {
      const popover = new Popover(element, options);
      this.register('popover', popover);
      return popover;
    }

    createDropdown(element, options) {
      const dropdown = new Dropdown(element, options);
      this.register('dropdown', dropdown);
      return dropdown;
    }

    createModal(options) {
      const modal = new Modal(options);
      this.register('modal', modal);
      return modal;
    }

    destroyAll() {
      this.components.forEach((components) => {
        components.forEach(component => component.destroy());
      });
      this.components.clear();
      this.activeModals = [];
      this.activeToasts = [];
    }
  }









  // Global initialization
  window.GithubUI = {
    UIManager,
    Utils,
    BaseComponent,
    Tooltip,
    Popover,
    Dropdown,
    Modal,
    EventEmitter,
    PositionManager
  };

  window.GHUI = new UIManager();

  window.$gh = (selector) => {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    return {
      tooltip: (options) => window.GHUI.createTooltip(element, options),
      popover: (options) => window.GHUI.createPopover(element, options),
      dropdown: (options) => window.GHUI.createDropdown(element, options)
    };
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.GithubUI;
    module.exports.GHUI = window.GHUI;
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.GHUI = window.GHUI || new UIManager();
    });
  } else {
    window.GHUI = window.GHUI || new UIManager();
  }

})(window, document);

export const {
  UIManager,
  Utils,
  BaseComponent,
  Tooltip,
  Popover,
  Dropdown,
  Modal,
  EventEmitter,
  PositionManager
} = window.GithubUI;

export const GHUI = window.GHUI;
export default window.GithubUI;