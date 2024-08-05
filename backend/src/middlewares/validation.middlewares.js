import { body, validationResult } from 'express-validator';
import { apiError } from '../utils/apiError.js';

// Validation middleware for register

const registerValidationRules = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  body('email')
    .isEmail()
    .withMessage('Invalid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
];

// Validation middleware for login
const loginValidationRules = [
    body('email')
      .isEmail()
      .withMessage('Invalid email address'),
  
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
  ];
  
  // Middleware to handle validation results
  const validate = (req, res, next) => {
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
          throw  new apiError( 400, "Input Validation Failed", errors.array())
          
        }
        next();
    } catch (error) {
        next(error)
    }
  };
  
  export { registerValidationRules, loginValidationRules, validate };
