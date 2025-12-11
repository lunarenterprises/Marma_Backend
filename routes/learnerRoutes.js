const express = require('express');
const router = express.Router();
const { LearnerAuthenticateToken } = require('../middlewares/auth')

const { RegisterLearner, VerifyOtp, Login } = require('../controllers/learner/login')
router.post('/register', RegisterLearner)
router.post('/verify_otp', VerifyOtp)
router.post('/login', Login)

const { ListAllVideos } = require('../controllers/learner/videos')
router.get('/videos', LearnerAuthenticateToken, ListAllVideos)

const { ListAllQuestions, SubmitQuestions } = require('../controllers/learner/questions')
router.get('/questions', LearnerAuthenticateToken, ListAllQuestions)
router.post('/submit_questions', LearnerAuthenticateToken, SubmitQuestions)

const { EditProfile, DeleteProfile, DeleteProfilePic, GetProfile } = require('../controllers/learner/profile')
router.post('/update_profile', EditProfile)
router.delete('/delete_profile', LearnerAuthenticateToken, DeleteProfile)
router.delete('/delete_profile_picture', LearnerAuthenticateToken, DeleteProfilePic)
router.get('/get_profile', LearnerAuthenticateToken, GetProfile)

const { ListAllNotifications, UpdateNotificationStatus } = require('../controllers/learner/notification')
router.get('/notifications', LearnerAuthenticateToken, ListAllNotifications)
router.post('/update/notification', LearnerAuthenticateToken, UpdateNotificationStatus)

const { GetAnswer } = require('../controllers/learner/chatBot')
router.post('/chatbot', GetAnswer)

const { TestWhatsapp} = require('../controllers/learner/videos')
router.post('/send/whatsapp', TestWhatsapp)


module.exports = router