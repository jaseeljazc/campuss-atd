import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PeriodBreakdown } from "@/components/attendance/PeriodBreakdown";
import {
  Loader2,
  ArrowLeft,
  Calendar as CalendarIcon,
  User,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "college-leave" | "class-leave";
  periods: Array<{
    period: number;
    status: "present" | "absent";
  }>;
}

interface ClassLeaveDay {
  date: string;
  semester: number;
  reason: string;
}

interface CollegeLeaveDay {
  date: string;
  reason: string;
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  semester: number | null;
  department: string;
}

interface StudentAttendanceCalendarProps {
  studentId: string;
  studentName: string;
  semester?: number;
  onBack: () => void;
}

export function StudentAttendanceCalendar({
  studentId,
  studentName,
  semester,
  onBack,
}: StudentAttendanceCalendarProps) {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [classLeaveDays, setClassLeaveDays] = useState<ClassLeaveDay[]>([]);
  const [collegeLeaveDays, setCollegeLeaveDays] = useState<CollegeLeaveDay[]>(
    [],
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendanceCalendar();
  }, [studentId, semester]);

  const fetchAttendanceCalendar = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getStudentAttendanceCalendar(
        studentId,
        semester ? { semester } : {},
      );
      setStudent(data.student);
      setAttendanceRecords(data.attendanceRecords || []);
      setClassLeaveDays(data.classLeaveDays || []);
      setCollegeLeaveDays(data.collegeLeaveDays || []);
    } catch (err: any) {
      const message =
        err.response?.data?.error || "Failed to load attendance calendar";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayStatus = (
    date: Date,
  ): "present" | "absent" | "college-leave" | "class-leave" | null => {
    const dateStr = format(date, "yyyy-MM-dd");

    // Priority: College Leave > Class Leave > Attendance

    // 1. Check if this is a College Leave (global)
    if (collegeLeaveDays.some((cl) => cl.date === dateStr)) {
      return "college-leave";
    }

    // 2. Check if this is a Class Leave for this student's semester
    if (
      student?.semester &&
      classLeaveDays.some(
        (cl) => cl.date === dateStr && cl.semester === student.semester,
      )
    ) {
      return "class-leave";
    }

    // 3. Check attendance record
    const record = attendanceRecords.find((r) => r.date === dateStr);
    if (!record) {
      return null;
    }

    return record.status;
  };

  const getDayClassName = (date: Date) => {
    const status = getDayStatus(date);
    if (!status) return "";

    const baseClasses = "relative";
    switch (status) {
      case "present":
        return cn(baseClasses, "bg-present-light text-present font-semibold");
      case "absent":
        return cn(baseClasses, "bg-absent-light text-absent font-semibold");
      case "college-leave":
        return cn(
          baseClasses,
          "bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 italic",
        );
      case "class-leave":
        return cn(
          baseClasses,
          "bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 italic",
        );
      default:
        return baseClasses;
    }
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDateRecord = attendanceRecords.find(
    (r) => r.date === selectedDateStr,
  );

  // Check leave status with priority
  const collegeLeaveForDate = collegeLeaveDays.find(
    (cl) => cl.date === selectedDateStr,
  );
  const classLeaveForDate = student?.semester
    ? classLeaveDays.find(
        (cl) => cl.date === selectedDateStr && cl.semester === student.semester,
      )
    : null;

  const isCollegeLeave =
    !!collegeLeaveForDate || selectedDateRecord?.status === "college-leave";
  const isClassLeave =
    !!classLeaveForDate || selectedDateRecord?.status === "class-leave";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Loading attendance calendar...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-absent mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <Button onClick={fetchAttendanceCalendar} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-elevated p-4">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-display">{studentName}</h2>
            {student && (
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                <span>Roll No: {student.rollNumber}</span>
                <span>Email: {student.email}</span>
                {student.semester && <span>Semester: {student.semester}</span>}
                <span>Department: {student.department}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Attendance Calendar
          {semester && (
            <span className="text-muted-foreground">- Semester {semester}</span>
          )}
        </h3>

        <div className="flex justify-center mb-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              present: (date) => getDayStatus(date) === "present",
              absent: (date) => getDayStatus(date) === "absent",
              collegeLeave: (date) => getDayStatus(date) === "college-leave",
              classLeave: (date) => getDayStatus(date) === "class-leave",
            }}
            modifiersClassNames={{
              present: "bg-present-light text-present font-semibold",
              absent: "bg-absent-light text-absent font-semibold",
              collegeLeave:
                "bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 italic",
              classLeave:
                "bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 italic",
            }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-present-light border border-present" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-absent-light border border-absent" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-950/20 border border-blue-700" />
            <span>College Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-950/20 border border-yellow-700" />
            <span>Class Leave</span>
          </div>
        </div>
      </div>

      {/* Day Details */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold font-display mb-4">
          Day Details - {format(selectedDate, "MMMM d, yyyy")}
        </h3>

        {isCollegeLeave ? (
          <div className="text-center py-8">
            <StatusBadge variant="college-leave" size="lg">
              {collegeLeaveForDate ? "College Leave" : "No Attendance Marked"}
            </StatusBadge>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">
                Reason:
              </p>
              <p className="text-sm text-muted-foreground">
                {collegeLeaveForDate?.reason ||
                  "No classes/attendance marked for this day"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Applies to all semesters
            </p>
          </div>
        ) : isClassLeave ? (
          <div className="text-center py-8">
            <StatusBadge variant="warning" size="lg">
              Class Leave
            </StatusBadge>
            {classLeaveForDate && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">
                  Reason:
                </p>
                <p className="text-sm text-muted-foreground">
                  {classLeaveForDate.reason}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Semester {classLeaveForDate?.semester} only
            </p>
          </div>
        ) : selectedDateRecord ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <StatusBadge
                variant={
                  selectedDateRecord.status === "present"
                    ? "present"
                    : selectedDateRecord.status === "absent"
                      ? "absent"
                      : "warning"
                }
                size="lg"
              >
                {selectedDateRecord.status === "present"
                  ? "Present"
                  : selectedDateRecord.status === "absent"
                    ? "Absent"
                    : "Partial Attendance"}
              </StatusBadge>
            </div>

            {/* Period Breakdown */}
            <div>
              <h4 className="text-sm font-semibold mb-3">
                Period-wise Attendance:
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {selectedDateRecord.periods.map((periodData) => (
                  <div
                    key={periodData.period}
                    className={cn(
                      "p-3 rounded-lg text-center",
                      periodData.status === "present"
                        ? "bg-present-light"
                        : "bg-absent-light",
                    )}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      Period {periodData.period}
                    </p>
                    <StatusBadge
                      variant={
                        periodData.status === "present" ? "present" : "absent"
                      }
                      size="sm"
                    >
                      {periodData.status === "present" ? "P" : "A"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No attendance record for this day</p>
          </div>
        )}
      </div>
    </div>
  );
}
