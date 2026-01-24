# Testing PDF Upload Feature

## Quick Start Guide

### 1. Start All Services

```powershell
# Terminal 1: Start Backend (Port 4000)
cd backend
npm run dev

# Terminal 2: Start Admin Panel (Port 3000)
cd admin-frontend
npm run dev

# Terminal 3: Start Web Frontend (Port 3001 or next available)
cd web-frontend
npm run dev
```

### 2. Admin Panel Test

#### Login to Admin
1. Open http://localhost:3000/login
2. Use admin credentials
3. Navigate to "Exam Details" section

#### Create/Edit Exam with PDF Upload
1. Click "Create New Exam"
2. Fill basic details (title, category, etc.)
3. Scroll to **Important Links** section
4. Click "+ Add Link"
5. Fill in the link details:
   - **Icon**: 📄 (or any emoji)
   - **Label**: "Admit Card" or "Notification PDF"
   - **Type**: Select **PDF** radio button
   - **File**: Click "Choose File" and select a PDF (max 10MB)
6. Wait for upload (you'll see "📤 Uploading...")
7. Once uploaded, you'll see: "✅ Uploaded: filename.pdf"
8. Add more links (URLs or PDFs) as needed
9. Click "Create Exam" to save

#### Example Important Links Setup
```
Link 1:
Icon: 📄
Label: Official Notification
Type: ● PDF  ○ URL
File: notification.pdf ✅ Uploaded

Link 2:
Icon: 🔗
Label: Official Website
Type: ○ PDF  ● URL
URL: https://example.com

Link 3:
Icon: 📥
Label: Admit Card
Type: ● PDF  ○ URL
File: admit-card.pdf ✅ Uploaded
```

### 3. Frontend Verification

1. Open web frontend (usually http://localhost:3001)
2. Navigate to the exam you just created
3. Scroll to "Important Links" section
4. Verify:
   - PDF links show download icon (📥)
   - URL links show external link icon (↗)
   - Clicking PDF links opens/downloads the file
   - Clicking URL links opens the website

### 4. Manual Testing Checklist

#### Upload Tests
- [ ] Upload PDF file less than 10MB → Success
- [ ] Try to upload file larger than 10MB → Error message
- [ ] Try to upload non-PDF file (e.g., .docx, .jpg) → Error
- [ ] Upload multiple PDFs in different links → All succeed
- [ ] Upload progress indicator appears → "📤 Uploading..."
- [ ] Success message shows filename → "✅ Uploaded: filename.pdf"

#### Display Tests
- [ ] PDF link shows document icon in frontend
- [ ] URL link shows external link icon
- [ ] Clicking PDF opens in new tab
- [ ] Clicking URL opens in new tab
- [ ] Custom icons (emojis) from admin panel display correctly

#### File System Tests
- [ ] Check `backend/uploads/pdfs/` directory exists
- [ ] Uploaded files are present with unique names
- [ ] File names follow pattern: `timestamp-random-originalname.pdf`

#### Authentication Tests
- [ ] Non-admin users cannot upload files (403 error)
- [ ] Upload without auth token fails (401 error)

### 5. API Testing with cURL

#### Test File Upload
```powershell
# Get admin token first (save from login)
$token = "your-admin-token-here"

# Test file upload
curl -X POST http://localhost:4000/api/admin/file/upload-pdf `
  -H "Authorization: Bearer $token" `
  -F "pdf=@C:\path\to\your\file.pdf"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "filename": "1234567890-abc123-file.pdf",
#     "originalName": "file.pdf",
#     "url": "/uploads/pdfs/1234567890-abc123-file.pdf",
#     "size": 123456
#   }
# }
```

#### Test File Access
```powershell
# Access uploaded file directly
curl http://localhost:4000/uploads/pdfs/1234567890-abc123-file.pdf `
  --output test-download.pdf

# Should download the PDF file
```

#### Test File Deletion (Optional)
```powershell
curl -X DELETE http://localhost:4000/api/admin/file/delete-pdf/1234567890-abc123-file.pdf `
  -H "Authorization: Bearer $token"

# Expected Response:
# { "success": true, "message": "File deleted successfully" }
```

### 6. Error Scenarios to Test

#### Invalid File Type
- Upload .docx, .txt, .jpg → Should show "Only PDF files are allowed"

#### File Too Large
- Upload PDF > 10MB → Should show "File size should be less than 10MB"

#### No File Selected
- Submit without selecting file → Should show "No file uploaded"

#### Network Error
- Turn off backend while uploading → Should show "Failed to upload file"

### 7. Browser Console Checks

Open browser DevTools (F12) and check:

#### Network Tab
- POST request to `/api/admin/file/upload-pdf`
- Status: 200 OK
- Response contains `url`, `filename`, `size`

#### Console Tab
- No JavaScript errors
- Upload completes successfully

### 8. Production Readiness Check

Before deploying to production:

- [ ] Update frontend URL from localhost to production domain
- [ ] Set up environment variables for file paths
- [ ] Configure nginx/Apache for static file serving
- [ ] Set proper file permissions on uploads directory
- [ ] Add CORS headers for production domain
- [ ] Consider cloud storage migration (S3, Azure Blob)
- [ ] Add file scanning/antivirus check
- [ ] Set up backup for uploads directory
- [ ] Add monitoring for upload errors
- [ ] Test with production SSL certificate

### 9. Troubleshooting

#### Upload fails with 401 error
- Check admin token in localStorage
- Re-login to admin panel
- Verify token is sent in Authorization header

#### Upload fails with 413 error
- File is too large (>10MB)
- Backend might have additional body-parser limits
- Check nginx/proxy upload size limits

#### File not found (404) on frontend
- Check file exists in `backend/uploads/pdfs/`
- Verify static file serving is configured
- Check URL path matches stored URL in database

#### Upload hangs indefinitely
- Check backend server is running
- Verify port 4000 is accessible
- Check network connectivity
- Look for CORS errors in console

### 10. Sample Test Data

Create a test exam with these Important Links:

```javascript
importantLinks: [
  {
    icon: "📄",
    label: "Official Notification",
    type: "pdf",
    url: "/uploads/pdfs/1234-notification.pdf"
  },
  {
    icon: "📥",
    label: "Download Admit Card",
    type: "pdf",
    url: "/uploads/pdfs/5678-admit-card.pdf"
  },
  {
    icon: "🔗",
    label: "Official Website",
    type: "url",
    url: "https://example.gov.in"
  },
  {
    icon: "📝",
    label: "Application Form",
    type: "url",
    url: "https://apply.example.com"
  }
]
```

---

## Quick Verification Commands

```powershell
# Check if backend is running
curl http://localhost:4000/api/public/banners

# Check if uploads directory exists
Test-Path backend\uploads\pdfs

# List uploaded files
Get-ChildItem backend\uploads\pdfs

# Check file size
(Get-Item "backend\uploads\pdfs\filename.pdf").Length / 1MB

# Test static file serving
curl http://localhost:4000/uploads/pdfs/filename.pdf
```

---

**Status**: Ready for Testing ✅

**Need Help?** Check [PDF_UPLOAD_FEATURE.md](./PDF_UPLOAD_FEATURE.md) for detailed implementation notes.
