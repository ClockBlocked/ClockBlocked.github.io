class Router {
    constructor() {
        this.routes = new Map();
        this.currentView = null;
        this.previousView = null;
        this.transitionDuration = 300;
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.setupGlobalListeners();
    }

    setupGlobalListeners() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('href');
                this.navigate(route);
            }
        });
    }

    register(path, handler, options = {}) {
        this.routes.set(path, { handler, ...options });
    }

    async navigate(path, data = {}) {
        if (this.currentView === path) return;
        
        App.showGlobalLoading();
        
        try {
            await this.transitionOut();
            
            const route = this.findRoute(path);
            if (!route) {
                await this.show404();
                return;
            }
            
            await route.handler(data);
            this.previousView = this.currentView;
            this.currentView = path;
            
            window.history.pushState(data, '', path);
            
            await this.transitionIn();
        } catch (error) {
            console.error('Route error:', error);
            App.showErrorMessage('Navigation failed');
        } finally {
            App.hideGlobalLoading();
        }
    }

    async handleRoute() {
        const path = window.location.pathname || '/';
        await this.navigate(path);
    }

    findRoute(path) {
        for (const [routePattern, route] of this.routes.entries()) {
            if (this.matchRoute(routePattern, path)) {
                return route;
            }
        }
        return null;
    }

    matchRoute(pattern, path) {
        if (pattern === path) return true;
        if (pattern.includes(':')) {
            const patternParts = pattern.split('/');
            const pathParts = path.split('/');
            if (patternParts.length !== pathParts.length) return false;
            
            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':') && pathParts[i]) {
                    continue;
                }
                if (patternParts[i] !== pathParts[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    async transitionOut() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent || !mainContent.firstChild) return;
        
        return new Promise(resolve => {
            mainContent.firstChild.classList.add('fade-out');
            setTimeout(() => {
                mainContent.innerHTML = '';
                resolve();
            }, this.transitionDuration);
        });
    }

    async transitionIn() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent || !mainContent.firstChild) return;
        
        return new Promise(resolve => {
            mainContent.firstChild.classList.add('page-transition');
            setTimeout(() => {
                mainContent.firstChild.classList.add('active');
                resolve();
            }, 10);
        });
    }

    async show404() {
        await templateManager.render('404', document.getElementById('mainContent'));
    }

    extractParams(pattern, path) {
        const params = {};
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        
        patternParts.forEach((part, index) => {
            if (part.startsWith(':')) {
                const paramName = part.substring(1);
                params[paramName] = pathParts[index];
            }
        });
        
        return params;
    }
}

const router = new Router();