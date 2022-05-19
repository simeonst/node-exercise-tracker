const { dirname } = require("path");
const appDir = dirname(require.main.filename);

exports.index = function (req, res) {
  res.sendFile(appDir + "/views/index.html");
};
