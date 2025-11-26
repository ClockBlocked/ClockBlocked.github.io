

export function overlayViewer(data) {
  return `
    <div class="viewer-container">
      <button class="viewer-close" data-close aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <div class="viewer-content">
        ${data.content}
      </div>
    </div>
  `;
}