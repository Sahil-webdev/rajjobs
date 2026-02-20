# 🚀 Production Deployment Guide - RajJobs

## ✅ Pre-Deployment Checklist

### 1. Environment Files Ready
- ✅ `backend/.env` - Development (localhost)
- ✅ `backend/.env.production` - Production settings
- ✅ `web-frontend/.env` - Development (localhost)
- ✅ `web-frontend/.env.production` - Production URLs
- ✅ `admin-frontend/.env` - Development (localhost)  
- ✅ `admin-frontend/.env.production` - Production URLs
- ✅ `render.yaml` - Deployment configuration updated

### 2. CORS Configuration
Backend CORS now includes:
- Development: `http://localhost:3000`, `http://localhost:3001`, `http://localhost:3002`
- Production: `https://rajjobs-frontend.onrender.com`, `https://rajjobs-admin.onrender.com`

---

## 📋 Deployment ke liye Steps

### Step 1: GitHub pe Code Push karo

```bash
# Check current status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Production ready: Added environment files and CORS config"

# Push to GitHub
git push origin main
```

### Step 2: Render Dashboard Setup

#### Backend Service Environment Variables
Render dashboard me jayein aur **rajjobs-backend** service me ye secret environment variables add karein:

**Important: Ye sensitive data hai, render.yaml me nahi dalna**

```
MONGO_URI=mongodb+srv://soumyasharma042_db_user:4B4kRqRQ8NRiF38a@cluster0.pe6vesq.mongodb.net/rajjobs?appName=Cluster0

JWT_ACCESS_SECRET=KJH23kjsd9823KJHSDKJH@#@!kjsd9823

JWT_REFRESH_SECRET=9sd8f7sdf98s7df9s8df7sdf98SDf@#@!

ACCESS_TOKEN_EXPIRES_IN=7d

REFRESH_TOKEN_EXPIRES_IN=30d

SMTP_USER=sahilshh777@gmail.com

SMTP_PASS=miyvxbwapdrrtawo
```

#### How to add Environment Variables in Render:
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select **rajjobs-backend** service
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Ek ek karke upar diye gaye variables add karein
6. Click **Save Changes**

### Step 3: Automatic Deployment

Jaise hi GitHub pe code push hoga, Render automatically deploy karega:

1. **Backend** - `https://rajjobs-backend.onrender.com`
2. **Website** - `https://rajjobs-frontend.onrender.com`  
3. **Admin Panel** - `https://rajjobs-admin.onrender.com`

---

## 🔍 Deployment Verify kaise karein

### 1. Backend API Check
```bash
# Browser me open karein:
https://rajjobs-backend.onrender.com/api/public/exam-details

# Ya curl se test karein:
curl https://rajjobs-backend.onrender.com/api/public/exam-details
```

**Expected**: JSON response with exam details

### 2. Website Check
```
https://rajjobs-frontend.onrender.com
```

**Verify:**
- ✅ Homepage load ho raha hai
- ✅ Exams page pe data show ho raha hai
- ✅ Images load ho rahe hain
- ✅ Links work kar rahe hain

### 3. Admin Panel Check
```
https://rajjobs-admin.onrender.com/login
```

**Login Credentials:**
- Email: `admin@rajjobs.com`
- Password: `Admin@123`

**Verify:**
- ✅ Login successful
- ✅ Dashboard load ho raha hai
- ✅ Exam create kar sakte ho
- ✅ Image upload work kar raha hai

---

## 🗄️ Database Configuration

### MongoDB Atlas Already Configured
Database URL already production-ready hai:
```
mongodb+srv://soumyasharma042_db_user:4B4kRqRQ8NRiF38a@cluster0.pe6vesq.mongodb.net/rajjobs
```

**Features:**
- ✅ Cloud-based (MongoDB Atlas)
- ✅ Same database for development and production
- ✅ No additional setup needed
- ✅ Auto-scaling enabled

### Database me data check karne ke liye:
1. [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Login karein
3. Select **Cluster0**
4. Click **Browse Collections**
5. **rajjobs** database me sari collections dekh sakte ho

---

## 📁 Production URLs Summary

| Service | Production URL | Purpose |
|---------|---------------|---------|
| **Backend API** | https://rajjobs-backend.onrender.com | REST API server |
| **Website** | https://rajjobs-frontend.onrender.com | Public website |
| **Admin Panel** | https://rajjobs-admin.onrender.com | Admin dashboard |
| **Database** | MongoDB Atlas | Data storage |

---

## 🔧 Troubleshooting

### Issue 1: Backend service start nahi ho rahi
**Solution:**
- Render dashboard me environment variables check karein
- Sabhi required variables add hone chahiye
- Logs check karein: Render dashboard → Service → Logs

### Issue 2: Frontend se backend call nahi ho rahi
**Solution:**
```bash
# Check CORS settings in backend
# Must include frontend URLs

# Check .env.production files
# Must have correct backend URL
```

### Issue 3: Database connection error
**Solution:**
- MongoDB Atlas dashboard me check karein ki cluster running hai
- MONGO_URI environment variable correct hai
- Network access settings me "Allow Access from Anywhere" enabled hai

### Issue 4: Images show nahi ho rahe
**Solution:**
- Backend URL check karein image src me
- Example: `https://rajjobs-backend.onrender.com/uploads/...`
- CORS headers allow kar rahe hain image access

---

## 🎯 Post-Deployment Checklist

After successful deployment, verify:

- [ ] Backend health check: GET `/api/public/exam-details`
- [ ] Website homepage loads correctly
- [ ] Exam detail pages work
- [ ] Admin login works
- [ ] Exam create/edit/delete works
- [ ] Image upload works
- [ ] PDF upload works
- [ ] Tags feature works
- [ ] Quick Highlights work

---

## 💡 Development vs Production

### Development (Localhost)
```bash
# Backend
cd backend
npm start
# http://localhost:4000

# Website  
cd web-frontend
npm run dev
# http://localhost:3000

# Admin Panel
cd admin-frontend
npm run dev
# http://localhost:3001
```

**Uses `.env` files** with localhost URLs

### Production (Render)
```bash
# Automatic deployment after git push
# Uses .env.production files
# Environment variables from Render dashboard
```

**Uses `.env.production` files** with production URLs

---

## 🔐 Security Notes

1. **Never commit sensitive data to GitHub:**
   - ✅ `.env` files are in `.gitignore`
   - ✅ Secrets only in Render dashboard
   - ✅ No credentials in render.yaml

2. **Environment Variables Priority:**
   - Render dashboard > .env.production > .env

3. **CORS Security:**
   - Only allowed origins can access API
   - Production URLs whitelisted

---

## 📞 Support

Agar koi issue aaye to check karein:
1. Render deployment logs
2. Browser console errors
3. Network tab in DevTools
4. MongoDB Atlas connection status

---

## ✅ Deployment Complete!

Sab kuch ready hai. Ab bas:
1. `git push` karein
2. Render automatically deploy karega
3. 5-10 minutes me live ho jayega

**Happy Deploying! 🚀**
