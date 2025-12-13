




class CodeViewerManager {
    constructor() {
        this.currentFile = null;
        this.codeViewerInstance = null;
        this.elements = {};
        this.state = {
            fontSize: 12,
            lineHeight: 1.5,
            selectedLines: new Set(),
            currentLine: 1,
            currentColumn: 1,
            totalLines: 0,
            wrapEnabled: true,
            minimapEnabled: false,
            splitViewEnabled: false
        };
    }

    init() {
        this.setupStyles();
        this.cacheElements();
        this.bindEvents();
    }

    setupStyles() {
        // Add the CSS styles to the document
        const styleElement = document.createElement('style');
        styleElement.innerHTML = `
            .code-viewer-container {
                display: flex;
                flex-direction: column;
                background-color: #1c2128;
                border: 1px solid #444c56;
                border-radius: 6px;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
                color: #adbac7;
                height: 100%;
            }

            .code-viewer-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 16px;
                background: linear-gradient(180deg, #2d333b 0%, #282e36 100%);
                border-bottom: 1px solid #444c56;
                min-height: 44px;
                gap: 16px;
            }

            .header-left {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }

            .file-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                background: linear-gradient(135deg, #347d39 0%, #2b6a30 100%);
                border-radius: 6px;
                color: #ffffff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }

            .file-name {
                font-size: 14px;
                font-weight: 600;
                color: #adbac7;
                letter-spacing: -0.01em;
            }

            .file-badge {
                display: inline-flex;
                align-items: center;
                padding: 2px 6px;
                font-size: 10px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                background: rgba(99, 110, 123, 0.2);
                border: 1px solid rgba(99, 110, 123, 0.3);
                border-radius: 4px;
                color: #768390;
            }

            .header-center {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                min-width: 0;
            }

            .breadcrumb-trail {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #768390;
                overflow: hidden;
            }

            .breadcrumb-item {
                padding: 4px 8px;
                border-radius: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                transition: all 0.15s ease;
                cursor: pointer;
            }

            .breadcrumb-item:hover {
                background: rgba(99, 110, 123, 0.2);
                color: #adbac7;
            }

            .breadcrumb-item.active {
                background: rgba(65, 132, 228, 0.15);
                color: #539bf5;
                font-weight: 500;
            }

            .breadcrumb-separator {
                color: #545d68;
                font-weight: 300;
            }

            .header-right {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
            }

            .header-stats {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: #768390;
            }

            .stat-item svg {
                opacity: 0.7;
            }

            .header-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                padding-left: 12px;
                border-left: 1px solid #373e47;
            }

            .action-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 6px 8px;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 6px;
                color: #768390;
                cursor: pointer;
                transition: all 0.15s ease;
                position: relative;
            }

            .action-btn:hover {
                background: rgba(99, 110, 123, 0.2);
                color: #adbac7;
                border-color: rgba(99, 110, 123, 0.3);
            }

            .action-btn:active {
                background: rgba(99, 110, 123, 0.3);
                transform: scale(0.96);
            }

            .action-btn[data-tooltip]:hover::after {
                content: attr(data-tooltip);
                position: absolute;
                bottom: calc(100% + 8px);
                left: 50%;
                transform: translateX(-50%);
                padding: 6px 10px;
                background: #2d333b;
                border: 1px solid #444c56;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
                color: #adbac7;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 100;
                pointer-events: none;
                animation: tooltipFade 0.15s ease;
            }

            @keyframes tooltipFade {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(4px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }

            .action-divider {
                width: 1px;
                height: 20px;
                background: #373e47;
                margin: 0 4px;
            }

            .edit-btn {
                background: linear-gradient(180deg, #347d39 0%, #2b6a30 100%);
                border-color: rgba(0, 0, 0, 0.2);
                color: #ffffff;
                font-size: 12px;
                font-weight: 500;
                padding: 6px 12px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }

            .edit-btn:hover {
                background: linear-gradient(180deg, #3d8b40 0%, #347d39 100%);
                color: #ffffff;
                border-color: rgba(0, 0, 0, 0.3);
            }

            .code-viewer-toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 12px;
                background: #22272e;
                border-bottom: 1px solid #444c56;
                gap: 16px;
            }

            .toolbar-left {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .toolbar-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                color: #768390;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .toolbar-btn:hover {
                background: rgba(99, 110, 123, 0.15);
                color: #adbac7;
            }

            .toolbar-btn.active {
                background: rgba(65, 132, 228, 0.15);
                color: #539bf5;
                border-color: rgba(65, 132, 228, 0.3);
            }

            .toolbar-center {
                flex: 1;
                display: flex;
                justify-content: center;
                max-width: 400px;
            }

            .search-container {
                display: flex;
                align-items: center;
                width: 100%;
                padding: 6px 12px;
                background: #1c2128;
                border: 1px solid #373e47;
                border-radius: 6px;
                gap: 8px;
                transition: all 0.15s ease;
            }

            .search-container:focus-within {
                border-color: #539bf5;
                box-shadow: 0 0 0 3px rgba(65, 132, 228, 0.15);
            }

            .search-icon {
                color: #545d68;
                flex-shrink: 0;
            }

            .search-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                font-size: 12px;
                color: #adbac7;
                min-width: 0;
            }

            .search-input::placeholder {
                color: #545d68;
            }

            .search-shortcuts {
                display: flex;
                gap: 2px;
                flex-shrink: 0;
            }

            .search-shortcuts kbd {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 2px 5px;
                font-family: inherit;
                font-size: 10px;
                font-weight: 500;
                color: #768390;
                background: linear-gradient(180deg, #2d333b 0%, #282e36 100%);
                border: 1px solid #444c56;
                border-radius: 4px;
                box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
            }

            .toolbar-right {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .view-options {
                display: flex;
                align-items: center;
                background: #1c2128;
                border: 1px solid #373e47;
                border-radius: 6px;
                padding: 2px;
                gap: 2px;
            }

            .view-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 26px;
                background: transparent;
                border: none;
                border-radius: 4px;
                color: #545d68;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .view-btn:hover {
                color: #768390;
                background: rgba(99, 110, 123, 0.15);
            }

            .view-btn.active {
                color: #539bf5;
                background: rgba(65, 132, 228, 0.15);
            }

            .toolbar-divider {
                width: 1px;
                height: 24px;
                background: #373e47;
            }

            .font-size-control {
                display: flex;
                align-items: center;
                background: #1c2128;
                border: 1px solid #373e47;
                border-radius: 6px;
                overflow: hidden;
            }

            .font-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 26px;
                height: 26px;
                background: transparent;
                border: none;
                color: #768390;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .font-btn:hover {
                background: rgba(99, 110, 123, 0.2);
                color: #adbac7;
            }

            .font-btn:active {
                background: rgba(99, 110, 123, 0.3);
            }

            .font-size-display {
                padding: 0 8px;
                font-size: 11px;
                font-weight: 500;
                color: #adbac7;
                border-left: 1px solid #373e47;
                border-right: 1px solid #373e47;
                min-width: 40px;
                text-align: center;
            }

            .code-viewer-body {
                display: flex;
                flex: 1;
                overflow: hidden;
                position: relative;
                min-height: 300px;
            }

            .gutter-container {
                display: flex;
                flex-shrink: 0;
                background: #1c2128;
                border-right: 1px solid #444c56;
                user-select: none;
            }

            .gutter-fold-column {
                width: 16px;
                background: linear-gradient(90deg, #1c2128 0%, #22272e 100%);
                border-right: 1px solid #373e47;
            }

            .gutter-line-numbers {
                display: flex;
                flex-direction: column;
                padding: 12px 12px 12px 8px;
                text-align: right;
                font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
                font-size: 12px;
                line-height: 1.5;
                color: #545d68;
                min-width: 48px;
                background: #1c2128;
            }

            .gutter-diff-column {
                width: 4px;
                background: #1c2128;
            }

            .line-number {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                height: 18px;
                padding-right: 4px;
                cursor: pointer;
                transition: color 0.1s ease;
                position: relative;
            }

            .line-number:hover {
                color: #adbac7;
            }

            .line-number:hover::before {
                content: '';
                position: absolute;
                left: -8px;
                right: -12px;
                top: 0;
                bottom: 0;
                background: rgba(65, 132, 228, 0.08);
                border-radius: 2px;
                pointer-events: none;
            }

            .line-number.selected {
                color: #539bf5;
                font-weight: 600;
            }

            .line-number.selected::after {
                content: '';
                position: absolute;
                right: -13px;
                top: 0;
                bottom: 0;
                width: 3px;
                background: #539bf5;
                border-radius: 0 2px 2px 0;
            }

            .code-container {
                display: flex;
                flex: 1;
                overflow: auto;
                position: relative;
            }

            .code-content {
                flex: 1;
                margin: 0;
                padding: 12px 16px;
                font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
                font-size: 12px;
                line-height: 1.5;
                color: #adbac7;
                background: transparent;
                overflow: visible;
                tab-size: 2;
            }

            .code-content code {
                display: block;
                font-family: inherit;
                background: transparent;
            }
            
            .minimap-container {
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 80px;
                background: rgba(28, 33, 40, 0.9);
                border-left: 1px solid #373e47;
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none;
            }

            .code-viewer-body:hover .minimap-container {
                opacity: 1;
                pointer-events: auto;
            }

            .minimap-viewport {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: rgba(65, 132, 228, 0.1);
                border: 1px solid rgba(65, 132, 228, 0.3);
                border-radius: 2px;
                cursor: pointer;
                transition: background 0.15s ease;
            }

            .minimap-viewport:hover {
                background: rgba(65, 132, 228, 0.15);
            }

            .minimap-canvas {
                width: 100%;
                height: 100%;
                opacity: 0.6;
            }

            .code-viewer-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 12px;
                background: linear-gradient(180deg, #22272e 0%, #1c2128 100%);
                border-top: 1px solid #444c56;
                font-size: 11px;
                gap: 16px;
            }

            .footer-left {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .cursor-position {
                display: flex;
                align-items: center;
                gap: 4px;
                color: #768390;
                padding: 4px 8px;
                background: rgba(99, 110, 123, 0.1);
                border-radius: 4px;
            }

            .cursor-position strong {
                color: #adbac7;
                font-weight: 600;
            }

            .selection-info {
                color: #545d68;
            }

            .footer-center {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .language-selector {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                background: rgba(99, 110, 123, 0.1);
                border: 1px solid transparent;
                border-radius: 4px;
                color: #adbac7;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .language-selector:hover {
                background: rgba(99, 110, 123, 0.2);
                border-color: rgba(99, 110, 123, 0.3);
            }

            .language-selector svg:first-child {
                color: #f0c239;
            }

            .dropdown-arrow {
                color: #545d68;
                transition: transform 0.15s ease;
            }

            .language-selector:hover .dropdown-arrow {
                color: #768390;
            }

            .footer-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .indent-info,
            .encoding-info,
            .eol-info {
                color: #545d68;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .indent-info:hover,
            .encoding-info:hover,
            .eol-info:hover {
                background: rgba(99, 110, 123, 0.15);
                color: #768390;
            }

            .footer-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                background: transparent;
                border: 1px solid #373e47;
                border-radius: 4px;
                color: #768390;
                font-size: 11px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .footer-btn:hover {
                background: rgba(99, 110, 123, 0.15);
                color: #adbac7;
                border-color: #545d68;
            }

            .prettify-btn svg {
                color: #986ee2;
            }

            .code-line {
                display: block;
                height: 18px;
                line-height: 18px;
                padding: 0 4px;
                margin: 0 -4px;
                border-radius: 2px;
                transition: background 0.1s ease;
            }

            .code-line:hover {
                background: rgba(99, 110, 123, 0.08);
            }

            .code-line.highlighted {
                background: rgba(65, 132, 228, 0.15);
                box-shadow: inset 3px 0 0 #539bf5;
            }

            .code-line.added {
                background: rgba(70, 149, 74, 0.15);
                box-shadow: inset 3px 0 0 #46954a;
            }

            .code-line.removed {
                background: rgba(229, 83, 75, 0.15);
                box-shadow: inset 3px 0 0 #e5534b;
            }

            .code-line.modified {
                background: rgba(174, 124, 20, 0.15);
                box-shadow: inset 3px 0 0 #ae7c14;
            }

            .token-keyword {
                color: #f47067;
                font-weight: 500;
            }

            .token-string {
                color: #96d0ff;
            }

            .token-number {
                color: #6cb6ff;
            }

            .token-comment {
                color: #768390;
                font-style: italic;
            }

            .token-function {
                color: #dcbdfb;
            }

            .token-class {
                color: #f69d50;
            }

            .token-variable {
                color: #adbac7;
            }

            .token-operator {
                color: #f47067;
            }

            .token-punctuation {
                color: #768390;
            }

            .token-property {
                color: #6cb6ff;
            }

            .token-constant {
                color: #6cb6ff;
                font-weight: 500;
            }

            .token-boolean {
                color: #6cb6ff;
            }

            .token-regex {
                color: #96d0ff;
            }

            .token-tag {
                color: #8ddb8c;
            }

            .token-attr-name {
                color: #6cb6ff;
            }

            .token-attr-value {
                color: #96d0ff;
            }

            .code-viewer-container::-webkit-scrollbar,
            .code-container::-webkit-scrollbar {
                width: 14px;
                height: 14px;
            }

            .code-viewer-container::-webkit-scrollbar-track,
            .code-container::-webkit-scrollbar-track {
                background: #1c2128;
                border-radius: 7px;
            }

            .code-viewer-container::-webkit-scrollbar-thumb,
            .code-container::-webkit-scrollbar-thumb {
                background: #373e47;
                border: 3px solid #1c2128;
                border-radius: 7px;
                transition: background 0.15s ease;
            }

            .code-viewer-container::-webkit-scrollbar-thumb:hover,
            .code-container::-webkit-scrollbar-thumb:hover {
                background: #444c56;
            }

            .code-viewer-container::-webkit-scrollbar-corner,
            .code-container::-webkit-scrollbar-corner {
                background: #1c2128;
            }

            .fold-indicator {
                position: absolute;
                left: 2px;
                width: 12px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #545d68;
                transition: all 0.15s ease;
                border-radius: 2px;
            }

            .fold-indicator:hover {
                color: #adbac7;
                background: rgba(99, 110, 123, 0.2);
            }

            .fold-indicator svg {
                width: 10px;
                height: 10px;
                transition: transform 0.15s ease;
            }

            .fold-indicator.collapsed svg {
                transform: rotate(-90deg);
            }

            .folded-lines {
                display: inline-flex;
                align-items: center;
                padding: 0 6px;
                margin-left: 4px;
                background: rgba(65, 132, 228, 0.15);
                border: 1px solid rgba(65, 132, 228, 0.3);
                border-radius: 4px;
                font-size: 10px;
                font-weight: 500;
                color: #539bf5;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .folded-lines:hover {
                background: rgba(65, 132, 228, 0.25);
            }

            .diff-indicator {
                position: absolute;
                right: 0;
                width: 3px;
                height: 18px;
                border-radius: 1px;
            }

            .diff-indicator.added {
                background: #46954a;
            }

            .diff-indicator.removed {
                background: #e5534b;
            }

            .diff-indicator.modified {
                background: #ae7c14;
            }

            .blame-info {
                position: absolute;
                left: 100%;
                top: 0;
                padding: 0 12px;
                font-size: 11px;
                color: #545d68;
                white-space: nowrap;
                opacity: 0;
                transform: translateX(-8px);
                transition: all 0.2s ease;
                pointer-events: none;
            }

            .line-number:hover .blame-info {
                opacity: 1;
                transform: translateX(0);
            }

            .search-highlight {
                background: rgba(174, 124, 20, 0.4);
                border-radius: 2px;
                box-shadow: 0 0 0 1px rgba(174, 124, 20, 0.6);
            }

            .search-highlight.current {
                background: rgba(174, 124, 20, 0.6);
                box-shadow: 0 0 0 2px #ae7c14;
            }

            .selection-highlight {
                background: rgba(65, 132, 228, 0.25);
            }

            .bracket-match {
                background: rgba(99, 110, 123, 0.3);
                border: 1px solid #545d68;
                border-radius: 2px;
            }

            .indent-guide {
                position: absolute;
                width: 1px;
                background: #373e47;
                pointer-events: none;
            }

            .indent-guide.active {
                background: #545d68;
            }

            .cursor-line {
                background: rgba(99, 110, 123, 0.1);
            }

            .error-squiggle {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 3'%3E%3Cpath d='M0 3 L1.5 0 L3 3 L4.5 0 L6 3' stroke='%23e5534b' fill='none' stroke-width='1'/%3E%3C/svg%3E");
                background-repeat: repeat-x;
                background-position: bottom;
                background-size: 6px 3px;
                padding-bottom: 2px;
            }

            .warning-squiggle {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 3'%3E%3Cpath d='M0 3 L1.5 0 L3 3 L4.5 0 L6 3' stroke='%23ae7c14' fill='none' stroke-width='1'/%3E%3C/svg%3E");
                background-repeat: repeat-x;
                background-position: bottom;
                background-size: 6px 3px;
                padding-bottom: 2px;
            }

            .info-squiggle {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 3'%3E%3Cpath d='M0 3 L1.5 0 L3 3 L4.5 0 L6 3' stroke='%23539bf5' fill='none' stroke-width='1'/%3E%3C/svg%3E");
                background-repeat: repeat-x;
                background-position: bottom;
                background-size: 6px 3px;
                padding-bottom: 2px;
            }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }

            .cursor-caret {
                position: absolute;
                width: 2px;
                background: #539bf5;
                animation: blink 1s infinite;
                pointer-events: none;
                z-index: 10;
            }

            .autocomplete-popup {
                position: absolute;
                min-width: 280px;
                max-width: 400px;
                max-height: 240px;
                background: #2d333b;
                border: 1px solid #444c56;
                border-radius: 8px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
                overflow: hidden;
                z-index: 1000;
            }

            .autocomplete-header {
                padding: 8px 12px;
                background: #22272e;
                border-bottom: 1px solid #373e47;
                font-size: 11px;
                font-weight: 600;
                color: #768390;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .autocomplete-list {
                overflow-y: auto;
                max-height: 200px;
            }

            .autocomplete-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                cursor: pointer;
                transition: background 0.1s ease;
            }

            .autocomplete-item:hover {
                background: rgba(99, 110, 123, 0.15);
            }

            .autocomplete-item.selected {
                background: rgba(65, 132, 228, 0.2);
            }

            .autocomplete-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
            }

            .autocomplete-icon.function {
                background: rgba(220, 189, 251, 0.2);
                color: #dcbdfb;
            }

            .autocomplete-icon.variable {
                background: rgba(108, 182, 255, 0.2);
                color: #6cb6ff;
            }

            .autocomplete-icon.keyword {
                background: rgba(244, 112, 103, 0.2);
                color: #f47067;
            }

            .autocomplete-icon.class {
                background: rgba(246, 157, 80, 0.2);
                color: #f69d50;
            }

            .autocomplete-name {
                flex: 1;
                font-size: 13px;
                color: #adbac7;
            }

            .autocomplete-name mark {
                background: transparent;
                color: #539bf5;
                font-weight: 600;
            }

            .autocomplete-type {
                font-size: 11px;
                color: #545d68;
            }

            .loading-overlay {
                position: absolute;
                inset: 0;
                background: rgba(28, 33, 40, 0.8);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 16px;
                z-index: 100;
                backdrop-filter: blur(4px);
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #373e47;
                border-top-color: #539bf5;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loading-text {
                font-size: 13px;
                color: #768390;
            }

            @media (max-width: 768px) {
                .code-viewer-header {
                    flex-wrap: wrap;
                    padding: 8px 12px;
                }
                
                .header-center {
                    order: 3;
                    width: 100%;
                    justify-content: flex-start;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid #373e47;
                }
                
                .header-stats {
                    display: none;
                }
                
                .code-viewer-toolbar {
                    flex-wrap: wrap;
                }
                
                .toolbar-center {
                    order: 3;
                    max-width: none;
                    width: 100%;
                    margin-top: 8px;
                }
                
                .minimap-container {
                    display: none;
                }
                
                .code-viewer-footer {
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .footer-center {
                    order: -1;
                    width: 100%;
                    justify-content: flex-start;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }

    cacheElements() {
        this.elements = {
            container: null,
            lineNumbers: null,
            codeContent: null,
            codeBlock: null,
            fontSizeDisplay: null,
            cursorPosition: null,
            selectionInfo: null,
            searchInput: null,
            viewBtns: null,
            fontBtns: null,
            actionBtns: null,
            toolbarBtns: null,
            minimapViewport: null,
            minimapCanvas: null,
            codeContainer: null
        };
    }

    bindEvents() {
        // Events will be bound after viewer is created
    }

    createViewer(containerId = 'codeViewerContainer') {
        // Remove existing viewer if it exists
        const existingViewer = document.getElementById('codeViewerContainer');
        if (existingViewer) {
            existingViewer.remove();
        }

        // Create new viewer
        const viewerHTML = `
            <div class="code-viewer-container" id="${containerId}">
                <div class="code-viewer-header">
                    <div class="header-left">
                        <div class="file-icon">
                            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                <path d="M3.75 1.5a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V6H9.75A1.75 1.75 0 0 1 8 4.25V1.5H3.75Zm5.75.56 2.44 2.44H9.75a.25.25 0 0 1-.25-.25V2.06ZM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25V1.75Z"/>
                            </svg>
                        </div>
                        <span class="file-name" id="codeViewerFileName">index.js</span>
                        <div class="file-badge" id="encodingBadge">UTF-8</div>
                        <div class="file-badge" id="eolBadge">LF</div>
                    </div>
                    <div class="header-center">
                        <div class="breadcrumb-trail" id="codeViewerBreadcrumb">
                            <span class="breadcrumb-item">src</span>
                            <span class="breadcrumb-separator">/</span>
                            <span class="breadcrumb-item">components</span>
                            <span class="breadcrumb-separator">/</span>
                            <span class="breadcrumb-item active">index.js</span>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="header-stats">
                            <span class="stat-item">
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                    <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25Zm7.47 3.97a.75.75 0 0 1 1.06 0l2 2a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 1 1-1.06-1.06l1.47-1.47-1.47-1.47a.75.75 0 0 1 0-1.06Zm-3.44 0a.75.75 0 0 1 0 1.06L4.31 8l1.47 1.47a.75.75 0 1 1-1.06 1.06l-2-2a.75.75 0 0 1 0-1.06l2-2a.75.75 0 0 1 1.06 0Z"/>
                                </svg>
                                <span id="lineCountStat">0 lines</span>
                            </span>
                            <span class="stat-item">
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                    <path d="M2 1.75C2 .784 2.784 0 3.75 0h8.5C13.216 0 14 .784 14 1.75v12.5A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25ZM4.75 6h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5Zm0 2.5h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5ZM4.75 11h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5Z"/>
                                </svg>
                                <span id="fileSizeStat">0 KB</span>
                            </span>
                        </div>
                        <div class="header-actions">
                            <button class="action-btn" data-tooltip="Copy file" id="copyFileBtn">
                                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                                    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                                </svg>
                            </button>
                            <button class="action-btn" data-tooltip="Download" id="downloadFileBtn">
                                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
                                    <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
                                </svg>
                            </button>
                            <div class="action-divider"></div>
                            <button class="action-btn edit-btn" id="editFileBtn">
                                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                    <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/>
                                </svg>
                                <span>Edit</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="code-viewer-toolbar">
                    <div class="toolbar-left">
                        <button class="toolbar-btn active" id="codeViewBtn">
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                <path d="M4 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"/>
                            </svg>
                            <span>Code</span>
                        </button>
                        <button class="toolbar-btn" id="blameViewBtn">
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"/>
                            </svg>
                            <span>Blame</span>
                        </button>
                    </div>
                    <div class="toolbar-center">
                        <div class="search-container">
                            <svg class="search-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/>
                            </svg>
                            <input type="text" class="search-input" id="codeSearchInput" placeholder="Search in file...">
                            <div class="search-shortcuts">
                                <kbd>Ctrl</kbd><kbd>F</kbd>
                            </div>
                        </div>
                    </div>
                    <div class="toolbar-right">
                        <div class="view-options">
                            <button class="view-btn active" data-tooltip="Wrap lines" id="wrapLinesBtn">
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                    <path d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5ZM3 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
                                </svg>
                            </button>
                            <button class="view-btn" data-tooltip="Minimap" id="minimapBtn">
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                    <path d="M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75C0 1.784.784 1 1.75 1Zm12.5 1.5H1.75a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25Zm-9.5 2h-1v2h1v-2Zm0 3.5h-1V10h1V8Zm0 3.5h-1V13h1v-1.5Z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="toolbar-divider"></div>
                        <div class="font-size-control">
                            <button class="font-btn" data-action="decrease" id="decreaseFontBtn">
                                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                    <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5Z"/>
                                </svg>
                            </button>
                            <span class="font-size-display" id="fontSizeDisplay">12px</span>
                            <button class="font-btn" data-action="increase" id="increaseFontBtn">
                                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                    <path d="M7.25 3.75a.75.75 0 0 1 1.5 0V7.25h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="code-viewer-body">
                    <div class="gutter-container">
                        <div class="gutter-fold-column"></div>
                        <div class="gutter-line-numbers" id="codeViewerLineNumbers"></div>
                        <div class="gutter-diff-column"></div>
                    </div>
                    <div class="code-container" id="codeContainer">
                        <pre id="codeContent" class="code-content"><code id="codeBlock" class="language-javascript"></code></pre>
                        <div class="minimap-container">
                            <div class="minimap-viewport" id="minimapViewport"></div>
                            <canvas class="minimap-canvas" id="minimapCanvas"></canvas>
                        </div>
                    </div>
                </div>
                <div class="code-viewer-footer">
                    <div class="footer-left">
                        <div class="cursor-position" id="cursorPosition">
                            <span>Ln <strong>1</strong>, Col <strong>1</strong></span>
                        </div>
                        <div class="selection-info" id="selectionInfo">
                            <span>0 selected</span>
                        </div>
                    </div>
                    <div class="footer-center">
                        <div class="language-selector" id="languageSelector">
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                <path d="M1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v8.5a.25.25 0 0 1-.25.25h-6.5a.75.75 0 0 0-.53.22L5.5 13.44V12a.75.75 0 0 0-.75-.75H1.75a.25.25 0 0 1-.25-.25Zm.25-1.75A1.75 1.75 0 0 0 0 2.75v8.5C0 12.216.784 13 1.75 13H4v1.543a1.458 1.458 0 0 0 2.487 1.03L8.061 14h6.189A1.75 1.75 0 0 0 16 12.25v-8.5A1.75 1.75 0 0 0 14.25 1Z"/>
                            </svg>
                            <span id="languageDisplay">JavaScript</span>
                            <svg class="dropdown-arrow" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                <path d="M4.427 7.427a.25.25 0 0 1 .354-.004l3.22 3.068 3.22-3.068a.25.25 0 0 1 .354.004l.706.707a.25.25 0 0 1-.004.354l-3.866 3.676a.5.5 0 0 1-.708 0L3.717 8.488a.25.25 0 0 1-.004-.354Z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="footer-right">
                        <div class="indent-info" id="indentInfo">
                            <span>Spaces: 2</span>
                        </div>
                        <div class="encoding-info" id="encodingInfo">
                            <span>UTF-8</span>
                        </div>
                        <div class="eol-info" id="eolInfo">
                            <span>LF</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert viewer into fileViewer container
        const fileViewer = document.getElementById('fileViewer');
        if (fileViewer) {
            // Clear existing content
            fileViewer.innerHTML = '';
            fileViewer.insertAdjacentHTML('beforeend', viewerHTML);
            
            // Update cached elements
            this.updateCachedElements();
            
            // Bind events
            this.bindViewerEvents();
            
            return true;
        }
        
        return false;
    }

    updateCachedElements() {
        this.elements = {
            container: document.getElementById('codeViewerContainer'),
            lineNumbers: document.getElementById('codeViewerLineNumbers'),
            codeContent: document.getElementById('codeContent'),
            codeBlock: document.getElementById('codeBlock'),
            fontSizeDisplay: document.getElementById('fontSizeDisplay'),
            cursorPosition: document.getElementById('cursorPosition'),
            selectionInfo: document.getElementById('selectionInfo'),
            searchInput: document.getElementById('codeSearchInput'),
            codeContainer: document.getElementById('codeContainer'),
            fileName: document.getElementById('codeViewerFileName'),
            breadcrumb: document.getElementById('codeViewerBreadcrumb'),
            lineCountStat: document.getElementById('lineCountStat'),
            fileSizeStat: document.getElementById('fileSizeStat'),
            languageDisplay: document.getElementById('languageDisplay'),
            copyFileBtn: document.getElementById('copyFileBtn'),
            downloadFileBtn: document.getElementById('downloadFileBtn'),
            editFileBtn: document.getElementById('editFileBtn'),
            wrapLinesBtn: document.getElementById('wrapLinesBtn'),
            minimapBtn: document.getElementById('minimapBtn'),
            minimapViewport: document.getElementById('minimapViewport'),
            minimapCanvas: document.getElementById('minimapCanvas'),
            increaseFontBtn: document.getElementById('increaseFontBtn'),
            decreaseFontBtn: document.getElementById('decreaseFontBtn'),
            codeViewBtn: document.getElementById('codeViewBtn'),
            blameViewBtn: document.getElementById('blameViewBtn')
        };
    }

    bindViewerEvents() {
        const self = this;

        // Font size controls
        if (this.elements.increaseFontBtn) {
            this.elements.increaseFontBtn.addEventListener('click', function() {
                self.changeFontSize(1);
            });
        }

        if (this.elements.decreaseFontBtn) {
            this.elements.decreaseFontBtn.addEventListener('click', function() {
                self.changeFontSize(-1);
            });
        }

        // View options
        if (this.elements.wrapLinesBtn) {
            this.elements.wrapLinesBtn.addEventListener('click', function() {
                self.toggleWordWrap();
            });
        }

        if (this.elements.minimapBtn) {
            this.elements.minimapBtn.addEventListener('click', function() {
                self.toggleMinimap();
            });
        }

        // Copy file button
        if (this.elements.copyFileBtn) {
            this.elements.copyFileBtn.addEventListener('click', function() {
                self.copyCode();
            });
        }

        // Download file button
        if (this.elements.downloadFileBtn) {
            this.elements.downloadFileBtn.addEventListener('click', function() {
                self.downloadCurrentFile();
            });
        }

        // Edit file button
        if (this.elements.editFileBtn) {
            this.elements.editFileBtn.addEventListener('click', function() {
                if (window.editFile && typeof window.editFile === 'function') {
                    window.editFile();
                }
            });
        }

        // View toggles
        if (this.elements.codeViewBtn && this.elements.blameViewBtn) {
            this.elements.codeViewBtn.addEventListener('click', function() {
                self.elements.codeViewBtn.classList.add('active');
                self.elements.blameViewBtn.classList.remove('active');
                // Switch to code view
            });

            this.elements.blameViewBtn.addEventListener('click', function() {
                self.elements.codeViewBtn.classList.remove('active');
                self.elements.blameViewBtn.classList.add('active');
                // Switch to blame view
            });
        }

        // Search input
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', function() {
                self.handleSearch(this.value);
            });

            this.elements.searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    this.blur();
                    self.clearSearchHighlights();
                }
            });
        }

        // Scroll sync
        if (this.elements.codeContainer) {
            this.elements.codeContainer.addEventListener('scroll', function() {
                self.syncScroll();
                self.updateMinimapViewport();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                if (self.elements.searchInput) {
                    self.elements.searchInput.focus();
                    self.elements.searchInput.select();
                }
            }
        });

        // Selection info
        if (this.elements.codeContent) {
            this.elements.codeContent.addEventListener('mouseup', function() {
                self.updateSelectionInfo();
            });
        }
    }

    displayFileContent(filename, fileData) {
        if (!this.createViewer()) {
            console.error('Failed to create code viewer');
            return;
        }

        this.currentFile = filename;
        const content = fileData.content || '';
        const ext = filename.split('.').pop().toLowerCase();
        const language = getLanguageName(ext);
        const lines = content.split('\n');
        const lineCount = lines.length;
        const fileSize = new Blob([content]).size;

        // Update UI elements
        if (this.elements.fileName) {
            this.elements.fileName.textContent = filename;
        }

        if (this.elements.languageDisplay) {
            this.elements.languageDisplay.textContent = language;
        }

        if (this.elements.lineCountStat) {
            this.elements.lineCountStat.textContent = `${lineCount} lines`;
        }

        if (this.elements.fileSizeStat) {
            this.elements.fileSizeStat.textContent = formatFileSize(fileSize);
        }

        // Set code content with line wrapping
        if (this.elements.codeBlock) {
            let html = '';
            lines.forEach(function(line, index) {
                html += `<span class="code-line" data-line="${index + 1}">${escapeHtml(line)}\n</span>`;
            });
            this.elements.codeBlock.innerHTML = html;
            
            // Apply syntax highlighting if Prism is available
            setTimeout(() => {
                if (window.Prism && this.elements.codeBlock) {
                    try {
                        Prism.highlightElement(this.elements.codeBlock);
                    } catch (error) {
                        console.warn('Prism highlighting failed:', error);
                    }
                }
            }, 50);
        }

        // Render line numbers
        this.renderLineNumbers();

        // Update breadcrumb
        this.updateBreadcrumb();

        // Enable word wrap by default
        this.toggleWordWrap();
    }

    renderLineNumbers() {
        if (!this.elements.lineNumbers || !this.elements.codeBlock) return;

        const code = this.elements.codeBlock.textContent || '';
        const lines = code.split('\n');
        this.state.totalLines = lines.length;

        let html = '';
        for (let i = 1; i <= lines.length; i++) {
            html += `<div class="line-number" data-line="${i}">${i}</div>`;
        }

        this.elements.lineNumbers.innerHTML = html;
    }

    updateBreadcrumb() {
        if (!this.elements.breadcrumb || !currentState) return;

        let html = '';
        if (currentState.repository) {
            html += `<span class="breadcrumb-item" onclick="navigateToRoot()">${currentState.repository}</span>`;
            
            if (currentState.path) {
                const segments = currentState.path.split('/');
                let currentPath = '';
                segments.forEach((segment, index) => {
                    currentPath += (currentPath ? '/' : '') + segment;
                    html += `
                        <span class="breadcrumb-separator">/</span>
                        <span class="breadcrumb-item" onclick="navigateToPath('${currentPath}')">${segment}</span>
                    `;
                });
            }
            
            html += `<span class="breadcrumb-separator">/</span>`;
        }
        
        html += `<span class="breadcrumb-item active">${this.currentFile}</span>`;
        
        this.elements.breadcrumb.innerHTML = html;
    }

    changeFontSize(delta) {
        const minSize = 8;
        const maxSize = 24;
        let newSize = this.state.fontSize + delta;

        if (newSize < minSize) newSize = minSize;
        if (newSize > maxSize) newSize = maxSize;

        this.state.fontSize = newSize;

        if (this.elements.codeContent) {
            this.elements.codeContent.style.fontSize = newSize + 'px';
        }
        if (this.elements.lineNumbers) {
            this.elements.lineNumbers.style.fontSize = newSize + 'px';
        }
        if (this.elements.fontSizeDisplay) {
            this.elements.fontSizeDisplay.textContent = newSize + 'px';
        }

        this.renderLineNumbers();
    }

    toggleWordWrap() {
        if (this.elements.wrapLinesBtn) {
            this.state.wrapEnabled = !this.state.wrapEnabled;
            this.elements.wrapLinesBtn.classList.toggle('active', this.state.wrapEnabled);
        }

        if (this.elements.codeContent) {
            if (this.state.wrapEnabled) {
                this.elements.codeContent.style.whiteSpace = 'pre-wrap';
                this.elements.codeContent.style.wordBreak = 'break-word';
            } else {
                this.elements.codeContent.style.whiteSpace = 'pre';
                this.elements.codeContent.style.wordBreak = 'normal';
            }
        }
    }

    toggleMinimap() {
        if (this.elements.minimapBtn) {
            this.state.minimapEnabled = !this.state.minimapEnabled;
            this.elements.minimapBtn.classList.toggle('active', this.state.minimapEnabled);
        }

        const minimap = document.querySelector('.minimap-container');
        if (minimap) {
            if (this.state.minimapEnabled) {
                minimap.style.opacity = '1';
                minimap.style.pointerEvents = 'auto';
                this.renderMinimap();
            } else {
                minimap.style.opacity = '0';
                minimap.style.pointerEvents = 'none';
            }
        }
    }

    renderMinimap() {
        if (!this.elements.minimapCanvas || !this.elements.codeBlock) return;

        const canvas = this.elements.minimapCanvas;
        const ctx = canvas.getContext('2d');
        const code = this.elements.codeBlock.textContent || '';
        const lines = code.split('\n');

        canvas.width = 80;
        canvas.height = Math.min(lines.length * 2, 400);

        ctx.fillStyle = '#1c2128';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        lines.forEach(function(line, index) {
            const y = index * 2;
            const lineLength = Math.min(line.length, 60);
            
            if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
                ctx.fillStyle = '#768390';
            } else if (line.includes('function') || line.includes('const') || line.includes('let')) {
                ctx.fillStyle = '#f47067';
            } else if (line.includes('"') || line.includes("'")) {
                ctx.fillStyle = '#96d0ff';
            } else {
                ctx.fillStyle = '#545d68';
            }

            ctx.fillRect(4, y, lineLength, 1);
        });

        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        if (!this.elements.minimapViewport || !this.elements.codeContainer) return;

        const container = this.elements.codeContainer;
        const scrollRatio = container.scrollTop / (container.scrollHeight - container.clientHeight);
        const viewportHeight = (container.clientHeight / container.scrollHeight) * 400;
        const maxTop = 400 - viewportHeight;

        if (this.elements.minimapViewport) {
            this.elements.minimapViewport.style.height = Math.max(viewportHeight, 30) + 'px';
            this.elements.minimapViewport.style.top = (scrollRatio * maxTop) + 'px';
        }
    }

    syncScroll() {
        if (this.elements.codeContainer && this.elements.lineNumbers) {
            this.elements.lineNumbers.style.transform = 
                `translateY(-${this.elements.codeContainer.scrollTop}px)`;
        }
    }

    copyCode() {
        const code = this.elements.codeBlock ? this.elements.codeBlock.textContent : '';
        const self = this;

        navigator.clipboard.writeText(code).then(function() {
            self.showCopyFeedback();
        }).catch(function(err) {
            console.error('Failed to copy:', err);
        });
    }

    showCopyFeedback() {
        const copyBtn = this.elements.copyFileBtn;
        if (copyBtn) {
            const originalTooltip = copyBtn.dataset.tooltip;
            copyBtn.dataset.tooltip = 'Copied!';
            copyBtn.classList.add('copied');

            setTimeout(function() {
                copyBtn.dataset.tooltip = originalTooltip;
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    }

    downloadCurrentFile() {
        if (!this.currentFile) return;
        
        if (window.downloadCurrentFile && typeof window.downloadCurrentFile === 'function') {
            window.downloadCurrentFile();
        }
    }

    handleSearch(query) {
        this.clearSearchHighlights();
        
        if (!query || query.length < 2) return;

        const codeText = this.elements.codeBlock.textContent;
        const regex = new RegExp(this.escapeRegex(query), 'gi');
        let match;
        const matches = [];

        while ((match = regex.exec(codeText)) !== null) {
            matches.push({
                index: match.index,
                length: match[0].length
            });
        }

        if (matches.length > 0) {
            this.highlightSearchMatches(matches, query);
        }
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    highlightSearchMatches(matches, query) {
        const codeHtml = this.elements.codeBlock.innerHTML;
        let newHtml = codeHtml;
        const regex = new RegExp('(' + this.escapeRegex(query) + ')', 'gi');
        
        newHtml = newHtml.replace(regex, '<mark class="search-highlight">$1</mark>');
        this.elements.codeBlock.innerHTML = newHtml;

        const firstMatch = document.querySelector('.search-highlight');
        if (firstMatch) {
            firstMatch.classList.add('current');
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    clearSearchHighlights() {
        const highlights = this.elements.codeBlock ? this.elements.codeBlock.querySelectorAll('.search-highlight') : [];
        highlights.forEach(function(el) {
            const text = el.textContent;
            el.replaceWith(text);
        });
    }

    updateSelectionInfo() {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        const charCount = selectedText.length;
        const lineCount = selectedText ? selectedText.split('\n').length : 0;

        if (this.elements.selectionInfo) {
            if (charCount > 0) {
                this.elements.selectionInfo.innerHTML = 
                    `<span>${charCount} char${charCount !== 1 ? 's' : ''}</span>` +
                    (lineCount > 1 ? `<span>, ${lineCount} lines</span>` : '');
            } else {
                this.elements.selectionInfo.innerHTML = '<span>0 selected</span>';
            }
        }
    }
}


const codeViewerManager = new CodeViewerManager();

window.codeViewerManager = codeViewerManager;
window.CodeViewerManager = CodeViewerManager;



function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
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