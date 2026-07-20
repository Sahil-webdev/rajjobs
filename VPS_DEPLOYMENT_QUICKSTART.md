# VPS Deployment Quickstart

Use this when hosting all 3 apps on your own VPS.

## 1) Domain Plan

- Website: `https://yourdomain.com`
- Admin Panel: `https://admin.yourdomain.com`
- Backend API: `https://api.yourdomain.com`

## 2) Environment Values

Set these before build/start.

### `backend/.env.production`

```env
NODE_ENV=production
PORT=4000
MONGO_URI=your_mongodb_atlas_uri
JWT_ACCESS_SECRET=your_long_secret
JWT_REFRESH_SECRET=your_long_secret
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### `web-frontend/.env.production`

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### `admin-frontend/.env.production`

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

## 3) Build and Run with PM2

```bash
# backend
cd backend
npm install
pm2 start npm --name rajjobs-backend -- start

# web frontend
cd ../web-frontend
npm install
npm run build
pm2 start npm --name rajjobs-web -- start

# admin frontend
cd ../admin-frontend
npm install
npm run build
pm2 start npm --name rajjobs-admin -- start

pm2 save
pm2 status
```

## 4) Nginx Reverse Proxy

Map domains to local services:

- `yourdomain.com` -> `http://127.0.0.1:3000`
- `admin.yourdomain.com` -> `http://127.0.0.1:3001`
- `api.yourdomain.com` -> `http://127.0.0.1:4000`

Then enable SSL with Certbot for all 3 domains.

## 5) Health Checks

- `https://api.yourdomain.com/api/public/courses`
- `https://api.yourdomain.com/api/admin/setup/check`
- `https://yourdomain.com`
- `https://admin.yourdomain.com/login`
