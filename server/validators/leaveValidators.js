const { z } = require("zod");

// ============ CLASS LEAVE VALIDATORS ============

const markClassLeaveSchema = z.object({
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

const getClassLeavesSchema = z.object({
  query: z.object({
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

// ============ COLLEGE LEAVE VALIDATORS ============

const markCollegeLeaveSchema = z.object({
  body: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    reason: z.string().min(3, "Reason must be at least 3 characters"),
  }),
});

const getCollegeLeavesSchema = z.object({
  query: z.object({
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
  markClassLeaveSchema,
  getClassLeavesSchema,
  markCollegeLeaveSchema,
  getCollegeLeavesSchema,
};
