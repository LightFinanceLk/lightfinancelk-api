const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const recordSchema = new Schema({
  recordType: { type: String, required: true },
  accountId: { type: String, required: true },
  // recordType: { type: String, required: true },
  // accountId: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  subCategory: { type: String },
  // category: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String },
  // note: { type: String },
  // paymentType: { type: String },
  // paymentStatus: { type: String },
  // place: { type: String },
  bulkRecordId: { type: String, ref: "BulkRecord" },
});

module.exports = mongoose.model("Record", recordSchema);
