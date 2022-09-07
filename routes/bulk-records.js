const express = require("express");
const { check } = require("express-validator");

const bulkRecordsControllers = require("../controllers/bulk-records-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);

router.get("/:aid", bulkRecordsControllers.getBulkRecordsByAccountId);

router.post("/:aid", bulkRecordsControllers.createBulkRecord);

router.delete("/:rid", bulkRecordsControllers.deleteBulkRecord);

module.exports = router;
