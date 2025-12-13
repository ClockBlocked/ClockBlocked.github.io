class TemplateManager {
    constructor() {
        this.templates = new Map();
        this.cache = new Map();
        this.basePath = './modules/templates/';
        this.loadingPromises = new Map();
    }

    async loadTemplate(templateName) {
        if (this.templates.has(templateName)) {
            return this.templates.get(templateName);
        }

        if (this.loadingPromises.has(templateName)) {
            return this.loadingPromises.get(templateName);
        }

        const loadPromise = this.fetchTemplate(templateName).then(html => {
            const template = this.createTemplate(html);
            this.templates.set(templateName, template);
            this.loadingPromises.delete(templateName);
            return template;
        });

        this.loadingPromises.set(templateName, loadPromise);
        return loadPromise;
    }

    async fetchTemplate(templateName) {
        const response = await fetch(`${this.basePath}${templateName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load template: ${templateName}`);
        }
        return await response.text();
    }

    createTemplate(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template;
    }

    async render(templateName, container, data = {}) {
        const template = await this.loadTemplate(templateName);
        const clone = document.importNode(template.content, true);
        
        this.bindData(clone, data);
        
        if (container) {
            container.innerHTML = '';
            container.appendChild(clone);
        }
        
        return clone;
    }

    bindData(element, data) {
        const elements = element.querySelectorAll('[data-bind]');
        elements.forEach(el => {
            const bindings = el.getAttribute('data-bind').split(',');
            bindings.forEach(binding => {
                const [property, attribute] = binding.trim().split(':');
                if (data[property] !== undefined) {
                    if (attribute) {
                        el.setAttribute(attribute, data[property]);
                    } else {
                        el.textContent = data[property];
                    }
                }
            });
        });

        const events = element.querySelectorAll('[data-event]');
        events.forEach(el => {
            const [eventName, handler] = el.getAttribute('data-event').split(':');
            if (window[handler]) {
                el.addEventListener(eventName, window[handler]);
            }
        });
    }

    async preload(templates) {
        const promises = templates.map(template => this.loadTemplate(template));
        await Promise.all(promises);
    }

    clearCache() {
        this.templates.clear();
        this.cache.clear();
        this.loadingPromises.clear();
    }
}

const templateManager = new TemplateManager();