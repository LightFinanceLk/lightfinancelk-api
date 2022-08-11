const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const nanoid = require("nanoid-esm");
const { sendEmail } = require("../utils/sendEmail");

const HttpError = require("../models/http-error");
const User = require("../models/user");

// const getUsers = async (req, res, next) => {
//   let users;
//   try {
//     users = await User.find({}, "-password");
//   } catch (err) {
//     const error = new HttpError(
//       "Fetching users failed, please try again later.",
//       500
//     );
//     return next(error);
//   }
//   res.json({ users: users.map((user) => user.toObject({ getters: true })) });
// };

const getUserById = async (req, res, next) => {
  let user = null,
    currentData = {};
  console.log(req.params.uid, "uid");
  try {
    user = await User.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later.",
      500
    );
    return next(error);
  }
  if (user) {
    user.password = undefined;
  }
  // delete user[password];
  res.json({ user });
};

const updatePasswordByUserId = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const uId = req.params.uid;

  console.log(uId);

  let isValid = false,
    hashedNewPassword;

  const { currentPassword, newPassword } = req.body;

  // try {
  //   hashedCurrentPassword = await bcrypt.hash(currentPassword, 12);
  // } catch (err) {
  //   const error = new HttpError(
  //     "Could not reset password, please try again.",
  //     500
  //   );
  //   return next(error);
  // }

  try {
    hashedNewPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not reset password, please try again.",
      500
    );
    return next(error);
  }

  try {
    user = await User.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later.",
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

  console.log(isValid);

  // console.log(hashedCurrentPassword, "hashedCurrentPassword");
  // console.log(user.password, "user.password");
  // console.log(hashedNewPassword, "hashedNewPassword");
  // let existingUser;

  try {
    if (isValid) {
      existingUser = await User.findByIdAndUpdate(uId, {
        password: hashedNewPassword,
        initPassword: false,
      });
      sendEmail(existingUser.email, "", "init");
    }
  } catch (err) {
    const error = new HttpError(
      "No user found for this user id, please try again2.",
      500
    );
    return next(error);
  }

  res.status(201).json({ success: "Successfully Updated" });
};

const updateUserById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const uId = req.params.uid;

  console.log(typeof uId);

  const {
    email,
    firstName,
    lastName,
    phone,
    dob,
    gender,
    maritalStatus,
    occupation,
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
    });
  } catch (err) {
    const error = new HttpError(
      "No user found for this user id, please try again2.",
      500
    );
    return next(error);
  }

  res.status(201).json({ success: "Successfully Updated" });
};

const deleteUserById = async (req, res, next) => {
  const uId = req.params.uid;

  let existingUser;
  try {
    existingUser = await User.findByIdAndDelete(uId);
  } catch (err) {
    const error = new HttpError(
      "No user found for this user id, please try again2.",
      500
    );
    return next(error);
  }

  res.status(201).json({ success: "Successfully Deleted" });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  const tempPassword = nanoid(8).toUpperCase();

  let displayErrors = "";

  if (!errors.isEmpty()) {
    displayErrors += "Invalid inputs passed, please check your data.";
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
  } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    // const error = new HttpError(
    //   "Signing up failed, please try again later.",
    //   500
    // );
    const error = new Error("Signing up failed, please try again later.");
    error.http_code = 500;
    return next(error);
  }

  if (existingUser) {
    // const error = new HttpError(
    //   "User exists already, please login instead.",
    //   422
    // );
    const error = new Error("User exists already, please login instead.");
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
    email,
    dob,
    gender,
    maritalStatus,
    occupation,
    initPassword,
    // image: req.file.path,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
    sendEmail(email, tempPassword, "new");
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
  console.log(email, password, "email, password");
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const err = new HttpError("Invalid credentials, could not log you in", 401);
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        initPassword: existingUser.initPassword,
      },
      `${config.jwt.SECRET}`,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({ token });
};

const resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  const tempPassword = nanoid(8).toUpperCase();

  console.log(tempPassword, "tempPassword");

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
    existingUser = await User.findOneAndUpdate(
      { email: email },
      { password: hashedPassword }
    );
    if (existingUser.email == email) {
      sendEmail(email, tempPassword, "reset");
    }
  } catch (err) {
    const error = new HttpError(
      "No user found for this email, please try again2.",
      500
    );
    return next(error);
  }

  res.status(201).json({});
};

// exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.resetPassword = resetPassword;
exports.updateUserById = updateUserById;
exports.updatePasswordByUserId = updatePasswordByUserId;
exports.deleteUserById = deleteUserById;
// update user
// delete user
