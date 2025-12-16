// This creates a globally accessible coderArea object
window.coderArea = {
  template: `
<div class="container">
  <nav class="navigation">
    <button onclick="showExplorer()" class="navButton">
      \${window.currentState?.repository || "Repository"}
    </button>
    <span class="separator">/</span>
    <input type="text" id="fileNameInput" class="fileNameInput" value="" readonly />
  </nav>
  <div class="buttonGroup">
    <button id="editToggleBtn" class="actionButton">
      <svg class="icon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
      </svg>
      <span>Edit</span>
    </button>
    <button id="copyBtn" class="actionButton">
      <svg class="icon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
        <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
      </svg>
      Copy
    </button>
    <button id="downloadBtn" class="actionButton">
      <svg class="icon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
        <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z" />
      </svg>
      Download
    </button>
  </div>
</div>
<div class="fileHeader">
  <div class="fileStats" id="fileStats">
    <span id="fileLinesCount">0 lines</span>
    <span>•</span>
    <span id="fileSize">0 KB</span>
    <span>•</span>
    <span id="fileLanguageDisplay">Text</span>
  </div>
  <div class="toolbarGroup">
    <button id="themeToggleBtn" class="toolbarButton">
      <svg id="themeIcon" class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
      </svg>
    </button>
    <div data-toolbar="fontSize" class="fontSizeControl">
      <button id="decreaseFontBtn" class="fontButton">
        <svg class="tinyIcon" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Z" />
        </svg>
      </button>
      <span id="fontSizeDisplay" class="fontSizeDisplay">12px</span>
      <button id="increaseFontBtn" class="fontButton">
        <svg class="tinyIcon" fill="currentColor" viewBox="0 0 16 16">
          <path d="M7.25 3.75a.75.75 0 0 1 1.5 0V7.25h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5Z" />
        </svg>
      </button>
    </div>
    <button id="wrapLinesBtn" class="toolbarButton">
      <svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5ZM3 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
    </button>
    <button id="searchBtn" class="toolbarButton">
      <svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
      </svg>
    </button>
    <button id="fullscreenBtn" class="toolbarButton">
      <svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3.75 2A1.75 1.75 0 0 0 2 3.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.25.25 0 0 1 .25-.25h1.5a.75.75 0 0 0 0-1.5h-1.5ZM10.75 2a.75.75 0 0 0 0 1.5h1.5a.25.25 0 0 1 .25.25v1.5a.75.75 0 0 0 1.5 0v-1.5A1.75 1.75 0 0 0 12.25 2ZM3.75 14a.75.75 0 0 0 0-1.5h-1.5a.25.25 0 0 1-.25-.25v-1.5a.75.75 0 0 0-1.5 0v1.5A1.75 1.75 0 0 0 3.75 16h1.5a.75.75 0 0 0 0-1.5ZM14 10.75a.75.75 0 0 0-1.5 0v1.5a.25.25 0 0 1-.25.25h-1.5a.75.75 0 0 0 0 1.5h1.5A1.75 1.75 0 0 0 16 12.25Z" />
      </svg>
    </button>
    <button id="formatCodeBtn" class="toolbarButton hidden">
      <svg class="smallIcon" fill="currentColor" viewBox="0 0 16 16">
        <path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06l-4.25-4.25Z" />
      </svg>
    </button>
  </div>
</div>
<div id="coderWrapper" class="codeWrapper">
  <div id="loadingOverlay" class="loadingOverlay">
    <div class="loadingContent">
      <div class="spinner"></div>
      <p class="loadingText" id="loadingText">Loading...</p>
    </div>
  </div>
  <div class="codeContainer">
    <div class="codeEditor">
      <div id="codeMirrorContainer"></div>
    </div>
  </div>
</div>
<div id="commitPanel" class="commitPanel">
  <h3 class="panelTitle">Commit changes</h3>
  <div class="panelContent">
    <div>
      <input type="text" id="commitTitleInput" class="commitInput" placeholder="Update filename.ext" />
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
  `,
  
  styles: `

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.navButton {
  color: var(--github-accent-fg);
  text-decoration: underline;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.navButton:hover {
  text-decoration: underline;
}

.separator {
  color: var(--github-fg-muted);
}

.fileNameInput {
  background: transparent;
  border: none;
  color: var(--github-fg-default);
  font-weight: 600;
  outline: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
  width: auto;
}

.fileNameInput:focus {
  background: var(--github-canvas-inset);
}

.buttonGroup {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actionButton {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--github-border-default);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--github-fg-default);
  background-color: var(--github-canvas-default);
  transition: background-color 0.2s;
  cursor: pointer;
}

.actionButton:hover {
  background-color: var(--github-border-default);
}

.icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.fileHeader {
  background-color: var(--github-canvas-inset);
  border: 1px solid var(--github-border-default);
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.fileStats {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--github-fg-muted);
}

.toolbarGroup {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbarButton {
  padding: 0.5rem;
  border-radius: 0.25rem;
  color: var(--github-fg-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbarButton:hover {
  background-color: var(--github-canvas-inset);
  color: var(--github-fg-default);
}

.smallIcon {
  width: 1rem;
  height: 1rem;
}

.fontSizeControl {
  display: flex;
  align-items: center;
  border: 1px solid var(--github-border-default);
  border-radius: 0.375rem;
  overflow: hidden;
}

.fontButton {
  padding: 0.375rem;
  color: var(--github-fg-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.fontButton:hover {
  background-color: var(--github-canvas-inset);
  color: var(--github-fg-default);
}

.tinyIcon {
  width: 0.875rem;
  height: 0.875rem;
}

.fontSizeDisplay {
  padding: 0 0.5rem;
  font-size: 0.75rem;
  color: var(--github-fg-default);
  border-left: 1px solid var(--github-border-default);
  border-right: 1px solid var(--github-border-default);
  min-width: 40px;
  text-align: center;
}

.codeWrapper {
  background-color: var(--github-canvas-inset);
  border-left: 1px solid var(--github-border-default);
  border-right: 1px solid var(--github-border-default);
  border-bottom: 1px solid var(--github-border-default);
  border-radius: 0 0 0.5rem 0.5rem;
  overflow: hidden;
  position: relative;
}

.loadingOverlay {
  position: absolute;
  inset: 0;
  background-color: rgba(13, 17, 23, 0.9);
  backdrop-filter: blur(4px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
  opacity: 0;
  pointer-events: none;
}

.loadingContent {
  text-align: center;
}

.spinner {
  width: 2rem;
  height: 100%;
  border: 2px solid var(--github-border-default);
  border-top-color: var(--github-accent-fg);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

.loadingText {
  color: var(--github-fg-muted);
  font-size: 0.875rem;
}

.codeContainer {
  display: flex;
  height: auto;
}

.codeEditor {
  flex: 1;
  overflow: auto;
}

.commitPanel {
  margin-top: 1.5rem;
  background-color: var(--github-canvas-inset);
  border: 1px solid var(--github-border-default);
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: none;
}

.panelTitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--github-fg-default);
  margin-bottom: 1rem;
}

.panelContent {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.commitInput {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background-color: var(--github-canvas-default);
  border: 1px solid var(--github-border-default);
  border-radius: 0.375rem;
  color: var(--github-fg-default);
  outline: none;
}

.commitInput:focus {
  outline: 2px solid var(--github-accent-fg);
  outline-offset: -1px;
  border-color: transparent;
}

.commitTextarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background-color: var(--github-canvas-default);
  border: 1px solid var(--github-border-default);
  border-radius: 0.375rem;
  color: var(--github-fg-default);
  outline: none;
  resize: none;
}

.commitTextarea:focus {
  outline: 2px solid var(--github-accent-fg);
  outline-offset: -1px;
  border-color: transparent;
}

.panelButtons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.secondaryButton {
  padding: 0.5rem 1rem;
  border: 1px solid var(--github-border-default);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--github-fg-default);
  background-color: var(--github-canvas-default);
  transition: background-color 0.2s;
  cursor: pointer;
}

.secondaryButton:hover {
  background-color: var(--github-border-default);
}

.primaryButton {
  padding: 0.5rem 1rem;
  background-color: var(--github-btn-primary-bg);
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primaryButton:hover {
  background-color: var(--github-btn-primary-hover);
}

.hidden {
  display: none;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
  `
};