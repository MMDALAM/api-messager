const { cache } = require('joi');
const userModel = require('../../models/user.model');
const { jwtSign, hashPass, comparePass } = require('../../utils/function');
const controller = require('../contoller');

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
      const { username, password } = req.body;
      const user = await userModel.findOne({ username });
      if (!user || !(await comparePass(password, user.password))) return res.status(401).json({ message: 'Invalid username or password' });

      const token = await jwtSign(user.id);
      res.json({ message: 'Login successfully', token: token });
    } catch (err) {
      next(err);
    }
  }

  async verify(req, res, next) {
    try {
      return res.status(200).json({ message: 'Token is valid' });
    } catch (err) {
      next(err);
    }
  }
  async findOne(req, res, next) {
    try {
      const user = await userModel.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json({ user: user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new authController();
