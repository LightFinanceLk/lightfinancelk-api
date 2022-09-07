const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");
const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.use(checkAuth);

router.get("/:uid", usersController.getUserById);

router.get("/role/:rid", usersController.getUsersByUserRole);

router.get("/:uid/accounts", usersController.getAccountsByUserId);

router.get("/advisors/:uid/meetings", usersController.getMeetingByAdvisorId);

router.get("/:uid/meetings", usersController.getMeetingByUserId);

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

router.patch(
  "/updatePassword/:uid",
  [
    check("currentPassword").not().isEmpty(),
    check("newPassword").not().isEmpty(),
  ],
  usersController.updatePasswordByUserId
);

router.post(
  "/updateProfileImage/:uid",
  fileUpload.single("image"),
  usersController.updateProfileImage
);

module.exports = router;

// TODO from tuto 180, add comments to f()
