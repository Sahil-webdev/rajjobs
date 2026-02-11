const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function hashRefreshToken(token) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}

async function compareHash(token, hash) {
  return bcrypt.compare(token, hash);
}

module.exports = { hashPassword, hashRefreshToken, compareHash };
