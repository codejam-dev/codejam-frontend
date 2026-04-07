# CodeJam Frontend

Next.js app for **CodeJam**: auth, Monaco code playground, and execution against the **CodeJam backend** (modular monolith on port **8080** by default).

## Tech stack

- **Next.js 15** (App Router)
- **React 19**, **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Monaco Editor** (editing)
- **Zod** + **React Hook Form** (forms)
- **Framer Motion** (landing / motion)

## Features

### Authentication

- Email/password registration (with strength validation)
- Email verification via 6-digit OTP
- **Google OAuth 2.0** with **PKCE** (S256)
- Password reset flow
- **Access JWT** stored in `localStorage`; **refresh token** in **HttpOnly** cookie (path `/v1/api/auth`)
- **Device ID** persisted per browser (`codejam_device_id`) for session binding
- Silent **token refresh** via `api-client` + `POST .../auth/refresh` with credentials
- Protected routes (`ProtectedRoute`, `AuthContext`)

### Code playground

- Monaco with syntax highlighting for supported languages
- Run code via **`POST /v1/api/execution/run`**; history via **`/v1/api/execution/history`**
- stdin panel, stdout/stderr, execution metrics
- Editor settings (font, tabs, minimap, wrap, theme)
- Per-language snippet persistence (`localStorage`)

### UI

- Dark-first landing and app chrome
- Responsive layout
- Nav bar with user menu

## Prerequisites

- **Node.js 20+** (LTS recommended)
- npm (or pnpm/yarn if you adapt commands)

## Setup

```bash
npm install
```

### Environment

Create **`.env.local`** in this directory (Next.js loads it automatically):

```env
# Single backend origin (modular monolith — no separate gateway service)
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/v1/api/auth
NEXT_PUBLIC_OAUTH_CALLBACK_URL=http://localhost:3000/auth/callback
```

Production: set these to your deployed API URL (same host for gateway + auth paths).

Canonical definitions live in [`src/lib/config.ts`](src/lib/config.ts).

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

## Project structure (overview)

```
src/
├── app/                 # App Router routes (landing, auth/*, playground, dashboard)
├── components/          # UI (CodeEditor, CodePlayground, NavBar, …)
├── contexts/            # AuthContext
├── services/            # auth.service.ts, playground.service.ts
├── lib/                 # api-client.ts, config.ts, pkce.ts, …
├── types/               # auth + playground types
└── utils/
```

## Auth flow (current)

```
Register → temp access JWT → generate OTP → verify OTP (+ deviceId) → access + refresh cookie
Login (+ deviceId) → access JWT (+ refresh cookie if verified) or temp JWT if email unverified
Google OAuth → PKCE → callback → oauth/exchange (+ deviceId) → access + refresh cookie
```

Refresh: **cookie** sent with `credentials: 'include'` to **`/v1/api/auth/refresh`**; new **access** token returned in JSON.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |

## Related

- Backend API & compose: [../codejam-backend/README.md](../codejam-backend/README.md)
- Monorepo overview: [../README.md](../README.md)

## License

MIT
