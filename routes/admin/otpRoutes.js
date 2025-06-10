const express = require('express');
const { getOtpLogs, getOtpStats } = require('../../controllers/adminController.js');

const router = express.Router();

router.get('/logs', getOtpLogs);
router.get('/stats', getOtpStats);

module.exports = router;
