# 🎯 Render Dashboard Setup - Critical Steps

## 🚨 IMPORTANT: Ye steps abhi karne hain!

Code GitHub pe push ho gaya hai, ab Render dashboard me environment variables set karne hain.

---

## Step 1: Render Dashboard me Login karein

Go to: **https://dashboard.render.com/**

---

## Step 2: Backend Service Environment Variables

### Service: `rajjobs-backend`

1. Render dashboard me **rajjobs-backend** service select karein
2. Left sidebar me **Environment** tab click karein
3. **Add Environment Variable** button click karein
4. Neeche diye gaye SABHI variables ek-ek karke add karein:

### Required Environment Variables:

```
Key: MONGO_URI
Value: mongodb+srv://soumyasharma042_db_user:4B4kRqRQ8NRiF38a@cluster0.pe6vesq.mongodb.net/rajjobs?appName=Cluster0
```

```
Key: JWT_ACCESS_SECRET
Value: KJH23kjsd9823KJHSDKJH@#@!kjsd9823
```

```
Key: JWT_REFRESH_SECRET
Value: 9sd8f7sdf98s7df9s8df7sdf98SDf@#@!
```

```
Key: ACCESS_TOKEN_EXPIRES_IN
Value: 7d
```

```
Key: REFRESH_TOKEN_EXPIRES_IN
Value: 30d
```

```
Key: SMTP_USER
Value: sahilshh777@gmail.com
```

```
Key: SMTP_PASS
Value: miyvxbwapdrrtawo
```

5. Sabhi variables add karne ke baad **Save Changes** button click karein

---

## Step 3: Automatic Deployment Start Hogi

Jaise hi environment variables save hoge:
- Render automatically backend service **redeploy** karega
- 5-10 minutes me deployment complete ho jayegi
- Logs check kar sakte ho deployment status ke liye

---

## Step 4: Verify Deployment

### Backend API Test:
```
https://rajjobs-backend.onrender.com/api/public/exam-details
```
**Expected:** JSON response with exam data

### Website:
```
https://rajjobs-frontend.onrender.com
```
**Expected:** Homepage with exams, courses, test series

### Admin Panel:
```
https://rajjobs-admin.onrender.com/login
```
**Login:**
- Email: `admin@rajjobs.com`
- Password: `Admin@123`

---

## 🎉 Done!

Ye steps complete karne ke baad:
- ✅ Backend live ho jayegi
- ✅ Website live ho jayegi  
- ✅ Admin panel live ho jayegi
- ✅ Database (MongoDB Atlas) already working hai

---

## 📱 Production URLs

| Service | URL |
|---------|-----|
| Backend API | https://rajjobs-backend.onrender.com |
| Public Website | https://rajjobs-frontend.onrender.com |
| Admin Panel | https://rajjobs-admin.onrender.com |

---

## 🐛 Agar Error Aaye

### Deployment Failed
1. Render dashboard → Service → Logs check karein
2. Environment variables sahi se add hue hain check karein
3. GitHub pe latest code push hua hai verify karein

### Database Connection Error
1. MongoDB Atlas dashboard check karein
2. MONGO_URI correct hai verify karein
3. Network Access settings me "Allow from Anywhere" enabled hai check karein

### CORS Error (Frontend se backend call nahi ho rahi)
1. Backend logs me CORS error check karein
2. CORS_ORIGINS aur FRONTEND_URL render.yaml me correct hain verify karein
3. Backend restart karein if needed

---

## 💡 Pro Tips

1. **First Deployment:** Render pe pehli bar deploy hone me 10-15 minutes lag sakte hain
2. **Free Tier:** Agar free tier use kar rahe ho, service 15 minutes inactivity ke baad sleep mode me chali jayegi
3. **Logs:** Real-time deployment logs dekh sakte ho Render dashboard me
4. **Auto Deploy:** Next time jab bhi GitHub pe code push karoge, automatically deploy ho jayega

---

**Status:** 🚀 Ready for deployment!

Ab bas Render dashboard me jayein aur environment variables add karein! 
