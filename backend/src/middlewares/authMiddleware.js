const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes. 
 * Checks for a valid JWT in the Authorization header.
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route. Please log in.' });
    }

    // 2. Verify the token payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists in the database (they weren't deleted after token was issued)
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
    }

    // 4. Attach the user object to the request so subsequent controllers can use it
    req.user = currentUser;
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC).
 * Must be used AFTER the `protect` middleware.
 */
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by the `protect` middleware
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not authorized to perform this action.` 
      });
    }
    next();
  };
};