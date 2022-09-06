const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = (req, res, next) => {
  // console.log(req.headers);
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      const error = new HttpError("Authentication failed", 401);
      return next(error);
    }
    const decodedToken = jwt.verify(token, config.jwt.SECRET);
    req.userData = { userId: decodedToken.id };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }
};
