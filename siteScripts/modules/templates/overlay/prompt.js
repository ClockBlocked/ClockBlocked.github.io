

export function overlayPrompt(data) {
  return `
    <div class="modal-header">
      <h3>${data.message}</h3>
      <button class="modal-close" data-close>×</button>
    </div>
    
    <div class="modal-body">
      <input type="text" class="status-input" placeholder="${data.placeholder}" value="${data.value}">
    </div>
    
    <div class="modal-footer">
      <button class="btn-secondary" data-cancel>${data.cancelText}</button>
      <button class="create-playlist-btn btn-primary" data-ok>${data.okText}</button>
    </div>
  `;
}