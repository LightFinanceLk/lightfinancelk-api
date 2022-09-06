const express = require("express");
const { check } = require("express-validator");

const accountsControllers = require("../controllers/accounts-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// router.get("/user/:aid", accountsControllers.getAccountsByUserId);
// '/users/:userid/accounts'

router.use(checkAuth);

router.get("/:aid", accountsControllers.getAccountById);

router.get("/:aid/records", accountsControllers.getRecordsByAccountId);

router.post(
  "/:uid",
  [
    check("accountName").notEmpty(),
    check("accountColor").notEmpty(),
    check("accountType").notEmpty(),
    check("currency").notEmpty(),
    check("startingAmount").notEmpty(),
  ],
  accountsControllers.createAccount
);

router.patch(
  "/:aid",
  [
    check("accountName").notEmpty(),
    check("accountColor").notEmpty(),
    check("accountType").notEmpty(),
    check("currency").notEmpty(),
    check("amount").notEmpty(),
  ],
  accountsControllers.updateAccount
);

// router.delete("/:aid", accountsControllers.deleteAccount);

module.exports = router;
