const Joi = require('joi');

const authSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Username cannot be less than 3 characters',
    'string.max': 'Username cannot be more than 50 characters',
    'string.empty': 'Username cannot be empty',
  }),
  password: Joi.string().min(5).max(20).required().messages({
    'string.min': 'Password cannot be less than 5 characters',
    'string.max': 'Password cannot be more than 20 characters',
    'string.empty': 'Password cannot be empty',
  }),
});

module.exports = {
  authSchema,
};
