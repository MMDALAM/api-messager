const controller = require('../contoller');
const Room = require('../../models/room.model');
const { isValidMongoId } = require('../../utils/function');

class roomController extends controller {
  async findManyRooms(req, res, next) {
    try {
      const { id } = req.params;
      if (!isValidMongoId(id)) return res.status(200).json({ message: 'Not Valid MongoDB' });
      const room = await Room.find({ members: id })
        .populate('members', ['username', 'createdAt'])
        .populate('admin', ['username', 'createdAt'])
        .exec();
      return res.status(200).json({ room: room });
    } catch (err) {
      next(err);
    }
  }

  async deleteRooms(req, res, next) {
    try {
      const { id } = req.params;
      if (!isValidMongoId(id)) return res.status(200).json({ message: 'Not Valid MongoDB' });
      const rooms = await Room.findOneAndDelete({ _id: id });
      if (!rooms) return res.status(404).json({ message: 'Room not found' });
      return res.status(200).json({ message: 'Room Deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new roomController();
