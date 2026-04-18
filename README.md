# AI Content Dashboard

Full-stack MERN application that uses Google Gemini to summarize any text and extract sentiment, tone, and key topics. Authenticated users can save analyses, search their history, and export results as PDF or Markdown.

**Live demo:** [ai-content-dashboard-6dh.pages.dev](https://ai-content-dashboard-6dh.pages.dev)
**API:** [ai-content-dashboard-production.up.railway.app/api/health](https://ai-content-dashboard-production.up.railway.app/api/health)

> Free-tier note: the Railway backend sleeps when idle and cold-starts in ~2–5s on the first request.

---

## Features

- **AI analysis** — Gemini 2.0 Flash returns structured JSON: summary, sentiment, key topics, and tone.
- **Authentication** — email/password with bcrypt hashing, JWT (7-day), protected routes on both client and server.
- **History** — every analysis is saved to MongoDB; paginated listing, full-text search, expand, and delete.
- **Export** — one-click PDF (PDFKit) or Markdown download of any analysis.
- **Dark mode** — theme persists to `localStorage`, every page styled for both modes.
- **Responsive** — hamburger sidebar on mobile, adaptive layouts down to 360px.
- **Hardened** — Helmet, CORS allowlist, per-route rate limiting (auth / analyze / general), global error handler, input validation, 429 toast via axios interceptor.

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind v4, React Router 7, Axios |
| Backend | Node 18+, Express 5, Mongoose 9, JWT, bcrypt, PDFKit |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Database | MongoDB Atlas (M0 free tier) |
| Hosting | Cloudflare Pages (frontend) + Railway (backend) |
| Security | Helmet, CORS allowlist, `express-rate-limit` |

## Architecture

```
┌─────────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│ Cloudflare Pages    │  HTTPS │ Railway (Express)    │        │ MongoDB Atlas   │
│ React + Vite SPA    │ ─────▶ │ /api/auth            │ ─────▶ │ users           │
│                     │        │ /api/analyze         │        │ analyses        │
└─────────────────────┘        │ /api/analyze/history │        └─────────────────┘
                               │ /api/analyze/:id/... │                ▲
                               └──────────┬───────────┘                │
                                          │                            │
                                          ▼                            │
                                ┌──────────────────────┐               │
                                │ Google Gemini API    │───────────────┘
                                │ (2.0 Flash)          │
                                └──────────────────────┘
```

## Local setup

### Prerequisites

- Node 18+
- A MongoDB connection string (local or Atlas M0)
- A Gemini API key from [ai.google.dev](https://ai.google.dev)

### 1. Clone

```bash
git clone https://github.com/onkar2116/ai-content-dashboard.git
cd ai-content-dashboard
```

### 2. Backend

```bash
cd server
cp .env.example .env     # fill MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run dev              # http://localhost:5000
```

### 3. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so no frontend env var is needed locally.

## API reference

All `/api/analyze/*` routes require `Authorization: Bearer <jwt>`.

| Method | Path | Body / Query | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }` | Create account, returns `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | Log in, returns `{ token, user }` |
| GET | `/api/auth/me` | — | Current user from token |
| POST | `/api/analyze` | `{ text }` (20–50,000 chars) | Analyze text, save result |
| GET | `/api/analyze/stats` | — | `{ totalAnalyses, lastAnalysis }` |
| GET | `/api/analyze/history` | `?page=&limit=&search=` | Paginated history (search hits `inputText`) |
| GET | `/api/analyze/:id/export/pdf` | — | Download analysis as PDF |
| GET | `/api/analyze/:id/export/markdown` | — | Download analysis as Markdown |
| DELETE | `/api/analyze/:id` | — | Delete an analysis |
| GET | `/api/health` | — | Liveness probe |

### Rate limits

| Scope | Window | Max requests |
| --- | --- | --- |
| Auth | 15 min | 10 |
| Analyze | 15 min | 30 |
| General | 15 min | 200 |

Exceeded calls return `429` with a retry message; the frontend surfaces this as a toast via an Axios response interceptor.

## Project structure

```
ai-content-dashboard/
├── client/                    # React SPA
│   ├── public/_redirects      # SPA fallback for Cloudflare Pages
│   └── src/
│       ├── api/               # axios instance + interceptors
│       ├── components/        # Sidebar, ProtectedRoute, etc.
│       ├── context/           # AuthContext, ThemeContext
│       ├── pages/             # Dashboard, History, Login, Register
│       └── lib/
├── server/                    # Express API
│   ├── railway.json
│   └── src/
│       ├── config/db.js
│       ├── controllers/
│       ├── middleware/        # auth, rateLimiter, errorHandler
│       ├── models/            # User, Analysis
│       ├── routes/            # auth, analyze
│       └── services/gemini.js
```

## Roadmap

- [ ] Multi-language support (detect & summarize non-English input)
- [ ] Team workspaces (share analyses via link)
- [ ] Browser extension (right-click → analyze)
- [ ] Bulk import (paste multiple documents, batch analyze)

## License

MIT
