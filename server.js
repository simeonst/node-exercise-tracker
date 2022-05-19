const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./models/database");
require("dotenv").config();
var bodyParser = require("body-parser");

const indexRouter = require("./routes/index.js");
const usersRouter = require("./routes/users.js");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);

const listener = app.listen(process.env.PORT || 8000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
