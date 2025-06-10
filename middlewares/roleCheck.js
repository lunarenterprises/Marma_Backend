const { errorResponse } = require('../utils/responseHandler.js');

/**
 * Middleware factory for role-based access control with enhanced debugging
 * @param {Array} allowedRoles - Array of allowed role names
 * @returns {function} - Express middleware
 */
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 403, 'Access denied. User not authenticated.');
    }

    if (!req.user.Role) {
      console.error('Role check failed: Role information is missing', {
        userHasRoleId: !!req.user.roleId,
        roleIdValue: req.user.roleId,
      });

      return errorResponse(res, 403, 'Access denied. User role not found.');
    }

    if (allowedRoles.includes(req.user.Role.name)) {
      next();
    } else {
      return errorResponse(res, 403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }
  };
};

// Predefined role check middlewares
const isAdmin = checkRole(['admin']);
const isTherapist = checkRole(['therapist']);
const isLearner = checkRole(['learner']);
const isUser = checkRole(['user']);
const isAdminOrTherapist = checkRole(['admin', 'therapist']);

module.exports = {
  checkRole,
  isAdmin,
  isTherapist,
  isLearner,
  isUser,
  isAdminOrTherapist,
};
