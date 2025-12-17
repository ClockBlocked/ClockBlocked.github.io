class coderViewEdit {
  constructor() {
    this.currentFile = null;
    this.fileData = null;
    this.codeMirror = null;
    this.isEditing = false;
    this.isLoading = false;
    this.originalContent = "";
    this.isInitialized = false;
    this.elements = {};
    this.state = {
      fontSize: 12,
      wrapLines: true,
      showMinimap: false,
    };
  }
  
  init() {
    if (this.isInitialized) return;
    const filePage = document.querySelector('.pages[data-page="file"]');
    if (!filePage) return;
    filePage.innerHTML = `

<div class="container">

  <nav class="navigation">
    <button onclick="showExplorer()" class="navButton">
      ${window.currentState?.repository || "Repository"}
    </button>
    <span class="separator">/</span>
    <input type="text" id="fileNameInput" class="fileNameInput" value="" readonly />
  </nav>
  
  
  <div class="buttonGroup">
    <button id="editToggleBtn" class="actionButton">
      <svg class="icon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/>
      </svg>
      <span>Edit</span>
    </button>
    <button id="copyBtn" class="actionButton">
      <svg class="icon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
        <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
      </svg>
      Copy
    </button>
    <button id="downloadBtn" class="actionButton">
      <svg class="icon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
        <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
      </svg>
      Download
    </button>
  </div>
</div>


<div class="fileHeader">

  <div class="toolbarGroup">
    <button id="themeToggleBtn" class="toolbarButton">
      <svg id="themeIcon" class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/>
      </svg>
    </button>
    <div data-toolbar="fontSize" class="fontSizeControl">
      <button id="decreaseFontBtn" class="fontButton">
        <svg class="tinyIcon" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Z"/>
        </svg>
      </button>
      <span id="fontSizeDisplay" class="fontSizeDisplay">12px</span>
      <button id="increaseFontBtn" class="fontButton">
        <svg class="tinyIcon" fill="currentColor" viewBox="0 0 16 16">
          <path d="M7.25 3.75a.75.75 0 0 1 1.5 0V7.25h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5Z"/>
        </svg>
      </button>
    </div>
    <button id="wrapLinesBtn" class="toolbarButton">
      <svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5ZM3 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
      </svg>
    </button>
    <button id="searchBtn" class="toolbarButton">
      <svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/>
      </svg>
    </button>
    <button id="fullscreenBtn" class="toolbarButton">
      <svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3.75 2A1.75 1.75 0 0 0 2 3.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.25.25 0 0 1 .25-.25h1.5a.75.75 0 0 0 0-1.5h-1.5ZM10.75 2a.75.75 0 0 0 0 1.5h1.5a.25.25 0 0 1 .25.25v1.5a.75.75 0 0 0 1.5 0v-1.5A1.75 1.75 0 0 0 12.25 2ZM3.75 14a.75.75 0 0 0 0-1.5h-1.5a.25.25 0 0 1-.25-.25v-1.5a.75.75 0 0 0-1.5 0v1.5A1.75 1.75 0 0 0 3.75 16h1.5a.75.75 0 0 0 0-1.5ZM14 10.75a.75.75 0 0 0-1.5 0v1.5a.25.25 0 0 1-.25.25h-1.5a.75.75 0 0 0 0 1.5h1.5A1.75 1.75 0 0 0 16 12.25Z"/>
      </svg>
    </button>
    <button id="formatCodeBtn" class="toolbarButton hidden">
      <svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06l-4.25-4.25Z"/>
      </svg>
    </button>
  </div>
  
</div>

<!-- CodeMirror Area -->
<div id="coderWrapper">

<div id="loadingSpinner" class="loading-spinner" data-active="false">
  <div class="spinner-overlay">
    <svg class="spinner-svg" viewBox="0 0 50 50">
      <circle class="spinner-track" cx="25" cy="25" r="20"></circle>
      <circle class="spinner-circle" cx="25" cy="25" r="20"></circle>
    </svg>
  </div>
</div>

  <div id="codeMirrorContainer">
  </div>
</div>

<div class="fileFooter">
  <div class="footerStats">
    <span id="fileLinesCount">0 lines</span>
    <span class="footerDivider">•</span>
    <span id="fileSize">0 KB</span>
    <span class="footerDivider">•</span>
    <span id="fileLanguageDisplay">Text</span>
  </div>
</div>



<div id="commitPanel" class="commitPanel">
  <h3 class="panelTitle">Commit changes</h3>
  <div class="panelContent">
    <div>
      <input type="text" id="commitTitleInput" class="commitInput" placeholder="Update filename.ext"/>
    </div>
    <div>
      <textarea id="commitDescriptionInput" rows="4" class="commitTextarea" placeholder="Add an optional extended description..."></textarea>
    </div>
    
    <div class="panelButtons">
      <button id="cancelEditBtn" class="secondaryButton">Cancel</button>
      <button id="saveChangesBtn" class="primaryButton">Commit changes</button>
    </div>
    
  </div>
</div>

        `;
    this.cacheElements();
    this.bindEvents();
    if (typeof CodeMirror !== "undefined") {
      this.setupCodeMirror();
    } else {
      setTimeout(() => this.setupCodeMirror(), 100);
    }
    this.isInitialized = true;
  }
  cacheElements() {
    this.elements = {
      filePage: document.querySelector('.pages[data-page="file"]'),
      fileNameInput: document.getElementById("fileNameInput"),
      editToggleBtn: document.getElementById("editToggleBtn"),
      copyBtn: document.getElementById("copyBtn"),
      downloadBtn: document.getElementById("downloadBtn"),
      fileStats: document.getElementById("fileStats"),
      fileLinesCount: document.getElementById("fileLinesCount"),
      fileSize: document.getElementById("fileSize"),
      fileLanguageDisplay: document.getElementById("fileLanguageDisplay"),
      wrapLinesBtn: document.getElementById("wrapLinesBtn"),
      codeMirrorContainer: document.getElementById("codeMirrorContainer"),
      commitPanel: document.getElementById("commitPanel"),
      commitTitleInput: document.getElementById("commitTitleInput"),
      commitDescriptionInput: document.getElementById("commitDescriptionInput"),
      cancelEditBtn: document.getElementById("cancelEditBtn"),
      saveChangesBtn: document.getElementById("saveChangesBtn"),
      themeToggleBtn: document.getElementById("themeToggleBtn"),
      themeIcon: document.getElementById("themeIcon"),
      decreaseFontBtn: document.getElementById("decreaseFontBtn"),
      increaseFontBtn: document.getElementById("increaseFontBtn"),
      fontSizeDisplay: document.getElementById("fontSizeDisplay"),
      searchBtn: document.getElementById("searchBtn"),
      fullscreenBtn: document.getElementById("fullscreenBtn"),
      formatCodeBtn: document.getElementById("formatCodeBtn"),
    };
  }
  bindEvents() {
    if (this.elements.editToggleBtn) {
      this.elements.editToggleBtn.addEventListener("click", () => {
        if (this.isEditing) {
          this.cancelEdit();
        } else {
          this.enterEditMode();
        }
      });
    }
    if (this.elements.decreaseFontBtn) {
      this.elements.decreaseFontBtn.addEventListener("click", () => {
        this.adjustFontSize(-1);
      });
    }
    if (this.elements.increaseFontBtn) {
      this.elements.increaseFontBtn.addEventListener("click", () => {
        this.adjustFontSize(1);
      });
    }
    if (this.elements.themeToggleBtn) {
      this.elements.themeToggleBtn.addEventListener("click", () => {
        this.toggleTheme();
      });
    }
    if (this.elements.searchBtn) {
      this.elements.searchBtn.addEventListener("click", () => {
        this.openSearch();
      });
    }
    if (this.elements.fullscreenBtn) {
      this.elements.fullscreenBtn.addEventListener("click", () => {
        this.toggleFullscreen();
      });
    }
    if (this.elements.formatCodeBtn) {
      this.elements.formatCodeBtn.addEventListener("click", () => {
        this.formatCode();
      });
    }
    if (this.elements.saveChangesBtn) {
      this.elements.saveChangesBtn.addEventListener("click", () => {
        this.saveChanges();
      });
    }
    if (this.elements.cancelEditBtn) {
      this.elements.cancelEditBtn.addEventListener("click", () => {
        this.cancelEdit();
      });
    }
    if (this.elements.copyBtn) {
      this.elements.copyBtn.addEventListener("click", () => {
        this.copyCode();
      });
    }
    if (this.elements.downloadBtn) {
      this.elements.downloadBtn.addEventListener("click", () => {
        this.downloadFile();
      });
    }
    if (this.elements.wrapLinesBtn) {
      this.elements.wrapLinesBtn.addEventListener("click", () => {
        this.toggleWrapLines();
      });
    }
    if (this.elements.fileNameInput) {
      this.elements.fileNameInput.addEventListener("dblclick", () => {
        if (this.isEditing) {
          this.elements.fileNameInput.readOnly = false;
          this.elements.fileNameInput.select();
        }
      });
      this.elements.fileNameInput.addEventListener("blur", () => {
        this.elements.fileNameInput.readOnly = true;
        this.renameFile(this.elements.fileNameInput.value);
      });
      this.elements.fileNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.elements.fileNameInput.blur();
        if (e.key === "Escape") {
          this.elements.fileNameInput.value = this.currentFile;
          this.elements.fileNameInput.blur();
        }
      });
    }
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && this.isEditing) {
        e.preventDefault();
        this.saveChanges();
      }
      if (e.key === "Escape" && this.isEditing) {
        this.cancelEdit();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        this.openSearch();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        this.adjustFontSize(1);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        this.adjustFontSize(-1);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        this.resetFontSize();
      }
      if (e.key === "F11") {
        e.preventDefault();
        this.toggleFullscreen();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F" && this.isEditing) {
        e.preventDefault();
        this.formatCode();
      }
    });
  }
  
  setupCodeMirror() {
    if (typeof CodeMirror === "undefined") {
      setTimeout(() => this.setupCodeMirror(), 100);
      return;
    }
    if (!this.elements.codeMirrorContainer || this.codeMirror) return;
    const savedFontSize = localStorage.getItem("gitcodr_fontsize");
    const fontSize = savedFontSize ? parseInt(savedFontSize) : 12;
    const savedTheme = localStorage.getItem("gitcodr_theme");
    const isDarkTheme =
      savedTheme === "dark" || (!savedTheme && document.documentElement.getAttribute("data-theme") === "dark");
    const cmTheme = isDarkTheme ? "one-dark" : "default";
    this.codeMirror = CodeMirror(this.elements.codeMirrorContainer, {
      value: "",
      mode: "javascript",
      theme: cmTheme,
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      readOnly: true,
      tabSize: 2,
      indentUnit: 2,
      smartIndent: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      scrollbarStyle: "native",
      viewportMargin: Infinity,
      cursorBlinkRate: 530,
      extraKeys: {
        "Ctrl-S": () => this.saveChanges(),
        "Cmd-S": () => this.saveChanges(),
        "Ctrl-F": "findPersistent",
        "Ctrl-D": (cm) => cm.execCommand("duplicateLine"),
        "Ctrl-/": "toggleComment",
        "Ctrl-Shift-F": () => this.formatCode(),
      },
    });
    if (this.elements.fontSizeDisplay) {
      this.elements.fontSizeDisplay.textContent = `${fontSize}px`;
    }
    if (this.elements.themeIcon && isDarkTheme) {
      this.elements.themeIcon.innerHTML =
        '<path d="M9.598 1.591a.75.75 0 0 1 .785-.175 7 7 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Z"/>';
    }
    this.updateLineNumbers();
    this.codeMirror.on("change", () => {
      this.updateLineNumbers();
    });
    this.setCodeMirrorFontSize(fontSize);
  }
  setCodeMirrorFontSize(size) {
    if (!this.codeMirror) return;
    this.codeMirror.getWrapperElement().style.fontSize = `${size}px`;
    this.state.fontSize = size;
    if (this.elements.fontSizeDisplay) {
      this.elements.fontSizeDisplay.textContent = `${size}px`;
    }
    localStorage.setItem("gitcodr_fontsize", size);
  }
  setCodeMirrorMode(filename) {
    if (!this.codeMirror) return;
    const ext = filename.split(".").pop().toLowerCase();
    const modeMap = {
      js: "javascript",
      javascript: "javascript",
      ts: "javascript",
      typescript: "javascript",
      html: "htmlmixed",
      htm: "htmlmixed",
      css: "css",
      scss: "css",
      less: "css",
      json: "javascript",
      md: "markdown",
      py: "python",
      php: "php",
      java: "text/x-java",
      cpp: "text/x-c++src",
      c: "text/x-csrc",
      xml: "xml",
      sql: "sql",
      yml: "yaml",
    };
    this.codeMirror.setOption("mode", modeMap[ext] || "text");
  }
  
  show() {
    if (this.elements.filePage) {
      this.elements.filePage.classList.remove("hidden");
    }
  }
  hide() {
    if (this.elements.filePage) {
      this.elements.filePage.classList.add("hidden");
    }
  }
  
  enterEditMode() {
    if (!this.currentFile) return;
    LoadingSpinner.show();
    this.isEditing = true;
    this.elements.editToggleBtn.innerHTML = `
                    <svg class="icon" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/>
                    </svg>
                    <span>Cancel</span>
                `;
    if (this.elements.formatCodeBtn) {
      this.elements.formatCodeBtn.classList.remove(".hide");
    }
    if (this.elements.commitPanel) {
//      this.elements.commitPanel.style.display = "block";
        this.elements.commitPanel.classList.remove('.hide');
        this.elements.commitPanel.classList.add('.show');
    }
    if (this.codeMirror) {
      this.codeMirror.setOption("readOnly", false);
      this.codeMirror.getWrapperElement().style.cursor = "text";
//    this.codeMirror.focus();
    }
    this.updateCommitMessage();
    setTimeout(() => {
      LoadingSpinner.hide();
    }, 1500);
  }
  exitEditMode() {
    this.isEditing = false;
    this.elements.editToggleBtn.innerHTML = `
            <svg class="icon" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/>
            </svg>
            <span>Edit</span>
        `;
    if (this.elements.formatCodeBtn) {
      this.elements.formatCodeBtn.classList.add("hidden");
    }
    if (this.elements.commitPanel) {
//      this.elements.commitPanel.style.display = "none";
      this.elements.commitPanel.classList.remove('show');
      this.elements.commitPanel.classList.add('hide');
    }
    if (this.codeMirror) {
      this.codeMirror.setOption("readOnly", true);
      this.codeMirror.getWrapperElement().style.cursor = "default";
    }
  }
  cancelEdit() {
    if (!confirm("Discard changes?")) return;
    LoadingSpinner.show();
    if (this.codeMirror) {
      this.codeMirror.setValue(this.originalContent);
      this.updateLineNumbers();
    }
    setTimeout(() => {
      this.exitEditMode();
      LoadingSpinner.hide();
    }, 1500);
  }
  
  displayFile(filename, fileData) {
    if (!this.isInitialized) {
      this.init();
    }
    this.currentFile = filename;
    this.fileData = fileData;
    this.originalContent = fileData.content || "";
    if (this.elements.fileNameInput) {
      this.elements.fileNameInput.value = filename;
    }
    const ext = filename.split(".").pop().toLowerCase();
    const language = getLanguageName(ext);
    const size = formatFileSize(new Blob([this.originalContent]).size);
    const lines = this.originalContent.split("\n").length;
    if (this.elements.fileLanguageDisplay) {
      this.elements.fileLanguageDisplay.textContent = language;
    }
    if (this.elements.fileLinesCount) {
      this.elements.fileLinesCount.textContent = `${lines} ${lines === 1 ? "line" : "lines"}`;
    }
    if (this.elements.fileSize) {
      this.elements.fileSize.textContent = size;
    }
    if (!this.codeMirror) {
      this.setupCodeMirror();
      setTimeout(() => {
        if (this.codeMirror) {
          this.codeMirror.setValue(this.originalContent);
          this.setCodeMirrorMode(filename);
          this.updateLineNumbers();
        }
      }, 100);
    } else {
      this.codeMirror.setValue(this.originalContent);
      this.setCodeMirrorMode(filename);
      this.updateLineNumbers();
    }
    this.exitEditMode();
    this.show();
  }
  updateCommitMessage() {
    if (!this.currentFile || !this.elements.commitTitleInput) return;
    if (!this.elements.commitTitleInput.value.trim()) {
      this.elements.commitTitleInput.value = `Update ${this.currentFile}`;
    }
  }
  updateLineNumbers() {
    if (!this.codeMirror) return;
    const content = this.codeMirror.getValue();
    const lines = content.split("\n").length;
    if (this.elements.fileLinesCount) {
      this.elements.fileLinesCount.textContent = `${lines} ${lines === 1 ? "line" : "lines"}`;
    }
  }


  setReadOnly(readOnly) {
    if (!this.codeMirror) return;
    this.codeMirror.setOption("readOnly", readOnly);
    const cmElement = this.codeMirror.getWrapperElement();
    if (readOnly) {
      cmElement.style.cursor = "default";
    } else {
      cmElement.style.cursor = "text";
    }
  }
  saveChanges() {
    if (!this.currentFile || !this.fileData) return;
    const commitTitle = this.elements.commitTitleInput ? this.elements.commitTitleInput.value.trim() : "";
    if (!commitTitle) {
      showErrorMessage("Please enter a commit message");
      return;
    }
    const commitDescription = this.elements.commitDescriptionInput
      ? this.elements.commitDescriptionInput.value.trim()
      : "";
    LoadingProgress.show();
    setTimeout(() => {
      try {
        const newContent = this.codeMirror ? this.codeMirror.getValue() : "";
        this.fileData.content = newContent;
        this.fileData.lastModified = Date.now();
        this.fileData.lastCommit = commitTitle;
        this.fileData.size = new Blob([newContent]).size;
        const filePath = (window.currentState?.path ? window.currentState.path + "/" : "") + this.currentFile;
        LocalStorageManager.saveFile(window.currentState?.repository, filePath, this.fileData);
        this.originalContent = newContent;
        showSuccessMessage(`Saved ${this.currentFile}`);
        setTimeout(() => {
          this.exitEditMode();
          LoadingProgress.hide();
          if (this.elements.commitTitleInput) this.elements.commitTitleInput.value = "";
          if (this.elements.commitDescriptionInput) this.elements.commitDescriptionInput.value = "";
          if (window.renderFileList) {
            window.renderFileList();
          }
        }, 1500);
      } catch (error) {
        LoadingProgress.hide();
        showErrorMessage(`Save failed: ${error.message}`);
      }
    }, 1500);
  }
  copyCode() {
    if (!this.codeMirror) return;
    const content = this.codeMirror.getValue();
    navigator.clipboard
      .writeText(content)
      .then(() => {
        showSuccessMessage("Copied to clipboard");
      })
      .catch((err) => {
        showErrorMessage("Failed to copy");
      });
  }
  downloadFile() {
    if (!this.currentFile || !this.fileData) return;
    const content = this.fileData.content || "";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = this.currentFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccessMessage(`Downloaded ${this.currentFile}`);
  }
  toggleWrapLines() {
    if (!this.codeMirror) return;
    const current = this.codeMirror.getOption("lineWrapping");
    this.codeMirror.setOption("lineWrapping", !current);
  }
  renameFile(newName) {}
  
  adjustFontSize(change) {
    const newSize = this.state.fontSize + change;
    const clampedSize = Math.max(8, Math.min(24, newSize));
    if (clampedSize !== this.state.fontSize) {
      this.setCodeMirrorFontSize(clampedSize);
    }
  }
  resetFontSize() {
    this.setCodeMirrorFontSize(12);
  }
  
  toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const isDark = currentTheme === "dark";
    const newTheme = isDark ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("gitcodr_theme", newTheme);
    if (this.elements.themeIcon) {
      this.elements.themeIcon.innerHTML = isDark
        ? '<path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/>'
        : '<path d="M9.598 1.591a.75.75 0 0 1 .785-.175 7 7 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Z"/>';
    }
    if (this.codeMirror) {
      this.codeMirror.setOption("theme", isDark ? "default" : "one-dark");
    }
  }
  openSearch() {
    if (!this.codeMirror) return;
    this.codeMirror.execCommand("find");
    const searchInput = document.querySelector(".CodeMirror-search-field");
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
  toggleFullscreen() {
    const coderWrapper = this.elements.coderWrapper;
    if (!coderWrapper) return;
    if (!document.fullscreenElement) {
      if (coderWrapper.requestFullscreen) {
        coderWrapper.requestFullscreen();
      } else if (coderWrapper.webkitRequestFullscreen) {
        coderWrapper.webkitRequestFullscreen();
      } else if (coderWrapper.msRequestFullscreen) {
        coderWrapper.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }
  formatCode() {
    if (!this.codeMirror || !this.isEditing) return;
    const content = this.codeMirror.getValue();
    const language = this.codeMirror.getOption("mode");
    let formatted = content;
    if (language === "javascript" || language === "json") {
      try {
        formatted = JSON.stringify(JSON.parse(content), null, 2);
      } catch (e) {
        formatted = content.replace(/{/g, " {\n").replace(/}/g, "\n}").replace(/;/g, ";\n").replace(/,/g, ",\n");
      }
    } else if (language === "htmlmixed") {
      formatted = content.replace(/>\s+</g, ">\n<").replace(/</g, "\n<").trim();
    }
    if (formatted !== content) {
      this.codeMirror.setValue(formatted);
      showSuccessMessage("Code formatted");
    } else {
      showInfoMessage("No formatting needed");
    }
  }
}
window.coderViewEdit = new coderViewEdit();