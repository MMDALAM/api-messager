const controller = require('../contoller');

class apiController extends controller {
  async api(req, res, next) {
    try {
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new apiController();
