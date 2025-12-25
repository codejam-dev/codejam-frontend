# CodeJam Playground Design System

## Overview
Premium code execution UI inspired by Replit, CodeSandbox, StackBlitz, and HackerRank Playgrounds. Modern, clean, and developer-focused design with enhanced UX patterns.

---

## Color Palette

### Primary Colors
```css
/* Violet - Primary Actions */
--violet-50: #f5f3ff;
--violet-100: #ede9fe;
--violet-400: #a78bfa;
--violet-500: #8b5cf6;
--violet-600: #7c3aed;
--violet-700: #6d28d9;

/* Pink - Accents */
--pink-400: #f472b6;
--pink-500: #ec4899;
--pink-600: #db2777;

/* Cyan - Secondary Actions */
--cyan-400: #22d3ee;
--cyan-500: #06b6d4;
```

### Status Colors
```css
/* Success */
--green-400: #4ade80;
--green-500: #22c55e;
--green-500/10: rgba(34, 197, 94, 0.1);
--green-500/20: rgba(34, 197, 94, 0.2);

/* Error */
--red-400: #f87171;
--red-500: #ef4444;
--red-500/10: rgba(239, 68, 68, 0.1);
--red-500/20: rgba(239, 68, 68, 0.2);

/* Warning */
--yellow-400: #facc15;
--orange-400: #fb923c;
```

### Neutral Colors
```css
/* Backgrounds */
--bg-primary: #0a0a0f;
--bg-secondary: #1e1e1e;
--bg-tertiary: #0d1117;
--bg-panel: #1e1e1e;
--bg-header: rgba(17, 24, 39, 0.95);
--bg-overlay: rgba(0, 0, 0, 0.6);

/* Borders */
--border-primary: rgba(55, 65, 81, 0.5);
--border-secondary: rgba(75, 85, 99, 0.3);
--border-accent: rgba(139, 92, 246, 0.3);

/* Text */
--text-primary: #ffffff;
--text-secondary: #d1d5db;
--text-tertiary: #9ca3af;
--text-muted: #6b7280;
```

### Tailwind Classes
```css
/* Backgrounds */
bg-[#0a0a0f]        /* Primary background */
bg-[#1e1e1e]        /* Editor background */
bg-[#0d1117]        /* Terminal background */
bg-gray-900/95       /* Header background with opacity */
bg-gray-800/40      /* Panel backgrounds */

/* Borders */
border-gray-700/30   /* Subtle borders */
border-gray-800/50   /* Panel borders */
border-violet-500/30 /* Accent borders */

/* Text */
text-gray-300        /* Primary text */
text-gray-400        /* Secondary text */
text-gray-500        /* Muted text */
```

---

## Typography

### Font Families
```css
/* Monospace (Code Editor) */
font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;

/* Sans-serif (UI) */
font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
```

### Font Sizes
```css
/* Headers */
text-xs:   0.75rem;   /* 12px - Labels, badges */
text-sm:   0.875rem;  /* 14px - Body text, buttons */
text-base: 1rem;      /* 16px - Default */
text-lg:   1.125rem;  /* 18px - Section headers */
text-xl:   1.25rem;   /* 20px - Large headers */
text-2xl:  1.5rem;    /* 24px - Display text */

/* Editor */
fontSize: 14px
lineHeight: 22px
```

### Font Weights
```css
font-normal:  400
font-medium:  500
font-semibold: 600
font-bold:    700
```

---

## Spacing System

### Padding & Margins
```css
/* Small */
p-2:   0.5rem;   /* 8px */
p-3:   0.75rem;  /* 12px */
p-4:   1rem;      /* 16px */

/* Medium */
p-5:   1.25rem;  /* 20px */
p-6:   1.5rem;   /* 24px */

/* Large */
p-8:   2rem;     /* 32px */
```

### Gaps
```css
gap-1:  0.25rem;  /* 4px */
gap-2:  0.5rem;   /* 8px */
gap-3:  0.75rem;  /* 12px */
gap-4:  1rem;     /* 16px */
gap-6:  1.5rem;   /* 24px */
```

---

## Component Specifications

### Header Toolbar
```css
height: 56px (py-3.5)
background: gradient from-gray-900/95 via-gray-800/95 to-gray-900/95
border: bottom 1px solid gray-700/50
backdrop-blur: xl
shadow: 2xl shadow-black/20
padding: px-6 py-3.5
```

### Language Selector
```css
padding: px-4 py-2.5
background: bg-gray-800/60
border: border-gray-600/50
border-radius: rounded-xl
hover: border-violet-500/50, shadow-lg shadow-violet-500/10
transition: duration-200
```

### Run Button
```css
padding: px-6 py-3
background: gradient from-violet-600 via-violet-500 to-blue-600
border-radius: rounded-xl
font-weight: semibold
shadow: xl shadow-violet-500/30
hover: scale 1.02
active: scale 0.98
```

### Editor Panel Header
```css
height: 40px
background: bg-gray-800/40
border: bottom 1px solid gray-700/30
padding: px-4 py-2.5
backdrop-blur: sm
```

### Output Panel Tabs
```css
padding: px-4 py-2
active: bg-[#0d1117], border-t border-x border-gray-800/50
inactive: text-gray-500 hover:text-gray-300
border-radius: rounded-t-lg (top corners only)
transition: duration-200
```

### Status Bar
```css
height: 40px
background: gradient from-gray-900/95 via-gray-800/95 to-gray-900/95
border: top 1px solid gray-700/50
padding: px-6 py-2.5
backdrop-blur: xl
```

---

## Border Radius

```css
rounded:     0.25rem;  /* 4px - Small elements */
rounded-lg:  0.5rem;   /* 8px - Buttons, cards */
rounded-xl:  0.75rem;  /* 12px - Panels, large buttons */
rounded-2xl: 1rem;     /* 16px - Dropdowns, modals */
```

---

## Shadows

```css
/* Subtle */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
shadow:    0 1px 3px rgba(0, 0, 0, 0.1)

/* Medium */
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1)

/* Large */
shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25)

/* Colored Glows */
shadow-violet-500/10: 0 0 20px rgba(139, 92, 246, 0.1)
shadow-violet-500/30: 0 0 30px rgba(139, 92, 246, 0.3)
shadow-green-500/20:  0 0 20px rgba(34, 197, 94, 0.2)
```

---

## Animations

### Transitions
```css
/* Standard */
transition-all duration-200
transition-colors duration-200

/* Smooth */
transition-all duration-300
```

### Framer Motion
```javascript
// Hover
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// Fade In
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}

// Slide
initial={{ x: -20, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}

// Rotate
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
```

---

## Icons

### Sizes
```css
w-3.5 h-3.5: 14px  /* Small icons */
w-4 h-4:     16px  /* Default icons */
w-4.5 h-4.5: 18px  /* Medium icons */
w-5 h-5:     20px  /* Large icons */
w-6 h-6:     24px  /* Extra large */
```

### Icon Colors
```css
text-violet-400  /* Primary actions */
text-pink-400    /* Accents */
text-cyan-400    /* Secondary actions */
text-green-400   /* Success */
text-red-400     /* Errors */
text-gray-400    /* Neutral */
```

---

## Component States

### Buttons
```css
/* Default */
bg-gray-800/60
border-gray-600/50
text-gray-300

/* Hover */
hover:bg-gray-700/60
hover:border-violet-500/50
hover:text-white

/* Active */
active:scale-0.95

/* Disabled */
disabled:bg-gray-600
disabled:cursor-not-allowed
disabled:opacity-50
```

### Tabs
```css
/* Inactive */
text-gray-500
hover:text-gray-300

/* Active */
text-violet-400 (or appropriate color)
bg-[#0d1117]
border-t border-x border-gray-800/50
```

### Status Badges
```css
/* Success */
bg-green-500/10
border-green-500/30
text-green-400

/* Error */
bg-red-500/10
border-red-500/30
text-red-400
```

---

## Layout Specifications

### Two-Pane Split
```css
/* Default Split */
sizes: [60, 40]  /* 60% editor, 40% output */
minSize: [300, 300]
gutterSize: 8px
```

### Editor Padding
```css
padding: {
  top: 20px,
  bottom: 20px,
  left: 16px,
  right: 16px
}
```

### Output Panel
```css
background: #0d1117
border-left: 1px solid gray-800/50
padding: px-4 py-3 (header)
padding: px-4 pb-4 (content)
```

---

## Special Effects

### Glass Morphism
```css
backdrop-blur-sm
backdrop-blur-xl
bg-gray-800/40
bg-gray-900/95
```

### Glow Effects
```css
/* Border Glow */
border-violet-500/20
hover:border-violet-500/50

/* Shadow Glow */
shadow-lg shadow-violet-500/10
shadow-xl shadow-violet-500/30

/* Blur Glow */
blur-2xl bg-violet-500/30
```

### Gradient Backgrounds
```css
/* Buttons */
bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600

/* Panels */
bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900

/* Status */
bg-gradient-to-r from-green-500/20 to-emerald-500/20
```

---

## Accessibility

### Focus States
```css
focus:outline-none
focus:ring-2
focus:ring-violet-500/50
focus:border-violet-500/50
```

### Keyboard Navigation
- Tab order: Language → Run → Actions
- Enter/Space: Activate buttons
- Ctrl/Cmd + Enter: Run code
- Escape: Close dropdowns

---

## Responsive Breakpoints

```css
/* Mobile */
< 640px: Stack vertically, smaller fonts

/* Tablet */
640px - 1024px: Adjusted spacing

/* Desktop */
> 1024px: Full layout
```

---

## Best Practices

1. **Consistency**: Use design tokens consistently across components
2. **Contrast**: Maintain WCAG AA contrast ratios (4.5:1 for text)
3. **Spacing**: Use the spacing system (4px base unit)
4. **Shadows**: Layer shadows for depth (subtle → medium → large)
5. **Animations**: Keep animations under 300ms for responsiveness
6. **Colors**: Use opacity variants for backgrounds (e.g., /10, /20, /30)
7. **Borders**: Use subtle borders (30-50% opacity) for definition

---

## Implementation Notes

- All colors use Tailwind's opacity modifiers (e.g., `/50`, `/30`)
- Backdrop blur requires `backdrop-blur-*` utilities
- Gradients use `bg-gradient-to-*` utilities
- Shadows use both standard and colored variants
- Animations use Framer Motion for smooth transitions
- Icons from Lucide React (consistent sizing and styling)

---

## Example Usage

```tsx
// Button
<button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl font-semibold shadow-xl shadow-violet-500/30 hover:scale-105 transition-all duration-200">
  Run Code
</button>

// Panel
<div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm">
  Content
</div>

// Tab
<button className="px-4 py-2 text-sm font-medium text-violet-400 bg-[#0d1117] border-t border-x border-gray-800/50 rounded-t-lg">
  STDOUT
</button>
```



