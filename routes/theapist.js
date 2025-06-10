const express = require('express');
const router = express.Router();

const { ApproveTherapiRequest } = require('../controllers/therapist/approveTherapiRequest');
router.post('/approve/therapist', ApproveTherapiRequest);

const { GetNotification } = require('../controllers/therapist/listnotification');
router.post('/list/notification', GetNotification);


module.exports=router