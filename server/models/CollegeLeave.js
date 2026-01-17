const mongoose = require("mongoose");

const collegeLeaveSchema = new mongoose.Schema(
  {
    department: { type: String, default: "Computer Science", immutable: true },
    semester: { type: Number, required: true, index: true },
    date: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

collegeLeaveSchema.index({ date: 1, semester: 1 }, { unique: true });

const CollegeLeave = mongoose.model("CollegeLeave", collegeLeaveSchema);

module.exports = CollegeLeave;
