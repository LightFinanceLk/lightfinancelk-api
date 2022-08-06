const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");
const checkAuth = require("../middleware/check-auth");
// const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  // fileUpload.single("image"),
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("dob").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("gender").not().isEmpty(),
    check("maritalStatus").not().isEmpty(),
    check("occupation").not().isEmpty(),
    check("phone").not().isEmpty(),
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

// router.use(checkAuth);

// router.patch(
//   "/:uid",
//   [
//     check("name").notEmpty(),
//     check("password").notEmpty(),
//     check("image").notEmpty(),
//   ],
//   usersControllers.updateUser
// );

// router.delete("/:uid", usersControllers.deleteUser);

module.exports = router;

// TODO from tuto 180, add comments to f()
