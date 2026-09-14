const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  createApplication,
  getMyApplications,
  getApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  cancelApplication,
} = require('../controllers/applicationController');

const router = express.Router();

router.use(protect);
router.post('/', authorize('student'), createApplication);
router.get('/my', authorize('student'), getMyApplications);
router.get('/', authorize('warden'), getApplications);
router.get('/:id', getApplicationById);
router.put('/:id/approve', authorize('warden'), approveApplication);
router.put('/:id/reject', authorize('warden'), rejectApplication);
router.put('/:id/cancel', authorize('student'), cancelApplication);

module.exports = router;
