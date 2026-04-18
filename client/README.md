# Client — AI Content Dashboard

React 19 + Vite 8 + Tailwind v4 frontend. See the [root README](../README.md) for the full project overview, live demo, and architecture.

## Scripts

```bash
npm install
npm run dev        # http://localhost:5173 (proxies /api to :5000)
npm run build      # production bundle into dist/
npm run preview    # serve dist/ locally
npm run lint
```

## Environment

Local dev needs no env vars — Vite proxies `/api` to `http://localhost:5000`. For production builds:

```
VITE_API_URL=https://your-backend.up.railway.app
```

See [`.env.example`](./.env.example).

## Structure

- [src/api/](src/api/) — Axios instance, auth header injection, 429 response interceptor
- [src/context/](src/context/) — `AuthContext`, `ThemeContext` (localStorage-persisted dark mode)
- [src/components/](src/components/) — `Sidebar`, `ProtectedRoute`, layout pieces
- [src/pages/](src/pages/) — `Dashboard`, `History`, `Login`, `Register`
- [public/_redirects](public/_redirects) — SPA fallback for Cloudflare Pages
