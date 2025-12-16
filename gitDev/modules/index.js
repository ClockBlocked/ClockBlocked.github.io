window.addEventListener("DOMContentLoaded", () => {

    const coderTemplateScript = document.createElement('script');
    coderTemplateScript.src = 'https://clockblocked.github.io/gitDev/modules/coder-template.js';

    const dependenciesScript = document.createElement('script');
    dependenciesScript.src = 'https://clockblocked.github.io/gitDev/modules/dependencies.js';

    const storageScript = document.createElement('script');
    storageScript.src = 'https://clockblocked.github.io/gitDev/modules/storage.js';

    const routerScript = document.createElement('script');
    routerScript.src = 'https://clockblocked.github.io/gitDev/modules/router.js';

    const pageUpdatesScript = document.createElement('script');
    pageUpdatesScript.src = 'https://clockblocked.github.io/gitDev/modules/pageUpdates.js';

    const overlaysScript = document.createElement('script');
    overlaysScript.src = 'https://clockblocked.github.io/gitDev/modules/overlays.js';

    const coreScript = document.createElement('script');
    coreScript.src = 'https://clockblocked.github.io/gitDev/modules/core.js';

    const listenersScript = document.createElement('script');
    listenersScript.src = 'https://clockblocked.github.io/gitDev/modules/listeners.js';

    const searchScript = document.createElement('script');
    searchScript.src = 'https://clockblocked.github.io/gitDev/modules/search.js';

    const fileUploadScript = document.createElement('script');
    fileUploadScript.src = 'https://clockblocked.github.io/gitDev/modules/fileUpload.js';

    const importExportScript = document.createElement('script');
    importExportScript.src = 'https://clockblocked.github.io/gitDev/modules/importExport.js';

    const fileMenuScript = document.createElement('script');
    fileMenuScript.src = 'https://clockblocked.github.io/gitDev/modules/fileMenu.js';

    const coder = document.createElement('script');
    coder.src = 'https://clockblocked.github.io/gitDev/modules/coder.js';

    const elementChecks = document.createElement('script');
    elementChecks.src = 'https://clockblocked.github.io/gitDev/modules/utilities/elements.js';

    const scripts = [
        elementChecks,
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
        fileMenuScript,
        coderTemplateScript,
        coder,
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

                console.log('All gitDev modules loaded successfully');
                console.log('coderArea available:', typeof window.coderArea !== 'undefined');
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