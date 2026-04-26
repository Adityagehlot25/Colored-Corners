const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  // We only encode safe, internal identifiers in the payload
  const payload = {
    id: user.id,
    role: user.role,
    emailStatus: user.emailStatus
  };

  // Sign the token with a secret and set an expiration
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = { generateToken };