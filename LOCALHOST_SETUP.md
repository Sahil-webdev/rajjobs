# 🚀 Localhost Setup - RajJobs

## ✅ Quick Start (3 Terminals)

### Terminal 1 - Backend
```bash
cd C:\Users\ADMIN\Desktop\sahil\rajjobs\backend
npm start
```
**Expected Output:**
```
MongoDB connected
Server running on http://localhost:4000
```

### Terminal 2 - Website (User Frontend)
```bash
cd C:\Users\ADMIN\Desktop\sahil\rajjobs\web-frontend
npm run dev
```
**Expected Output:**
```
✓ Ready in 3-5s
➜ Local: http://localhost:3000
```

### Terminal 3 - Admin Panel
```bash
cd C:\Users\ADMIN\Desktop\sahil\rajjobs\admin-frontend
npm run dev
```
**Expected Output:**
```
✓ Ready in 3-5s
➜ Local: http://localhost:3001
```

---

## 🌐 Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | http://localhost:4000 | REST API server |
| **Website** | http://localhost:3000 | Public website |
| **Admin Panel** | http://localhost:3001 | Admin dashboard |

---

## 🔐 Admin Login Credentials

```
Email: admin@rajjobs.com
Password: Admin@123
```

---

## 🎯 Environment Configuration

### Development (Localhost)
**All `.env` files are already configured for localhost!** ✅

- `backend/.env` → PORT=4000, NODE_ENV=development
- `web-frontend/.env` → NEXT_PUBLIC_API_URL=http://localhost:4000
- `admin-frontend/.env` → NEXT_PUBLIC_API_URL=http://localhost:4000

### Production (Render.com)
When you push to GitHub:
- `.env.production` files will be used
- `render.yaml` configures environment variables
- Live URLs will be used automatically

---

## 🐛 Troubleshooting

### Error: Port already in use

**Problem:** Previous Node processes still running

**Solution:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Then restart servers
```

---

### Error: Cannot connect to MongoDB

**Problem:** MongoDB URI not working

**Solution:**
- Already using MongoDB Atlas (cloud)
- URI is configured in `backend/.env`
- Should work from anywhere ✅

---

### Error: CORS issue / API connection failed

**Problem:** Backend CORS not allowing frontend

**Solution:**
Check `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```
Already configured ✅

---

### Error: Module not found

**Problem:** Dependencies not installed

**Solution:**
```bash
# Backend
cd backend
npm install

# Web Frontend
cd web-frontend
npm install

# Admin Frontend
cd admin-frontend
npm install
```

---

## 📊 Port Summary

| Port | Service | Command |
|------|---------|---------|
| 4000 | Backend | `npm start` |
| 3000 | Website | `npm run dev` |
| 3001 | Admin | `npm run dev` |

**Note:** If port 3000 is busy, Next.js will automatically use 3001, 3002, etc.

---

## 🧪 Testing URLs

### Backend API Test:
```
http://localhost:4000/api/public/exam-details
```
Should return JSON with exam list

### Website Test:
```
http://localhost:3000
http://localhost:3000/exams
```
Should show homepage and exams page

### Admin Test:
```
http://localhost:3001
http://localhost:3001/login
```
Should show admin login page

---

## 🎨 Testing SEO Features

1. **Login to Admin Panel** (http://localhost:3001)
2. **Create/Edit Exam**
3. **Scroll to SEO Section** (🎯 SEO Optimization)
4. **Fill SEO fields:**
   - Focus Keyword: "SSC CGL 2025"
   - Meta Title: "SSC CGL 2025 Notification..."
   - LSI Keywords: Add related keywords
   - Image Alt Text
5. **Click "Analyze SEO Score"**
6. **Verify:**
   - ✅ Score displayed (0-100)
   - ✅ Character counters working
   - ✅ Google preview shown
7. **Save Exam**
8. **Check on Website** (http://localhost:3000/exams/[slug])
9. **View Page Source** (Right-click → View Page Source)
10. **Verify meta tags in `<head>` section:**
    - `<title>` tag
    - `<meta name="description">`
    - `<meta property="og:...">`
    - Schema markup `<script type="application/ld+json">`

---

## 🔄 Restart All Servers (if needed)

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Terminal 1
cd backend && npm start

# Terminal 2
cd web-frontend && npm run dev

# Terminal 3
cd admin-frontend && npm run dev
```

---

## 📦 Dependencies Check

If any module errors, install dependencies:

```bash
# Backend dependencies
cd backend
npm install

# Web Frontend dependencies  
cd web-frontend
npm install

# Admin Frontend dependencies
cd admin-frontend
npm install
```

---

## ✅ Verification Checklist

Before testing, ensure:

- [ ] MongoDB Atlas URI in `backend/.env`
- [ ] All `.env` files have `localhost:4000`
- [ ] Backend runs on port 4000
- [ ] Website runs on port 3000
- [ ] Admin runs on port 3001
- [ ] No CORS errors in browser console
- [ ] Admin login works
- [ ] Exams visible on website

---

## 🚀 Deploy to Production

When ready to go live:

```bash
# 1. Ensure all .env files are correct
# 2. Commit changes
git add .
git commit -m "Ready for production deployment"

# 3. Push to GitHub
git push origin main

# 4. Render will auto-deploy
# Check: https://dashboard.render.com
```

**Production URLs (after deployment):**
- Backend: https://rajjobs-backend.onrender.com
- Website: https://rajjobs-frontend.onrender.com  
- Admin: https://rajjobs-admin.onrender.com

---

## 💡 Important Notes

1. **`.env.local` files are OPTIONAL now** - `.env` is configured for localhost
2. **MongoDB is cloud-based** - Works from anywhere
3. **CORS is pre-configured** - Allows localhost origins
4. **JWT secrets are set** - Authentication will work
5. **Email SMTP configured** - OTP emails will work

---

## 🎉 You're All Set!

Just open 3 terminals and run the commands. Everything is configured for localhost! 

**Problems?** Check the Troubleshooting section above.

---

**Last Updated:** February 17, 2026  
**Status:** ✅ Ready for localhost development
