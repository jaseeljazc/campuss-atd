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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { semesters, periods } from "@/data/mockData";
import { format } from "date-fns";
import {
  CalendarIcon,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { StudentAttendanceList } from "@/components/analytics/StudentAttendanceList";
import { StudentAttendanceCalendar } from "@/components/analytics/StudentAttendanceCalendar";

export function HODDashboard() {
  const {
    attendanceRecords,
    students,
    markClassLeave,
    markCollegeLeave,
    removeClassLeave,
    removeCollegeLeave,
    isCollegeLeave,
    isClassLeave,
  } = useApp();
  const { user } = useAuth();

  // Attendance Management state
  const [selectedSemester, setSelectedSemester] = useState<number>(3);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

  // Class Leave Dialog state (semester-specific)
  const [showClassLeaveDialog, setShowClassLeaveDialog] = useState(false);
  const [classLeaveReason, setClassLeaveReason] = useState("");
  const [isMarkingClassLeave, setIsMarkingClassLeave] = useState(false);

  // College Leave Dialog state (global)
  const [showCollegeLeaveDialog, setShowCollegeLeaveDialog] = useState(false);
  const [collegeLeaveReason, setCollegeLeaveReason] = useState("");
  const [isMarkingCollegeLeave, setIsMarkingCollegeLeave] = useState(false);

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

  // Since app is for single department, use first student's department or default
  const department = students[0]?.department || "Computer Science";

  const filteredStudents = useMemo(
    () => students.filter((s) => s.semester === selectedSemester),
    [students, selectedSemester],
  );

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Check if selected date is already marked as college leave (global)
  const isAlreadyCollegeLeave = isCollegeLeave(dateStr);

  // Check if selected date and semester is already marked as class leave
  const isAlreadyClassLeave = isClassLeave(dateStr, selectedSemester);

  // Calculate stats for selected class
  const todayRecords = attendanceRecords.filter(
    (r) =>
      r.date === dateStr &&
      r.semester === selectedSemester &&
      r.department === department,
  );

  const periodRecords = todayRecords.filter((r) => r.period === selectedPeriod);
  const markedCount = periodRecords.length;
  const presentCount = periodRecords.filter(
    (r) => r.status === "present",
  ).length;
  const absentCount = periodRecords.filter((r) => r.status === "absent").length;

  // Handle class leave marking (semester-specific)
  const handleMarkClassLeave = async () => {
    if (!classLeaveReason.trim()) {
      return;
    }

    setIsMarkingClassLeave(true);
    try {
      await markClassLeave(selectedSemester, dateStr, classLeaveReason);
      setShowClassLeaveDialog(false);
      setClassLeaveReason("");
    } catch (error) {
      console.error("Error marking class leave:", error);
    } finally {
      setIsMarkingClassLeave(false);
    }
  };

  // Handle college leave marking (global)
  const handleMarkCollegeLeave = async () => {
    if (!collegeLeaveReason.trim()) {
      return;
    }

    setIsMarkingCollegeLeave(true);
    try {
      await markCollegeLeave(dateStr, collegeLeaveReason);
      setShowCollegeLeaveDialog(false);
      setCollegeLeaveReason("");
    } catch (error) {
      console.error("Error marking college leave:", error);
    } finally {
      setIsMarkingCollegeLeave(false);
    }
  };

  // Handle college leave unmarking
  const handleUnmarkCollegeLeave = async () => {
    setIsMarkingCollegeLeave(true);
    try {
      await removeCollegeLeave(dateStr);
    } catch (error) {
      console.error("Error unmarking college leave:", error);
    } finally {
      setIsMarkingCollegeLeave(false);
    }
  };

  // Handle class leave unmarking
  const handleUnmarkClassLeave = async () => {
    setIsMarkingClassLeave(true);
    try {
      await removeClassLeave(selectedSemester, dateStr);
    } catch (error) {
      console.error("Error unmarking class leave:", error);
    } finally {
      setIsMarkingClassLeave(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display mb-1 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              HOD Dashboard
            </h1>
            <p className="text-muted-foreground">
              Department Overview & Attendance Management
            </p>
          </div>
        </div>

        {/* Department Info */}
        <div className="mb-6 p-4 card-elevated">
          <p className="text-sm text-muted-foreground">
            Department:{" "}
            <span className="font-semibold text-foreground">{department}</span>
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="attendance">Attendance Management</TabsTrigger>
            <TabsTrigger value="student-analytics">
              Student Analytics
            </TabsTrigger>
          </TabsList>

          {/* Attendance Management Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="card-elevated p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Semester
                  </label>
                  <Select
                    value={selectedSemester.toString()}
                    onValueChange={(v) => setSelectedSemester(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="flex-1 min-w-[180px]">
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

                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Period
                  </label>
                  <Select
                    value={selectedPeriod.toString()}
                    onValueChange={(v) => setSelectedPeriod(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                {/* Leave Buttons - HOD Only */}
                {user?.role === "hod" && (
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 pt-5 mx-auto">
                    {/* Class Leave Button (semester-specific) */}
                    <Button
                      variant="outline"
                      onClick={
                        isAlreadyClassLeave
                          ? handleUnmarkClassLeave
                          : () => setShowClassLeaveDialog(true)
                      }
                      disabled={isAlreadyCollegeLeave}
                      className="w-full sm:w-auto cursor-pointer mb-2 sm:mb-0"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      {isAlreadyClassLeave
                        ? "Unmark Class Leave"
                        : "Mark as Class Leave"}
                    </Button>

                    {/* College Leave Button (global) */}
                    <Button
                      variant="outline"
                      onClick={
                        isAlreadyCollegeLeave
                          ? handleUnmarkCollegeLeave
                          : () => setShowCollegeLeaveDialog(true)
                      }
                      className="w-full sm:w-auto"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {isAlreadyCollegeLeave
                        ? "Unmark College Leave"
                        : "Mark as College Leave"}
                    </Button>
                  </div>
                )}
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

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold font-display mb-1">
                    Override Attendance
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")} • Period{" "}
                    {selectedPeriod}
                  </p>
                </div>
              </div>
            </div>

            <AttendanceTable
              students={filteredStudents}
              date={dateStr}
              period={selectedPeriod}
              semester={selectedSemester}
              department={department}
              editable={true}
            />
          </TabsContent>

          {/* Student Analytics Tab */}
          <TabsContent value="student-analytics" className="space-y-6">
            <div className="card-elevated p-4">
              <h3 className="font-semibold font-display mb-4">Filters</h3>
              <div className="flex flex-wrap items-end gap-4">
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

        {/* Class Leave Dialog (Semester-Specific) */}
        <Dialog
          open={showClassLeaveDialog}
          onOpenChange={setShowClassLeaveDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as Class Leave</DialogTitle>
              <DialogDescription>
                Mark {format(selectedDate, "MMMM d, yyyy")} as Class Leave for
                Semester {selectedSemester} only
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Semester-Specific Leave</p>
                  <p>
                    This will mark the selected date as Class Leave for Semester{" "}
                    {selectedSemester} only. Other semesters will not be
                    affected.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="class-reason"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Reason <span className="text-destructive">*</span>
                </label>
                <Input
                  id="class-reason"
                  placeholder="e.g., Semester 3 Field Trip, Exam Preparation"
                  value={classLeaveReason}
                  onChange={(e) => setClassLeaveReason(e.target.value)}
                  disabled={isMarkingClassLeave}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowClassLeaveDialog(false);
                  setClassLeaveReason("");
                }}
                disabled={isMarkingClassLeave}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkClassLeave}
                disabled={!classLeaveReason.trim() || isMarkingClassLeave}
              >
                {isMarkingClassLeave ? "Marking..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* College Leave Dialog (Global) */}
        <Dialog
          open={showCollegeLeaveDialog}
          onOpenChange={setShowCollegeLeaveDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as College Leave</DialogTitle>
              <DialogDescription>
                Mark {format(selectedDate, "MMMM d, yyyy")} as College Leave for
                ALL semesters
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-1">
                    Global Leave - Highest Priority
                  </p>
                  <p>
                    This will mark the selected date as College Leave for ALL
                    semesters in the department. This overrides any Class Leave
                    or attendance records.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="college-reason"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Reason <span className="text-destructive">*</span>
                </label>
                <Input
                  id="college-reason"
                  placeholder="e.g., Annual Day, Sports Day, National Holiday"
                  value={collegeLeaveReason}
                  onChange={(e) => setCollegeLeaveReason(e.target.value)}
                  disabled={isMarkingCollegeLeave}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCollegeLeaveDialog(false);
                  setCollegeLeaveReason("");
                }}
                disabled={isMarkingCollegeLeave}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkCollegeLeave}
                disabled={!collegeLeaveReason.trim() || isMarkingCollegeLeave}
              >
                {isMarkingCollegeLeave ? "Marking..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
