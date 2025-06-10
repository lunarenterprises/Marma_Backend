const { validateObject } = require('../utils/validator.js');
const { errorResponse } = require('../utils/responseHandler.js');

/**
 * Middleware factory for request validation
 * @param {object} schema - Validation schema for request body
 * @param {object} querySchema - Validation schema for query params (optional)
 * @param {object} paramSchema - Validation schema for route params (optional)
 * @returns {function} - Express middleware
 */
const validateRequest = (schema = {}, querySchema = {}, paramSchema = {}) => {
  return (req, res, next) => {
    // Validate body
    if (Object.keys(schema).length > 0) {
      const { valid, errors } = validateObject(req.body, schema);
      if (!valid) {
        return errorResponse(res, 400, 'Validation failed', errors);
      }
    }

    // Validate query params
    if (Object.keys(querySchema).length > 0) {
      const { valid, errors } = validateObject(req.query, querySchema);
      if (!valid) {
        return errorResponse(res, 400, 'Query validation failed', errors);
      }
    }

    // Validate route params
    if (Object.keys(paramSchema).length > 0) {
      const { valid, errors } = validateObject(req.params, paramSchema);
      if (!valid) {
        return errorResponse(res, 400, 'Parameter validation failed', errors);
      }
    }

    next();
  };
};

// Predefined validation schemas
const validationSchemas = {
  login: {
    email: 'email',
    password: 'password',
  },
  forgotPassword: {
    email: 'email',
  },
  resetPassword: {
    password: 'password',
  },
  userStatus: {
    status: 'alphabetic',
  },
  userIdParam: {
    id: 'numeric',
  },
  userListQuery: {
    page: 'numeric',
    limit: 'numeric',
  },
};

module.exports = {
  validateRequest,
  validationSchemas,
};
