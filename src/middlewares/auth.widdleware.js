const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const userModel = require('../models/user.model');

function tokens(headers) {
  const token = headers['authorization'].split(' ')[1] || [];
  if (!token) return createError(401, 'Access denied. No token provided.');
  return token;
}
exports.verifyUser = async (req, res, next) => {
  try {
    const token = tokens(req?.headers);
    JWT.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_USER, async (err, paylod) => {
      if (err) return res.status(403).json({ error: 'Invalid token.' });
      const user = await userModel.findById(paylod.id, { __v: 0, updatedAt: 0 });
      if (!user) return res.status(403).json({ error: 'Invalid token.' });
      if (user.token === token) return res.status(200).json({ message: 'Token is valid', user: user });
      return res.status(403).json({ error: 'Token is not match' });
    });
  } catch (err) {
    next(err);
  }
};
exports.verify = async (req, res, next) => {
  try {
    const token = tokens(req?.headers);
    JWT.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_USER, async (err, paylod) => {
      if (err) return res.status(403).json({ error: 'Invalid token.' });
      const user = await userModel.findById(paylod.id, { __v: 0, updatedAt: 0 });
      if (!user) return res.status(403).json({ error: 'Not fund user.' });
      if (user.token === token) next();
      else return res.status(403).json({ error: 'Token is not match' });
    });
  } catch (err) {
    next(err);
  }
};
