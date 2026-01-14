const { z } = require('zod');

const lowAttendanceSchema = z.object({
  query: z.object({
    department: z.string().optional(),
    semester: z.string().regex(/^\d+$/).optional(),
    threshold: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  }),
});

const semesterSummarySchema = z.object({
  query: z.object({
    department: z.string().optional(),
    semester: z.string().regex(/^\d+$/).optional(),
  }),
});

module.exports = {
  lowAttendanceSchema,
  semesterSummarySchema,
};
