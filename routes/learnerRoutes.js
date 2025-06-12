const express = require('express');
const router = express.Router();
const { LearnerAuthenticateToken } = require('../middlewares/auth')

const { RegisterLearner, VerifyOtp, Login } = require('../controllers/learner/login')
router.post('/register', RegisterLearner)
router.post('/verify_otp', VerifyOtp)
router.post('/login', Login)

const { ListAllVideos } = require('../controllers/learner/videos')
router.get('/videos', LearnerAuthenticateToken, ListAllVideos)

const { ListAllQuestions } = require('../controllers/learner/questions')
router.get('/questions', LearnerAuthenticateToken, ListAllQuestions)

const { EditProfile, DeleteProfile, DeleteProfilePic } = require('../controllers/learner/profile')
router.post('/update_profile', LearnerAuthenticateToken, EditProfile)
router.post('/delete_profile', LearnerAuthenticateToken, DeleteProfile)
router.post('/delete_profile_picture', LearnerAuthenticateToken, DeleteProfilePic)

module.exports = router