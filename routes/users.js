var express = require("express");
var router = express.Router();

// Require our controllers.
var users_controller = require("../controllers/usersController.js");

/// Users ROUTES ///

// GET list of exercises for all users.
router.get("/", users_controller.index);

// POST request for creating User.
router.post("/", users_controller.user_create);

// GET request for a user's logs.
router.get("/:_id/logs", users_controller.user_get_logs);

// POST request to add a log for a user.
router.post("/:_id/exercises", users_controller.user_create_logs);

module.exports = router;
