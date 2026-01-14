const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const CollegeLeave = require('../models/CollegeLeave');
const User = require('../models/User');
const collegeLeaveService = require('../services/collegeLeaveService');
const logger = require('../config/logger');

function dailyCollegeLeaveJob() {
  // Run every day at 23:55 server time
  cron.schedule('55 23 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = today.toISOString().split('T')[0];

      // Find all departments from users (teachers, students, hods)
      const departments = await User.distinct('department', { department: { $ne: null } });

      if (!departments || departments.length === 0) {
        logger.info('No departments found for college leave check');
        return;
      }

      for (const dept of departments) {
        try {
          await collegeLeaveService.checkAndCreateCollegeLeave(dept, targetDate);
        } catch (error) {
          logger.error(`Error checking college leave for ${dept}: ${error.message}`);
        }
      }
    } catch (err) {
      logger.error('Error in daily college leave cron job', { error: err.message, stack: err.stack });
    }
  });
  
  logger.info('Daily college leave cron job scheduled');
}

module.exports = dailyCollegeLeaveJob;

