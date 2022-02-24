const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./database");
require("dotenv").config();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", async (req, res) => {
  try {
    const rows = await db.all(`
    SELECT 
        username, id
    FROM
        Users
    `);
    res.status(200).json({ rows });
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
});

app.post("/api/users", async (req, res) => {
  console.log("request body");
  console.log(req.body);
  const username = req.body.username;

  if (username) {
    try {
      await db.run(`INSERT INTO Users (username) VALUES (?)`, username);
      const row = await db.get("SELECT last_insert_rowid() as id FROM Users");
      res.status(201).json({
        _id: row.id,
        username: username,
      });
      return;
    } catch (error) {
      res.status(400).json({ error: error.message });
      return;
    }
  } else {
    res.status(400).json({ error: "No username sent" });
  }
});

app.get("/exercises", async (req, res) => {
  db.all(
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
