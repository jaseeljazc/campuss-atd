const { z } = require('zod');
const { ROLES } = require('../utils/constants');

const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
  body: z.object({
    role: z.enum([ROLES.TEACHER, ROLES.STUDENT, ROLES.HOD], {
      errorMap: () => ({ message: 'Role must be teacher, student, or hod' }),
    }),
  }),
});

module.exports = {
  updateRoleSchema,
};
