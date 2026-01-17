const express = require('express');
const { login, forgotPassword, resetPassword } = require('../controllers/authController.js');
const { validateRequest, validationSchemas } = require('../middlewares/validation.js');

const router = express.Router();

// Auth Routes
router.post('/login', validateRequest(validationSchemas.login), login);
router.post('/forgot-password', validateRequest(validationSchemas.forgotPassword), forgotPassword);
router.post('/reset-password/:token', validateRequest(validationSchemas.resetPassword), resetPassword);

module.exports = router;
