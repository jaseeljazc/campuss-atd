// Types
export type UserRole = "student" | "teacher" | "hod";

export type AttendanceStatus = "present" | "absent" | "not-marked";

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  semester: number;
  department: string;
}

// Constants
export const departments = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
];

export const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export const periods = [1, 2, 3, 4, 5];

// Helper functions
export function getStudentsByDepartmentAndSemester(
  department: string,
  semester: number
): Student[] {
  // This function is a placeholder since students are now fetched from the backend
  // It returns an empty array as the actual data comes from AppContext
  return [];
}

export function calculateAttendancePercentage(
  studentId: string,
  semester: number,
  collegeLeaveDates: string[]
): number {
  // This function is a placeholder for attendance calculation
  // The actual calculation should be done in the backend or AppContext
  return 0;
}
