const fs = require("fs");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const nanoid = require("nanoid-esm");
const { sendEmail } = require("../utils/send-email");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const UserCredentials = require("../models/user-credentials");
const Account = require("../models/account");
const Meeting = require("../models/meeting");
const Record = require("../models/record");
const BulkRecord = require("../models/bulk-record");

const getUserById = async (req, res, next) => {
  let user = null;
  try {
    user = await User.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError("Fetching user failed, please try again.", 500);
    return next(error);
  }
  res.json({ user });
};

const getUsersByUserRole = async (req, res, next) => {
  let users = null;
  try {
    users = await UserCredentials.aggregate([
      {
        $match: {
          role: req.params.rid,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          "user.firstName": 1,
          "user.lastName": 1,
          "user.maritalStatus": 1,
          "user.occupation": 1,
          "user.city": 1,
          "user.phone": 1,
          "user.dob": 1,
          "user.gender": 1,
          "user.advisor": 1,
          "user._id": 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      "Fetching user accounts is failed, please try again.",
      500
    );
    return next(error);
  }
  res.json({ users });
};

const getAccountsByUserId = async (req, res, next) => {
  try {
    userAccount = await Account.find({ userId: req.params.uid });
  } catch (err) {
    const error = new HttpError(
      "Fetching user accounts is failed, please try again.",
      500
    );
    return next(error);
  }
  res.json({ userAccount });
};

const getMeetingByUserId = async (req, res, next) => {
  try {
    userMeetings = await Meeting.find({ userId: req.params.uid });
  } catch (err) {
    const error = new HttpError(
      "Fetching user meetings is failed, please try again.",
      500
    );
    return next(error);
  }
  res.json({ userMeetings });
};

const getMeetingByAdvisorId = async (req, res, next) => {
  try {
    advisorMeetings = await Meeting.find({ advisorId: req.params.uid });
  } catch (err) {
    const error = new HttpError(
      "Fetching user meetings is failed, please try again.",
      500
    );
    return next(error);
  }
  res.json({ advisorMeetings });
};

const updatePasswordByUserId = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const uId = req.params.uid;

  if (uId !== req.userData.userId) {
    return next(new HttpError("Not authenticated", 422));
  }

  let isValid = false,
    hashedNewPassword;

  const { currentPassword, newPassword } = req.body;

  try {
    hashedNewPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not reset password, please try again.",
      500
    );
    return next(error);
  }

  let user;
  try {
    user = await UserCredentials.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError(
      "Fetching user is failed, please try again.",
      500
    );
    return next(error);
  }

  try {
    isValid = await bcrypt.compare(currentPassword, user.password);
  } catch (err) {
    const error = new HttpError("Password Invalid", 500);
    return next(error);
  }

  let existingUser;
  try {
    if (isValid) {
      existingUser = await UserCredentials.findByIdAndUpdate(uId, {
        password: hashedNewPassword,
        initPassword: false,
      });
      sendEmail(existingUser.email, "", "", "init");
    }
  } catch (err) {
    const error = new HttpError(
      "No user found for this user id, please try again.",
      500
    );
    return next(error);
  }

  token = jwt.sign(
    {
      id: existingUser.id,
      userId: existingUser.userId,
      email: existingUser.email,
      initPassword: false,
      role: existingUser.role,
    },
    `${config.jwt.SECRET}`,
    { expiresIn: "1h" }
  );

  res.status(201).json({ token });
};

const updateUserById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const uId = req.params.uid;

  const {
    firstName,
    lastName,
    phone,
    dob,
    gender,
    maritalStatus,
    occupation,
    city,
    title,
    headline,
    description,
    linkedIn,
    advisor,
    image,
  } = req.body;

  let existingUser;
  try {
    existingUser = await User.findByIdAndUpdate(uId, {
      firstName,
      lastName,
      phone,
      dob,
      gender,
      maritalStatus,
      occupation,
      city,
      title: title ? title : "",
      headline: headline ? headline : "",
      description: description ? description : "",
      linkedIn: linkedIn ? linkedIn : "",
      advisor: advisor ? advisor : null,
      image: image ? image : "",
    });
  } catch (err) {
    const error = new HttpError(
      "No user found for this user id, please try again.",
      500
    );
    return next(error);
  }
  res.status(201).json({ msg: "Successfully Updated" });
};

const deleteUserById = async (req, res, next) => {
  const uId = req.params.uid;

  if (uId !== req.userData.userId) {
    return next(new HttpError("Not authenticated", 422));
  }

  let existingUser;

  try {
    existingUser = await UserCredentials.findByIdAndDelete(uId);
    sendEmail(existingUser.email, "", "", "delete");
  } catch (err) {
    const error = new HttpError(
      "No user found for this user id, please try again.",
      500
    );
    return next(error);
  }

  // delete user data from Users table
  try {
    await User.findByIdAndDelete(existingUser.userId);
  } catch (err) {
    const error = new HttpError(
      "No user found for this user id, please try again.",
      500
    );
    return next(error);
  }

  // delete user data from Accounts table
  try {
    await Account.deleteMany(existingUser.userId);
  } catch (err) {
    const error = new HttpError(
      "No accounts found for this user id, please try again.",
      500
    );
    return next(error);
  }

  // delete user data from Records table
  try {
    await Record.deleteMany(existingUser.userId);
  } catch (err) {
    const error = new HttpError(
      "No records found for this user id, please try again.",
      500
    );
    return next(error);
  }

  // delete user data from Bulk Records table
  try {
    await BulkRecord.deleteMany(existingUser.userId);
  } catch (err) {
    const error = new HttpError(
      "No bulk records found for this user id, please try again.",
      500
    );
    return next(error);
  }

  // delete user data from Meetings table
  try {
    await Meeting.deleteMany(existingUser.userId);
  } catch (err) {
    const error = new HttpError(
      "No meetings found for this user id, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ msg: "Successfully Deleted" });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  // const tempPassword = nanoid(8).toUpperCase();
  const tempPassword = "111111";

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const {
    firstName,
    lastName,
    phone,
    email,
    dob,
    gender,
    maritalStatus,
    occupation,
    initPassword,
    city,
    role,
    title,
    headline,
    description,
    linkedIn,
  } = req.body;

  let existingUser;

  try {
    existingUser = await UserCredentials.findOne({ email: email });
  } catch (err) {
    const error = new Error("Signing up failed, please try again later.");
    error.http_code = 500;
    return next(error);
  }

  if (existingUser) {
    const error = new Error(
      "User exists for the given email address, please login instead."
    );
    error.http_code = 422;
    return next(error);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(tempPassword, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    firstName,
    lastName,
    phone,
    dob,
    gender,
    maritalStatus,
    occupation,
    city,
    title: title ? title : "",
    headline: headline ? title : "",
    description: description ? title : "",
    linkedIn: linkedIn ? title : "",
    advisor: null,
    image: "",
  });

  const createdUserCredentials = new UserCredentials({
    email,
    initPassword,
    password: hashedPassword,
    role,
  });

  try {
    const user = createdUser.save().then((user) => {
      createdUserCredentials.userId = user._id;
      createdUserCredentials.save();
      sendEmail(email, firstName, tempPassword, "new");
    });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }
  res.status(201).json({});
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await UserCredentials.findOne({ email: email });
  } catch (err) {
    const error = new Error("Logging in failed, please try again later.");
    error.http_code = 500;
    return next(error);
  }

  if (!existingUser) {
    const error = new Error("Invalid credentials, could not log you in.");
    error.http_code = 401;
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new Error(
      "Could not log you in, please check your credentials and try again"
    );
    error.http_code = 500;
    return next(error);
  }

  if (!isValidPassword) {
    const error = new Error("Invalid credentials, could not log you in");
    error.http_code = 401;
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        id: existingUser.id,
        userId: existingUser.userId,
        email: existingUser.email,
        initPassword: existingUser.initPassword,
        role: existingUser.role,
      },
      `${config.jwt.SECRET}`,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Error("Logging in failed, please try again later.");
    error.http_code = 401;
    return next(error);
  }

  res.json({ token });
};

const resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  const tempPassword = nanoid(8).toUpperCase();

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { email } = req.body;
  let hashedPassword;
  let existingUser;
  try {
    hashedPassword = await bcrypt.hash(tempPassword, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not reset password, please try again.",
      500
    );
    return next(error);
  }

  try {
    existingUser = await UserCredentials.findOneAndUpdate(
      { email: email },
      { password: hashedPassword }
    );
    if (existingUser.email == email) {
      sendEmail(email, "", tempPassword, "reset");
    }
  } catch (err) {
    const error = new Error("No user found for this email, please try again.");
    error.http_code = 500;
    return next(error);
  }

  res.status(201).json({ msg: "Password reset successfully." });
};

const updateProfileImage = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const uId = req.params.uid;

  let existingUser;
  try {
    existingUser = await User.findByIdAndUpdate(uId, {
      image: req.file.path,
    });
  } catch (err) {
    const error = new HttpError(
      "No user found for this user id, please try again.",
      500
    );
    return next(error);
  }
  res.status(201).json({ msg: "Image uploaded successfully." });
};

exports.signup = signup;
exports.login = login;
exports.resetPassword = resetPassword;
exports.updatePasswordByUserId = updatePasswordByUserId;
exports.getUserById = getUserById;
exports.getUsersByUserRole = getUsersByUserRole;
exports.getAccountsByUserId = getAccountsByUserId;
exports.getMeetingByUserId = getMeetingByUserId;
exports.getMeetingByAdvisorId = getMeetingByAdvisorId;
exports.updateUserById = updateUserById;
exports.deleteUserById = deleteUserById;
exports.updateProfileImage = updateProfileImage;
