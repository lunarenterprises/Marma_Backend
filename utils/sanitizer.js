const xss = require('xss');

/**
 * Sanitize a string to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return xss(str.trim());
};

/**
 * Sanitize an email address
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  return email.trim().toLowerCase();
};

/**
 * Sanitize an object by sanitizing all string properties
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (typeof value === 'string') {
      if (key.includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.includes('password') || key.includes('token')) {
        // Don't sanitize passwords or tokens to avoid interfering with hashing
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object'
          ? sanitizeObject(item)
          : typeof item === 'string'
            ? sanitizeString(item)
            : item
      );
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizeObject,
};
