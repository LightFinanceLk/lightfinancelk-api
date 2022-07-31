const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("./config");

const app = express();

app.use(bodyParser.json());

mongoose
  .connect(
    `mongodb+srv://${config.db.DB_UN}:${config.db.DB_PW}@cluster0.yr8jn.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log("error");
  });
