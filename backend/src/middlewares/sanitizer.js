// Custom sanitization middleware to remove NoSQL injection characters
// Recursively removes $ and . from object keys

const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Remove $ and . from keys
      const cleanKey = key.replace(/[\.$]/g, '');
      sanitized[cleanKey] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

module.exports = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};
