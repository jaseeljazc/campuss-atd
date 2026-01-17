const mongoose = require("mongoose");

const classLeaveSchema = new mongoose.Schema(
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

classLeaveSchema.index({ date: 1, semester: 1 }, { unique: true });

const ClassLeave = mongoose.model("ClassLeave", classLeaveSchema);

module.exports = ClassLeave;
