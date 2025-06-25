var express = require('express')

const userRoutes = require('./admin/userRoutes.js');
const therapistRoutes = require('./admin/therapistRoutes.js');
const bookingRoutes = require('./admin/bookingRoutes.js');
const videoRoutes = require('./admin/videoRoutes.js');
const otpRoutes = require('./admin/otpRoutes.js');
const { authenticateToken } = require('../middlewares/auth.js');

const { getDashboard } = require('../controllers/adminController.js');

const router = express.Router();

// Dashboard
router.get('/dashboard', getDashboard);

// Modular Routes
router.use('/users', userRoutes);
router.use('/therapists', therapistRoutes);
router.use('/bookings', bookingRoutes);
router.use('/learner', videoRoutes);
router.use('/otp', otpRoutes);

const { AddCategory } = require('../controllers/admin/addCategory.js');
router.post('/add/category', AddCategory);

const { EditCategory } = require('../controllers/admin/addCategory.js');
router.post('/edit/category', EditCategory);

const { ListUSer } = require('../controllers/admin/listUsers.js');
router.post('/list/user', ListUSer);

const { UploadQuestions } = require('../controllers/admin/addQuestions.js')
router.post('/upload_question', UploadQuestions)

const { WithdrawRequestApprovel } = require('../controllers/therapist/withdrawRequest.js');
router.post('/approve/withdraw-request', authenticateToken, WithdrawRequestApprovel);


module.exports = router;
