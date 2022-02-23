PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Exercises (
    id INTEGER PRIMARY KEY ASC,
    username INTEGER,
    description STRING,
    duration INTEGER,
    date STRING

    FOREIGN KEY (username) REFERENCES Users(username)
);

CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY ASC,
    username VARCHAR(40) UNIQUE
);