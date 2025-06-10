const express = require('express');
const authenticateToken = require('../../middlewares/auth.js');
const { isAdmin } = require('../../middlewares/roleCheck.js');
const {
  getUserList,
  changeUserStatus,
  deleteUser,
} = require('../../controllers/adminController.js');

const router = express.Router();

router.get('/', getUserList);
router.patch('/:id/status', authenticateToken, isAdmin, changeUserStatus);
router.delete('/:id', authenticateToken, isAdmin, deleteUser);

module.exports = router;
