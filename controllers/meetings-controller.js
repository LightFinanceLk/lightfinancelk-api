const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Meeting = require("../models/meeting");

const createMeeting = async (req, res, next) => {
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
    await createdMeeting.save();
  } catch (err) {
    const error = new HttpError(
      "Creating meeting failed, please try again.",
      500
    );
    return next(error);
  }
  res.status(201).json({ msg: "Successful" });
};

const updateMeeting = async (req, res, next) => {
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

exports.createMeeting = createMeeting;
exports.updateMeeting = updateMeeting;
exports.deleteMeeting = deleteMeeting;
