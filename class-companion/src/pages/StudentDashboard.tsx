import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/services/api";
import { Header } from "@/components/layout/Header";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { format, subMonths, addMonths } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  TrendingUp,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/loader";

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

export function StudentDashboard() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [classLeaveDays, setClassLeaveDays] = useState<ClassLeaveDay[]>([]);
  const [collegeLeaveDays, setCollegeLeaveDays] = useState<CollegeLeaveDay[]>(
    [],
  );

  const currentStudent = user
    ? {
        id: user.id,
        name: user.name,
        rollNumber: user.rollNumber || user.email.split("@")[0],
        semester: user.semester || 1,
        department: user.department,
      }
    : null;
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch attendance calendar data
  useEffect(() => {
    if (!currentStudent) return;

    const fetchAttendanceData = async () => {
      try {
        console.log("Fetching attendance for student:", {
          id: currentStudent.id,
          semester: currentStudent.semester,
        });

        const filters = currentStudent.semester
          ? { semester: currentStudent.semester }
          : {};

        console.log("API filters:", filters);

        const data = await apiService.getStudentAttendanceCalendar(
          currentStudent.id,
          filters,
        );

        console.log("Dashboard fetched calendar data:", data);

        const records = data.attendanceRecords || [];
        const classLeaves = data.classLeaveDays || [];
        const collegeLeaves = data.collegeLeaveDays || [];

        setAttendanceRecords(records);
        setClassLeaveDays(classLeaves);
        setCollegeLeaveDays(collegeLeaves);
      } catch (error: any) {
        console.error("Failed to fetch attendance data:", error);
        console.error("Error details:", error.response?.data || error.message);
        // Set empty arrays on error to prevent UI issues
        setAttendanceRecords([]);
        setCollegeLeaveDays([]);
      }
    };

    fetchAttendanceData();
  }, [currentStudent?.id, currentStudent?.semester]);

  // Calculate attendance percentage from calendar data (excluding college leave days)
  const attendancePercentage = useMemo(() => {
    console.log(
      "Calculating percentage - Records:",
      attendanceRecords.length,
      "College leaves:",
      collegeLeaveDays.length,
    );

    if (!currentStudent) {
      console.log("No current student");
      return 0;
    }

    if (attendanceRecords.length === 0) {
      console.log("No attendance records");
      return 0;
    }

    // Filter out college leave days and future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validRecords = attendanceRecords.filter((r) => {
      const recordDate = new Date(r.date);
      recordDate.setHours(0, 0, 0, 0);
      // Exclude both College Leave and Class Leave
      const isCollegeLeaveDay = collegeLeaveDays.some(
        (cl) => cl.date === r.date,
      );
      const isClassLeaveDay = classLeaveDays.some(
        (cl) => cl.date === r.date && cl.semester === currentStudent.semester,
      );
      return !isCollegeLeaveDay && !isClassLeaveDay && recordDate <= today;
    });

    console.log(
      "Valid records (excluding college leaves and future dates):",
      validRecords.length,
    );

    const presentDays = validRecords.filter(
      (r) => r.status === "present",
    ).length;
    const totalDays = validRecords.filter(
      (r) => r.status === "present" || r.status === "absent",
    ).length;

    const percentage =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    console.log("Percentage calculation:", {
      presentDays,
      totalDays,
      percentage,
    });

    return percentage;
  }, [currentStudent, attendanceRecords, classLeaveDays, collegeLeaveDays]);

  // Calculate total present/absent days (excluding college leave days)
  const { presentDays, absentDays, totalDays } = useMemo(() => {
    if (!currentStudent || attendanceRecords.length === 0) {
      return { presentDays: 0, absentDays: 0, totalDays: 0 };
    }

    // Filter out both College Leave and Class Leave days
    const validRecords = attendanceRecords.filter((r) => {
      const isCollegeLeaveDay = collegeLeaveDays.some(
        (cl) => cl.date === r.date,
      );
      const isClassLeaveDay = classLeaveDays.some(
        (cl) => cl.date === r.date && cl.semester === currentStudent.semester,
      );
      return !isCollegeLeaveDay && !isClassLeaveDay;
    });

    const present = validRecords.filter((r) => r.status === "present").length;
    const absent = validRecords.filter((r) => r.status === "absent").length;

    return {
      presentDays: present,
      absentDays: absent,
      totalDays: present + absent,
    };
  }, [currentStudent, attendanceRecords, classLeaveDays, collegeLeaveDays]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDateRecord = attendanceRecords.find(
    (r) => r.date === selectedDateStr,
  );

  // Check for both leave types
  const collegeLeaveForDate = collegeLeaveDays.find(
    (cl) => cl.date === selectedDateStr,
  );
  const classLeaveForDate = currentStudent
    ? classLeaveDays.find(
        (cl) =>
          cl.date === selectedDateStr &&
          cl.semester === currentStudent.semester,
      )
    : null;

  const isCollegeLeave = !!collegeLeaveForDate;
  const isClassLeave = !!classLeaveForDate;

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  if (!currentStudent) {
    return null;
  }

  const isLowAttendance = attendancePercentage < 75;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-4 px-3 sm:py-6 sm:px-4">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display mb-1">
              Hello, {currentStudent.name.split(" ")[0]}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              <span className="hidden xs:inline">
                {currentStudent.rollNumber} •{" "}
              </span>
              <span className="hidden xs:inline">
                Semester {currentStudent.semester} •{" "}
              </span>
              <span>{currentStudent.department}</span>
            </p>
          </div>

          {isLowAttendance && (
            <StatusBadge
              variant="warning"
              size="lg"
              icon={<AlertTriangle className="w-4 h-4" />}
            >
              <span className="hidden xs:inline">Attendance Below 75%</span>
              <span className="xs:hidden">Low Attendance</span>
            </StatusBadge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            title="Attendance"
            value={`${attendancePercentage}%`}
            subtitle={
              isLowAttendance
                ? "Below minimum requirement"
                : totalDays === 0
                  ? "No attendance data"
                  : "Great job!"
            }
            icon={<TrendingUp className="w-5 h-5" />}
            variant={
              isLowAttendance
                ? "danger"
                : totalDays === 0
                  ? "default"
                  : "success"
            }
          />
          <StatCard
            title="Present Days"
            value={presentDays}
            subtitle={`Out of ${totalDays} days`}
            icon={<CalendarIcon className="w-5 h-5" />}
            variant="success"
          />
          <StatCard
            title="Absent Days"
            value={absentDays}
            subtitle="Full day absences"
            icon={<Clock className="w-5 h-5" />}
            variant={absentDays > 5 ? "danger" : "default"}
          />
          <StatCard
            title="College Leaves"
            value={collegeLeaveDays.length}
            subtitle="Not affecting percentage"
            icon={<GraduationCap className="w-5 h-5" />}
            variant="info"
          />
        </div>

        {/* Semester Progress */}
        <div className="card-elevated p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-semibold font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="hidden xs:inline">
                Semester {currentStudent.semester} Attendance
              </span>
              <span className="xs:hidden">Sem {currentStudent.semester}</span>
            </h3>
            <span className="text-xl sm:text-2xl font-bold font-display"></span>
          </div>
          <ProgressBar
            value={attendancePercentage}
            size="lg"
            showLabel={false}
          />
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mt-3 gap-1 xs:gap-0 text-xs sm:text-sm">
            <span className="text-muted-foreground">Minimum Required: 75%</span>
            <span
              className={
                attendancePercentage >= 75
                  ? "text-present font-medium"
                  : "text-absent font-medium"
              }
            >
              {attendancePercentage >= 75
                ? `${attendancePercentage - 75}% above`
                : `${75 - attendancePercentage}% below`}
            </span>
          </div>
        </div>

        {/* Calendar and Period Breakdown */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-4 gap-3">
              <h3 className="text-sm sm:text-base font-semibold font-display">
                Attendance Calendar
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs sm:text-sm font-medium min-w-[100px] sm:min-w-[120px] text-center">
                  {format(selectedDate, "MMM yyyy")}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <AttendanceCalendar
              studentId={currentStudent.id}
              semester={currentStudent.semester}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              attendanceRecords={attendanceRecords}
              classLeaveDays={classLeaveDays}
              collegeLeaveDays={collegeLeaveDays}
            />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-semibold font-display mb-4">
              Day Details - {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            <div className="card-elevated p-4 sm:p-6">
              {isCollegeLeave ? (
                <div className="text-center py-8">
                  <StatusBadge variant="college-leave" size="lg">
                    College Leave
                  </StatusBadge>
                  {collegeLeaveForDate && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Reason:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {collegeLeaveForDate.reason}
                      </p>
                    </div>
                  )}
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
                              periodData.status === "present"
                                ? "present"
                                : "absent"
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
        </div>
      </main>
    </div>
  );
}
