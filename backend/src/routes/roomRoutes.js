const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');

const router = express.Router();

router.use(protect);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', authorize('warden'), createRoom);
router.put('/:id', authorize('warden'), updateRoom);
router.delete('/:id', authorize('warden'), deleteRoom);

module.exports = router;
