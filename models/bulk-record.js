const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bulkRecordSchema = new Schema({
  records: { type: Array, required: true },
});

module.exports = mongoose.model("BulkRecord", bulkRecordSchema);
