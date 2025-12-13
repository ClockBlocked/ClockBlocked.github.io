window.addEventListener("DOMContentLoaded", () => {

    const SCRIPT_CATEGORIES = {
        NAVIGATION: "Navigation",
        UI: "UI",
        STORAGE: "Storage",
        PRIMARY: "Primary",
        INTERACTIVE: "Interactive",
        OTHER: "Other"
    };

    const scriptRegistry = [
        {
            url: "https://clockblocked.github.io/gitDev/modules/dependencies.js",
            category: SCRIPT_CATEGORIES.PRIMARY
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/storage.js",
            category: SCRIPT_CATEGORIES.STORAGE
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/router.js",
            category: SCRIPT_CATEGORIES.NAVIGATION
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/pageUpdates.js",
            category: SCRIPT_CATEGORIES.UI
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/overlays.js",
            category: SCRIPT_CATEGORIES.UI
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/core.js",
            category: SCRIPT_CATEGORIES.PRIMARY
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/listeners.js",
            category: SCRIPT_CATEGORIES.INTERACTIVE
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/search.js",
            category: SCRIPT_CATEGORIES.INTERACTIVE
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/fileUpload.js",
            category: SCRIPT_CATEGORIES.INTERACTIVE
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/importExport.js",
            category: SCRIPT_CATEGORIES.OTHER
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/fileMenu.js",
            category: SCRIPT_CATEGORIES.UI
        },
        {
            url: "https://clockblocked.github.io/gitDev/modules/components/coder.js",
            category: SCRIPT_CATEGORIES.UI
        }
    ];

    const scriptStatusMap = {};
    let completedCount = 0;

    function loadScript(entry) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = entry.url;
            script.async = false;

            script.onload = () => {
                scriptStatusMap[entry.url] = "Loaded";
                resolve();
            };

            script.onerror = () => {
                scriptStatusMap[entry.url] = "Error";
                resolve();
            };

            document.head.appendChild(script);
        });
    }

    function retryScript(url) {
        console.clear();
        console.log("Retrying script:", url);

        scriptStatusMap[url] = "Retrying";

        loadScript(
            scriptRegistry.find(s => s.url === url)
        ).then(renderConsoleTable);
    }

    function renderConsoleTable() {
        const tableData = scriptRegistry.map(entry => ({
            URL: entry.url,
            Category: entry.category,
            Status: scriptStatusMap[entry.url] || "Pending",
            Retry:
                scriptStatusMap[entry.url] === "Error"
                    ? `retryScript("${entry.url}")`
                    : ""
        }));

        console.groupCollapsed("📦 Script Load Status");
        console.table(tableData);
        console.log(
            "To retry a failed script, run:",
            "\nretryScript(\"<SCRIPT_URL>\")"
        );
        console.groupEnd();
    }

    // expose retry globally for console usage
    window.retryScript = retryScript;

    (async function loadAllScripts() {
        for (const entry of scriptRegistry) {
            await loadScript(entry);
            completedCount++;
        }

        renderConsoleTable();

        if (completedCount === scriptRegistry.length) {
            setTimeout(() => {

                if (typeof SidebarManager !== "undefined" && SidebarManager.init) {
                    SidebarManager.init();
                }

                if (typeof initializeApp === "function") {
                    initializeApp();
                }

                // Initialize code viewer manager if available
                if (typeof CodeViewerEditor !== "undefined" && CodeViewerEditor.init) {
                    CodeViewerEditor.init();
                }

                console.log("All modules processed");

            }, 50);
        }
    })();

});