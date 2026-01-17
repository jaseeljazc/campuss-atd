import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { semesters, periods } from "@/data/mockData";
import { format } from "date-fns";
import {
  CalendarIcon,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentAttendanceList } from "@/components/analytics/StudentAttendanceList";
import { StudentAttendanceCalendar } from "@/components/analytics/StudentAttendanceCalendar";

export function TeacherDashboard() {
  const { attendanceRecords, students, isLoading } = useApp();
  const { user } = useAuth();

  const [selectedDepartment, setSelectedDepartment] = useState(
    user?.department || "",
  );
  const [selectedSemester, setSelectedSemester] = useState<number>(3);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

  // Student Analytics state
  const [analyticsSemester, setAnalyticsSemester] = useState<
    number | undefined
  >(undefined);
  const [lowAttendanceOnly, setLowAttendanceOnly] = useState(false);
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          s.department === selectedDepartment &&
          s.semester === selectedSemester,
      ),
    [students, selectedDepartment, selectedSemester],
  );

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Calculate stats for selected class
  const todayRecords = attendanceRecords.filter(
    (r) =>
      r.date === dateStr &&
      r.semester === selectedSemester &&
      r.department === selectedDepartment,
  );

  const periodRecords = todayRecords.filter((r) => r.period === selectedPeriod);
  const markedCount = periodRecords.length;
  const presentCount = periodRecords.filter(
    (r) => r.status === "present",
  ).length;
  const absentCount = periodRecords.filter((r) => r.status === "absent").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-4 px-3 sm:py-6 sm:px-4">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold font-display mb-1">
            Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"},{" "}
            <span className="hidden xs:inline">
              {user?.name?.split(" ")[1] || "Teacher"}
            </span>
            <span className="xs:hidden">Teacher</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Mark and manage attendance for your classes
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mark-attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mark-attendance">
              <BookOpen className="w-4 h-4 mr-2" />
              Mark Attendance
            </TabsTrigger>
            <TabsTrigger value="student-analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Student Analytics
            </TabsTrigger>
          </TabsList>

          {/* Mark Attendance Tab */}
          <TabsContent value="mark-attendance" className="space-y-6">
            {/* Filters */}
            <div className="card-elevated p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="w-full">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Department
                  </label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={user?.department || ""}>
                        {user?.department || "Select Department"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Semester
                  </label>
                  <Select
                    value={selectedSemester.toString()}
                    onValueChange={(v) => setSelectedSemester(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="w-full">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Period
                  </label>
                  <Select
                    value={selectedPeriod.toString()}
                    onValueChange={(v) => setSelectedPeriod(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period} value={period.toString()}>
                          Period {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Total Students"
                value={filteredStudents.length}
                icon={<Users className="w-5 h-5" />}
                variant="info"
              />
              <StatCard
                title="Marked"
                value={`${markedCount}/${filteredStudents.length}`}
                icon={<CheckCircle2 className="w-5 h-5" />}
                variant={
                  markedCount === filteredStudents.length
                    ? "success"
                    : "default"
                }
              />
              <StatCard
                title="Present"
                value={presentCount}
                icon={<CheckCircle2 className="w-5 h-5" />}
                variant="success"
              />
              <StatCard
                title="Absent"
                value={absentCount}
                icon={<Clock className="w-5 h-5" />}
                variant="danger"
              />
            </div>

            {/* Attendance Table */}
            <div className="mb-4">
              <h2 className="text-base sm:text-lg font-semibold font-display mb-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="hidden xs:inline">
                  Attendance - Semester {selectedSemester}, Period{" "}
                  {selectedPeriod}
                </span>
                <span className="xs:hidden">
                  Sem {selectedSemester}, P{selectedPeriod}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                {format(selectedDate, "EEE, MMM d, yyyy")}
              </p>
            </div>

            <AttendanceTable
              students={filteredStudents}
              date={dateStr}
              period={selectedPeriod}
              semester={selectedSemester}
              department={selectedDepartment}
              editable={true}
            />
          </TabsContent>

          {/* Student Analytics Tab */}
          <TabsContent value="student-analytics" className="space-y-6">
            <div className="card-elevated p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Semester
                  </label>
                  <Select
                    value={analyticsSemester?.toString() || "all"}
                    onValueChange={(v) =>
                      setAnalyticsSemester(
                        v === "all" ? undefined : parseInt(v),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="low-attendance"
                    checked={lowAttendanceOnly}
                    onCheckedChange={(checked) =>
                      setLowAttendanceOnly(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="low-attendance"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Low Attendance Only
                  </label>
                </div>

                {lowAttendanceOnly && (
                  <div className="w-32">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Threshold (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={attendanceThreshold}
                      onChange={(e) =>
                        setAttendanceThreshold(parseInt(e.target.value) || 75)
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {selectedStudentId ? (
              <StudentAttendanceCalendar
                studentId={selectedStudentId}
                studentName={selectedStudentName}
                semester={analyticsSemester}
                onBack={() => {
                  setSelectedStudentId(null);
                  setSelectedStudentName("");
                }}
              />
            ) : (
              <StudentAttendanceList
                semester={analyticsSemester}
                lowAttendanceOnly={lowAttendanceOnly}
                attendanceThreshold={attendanceThreshold}
                onStudentSelect={(id, name) => {
                  setSelectedStudentId(id);
                  setSelectedStudentName(name);
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
