const userModel = require('../../models/user.model');
const { jwtSign, hashPass, comparePass } = require('../../utils/function');
const controller = require('../contoller');
const { authSchema } = require('../../validators/auth.validator');

class authController extends controller {
  async auth(req, res, next) {
    try {
      const { username } = req.body;
      const user = await userModel.findOne({ username });
      if (user) return this.login(req, res, next);
      else return this.register(req, res, next);
    } catch (err) {
      next(err);
    }
  }

  async register(req, res, next) {
    try {
      await authSchema.validateAsync(req.body);
      const { username, password } = req.body;
      const hashPassword = await hashPass(password);
      const NewUser = new userModel({ username, password: hashPassword });
      await NewUser.save();
      const token = await jwtSign(NewUser._id);
      return res.status(201).json({ message: 'User created successfully', token: token });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      await authSchema.validateAsync(req.body);
      const { username, password } = req.body;
      const user = await userModel.findOne({ username });
      if (!user || !(await comparePass(password, user.password))) return res.status(401).json({ message: 'Invalid username or password' });

      const token = await jwtSign(user.id);
      res.json({ message: 'Login successfully', token: token });
    } catch (err) {
      next(err);
    }
  }

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
      return res.status(200).json({ date: 'User Deleted ' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new authController();
