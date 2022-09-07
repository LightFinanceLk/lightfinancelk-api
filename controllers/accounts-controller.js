const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Account = require("../models/account");
const User = require("../models/user");
const Record = require("../models/record");
const BulkRecord = require("../models/bulk-record");
// const { use } = require("../routes/users");
const checkAuth = require("../middleware/check-auth");

const getAccountById = async (req, res, next) => {
  const accountId = req.params.aid;
  let account;

  try {
    account = await Account.findById(accountId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an account.",
      500
    );
    return next(error);
  }

  if (!account) {
    const error = new HttpError(
      "Could not find an account for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ account });
};

const getRecordsByAccountId = async (req, res, next) => {
  const accountId = req.params.aid;
  console.log(accountId);
  let records;

  try {
    records = await Record.find({ accountId: accountId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find records.",
      500
    );
    return next(error);
  }

  if (!records) {
    const error = new HttpError(
      "Could not find records for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ records });
};

// const getAccountsByUserId = async (req, res, next) => {
//   const userId = req.params.aid;
//   let accounts;

//   try {
//     accounts = await Account.find({ userId: userId });
//   } catch (err) {
//     const error = new HttpError(
//       "Fetching accounts failed, please try again later",
//       500
//     );
//     return next(error);
//   }

//   // // let accounts;
//   // let userWithAccounts;
//   // try {
//   //   userWithAccounts = await User.findById(userId).populate("accounts");
//   // } catch (err) {
//   //   const error = new HttpError(
//   //     "Fetching accounts failed, please try again later",
//   //     500
//   //   );
//   //   return next(error);
//   // }

//   // // if (!accounts || accounts.length === 0) {
//   if (!accounts || accounts.length === 0) {
//     return next(
//       new HttpError("Could not find accounts for the provided user id.", 404)
//     );
//   }
//   // // }

//   // res.json({
//   //   accounts: userWithAccounts.accounts.map((account) =>
//   //     account.toObject({ getters: true })
//   //   ),
//   // });

//   res.json({
//     // accounts: accounts.map((account) => {
//     //   account.toObject({ getters: true });
//     // }),
//     accounts,
//   });
// };

// use(checkAuth); // todo: add auth to all controllers

const createAccount = async (req, res, next) => {
  // console.log(req.params.uid, "uid");
  // try {
  //   user = await User.findById(req.params.uid);
  // } catch (err) {
  //   const error = new HttpError(
  //     "Fetching user failed, please try again later.",
  //     500
  //   );
  //   return next(error);
  // }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { accountName, accountColor, accountType, currency, startingAmount } =
    req.body;
  const createdAccount = new Account({
    accountName,
    accountColor,
    accountType,
    currency,
    amount: startingAmount,
    userId: req.params.uid,
  });

  // let user;
  // try {
  //   user = await User.findById(creator);
  // } catch (err) {
  //   const error = new HttpError("Creating account failed, please try again", 500);
  //   return next(error);
  // }

  // if (!user) {
  //   const error = new HttpError("Could not find user for provided id", 404);
  //   return next(error);
  // }

  // console.log(user);

  try {
    await createdAccount.save();
  } catch (err) {
    const error = new HttpError(
      "Creating account failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({});
};

const updateAccount = async (req, res, next) => {
  console.log(req.body, "res");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { accountName, accountColor, accountType, currency, startingAmount } =
    req.body;
  const accountId = req.params.aid;

  let account;

  try {
    account = await Account.findById(accountId);
  } catch (err) {
    const error = new HttpError(
      "Could not find account by Id, could not update account.",
      500
    );
    return next(error);
  }

  account.accountName = accountName;
  account.accountColor = accountColor;
  account.accountType = accountType;
  account.currency = currency;
  account.startingAmount = startingAmount;

  try {
    await account.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update account.",
      500
    );
    return next(error);
  }

  res.status(200).json({ account: account.toObject({ getters: true }) });
};

const deleteAccount = async (req, res, next) => {
  const accountId = req.params.aid;
  let account;

  try {
    account = await Account.findById(accountId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete account.",
      500
    );
    return next(error);
  }

  if (!account) {
    const error = new HttpError("Could not find account for this id.", 404);
    return next(error);
  }

  try {
    await account.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete account.",
      500
    );
    return next(error);
  }

  // delete related records

  try {
    await Record.deleteMany({ accountId: accountId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete records.",
      500
    );
    return next(error);
  }

  // delete related bulk records

  try {
    await BulkRecord.deleteMany({ accountId: accountId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete bulk records.",
      500
    );
    return next(error);
  }

  res.status(200).json({ msg: "Account is deleted successfully." });
};

exports.getAccountById = getAccountById;
exports.getRecordsByAccountId = getRecordsByAccountId;
// exports.getAccountsByUserId = getAccountsByUserId;
exports.createAccount = createAccount;
exports.updateAccount = updateAccount;
exports.deleteAccount = deleteAccount;
