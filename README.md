# TASKORA

TASKORA is a task-management application built with React, Vite, Express, MongoDB, and JWT authentication. User accounts have private task lists, with dashboard statistics, task filtering, a calendar, analytics, profile settings, and a persistent light/dark theme.

## Requirements

- Node.js 20 or later
- npm
- A MongoDB Atlas cluster (or a local MongoDB instance)

## Run locally

1. Configure the backend environment:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Set `MONGO_URI` to your existing MongoDB connection string and `JWT_SECRET` to a private, randomly generated secret. Keep this file private and never commit it.

2. Install and start the backend:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   The API starts on port `5000` after it connects to MongoDB. Check `http://localhost:5000/api/health`.

3. In a second terminal, configure and start the frontend:

   ```powershell
   Copy-Item frontend\.env.example frontend\.env
   cd frontend
   npm install
   npm run dev
   ```

   Open the Vite URL (usually `http://localhost:5173`). `VITE_API_URL` should point to the backend API base URL, normally `http://localhost:5000/api`.

## Environment variables

### Backend

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `5000`. |
| `MONGO_URI` | Existing MongoDB connection URI. |
| `JWT_SECRET` | Private signing secret for authentication tokens. |
| `CLIENT_URL` | Allowed frontend origin; comma-separated origins are supported. |

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend API base URL, including `/api`. |

Never put credentials in frontend environment variables. Any `VITE_` variable is included in the browser bundle.

The current authentication flow keeps JWTs in `localStorage`. For higher-risk production deployments, consider moving tokens to secure, HttpOnly, SameSite cookies and adding the corresponding CSRF protections.

## Features and API

- Register and sign in; passwords are hashed with bcryptjs and API routes use bearer JWTs.
- Create, edit, delete, complete, filter, search, and sort tasks.
- Task reads and mutations are scoped to the authenticated user.
- Dashboard statistics, weekly activity, and analytics use that user's stored tasks.
- Calendar, profile and password settings, and persisted light/dark mode.

API endpoints (prefix `/api`):

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `PUT /auth/profile`, `PUT /auth/password`
- `GET/POST /tasks`, `GET/PUT/DELETE /tasks/:id`, `PATCH /tasks/:id/status`
- `GET /dashboard/stats`, `GET /health`

## Build and start checks

Run these from their respective directories:

```powershell
# backend
npm install
npm start

# frontend
npm install
npm run build
```

The backend requires a reachable MongoDB instance and valid environment variables to start. The frontend build does not require the backend to be running.

## Deploy

### Render (backend)

1. Create a Render Blueprint from this repository. Render reads `render.yaml` to configure the service root, build/start commands, and health check.
2. Provide your existing `MONGO_URI` and the deployed Vercel origin as `CLIENT_URL` when prompted. Render generates `JWT_SECRET` and provides `PORT`.
3. Deploy and confirm that `https://your-render-service.onrender.com/api/health` responds with status `ok`.

To configure a Web Service manually instead, use **Root Directory** `backend`, **Build Command** `npm install`, **Start Command** `npm start`, and set the same environment variables.

### Vercel (frontend)

1. Import the repository and set the **Root Directory** to `frontend`.
2. Set the **Build Command** to `npm run build` and **Output Directory** to `dist`.
3. Add `VITE_API_URL` with the Render API base URL, for example `https://your-render-service.onrender.com/api`.
4. Deploy. `frontend/vercel.json` sends client-side routes back to the SPA entry point.

If either service's URL changes, update the corresponding environment variable and redeploy. Add the final Vercel origin to Render's `CLIENT_URL` (multiple origins may be comma-separated).

## Push to GitHub

From the project root, after creating an empty GitHub repository and confirming no `.env` file is staged:

```powershell
git init
git add .
git status --short
git commit -m "Prepare TASKORA for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your repository URL. Do not push local `.env` files, MongoDB credentials, or JWT secrets.
