# CodeJam Playground

A collaborative code playground component for CodeJam with Monaco Editor integration.

## Features Implemented

### Core Features
- ✅ Monaco Editor (VS Code's editor) with full IntelliSense
- ✅ Multi-language support: JavaScript, TypeScript, Python, Java, C++, C, Go, Rust
- ✅ Syntax highlighting and code completion
- ✅ Split-pane layout with resizable panels
- ✅ Real-time code execution (mock data for now)
- ✅ Beautiful output panel with stdout/stderr differentiation

### UI/UX Features
- ✅ Language selector dropdown with icons
- ✅ Run button with loading states
- ✅ Clear output button
- ✅ Status bar showing: language, cursor position, line count, character count
- ✅ Execution time display
- ✅ Success/Error badges
- ✅ Smooth animations with Framer Motion
- ✅ Loading skeleton on editor mount
- ✅ Responsive design (mobile/tablet/desktop)

### Developer Experience
- ✅ Auto-save to localStorage (persists between sessions)
- ✅ Keyboard shortcuts:
  - `Ctrl+Enter` / `Cmd+Enter`: Run code
  - `Ctrl+S` / `Cmd+S`: Manual save (auto-save already active)
- ✅ Language templates for quick start
- ✅ TypeScript with full type safety
- ✅ Clean component architecture

### Design Consistency
- ✅ Matches landing page design system
- ✅ Same color scheme (violet, pink, cyan gradients)
- ✅ Consistent typography and spacing
- ✅ Same animation patterns (Framer Motion)
- ✅ Backdrop blur and glassmorphism effects
- ✅ Custom scrollbar styling

## File Structure

```
src/
├── app/
│   └── playground/
│       └── page.tsx                 # Playground route
├── components/
│   ├── CodeEditor.tsx               # Monaco Editor wrapper
│   ├── CodePlayground.tsx           # Main playground component
│   └── OutputPanel.tsx              # Output display component
├── services/
│   └── playground.service.ts        # API service + localStorage
├── types/
│   └── playground.types.ts          # TypeScript types
└── lib/
    ├── language-templates.ts        # Language configs & templates
    └── config.ts                    # Updated with playground endpoints
```

## Usage

### Access the Playground

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/playground

3. Or click "Playground" in the navigation bar

### Features to Try

1. **Switch Languages**: Click the language dropdown to try different languages
2. **Write Code**: Start coding in the Monaco editor with full IntelliSense
3. **Run Code**: Press `Ctrl+Enter` or click "Run Code" button
4. **View Output**: See stdout, stderr, and errors in the output panel
5. **Clear Output**: Click the "Clear" button in the output panel
6. **Resize Panels**: Drag the gutter between editor and output to resize
7. **Auto-save**: Your code is automatically saved to localStorage

## Mock Execution (Temporary)

Currently, the playground uses **mock code execution** until the backend is implemented.

### To Enable Real Execution

1. Implement the backend endpoint: `POST /api/playground/execute`

2. Update `/src/services/playground.service.ts`:
   ```typescript
   // Comment out this line:
   return this.mockExecuteCode(request);

   // Uncomment the production code block
   ```

3. Backend should return:
   ```json
   {
     "success": true,
     "data": {
       "stdout": "Hello, World!",
       "stderr": "",
       "exitCode": 0,
       "executionTime": 250,
       "memory": 8.5
     }
   }
   ```

## Supported Languages

| Language   | Icon | Monaco Language | Extension |
|------------|------|-----------------|-----------|
| JavaScript | 🟨   | javascript      | .js       |
| TypeScript | 🔷   | typescript      | .ts       |
| Python     | 🐍   | python          | .py       |
| Java       | ☕   | java            | .java     |
| C++        | ⚙️   | cpp             | .cpp      |
| C          | ©️   | c               | .c        |
| Go         | 🔵   | go              | .go       |
| Rust       | 🦀   | rust            | .rs       |

## Technical Stack

- **Editor**: `@monaco-editor/react` v4.6.0
- **Split Panes**: `react-split` v2.0.14
- **Animations**: `framer-motion` v12.23.24
- **Icons**: `lucide-react` v0.544.0
- **Styling**: Tailwind CSS v4
- **Framework**: Next.js 15.5.6 with React 19.1.0

## Editor Settings

Default settings (customizable in future):
- Font size: 14px
- Tab size: 2 spaces
- Minimap: Enabled
- Line numbers: On
- Word wrap: Off
- Theme: VS Dark (matches dark design)

## Future Enhancements

### Phase 1 (Current)
- [x] Basic playground with single file
- [x] Mock execution
- [x] Auto-save to localStorage

### Phase 2 (Next)
- [ ] Real backend integration
- [ ] Settings panel to customize editor
- [ ] Download code functionality
- [ ] Share code with unique URLs
- [ ] Input panel for stdin

### Phase 3 (Future)
- [ ] Collaborative editing (real-time)
- [ ] Multiple file support
- [ ] File tree navigation
- [ ] Code templates library
- [ ] Execution history
- [ ] Dark/Light theme toggle
- [ ] Font size controls
- [ ] Code formatting (Prettier)
- [ ] Linting support

## Backend Implementation Guide

When implementing the backend, consider these approaches:

### Option 1: Judge0 API (Recommended)
```java
// Easy integration with existing service
// Supports 60+ languages
// Self-hosted with Docker
```

### Option 2: Docker Containers
```java
// Spin up isolated containers per execution
// More control but more complex
```

### Option 3: AWS Lambda
```java
// Serverless code execution
// Auto-scaling
```

## Color Scheme

Matches landing page:
- Primary: `#8b5cf6` (violet-500)
- Secondary: `#ec4899` (pink-600)
- Accent: `#06b6d4` (cyan-400)
- Background: `#0a0a0f` (dark navy-black)
- Editor BG: `#1e1e1e` (Monaco default dark)
- Success: `#10b981` (green-500)
- Error: `#ef4444` (red-500)

## Performance

- Monaco Editor lazy loads automatically
- Code is debounced for auto-save (1 second)
- Split panes are optimized for smooth resizing
- Framer Motion animations use GPU acceleration
- Minimal re-renders with proper React optimization

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive layout (vertical stack)

## Troubleshooting

### Monaco Editor not loading?
- Check network tab for CDN errors
- Clear browser cache
- Verify `@monaco-editor/react` is installed

### Code not persisting?
- Check browser's localStorage
- Look for console errors
- Verify STORAGE_KEYS in config.ts

### Split pane not working?
- Ensure `react-split` is installed
- Check for CSS conflicts
- Verify gutter styling in globals.css

## Contributing

When adding new features:
1. Match the existing design system
2. Add TypeScript types
3. Update this README
4. Test on mobile/tablet/desktop
5. Ensure animations are smooth

## License

Part of CodeJam platform - Internal use only
