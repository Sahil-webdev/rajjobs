# RajJobs Backend (single backend for site + admin)

Quick start:

1. Copy `.env.example` to `.env` and set `MONGO_URI` and JWT secrets.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Seed admin user (optional):
   ```bash
   npm run seed
   ```
   Default credentials are shown when you run the seed script.
4. Start in dev mode:
   ```bash
   npm run dev
   ```

API endpoints (auth):
- POST /api/auth/login { email, password } -> { accessToken }
- POST /api/auth/refresh (cookie: refreshToken) -> { accessToken }
- POST /api/auth/logout -> clears refresh cookie
- GET /api/auth/me (Authorization: Bearer <accessToken>) -> admin info

Notes:
- Refresh token is stored as an httpOnly cookie and a hashed copy in DB for revocation/rotation.
- Admin-only routes should check role === 'admin' after `verifyAccessToken`.

If you want, I can now scaffold the admin UI (`admin/`) login page and a protected admin layout that calls `/api/auth/me`. Let me know and I'll continue.