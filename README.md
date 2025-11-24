# CodeJam Frontend

Next.js frontend for CodeJam - Real-time collaborative coding platform.

## Tech Stack

- Next.js 15.4.3
- React 19
- TypeScript
- Tailwind CSS

## Features

- ✅ Complete authentication (Email/Password + Google OAuth with PKCE)
- Real-time code editor (coming soon)
- Session management (coming soon)

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
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

## Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Project Structure

```
codejam-frontend/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── auth/         # Auth pages
│   │   └── ...
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth)
│   ├── lib/              # Utilities (API, PKCE)
│   └── types/            # TypeScript types
├── public/               # Static assets
└── package.json
```

## License

MIT

