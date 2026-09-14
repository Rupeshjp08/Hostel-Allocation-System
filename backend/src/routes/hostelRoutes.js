const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  createHostel,
  getHostels,
  updateHostel,
  deleteHostel,
} = require('../controllers/hostelController');

const router = express.Router();

router.use(protect);
router.get('/', getHostels);
router.post('/', authorize('warden'), createHostel);
router.put('/:id', authorize('warden'), updateHostel);
router.delete('/:id', authorize('warden'), deleteHostel);

module.exports = router;
