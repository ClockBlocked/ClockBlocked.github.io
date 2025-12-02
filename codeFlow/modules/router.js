// Simple Client-Side Router
class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Define routes
        this.defineRoutes();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());
        
        // Initial route handling
        this.handleRouteChange();
    }

    defineRoutes() {
        this.routes = [
            {
                path: '/',
                name: 'home',
                handler: () => {
                    if (app) {
                        app.navigateTo('home');
                    }
                }
            },
            {
                path: '/snippet/:id',
                name: 'view',
                handler: (params) => {
                    if (app) {
                        app.navigateTo('view', params);
                    }
                }
            },
            {
                path: '/edit/:id',
                name: 'edit',
                handler: (params) => {
                    if (app) {
                        app.navigateTo('edit', params);
                    }
                }
            },
            {
                path: '/new',
                name: 'new',
                handler: () => {
                    if (app) {
                        app.navigateTo('new');
                    }
                }
            },
            {
                path: '/profile',
                name: 'profile',
                handler: () => {
                    if (app) {
                        app.navigateTo('profile');
                    }
                }
            }
        ];
    }

    handleRouteChange() {
        const hash = window.location.hash.substring(1) || '/';
        this.navigate(hash);
    }

    navigate(path) {
        // Find matching route
        const route = this.findMatchingRoute(path);
        
        if (route) {
            this.currentRoute = route;
            route.handler(route.params);
        } else {
            // Redirect to home if route not found
            window.location.hash = '/';
        }
    }

    findMatchingRoute(path) {
        for (const route of this.routes) {
            const match = this.matchRoute(route.path, path);
            if (match) {
                return {
                    ...route,
                    params: match.params
                };
            }
        }
        return null;
    }

    matchRoute(routePattern, path) {
        const routeParts = routePattern.split('/').filter(p => p);
        const pathParts = path.split('/').filter(p => p);
        
        if (routeParts.length !== pathParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const pathPart = pathParts[i];
            
            if (routePart.startsWith(':')) {
                // This is a parameter
                const paramName = routePart.substring(1);
                params[paramName] = pathPart;
            } else if (routePart !== pathPart) {
                // Static part doesn't match
                return null;
            }
        }
        
        return { params };
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getCurrentPath() {
        return window.location.hash.substring(1) || '/';
    }

    goTo(path) {
        window.location.hash = path;
    }

    goBack() {
        window.history.back();
    }

    goForward() {
        window.history.forward();
    }

    replace(path) {
        window.location.replace(`#${path}`);
    }

    // Helper method to create links
    createLink(path, text, className = '') {
        const link = document.createElement('a');
        link.href = `#${path}`;
        link.textContent = text;
        link.className = className;
        return link;
    }

    // Update navigation active state
    updateNavigation() {
        const currentPath = this.getCurrentPath();
        
        // Update desktop nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPath = link.getAttribute('href')?.substring(1) || '/';
            if (linkPath === currentPath || 
                (linkPath === '/' && currentPath === '/') ||
                (linkPath !== '/' && currentPath.startsWith(linkPath))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Update mobile bottom nav links
        document.querySelectorAll('.bottom-nav-link').forEach(link => {
            const linkPath = link.getAttribute('href')?.substring(1) || '/';
            if (linkPath === currentPath || 
                (linkPath === '/' && currentPath === '/') ||
                (linkPath !== '/' && currentPath.startsWith(linkPath))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}