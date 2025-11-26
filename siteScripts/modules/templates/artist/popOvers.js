export function artistPopOvers(data) {
  const artistName = data.artist;
  const artistId = data.id || "";
  const artistImage = getArtistImageUrl(artistName);
  const totalAlbums = data.albums?.length || 0;
  const totalSongs = getTotalSongs(data) || 0;

  return `
<div class="similar-artist-card" data-artist-name="${artistName}">
  <div class="similar-artist-image">
    <img 
      src="${artistImage}" 
      alt="${artistName}" 
      class="w-full h-full object-cover artist-avatar"
    />
    <div class="artist-image-overlay"></div>
  </div>
  
  <div class="similar-artist-name">
    ${artistName}
  </div>
  
  <div class="artist-popover">
    <div class="popover-header">
      <div class="popover-artist-name">${artistName}</div>
    </div>
    
    <div class="popover-stats">
      <div class="stat-item">
        <span class="stat-value">${totalAlbums}</span>
        <span class="stat-label">Albums</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${totalSongs}</span>
        <span class="stat-label">Songs</span>
      </div>
    </div>
    
    <div class="popover-footer">
      <button aria-label="Name" class="popover-button" data-artist-id="${artistId}">
        View Artist
      </button>
    </div>
  </div>
</div>`;
}
