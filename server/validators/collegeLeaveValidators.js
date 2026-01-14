const { z } = require('zod');

const createCollegeLeaveSchema = z.object({
  body: z.object({
    department: z.string().min(1, 'Department is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    reason: z.string().min(1, 'Reason is required'),
  }),
});

const getCollegeLeaveSchema = z.object({
  query: z.object({
    department: z.string().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});

module.exports = {
  createCollegeLeaveSchema,
  getCollegeLeaveSchema,
};
