# Server — AI Content Dashboard

Express 5 + Mongoose + Gemini 2.0 Flash backend. See the [root README](../README.md) for the full API reference, architecture diagram, and live demo.

## Scripts

```bash
npm install
npm run dev       # nodemon on http://localhost:5000
npm start         # node src/index.js (prod)
```

## Environment

Copy [`.env.example`](./.env.example) to `.env` and fill:

| Var | Purpose |
| --- | --- |
| `PORT` | Listen port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | Atlas / local Mongo connection string |
| `JWT_SECRET` | Long random string (`openssl rand -hex 32`) |
| `GEMINI_API_KEY` | From [ai.google.dev](https://ai.google.dev) |
| `CLIENT_URL` | Comma-separated allowed origins (no trailing slash) |

## Structure

- [src/index.js](src/index.js) — app entry: Helmet, CORS allowlist, `trust proxy`, rate limiters, routes, error handler
- [src/config/db.js](src/config/db.js) — Mongoose connection
- [src/middleware/](src/middleware/) — `auth.js` (JWT), `rateLimiter.js`, `errorHandler.js`
- [src/models/](src/models/) — `User` (bcrypt pre-save hook), `Analysis`
- [src/routes/](src/routes/) — `auth.js`, `analyze.js` (includes history, stats, PDF + Markdown export, delete)
- [src/services/gemini.js](src/services/gemini.js) — structured JSON prompt for Gemini 2.0 Flash
