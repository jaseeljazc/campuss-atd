const mongoose = require("mongoose");
const { ATTENDANCE_STATUS, PERIODS } = require("../utils/constants");

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.ABSENT],
      required: true,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    department: { type: String, default: "Computer Science", immutable: true },
    semester: { type: Number, required: true, index: true },
    date: { type: Date, required: true, index: true },
    period: { type: Number, enum: PERIODS, required: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    records: { type: [attendanceRecordSchema], default: [] },
  },
  { timestamps: true }
);

attendanceSchema.index({ semester: 1, date: 1, period: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
