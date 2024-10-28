const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
function jwtSign(id) {
  return new Promise(async (resolve, reject) => {
    const user = await userModel.findById(id);
    JWT.sign({ id: id }, process.env.JWT_ACCESS_TOKEN_SECRET_USER, { expiresIn: '10m' }, async (err, token) => {
      if (err) reject(err.message);
      user.token = token;
      await user.save();
      resolve(token);
    });
  });
}

async function hashPass(password) {
  const hashpassword = await bcrypt.hashSync(password, 10);
  return hashpassword;
}

async function comparePass(password, hash) {
  return await bcrypt.compareSync(password, hash);
}

module.exports = { jwtSign, hashPass, comparePass };
