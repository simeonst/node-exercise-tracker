exports.exercises = `Exercises (
    id INTEGER PRIMARY KEY ASC,
    username VARCHAR(40),
    description STRING,
    duration INTEGER,
    date STRING,
    FOREIGN KEY (username) REFERENCES Users (username)
)`;

exports.users = `Users (
    id INTEGER PRIMARY KEY ASC,
    username VARCHAR(40) UNIQUE
    )`;
