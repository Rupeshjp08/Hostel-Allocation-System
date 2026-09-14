const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  createAllocation,
  getMyAllocation,
  getAllocations,
  cancelAllocation,
} = require('../controllers/allocationController');

const router = express.Router();

router.use(protect);
router.post('/', authorize('warden'), createAllocation);
router.get('/my', authorize('student'), getMyAllocation);
router.get('/', authorize('warden'), getAllocations);
router.put('/:id/cancel', authorize('warden'), cancelAllocation);

module.exports = router;
