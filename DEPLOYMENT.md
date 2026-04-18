# Deployment Guide — AI Content Dashboard

Free-tier deployment on **Railway** (backend) + **Cloudflare Pages** (frontend).

---

## 1. Push the project to GitHub

### 1a. Isolate this folder from the laptop's global git identity

The laptop's global git config is set to a company identity
(`user.email = sagar@profitbooks.net`). Without overriding it, every commit in
this project would be authored as the company account — bad for a portfolio.

Fix it **per-folder only** (nothing global changes):

```bash
cd ai-content-dashboard
git init
git config user.name  "Your Personal Name"
git config user.email "your-personal-email@example.com"   # email on your personal GitHub
git config --get user.email   # verify it prints the personal email
```

`git config` without `--global` writes to `.git/config` inside this folder, so
all other repos on the laptop keep using the company identity.

### 1b. First commit

```bash
git add .
git commit -m "Initial commit"
```

Confirm `server/.env` is NOT in the commit (it is covered by `server/.gitignore`):

```bash
git ls-files | grep -E "\.env$"   # should print nothing
```

### 1c. Create the personal GitHub repo and push

1. On https://github.com (logged in as your **personal** account) →
   **New repository** → name it `ai-content-dashboard` → **Create** (empty, no
   README/gitignore).
2. Generate a **Personal Access Token (classic)** at
   https://github.com/settings/tokens → scope `repo` → copy it once (you will
   not see it again).
3. Add the remote with the token embedded in the URL so credentials stay
   scoped to this folder (stored in `.git/config`, not the laptop's global
   credential store):

   ```bash
   git remote add origin \
     https://<personal-username>:<personal-token>@github.com/<personal-username>/ai-content-dashboard.git
   git branch -M main
   git push -u origin main
   ```

> Why embed the token in the URL: it skips the credential-helper prompt and
> never touches any global credential cache. Deleting this folder erases the
> token. Do not share `.git/config` or commit it anywhere else.

### 1d. Verify the commit author on GitHub

Open the repo on GitHub → click the commit → confirm the author avatar is your
**personal** account, not the company one. If it shows the company account,
the local `user.email` was not applied before committing — run
`git commit --amend --reset-author` after fixing the config, then force-push.

---

## 2. Deploy the backend to Railway

1. Go to https://railway.app → **New Project → Deploy from GitHub repo** → pick the repo.
2. When prompted for a service root, set **Root Directory** = `server`.
3. Railway auto-detects Node from `package.json` and runs `npm start`.
4. In the service **Variables** tab add:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string (`openssl rand -hex 32`)
   - `GEMINI_API_KEY` = your Gemini key
   - `CLIENT_URL` = leave blank for now — you will add the Pages URL after step 3
5. Click **Deploy**. When it is green, open **Settings → Networking → Generate Domain** to get a public URL like `https://ai-dashboard-production.up.railway.app`.
6. Test the health endpoint: `https://<your-domain>/api/health` should return `{ "status": "ok" }`.

### MongoDB Atlas network access

In Atlas → **Network Access**, add `0.0.0.0/0` (allow from anywhere). Railway IPs are not static on the free tier.

---

## 3. Deploy the frontend to Cloudflare Pages

1. Go to https://pages.cloudflare.com → **Create a project → Connect to Git** → pick the repo.
2. Build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory (advanced):** `client`
3. **Environment variables** (Production + Preview):
   - `VITE_API_URL` = the Railway backend URL from step 2 (no trailing slash)
4. **Save and Deploy**. You will get a URL like `https://ai-content-dashboard.pages.dev`.

---

## 4. Wire the backend CORS to the frontend URL

Back in Railway → service → **Variables**:

- Set `CLIENT_URL` = `https://ai-content-dashboard.pages.dev`
  - To allow multiple origins (e.g. a custom domain) use a comma-separated list: `https://pages.dev-url,https://yourdomain.com`

Railway redeploys automatically on save.

---

## 5. Smoke test

Visit the Pages URL, register a new user, run an analysis, check history + PDF export. Open DevTools → Network and confirm requests go to the Railway domain and return 200.

---

## Troubleshooting

- **CORS error in the browser console** → `CLIENT_URL` on Railway does not match the Pages origin exactly (check for trailing slashes or `www` vs non-`www`).
- **`Network error`** → Railway service is sleeping or crashed. Check **Deployments → Logs**.
- **401 / token issues after redeploy** → `JWT_SECRET` changed; old tokens are invalid. Log out and back in.
- **Vite build fails on Pages with `vite: not found`** → Root directory on Pages is wrong; it must be `client`.
- **Rate limiter warns about `X-Forwarded-For`** → `app.set('trust proxy', 1)` is already set in `server/src/index.js`.
- **Commits show the company email as author** → the laptop's global git identity leaked in before the local override was set. Fix: from `ai-content-dashboard/` run `git config user.email "personal@example.com"` and `git config user.name "Your Personal Name"`, then `git commit --amend --reset-author --no-edit` and `git push --force-with-lease`.
- **`git push` asks for a password every time** → no credential helper installed (by design, to keep things isolated). Either accept the prompt or use the token-in-URL remote from step 1c.

---

## Free-tier limits to know

- **Railway free:** $5 of execution credit / month. The service sleeps when idle and cold-starts on the first request (~2–5s).
- **Cloudflare Pages free:** 500 builds/month, unlimited bandwidth and requests.
- **MongoDB Atlas M0:** 512 MB storage.

For a portfolio project this is plenty.
