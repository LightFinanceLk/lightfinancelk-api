const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  accountName: { type: String, required: true },
  accountColor: { type: String, required: true },
  accountType: { type: String, required: true },
  currency: { type: String, required: true },
  userId: { type: String, required: true },
});

module.exports = mongoose.model("Account", accountSchema);
