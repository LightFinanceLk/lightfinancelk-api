const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Meeting = require("../models/meeting");
const Record = require("../models/record");
const User = require("../models/user");

const createMeeting = async (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { advisorId, userId, userName, isDisabled, date, time } = req.body;

  const createdMeeting = new Meeting({
    advisorId,
    userId,
    userName,
    isDisabled,
    date,
    time,
  });

  try {
    // console.log(recordType, accountId, amount, category, subCategory, date);
    // const sess = await mongoose.startSession();
    // sess.startTransaction();
    // await createdRecord.save({ session: sess });
    await createdMeeting.save();
    // user.records.push(createdRecord);
    // await user.save({ session: sess });
    // await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating meeting failed, please try again.",
      500
    );
    return next(error);
  }

  // res.status(201).json({ record: createdRecord });
  res.status(201).json({ msg: "Successful" });
};

const updateMeeting = async (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { advisorId, userId, userName, isDisabled, date, time } = req.body;

  const meetingId = req.params.mid;

  let meeting;

  try {
    meeting = await Meeting.findById(meetingId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update record.",
      500
    );
    return next(error);
  }

  meeting.advisorId = advisorId;
  meeting.userId = userId;
  meeting.userName = userName;
  meeting.isDisabled = isDisabled;
  meeting.date = date;
  meeting.time = time;

  try {
    await meeting.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update record.",
      500
    );
    return next(error);
  }

  res.status(200).json({ msg: "Successful" });
};

const deleteMeeting = async (req, res, next) => {
  const meetingId = req.params.mid;
  let meeting;

  try {
    meeting = await Meeting.findById(meetingId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete record.",
      500
    );
    return next(error);
  }

  if (!meeting) {
    const error = new HttpError("Could not find record for this id.", 404);
    return next(error);
  }

  try {
    await meeting.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete record.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Successfully Deleted Meeting." });
};

// exports.getRecordById = getRecordById;
// exports.getRecordsByAccountId = getRecordsByAccountId;
exports.createMeeting = createMeeting;
exports.updateMeeting = updateMeeting;
exports.deleteMeeting = deleteMeeting;
