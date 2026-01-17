const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  HOD: "hod",
};

const PERIODS = [1, 2, 3, 4, 5];

const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
};

const DAY_PRESENT_THRESHOLD = 3; // must be present in at least 3 of 5 periods

module.exports = {
  ROLES,
  PERIODS,
  ATTENDANCE_STATUS,
  DAY_PRESENT_THRESHOLD,
};
