const DomSafety = {
  ensureElement: function(elementId, fallbackHtml = null) {
    let element = document.getElementById(elementId);
    
    if (!element) {
      element = document.createElement('div');
      element.id = elementId;
      
      if (fallbackHtml) {
        element.innerHTML = fallbackHtml;
      }
      
      document.body.appendChild(element);
    }
    
    return element;
  },
  
  safeQuerySelector: function(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      return null;
    }
  },
  
  safeQuerySelectorAll: function(selector, parent = document) {
    try {
      return Array.from(parent.querySelectorAll(selector));
    } catch (error) {
      return [];
    }
  },
  
  safeAddEventListener: function(element, event, handler, options = false) {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler, options);
      return true;
    }
    return false;
  },
  
  safeRemoveEventListener: function(element, event, handler, options = false) {
    if (element && typeof element.removeEventListener === 'function') {
      element.removeEventListener(event, handler, options);
      return true;
    }
    return false;
  },
  
  safeSetInnerHTML: function(element, html) {
    if (element && typeof element.innerHTML !== 'undefined') {
      element.innerHTML = html;
      return true;
    }
    return false;
  },
  
  safeSetTextContent: function(element, text) {
    if (element && typeof element.textContent !== 'undefined') {
      element.textContent = text;
      return true;
    }
    return false;
  },
  
  safeAddClass: function(element, className) {
    if (element && typeof element.classList !== 'undefined' && element.classList.contains) {
      element.classList.add(className);
      return true;
    }
    return false;
  },
  
  safeRemoveClass: function(element, className) {
    if (element && typeof element.classList !== 'undefined' && element.classList.contains) {
      element.classList.remove(className);
      return true;
    }
    return false;
  },
  
  safeToggleClass: function(element, className) {
    if (element && typeof element.classList !== 'undefined' && element.classList.contains) {
      element.classList.toggle(className);
      return true;
    }
    return false;
  },
  
  safeSetAttribute: function(element, attr, value) {
    if (element && typeof element.setAttribute === 'function') {
      element.setAttribute(attr, value);
      return true;
    }
    return false;
  },
  
  safeGetAttribute: function(element, attr) {
    if (element && typeof element.getAttribute === 'function') {
      return element.getAttribute(attr);
    }
    return null;
  },
  
  safeAppendChild: function(parent, child) {
    if (parent && child && typeof parent.appendChild === 'function') {
      parent.appendChild(child);
      return true;
    }
    return false;
  },
  
  safeRemoveChild: function(parent, child) {
    if (parent && child && typeof parent.removeChild === 'function') {
      parent.removeChild(child);
      return true;
    }
    return false;
  },
  
  safeCreateElement: function(tagName, options = {}) {
    try {
      const element = document.createElement(tagName);
      
      if (options.id) element.id = options.id;
      if (options.className) element.className = options.className;
      if (options.innerHTML) element.innerHTML = options.innerHTML;
      if (options.textContent) element.textContent = options.textContent;
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      
      return element;
    } catch (error) {
      return null;
    }
  },
  
  isElementVisible: function(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  },
  
  waitForElement: function(selector, timeout = 5000, interval = 100) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        
        if (element) {
          resolve(element);
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
          return;
        }
        
        setTimeout(checkElement, interval);
      };
      
      checkElement();
    });
  }
};

window.DomSafety = DomSafety;

function safeElement(id, fallbackHtml = null) {
  return DomSafety.ensureElement(id, fallbackHtml);
}

function safeQuery(selector, parent = document) {
  return DomSafety.safeQuerySelector(selector, parent);
}

function safeQueryAll(selector, parent = document) {
  return DomSafety.safeQuerySelectorAll(selector, parent);
}

window.safeElement = safeElement;
window.safeQuery = safeQuery;
window.safeQueryAll = safeQueryAll;

document.addEventListener('DOMContentLoaded', function() {
  const requiredElements = [
    'repoSelectorView',
    'explorerView', 
    'coder',
    'fileListBody',
    'repoList',
    'pathBreadcrumb'
  ];
  
  requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      const fallback = document.createElement('div');
      fallback.id = id;
      fallback.className = 'hidden';
      fallback.setAttribute('data-created', 'by-dom-safety');
      document.body.appendChild(fallback);
    }
  });
});