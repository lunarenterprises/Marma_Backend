const express = require('express');
const {
  getBookingStats,
  getBookingList,
  getBookingById,
  changeBookingStatus,
  cancelBooking,
} = require('../../controllers/bookingController.js');

const authenticateToken = require('../../middlewares/auth.js');
const { isAdmin } = require('../../middlewares/roleCheck.js');

const router = express.Router();

router.get('/stats', getBookingStats);
router.get('/', getBookingList);
router.get('/:id', getBookingById);
router.patch('/:id/status', authenticateToken, isAdmin, changeBookingStatus);
router.patch('/:id/cancel', authenticateToken, isAdmin, cancelBooking);

module.exports = router;
