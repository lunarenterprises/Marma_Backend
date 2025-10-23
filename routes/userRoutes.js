const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth')


const { Register } = require('../controllers/users/register.js');
router.post('/register', Register);

// const { login } = require('../controllers/authController.js');
// router.post('/login', login);

const { LoginOtp } = require('../controllers/users/login.js');
router.post('/login-otp', LoginOtp);

const { verifyOtp } = require('../controllers/users/login.js');
router.post('/verify-otp', verifyOtp);

const { getDashboard } = require('../controllers/userController.js');
router.post('/dashboard', authenticateToken, getDashboard);

const { ListTherapist } = require('../controllers/users/listTherapist.js');
router.post('/list/therapist', ListTherapist);

const { ListCategory } = require('../controllers/admin/addCategory.js');
router.post('/list/category', ListCategory);

const { EditProfile } = require('../controllers/users/editprofile.js');
router.post('/edit/profile', EditProfile);

const { AddBooking } = require('../controllers/users/booking.js');
router.post('/add/booking', AddBooking);

const { ListBooking } = require('../controllers/users/booking.js');
router.post('/list/booking', ListBooking);

const { AddReview } = require('../controllers/users/review.js');
router.post('/add/review', AddReview);

const { UpdateBookingStatus } = require('../controllers/users/booking.js');
router.post('/update/booking-status', authenticateToken, UpdateBookingStatus);

const { GetNotification,MarkNotificationsAsRead } = require('../controllers/users/listnotification.js');
router.post('/list/notification', GetNotification);
router.post('/read/notification', MarkNotificationsAsRead);

const { DeleteMyAccount } = require('../controllers/userController.js')
router.get('/deleteaccount', authenticateToken, DeleteMyAccount)

module.exports = router;
