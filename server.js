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
    const result = await db.all(`
    SELECT 
        id as _id, username
    FROM
        Users
    `);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
});

app.post("/api/users", async (req, res) => {
  const username = req.body?.username;

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

app.get("/api/users/:_id/logs", async (req, res) => {
  const id = req.params._id;
  try {
    const data = await db.get("SELECT username FROM Users WHERE id=(?)", id);
    const username = data.username;
    const result = await db.all(
      `
    SELECT 
        description, duration, date
    FROM
        Exercises
    WHERE
        username=(?)
    `,
      username
    );
    console.log(result);
    res.status(200).json({
      _id: id,
      username: username,
      count: result.length,
      log: result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  const description = req.body;
  const duration = parseInt(req.body.duration);
  let date = req.body.date;

  if (id && description && duration) {
    try {
      const data = await db.get("SELECT username FROM Users WHERE id=(?)", id);
      const username = data.username;
      if (!date) {
        date = new Date().toDateString();
      }

      await db.run(
        `INSERT INTO Exercises (username, description, duration, date) VALUES (?,?,?,?)`,
        [username, description, duration, date]
      );
      res.status(201).json({
        _id: id,
        username: username,
        date: date,
        duration: duration,
        description: description,
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
  try {
    const result = await db.all(
      `
    SELECT 
        *
    FROM
        Exercises
    `
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
});

const listener = app.listen(process.env.PORT || 8000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
