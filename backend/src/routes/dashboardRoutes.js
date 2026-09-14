const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getStudentDashboard,
  getWardenDashboard,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);
router.get('/student', authorize('student'), getStudentDashboard);
router.get('/warden', authorize('warden'), getWardenDashboard);

module.exports = router;
