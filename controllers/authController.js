const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, Role } = require('../models');
const sendEmail = require('../utils/emailService');
const { emailTemplates } = require('../utils/emailService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { GenerateToken } = require('../utils/generateToken')


// Create admin user if not exists
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      where: {
        [Op.or]: [{ name: 'Admin' }, { email: 'admin@gmail.com' }],
      },
    });

    if (!existingAdmin) {
      let adminRole = await Role.findOne({ where: { name: 'admin' } });

      if (!adminRole) {
        adminRole = await Role.create({
          name: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const adminData = {
        email: 'admin@gmail.com',
        name: 'Admin',
        password: 'Admin@123',
        roleId: adminRole.id,
        status: 'active',
        phone: '1234567890',
        address: 'Default admin address',
        location: 'Head Office',
      };

      console.log("Creating admin user with data:", adminData);

      await User.create(adminData);

      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists!');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};


// Login
const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    await createDefaultAdmin();

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

    let token = await GenerateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleid: user.roleId,
      role: user.Role.name
    })
    console.log("token : ", token);

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
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

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
      console.error('Email sending failed:', emailError);
      await user.update({ resetToken: null, resetTokenExpiry: null });
    }

    return successResponse(
      res,
      200,
      'If your email exists in our system, you will receive reset instructions.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
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
    console.error('Reset password error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Export the functions
module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
