const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bulkRecordSchema = new Schema({
  accountId: { type: String, required: true },
  dateTime: { type: String, required: true },
});

module.exports = mongoose.model("BulkRecord", bulkRecordSchema);
