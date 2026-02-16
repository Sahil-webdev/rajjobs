# Environment Variables Setup Guide

## Overview
This project uses different environment configurations for **local development** and **production deployment**.

---

## 📁 File Structure

### Web Frontend (web-frontend/)
- **`.env.local`** - Local development (localhost:4000) - ⚠️ Not committed to Git
- **`.env.production`** - Production build (live backend URL)
- **`.env`** - Default production settings

### Admin Frontend (admin-frontend/)
- **`.env.local`** - Local development (localhost:4000) - ⚠️ Not committed to Git  
- **`.env.production`** - Production build (live backend URL)
- **`.env`** - Default production settings

---

## 🔧 How It Works

### Local Development
When you run `npm run dev` locally:
- Uses **`.env.local`** (highest priority)
- API URL: `http://localhost:4000`
- Requires backend running on port 4000

### Production Deployment
When deployed to Render or built for production:
- Uses **`.env.production`** and environment variables from `render.yaml`
- API URL: `https://rajjobs-backend.onrender.com`
- No need for local backend

---

## 🚀 Quick Start

### Local Development Setup

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm install
   npm start
   # Backend runs on http://localhost:4000
   ```

2. **Start Web Frontend** (Terminal 2):
   ```bash
   cd web-frontend
   npm install
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

3. **Start Admin Panel** (Terminal 3):
   ```bash
   cd admin-frontend
   npm install
   npm run dev
   # Admin runs on http://localhost:3001
   ```

---

## 🌐 Production Deployment

### GitHub → Render Auto Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Updated environment configuration"
   git push origin main
   ```

2. **Render Auto Deploy**:
   - Render reads `render.yaml`
   - Deploys 3 services:
     - `rajjobs-backend` → Backend API
     - `rajjobs-frontend` → Public website
     - `rajjobs-admin` → Admin panel
   - Uses production environment variables

3. **Live URLs** (after deployment):
   - Backend: `https://rajjobs-backend.onrender.com`
   - Website: `https://rajjobs-frontend.onrender.com`
   - Admin: `https://rajjobs-admin.onrender.com`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=production
SMS_ENABLED=false
```

### Web Frontend
```env
# .env.local (local dev - not committed)
NEXT_PUBLIC_API_URL=http://localhost:4000

# .env.production (production)
NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com
```

### Admin Frontend
```env
# .env.local (local dev - not committed)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# .env.production (production)
NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://rajjobs-backend.onrender.com
```

---

## 🔍 Troubleshooting

### Issue: Exams not showing on live website

**Cause**: Website fetching from localhost instead of live backend

**Solution**: 
✅ Already fixed! The setup now uses:
- `.env.local` for local development → localhost:4000
- `.env.production` for production → live backend URL

When you push to GitHub and Render deploys, it will automatically use the production backend.

---

## 📝 Important Notes

- ✅ `.env.local` files are **NOT committed** to Git (in `.gitignore`)
- ✅ Production uses live backend URL automatically
- ✅ Local development uses localhost backend
- ✅ No need to manually change URLs when deploying
- ✅ `render.yaml` configures all services with correct environment variables

---

## 🎯 Summary

| Environment | API URL | Source |
|------------|---------|--------|
| **Local Dev** | `http://localhost:4000` | `.env.local` |
| **Production** | `https://rajjobs-backend.onrender.com` | `.env.production` + `render.yaml` |

**जब आप GitHub पर push करोगे, तो automatically live backend से data fetch होगा! 🚀**
