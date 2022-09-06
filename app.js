const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const accountRoutes = require("./routes/accounts");
const recordRoutes = require("./routes/records");
const bulkRecordRoutes = require("./routes/bulk-records");
const meetingRoutes = require("./routes/meetings");
const config = require("./config");

const app = express();

app.use(bodyParser.json());

app.use(cors());
app.options("*", cors());

// fix CORS error
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PATCH, DELETE, OPTIONS"
//   );
//   next();
// });
// End fix CORS error

app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/bulk-records", bulkRecordRoutes);
app.use("/api/meetings", meetingRoutes);

mongoose
  .connect(
    `mongodb+srv://${config.db.DB_UN}:${config.db.DB_PW}@cluster0.yilcp2s.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log("Mongo DB connection error");
  });
