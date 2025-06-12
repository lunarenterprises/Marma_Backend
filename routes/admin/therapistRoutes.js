const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  addTherapist,
  getTherapists,
  getTherapistById,
  updateTherapist,
  deleteTherapist,
  updateTherapistStatus,
  getTherapistStats,
} = require('../../controllers/therapistController.js');
const {authenticateToken} = require('../../middlewares/auth.js');
const { isAdmin } = require('../../middlewares/roleCheck.js');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith('video/')
      ? 'uploads/learnerVideos/'
      : 'uploads/therapists/';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post('/', authenticateToken, isAdmin, upload.single('file'), addTherapist);
router.get('/', getTherapists);
router.get('/stats', getTherapistStats);
router.get('/:id', getTherapistById);
router.put('/:id', authenticateToken, isAdmin, upload.single('file'), updateTherapist);
router.delete('/:id', authenticateToken, isAdmin, deleteTherapist);
router.patch('/:id/status', authenticateToken, isAdmin, updateTherapistStatus);

module.exports = router;
