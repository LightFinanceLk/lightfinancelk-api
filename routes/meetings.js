const express = require("express");
const { check } = require("express-validator");

const meetingsControllers = require("../controllers/meetings-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);

router.post(
  "/",
  [check("advisorId").notEmpty(), check("isDisabled").notEmpty()],
  meetingsControllers.createMeeting
);

router.patch(
  "/:mid",
  [
    check("advisorId").notEmpty(),
    check("time").notEmpty(),
    check("date").notEmpty(),
    check("isDisabled").notEmpty(),
  ],
  meetingsControllers.updateMeeting
);

router.delete("/:mid", meetingsControllers.deleteMeeting);

module.exports = router;
