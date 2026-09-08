import { body } from "express-validator";

// Validation checks for registering the user
export const registerValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 8, max: 50 })
    .withMessage("Username must be between 8 and 50 characters"),

  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(?:\+977[- ]?)?(?:98|97)\d{8}$/)
    .withMessage("Please enter a valid Nepal phone number"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("confirm_password")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }

      return true;
    }),
];


// Validation checks for logging in the user
export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];