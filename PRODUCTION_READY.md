# 🚀 PRODUCTION DEPLOYMENT GUIDE

## ✅ Configuration Status

सभी files अब **Production Mode** में configured हैं:

### Backend (Render.com)
- ✅ `NODE_ENV=production`
- ✅ `CORS_ORIGINS=https://rajjobs.com,https://admin.rajjobs.com,https://www.rajjobs.com`
- ✅ MongoDB Atlas connected
- ✅ SMTP configured

### Website Frontend (Vercel/Netlify)
- ✅ `NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com`
- ✅ All API calls point to production backend

### Admin Panel (Vercel/Netlify)
- ✅ `NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com`
- ✅ PDF upload endpoint uses environment variable

---

## 📦 DEPLOYMENT STEPS

### 1️⃣ Backend Deployment (Render.com)

```bash
# Push to GitHub
git add .
git commit -m "Production configuration ready"
git push origin main
```

**Render.com Settings:**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:
  ```
  MONGO_URI=mongodb+srv://...
  JWT_ACCESS_SECRET=<your-secret>
  JWT_REFRESH_SECRET=<your-secret>
  PORT=4000
  NODE_ENV=production
  FRONTEND_URL=https://rajjobs.com
  CORS_ORIGINS=https://rajjobs.com,https://admin.rajjobs.com,https://www.rajjobs.com
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=sahilshh777@gmail.com
  SMTP_PASS=<your-smtp-password>
  ```

**Backend will be live at:** `https://rajjobs-backend.onrender.com`

---

### 2️⃣ Website Frontend Deployment (Vercel)

```bash
# Already configured in .env
# Just deploy to Vercel
vercel --prod
```

**Vercel Settings:**
- Root Directory: `web-frontend`
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com
  ```

**Website will be live at:** `https://rajjobs.com` (custom domain)

---

### 3️⃣ Admin Panel Deployment (Vercel)

```bash
# Deploy admin panel
vercel --prod
```

**Vercel Settings:**
- Root Directory: `admin-frontend`
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com
  NEXT_PUBLIC_BACKEND_URL=https://rajjobs-backend.onrender.com
  ```

**Admin will be live at:** `https://admin.rajjobs.com` (custom domain)

---

## 🔧 POST-DEPLOYMENT CHECKLIST

### Backend Health Check
```bash
curl https://rajjobs-backend.onrender.com/health
# Should return: {"status":"ok"}
```

### Test API Endpoints
```bash
# Get all exams
curl https://rajjobs-backend.onrender.com/api/public/exam-details

# Get specific exam
curl https://rajjobs-backend.onrender.com/api/public/exam-details/ssc-cgl-2025
```

### Website Check
1. Open: `https://rajjobs.com`
2. Navigate to: Exams page
3. Click on any exam
4. Verify all sections display (Salary, Syllabus, Selection Process, Cutoff)

### Admin Panel Check
1. Open: `https://admin.rajjobs.com/login`
2. Login with credentials:
   - Email: `admin@rajjobs.com`
   - Password: `Admin@123`
3. Create/Edit an exam
4. Enable all 4 new sections
5. Save and verify on website

---

## 🔄 CORS Configuration

Backend automatically allows these origins:
- ✅ `https://rajjobs.com`
- ✅ `https://admin.rajjobs.com`
- ✅ `https://www.rajjobs.com`

If you need to add more domains:
1. Update `backend/.env` → `CORS_ORIGINS`
2. Push to GitHub
3. Render will auto-deploy

---

## 🐛 TROUBLESHOOTING

### Issue: CORS Error
**Solution:** Check that CORS_ORIGINS in Render includes your frontend domain

### Issue: API Not Found
**Solution:** Verify NEXT_PUBLIC_API_URL points to correct backend URL

### Issue: Images/PDFs Not Loading
**Solution:** Check that upload URLs are absolute (https://...)

### Issue: 401 Unauthorized
**Solution:** Re-login to admin panel, JWT token might be expired

---

## 🔐 SECURITY NOTES

1. ✅ `.env` files with production URLs are committed
2. ✅ `.env.local` files are gitignored (for local dev secrets)
3. ✅ Production secrets should be set in hosting platform (Render/Vercel)
4. ✅ Never commit real passwords/API keys to `.env` files

---

## 🏠 LOCAL DEVELOPMENT

If you want to develop locally after production setup:

```bash
# Create .env.local files (these override .env)
# See .env.local.example for templates

# Backend
cd backend
echo "NODE_ENV=development" > .env.local
echo "CORS_ORIGINS=http://localhost:3000,http://localhost:3001" >> .env.local

# Website
cd web-frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Admin
cd admin-frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
```

---

## 📊 DEPLOYMENT SUMMARY

| Component | URL | Status |
|-----------|-----|--------|
| Backend API | https://rajjobs-backend.onrender.com | ✅ Production Ready |
| Website | https://rajjobs.com | ✅ Production Ready |
| Admin Panel | https://admin.rajjobs.com | ✅ Production Ready |

---

## 🎉 READY TO DEPLOY!

```bash
# Final push to GitHub
git add .
git commit -m "🚀 Production deployment configuration complete"
git push origin main
```

**All systems configured for production! 🚀**
