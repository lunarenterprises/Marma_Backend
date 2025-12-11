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

const { ListLearners } = require('../controllers/admin/listLearner.js');
router.post('/list/learners', ListLearners);

const { UploadQuestions } = require('../controllers/admin/addQuestions.js')
router.post('/upload_question', UploadQuestions)

const { WithdrawRequestApprovel,GetWithdrawRequests } = require('../controllers/therapist/withdrawRequest.js');
router.post('/approve/withdraw-request', authenticateToken, WithdrawRequestApprovel);
router.post('/list/withdraw-request', GetWithdrawRequests);

const { AddDoctor } = require('../controllers/admin/doctors.js');
router.post('/add/doctor', authenticateToken, AddDoctor);

const { EditDoctor } = require('../controllers/admin/doctors.js');
router.post('/edit/doctor', authenticateToken, EditDoctor);

const { ListDoctor } = require('../controllers/admin/doctors.js');
router.post('/list/doctor', ListDoctor);

const { DeleteDoctor } = require('../controllers/admin/doctors.js');
router.post('/delete/doctor', authenticateToken, DeleteDoctor);

const { PromoteLearner,ApproveLearner } = require('../controllers/admin/promoteLearner.js');
router.post('/promote/learner', authenticateToken, PromoteLearner);
router.post('/approve/learner', authenticateToken, ApproveLearner);


const { DeleteSection } = require('../controllers/admin/deleteSection.js')
router.post('/delete/section', authenticateToken, DeleteSection)

const { Dasboard } = require('../controllers/admin/dashboard.js')
router.post('/dashboard', authenticateToken, Dasboard)

const { AddGallery } = require('../controllers/admin/Gallery.js')
router.post('/add/gallery', AddGallery)

const { listGallery } = require('../controllers/admin/Gallery.js')
router.post('/list/gallery', listGallery)

const { DeleteGallery } = require('../controllers/admin/Gallery.js')
router.post('/delete/gallery', DeleteGallery)

const { addTherapist } = require('../controllers/admin/addTherapist.js')
router.post('/add/therapist',authenticateToken, addTherapist)

const { AddLearner } = require('../controllers/admin/addLearners.js')
router.post('/add/learner',authenticateToken, AddLearner)

const { ListTherapist } = require('../controllers/admin/listTherapist.js')
router.post('/list/therapist', ListTherapist)

const { EditProfile, DeleteProfile, DeleteProfilePic } = require('../controllers/learner/profile')
router.post('/update_profile',authenticateToken, EditProfile)
router.delete('/delete_profile', authenticateToken, DeleteProfile)
router.delete('/delete_profile_picture', authenticateToken, DeleteProfilePic)

const { AddPriceDetails, ListPriceDetails, EditPriceDetails, DeletePriceDetails } = require('../controllers/admin/price.js')
router.post('/add/price-details', AddPriceDetails)
router.post('/list/price-details', ListPriceDetails)
router.post('/edit/price-details', EditPriceDetails)
router.post('/delete/price-details', DeletePriceDetails)

const { ListWalletHistory } = require('../controllers/admin/wallethistory.js')
router.post('/list/wallet-history', ListWalletHistory)

const { AddTestimonial,listTestimonial,EditTestimonial,DeleteTestimonial } = require('../controllers/admin/testimonial.js')
router.post('/add/testimonial', AddTestimonial)
router.post('/list/testimonial', listTestimonial)
router.post('/edit/testimonial', EditTestimonial)
router.post('/delete/testimonial', DeleteTestimonial)

module.exports = router;
