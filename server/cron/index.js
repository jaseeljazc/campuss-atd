const dailyCollegeLeaveJob = require('./dailyCollegeLeave');
const attendanceLockingJob = require('./attendanceLocking');
const logger = require('../config/logger');

function initCronJobs() {
  dailyCollegeLeaveJob();
  attendanceLockingJob();
  logger.info('Cron jobs initialized');
}

module.exports = { initCronJobs };

