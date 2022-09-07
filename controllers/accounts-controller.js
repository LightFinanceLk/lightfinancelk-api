const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Account = require("../models/account");
const Record = require("../models/record");
const BulkRecord = require("../models/bulk-record");

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

const createAccount = async (req, res, next) => {
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
exports.createAccount = createAccount;
exports.updateAccount = updateAccount;
exports.deleteAccount = deleteAccount;
