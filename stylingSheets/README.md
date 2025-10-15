# Stylesheet Organization

This directory contains all the stylesheets for the MyBeats application, organized for maintainability and clarity.

## 📁 File Structure

### Core Styles (Load Order Critical)
These files must be loaded in numerical order as they build upon each other:

1. **00-variables.css** - CSS custom properties (variables)
   - Shadow definitions
   - Blur effects
   - Transitions and animations timing
   - Border radius values
   - Z-index layering
   - Spacing scale
   - Desktop layout variables

2. **01-themes.css** - Theme color definitions
   - Dark theme
   - Dim theme
   - Light theme
   - All theme-specific color variables

3. **02-reset.css** - Base resets and global styles
   - Box model reset
   - Scroll behavior
   - Body and HTML base styles
   - Page wrapper structure

4. **03-animations.css** - Keyframe animations
   - Toast animations
   - Fade effects
   - Image loading states
   - Navbar animations
   - All @keyframes definitions

5. **main.css** - Main component styles
   - Artist components
   - General UI components
   - Component-specific overrides

### Page Styles
- **pages/core.css** - Core page layout styles
- **pages/home.css** - Home page specific styles
- **pages/artist.css** - Artist page specific styles

### Component Styles
- **components/breadCrumbs.css** - Breadcrumb navigation
- **components/navbarPlayer.css** - Navigation bar and player
- **components/playlists.css** - Playlist components

### Global Styles
- **global/fonts.css** - Font definitions and @font-face rules
- **global/svg.css** - SVG icon styles

### Layout Styles
- **desktop-layout.css** - Desktop-specific layout (>1024px)
- **inline-styles.css** - Inline utility styles
- **responsive/tablet.css** - Tablet layout (768px-1024px)
- **responsive/desktop.css** - Desktop responsive styles (>1024px)

### Utility Styles
- **tailwind-conversion.css** - Tailwind-like utility classes

### Overlay Styles
- **overlays/overlays.css** - Modal and dialog styles
- **overlays/dynamicOverlays.css** - Dynamic UI overlay components

## 🔄 Migration Notes

### Removed Files
- ❌ `extra.css` - Consolidated into organized files
- ❌ `components/lists.css` - Empty file, removed
- ❌ `global/animatedly.css` - Empty file, removed
- ❌ Root-level `overlays.css` - Moved to `overlays/`
- ❌ Root-level `dynamicOverlays.css` - Moved to `overlays/`

### Duplicates Removed
- CSS variables were duplicated in `main.css` and `extra.css`
- Theme definitions were duplicated across files
- `artist.css` was referenced twice in `index.html`

### Key Changes
1. **Consolidated Variables**: All CSS variables now in `00-variables.css`
2. **Unified Themes**: All theme definitions in `01-themes.css`
3. **Extracted Animations**: All keyframes in `03-animations.css`
4. **Organized Structure**: Clear separation by purpose
5. **Preserved Overrides**: Maintained CSS cascade and override logic

## 📋 Load Order in index.html

```html
<!-- Core Styles - Load in order -->
<link rel="stylesheet" href="./stylingSheets/00-variables.css" />
<link rel="stylesheet" href="./stylingSheets/01-themes.css" />
<link rel="stylesheet" href="./stylingSheets/02-reset.css" />
<link rel="stylesheet" href="./stylingSheets/03-animations.css" />
<link rel="stylesheet" href="./stylingSheets/main.css" />

<!-- Page Styles -->
<link rel="stylesheet" href="./stylingSheets/pages/core.css" />
<link rel="stylesheet" href="./stylingSheets/pages/home.css" />
<link rel="stylesheet" href="./stylingSheets/pages/artist.css" />

<!-- Component Styles -->
<link rel="stylesheet" href="./stylingSheets/components/breadCrumbs.css" />
<link rel="stylesheet" href="./stylingSheets/components/navbarPlayer.css" />
<link rel="stylesheet" href="./stylingSheets/components/playlists.css" />

<!-- Global Styles -->
<link rel="stylesheet" href="./stylingSheets/global/fonts.css" />
<link rel="stylesheet" href="./stylingSheets/global/svg.css" />

<!-- Layout Styles -->
<link rel="stylesheet" href="./stylingSheets/desktop-layout.css" />
<link rel="stylesheet" href="./stylingSheets/inline-styles.css" />

<!-- Utility Styles -->
<link rel="stylesheet" href="./stylingSheets/tailwind-conversion.css" />

<!-- Overlay Styles -->
<link rel="stylesheet" href="./stylingSheets/overlays/overlays.css" />
<link rel="stylesheet" href="./stylingSheets/overlays/dynamicOverlays.css" />

<!-- Responsive Styles -->
<link rel="stylesheet" media="screen and (min-width: 768px) and (max-width: 1024px)" 
      href="./stylingSheets/responsive/tablet.css" />
<link rel="stylesheet" media="screen and (min-width: 1024px)" 
      href="./stylingSheets/responsive/desktop.css" />
```

## 🎨 Best Practices

### Adding New Styles
1. **Variables**: Add to `00-variables.css`
2. **Theme colors**: Add to `01-themes.css`
3. **Animations**: Add to `03-animations.css`
4. **Page-specific**: Add to appropriate `pages/*.css` file
5. **Component**: Add to appropriate `components/*.css` file

### Modifying Existing Styles
1. Check the file structure above to find the right file
2. Maintain the cascade order (don't move overriding styles before base styles)
3. Keep specificity low where possible
4. Use CSS variables for themeable properties

## 📝 Notes

- The numbered prefix (00-, 01-, 02-, 03-) indicates critical load order
- Files without numbers can be loaded in any order (but maintain logical grouping)
- Responsive stylesheets use media queries and are loaded last to override base styles
- The overlay directory contains all modal/dialog related styles
