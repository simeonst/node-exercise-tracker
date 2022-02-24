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
  console.log("creating new database");
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
        console.log("Users table created");
        const insertUsers = "INSERT INTO Users (username) VALUES (?)";
        db.run(insertUsers, "admin");
        console.log("added admin");
        db.run(insertUsers, "user1");
        console.log("added user1");
        db.run(insertUsers, "user2");
        console.log("added user2");
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
        date VARCHAR(100),
        FOREIGN KEY (username) REFERENCES Users (username)
    )
    `,
    (err) => {
      if (err) {
        console.log(err);
        console.log("excercises table already exists.");
      } else {
        console.log("created excercises table");
        const dateToday = new Date().toDateString();
        const insertExercises =
          "INSERT INTO Exercises (username, description, duration, date) VALUES (?,?,?,?)";
        db.run(insertExercises, ["admin", "gym", 60, dateToday]);
        db.run(insertExercises, ["user1", "run", 30, dateToday]);
        db.run(insertExercises, ["user2", "walk", 90, dateToday]);
        console.log("inserted exercises");
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
