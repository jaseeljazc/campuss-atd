const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const collegeLeaveRoutes = require('./collegeLeaveRoutes');
const analyticsRoutes = require('./analyticsRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/college-leave', collegeLeaveRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
