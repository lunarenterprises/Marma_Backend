const express = require('express');
const router = express.Router();

const { RegisterLearner, VerifyOtp, Login } = require('../controllers/learner/login')
router.post('/register', RegisterLearner)
router.post('/verify_otp', VerifyOtp)
router.post('/login', Login)



module.exports = router