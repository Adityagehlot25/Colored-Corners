const xss = require('xss');

/**
 * Recursively sanitizes strings, arrays, and nested objects
 */
const sanitize = (data) => {
  if (typeof data === 'string') return xss(data);
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) return data.map(sanitize);
    const cleaned = {};
    for (const key in data) {
      cleaned[key] = sanitize(data[key]);
    }
    return cleaned;
  }
  return data;
};

const customXss = () => (req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);

  // THE FIX: We mutate the properties *inside* req.query, 
  // rather than trying to overwrite the read-only object itself!
  if (req.query) {
    const cleanedQuery = sanitize(req.query);
    for (const key in cleanedQuery) {
      req.query[key] = cleanedQuery[key];
    }
  }

  next();
};

module.exports = customXss;