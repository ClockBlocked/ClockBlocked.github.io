export function pageHomeBento(data) {
  return `
    <div class="bento-grid">
      <div class="bento-card" data-loader="true">
        <div class="card-header">
          <h2 class="card-title">Recently Played</h2>
          <a href="#" class="card-link" data-view="recent">View All</a>
        </div>
        <div id="${data.IDS.recentlyPlayedSection}" class="card-content">
          <div class="skeleton-loader"></div>
        </div>
      </div>
      
      <div class="bento-card bento-span-2" data-loader="true">
        <div class="card-header">
          <h2 class="card-title">Discover Albums</h2>
          <a href="#" class="card-link" data-view="albums">Explore More</a>
        </div>
        <div id="${data.IDS.randomAlbumsSection}" class="card-content">
          <div class="skeleton-loader"></div>
        </div>
      </div>
      
      <div class="bento-card" data-loader="true">
        <div class="card-header">
          <h2 class="card-title">Favorite Artists</h2>
          <a href="#" class="card-link" data-view="favorite-artists">View All</a>
        </div>
        <div id="${data.IDS.favoriteArtistsSection}" class="card-content">
          <div class="skeleton-loader"></div>
        </div>
      </div>
      
      <div class="bento-card" data-loader="true">
        <div class="card-header">
          <h2 class="card-title">Your Playlists</h2>
          <a href="#" class="card-link" data-view="playlists">View All</a>
        </div>
        <div id="${data.IDS.playlistsSection}" class="card-content">
          <div class="skeleton-loader"></div>
        </div>
      </div>
      
      <div class="bento-card" data-loader="true">
        <div class="card-header">
          <h2 class="card-title">Favorite Songs</h2>
          <a href="#" class="card-link" data-view="favorite-songs">View All</a>
        </div>
        <div id="${data.IDS.favoriteSongsSection}" class="card-content">
          <div class="skeleton-loader"></div>
        </div>
      </div>
    </div>
  `;
}
