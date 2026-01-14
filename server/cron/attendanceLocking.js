const cron = require('node-cron');
const attendanceService = require('../services/attendanceService');
const logger = require('../config/logger');

function attendanceLockingJob() {
  // Run every hour to lock attendance records older than 1 hour
  cron.schedule('0 * * * *', async () => {
    try {
      const lockedCount = await attendanceService.checkAndLockAttendance();
      if (lockedCount > 0) {
        logger.info(`Locked ${lockedCount} attendance records`);
      }
    } catch (error) {
      logger.error(`Error in attendance locking cron job: ${error.message}`, { stack: error.stack });
    }
  });
  
  logger.info('Attendance locking cron job scheduled');
}

module.exports = attendanceLockingJob;
