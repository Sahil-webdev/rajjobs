const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function verifyAccessToken(req, res, next) {
  const auth = req.headers.authorization;
  console.log('🔐 Authorization header:', auth ? 'Present' : 'Missing');
  
  if (!auth) return res.status(401).json({ message: 'No token' });
  
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('❌ Invalid token format:', auth);
    return res.status(401).json({ message: 'Invalid token format' });
  }
  
  const token = parts[1];
  console.log('🎫 Token received (first 20 chars):', token.substring(0, 20) + '...');

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('✅ Token verified for admin:', payload.email);
    req.admin = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
}

async function attachAdmin(req, res, next) {
  if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });
  const admin = await Admin.findById(req.admin.id).select('-password -refreshTokenHash');
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  req.admin = { id: admin._id, email: admin.email, name: admin.name, role: admin.role };
  next();
}

function requireAdmin(req, res, next) {
  console.log('🔒 Checking admin role...', req.admin);
  
  if (!req.admin) {
    console.log('❌ No admin object found');
    return res.status(403).json({ message: 'Forbidden - Not authenticated' });
  }
  
  // Accept both 'admin' and 'super_admin' roles, default to admin if role is missing
  const role = req.admin.role || 'admin';
  console.log('👤 Admin role:', role);
  
  if (role !== 'admin' && role !== 'super_admin') {
    console.log('❌ Invalid role:', role);
    return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
  }
  
  console.log('✅ Admin role verified');
  next();
}

module.exports = { verifyAccessToken, attachAdmin, requireAdmin };
