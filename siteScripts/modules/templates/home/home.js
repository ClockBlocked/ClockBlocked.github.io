export function pageHome() {
  return `
    <div class="text-center py-8 md:py-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Discover Amazing Music</h1>
      <p class="text-lg md:text-xl text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto">Explore artists, albums, and songs from your personal library with an immersive listening experience</p>
    </div>
    <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 px-4 text-white">Featured Artists</h2>
    <div id="featured-artists" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 px-4"></div>
  `;
}
