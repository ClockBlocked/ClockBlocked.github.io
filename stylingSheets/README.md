# Stylesheet Organization

This directory contains all the stylesheets for the MyBeats application, organized for maintainability and clarity.

## 📁 File Structure

### Base Styles (Load Order Critical)
These files must be loaded in order as they build upon each other:

1. **base/variables.css** - CSS custom properties (variables)
   - Shadow definitions
   - Blur effects
   - Transitions and animations timing
   - Border radius values
   - Z-index layering
   - Spacing scale
   - Desktop layout variables

2. **base/themes.css** - Theme color definitions
   - Dark theme
   - Dim theme
   - Light theme
   - All theme-specific color variables

3. **base/reset.css** - Base resets and global styles
   - Box model reset
   - Scroll behavior
   - Body and HTML base styles
   - Page wrapper structure

4. **base/animations.css** - Keyframe animations
   - Toast animations
   - Fade effects
   - Image loading states
   - Navbar animations
   - All @keyframes definitions

5. **base/fonts.css** - Font definitions and @font-face rules

6. **base/svg.css** - SVG icon styles

7. **base/utilities.css** - Utility classes (formerly tailwind-conversion.css)
   - Width and height utilities
   - Flexbox utilities
   - Grid utilities
   - Spacing utilities
   - Display utilities

### Page Styles
- **pages/core.css** - Core page layout styles and main component styles
- **pages/home.css** - Home page specific styles (including bento grid)
- **pages/artist.css** - Artist page specific styles

### Component Styles
- **components/breadCrumbs.css** - Breadcrumb navigation
- **components/navbarPlayer.css** - Navigation bar, player controls, and button styles
- **components/playlists.css** - Playlist components
- **components/musicPlayer.css** - Music player overlay and controls

### Responsive Styles
- **responsive/mobile.css** - Mobile layout (<768px)
- **responsive/tablet.css** - Tablet layout (768px-1024px)
- **responsive/desktop.css** - Desktop responsive styles and layout (>1024px)

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
<!-- Base Styles - Load in order (critical) -->
<link rel="stylesheet" href="./stylingSheets/base/variables.css" />
<link rel="stylesheet" href="./stylingSheets/base/themes.css" />
<link rel="stylesheet" href="./stylingSheets/base/reset.css" />
<link rel="stylesheet" href="./stylingSheets/base/animations.css" />
<link rel="stylesheet" href="./stylingSheets/base/fonts.css" />
<link rel="stylesheet" href="./stylingSheets/base/svg.css" />
<link rel="stylesheet" href="./stylingSheets/base/utilities.css" />

<!-- Page Styles -->
<link rel="stylesheet" href="./stylingSheets/pages/core.css" />
<link rel="stylesheet" href="./stylingSheets/pages/home.css" />
<link rel="stylesheet" href="./stylingSheets/pages/artist.css" />

<!-- Component Styles -->
<link rel="stylesheet" href="./stylingSheets/components/breadCrumbs.css" />
<link rel="stylesheet" href="./stylingSheets/components/navbarPlayer.css" />
<link rel="stylesheet" href="./stylingSheets/components/playlists.css" />
<link rel="stylesheet" href="./stylingSheets/components/musicPlayer.css" />

<!-- Overlay Styles -->
<link rel="stylesheet" href="./stylingSheets/overlays/overlays.css" />
<link rel="stylesheet" href="./stylingSheets/overlays/dynamicOverlays.css" />

<!-- Responsive Styles -->
<link rel="stylesheet" media="screen and (max-width: 767px)" 
      href="./stylingSheets/responsive/mobile.css" />
<link rel="stylesheet" media="screen and (min-width: 768px) and (max-width: 1024px)" 
      href="./stylingSheets/responsive/tablet.css" />
<link rel="stylesheet" media="screen and (min-width: 1024px)" 
      href="./stylingSheets/responsive/desktop.css" />
```

## 🎨 Best Practices

### Adding New Styles
1. **Variables**: Add to `base/variables.css`
2. **Theme colors**: Add to `base/themes.css`
3. **Animations**: Add to `base/animations.css`
4. **Fonts**: Add to `base/fonts.css`
5. **Utilities**: Add to `base/utilities.css`
6. **Page-specific**: Add to appropriate `pages/*.css` file
7. **Component**: Add to appropriate `components/*.css` file
8. **Responsive**: Add to appropriate `responsive/*.css` file

### Modifying Existing Styles
1. Check the file structure above to find the right file
2. Maintain the cascade order (don't move overriding styles before base styles)
3. Keep specificity low where possible
4. Use CSS variables for themeable properties

## 📝 Notes

- All stylesheets are organized into folders (base/, pages/, components/, responsive/, overlays/)
- No CSS files at the root of stylingSheets/ directory
- Component styles like musicPlayer.css are separated for clarity
- Mobile, tablet, and desktop responsive styles are in `responsive/` folder
- Utility classes (formerly tailwind-conversion.css) are now in `base/utilities.css`
- Files are loaded in order: base → pages → components → overlays → responsive

