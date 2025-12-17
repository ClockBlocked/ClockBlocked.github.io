class coderViewEdit {
  constructor() {
    this.currentFile = null;
    this.fileData = null;
    this.codeMirror = null;
    this.isEditing = false;
    this.isLoading = false;
    this.originalContent = "";
    this.isInitialized = false;
    this.isFullscreen = false;
    this.elements = {};
    this.state = {
      fontSize: 12,
      wrapLines: true,
      showInvisibles: false,
      highlightActiveLine: true,
      autoSave: false,
      autoSaveInterval: null
    };
  }

  init() {
    if (this.isInitialized) return;
    const filePage = document.querySelector('.pages[data-page="file"]');
    if (!filePage) return;
    filePage.innerHTML = this.getTemplate();
    this.cacheElements();
    this.bindEvents();
    this.injectStyles();
    if (typeof CodeMirror !== "undefined") this.setupCodeMirror();
    else setTimeout(() => this.setupCodeMirror(), 100);
    this.loadUserPreferences();
    this.isInitialized = true;
  }

  getTemplate() {
    return `
    <div class="container">
    <nav class="navigation">
    <button onclick="showExplorer()" class="navButton">${window.currentState?.repository || "Repository"}</button>
    <span class="separator">/</span>
    <input type="text" id="fileNameInput" class="fileNameInput" value="" readonly />
    </nav>
    <div class="buttonGroup">
    <button id="editToggleBtn" class="actionButton" title="Edit"><svg class="icon" fill="currentColor" viewBox="0 0 16 16"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/></svg><span>Edit</span></button>
    <button id="copyBtn" class="actionButton" title="Copy"><svg class="icon" fill="currentColor" viewBox="0 0 16 16"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>Copy</button>
    <button id="downloadBtn" class="actionButton" title="Download"><svg class="icon" fill="currentColor" viewBox="0 0 16 16"><path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/><path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/></svg>Download</button>
    </div>
    </div>
    <div class="fileHeader">
    <div class="toolbarGroup">
    <button id="themeToggleBtn" class="toolbarButton" title="Toggle Theme"><svg id="themeIcon" class="smallIcon" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/></svg></button>
    <div data-toolbar="fontSize" class="fontSizeControl">
    <button id="decreaseFontBtn" class="fontButton"><svg class="tinyIcon" fill="currentColor" viewBox="0 0 16 16"><path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Z"/></svg></button>
    <span id="fontSizeDisplay" class="fontSizeDisplay">12px</span>
    <button id="increaseFontBtn" class="fontButton"><svg class="tinyIcon" fill="currentColor" viewBox="0 0 16 16"><path d="M7.25 3.75a.75.75 0 0 1 1.5 0V7.25h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5Z"/></svg></button>
    </div>
    <button id="wrapLinesBtn" class="toolbarButton" title="Wrap Lines"><svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16"><path d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5ZM3 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg></button>
    <button id="searchBtn" class="toolbarButton" title="Search"><svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16"><path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/></svg></button>
    <button id="foldAllBtn" class="toolbarButton" title="Fold All"><svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16"><path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25ZM8 10a.75.75 0 0 1-.53-.22l-2.25-2.25a.751.751 0 0 1 1.06-1.06L8 8.19l1.72-1.72a.751.751 0 0 1 1.06 1.06l-2.25 2.25A.75.75 0 0 1 8 10Z"/></svg></button>
    <button id="unfoldAllBtn" class="toolbarButton" title="Unfold All"><svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16"><path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25ZM8 6a.75.75 0 0 1 .53.22l2.25 2.25a.751.751 0 0 1-1.06 1.06L8 7.81l-1.72 1.72a.751.751 0 0 1-1.06-1.06l2.25-2.25A.75.75 0 0 1 8 6Z"/></svg></button>
    <button id="fullscreenBtn" class="toolbarButton" title="Fullscreen"><svg id="fullscreenIcon" class="smallIcon" fill="currentColor" viewBox="0 0 16 16"><path d="M3.75 2h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v2.5a.75.75 0 0 1-1.5 0v-2.5C2 2.784 2.784 2 3.75 2Zm6.5 0h2.5C13.216 2 14 2.784 14 3.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1 0-1.5ZM3.5 9.75a.75.75 0 0 0-1.5 0v2.5c0 .966.784 1.75 1.75 1.75h2.5a.75.75 0 0 1 0-1.5h-2.5a.25.25 0 0 1-.25-.25Zm9 0a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 12.25 14h-2.5a.75.75 0 0 1 0-1.5h2.5a.25.25 0 0 0 .25-.25Z"/></svg></button>
    <button id="formatCodeBtn" class="toolbarButton hidden" title="Format"><svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16"><path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06l-4.25-4.25Z"/></svg></button>
    </div>
    </div>
    <div id="coderWrapper">
    <div id="loadingSpinner" class="loading-spinner" data-active="false"><div class="spinner-overlay"><svg class="spinner-svg" viewBox="0 0 50 50"><circle class="spinner-track" cx="25" cy="25" r="20"></circle><circle class="spinner-circle" cx="25" cy="25" r="20"></circle></svg></div></div>
    <div id="codeMirrorContainer"></div>
    </div>
    <div class="fileFooter">
    <div class="footerStats">
    <span id="fileLinesCount">0 lines</span><span class="footerDivider">•</span>
    <span id="fileSize">0 KB</span><span class="footerDivider">•</span>
    <span id="fileLanguageDisplay">Text</span>
    </div>
    <div class="footerRight">
    <span id="cursorPosition" class="cursorInfo">Ln 1, Col 1</span><span class="footerDivider">•</span>
    <span id="selectionInfo" class="selectionInfo"></span>
    <span id="encodingDisplay" class="encodingInfo">UTF-8</span>
    </div>
    </div>
    <div id="commitPanel" class="commitPanel hidden">
    <h3 class="panelTitle">Commit changes</h3>
    <div class="panelContent">
    <div><input type="text" id="commitTitleInput" class="commitInput" placeholder="Update filename.ext"/></div>
    <div><textarea id="commitDescriptionInput" rows="4" class="commitTextarea" placeholder="Add an optional extended description..."></textarea></div>
    <div class="panelButtons">
    <button id="cancelEditBtn" class="secondaryButton">Cancel</button>
    <button id="saveChangesBtn" class="primaryButton">Commit changes</button>
    </div>
    </div>
    </div>`;
  }

  injectStyles() {
    if (document.getElementById("coderViewEditStyles")) return;
    const s = document.createElement("style");
    s.id = "coderViewEditStyles";
    s.textContent = `
    #coderWrapper{display:flex;flex-direction:column;height:65svh;min-height:300px;max-height:calc(100vh - 200px);background-color:var(--bgCode);border:1px solid var(--borderDefault);overflow:hidden;position:relative;margin:0 0.5rem;border-bottom-left-radius:8px;border-bottom-right-radius:8px;transition:all 0.3s ease}
    #coderWrapper.fullscreen{position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;max-height:100vh;margin:0;border-radius:0;z-index:9999;border:none}
    #codeMirrorContainer{flex:1 1 auto;min-height:0;width:100%;overflow:hidden;display:flex;flex-direction:column}
    #codeMirrorContainer .CodeMirror{height:100%!important;width:100%!important;flex:1 1 auto;background-color:var(--bgCode)!important;font-family:'JetBrains Mono','Fira Code',Consolas,monospace;line-height:1.6}
    #codeMirrorContainer .CodeMirror-scroll{overflow:auto!important}
    #codeMirrorContainer .CodeMirror-gutters{background-color:var(--bgCode)!important;border-right:1px solid var(--borderDefault)}
    #codeMirrorContainer .CodeMirror-gutter{background-color:var(--bgCode)!important}
    #codeMirrorContainer .CodeMirror-linenumber{color:var(--textMuted);padding:0 8px 0 12px;min-width:40px}
    #codeMirrorContainer .CodeMirror-foldgutter{width:16px}
    #codeMirrorContainer .CodeMirror-foldgutter-open,#codeMirrorContainer .CodeMirror-foldgutter-folded{cursor:pointer;color:var(--textMuted);font-size:14px;line-height:1.6;text-align:center;transition:color 0.15s ease}
    #codeMirrorContainer .CodeMirror-foldgutter-open::after{content:"▾";display:inline-block}
    #codeMirrorContainer .CodeMirror-foldgutter-folded::after{content:"▸";display:inline-block}
    #codeMirrorContainer .CodeMirror-foldgutter-open:hover,#codeMirrorContainer .CodeMirror-foldgutter-folded:hover{color:var(--textPrimary)}
    #codeMirrorContainer .CodeMirror-foldmarker{background-color:var(--bgSecondary);color:var(--textSecondary);border:1px solid var(--borderDefault);border-radius:4px;padding:0 6px;margin:0 4px;font-size:11px;cursor:pointer}
    #codeMirrorContainer .CodeMirror-activeline-background{background-color:var(--bgHover)!important}
    #codeMirrorContainer .CodeMirror-activeline-gutter{background-color:var(--bgHover)!important}
    #codeMirrorContainer .CodeMirror-selected{background-color:var(--bgSelection)!important}
    #codeMirrorContainer .CodeMirror-matchingbracket{color:var(--accentPrimary)!important;background-color:var(--bgHover);border-bottom:2px solid var(--accentPrimary)}
    #codeMirrorContainer .CodeMirror-cursor{border-left:2px solid var(--accentPrimary)}
    .fileFooter{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background-color:var(--bgSecondary);border:1px solid var(--borderDefault);border-top:none;margin:0 0.5rem;font-size:12px;color:var(--textSecondary)}
    .footerStats,.footerRight{display:flex;align-items:center;gap:8px}
    .footerDivider{color:var(--textMuted);opacity:0.5}
    .toolbarButton.active{background-color:var(--bgHover);color:var(--accentPrimary)}`;
    document.head.appendChild(s);
  }

  cacheElements() {
    this.elements = {
      filePage: document.querySelector('.pages[data-page="file"]'),
      fileNameInput: document.getElementById("fileNameInput"),
      editToggleBtn: document.getElementById("editToggleBtn"),
      copyBtn: document.getElementById("copyBtn"),
      downloadBtn: document.getElementById("downloadBtn"),
      fileLinesCount: document.getElementById("fileLinesCount"),
      fileSize: document.getElementById("fileSize"),
      fileLanguageDisplay: document.getElementById("fileLanguageDisplay"),
      cursorPosition: document.getElementById("cursorPosition"),
      selectionInfo: document.getElementById("selectionInfo"),
      coderWrapper: document.getElementById("coderWrapper"),
      codeMirrorContainer: document.getElementById("codeMirrorContainer"),
      themeToggleBtn: document.getElementById("themeToggleBtn"),
      themeIcon: document.getElementById("themeIcon"),
      decreaseFontBtn: document.getElementById("decreaseFontBtn"),
      increaseFontBtn: document.getElementById("increaseFontBtn"),
      fontSizeDisplay: document.getElementById("fontSizeDisplay"),
      wrapLinesBtn: document.getElementById("wrapLinesBtn"),
      searchBtn: document.getElementById("searchBtn"),
      foldAllBtn: document.getElementById("foldAllBtn"),
      unfoldAllBtn: document.getElementById("unfoldAllBtn"),
      fullscreenBtn: document.getElementById("fullscreenBtn"),
      fullscreenIcon: document.getElementById("fullscreenIcon"),
      formatCodeBtn: document.getElementById("formatCodeBtn"),
      commitPanel: document.getElementById("commitPanel"),
      commitTitleInput: document.getElementById("commitTitleInput"),
      commitDescriptionInput: document.getElementById("commitDescriptionInput"),
      cancelEditBtn: document.getElementById("cancelEditBtn"),
      saveChangesBtn: document.getElementById("saveChangesBtn"),
    };
  }

  bindEvents() {
    this.elements.editToggleBtn?.addEventListener("click", () => this.isEditing ? this.cancelEdit(): this.enterEditMode());
    this.elements.decreaseFontBtn?.addEventListener("click", () => this.adjustFontSize(-1));
    this.elements.increaseFontBtn?.addEventListener("click", () => this.adjustFontSize(1));
    this.elements.themeToggleBtn?.addEventListener("click", () => this.toggleTheme());
    this.elements.wrapLinesBtn?.addEventListener("click", () => this.toggleWrapLines());
    this.elements.searchBtn?.addEventListener("click", () => this.openSearch());
    this.elements.foldAllBtn?.addEventListener("click", () => this.foldAll());
    this.elements.unfoldAllBtn?.addEventListener("click", () => this.unfoldAll());
    this.elements.fullscreenBtn?.addEventListener("click", () => this.toggleFullscreen());
    this.elements.formatCodeBtn?.addEventListener("click", () => this.formatCode());
    this.elements.saveChangesBtn?.addEventListener("click", () => this.saveChanges());
    this.elements.cancelEditBtn?.addEventListener("click", () => this.cancelEdit());
    this.elements.copyBtn?.addEventListener("click", () => this.copyCode());
    this.elements.downloadBtn?.addEventListener("click", () => this.downloadFile());
    this.elements.fileNameInput?.addEventListener("dblclick", () => {
      if (this.isEditing) {
        this.elements.fileNameInput.readOnly = false; this.elements.fileNameInput.select();
      }});
    this.elements.fileNameInput?.addEventListener("blur",
      () => {
        this.elements.fileNameInput.readOnly = true;
      });
    this.elements.fileNameInput?.addEventListener("keydown",
      (e) => {
        if (e.key === "Enter") this.elements.fileNameInput.blur(); if (e.key === "Escape") {
          this.elements.fileNameInput.value = this.currentFile; this.elements.fileNameInput.blur();
        }});
    document.addEventListener("keydown",
      (e) => {
        const ctrl = e.ctrlKey || e.metaKey;
        if (ctrl && e.key === "s" && this.isEditing) {
          e.preventDefault(); this.saveChanges();
        }
        if (e.key === "Escape") {
          if (this.isFullscreen) this.toggleFullscreen(); else if (this.isEditing) this.cancelEdit();
        }
        if (ctrl && e.key === "f") {
          e.preventDefault(); this.openSearch();
        }
        if (ctrl && (e.key === "+" || e.key === "=")) {
          e.preventDefault(); this.adjustFontSize(1);
        }
        if (ctrl && e.key === "-") {
          e.preventDefault(); this.adjustFontSize(-1);
        }
        if (ctrl && e.key === "0") {
          e.preventDefault(); this.setCodeMirrorFontSize(12);
        }
        if (e.key === "F11") {
          e.preventDefault(); this.toggleFullscreen();
        }
      });
  }

  setupCodeMirror() {
    if (typeof CodeMirror === "undefined") {
      setTimeout(() => this.setupCodeMirror(), 100); return;
    }
    if (!this.elements.codeMirrorContainer || this.codeMirror) return;
    const fontSize = parseInt(localStorage.getItem("gitcodr_fontsize")) || 12;
    const savedTheme = localStorage.getItem("gitcodr_theme");
    const isDark = savedTheme === "dark" || (!savedTheme && document.documentElement.getAttribute("data-theme") === "dark");
    this.codeMirror = CodeMirror(this.elements.codeMirrorContainer, {
      value: "", mode: "javascript", theme: isDark ? "one-dark": "default", lineNumbers: true, lineWrapping: this.state.wrapLines,
      foldGutter: true, gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"], readOnly: true, tabSize: 2, indentUnit: 2,
      smartIndent: true, matchBrackets: true, autoCloseBrackets: true, scrollbarStyle: "native", viewportMargin: Infinity,
      styleActiveLine: this.state.highlightActiveLine,
      extraKeys: {
        "Ctrl-S": () => this.saveChanges(), "Cmd-S": () => this.saveChanges(), "Ctrl-F": "findPersistent", "Ctrl-/": "toggleComment"
      },
    });
    this.elements.fontSizeDisplay && (this.elements.fontSizeDisplay.textContent = `${fontSize}px`);
    this.updateThemeIcon(isDark);
    this.setCodeMirrorFontSize(fontSize);
    this.codeMirror.on("change", () => this.updateLineNumbers());
    this.codeMirror.on("cursorActivity", () => this.updateCursorPosition());
  }

  loadUserPreferences() {
    const wrap = localStorage.getItem("gitcodr_wrapLines");
    if (wrap !== null) {
      this.state.wrapLines = wrap === "true"; this.codeMirror?.setOption("lineWrapping", this.state.wrapLines);
    }
  }

  setCodeMirrorFontSize(size) {
    if (!this.codeMirror) return;
    this.codeMirror.getWrapperElement().style.fontSize = `${size}px`;
    this.state.fontSize = size;
    this.elements.fontSizeDisplay && (this.elements.fontSizeDisplay.textContent = `${size}px`);
    localStorage.setItem("gitcodr_fontsize", size);
    this.codeMirror.refresh();
  }

  setCodeMirrorMode(filename) {
    if (!this.codeMirror) return;
    const ext = filename.split(".").pop().toLowerCase();
    const modes = {
      js: "javascript",
      ts: "javascript",
      html: "htmlmixed",
      htm: "htmlmixed",
      css: "css",
      scss: "css",
      json: "javascript",
      md: "markdown",
      py: "python",
      php: "php",
      java: "text/x-java",
      xml: "xml",
      sql: "sql",
      yml: "yaml",
      yaml: "yaml",
      sh: "shell"
    };
    this.codeMirror.setOption("mode", modes[ext] || "text");
  }

  show() {
    this.elements.filePage?.classList.remove("hidden");
  }
  hide() {
    this.elements.filePage?.classList.add("hidden");
  }

  enterEditMode() {
    if (!this.currentFile) return;
    if (typeof LoadingSpinner !== "undefined") LoadingSpinner.show();
    this.isEditing = true;
    this.elements.editToggleBtn.innerHTML = `<svg class="icon" fill="currentColor" viewBox="0 0 16 16"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg><span>Cancel</span>`;
    this.elements.formatCodeBtn?.classList.remove("hidden");
    this.elements.commitPanel?.classList.remove("hidden");
    if (this.codeMirror) {
      this.codeMirror.setOption("readOnly", false); this.codeMirror.getWrapperElement().style.cursor = "text";
    }
    this.updateCommitMessage();
    setTimeout(() => {
      if (typeof LoadingSpinner !== "undefined") LoadingSpinner.hide();
    },
      500);
  }

  exitEditMode() {
    this.isEditing = false;
    this.elements.editToggleBtn.innerHTML = `<svg class="icon" fill="currentColor" viewBox="0 0 16 16"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/></svg><span>Edit</span>`;
    this.elements.formatCodeBtn?.classList.add("hidden");
    this.elements.commitPanel?.classList.add("hidden");
    if (this.codeMirror) {
      this.codeMirror.setOption("readOnly", true); this.codeMirror.getWrapperElement().style.cursor = "default";
    }
  }

  cancelEdit() {
    if (!this.codeMirror) return;
    if (this.codeMirror.getValue() !== this.originalContent && !confirm("Discard unsaved changes?")) return;
    if (typeof LoadingSpinner !== "undefined") LoadingSpinner.show();
    this.codeMirror.setValue(this.originalContent);
    this.updateLineNumbers();
    setTimeout(() => {
      this.exitEditMode(); if (typeof LoadingSpinner !== "undefined") LoadingSpinner.hide();
    },
      300);
  }

  displayFile(filename,
    fileData) {
    if (!this.isInitialized) this.init();
    this.currentFile = filename;
    this.fileData = fileData;
    this.originalContent = fileData.content || "";
    this.elements.fileNameInput && (this.elements.fileNameInput.value = filename);
    const ext = filename.split(".").pop().toLowerCase();
    const language = typeof getLanguageName === "function" ? getLanguageName(ext): ext.toUpperCase();
    const size = typeof formatFileSize === "function" ? formatFileSize(new Blob([this.originalContent]).size): `${(new Blob([this.originalContent]).size / 1024).toFixed(2)} KB`;
    const lines = this.originalContent.split("\n").length;
    this.elements.fileLanguageDisplay && (this.elements.fileLanguageDisplay.textContent = language);
    this.elements.fileLinesCount && (this.elements.fileLinesCount.textContent = `${lines} ${lines === 1 ? "line": "lines"}`);
    this.elements.fileSize && (this.elements.fileSize.textContent = size);
    if (!this.codeMirror) {
      this.setupCodeMirror(); setTimeout(() => {
        if (this.codeMirror) {
          this.codeMirror.setValue(this.originalContent); this.setCodeMirrorMode(filename); this.codeMirror.refresh();
        }},
        100);
    } else {
      this.codeMirror.setValue(this.originalContent); this.setCodeMirrorMode(filename); this.codeMirror.refresh();
    }
    this.exitEditMode();
    this.show();
    setTimeout(() => this.codeMirror?.refresh(), 200);
  }

  updateCommitMessage() {
    if (!this.currentFile || !this.elements.commitTitleInput) return;
    if (!this.elements.commitTitleInput.value.trim()) this.elements.commitTitleInput.value = `Update ${this.currentFile}`;
  }

  updateLineNumbers() {
    if (!this.codeMirror) return;
    const lines = this.codeMirror.getValue().split("\n").length;
    this.elements.fileLinesCount && (this.elements.fileLinesCount.textContent = `${lines} ${lines === 1 ? "line": "lines"}`);
  }

  updateCursorPosition() {
    if (!this.codeMirror || !this.elements.cursorPosition) return;
    const cursor = this.codeMirror.getCursor();
    this.elements.cursorPosition.textContent = `Ln ${cursor.line + 1}, Col ${cursor.ch + 1}`;
    const sel = this.codeMirror.getSelection();
    this.elements.selectionInfo && (this.elements.selectionInfo.textContent = sel ? `${sel.length} selected`: "");
  }

  saveChanges() {
    if (!this.currentFile || !this.fileData) return;
    const commitTitle = this.elements.commitTitleInput?.value.trim();
    if (!commitTitle) {
      if (typeof showErrorMessage === "function") showErrorMessage("Please enter a commit message"); return;
    }
    if (typeof LoadingProgress !== "undefined") LoadingProgress.show();
    setTimeout(() => {
      try {
        const newContent = this.codeMirror ? this.codeMirror.getValue(): "";
        this.fileData.content = newContent;
        this.fileData.lastModified = Date.now();
        this.fileData.lastCommit = commitTitle;
        this.fileData.size = new Blob([newContent]).size;
        const filePath = (window.currentState?.path ? window.currentState.path + "/": "") + this.currentFile;
        if (typeof LocalStorageManager !== "undefined") LocalStorageManager.saveFile(window.currentState?.repository, filePath, this.fileData);
        this.originalContent = newContent;
        if (typeof showSuccessMessage === "function") showSuccessMessage(`Saved ${this.currentFile}`);
        setTimeout(() => {
          this.exitEditMode(); if (typeof LoadingProgress !== "undefined") LoadingProgress.hide(); this.elements.commitTitleInput && (this.elements.commitTitleInput.value = ""); this.elements.commitDescriptionInput && (this.elements.commitDescriptionInput.value = ""); window.renderFileList?.();
        },
          500);
      } catch (error) {
        if (typeof LoadingProgress !== "undefined") LoadingProgress.hide(); if (typeof showErrorMessage === "function") showErrorMessage(`Save failed: ${error.message}`);
      }
    },
      500);
  }

  copyCode() {
    if (!this.codeMirror) return;
    const content = this.codeMirror.getSelection() || this.codeMirror.getValue();
    navigator.clipboard.writeText(content).then(() => {
      if (typeof showSuccessMessage === "function") showSuccessMessage("Copied to clipboard");
    }).catch(() => {
      if (typeof showErrorMessage === "function") showErrorMessage("Failed to copy");
    });
  }

  downloadFile() {
    if (!this.currentFile || !this.fileData) return;
    const content = this.codeMirror ? this.codeMirror.getValue(): this.fileData.content || "";
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = this.currentFile;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showSuccessMessage === "function") showSuccessMessage(`Downloaded ${this.currentFile}`);
  }

  toggleWrapLines() {
    if (!this.codeMirror) return;
    this.state.wrapLines = !this.state.wrapLines;
    this.codeMirror.setOption("lineWrapping", this.state.wrapLines);
    localStorage.setItem("gitcodr_wrapLines", this.state.wrapLines);
    this.elements.wrapLinesBtn?.classList.toggle("active", this.state.wrapLines);
  }

  adjustFontSize(change) {
    const newSize = Math.max(8, Math.min(32, this.state.fontSize + change));
    if (newSize !== this.state.fontSize) this.setCodeMirrorFontSize(newSize);
  }

  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light": "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("gitcodr_theme", newTheme);
    this.updateThemeIcon(!isDark);
    this.codeMirror?.setOption("theme", isDark ? "default": "one-dark");
  }

  updateThemeIcon(isDark) {
    if (this.elements.themeIcon) this.elements.themeIcon.innerHTML = isDark ? '<path d="M9.598 1.591a.75.75 0 0 1 .785-.175 7 7 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Z"/>': '<path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/>';
  }

  openSearch() {
    if (!this.codeMirror) return; this.codeMirror.execCommand("findPersistent"); setTimeout(() => {
      const input = document.querySelector(".CodeMirror-search-field"); if (input) {
        input.focus(); input.select();
      }},
      50);
  }

  foldAll() {
    if (!this.codeMirror) return; this.codeMirror.operation(() => {
      for (let i = 0; i < this.codeMirror.lineCount(); i++) this.codeMirror.foldCode({
        line: i, ch: 0
      }, null, "fold");
    });
  }

  unfoldAll() {
    if (!this.codeMirror) return; this.codeMirror.operation(() => {
      for (let i = 0; i < this.codeMirror.lineCount(); i++) this.codeMirror.foldCode({
        line: i, ch: 0
      }, null, "unfold");
    });
  }

  toggleFullscreen() {
    if (!this.elements.coderWrapper) return;
    this.isFullscreen = !this.isFullscreen;
    if (this.isFullscreen) {
      this.elements.coderWrapper.classList.add("fullscreen");
      document.body.style.overflow = "hidden";
      this.elements.fullscreenIcon && (this.elements.fullscreenIcon.innerHTML = '<path d="M5.5 2.75a.75.75 0 0 0-1.5 0v2.5H1.75a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 .75-.75v-3.25Zm5 0a.75.75 0 0 1 1.5 0v2.5h2.25a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75V2.75ZM5.5 13.25a.75.75 0 0 1-1.5 0v-2.5H1.75a.75.75 0 0 1 0-1.5h2.5a.75.75 0 0 1 .75.75v3.25Zm5 0a.75.75 0 0 0 1.5 0v-2.5h2.25a.75.75 0 0 0 0-1.5h-2.5a.75.75 0 0 0-.75.75v3.25Z"/>');
    } else {
      this.elements.coderWrapper.classList.remove("fullscreen");
      document.body.style.overflow = "";
      this.elements.fullscreenIcon && (this.elements.fullscreenIcon.innerHTML = '<path d="M3.75 2h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v2.5a.75.75 0 0 1-1.5 0v-2.5C2 2.784 2.784 2 3.75 2Zm6.5 0h2.5C13.216 2 14 2.784 14 3.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1 0-1.5ZM3.5 9.75a.75.75 0 0 0-1.5 0v2.5c0 .966.784 1.75 1.75 1.75h2.5a.75.75 0 0 1 0-1.5h-2.5a.25.25 0 0 1-.25-.25Zm9 0a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 12.25 14h-2.5a.75.75 0 0 1 0-1.5h2.5a.25.25 0 0 0 .25-.25Z"/>');
    }
    setTimeout(() => this.codeMirror?.refresh(), 100);
  }

  formatCode() {
    if (!this.codeMirror || !this.isEditing) return;
    const content = this.codeMirror.getValue();
    const mode = this.codeMirror.getOption("mode");
    let formatted = content;
    try {
      if (mode === "javascript" || mode === "application/json") {
        try {
          formatted = JSON.stringify(JSON.parse(content), null, 2);
        } catch (e) {
          formatted = content;
        }
      }
      if (formatted !== content) {
        const cursor = this.codeMirror.getCursor(); this.codeMirror.setValue(formatted); this.codeMirror.setCursor(cursor); if (typeof showSuccessMessage === "function") showSuccessMessage("Code formatted");
      } else {
        if (typeof showInfoMessage === "function") showInfoMessage("No formatting changes");
      }
    } catch (error) {
      if (typeof showErrorMessage === "function") showErrorMessage("Formatting failed");
    }
  }

  setReadOnly(readOnly) {
    if (!this.codeMirror) return; this.codeMirror.setOption("readOnly", readOnly); this.codeMirror.getWrapperElement().style.cursor = readOnly ? "default": "text";
  }
  getValue() {
    return this.codeMirror ? this.codeMirror.getValue(): "";
  }
  setValue(content) {
    if (this.codeMirror) {
      this.codeMirror.setValue(content); this.updateLineNumbers();
    }}
  destroy() {
    if (this.codeMirror) {
      this.codeMirror.toTextArea(); this.codeMirror = null;
    } document.getElementById("coderViewEditStyles")?.remove(); this.isInitialized = false; this.elements = {};
  }
}

window.coderViewEdit = new coderViewEdit();