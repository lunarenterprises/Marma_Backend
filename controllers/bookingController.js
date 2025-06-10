const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseHandler.js');
const { Booking, User, Therapist } = require('../models/index.js');

// Booking Statistics
exports.getBookingStats = async (req, res) => {
  try {
    const total = await Booking.count();

    const [upcoming, ongoing, completed, cancelled] = await Promise.all([
      Booking.count({ where: { status: 'Upcoming' } }),
      Booking.count({ where: { status: 'Ongoing' } }),
      Booking.count({ where: { status: 'Completed' } }),
      Booking.count({ where: { status: 'Cancelled' } }),
    ]);

    const stats = {
      all: total,
      upcoming,
      ongoing,
      completed,
      cancelled,
    };

    return successResponse(res, 200, 'Booking statistics fetched', stats);
  } catch (err) {
    console.error('Booking stats error:', err);
    return errorResponse(res, 500, 'Failed to fetch booking statistics');
  }
};

// Booking List with User & Therapist Info
exports.getBookingList = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { service: { [Op.like]: `%${search}%` } },
        { paymentStatus: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Booking.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Therapist,
          as: 'therapist',
          attributes: ['id', 'name', 'email', 'specialization'],
        },
      ],
    });

    return successResponse(res, 200, 'Bookings fetched', {
      total: count,
      bookings: rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error('Booking list error:', err);
    return errorResponse(res, 500, 'Failed to fetch bookings');
  }
};

// View Individual Booking with User & Therapist
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Therapist,
          as: 'therapist',
          attributes: ['id', 'name', 'email', 'specialization'],
        },
      ],
    });

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    return successResponse(res, 200, 'Booking details fetched', booking);
  } catch (err) {
    console.error('Fetch booking error:', err);
    return errorResponse(res, 500, 'Error fetching booking');
  }
};

// Change Booking Status
exports.changeBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Upcoming', 'Ongoing', 'Completed'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, 'Invalid status');
    }

    const booking = await Booking.findByPk(id);
    if (!booking) return errorResponse(res, 404, 'Booking not found');

    booking.status = status;
    await booking.save();

    return successResponse(res, 200, 'Booking status updated', booking);
  } catch (err) {
    console.error('Booking status error:', err);
    return errorResponse(res, 500, 'Error updating status');
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);
    if (!booking) return errorResponse(res, 404, 'Booking not found');

    booking.status = 'Cancelled';
    await booking.save();

    return successResponse(res, 200, 'Booking cancelled');
  } catch (err) {
    console.error('Cancel booking error:', err);
    return errorResponse(res, 500, 'Error cancelling booking');
  }
};
