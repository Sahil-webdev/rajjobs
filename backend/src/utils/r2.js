const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const requiredVariables = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_ENDPOINT',
  'R2_PUBLIC_URL',
];

const missingVariables = requiredVariables.filter((name) => {
  const value = (process.env[name] || '').trim();
  return !value || /^your_r2_/i.test(value) || /^<.*>$/.test(value);
});
const isR2Configured = missingVariables.length === 0;

const client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      // R2 endpoints are account-scoped. Keep the bucket in the request path
      // (`/<bucket>/<key>`) instead of creating a virtual-host bucket subdomain.
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

const publicBaseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

function safeFolder(folder = 'images') {
  const normalized = String(folder)
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '');

  return normalized || 'images';
}

function safeFilename(filename = 'file') {
  const extension = path.extname(filename).toLowerCase().replace(/[^.a-z0-9]/g, '');
  const basename = path.basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'file';

  return `${basename}${extension}`;
}

function keyFor(folder, originalName) {
  return `${safeFolder(folder)}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeFilename(originalName)}`;
}

async function uploadBuffer({ buffer, originalName, contentType, folder = 'images' }) {
  if (!isR2Configured) {
    throw new Error(`R2 is not configured. Missing: ${missingVariables.join(', ')}`);
  }

  const key = keyFor(folder, originalName);
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType || 'application/octet-stream',
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  return {
    key,
    url: `${publicBaseUrl}/${key}`,
  };
}

function isR2PublicUrl(url) {
  return Boolean(publicBaseUrl && typeof url === 'string' && url.startsWith(`${publicBaseUrl}/`));
}

async function deleteByPublicUrl(url) {
  if (!isR2Configured || !isR2PublicUrl(url)) return false;
  const key = decodeURIComponent(url.slice(publicBaseUrl.length + 1));
  await client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
  return true;
}

function dataUrlToFile(dataUrl, fallbackName = 'image') {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl || '');
  if (!match) return null;
  const contentType = match[1].toLowerCase();
  if (!contentType.startsWith('image/')) return null;
  const subtype = contentType.split('/')[1].replace(/[^a-z0-9]/g, '') || 'png';
  return {
    buffer: Buffer.from(match[2], 'base64'),
    contentType,
    originalName: `${fallbackName}.${subtype}`,
  };
}

module.exports = {
  dataUrlToFile,
  deleteByPublicUrl,
  isR2Configured,
  isR2PublicUrl,
  missingVariables,
  uploadBuffer,
};
