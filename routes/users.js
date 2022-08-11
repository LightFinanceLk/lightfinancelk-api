const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);

router.get("/:uid", usersController.getUserById);

router.patch(
  "/:uid",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("dob").not().isEmpty(),
    check("gender").not().isEmpty(),
    check("maritalStatus").not().isEmpty(),
    check("occupation").not().isEmpty(),
    check("phone").not().isEmpty(),
  ],
  usersController.updateUserById
);

router.delete("/:uid", usersController.deleteUserById);

router.post(
  "/resetPassword",
  [check("email").not().isEmpty()],
  usersController.resetPassword
);

router.patch(
  "/updatePassword/:uid",
  [
    check("currentPassword").not().isEmpty(),
    check("newPassword").not().isEmpty(),
  ],
  usersController.updatePasswordByUserId
);

module.exports = router;

// TODO from tuto 180, add comments to f()
