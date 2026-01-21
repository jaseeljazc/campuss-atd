const { z } = require("zod");

const lowAttendanceSchema = z.object({
  query: z.object({
    department: z.string().optional(),
    semester: z.string().regex(/^\d+$/).optional(),
    threshold: z
      .string()
      .regex(/^\d+(\.\d+)?$/)
      .optional(),
  }),
});

const semesterSummarySchema = z.object({
  query: z.object({
    department: z.string().optional(),
    semester: z.string().regex(/^\d+$/).optional(),
  }),
});

const getStudentsAttendanceSchema = z.object({
  query: z.object({
    semester: z.string().regex(/^\d+$/).optional(),
  }),
});

const getStudentAttendanceCalendarSchema = z.object({
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

module.exports = {
  lowAttendanceSchema,
  semesterSummarySchema,
  getStudentsAttendanceSchema,
  getStudentAttendanceCalendarSchema,
};
