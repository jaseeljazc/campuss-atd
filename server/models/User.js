const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { ROLES } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: [ROLES.TEACHER, ROLES.STUDENT, ROLES.HOD],
      default: ROLES.STUDENT,
    },
    department: { type: String, default: "Computer Science", immutable: true },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      required: function () {
        return this.role === ROLES.STUDENT;
      },
    },
    refreshTokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Virtual field for rollNumber generation
userSchema.virtual("rollNumber").get(function () {
  if (this.role !== ROLES.STUDENT) return undefined;

  // Use last 6 characters of MongoDB ID for uniqueness
  const idSuffix = this._id.toString().slice(-6).toUpperCase();
  return `CS2024${idSuffix}`;
});

// Ensure virtual fields are included in JSON output
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
