const access = require("../models/access");

exports.index = async function (req, res) {
  try {
    const result = await access.getAllUsers();

    result.forEach((row) => {
      const strID = row._id.toString();
      row._id = strID;
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
};

exports.user_create = async function (req, res) {
  const username = req.body?.username;

  if (username && typeof username === "string") {
    try {
      const row = await access.createUser(username);
      const strID = row.id.toString();

      res.status(201).json({
        _id: strID,
        username: username,
      });
      return;
    } catch (error) {
      res.status(400).json({ error: error.message });
      return;
    }
  } else {
    res.status(400).json({ error: "Try a different username" });
  }
};

exports.user_get_logs = async function (req, res) {
  const id = req.params._id;
  const { from, to, limit } = req.query;

  const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/gm;
  try {
    if (id) {
      const isValidId = parseInt(id);
      if (!isValidId || isValidId < 1) {
        throw new Error("Invalid user ID.");
      }
    }

    if (from) {
      const fromIsValid = from.match(dateRegex);
      if (!fromIsValid) {
        throw new Error(
          "Invalid date format for FROM parameter. Must be in format YYYY-MM-DD"
        );
      }
    }

    if (to) {
      const toIsValid = to.match(dateRegex);
      if (!toIsValid) {
        throw new Error(
          "Invalid date format for TO parameter. Must be in format YYYY-MM-DD"
        );
      }
    }

    if (limit) {
      const isLimitValid = parseInt(limit);
      if (!isLimitValid || isLimitValid < 1) {
        throw new Error("Invalid limit. Please provide a positive integer.");
      }
    }

    const data = await access.getUserByID(id);

    if (typeof data === "undefined" || !data || !data.username) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const username = data.username;
    const result = await access.getUserLogs(username, from, to);

    let resultsToReturn = result;

    if (limit) {
      resultsToReturn = result.slice(0, limit);
    }

    resultsToReturn.forEach((obj) => {
      const strDate = new Date(obj.date).toDateString();
      obj.date = strDate;
    });

    res.status(200).json({
      _id: id,
      username: username,
      count: result.length,
      log: resultsToReturn,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
};

exports.user_create_logs = async function (req, res) {
  const id = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  let date = req.body.date;
  let parsedDate = Date.parse(date);

  try {
    if (!id || !parseInt(id) || parseInt(id) < 0) {
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
      const data = await access.getUserByID(id);
      if (!data) {
        throw new Error("A user with that id does not exist");
      }
      const username = data.username;

      if (!date) {
        date = new Date().toISOString().split("T")[0];
      } else {
        date = new Date(date).toISOString().split("T")[0];
      }
      const dateStr = new Date(date).toDateString();

      await access.postNewExercise(username, description, duration, date);

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
};
