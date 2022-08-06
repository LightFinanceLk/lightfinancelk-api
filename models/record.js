const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const recordSchema = new Schema({
  recordType: { type: String, required: true },
  accountId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  payee: { type: String },
  note: { type: String },
  paymentType: { type: String },
  paymentStatus: { type: String },
  place: { type: String },
});

module.exports = mongoose.model("Record", recordSchema);
