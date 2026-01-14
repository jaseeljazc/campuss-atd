require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const env = require('../config/env');
const logger = require('../config/logger');

async function seedHOD() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.mongoUri);
    logger.info('Connected to MongoDB');

    // Check if HOD user already exists
    const existingHOD = await User.findOne({ email: 'hod@gmail.com' });
    
    if (existingHOD) {
      // Update existing HOD user
      existingHOD.role = 'hod';
      existingHOD.passwordHash = await bcrypt.hash('123456', 10);
      await existingHOD.save();
      logger.info('HOD user updated successfully');
      console.log('✅ HOD user updated: hod@gmail.com / 123456');
    } else {
      // Create new HOD user
      const passwordHash = await bcrypt.hash('123456', 10);
      const hodUser = new User({
        name: 'Head of Department',
        email: 'hod@gmail.com',
        passwordHash,
        role: 'hod',
        department: 'Computer Science', // Default department, can be changed
        assignedSemesters: [],
        assignedPeriods: [],
      });

      await hodUser.save();
      logger.info('HOD user created successfully');
      console.log('✅ HOD user created: hod@gmail.com / 123456');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding HOD user:', error);
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedHOD();
