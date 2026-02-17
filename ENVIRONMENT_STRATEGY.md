# 🔄 Environment Files Strategy - Complete Guide

## 📋 Overview

यह project **3-tier environment strategy** use करता है:

1. **`.env`** - Default (development/localhost) ✅ **Git में commit होगी**
2. **`.env.production`** - Production builds के लिए ✅ **Git में commit होगी**  
3. **`.env.local`** - Per-developer overrides ❌ **Git में ignore (optional)**

---

## 📁 File Structure

```
backend/
  ├── .env                 # Development (localhost) ✅ COMMIT
  ├── .env.example         # Template ✅ COMMIT
  └── .gitignore           # Ignores .env.local only

web-frontend/
  ├── .env                 # Development (localhost) ✅ COMMIT
  ├── .env.production      # Production build ✅ COMMIT
  ├── .env.local           # Optional override ❌ IGNORED
  └── .gitignore           # Ignores .env.local only

admin-frontend/
  ├── .env                 # Development (localhost) ✅ COMMIT
  ├── .env.production      # Production build ✅ COMMIT
  ├── .env.local           # Optional override ❌ IGNORED
  └── .gitignore           # Ignores .env.local only
```

---

## 🎯 Why This Strategy?

### ❌ Old Problem (Before Fix):
```
.env = Production URLs (live backend)
.env.local = Localhost URLs
```
**Issue:** Everyone had to create `.env.local` manually

### ✅ New Solution (After Fix):
```
.env = Localhost URLs (default development)
.env.production = Production URLs (for builds)
.env.local = Optional overrides (per developer)
```
**Benefit:** Clone करो, `npm install`, `npm run dev` - **Just works!** 🎉

---

## 🔧 How It Works

### Development Mode (`npm run dev`)

**Next.js Loading Order:**
1. `.env.local` (highest priority, if exists)
2. `.env.development` (if exists)  
3. `.env` ✅ **Used by default**

**Result:** 
- Uses `http://localhost:4000` from `.env`
- No manual configuration needed!

---

### Production Build (`npm run build` + `npm start`)

**Next.js Loading Order:**
1. `.env.production` ✅ **Used for production**
2. `.env.local` (ignored in production builds)
3. `.env`

**Result:**
- Uses `https://rajjobs-backend.onrender.com` from `.env.production`
- Automatically switches to live backend!

---

### Render Deployment

**Render.com reads:**
1. `render.yaml` environment variables (highest priority)
2. `.env.production` files
3. Dashboard environment settings

**Result:**
- Production URLs used automatically
- No manual intervention needed!

---

## 📝 Current Configuration

### Backend (`.env`)
```env
# Development Configuration (Localhost)
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Web Frontend (`.env`)
```env
# Development Configuration (Localhost)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Web Frontend (`.env.production`)
```env
# Production Build Configuration
NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com
```

### Admin Frontend (`.env`)
```env
# Development Configuration (Localhost)
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Admin Frontend (`.env.production`)
```env
# Production Build Configuration
NEXT_PUBLIC_BACKEND_URL=https://rajjobs-backend.onrender.com
NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com
```

---

## 🚀 Workflow

### 1️⃣ Clone Repository
```bash
git clone <repo-url>
cd rajjobs
```

### 2️⃣ Install Dependencies
```bash
# Backend
cd backend && npm install

# Web Frontend
cd ../web-frontend && npm install

# Admin Frontend
cd ../admin-frontend && npm install
```

### 3️⃣ Run Locally (Development)
```bash
# Terminal 1
cd backend && npm start

# Terminal 2  
cd web-frontend && npm run dev

# Terminal 3
cd admin-frontend && npm run dev
```

**✅ Uses `.env` files automatically (localhost URLs)**

### 4️⃣ Push to GitHub
```bash
git add .
git commit -m "Your changes"
git push origin main
```

**✅ Commits `.env` and `.env.production`**  
**✅ Ignores `.env.local` (if exists)**

### 5️⃣ Auto-Deploy to Render
- Render detects push
- Runs `npm run build` (uses `.env.production`)
- Deploys with production URLs
- **✅ Live backend automatically connected!**

---

## 🔒 What Gets Committed to Git?

| File | Committed? | Contains | Purpose |
|------|------------|----------|---------|
| `.env` | ✅ Yes | Localhost URLs | Default development |
| `.env.production` | ✅ Yes | Live URLs | Production builds |
| `.env.local` | ❌ No | Per-dev overrides | Optional customization |
| `.env.example` | ✅ Yes | Template | Documentation |

---

## 🎨 Optional: Per-Developer Customization

If a developer wants different settings:

**Create `.env.local` (optional):**
```env
# web-frontend/.env.local
NEXT_PUBLIC_API_URL=http://192.168.1.100:4000  # Different backend IP
```

**Benefits:**
- Overrides `.env` for that developer only
- Not committed to Git
- Doesn't affect others

---

## 🐛 Troubleshooting

### Issue: Still fetching from production backend

**Cause:** `.env` might still have old production URLs

**Solution:**
```bash
# Check current .env files
cat backend/.env
cat web-frontend/.env
cat admin-frontend/.env

# Should show localhost:4000
# If not, run:
git pull origin main  # Get latest changes
```

---

### Issue: .env files not found after clone

**Cause:** Old .gitignore was ignoring all .env files

**Solution:**
```bash
# Make sure you have latest code with fixed .gitignore
git pull origin main

# Verify .env files exist:
ls backend/.env
ls web-frontend/.env
ls admin-frontend/.env
```

---

### Issue: Production deployment uses localhost

**Cause:** `.env.production` missing or incorrect

**Solution:**
```bash
# Verify .env.production files exist:
ls web-frontend/.env.production
ls admin-frontend/.env.production

# Should contain:
# NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com
```

---

## ✅ Migration Checklist

If you're updating from old setup:

- [x] Update `backend/.env` to localhost URLs
- [x] Update `web-frontend/.env` to localhost URLs
- [x] Update `admin-frontend/.env` to localhost URLs
- [x] Create/verify `.env.production` files with live URLs
- [x] Update `.gitignore` to allow `.env` commits
- [x] Update `.gitignore` to ignore only `.env.local`
- [x] Test localhost development
- [x] Commit changes to Git
- [x] Test production deployment

---

## 📊 Comparison

### Before Fix ❌
```
Developer workflow:
1. Clone repo
2. .env has production URLs
3. Create .env.local manually
4. Copy localhost URLs
5. Start servers
6. Works on localhost ✅
7. Push to GitHub
8. Deploy to Render
9. Production uses .env.production ❌ (doesn't exist)
10. Still fetches from localhost ❌
```

### After Fix ✅
```
Developer workflow:
1. Clone repo
2. .env already has localhost URLs ✅
3. No manual setup needed ✅
4. Start servers
5. Works on localhost ✅
6. Push to GitHub
7. Deploy to Render
8. Build uses .env.production ✅
9. Production uses live backend ✅
10. Everything works! 🎉
```

---

## 🎓 Best Practices

1. **Never commit sensitive data** (passwords, API keys) in `.env` files
   - Use environment variables in Render dashboard
   - Or use secrets management services

2. **Document all environment variables** in `.env.example`

3. **Use `.env.local` for testing** different configurations without affecting others

4. **Keep `.env` with safe defaults** (localhost URLs)

5. **Keep `.env.production` with live URLs** (for builds)

---

## 🔐 Security Notes

**Current `.env` files contain:**
- ✅ MongoDB Atlas URI (safe - has access controls)
- ✅ JWT secrets (safe - long random strings)
- ✅ SMTP credentials (safe - app-specific password)
- ✅ Localhost URLs (safe - no sensitive data)

**For production:**
- Consider moving secrets to Render environment dashboard
- Enable IP whitelist on MongoDB Atlas
- Use different JWT secrets for production
- Enable rate limiting on APIs

---

## 📚 References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Render Environment Groups](https://render.com/docs/environment-variables)
- [Git Ignore Patterns](https://git-scm.com/docs/gitignore)

---

## ✅ Summary

**What Changed:**
- `.env` files now have **localhost URLs** (default)
- `.env.production` files have **live URLs** (for builds)
- `.gitignore` updated to **commit `.env`** but **ignore `.env.local`**

**Benefits:**
- ✅ Clone once, works immediately
- ✅ No manual configuration
- ✅ Automatic production switching
- ✅ Per-developer customization possible
- ✅ Team-friendly setup

**Status:** 🎉 **READY FOR LOCALHOST DEVELOPMENT**

---

**Last Updated:** February 17, 2026  
**Version:** 2.0 (Fixed Environment Strategy)
