const { z } = require("zod");
const { ATTENDANCE_STATUS, PERIODS } = require("../utils/constants");

const markAttendanceSchema = z.object({
  body: z.object({
    // Department is hardcoded to 'Computer Science', no validation needed
    semester: z
      .number()
      .int()
      .min(1)
      .max(8, "Semester must be between 1 and 8"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    period: z
      .number()
      .int()
      .refine((val) => PERIODS.includes(val), {
        message: "Period must be between 1 and 5",
      }),
    records: z
      .array(
        z.object({
          studentId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid student ID"),
          status: z.enum([ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.ABSENT]),
        })
      )
      .min(1, "At least one attendance record is required"),
  }),
});

const updateAttendanceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid attendance ID"),
  }),
  body: z.object({
    records: z
      .array(
        z.object({
          studentId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid student ID"),
          status: z.enum([ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.ABSENT]),
        })
      )
      .min(1, "At least one attendance record is required"),
  }),
});

const getStudentAttendanceSchema = z.object({
  params: z.object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid student ID"),
  }),
  query: z.object({
    semester: z.string().regex(/^\d+$/).optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
});

// Department is always 'Computer Science', no params needed
const getDepartmentAttendanceSchema = z.object({
  query: z.object({
    semester: z.string().regex(/^\d+$/).optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
});

module.exports = {
  markAttendanceSchema,
  updateAttendanceSchema,
  getStudentAttendanceSchema,
  getDepartmentAttendanceSchema,
};
