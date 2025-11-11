# Refactoring Implementation Guide

## Project Scope Assessment

This refactoring project represents **22-34 developer days (4-7 weeks)** of work. It is not a simple coding task but a comprehensive application rewrite that includes:

1. **File Restructuring**: Migrating ~3,500 lines across 10 files into new modular structure
2. **Architectural Refactoring**: Event delegation, reactive state, class-to-object conversions
3. **UI Overhaul**: Complete responsive desktop layout redesign
4. **Feature Implementation**: 18 distinct new features

## Current Progress

### Completed ✅
- Created `updated` branch
- Created new `src/` folder structure (core, modules, pages, utils)
- Created `src/utils/constants.js` with ACTION_GRID_ITEMS, TOAST_ICONS, prefersReducedMotion
- Created `src/modules/state.js` with reactive state store (get/set/subscribe pattern)
- Created `src/modules/storage.js` with localStorage abstraction

### Foundation Architecture

The reactive state module (`src/modules/state.js`) implements a pub/sub pattern:

```javascript
// Subscribe to state changes
appState.subscribe((state, key, value) => {
  if (key === 'isPlaying') {
    ui.updatePlayPauseButtons();
  }
});

// Set state (automatically notifies subscribers)
appState.set('isPlaying', true);
```

## Implementation Roadmap

### Phase 1: Complete Module Extraction (Est: 3-5 days)

Extract remaining objects from `siteScripts/global.js`:

1. **src/modules/notifications.js** (lines 549-742)
   - Extract `notifications` object
   - Import dependencies: TOAST_ICONS, NOTIFICATION_TYPES, appState

2. **src/modules/overlays.js** (lines 368-548)
   - Extract `overlays` object  
   - Add focus management per Task 3, Feature #16

3. **src/modules/playlist.js** (lines 2987-3510)
   - Extract `playlists` object (note: singular filename per spec)

4. **src/modules/player.js** (lines 1302-2212)
   - Extract `musicPlayer` object
   - Add volume controls (Feature #2)
   - Add gapless playback (Feature #3)
   - Add audio visualizer (Feature #1)
   - Add lyrics integration (Feature #5)
   - Add radio mode (Feature #7)

5. **src/modules/media.js** (lines 743-1301)
   - Extract `notificationPlayer` object

6. **src/core/app.js** (lines 2930-2986)
   - Extract `app` object and initialize function
   - Set up state subscriptions in app.initialize()

7. **src/core/events.js** (NEW - see notes)
   - Create `eventHandlers` object for event delegation
   - Implement keyboard shortcuts (Feature #15)

8. **src/utils/helpers.js** (lines 160-277)
   - Extract `utils` object

### Phase 2: Migrate Other Files (Est: 1-2 days)

Move and update imports:

```bash
mv siteScripts/pages/rendering.js src/pages/rendering.js
mv siteScripts/pages/router.js src/pages/router.js
mv siteScripts/pages/statics.js src/pages/statics.js
mv siteScripts/pages/updates.js src/pages/updates.js
mv siteScripts/utilities/search.js src/modules/search.js
mv siteScripts/utilities/parsers.js src/utils/parsers.js
mv siteScripts/utilities/templates.js src/utils/templates.js
mv siteScripts/map.js src/core/map.js
# Note: There is no init.js currently, will need to create src/init.js
```

### Phase 3: Search Refactoring (Est: 1 day)

Convert `src/modules/search.js` from ES6 class to object literal:

```javascript
// Before (class):
class MusicSearch {
  constructor() { ... }
  performSearch(query) { ... }
}

// After (object literal):
const musicSearch = {
  init: function() { ... },
  performSearch: function(query) { ... }
};
```

Add genre/year filtering (Feature #10).

### Phase 4: Event Delegation (Est: 2-3 days)

Replace individual event listeners with delegated listeners:

```javascript
// Old approach (in rendering.js):
container.querySelectorAll('.song-item').forEach(el => {
  el.addEventListener('click', handleClick);
});

// New approach (in events.js):
document.getElementById('dynamic-content').addEventListener('click', (e) => {
  const songItem = e.target.closest('.song-item');
  if (songItem) {
    handleSongClick(songItem);
  }
});
```

Target selectors: `.song-item`, `.action-btn`, `.album-tab`, `.playlist-card`, `.song-row`

### Phase 5: Update All Imports (Est: 1-2 days)

Systematically update every file's import/export statements:

```javascript
// Old:
import { appState } from '../global.js';

// New:
import { appState } from '../modules/state.js';
```

Update `index.html` script tags to point to new structure.

### Phase 6: Desktop Layout Overhaul (Est: 2-3 days)

Create new CSS file: `stylingSheets/responsive/desktop-refactor.css`

```css
/* Mobile-only navbar */
@media (max-width: 768px) {
  .navbar { display: flex; }
}
@media (min-width: 769px) {
  .navbar { display: none; }
}

/* Desktop left sidebar */
@media (min-width: 769px) {
  .desktop-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 280px;
    height: 100vh;
    /* Convert dropdown-menu content */
  }
  
  .desktop-sidebar.collapsed {
    width: 64px;
  }
  
  /* Desktop right player */
  #music-player {
    position: fixed;
    right: 0;
    top: 0;
    width: 400px;
    height: 100vh;
    display: block;
  }
  
  /* Adjust main content */
  #main-container {
    margin-left: 280px;
    margin-right: 400px;
  }
}
```

### Phase 7: Feature Implementation (Est: 10-15 days)

Implement each of the 18 features systematically. Priority order:

**High Priority (Core UX):**
1. Volume Controls (Feature #2) - In player.js
2. Download Track (Feature #6) - In rendering.js
3. Keyboard Shortcuts Legend (Feature #15) - In events.js
4. Focus Management (Feature #16) - In overlays.js

**Medium Priority:**
5. Audio Visualizer (Feature #1) - In player.js
6. Search Filtering (Feature #10) - In search.js
7. Recently Added Section (Feature #11) - In statics.js
8. Lyrics Integration (Feature #5) - In player.js
9. Drag-and-Drop Queue (Feature #4) - In player.js

**Lower Priority:**
10. Gapless Playback (Feature #3) - In player.js
11. Radio Mode (Feature #7) - In player.js
12. Cross-Tab Syncing (Feature #17) - New file: src/core/broadcast.js
13. Genre Pages Support (Feature #8) - In router.js

**Future/Notes Only:**
14-18. Share Cards, Collaborative Playlists, User Profiles, Similar Artists, Last.fm (acknowledgment only)

### Phase 8: Testing & Integration (Est: 3-5 days)

1. Test all state subscriptions work correctly
2. Verify event delegation doesn't break existing functionality
3. Test desktop/mobile layouts on all breakpoints
4. Verify all imports resolve correctly
5. Test each of the 18 features
6. Integration testing
7. Performance testing

## Critical Constraints Checklist

- [ ] All code on `updated` branch
- [ ] `siteScripts/unifiedPlayerController.js` completely ignored
- [ ] New JS files use single-word naming (no dashes/underscores)
- [ ] No existing HTML id/class attributes renamed
- [ ] Custom CSS only (no Tailwind/Bootstrap)
- [ ] Object Literal pattern for all new modules
- [ ] CSS media queries for responsive (not JavaScript detection)

## Notes on Feasibility

**This is an enterprise-scale refactoring** that would typically:
- Be broken into multiple sprints (3-6 sprints)
- Have multiple developers working in parallel
- Include comprehensive testing at each phase
- Be deployed incrementally to reduce risk

**Recommended Approach:**
1. Complete Phase 1-2 first (foundation)
2. Deploy and test
3. Complete Phase 3-5 (refactoring)
4. Deploy and test
5. Implement features incrementally in Phase 7
6. Each feature should be a separate PR for review

## Next Steps

1. Continue extracting modules from global.js following Phase 1
2. Create comprehensive unit tests for each module
3. Update imports systematically
4. Implement desktop layout
5. Add features one by one with testing

This guide provides the roadmap. The actual implementation requires dedicated time and systematic execution of each phase.
