const crypto = require('crypto');

function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

console.log('JWT_ACCESS_SECRET=' + generateSecret());
console.log('JWT_REFRESH_SECRET=' + generateSecret());