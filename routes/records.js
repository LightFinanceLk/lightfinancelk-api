const express = require("express");
const { check } = require("express-validator");

const recordsControllers = require("../controllers/records-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);

router.get("/:rid", recordsControllers.getRecordById);

router.post(
  "/",
  [
    check("recordType").notEmpty(),
    check("accountId").notEmpty(),
    check("amount").notEmpty(),
    check("category").notEmpty(),
    check("date").notEmpty(),
  ],
  recordsControllers.createRecord
);

router.patch(
  "/:rid",
  [
    check("recordType").notEmpty(),
    check("amount").notEmpty(),
    check("category").notEmpty(),
    check("date").notEmpty(),
  ],
  recordsControllers.updateRecord
);

router.delete("/:rid", recordsControllers.deleteRecord);

module.exports = router;
