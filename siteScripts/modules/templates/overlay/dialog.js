

export function overlayDialog(data) {
  return `
    <div class="header">${data.message}</div>
    <div class="actions">
      ${data.cancelText ? `<button class="btn muted" data-cancel>${data.cancelText}</button>` : ""}
      <button class="btn ${data.danger ? "danger" : "primary"}" data-ok>${data.okText}</button>
    </div>
  `;
}