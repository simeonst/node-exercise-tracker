const db = require("../models/database");

exports.getAllUsers = async function () {
  const res = await db.all(`
    SELECT 
        id as _id, username
    FROM
        Users
    `);
  return res;
};

exports.createUser = async function (username) {
  await db.run(`INSERT INTO Users (username) VALUES (?)`, username);
  const row = await db.get("SELECT last_insert_rowid() as id FROM Users");
  return row;
};

exports.getUserByID = async function (id) {
  const data = await db.get("SELECT username FROM Users WHERE id=(?)", id);
  return data;
};

exports.getUserLogs = async function (username, from, to) {
  let fromParam = "";
  if (from) {
    fromParam = ` AND date>="${from}"`;
  }

  let toParam = "";
  if (to) {
    toParam = ` AND date<="${to}"`;
  }

  const query = `
      SELECT description, duration, date
      FROM Exercises
      WHERE username=(?)${fromParam}${toParam}
      `;

  const result = await db.all(query, username);
  return result;
};

exports.postNewExercise = async function (
  username,
  description,
  duration,
  date
) {
  await db.run(
    `INSERT INTO Exercises (username, description, duration, date) VALUES (?,?,?,?)`,
    [username, description, duration, date]
  );
  return;
};
