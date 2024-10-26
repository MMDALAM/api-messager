const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
function jwtSign(id) {
  return new Promise(async (resolve, reject) => {
    JWT.sign({ id: id }, process.env.JWT_ACCESS_TOKEN_SECRET_USER, { expiresIn: '7d' }, (err, token) => {
      if (err) reject(err.message);
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
