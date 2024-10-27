const Joi = require('joi');

const authSchema = Joi.object({
  username: Joi.string().min(5).max(30).required().messages({
    'string.min': 'نام کاربری نمیتواند کمتر از 5 کاراکتر باشد',
    'string.max': 'نام کاربری نمیتواند بیشتر از 30 کاراکتر باشد',
    'string.empty': 'رمزعبور نمیتواند خالی باشد ',
  }),
  password: Joi.string().min(5).max(20).required().messages({
    'string.min': 'رمز عبور نمیتواند کمتر از 5 کاراکتر باشد',
    'string.max': 'رمز عبور نمیتواند بیشتر از 20 کاراکتر باشد',
    'string.empty': 'رمزعبور نمیتواند خالی باشد ',
  }),
});

module.exports = {
  authSchema,
};
