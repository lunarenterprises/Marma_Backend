const express = require('express');
const router = express.Router();

const { LearnerAuthenticateToken } = require('../middlewares/auth')

const { ApproveTherapiRequest } = require('../controllers/therapist/approveTherapiRequest');
router.post('/approve/therapist', ApproveTherapiRequest);

const { GetNotification } = require('../controllers/therapist/listnotification');
router.post('/list/notification', GetNotification);

const { CreateBank, EditBank, GetBank } = require('../controllers/therapist/bank')
router.post('/bank/create', LearnerAuthenticateToken, CreateBank)
router.post('/bank/edit', LearnerAuthenticateToken, EditBank)
router.get('/bank', LearnerAuthenticateToken, GetBank)


module.exports = router