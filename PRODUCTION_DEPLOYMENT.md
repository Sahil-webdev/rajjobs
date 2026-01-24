# Production Deployment Guide - PDF Upload Feature

## Environment Configuration

### Backend (.env)
```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://your-mongodb-uri

# JWT Secrets
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/rajjobs/uploads
ALLOWED_FILE_TYPES=pdf

# CORS
ALLOWED_ORIGINS=https://rajjobs.com,https://www.rajjobs.com,https://admin.rajjobs.com
```

### Web Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.rajjobs.com
```

### Admin Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.rajjobs.com
```

---

## Deployment Options

### Option 1: Same Server Deployment (Simple)

#### Server Setup
```bash
# Install dependencies
sudo apt update
sudo apt install nginx nodejs npm mongodb

# Create app directory
sudo mkdir -p /var/www/rajjobs
cd /var/www/rajjobs

# Clone repository
git clone <your-repo> .

# Create uploads directory
sudo mkdir -p /var/www/rajjobs/uploads/pdfs
sudo chown -R www-data:www-data /var/www/rajjobs/uploads
sudo chmod -R 755 /var/www/rajjobs/uploads
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/rajjobs

# Backend API
server {
    listen 80;
    server_name api.rajjobs.com;

    # File upload size limit
    client_max_body_size 10M;

    # Static files (PDFs)
    location /uploads/ {
        alias /var/www/rajjobs/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web Frontend
server {
    listen 80;
    server_name rajjobs.com www.rajjobs.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin Panel
server {
    listen 80;
    server_name admin.rajjobs.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL Setup (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d rajjobs.com -d www.rajjobs.com
sudo certbot --nginx -d api.rajjobs.com
sudo certbot --nginx -d admin.rajjobs.com

# Auto-renewal (already set up by certbot)
```

#### PM2 Process Management
```bash
# Install PM2
npm install -g pm2

# Start backend
cd /var/www/rajjobs/backend
npm install --production
pm2 start src/index.js --name rajjobs-backend

# Start web frontend
cd /var/www/rajjobs/web-frontend
npm install --production
npm run build
pm2 start npm --name rajjobs-web -- start

# Start admin frontend
cd /var/www/rajjobs/admin-frontend
npm install --production
npm run build
pm2 start npm --name rajjobs-admin -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

---

### Option 2: Cloud Storage (AWS S3) - Recommended

#### Benefits
- Scalable storage
- CDN integration
- Automatic backups
- Better security
- Lower server costs

#### Setup Steps

##### 1. Install AWS SDK
```bash
cd backend
npm install aws-sdk
```

##### 2. Update File Upload Route
```javascript
// backend/src/routes/admin/file-upload.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Multer S3 Storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
      cb(null, `pdfs/${uniqueName}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Upload endpoint
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const fileUrl = req.file.location; // S3 public URL
    res.json({
      success: true,
      data: {
        filename: req.file.key,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

##### 3. Environment Variables
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=rajjobs-uploads

# Optional: CloudFront CDN
CLOUDFRONT_URL=https://d1234abcd.cloudfront.net
```

##### 4. Update Frontend
```typescript
// No changes needed! The S3 URL is stored directly in the database
// Frontend will use the full S3/CloudFront URL automatically
```

##### 5. S3 Bucket Configuration
- **Bucket Policy**: Public read access for uploaded files
- **CORS Configuration**: Allow requests from your domains
- **Lifecycle Rules**: Archive old files to Glacier after 1 year
- **CloudFront**: Set up CDN for faster delivery

---

### Option 3: Azure Blob Storage

Similar to S3, but using Azure services:

```bash
npm install @azure/storage-blob
```

```javascript
const { BlobServiceClient } = require('@azure/storage-blob');

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
```

---

## Security Checklist

### Backend Security
- [ ] File size limits enforced (10MB)
- [ ] File type validation (PDF only)
- [ ] Authentication required for uploads
- [ ] Admin-only access for uploads
- [ ] Unique filenames prevent overwriting
- [ ] Rate limiting on upload endpoint
- [ ] Input validation on all fields
- [ ] HTTPS only (no HTTP)
- [ ] CORS properly configured

### File Storage Security
- [ ] Uploads directory outside web root (if local)
- [ ] Proper file permissions (755 for directories, 644 for files)
- [ ] Regular backups of uploads
- [ ] Virus scanning for uploaded files
- [ ] No executable permissions on uploads
- [ ] Content-Type headers set correctly

### Frontend Security
- [ ] Files served with correct MIME types
- [ ] No direct file path exposure
- [ ] Content-Security-Policy headers
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY

---

## Monitoring & Maintenance

### Logging
```javascript
// Add logging to file upload route
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'uploads.log' })
  ]
});

router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  logger.info('File upload attempt', {
    user: req.user.id,
    filename: req.file?.originalname,
    size: req.file?.size,
    timestamp: new Date()
  });
  // ... rest of code
});
```

### Monitoring
- Monitor disk space usage (if local storage)
- Track upload success/failure rates
- Alert on unusual upload patterns
- Monitor S3/Azure costs (if cloud storage)

### Backup Strategy
```bash
# Daily backup script (if local storage)
#!/bin/bash
BACKUP_DIR="/var/backups/rajjobs/uploads"
SOURCE_DIR="/var/www/rajjobs/uploads"
DATE=$(date +%Y%m%d)

# Create backup
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz $SOURCE_DIR

# Delete backups older than 30 days
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +30 -delete
```

### Cleanup Old Files
```javascript
// Schedule cleanup of old files (optional)
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  const uploadsDir = path.join(__dirname, '../../uploads/pdfs');
  const files = await fs.readdir(uploadsDir);
  const now = Date.now();
  const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const stats = await fs.stat(filePath);
    
    if (now - stats.mtimeMs > maxAge) {
      await fs.unlink(filePath);
      console.log(`Deleted old file: ${file}`);
    }
  }
});
```

---

## Performance Optimization

### CDN Integration
- Use CloudFront (AWS) or Azure CDN
- Cache static files at edge locations
- Reduce server bandwidth costs
- Faster global delivery

### Image/PDF Optimization
```bash
# Install Ghostscript for PDF compression
sudo apt install ghostscript

# Compress PDFs before storage
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=output.pdf input.pdf
```

### Lazy Loading
```typescript
// Frontend: Lazy load PDF previews
<object
  data={pdfUrl}
  type="application/pdf"
  loading="lazy"
  width="100%"
  height="600px"
>
  <a href={pdfUrl} target="_blank">View PDF</a>
</object>
```

---

## Troubleshooting

### Issue: Files not accessible after deployment
**Solution**: Check Nginx static file serving, file permissions, and CORS headers

### Issue: Upload fails with 413 error
**Solution**: Increase `client_max_body_size` in Nginx configuration

### Issue: Slow upload speeds
**Solution**: Enable compression, use CDN, optimize network settings

### Issue: Files deleted accidentally
**Solution**: Restore from backups, implement soft delete, add confirmation dialogs

---

## Deployment Commands

```bash
# Production build
cd backend && npm install --production && npm run build
cd web-frontend && npm install --production && npm run build
cd admin-frontend && npm install --production && npm run build

# Start services
pm2 restart all

# Check logs
pm2 logs rajjobs-backend
pm2 logs rajjobs-web
pm2 logs rajjobs-admin

# Monitor
pm2 monit
```

---

## Post-Deployment Checklist

- [ ] All services running (backend, web, admin)
- [ ] SSL certificates installed and working
- [ ] File uploads working from admin panel
- [ ] Files accessible from web frontend
- [ ] Environment variables set correctly
- [ ] Database connected and accessible
- [ ] CORS configured for all domains
- [ ] Monitoring and logging enabled
- [ ] Backups scheduled
- [ ] DNS records pointing to server
- [ ] Firewall rules configured
- [ ] PM2 auto-restart on crash enabled
- [ ] Server reboot persistence configured

---

**Last Updated**: December 25, 2025  
**Status**: Production Ready ✅
