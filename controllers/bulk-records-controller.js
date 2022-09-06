const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Record = require("../models/record");
const BulkRecord = require("../models/bulk-record");
const Account = require("../models/account");

const getBulkRecordsByAccountId = async (req, res, next) => {
  const accountId = req.params.aid;
  let bulkRecords;

  try {
    bulkRecords = await BulkRecord.find({ accountId: accountId });
  } catch (err) {
    const error = new HttpError(
      "Fetching records failed, please try again.",
      500
    );
    return next(error);
  }

  res.json({ bulkRecords });
};

const createBulkRecord = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const accountId = req.params.aid;
  const records = req.body;
  const createdBulkRecord = new BulkRecord({
    accountId,
    dateTime: new Date(),
  });

  const createRecords = async (bulkRecordId) => {
    try {
      const updatedRecords = records.map((record) => {
        return { ...record, bulkRecordId: bulkRecordId.toString() };
      });
      await Record.insertMany(updatedRecords);
    } catch (err) {
      const error = new HttpError(
        "Creating records failed, please try again.",
        500
      );
      return next(error);
    }
  };

  // calculate total amount to sum up the account total
  let recordsTotalAmount = records.reduce((acc, record) => {
    return acc + record.amount;
  }, 0);

  let account;

  const updateAccount = async (aId, bulkRecordId) => {
    try {
      account = await Account.findById(aId);
      account.bulkRecordIds = [...account.bulkRecordIds, bulkRecordId];
      account.amount += recordsTotalAmount;
      try {
        await account.save();
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  try {
    let cb = await createdBulkRecord.save();
    await updateAccount(accountId, cb.id);
    await createRecords(cb.id);
  } catch (err) {
    const error = new HttpError(
      "Creating bulk record failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({});
};

const deleteBulkRecord = async (req, res, next) => {
  // remove bulk record
  const bulkRecordId = req.params.rid;
  let bulkRecord;
  let accountId = "";

  // console.log(bulkRecordId);

  try {
    bulkRecord = await BulkRecord.findById({ _id: bulkRecordId });
    accountId = bulkRecord.accountId;
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete record.",
      500
    );
    return next(error);
  }

  if (!bulkRecord) {
    const error = new HttpError("Could not find record for this id.", 404);
    return next(error);
  }

  try {
    // const sess = await mongoose.startSession();
    // sess.startTransaction();
    console.log(bulkRecord, "bulkRecord");
    await bulkRecord.remove();
    // await record.remove({ session: sess });
    // record.creator.records.pull(record);
    // await record.creator.save({ session: sess });
    // await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete record.",
      500
    );
    return next(error); // rollback on error
  }

  // remove records

  let records;

  // calculate total amount to sum up the account total
  let recordsTotalAmount = records.reduce((acc, record) => {
    return acc + record.amount;
  }, 0);

  try {
    records = await Record.deleteMany({ bulkRecordId });
    console.log(records, "records");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete record.",
      500
    );
    return next(error);
  }

  // remove from account

  let account;

  try {
    account = await Account.findById(accountId);
    let accountBulkRecordIds = account.bulkRecordIds;

    var filteredAccountBulkRecordIds = accountBulkRecordIds.filter(
      (value, index, arr) => {
        return value !== bulkRecordId;
      }
    );
    account.bulkRecordIds = [...filteredAccountBulkRecordIds];
    account.amount -= recordsTotalAmount;
    try {
      await account.save();
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({ message: "Deleted Record." });
};

// exports.getRecordById = getRecordById;
// exports.getRecordsByAccountId = getRecordsByAccountId;
// exports.createRecord = createRecord;
exports.createBulkRecord = createBulkRecord;
exports.getBulkRecordsByAccountId = getBulkRecordsByAccountId;
exports.deleteBulkRecord = deleteBulkRecord;
// exports.updateRecord = updateRecord;
// exports.deleteRecord = deleteRecord;
