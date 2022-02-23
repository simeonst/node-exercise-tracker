var util = require("util");
var path = require("path");
var fs = require("fs");

var sqlite3 = require("sqlite3");
require("dotenv").config();

// ******

// stores database
const DB_PATH = path.join(__dirname, "my.db");
// stores schema for database
const DB_SQL_PATH = path.join(__dirname, "mydb.sql");

var args = {
  other: 10,
};
// *****

var SQL3;

async function main() {
  // define some SQLite3 databse helpers, make SQL3 promise based for get, all, exec
  var myDB = new sqlite3.Database(DB_PATH);
  SQL3 = {
    run(...args) {
      return new Promise(function c(resolve, reject) {
        myDB.run(...args, function onResult(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    },
    get: util.promisify(myDB.get.bind(myDB)),
    all: util.promisify(myDB.all.bind(myDB)),
    exec: util.promisify(myDB.exec.bind(myDB)),
  };

  var initSQL = fs.readFileSync(DB_SQL_PATH, "utf-8");
  await SQL3.exec(initSQL);

  var username = "firstUser";
  var something = "bla bla";

  var userID = await insertOrLookupUsername(username);
  if (userID) {
    // TODO

    return;
  }

  error("Oops");
}

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
                  Users (username, description, duration, date)
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
