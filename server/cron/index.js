const dailyCollegeLeaveJob = require("./dailyCollegeLeave");
const logger = require("../config/logger");

function initCronJobs() {
  dailyCollegeLeaveJob();
  logger.info("Cron jobs initialized");
}

module.exports = { initCronJobs };
