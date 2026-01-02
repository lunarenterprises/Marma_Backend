const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, Role } = require('../models');
const sendEmail = require('../utils/emailService');
const { emailTemplates } = require('../utils/emailService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { GenerateToken } = require('../utils/generateToken')
const logger = require('../utils/logger');

// Login
const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;


    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailOrUsername }],
      },
      include: Role,
    });

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (user.status !== 'active') {
      return errorResponse(res, 403, 'Account is inactive. Please contact administrator.');
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    await user.update({ lastLogin: new Date() });

    const token = await GenerateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleid: user.roleId,
      role: user.Role.name
    });

    return successResponse(res, 200, 'Login successful', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role?.name,
      },
      token,
    });
  } catch (error) {
    logger.error(error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return successResponse(
        res,
        200,
        'If your email exists in our system, you will receive reset instructions.'
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 300000); // 5 min expiry

    await user.update({ resetToken, resetTokenExpiry });

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : `${req.protocol}://${req.get('host')}`;

    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: emailTemplates.resetPassword(resetUrl, user.name),
      });
    } catch (emailError) {
      logger.error(emailError);
      await user.update({ resetToken: null, resetTokenExpiry: null });
    }

    return successResponse(
      res,
      200,
      'If your email exists in our system, you will receive reset instructions.'
    );
  } catch (error) {
    logger.error(error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired token');
    }

    await user.update({
      password,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return successResponse(res, 200, 'Password reset successful');
  } catch (error) {
    logger.error(error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Export the functions
module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
