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
  const { from, to, limit } = req.query;
  let fromParam = ``;
  let toParam = ``;

  const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/gm;

  try {
    if (from) {
      const fromIsValid = from.match(dateRegex);
      if (!fromIsValid) {
        throw new Error(
          "Invalid date format for FROM parameter. Must be in format YYYY-MM-DD"
        );
      }
      fromParam = ` AND date>="${from}"`;
    }

    if (to) {
      const toIsValid = to.match(dateRegex);
      if (!toIsValid) {
        throw new Error(
          "Invalid date format for TO parameter. Must be in format YYYY-MM-DD"
        );
      }
      toParam = ` AND date<="${to}"`;
    }

    const limitParam =
      limit && parseInt(limit) ? `LIMIT ${parseInt(limit)}` : ``;

    const data = await db.get("SELECT username FROM Users WHERE id=(?)", id);
    const username = data.username;
    const query = `
    SELECT description, duration, date
    FROM Exercises
    WHERE username=(?)${fromParam}${toParam}
    ${limitParam}
    `;
    const result = await db.all(query, username);

    result.forEach((obj) => {
      const strDate = new Date(obj.date).toDateString();
      obj.date = strDate;
    });

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
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  let date = req.body.date;
  let parsedDate = Date.parse(date);

  try {
    if (!id) {
      throw new Error("Please enter a valid ID");
    }
    if (!description) {
      throw new Error("Please enter a description");
    }
    if (!duration) {
      throw new Error("Please enter a duration");
    }

    if (date && isNaN(parsedDate)) {
      throw new Error("Please enter a date in format YYYY-MM-DD");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (id && description && duration) {
    try {
      const data = await db.get("SELECT username FROM Users WHERE id=(?)", id);
      const username = data.username;

      if (!date) {
        date = new Date().toISOString().split("T")[0];
      } else {
        date = new Date(date).toISOString().split("T")[0];
      }
      const dateStr = new Date(date).toDateString();

      await db.run(
        `INSERT INTO Exercises (username, description, duration, date) VALUES (?,?,?,?)`,
        [username, description, duration, date]
      );

      res.status(201).json({
        _id: id,
        username: username,
        date: dateStr,
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
