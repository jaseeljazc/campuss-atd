const { z } = require("zod");

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["teacher", "student"]).optional(),
    // Department is hardcoded to 'Computer Science', no validation needed
    semester: z.number().int().min(1).max(8).optional(), // For students
    assignedSemesters: z.array(z.number().int().min(1).max(8)).optional(), // For teachers
    assignedPeriods: z.array(z.number().int().min(1).max(5)).optional(), // For teachers
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required").optional(),
  }),
});

module.exports = {
  loginSchema,
  signupSchema,
  refreshTokenSchema,
  logoutSchema,
};
