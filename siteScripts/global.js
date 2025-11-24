// Consolidated initialization without duplicates
const initializeApp = () => {
    clickables.init();
    musicPlayer.mainPlayer.init();
    musicPlayer.mainPlayer.initialize();
    
    const progressBar = $byId(IDS.musicPlayerProgressBar);
    if (progressBar) {
        progressBar.addEventListener('keydown', musicPlayer.ui.handleProgressBarKeyDown);
    }
    
    if (!window.appState || !window.appState.initialized) {
        app.initialize();
    }
    
    // Initialize media session notifications
    setTimeout(() => {
        if (notificationPlayer.utils.isSupported()) {
            notificationPlayer.setup();
        }
    }, 100);
};

// Single initialization handler
const handleDOMReady = () => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
};

// Set up global references
window.clickables = clickables;
window.musicPlayer = musicPlayer;
window.navigation = navigation;
window.playlists = playlists;
window.views = views;

window.MyTunesApp = {
    initialize: app.initialize,
    state: () => appState,
    api: () => window.musicAppAPI,
    goHome: app.goHome,
};

// Initialize if music data is already available, otherwise wait for DOM
if (window.music) {
    handleDOMReady();
} else {
    // Still set up the initialization for when music loads later
    handleDOMReady();
    
    // Fallback for music loading after DOM is ready
    window.addEventListener('load', () => {
        if (window.music && (!window.appState || !window.appState.initialized)) {
            app.initialize();
        }
    });
}

export {
    appState,
    storage,
    notificationPlayer,
    musicPlayer,
    dropdown,
    overlays,
    playlists,
    notifications,
    utils,
    app,
    pageLoader,
    navigation,
    ACTION_GRID_ITEMS
};