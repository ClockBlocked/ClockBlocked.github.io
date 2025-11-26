

export function overlayDefault(data) {
  return `
    <div class="close" data-close>&times;</div>
    <div class="content">${data.content}</div>
  `;
}