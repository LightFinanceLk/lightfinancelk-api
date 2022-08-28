const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Record = require("../models/record");
const User = require("../models/user");

// const getRecordById = async (req, res, next) => {
//   const recordId = req.params.rid;
//   let record;

//   try {
//     record = await Record.findById(recordId);
//   } catch (err) {
//     const error = new HttpError(
//       "Something went wrong, could not find an record.",
//       500
//     );
//     return next(error);
//   }

//   if (!record) {
//     const error = new HttpError(
//       "Could not find an record for the provided id.",
//       404
//     );
//     return next(error);
//   }

//   res.json({ record });
// };

// const getRecordsByAccountId = async (req, res, next) => {
//   const userId = req.params.rid;
//   let records;

//   try {
//     records = await Record.find({ userId: userId });
//   } catch (err) {
//     const error = new HttpError(
//       "Fetching records failed, please try again later",
//       500
//     );
//     return next(error);
//   }

//   // // let records;
//   // let userWithRecords;
//   // try {
//   //   userWithRecords = await Account.findById(userId).populate("records");
//   // } catch (err) {
//   //   const error = new HttpError(
//   //     "Fetching records failed, please try again later",
//   //     500
//   //   );
//   //   return next(error);
//   // }

//   // // if (!records || records.length === 0) {
//   if (!records || records.length === 0) {
//     return next(
//       new HttpError("Could not find records for the provided user id.", 404)
//     );
//   }
//   // // }

//   // res.json({
//   //   records: userWithRecords.records.map((record) =>
//   //     record.toObject({ getters: true })
//   //   ),
//   // });

//   res.json({
//     // records: records.map((record) => {
//     //   record.toObject({ getters: true });
//     // }),
//     records,
//   });
// };

const createBulkRecord = async (req, res, next) => {
  console.log("awa");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const records = req.body;

  const recordsArr = records.map((record) => {
    return {
      amount: record.Amount,
      date: record.Date,
      description: record.Description,
    };
  });

  console.log(recordsArr);

  // const createdRecord = new Record({
  //   amount,
  //   date,
  //   description,
  // });

  try {
    console.log(records);
    await Record.insertMany(recordsArr, (error) => {
      console.log(error);
    });
  } catch (err) {
    const error = new HttpError(
      "Creating records failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({});
};

// const updateRecord = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return next(
//       new HttpError("Invalid inputs passed, please check your data.", 422)
//     );
//   }

//   const {
//     amount,
//     currency,
//     category,
//     date,
//     payee,
//     note,
//     paymentType,
//     paymentStatus,
//     place,
//   } = req.body;

//   const recordId = req.params.rid;
//   let record;

//   try {
//     record = await Record.findById(recordId);
//   } catch (err) {
//     const error = new HttpError(
//       "Something went wrong, could not update record.",
//       500
//     );
//     return next(error);
//   }

//   record.amount = amount;
//   record.currency = currency;
//   record.category = category;
//   record.date = date;
//   record.payee = payee;
//   record.note = note;
//   record.paymentType = paymentType;
//   record.paymentStatus = paymentStatus;
//   record.place = place;

//   try {
//     await record.save();
//   } catch (err) {
//     const error = new HttpError(
//       "Something went wrong, could not update record.",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({ record: record.toObject({ getters: true }) });
// };

// const deleteRecord = async (req, res, next) => {
//   const recordId = req.params.rid;
//   let record;

//   try {
//     record = await Record.findById(recordId);
//   } catch (err) {
//     const error = new HttpError(
//       "Something went wrong, could not delete record.",
//       500
//     );
//     return next(error);
//   }

//   if (!record) {
//     const error = new HttpError("Could not find record for this id.", 404);
//     return next(error);
//   }

//   try {
//     // const sess = await mongoose.startSession();
//     // sess.startTransaction();
//     await record.remove();
//     // await record.remove({ session: sess });
//     // record.creator.records.pull(record);
//     // await record.creator.save({ session: sess });
//     // await sess.commitTransaction();
//   } catch (err) {
//     const error = new HttpError(
//       "Something went wrong, could not delete record.",
//       500
//     );
//     return next(error); // rollback on error
//   }

//   res.status(200).json({ message: "Deleted Record." });
// };

// exports.getRecordById = getRecordById;
// exports.getRecordsByAccountId = getRecordsByAccountId;
// exports.createRecord = createRecord;
exports.createBulkRecord = createBulkRecord;
// exports.updateRecord = updateRecord;
// exports.deleteRecord = deleteRecord;
