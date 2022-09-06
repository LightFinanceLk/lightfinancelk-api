const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const meetingSchema = new Schema({
  advisorId: { type: String, required: true },
  userId: { type: String, required: false },
  userName: { type: String, required: false },
  date: { type: String, required: true },
  time: { type: String, required: true },
  isDisabled: { type: Boolean, required: true },
});

module.exports = mongoose.model("Meeting", meetingSchema);
