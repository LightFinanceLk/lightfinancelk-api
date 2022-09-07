const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");

const router = express.Router();

router.post(
  "/signup",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("dob").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("gender").not().isEmpty(),
    check("maritalStatus").not().isEmpty(),
    check("occupation").not().isEmpty(),
    check("phone").not().isEmpty(),
    check("initPassword").not().isEmpty(),
  ],
  usersController.signup
);

router.post(
  "/login",
  [
    check("email").not().isEmpty(),
    check("password").isLength({ min: 6 }).not().isEmpty(),
  ],
  usersController.login
);

router.post(
  "/resetPassword",
  [check("email").not().isEmpty()],
  usersController.resetPassword
);

module.exports = router;
