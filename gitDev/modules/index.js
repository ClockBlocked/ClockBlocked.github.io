(function() {
    const SCRIPT_REGISTRY = {
        scripts: new Map(),
        loadOrder: [],
        startTime: performance.now()
    };
    const SCRIPT_MANIFEST = [
        { id: "elements", url: "https://clockblocked.github.io/gitDev/modules/utilities/elements.js", category: "Utility", priority: 1, critical: true },
        { id: "dependencies", url: "https://clockblocked.github.io/gitDev/modules/dependencies.js", category: "Primary", priority: 2, critical: true },
        { id: "storage", url: "https://clockblocked.github.io/gitDev/modules/storage.js", category: "Service", priority: 3, critical: true },
        { id: "router", url: "https://clockblocked.github.io/gitDev/modules/router.js", category: "Primary", priority: 4, critical: true },
        { id: "pageUpdates", url: "https://clockblocked.github.io/gitDev/modules/pageUpdates.js", category: "UI", priority: 5, critical: false },
        { id: "overlays", url: "https://clockblocked.github.io/gitDev/modules/overlays.js", category: "UI", priority: 6, critical: false },
        { id: "core", url: "https://clockblocked.github.io/gitDev/modules/core.js", category: "Primary", priority: 7, critical: true },
        { id: "listeners", url: "https://clockblocked.github.io/gitDev/modules/listeners.js", category: "Helper", priority: 8, critical: false },
        { id: "search", url: "https://clockblocked.github.io/gitDev/modules/search.js", category: "Feature", priority: 9, critical: false },
        { id: "fileUpload", url: "https://clockblocked.github.io/gitDev/modules/fileUpload.js", category: "Feature", priority: 10, critical: false },
        { id: "importExport", url: "https://clockblocked.github.io/gitDev/modules/importExport.js", category: "Feature", priority: 11, critical: false },
        { id: "fileMenu", url: "https://clockblocked.github.io/gitDev/modules/fileMenu.js", category: "UI", priority: 12, critical: false },
        { id: "coder", url: "https://clockblocked.github.io/gitDev/modules/coder.js", category: "Feature", priority: 13, critical: false }
    ];
    const CATEGORY_COLORS = {
        Primary: "#3b82f6",
        UI: "#8b5cf6",
        Helper: "#10b981",
        Service: "#f59e0b",
        Feature: "#ec4899",
        Utility: "#6366f1",
        Custom: "#0ea5e9"
    };
    const STATUS_STYLES = {
        Loaded: "color: #10b981; font-weight: bold;",
        Failed: "color: #ef4444; font-weight: bold;",
        Pending: "color: #f59e0b; font-weight: bold;",
        Retrying: "color: #3b82f6; font-weight: bold;"
    };
    function generateCacheBuster() {
        return `v=${Date.now()}`;
    }
    function formatBytes(bytes) {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
    function formatDuration(ms) {
        if (ms < 1000) return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }
    function extractExports(scriptId) {
        const knownExports = {
            elements: ["isElement", "isNodeList", "isHTMLCollection", "toArray", "ElementUtils"],
            dependencies: ["DependencyManager", "loadDependency"],
            storage: ["StorageManager", "LocalDB", "SessionCache"],
            router: ["Router", "navigate", "getCurrentRoute"],
            pageUpdates: ["PageUpdater", "refreshContent"],
            overlays: ["OverlayManager", "Modal", "Toast", "Notification"],
            core: ["App", "initializeApp", "SidebarManager"],
            listeners: ["EventListenersManager", "eventListeners", "setupEventListeners"],
            search: ["SearchManager", "performSearch"],
            fileUpload: ["FileUploader", "uploadFile"],
            importExport: ["ImportExport", "exportData", "importData"],
            fileMenu: ["FileMenu", "ContextMenu"],
            coder: ["coderViewEdit"]
        };
        return knownExports[scriptId] || [];
    }
    function autoExposeGlobals(scriptId) {
        const expectedExports = extractExports(scriptId);
        const exposed = [];
        expectedExports.forEach(name => {
            if (typeof window[name] !== "undefined") exposed.push(name);
        });
        return exposed;
    }
    function loadScript(manifest) {
        return new Promise((resolve, reject) => {
            const scriptData = {
                id: manifest.id,
                url: manifest.url,
                category: manifest.category,
                priority: manifest.priority,
                critical: manifest.critical,
                status: "Pending",
                startTime: performance.now(),
                endTime: null,
                duration: null,
                size: null,
                retryCount: 0,
                maxRetries: 3,
                exports: [],
                error: null
            };
            SCRIPT_REGISTRY.scripts.set(manifest.id, scriptData);
            const script = document.createElement("script");
            script.src = `${manifest.url}?${generateCacheBuster()}`;
            script.async = false;
            script.dataset.scriptId = manifest.id;
            script.onload = () => {
                scriptData.endTime = performance.now();
                scriptData.duration = scriptData.endTime - scriptData.startTime;
                scriptData.status = "Loaded";
                scriptData.exports = autoExposeGlobals(manifest.id);
                SCRIPT_REGISTRY.loadOrder.push(manifest.id);
                fetch(manifest.url, { method: "HEAD" })
                    .then(response => {
                        const size = response.headers.get("content-length");
                        if (size) scriptData.size = parseInt(size, 10);
                    })
                    .catch(() => {});
                resolve(scriptData);
            };
            script.onerror = error => {
                scriptData.status = "Failed";
                scriptData.error = error;
                scriptData.endTime = performance.now();
                scriptData.duration = scriptData.endTime - scriptData.startTime;
                reject(scriptData);
            };
            document.head.appendChild(script);
        });
    }
    function retryScript(scriptId) {
        const scriptData = SCRIPT_REGISTRY.scripts.get(scriptId);
        if (!scriptData) {
            console.error(`Script "${scriptId}" not found in registry`);
            return Promise.reject(new Error("Script not found"));
        }
        if (scriptData.retryCount >= scriptData.maxRetries) {
            console.error(`Max retries (${scriptData.maxRetries}) reached for "${scriptId}"`);
            return Promise.reject(new Error("Max retries reached"));
        }
        scriptData.retryCount++;
        scriptData.status = "Retrying";
        const existingScript = document.querySelector(`script[data-script-id="${scriptId}"]`);
        if (existingScript) existingScript.remove();
        const manifest = SCRIPT_MANIFEST.find(m => m.id === scriptId);
        return loadScript(manifest).then(data => {
            renderScriptTable();
            return data;
        });
    }
    function renderScriptTable() {
        console.clear();
        const totalTime = performance.now() - SCRIPT_REGISTRY.startTime;
        const loadedCount = Array.from(SCRIPT_REGISTRY.scripts.values()).filter(s => s.status === "Loaded").length;
        const failedCount = Array.from(SCRIPT_REGISTRY.scripts.values()).filter(s => s.status === "Failed").length;
        const totalCount = SCRIPT_REGISTRY.scripts.size;
        console.log("%c╔══════════════════════════════════════════════════════════════════════════╗", "color: #4b5563; font-weight: bold;");
        console.log("%c║                    gitDev Module Loader                                  ║", "color: #3b82f6; font-weight: bold; font-size: 14px;");
        console.log("%c╚══════════════════════════════════════════════════════════════════════════╝", "color: #4b5563; font-weight: bold;");
        console.log("");
        console.log(
            `%c📦 Total: ${totalCount} %c│ %c✅ Loaded: ${loadedCount} %c│ %c❌ Failed: ${failedCount} %c│ %c⏱️ Time: ${formatDuration(totalTime)}`,
            "color: #6366f1; font-weight: bold;",
            "color: #4b5563;",
            "color: #10b981; font-weight: bold;",
            "color: #4b5563;",
            "color: #ef4444; font-weight: bold;",
            "color: #4b5563;",
            "color: #f59e0b; font-weight: bold;"
        );
        console.log("");
        const tableData = [];
        SCRIPT_REGISTRY.scripts.forEach((data, id) => {
            tableData.push({
                "#": data.priority,
                "Cat.": data.category,
                Module: id,
                Status: data.status,
                Time: data.duration ? formatDuration(data.duration) : "—",
                Size: data.size ? formatBytes(data.size) : "—",
                Retries: data.retryCount > 0 ? data.retryCount : "—",
                Critical: data.critical ? "⚠️" : "—",
                Exports: data.exports.length > 0 ? data.exports.join(", ") : "—"
            });
        });
        tableData.sort((a, b) => a["#"] - b["#"]);
        console.table(tableData);
        const failedScripts = Array.from(SCRIPT_REGISTRY.scripts.entries()).filter(([_, data]) => data.status === "Failed");
        if (failedScripts.length > 0) {
            console.log("");
            console.log("%c⚠️ Failed Scripts - Click to Retry:", "color: #ef4444; font-weight: bold; font-size: 12px;");
            console.log("");
            failedScripts.forEach(([id]) => {
                console.log(`%c🔄 Retry ${id}`, "color: #3b82f6; font-weight: bold; cursor: pointer; text-decoration: underline;");
                console.log(`   Run: %cgitDevLoader.retry('${id}')`, "color: #10b981; font-family: monospace;");
            });
        }
        console.log("");
        console.log("%c📋 Available Commands:", "color: #8b5cf6; font-weight: bold;");
        console.log("%c   gitDevLoader.status()      %c— Show this table", "color: #10b981; font-family: monospace;", "color: #6b7280;");
        console.log("%c   gitDevLoader.retry(id)     %c— Retry a failed script", "color: #10b981; font-family: monospace;", "color: #6b7280;");
        console.log("%c   gitDevLoader.retryAll()    %c— Retry all failed scripts", "color: #10b981; font-family: monospace;", "color: #6b7280;");
        console.log("%c   gitDevLoader.list()        %c— List all loaded globals", "color: #10b981; font-family: monospace;", "color: #6b7280;");
        console.log("%c   gitDevLoader.reload(id)    %c— Force reload a script", "color: #10b981; font-family: monospace;", "color: #6b7280;");
        console.log("%c   gitDevLoader.manifest      %c— View script manifest", "color: #10b981; font-family: monospace;", "color: #6b7280;");
        console.log("");
    }
    async function loadAllScripts() {
        const sortedManifest = [...SCRIPT_MANIFEST].sort((a, b) => a.priority - b.priority);
        for (const manifest of sortedManifest) {
            try {
                await loadScript(manifest);
            } catch (error) {
                console.warn(`Failed to load ${manifest.id}, continuing...`);
                if (manifest.critical) console.error(`Critical script "${manifest.id}" failed to load!`);
            }
        }
        renderScriptTable();
        setTimeout(() => {
            if (typeof SidebarManager !== "undefined" && SidebarManager.init) SidebarManager.init();
            if (typeof initializeApp === "function") initializeApp();
            window.dispatchEvent(new CustomEvent("gitDevReady", {
                detail: {
                    loadedCount: Array.from(SCRIPT_REGISTRY.scripts.values()).filter(s => s.status === "Loaded").length,
                    failedCount: Array.from(SCRIPT_REGISTRY.scripts.values()).filter(s => s.status === "Failed").length,
                    totalTime: performance.now() - SCRIPT_REGISTRY.startTime
                }
            }));
        }, 50);
    }
    window.gitDevLoader = {
        status: renderScriptTable,
        retry: function(scriptId) {
            return retryScript(scriptId).then(() => {
                console.log(`%c✅ Successfully reloaded "${scriptId}"`, "color: #10b981; font-weight: bold;");
            }).catch(err => {
                console.error(`❌ Failed to reload "${scriptId}":`, err.message);
            });
        },
        retryAll: function() {
            const failed = Array.from(SCRIPT_REGISTRY.scripts.entries()).filter(([_, data]) => data.status === "Failed").map(([id]) => id);
            if (failed.length === 0) {
                console.log("%c✅ No failed scripts to retry", "color: #10b981;");
                return Promise.resolve();
            }
            return Promise.all(failed.map(id => retryScript(id).catch(() => null))).then(() => {
                renderScriptTable();
            });
        },
        reload: function(scriptId) {
            const scriptData = SCRIPT_REGISTRY.scripts.get(scriptId);
            if (!scriptData) {
                console.error(`Script "${scriptId}" not found`);
                return Promise.reject(new Error("Script not found"));
            }
            const existingScript = document.querySelector(`script[data-script-id="${scriptId}"]`);
            if (existingScript) existingScript.remove();
            SCRIPT_REGISTRY.scripts.delete(scriptId);
            const manifest = SCRIPT_MANIFEST.find(m => m.id === scriptId);
            return loadScript(manifest).then(() => {
                renderScriptTable();
                console.log(`%c✅ Force reloaded "${scriptId}"`, "color: #10b981; font-weight: bold;");
            });
        },
        list: function() {
            const allExports = [];
            SCRIPT_REGISTRY.scripts.forEach((data, id) => {
                if (data.exports.length > 0) {
                    data.exports.forEach(exp => {
                        allExports.push({
                            Module: id,
                            Export: exp,
                            Type: typeof window[exp],
                            Available: typeof window[exp] !== "undefined" ? "✅" : "❌"
                        });
                    });
                }
            });
            console.table(allExports);
            return allExports;
        },
        get manifest() {
            return SCRIPT_MANIFEST;
        },
        get registry() {
            return Object.fromEntries(SCRIPT_REGISTRY.scripts);
        },
        getScript: function(scriptId) {
            return SCRIPT_REGISTRY.scripts.get(scriptId);
        },
        isLoaded: function(scriptId) {
            const data = SCRIPT_REGISTRY.scripts.get(scriptId);
            return data && data.status === "Loaded";
        },
        whenReady: function(callback) {
            if (SCRIPT_REGISTRY.scripts.size === SCRIPT_MANIFEST.length) {
                const allLoaded = Array.from(SCRIPT_REGISTRY.scripts.values()).every(s => s.status === "Loaded" || s.status === "Failed");
                if (allLoaded) {
                    callback();
                    return;
                }
            }
            window.addEventListener("gitDevReady", callback, { once: true });
        },
        addScript: function(config) {
            const newManifest = {
                id: config.id,
                url: config.url,
                category: config.category || "Custom",
                priority: config.priority || SCRIPT_MANIFEST.length + 1,
                critical: config.critical || false
            };
            SCRIPT_MANIFEST.push(newManifest);
            return loadScript(newManifest).then(() => {
                renderScriptTable();
            });
        }
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadAllScripts);
    else loadAllScripts();
})();
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