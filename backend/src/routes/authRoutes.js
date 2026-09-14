const express = require('express');
const { registerStudent, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', login);
router.get('/me', protect, getMe);

// Used only to verify that students cannot reach warden-only routes.
router.get('/warden-check', protect, authorize('warden'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Warden access confirmed.',
    data: {
      user: req.user.toSafeObject(),
    },
  });
});

module.exports = router;
