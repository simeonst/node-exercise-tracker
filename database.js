var util = require("util");
var path = require("path");
var fs = require("fs");

var sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

var dbFile = "./my.db";
var dbExists = fs.existsSync(dbFile);
if (!dbExists) {
  fs.openSync(dbFile, "w");
}

const db = new sqlite3.Database(dbFile);

if (dbExists) {
  console.log("database exists already!");
}

if (!dbExists) {
  console.log("creating Users table.");
  db.run(
    `CREATE TABLE IF NOT EXISTS Users (
          id INTEGER PRIMARY KEY ASC,
          username VARCHAR(40) UNIQUE
          )
          `,
    (err) => {
      if (err) {
        console.log(err);
        console.log("Users table already exists.");
      } else {
        console.log("Users table created.");
        const insertUsers = "INSERT INTO Users (username) VALUES (?)";
        db.run(insertUsers, "admin");
        db.run(insertUsers, "user1");
        db.run(insertUsers, "user2");
        console.log("Inserted Users data.");
      }
    }
  );
  db.run(
    `
    CREATE TABLE IF NOT EXISTS Exercises (
        id INTEGER PRIMARY KEY ASC,
        username VARCHAR(40),
        description VARCHAR(100),
        duration INTEGER,
        date DATE,
        FOREIGN KEY (username) REFERENCES Users (username)
    )
    `,
    (err) => {
      if (err) {
        console.log(err);
        console.log("Excercises table already exists.");
      } else {
        console.log("Created excercises table");
        const insertExercises =
          "INSERT INTO Exercises (username, description, duration, date) VALUES (?,?,?,?)";
        db.run(insertExercises, ["admin", "gym", 60, "2022-01-01"]);
        db.run(insertExercises, ["admin", "run", 30, "2022-01-02"]);
        db.run(insertExercises, ["admin", "hike", 120, "2022-01-03"]);

        db.run(insertExercises, ["user1", "run", 30, "2022-01-01"]);
        db.run(insertExercises, ["user1", "walk", 90, "2022-01-02"]);
        db.run(insertExercises, ["user1", "swim", 45, "2022-01-03"]);

        db.run(insertExercises, ["user2", "gym", 90, "2022-01-03"]);
        db.run(insertExercises, ["user2", "walk", 90, "2022-01-02"]);
        db.run(insertExercises, ["user2", "swim", 45, "2022-01-02"]);
        console.log("Inserted Exercises data.");
      }
    }
  );
}

db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);
db.each = util.promisify(db.each);

module.exports = db;

async function insertOrLookupUsername(username) {
  var result = SQL3.get(
    `
            SELECT
                id
            FROM 
                Users
            WHERE
                username = ?
        `,
    username
  );

  if (result && result.id) {
    return result.id;
  } else {
    result = await SQL3.run(
      `
            INSERT INTO
                Users (username)
            VALUES
                (?)
          `,
      username
    );
    if (result && result.lastID) {
      return result.lastID;
    }
  }
}

async function insertExercise(username, description, duration, date) {
  var result = await SQL3.run(
    `
              INSERT INTO
                  Exercises (username, description, duration, date)
              VALUES
                  (?,?,?,?)
            `,
    username,
    description,
    duration,
    date
  );
  if (result && result.changes > 0) {
    return true;
  }
  return false;
}

async function getAllUsers() {
  var result = await SQL3.all(
    `
            SELECT 
                username, id
            FROM
                Users
        `
  );

  if (result && result.length > 0) {
    return result;
  }
}

function error(err) {
  if (err) {
    console.error(err.toString());
    console.log("");
  }
}
