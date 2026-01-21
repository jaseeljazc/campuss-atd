import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { UserRole } from "@/data/mockData";

// Types matching backend responses
export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  semester: number;
  department: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedSemesters: number[];
  assignedPeriods: number[];
}

export interface AttendanceRecord {
  id: string; // Frontend composite ID
  backendId?: string; // Backend MongoDB _id
  studentId: string;
  date: string;
  period: number;
  status: "present" | "absent";
  markedBy: string;
  markedAt: string;
  semester: number;
  department: string;
}

export interface ClassLeaveDay {
  date: string;
  semester: number;
  reason: string;
}

export interface CollegeLeaveDay {
  date: string;
  reason: string;
}

interface AppContextType {
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  classLeaveDays: ClassLeaveDay[];
  collegeLeaveDays: CollegeLeaveDay[];
  isLoading: boolean;
  currentRole: UserRole | null;
  currentUserId: string | null;
  setCurrentRole: (role: UserRole) => void;
  setCurrentUserId: (id: string) => void;
  markAttendance: (data: {
    department: string;
    semester: number;
    date: string;
    period: number;
    records: Array<{ studentId: string; status: "present" | "absent" }>;
  }) => Promise<void>;
  updateAttendance: (
    attendanceId: string,
    records: Array<{ studentId: string; status: "present" | "absent" }>,
  ) => Promise<boolean>;
  deleteAttendance: (attendanceId: string) => Promise<void>;
  markClassLeave: (
    semester: number,
    date: string,
    reason: string,
  ) => Promise<void>;
  markCollegeLeave: (date: string, reason: string) => Promise<void>;
  removeClassLeave: (semester: number, date: string) => Promise<void>;
  removeCollegeLeave: (date: string) => Promise<void>;
  isCollegeLeave: (date: string) => boolean;
  isClassLeave: (date: string, semester: number) => boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [classLeaveDays, setClassLeaveDays] = useState<ClassLeaveDay[]>([]);
  const [collegeLeaveDays, setCollegeLeaveDays] = useState<CollegeLeaveDay[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Transform backend attendance records to frontend format
  const transformAttendanceRecords = (
    backendRecords: any[],
  ): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    backendRecords.forEach((record) => {
      record.records?.forEach((rec: any) => {
        records.push({
          id: `${rec.studentId}-${record.date.split("T")[0]}-${record.period}`,
          backendId: record._id || record.id, // Store backend ID
          studentId: rec.studentId,
          date: record.date.split("T")[0],
          period: record.period,
          status: rec.status,
          markedBy: record.teacherId?.id || record.teacherId || "",
          markedAt: record.createdAt || new Date().toISOString(),
          semester: record.semester,
          department: record.department,
        });
      });
    });
    return records;
  };

  // Transform student attendance records (different format from department)
  const transformStudentAttendanceRecords = (
    backendRecords: any[],
  ): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    backendRecords.forEach((record) => {
      records.push({
        id: `${record.studentId}-${record.date.split("T")[0]}-${record.period}`,
        backendId: record._id || record.id,
        studentId: record.studentId,
        date: record.date.split("T")[0],
        period: record.period,
        status: record.status,
        markedBy: record.teacherId?.id || record.teacherId || "",
        markedAt: record.createdAt || new Date().toISOString(),
        semester: record.semester,
        department: record.department,
      });
    });
    return records;
  };

  const refreshData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch users (all Computer Science)
      const users = await apiService.getUsers({});

      // Transform and filter students
      const studentsList = users
        .filter((u: any) => u.role === "student")
        .map((u: any) => ({
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          rollNumber:
            u.rollNumber ||
            `${u.department
              ?.substring(0, 2)
              .toUpperCase()}2024${u.id?.substring(0, 6)}`,
          semester: u.semester,
          department: u.department,
        })) as Student[];

      // Transform and filter teachers
      const teachersList = users
        .filter((u: any) => u.role === "teacher")
        .map((u: any) => ({
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          department: "Computer Science",
        })) as Teacher[];

      setStudents(studentsList);
      setTeachers(teachersList);

      // Fetch class leaves
      const classLeaves = await apiService.getClassLeaves({});
      setClassLeaveDays(
        classLeaves.map((leave: any) => ({
          date: leave.date.split("T")[0],
          semester: leave.semester,
          reason: leave.reason,
        })),
      );

      // Fetch college leaves
      const collegeLeaves = await apiService.getCollegeLeaves({});
      setCollegeLeaveDays(
        collegeLeaves.map((leave: any) => ({
          date: leave.date.split("T")[0],
          reason: leave.reason,
        })),
      );

      // Fetch attendance based on role
      if (user.role === "student") {
        const attendance = await apiService.getStudentAttendance(user.id);
        setAttendanceRecords(
          transformStudentAttendanceRecords(attendance.records || []),
        );
      } else if (user.role === "teacher" || user.role === "hod") {
        const attendance = await apiService.getDepartmentAttendance({
          department: user.department || "Computer Science",
        });
        setAttendanceRecords(transformAttendanceRecords(attendance || []));
      }
    } catch (error: any) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  const markAttendance = useCallback(
    async (data: {
      department: string;
      semester: number;
      date: string;
      period: number;
      records: Array<{ studentId: string; status: "present" | "absent" }>;
    }) => {
      try {
        await apiService.markAttendance(data);
        toast.success("Attendance marked successfully");
        // Removed refreshData() to preserve optimistic UI updates
      } catch (error: any) {
        const message =
          error.response?.data?.error || "Failed to mark attendance";
        toast.error(message);
        throw error;
      }
    },
    [refreshData],
  );

  const updateAttendance = useCallback(
    async (
      backendAttendanceId: string,
      records: Array<{ studentId: string; status: "present" | "absent" }>,
    ): Promise<boolean> => {
      try {
        await apiService.updateAttendance(backendAttendanceId, records);
        toast.success("Attendance updated successfully");
        // Removed refreshData() to preserve optimistic UI updates
        return true;
      } catch (error: any) {
        const message =
          error.response?.data?.error || "Failed to update attendance";
        toast.error(message);
        return false;
      }
    },
    [refreshData],
  );

  const deleteAttendance = useCallback(
    async (attendanceId: string) => {
      try {
        await apiService.deleteAttendance(attendanceId);
        toast.success("Attendance deleted successfully");
        await refreshData();
      } catch (error: any) {
        const message =
          error.response?.data?.error || "Failed to delete attendance";
        toast.error(message);
      }
    },
    [refreshData],
  );

  // Class Leave (semester-specific)
  const markClassLeave = useCallback(
    async (semester: number, date: string, reason: string) => {
      if (!user) return;
      try {
        await apiService.markClassLeave({
          semester,
          date,
          reason,
        });
        toast.success(
          `Class leave marked for Semester ${semester} successfully`,
        );
        await refreshData();
      } catch (error: any) {
        const message =
          error.response?.data?.error || "Failed to mark class leave";
        toast.error(message);
      }
    },
    [user, refreshData],
  );

  // College Leave (global)
  const markCollegeLeave = useCallback(
    async (date: string, reason: string) => {
      if (!user) return;
      try {
        await apiService.markCollegeLeave({
          date,
          reason,
        });
        toast.success("College leave marked successfully");
        await refreshData();
      } catch (error: any) {
        const message =
          error.response?.data?.error || "Failed to mark college leave";
        toast.error(message);
      }
    },
    [user, refreshData],
  );

  // Remove Class Leave (semester-specific)
  const removeClassLeave = useCallback(
    async (semester: number, date: string) => {
      if (!user) return;
      try {
        await apiService.deleteClassLeave(semester, date);
        toast.success(
          `Class leave removed for Semester ${semester} successfully`,
        );
        await refreshData();
      } catch (error: any) {
        const message =
          error.response?.data?.error || "Failed to remove class leave";
        toast.error(message);
      }
    },
    [user, refreshData],
  );

  // Remove College Leave (global)
  const removeCollegeLeave = useCallback(
    async (date: string) => {
      if (!user) return;
      try {
        await apiService.deleteCollegeLeave(date);
        toast.success("College leave removed successfully");
        await refreshData();
      } catch (error: any) {
        const message =
          error.response?.data?.error || "Failed to remove college leave";
        toast.error(message);
      }
    },
    [user, refreshData],
  );

  const isCollegeLeave = useCallback(
    (date: string): boolean => {
      return collegeLeaveDays.some((d) => d.date === date);
    },
    [collegeLeaveDays],
  );

  const isClassLeave = useCallback(
    (date: string, semester: number): boolean => {
      return classLeaveDays.some(
        (d) => d.date === date && d.semester === semester,
      );
    },
    [classLeaveDays],
  );

  return (
    <AppContext.Provider
      value={{
        students,
        teachers,
        attendanceRecords,
        classLeaveDays,
        collegeLeaveDays,
        isLoading,
        currentRole,
        currentUserId,
        setCurrentRole,
        setCurrentUserId,
        markAttendance,
        updateAttendance,
        deleteAttendance,
        markClassLeave,
        markCollegeLeave,
        removeClassLeave,
        removeCollegeLeave,
        isCollegeLeave,
        isClassLeave,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
