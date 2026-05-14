# Rensing Ag Services — Deploy Guide

This is a fullstack app (Node/Express + React + SQLite). It will NOT run on Netlify static hosting. The instructions below are for Render, which has a free tier that supports Node + a persistent disk for the database.

## Option A — Render (recommended, free)

1. Create a free GitHub repo and push this folder, OR upload the zip to a new repo via the GitHub web UI.
2. Sign in at https://render.com (free, no credit card needed for the free plan).
3. Click **New +** → **Blueprint**.
4. Connect your repo. Render will detect `render.yaml` and create the web service with a 1 GB persistent disk mounted at `/var/data`.
5. Click **Apply**. First build takes ~3–5 minutes.
6. Once live, point `rensingag.com` at the Render URL via your domain registrar (Render → Settings → Custom Domain gives the exact CNAME/A record).

The customer request form, employee dashboard, and database all work out of the box. The database file lives on the persistent disk so it survives redeploys.

### Employee PIN
`7140` — change it in `client/src/components/EmployeeGate.tsx` (constant `EMPLOYEE_PIN`).

## Option B — Railway

1. Sign in at https://railway.app and create a new project from this repo.
2. Add a Volume and mount it at `/var/data`.
3. Set env vars: `NODE_ENV=production`, `DATABASE_PATH=/var/data/data.db`.
4. Railway auto-detects `npm start`. Deploy.

## Option C — Local / VPS

```bash
npm ci
npm run build
NODE_ENV=production PORT=5000 npm start
```

## Notes about Netlify

Netlify only hosts static files. To use Netlify you'd need to either:
- Split the app: deploy the public marketing pages to Netlify, host the backend (request form + employee area) elsewhere, OR
- Rebuild the request form as a Netlify Form (emails submissions, no database/employee dashboard).

If you want either of those let me know.
