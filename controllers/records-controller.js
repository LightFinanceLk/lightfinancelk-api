const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Record = require("../models/record");
const Account = require("../models/account");

const getRecordById = async (req, res, next) => {
  const recordId = req.params.rid;
  let record;

  try {
    record = await Record.findById(recordId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an record.",
      500
    );
    return next(error);
  }

  if (!record) {
    const error = new HttpError(
      "Could not find an record for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ record });
};

const createRecord = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const {
    recordType,
    accountId,
    amount,
    category,
    subCategory,
    date,
    description,
  } = req.body;

  const createdRecord = new Record({
    recordType,
    accountId,
    amount,
    category,
    subCategory,
    date,
    description,
  });

  try {
    await createdRecord.save();
  } catch (err) {
    const error = new HttpError(
      "Creating record failed, please try again.",
      500
    );
    return next(error);
  }

  // update account total amount
  let account;
  try {
    account = await Account.findById(accountId);
    account.amount += amount;
  } catch (err) {
    const error = new HttpError(
      "Could not find account by Id, could not update account.",
      500
    );
    return next(error);
  }

  try {
    await account.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update account.",
      500
    );
    return next(error);
  }
  // END update account total amount

  res.status(201).json({ msg: "Record is created successfully." });
};

const updateRecord = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const {
    amount,
    currency,
    category,
    date,
    payee,
    note,
    paymentType,
    paymentStatus,
    place,
  } = req.body;

  const recordId = req.params.rid;
  let record;

  try {
    record = await Record.findById(recordId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update record.",
      500
    );
    return next(error);
  }

  record.amount = amount;
  record.currency = currency;
  record.category = category;
  record.date = date;
  record.payee = payee;
  record.note = note;
  record.paymentType = paymentType;
  record.paymentStatus = paymentStatus;
  record.place = place;

  try {
    await record.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update record.",
      500
    );
    return next(error);
  }

  res.status(200).json({ msg: "Record is updated successfully." });
};

const deleteRecord = async (req, res, next) => {
  const recordId = req.params.rid;
  let record;

  try {
    record = await Record.findById(recordId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete record.",
      500
    );
    return next(error);
  }

  if (!record) {
    const error = new HttpError("Could not find record for this id.", 404);
    return next(error);
  }

  try {
    await record.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete record.",
      500
    );
    return next(error);
  }

  // update account total amount
  let account;
  try {
    account = await Account.findById(record.accountId);
    account.amount -= record.amount;
  } catch (err) {
    const error = new HttpError(
      "Could not find account by Id, could not update account.",
      500
    );
    return next(error);
  }

  try {
    await account.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update account.",
      500
    );
    return next(error);
  }
  // END update account total amount

  res.status(200).json({ msg: "Record is deleted successfully." });
};

exports.getRecordById = getRecordById;
exports.createRecord = createRecord;
exports.updateRecord = updateRecord;
exports.deleteRecord = deleteRecord;
