window.addEventListener("DOMContentLoaded", () => {

    const dependenciesScript = document.createElement('script');
    dependenciesScript.src = 'https://gitdev.wuaze.com/modules/dependencies.js';

    const storageScript = document.createElement('script');
    storageScript.src = 'https://gitdev.wuaze.com/modules/storage.js';

    const routerScript = document.createElement('script');
    routerScript.src = 'https://gitdev.wuaze.com/modules/router.js';

    const pageUpdatesScript = document.createElement('script');
    pageUpdatesScript.src = 'https://gitdev.wuaze.com/modules/pageUpdates.js';

    const overlaysScript = document.createElement('script');
    overlaysScript.src = 'https://gitdev.wuaze.com/modules/overlays.js';

    const coreScript = document.createElement('script');
    coreScript.src = 'https://gitdev.wuaze.com/modules/core.js';

    const listenersScript = document.createElement('script');
    listenersScript.src = 'https://gitdev.wuaze.com/modules/listeners.js';

    const searchScript = document.createElement('script');
    searchScript.src = 'https://gitdev.wuaze.com/modules/search.js';

    const fileUploadScript = document.createElement('script');
    fileUploadScript.src = 'https://gitdev.wuaze.com/modules/fileUpload.js';

    const importExportScript = document.createElement('script');
    importExportScript.src = 'https://gitdev.wuaze.com/modules/importExport.js';

    const fileMenuScript = document.createElement('script');
    fileMenuScript.src = 'https://gitdev.wuaze.com/modules/fileMenu.js';

    const scripts = [
        dependenciesScript,
        storageScript,
        routerScript,
        pageUpdatesScript,
        overlaysScript,
        coreScript,
        listenersScript,
        searchScript,
        fileUploadScript,
        importExportScript,
        fileMenuScript
    ];

    let loadedCount = 0;

    function checkAllLoaded() {
        loadedCount++;
        if (loadedCount === scripts.length) {
            setTimeout(() => {

                if (typeof SidebarManager !== "undefined" && SidebarManager.init) {
                    SidebarManager.init();
                }

                if (typeof initializeApp === "function") {
                    initializeApp();
                }

                console.log('âœ… All GitDev modules loaded successfully');

            }, 50);
        }
    }

    scripts.forEach(script => {
        script.onload = checkAllLoaded;
        script.onerror = () => {
            console.error("Failed to load script:", script.src);
            checkAllLoaded();
        };
        document.head.appendChild(script);
    });
});