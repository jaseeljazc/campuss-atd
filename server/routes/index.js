const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const attendanceRoutes = require("./attendanceRoutes");
const leaveRoutes = require("./leaveRoutes");
const analyticsRoutes = require("./analyticsRoutes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/", leaveRoutes); // Handles both /class-leave and /college-leave
router.use("/analytics", analyticsRoutes);

module.exports = router;
