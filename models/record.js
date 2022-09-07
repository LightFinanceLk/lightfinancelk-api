const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const recordSchema = new Schema({
  recordType: { type: String, required: true },
  accountId: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  subCategory: { type: String },
  date: { type: String, required: true },
  description: { type: String },
  bulkRecordId: { type: String },
});

module.exports = mongoose.model("Record", recordSchema);
