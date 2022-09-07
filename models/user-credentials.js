const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userCredentialsSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: true },
  initPassword: { type: Boolean, required: false },
});

userCredentialsSchema.plugin(uniqueValidator);

module.exports = mongoose.model("UserCredentials", userCredentialsSchema);
