export function singleAlbumCard(data) {
  return `
    <div class="album-card p-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5">
      <div class="albumFade" data-album-id="${data.albumId}">
        <div class="gap-6 items-center md:items-start">
          <div class="album-image relative flex-shrink-0">
            <button aria-label="Name" class="play-album absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
            </button>
            <h3 class="text-2xl font-bold mb-2 text-white">${data.album}</h3>
            <p class="text-sm opacity-70 mb-4 text-gray-300">${data.year || "Unknown year"} • ${data.songCount} Tracks</p>
          </div>
        </div>
      </div>
      <div class="songs-container" id="songs-container-${data.albumId}"></div>
    </div>
  `;
}
