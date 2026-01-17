const { z } = require("zod");

const createCollegeLeaveSchema = z.object({
  body: z.object({
    department: z.string().min(1, "Department is required"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    reason: z.string().min(1, "Reason is required"),
  }),
});

const getCollegeLeaveSchema = z.object({
  query: z.object({
    department: z.string().optional(),
    semester: z.number().int().min(1).max(8).optional(),
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

const markSemesterCollegeLeaveSchema = z.object({
  body: z.object({
    semester: z
      .number()
      .int()
      .min(1, "Semester must be between 1 and 8")
      .max(8, "Semester must be between 1 and 8"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    reason: z.string().min(3, "Reason must be at least 3 characters"),
  }),
});

module.exports = {
  createCollegeLeaveSchema,
  getCollegeLeaveSchema,
  markSemesterCollegeLeaveSchema,
};
