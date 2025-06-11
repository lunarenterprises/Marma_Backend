const express = require('express');
const router = express.Router();
const AuthToken = require('../middlewares/auth')

const { RegisterLearner, VerifyOtp, Login } = require('../controllers/learner/login')
router.post('/register', RegisterLearner)
router.post('/verify_otp', VerifyOtp)
router.post('/login', Login)

const { ListAllVideos } = require('../controllers/learner/videos')
router.get('/videos', AuthToken, ListAllVideos)

const { ListAllQuestions } = require('../controllers/learner/questions')
router.get('/questions', AuthToken, ListAllQuestions)

module.exports = router