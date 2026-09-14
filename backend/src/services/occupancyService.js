const Allocation = require('../models/Allocation');

const getOccupiedCount = async (roomId) => {
  return Allocation.countDocuments({
    room: roomId,
    status: 'Active',
  });
};

const getOccupiedBedNumbers = async (roomId) => {
  const allocations = await Allocation.find({
    room: roomId,
    status: 'Active',
  })
    .select('bedNumber')
    .lean();

  return allocations.map((item) => item.bedNumber).sort((a, b) => a - b);
};

const getAvailableBedNumbers = async (room) => {
  const occupied = await getOccupiedBedNumbers(room._id);
  const allBeds = Array.from({ length: room.capacity }, (_, index) => index + 1);
  return allBeds.filter((bed) => !occupied.includes(bed));
};

const withOccupancy = async (room) => {
  const occupiedBeds = await getOccupiedCount(room._id);
  const availableBeds = Math.max(room.capacity - occupiedBeds, 0);
  const roomObject = room.toObject ? room.toObject() : room;

  return {
    ...roomObject,
    occupiedBeds,
    availableBeds,
    availabilityStatus: availableBeds > 0 ? 'Available' : 'Full',
  };
};

const withOccupancyList = async (rooms) => {
  return Promise.all(rooms.map((room) => withOccupancy(room)));
};

module.exports = {
  getOccupiedCount,
  getOccupiedBedNumbers,
  getAvailableBedNumbers,
  withOccupancy,
  withOccupancyList,
};
