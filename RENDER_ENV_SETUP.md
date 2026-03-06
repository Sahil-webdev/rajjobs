# 🔧 Render Environment Variables Setup

## Problem: PDF Upload Failing on Production

**Issue:** PDF upload returns 500 error because Cloudinary credentials are missing on Render backend.

**Screenshot shows:** 
- ❌ "File upload failed" 
- ❌ Backend 500 error: `https://rajjobs-backend.onrender.com/api/admin/file/upload-pdf`

---

## ✅ Solution: Add Cloudinary Environment Variables to Render

### Step 1: Login to Render Dashboard
1. Go to: https://dashboard.render.com
2. Login with your account

### Step 2: Select Backend Service
1. Click on **"rajjobs-backend"** service
2. Go to **"Environment"** tab (left sidebar)

### Step 3: Add These Environment Variables

Click **"Add Environment Variable"** and add each of these:

#### Required Cloudinary Variables (for PDF storage):
```
CLOUDINARY_CLOUD_NAME = dmig9dvds
CLOUDINARY_API_KEY = 777429778561293
CLOUDINARY_API_SECRET = Ywv-_J8121TQRudQ7OBdUW5qy5A
```

#### Other Production Variables (verify these exist):
```
MONGO_URI = mongodb+srv://soumyasharma042_db_user:4B4kRqRQ8NRiF38a@cluster0.pe6vesq.mongodb.net/rajjobs?appName=Cluster0
JWT_ACCESS_SECRET = KJH23kjsd9823KJHSDKJH@#@!kjsd9823
JWT_REFRESH_SECRET = 9sd8f7sdf98s7df9s8df7sdf98SDf@#@!
ACCESS_TOKEN_EXPIRES_IN = 7d
REFRESH_TOKEN_EXPIRES_IN = 30d
PORT = 4000
NODE_ENV = production
FRONTEND_URL = https://rajjobs-frontend.onrender.com
CORS_ORIGINS = https://rajjobs-frontend.onrender.com,https://rajjobs-admin.onrender.com
BACKEND_URL = https://rajjobs-backend.onrender.com
EMAIL_ENABLED = true
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = sahilshh777@gmail.com
SMTP_PASS = miyvxbwapdrrtawo
SMS_ENABLED = false
```

### Step 4: Save and Redeploy
1. After adding variables, click **"Save Changes"**
2. Render will **automatically redeploy** the backend (takes ~5-7 minutes)
3. Wait for deployment status: **"Deploy Live ✅"**

---

## 🔍 How to Verify It's Working

### After Deployment Completes:

1. **Check Backend Logs:**
   - Go to "Logs" tab in Render backend service
   - Look for: `☁️  Cloudinary PDF storage: ACTIVE`
   - ❌ Should NOT see: `💾 Local PDF storage: ACTIVE`

2. **Test PDF Upload:**
   - Go to: https://admin.rajjobs.com/admin/exam-details/create
   - Select some text → Click PDF button
   - Upload a PDF file
   - Should show: ✅ "File uploaded successfully"
   - Link should be blue and clickable

3. **Verify Cloudinary Storage:**
   - Login to Cloudinary: https://cloudinary.com/console
   - Check "Media Library" → "rajjobs-pdfs" folder
   - Uploaded PDFs should appear there

---

## 📋 Admin Frontend Environment Variables

**Note:** Admin frontend already has correct production variables in `.env.production`:

```env
NEXT_PUBLIC_BACKEND_URL=https://rajjobs-backend.onrender.com
NEXT_PUBLIC_API_URL=https://rajjobs-backend.onrender.com
```

These are automatically loaded during build on Render. **No action needed for admin frontend.**

---

## ⚡ Quick Reference

| Service | Dashboard URL | Action Required |
|---------|--------------|-----------------|
| **Backend** | https://dashboard.render.com → rajjobs-backend | ✅ **ADD CLOUDINARY ENV VARS** |
| **Admin Frontend** | https://dashboard.render.com → rajjobs-admin | ✅ Already configured |
| **Website** | https://dashboard.render.com → rajjobs-frontend | ✅ Already configured |

---

## 🎯 Expected Behavior After Fix

### Before Fix (Current):
```
User uploads PDF → Frontend sends to backend → Backend has no Cloudinary → Returns 500 error → ❌ "File upload failed"
```

### After Fix:
```
User uploads PDF → Frontend sends to backend → Backend uploads to Cloudinary → Returns secure URL → ✅ Blue clickable link inserted
```

---

## 🆘 Troubleshooting

### If still failing after adding env vars:

1. **Check deployment completed:**
   - Render status should be "Deploy Live" with green checkmark
   - Check "Events" tab for deployment timeline

2. **Verify logs:**
   ```
   Should see: ☁️  Cloudinary PDF storage: ACTIVE
   Should NOT see: 💾 Local PDF storage: ACTIVE
   ```

3. **Test backend directly:**
   - Open browser console on admin page
   - Upload PDF and check network tab
   - Response should show: `"storage": "cloudinary"`

4. **Check Cloudinary credentials:**
   - Login to Cloudinary dashboard
   - Verify API key is active
   - Check upload presets

---

## 📝 Notes

- **Why Cloudinary?** Render's disk is ephemeral (files deleted on restart). Cloudinary provides permanent storage.
- **Local vs Production:** 
  - Local development: PDFs saved to `backend/uploads/pdfs/` (fast)
  - Production: PDFs uploaded to Cloudinary (persistent)
- **Auto-detection:** Backend automatically detects Cloudinary credentials and switches storage method.

---

**Next Step:** Go to Render dashboard and add the Cloudinary environment variables to the backend service! 🚀
