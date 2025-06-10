const express = require('express');
const router = express.Router();

const { ApproveTherapiRequest } = require('../controllers/therapist/approveTherapiRequest');
router.post('/approve/therapist', ApproveTherapiRequest);


module.exports=router