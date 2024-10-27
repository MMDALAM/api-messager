const userModel = require('../../models/user.model');
const controller = require('../contoller');

class userController extends controller {
  async findMany(req, res, next) {
    try {
      const users = await userModel.find({}, { __v: 0, createdAt: 0, updatedAt: 0, role: 0, password: 0 });
      if (!users) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json({ users: users });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'Invalid user ID' });
      const users = await userModel.findOneAndDelete({ _id: id });
      if (!users) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json({ message: 'User Deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new userController();
