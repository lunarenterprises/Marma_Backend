const { Op } = require('sequelize');
const { User, Role, OtpLog, Therapist } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Dashboard API
const getDashboard = async (req, res) => {
  try {
    const adminRole = await Role.findOne({ where: { name: 'admin' } });

    const totalUsers = await User.count({
      where: adminRole ? { roleId: { [Op.ne]: adminRole.id } } : {},
    });

    const therapistRole = await Role.findOne({ where: { name: 'therapist' } });
    const therapistsCount = therapistRole
      ? await User.count({ where: { roleId: therapistRole.id } })
      : 0;

    let bookingsThisMonth = 0;
    try {
      if (typeof Booking !== 'undefined') {
        bookingsThisMonth = await Booking.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        });
      }
    } catch (err) {
      console.error('Error counting bookings:', err);
    }

    let completedSessions = 0;
    try {
      if (typeof Session !== 'undefined') {
        completedSessions = await Session.count({
          where: {
            status: 'completed',
            createdAt: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        });
      }
    } catch (err) {
      console.error('Error counting sessions:', err);
    }

    return successResponse(res, 200, 'Dashboard data retrieved successfully', {
      totalUsers,
      therapistsCount,
      bookingsThisMonth,
      completedSessions,
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// User List API
const getUserList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const includeClause = {
      model: Role,
      attributes: ['id', 'name'],
      where: { name: role || 'user' }
    };


    const allowedSortFields = [
      'id',
      'name',
      'email',
      'status',
      'createdAt',
      'updatedAt',
      'lastLogin',
    ];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder : 'DESC';

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[validSortBy, validSortOrder]],
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
    });

    return successResponse(res, 200, 'Users retrieved successfully', {
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      users,
    });
  } catch (error) {
    console.error('User list error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Change User Status API
const changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return errorResponse(res, 400, 'Invalid status. Status must be active or inactive.');
    }

    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.id === req.user.id) {
      return errorResponse(res, 403, 'You cannot change your own status');
    }

    await user.update({ status });

    return successResponse(res, 200, `User status changed to ${status} successfully`, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Change user status error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// Delete User API
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.id === req.user.id) {
      return errorResponse(res, 403, 'You cannot delete your own account');
    }

    await user.destroy();

    return successResponse(res, 200, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

// OTP Logs API
const getOtpLogs = async (req, res) => {
  try {
    const { search, filter, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    const statusValues = ['Pending', 'Verified', 'Expired', 'Failed'];
    const purposeValues = ['Booking', 'Registration', 'Login'];

    if (filter) {
      if (statusValues.includes(filter)) {
        whereClause.status = filter;
      } else if (purposeValues.includes(filter)) {
        whereClause.purpose = filter;
      }
    }

    if (search) {
      whereClause[Op.or] = [
        { phone: { [Op.like]: `%${search}%` } },
        { purpose: { [Op.like]: `%${search}%` } },
        { '$user.name$': { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await OtpLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: Therapist,
          as: 'therapist',
          attributes: ['id', 'name'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, 200, 'OTP logs fetched', {
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      otpLogs: rows.map((log) => ({
        id: log.id,
        phone: log.phone,
        user: log.user ? log.user.name : 'N/A',
        purpose: log.purpose,
        status: log.status,
        createdAt: log.createdAt,
        verifiedAt: log.verifiedAt,
      })),
    });
  } catch (error) {
    console.error('OTP log fetch error:', error);
    return errorResponse(res, 500, 'Failed to fetch OTP logs');
  }
};

// OTP Stats API
const getOtpStats = async (req, res) => {
  try {
    const total = await OtpLog.count();
    const verified = await OtpLog.count({ where: { status: 'Verified' } });
    const expired = await OtpLog.count({ where: { status: 'Expired' } });
    const failed = await OtpLog.count({ where: { status: 'Failed' } });

    return successResponse(res, 200, 'OTP statistics fetched successfully', {
      total,
      verified,
      expired,
      failed,
    });
  } catch (err) {
    console.error('OTP stats error:', err);
    return errorResponse(res, 500, 'Failed to fetch OTP statistics');
  }
};

module.exports = {
  getDashboard,
  getUserList,
  changeUserStatus,
  deleteUser,
  getOtpLogs,
  getOtpStats,
};
