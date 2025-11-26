export function artistHeader(data) {
  return `
    <div class="artist-header" id="artist-header">
      <div class="content-wrapper">
        <div class="artist-avatar">
          <img src="${data.cover}" alt="${data.artist}">
        </div>
        <div class="artist-info">
          <h1>${data.artist}</h1>
          <div class="metadata-tags">
            <span>${data.genre}</span>
            <span>${data.albumCount} Albums</span>
            <span>${data.songCount} Songs</span>
          </div>
          <div class="action-buttons">
            <button aria-label="Name" class="play">Play All</button>
            <button aria-label="Name" class="follow"
                    data-favorite-artists="${data.songData.id}">Favorite</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
