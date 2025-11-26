export function artistCard(data) {
  return `
    <div class="artist-card rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 cursor-pointer hover:shadow-lg transition-all hover:bg-white/10" data-artist-id="${data.id}">
      <div class="text-center">
        <div class="artist-avatar w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
          <img src="${data.cover}" alt="${data.artist}" class="w-full h-full object-cover">
        </div>
        <h3 class="text-lg font-bold mb-2 text-white">${data.artist}</h3>
        <div class="genre-tag inline-block px-3 py-1 bg-blue-600/30 rounded-full text-xs font-medium mb-3 text-blue-200">${data.genre}</div>
        <p class="text-sm opacity-70 text-gray-300">${data.albumCount} album${data.albumCount !== 1 ? "s" : ""}</p>
      </div>
    </div>
  `;
}
