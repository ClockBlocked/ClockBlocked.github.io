export function albumSection(data) {
  return `
    <div class="albumSongListArea">
      <div class="album-buttons">
        <div class="album-selector">
          ${data.albums
            .map(
              (album, index) => `
            <button class="album-tab px-4 py-2 rounded-lg transition-all duration-300 ${
              index === 0 ? "active bg-accent-primary text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }" 
                    data-album-index="${index}" 
                    data-album-name="${album.album}">
              <div class="flex items-center gap-2">
                <span class="album-tab-title">${album.album}</span>
                <span class="album-tab-year text-xs opacity-75">${album.year || ""}</span>
              </div>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
      <div class="current-album-container">
        <div id="current-album-display" class="transition-all duration-500 ease-in-out"></div>
      </div>
    </div>
  `;
}
