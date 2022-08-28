const express = require("express");
const { check } = require("express-validator");

const bulkRecordsControllers = require("../controllers/bulk-records-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);

// router.get("/:rid", recordsControllers.getRecordById);

// router.get("/account/:rid", recordsControllers.getRecordsByAccountId);

router.post(
  "/",
  // [check("records").notEmpty()],
  bulkRecordsControllers.createBulkRecord
);

// router.patch(
//   "/:rid",
//   [
//     check("recordType").notEmpty(),
//     check("amount").notEmpty(),
//     // check("currency").notEmpty(),
//     check("category").notEmpty(),
//     check("date").notEmpty(),
//   ],
//   recordsControllers.updateRecord
// );

// router.delete("/:rid", recordsControllers.deleteRecord);

module.exports = router;
