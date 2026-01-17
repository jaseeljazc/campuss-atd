const app = require("../app");
const connectDB = require("../config/db");

module.exports = async (req, res) => {
  // Ensure database is connected
  await connectDB();

  // Hand off to Express app
  return app(req, res);
};
