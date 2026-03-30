# CodeJam Frontend

Next.js frontend for CodeJam - a real-time collaborative coding platform with an integrated code editor, authentication, and code execution playground.

## Tech Stack

- Next.js 15 (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS v4
- Monaco Editor (code editing)
- Framer Motion (animations)
- Zod + React Hook Form (validation)

## Features

### Authentication
- Email/password registration with password strength validation
- Email verification via 6-digit OTP
- Google OAuth 2.0 with PKCE (code challenge/verifier)
- Password reset flow
- JWT-based session management with auto-expiry detection
- Protected routes for authenticated pages

### Code Playground
- Monaco Editor with syntax highlighting for 7 languages
- **Supported Languages**: JavaScript, Python, Java, C++, C, Go, Rust
- Code execution via backend API with stdout/stderr output
- Input panel for stdin
- Execution metrics (time, memory, exit code)
- Editor settings (font size, tab size, minimap, word wrap, theme)
- Code persistence per language (localStorage)

### UI/UX
- Animated landing page with feature showcase
- Dark theme (navy/violet gradient)
- Responsive design (mobile, tablet, desktop)
- Navigation bar with user dropdown
- Loading states and error handling

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/v1/api/auth
NEXT_PUBLIC_OAUTH_CALLBACK_URL=http://localhost:3000/auth/callback
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout (AuthProvider)
│   ├── auth/
│   │   ├── login/              # Email/password login
│   │   ├── register/           # User registration
│   │   ├── verify-otp/         # OTP verification
│   │   ├── callback/           # OAuth callback handler
│   │   ├── forgot-password/    # Password recovery
│   │   ├── reset-password/     # Password reset
│   │   └── verify-reset-otp/   # Reset OTP verification
│   ├── dashboard/              # User dashboard (protected)
│   └── playground/             # Code editor (protected)
├── components/
│   ├── CodeEditor.tsx          # Monaco editor wrapper
│   ├── CodePlayground.tsx      # Full playground (editor + output)
│   ├── OutputPanel.tsx         # Execution results display
│   ├── ExecutionMetrics.tsx    # Code stats (lines, chars, cursor)
│   ├── NavBar.tsx              # Navigation with user menu
│   ├── ProtectedRoute.tsx      # Auth guard wrapper
│   └── ComingSoonFeatures.tsx  # Marketing section
├── contexts/
│   └── AuthContext.tsx         # Auth state management
├── services/
│   ├── auth.service.ts         # Auth API (login, register, OTP, OAuth)
│   └── playground.service.ts   # Code execution + persistence
├── lib/
│   ├── api-client.ts           # HTTP client with auth headers
│   ├── config.ts               # API endpoints, storage keys
│   ├── pkce.ts                 # PKCE implementation (S256)
│   └── language-templates.ts   # Language configs + default code
├── types/
│   ├── auth.ts                 # Auth types (User, AuthResponse)
│   ├── auth.types.ts           # Extended auth interfaces
│   └── playground.types.ts     # Playground types (languages, execution)
└── utils/
    └── platform.ts             # OS detection (cmd vs ctrl)
```

## Auth Flow

```
Register → Temp Token → Generate OTP → Verify OTP → Full Token
Login → Full Token (if verified) or Temp Token → OTP flow
Google OAuth → PKCE challenge → Callback → Code Exchange → Full Token
```

All tokens stored in localStorage. Protected routes redirect to login if no valid token.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## License

MIT
