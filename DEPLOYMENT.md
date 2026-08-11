# TeamNest OS — Production Deployment Guide

This guide provides comprehensive instructions for deploying **TeamNest Workforce OS** to production platforms like **Render**, **Vercel**, **Netlify**, **Supabase**, or **Neon PostgreSQL**.

---

## 1. Database Setup (PostgreSQL)

TeamNest uses **Prisma ORM**. To switch from local SQLite to production PostgreSQL:

### Option A: Supabase (Free Managed PostgreSQL)
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings -> Database**, copy the **Transaction Connection String** (URI).
3. Paste the URL into your production `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

### Option B: Render Managed PostgreSQL
1. Create a Managed PostgreSQL Database on [render.com](https://render.com).
2. Copy the `Internal Connection String` or `External Connection String`.

### Update Prisma Schema Provider (for PostgreSQL deployment)
In `server/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run database migration & push:
```bash
npm --prefix server run db:push
npm --prefix server run db:seed
```

---

## 2. Backend REST API Deployment (Render / Railway / Heroku)

### Option A: Deploying on Render (via Blueprint `render.yaml`)
1. Push your repository to GitHub / GitLab.
2. In [render.com](https://dashboard.render.com), click **New + -> Blueprint**.
3. Connect your repository. Render will automatically detect `render.yaml` and provision:
   - Managed PostgreSQL database
   - Node.js Express Web Service
4. Click **Apply**.

### Option B: Manual Web Service Deployment on Render / Railway
1. **Build Command**: `npm --prefix server install && npm --prefix server run db:push && npm --prefix server run build`
2. **Start Command**: `npm --prefix server start`
3. Set Environment Variables:
   - `DATABASE_URL`: `postgresql://...`
   - `JWT_SECRET`: `[random-secure-secret-key]`
   - `STORAGE_BUCKET_URL`: `https://[your-bucket].s3.amazonaws.com`
   - `PORT`: `5000`
   - `NODE_ENV`: `production`

---

## 3. Frontend Deployment (Vercel / Netlify)

### Option A: Vercel One-Click Deployment
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. Configure settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://teamnest-api.onrender.com/api` (URL of your deployed backend)
5. Click **Deploy**.

### Option B: Netlify Deployment
1. Create a new site from Git on [netlify.com](https://netlify.com).
2. Set **Base directory** to `client`, **Build command** to `npm run build`, and **Publish directory** to `dist`.
3. Add `VITE_API_BASE_URL` environment variable.

---

## 4. Verification Checklist

- [x] Production build passes cleanly: `npm run build:server; npm run build:client`
- [x] Database seeded: `npm --prefix server run db:seed`
- [x] CORS allowed for production frontend URL in `server/src/index.ts`
- [x] `localStorage` offline check-in queue active for mobile resilience
- [x] Payroll export CSV downloader ready on `/admin`
