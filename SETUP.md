# Crymad Cash — Setup Guide

## 1. Railway Postgres

1. Go to Railway → **New Project** → **Provision PostgreSQL**.
2. Open the Postgres service → **Connect** → copy the **Postgres Connection URL**.
3. You'll also need to enable the `citext` extension (see SQL below — it's in the schema).

## 2. Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
# TygaBank sandbox (already filled)
TYGABANK_API_KEY=0f8dd326-802e-43ea-8576-d00e9fc1f0b0
TYGABANK_API_SECRET=3c68de7dc424b7abedd194cb6f692cda748f163efd77475c2d71cd7f763aa356

# Railway Postgres URL (from step 1)
DATABASE_URL=postgresql://...

# Session secret — generate a fresh one:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=<paste-generated-64-char-hex>
```

## 3. Run the database schema

From your local machine, connect to Railway Postgres and run the schema:

```bash
psql "$DATABASE_URL" -f src/lib/db/schema.sql
```

If you don't have `psql` locally, you can paste the SQL from
`src/lib/db/schema.sql` into Railway's query editor.

## 4. Start dev server

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

## 5. First login

Register a new account at `/register` — the flow is:
1. Enter name + email + password, click Sign Up.
2. You'll be redirected to `/register/verify-email`.
3. In **dev mode** the 6-digit OTP is printed to the server console AND shown inline on the page.
4. Enter the code → you're logged in.

In production, you'll replace the dev-code display with an actual email send.

## 6. Deploy to Railway

1. Push to GitHub.
2. Railway → **New Project** → **Deploy from GitHub**.
3. Add the same env vars to the Railway project.
4. Railway auto-detects Next.js and deploys.
