const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./database");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/users", async (req, res) => {
  const tryUsers = db.all(
    `
  SELECT 
      username, id
  FROM
      Users
  `,
    (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(200).json({ rows });
    }
  );
});

app.get("/exercises", async (req, res) => {
  const tryUsers = db.all(
    `
  SELECT 
      *
  FROM
      Exercises
  `,
    (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(200).json({ rows });
    }
  );
});

const listener = app.listen(process.env.PORT || 8000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
