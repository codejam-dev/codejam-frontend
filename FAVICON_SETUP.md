# Favicon Setup

All favicons have been successfully generated for CodeJam!

## Generated Files

### In `/public` directory:

1. **favicon.ico** (5.3K) - Multi-size ICO file for legacy browsers
   - Contains 16x16 and 32x32 PNG images

2. **icon.svg** (837B) - Scalable vector icon for modern browsers
   - Blue-to-purple gradient background
   - Code brackets with letter "J"

3. **favicon-16x16.png** (584B) - Small favicon
4. **favicon-32x32.png** (1.1K) - Standard favicon
5. **apple-touch-icon.png** (5.7K) - iOS home screen icon (180x180)
6. **android-chrome-192x192.png** (6.3K) - Android icon
7. **android-chrome-512x512.png** (22K) - High-res Android icon
8. **site.webmanifest** (465B) - PWA manifest file

## Browser Support

These favicons support:

- **All modern browsers**: Chrome, Firefox, Safari, Edge (via SVG)
- **Legacy browsers**: IE, older Chrome/Firefox versions (via .ico)
- **iOS devices**: Safari, home screen icons (via apple-touch-icon)
- **Android devices**: Chrome, PWA icons (via android-chrome-* and manifest)
- **PWA installations**: Full Progressive Web App support

## Metadata Configuration

The Next.js metadata has been updated in [src/app/layout.tsx](src/app/layout.tsx) to include:

```typescript
icons: {
  icon: [
    { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { url: '/icon.svg', type: 'image/svg+xml' },
  ],
  apple: [
    { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
},
manifest: '/site.webmanifest',
```

## How to Test

1. **Development**: Run `npm run dev` and check the browser tab
2. **Browser tab**: Look for the CodeJam icon in your browser tabs
3. **Bookmarks**: Bookmark the page to see the favicon
4. **iOS**: Add to home screen to see the Apple touch icon
5. **Android**: Install as PWA to see the Android icons

## Design Details

The favicon features:
- Gradient from blue (#3b82f6) to purple (#8b5cf6)
- Code brackets (< >) on both sides
- Letter "J" for CodeJam in the center
- Clean, modern design that scales well

## Regenerating Favicons

If you need to modify the design:

1. Edit [/public/icon.svg](public/icon.svg)
2. Install dependencies: `npm install --save-dev sharp png-to-ico`
3. Run the generation script (create a new one based on the original setup)

All favicon files are automatically served from the `/public` directory by Next.js.
