import { useState, useEffect, useMemo } from "react";
import { apiService } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Loader2, Users, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StudentAttendance {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  semester: number;
  department: string;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  totalDays: number;
}

interface StudentAttendanceListProps {
  semester?: number;
  lowAttendanceOnly?: boolean;
  attendanceThreshold?: number;
  onStudentSelect: (studentId: string, studentName: string) => void;
}

export function StudentAttendanceList({
  semester,
  lowAttendanceOnly = false,
  attendanceThreshold = 75,
  onStudentSelect,
}: StudentAttendanceListProps) {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [semester, lowAttendanceOnly, attendanceThreshold]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getStudentsAttendance(
        semester ? { semester } : {}
      );
      setStudents(data.students || []);
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to load students";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students based on low attendance if enabled
  const filteredStudents = useMemo(() => {
    if (!lowAttendanceOnly) {
      return students;
    }
    return students.filter(
      (student) => student.attendancePercentage < attendanceThreshold
    );
  }, [students, lowAttendanceOnly, attendanceThreshold]);

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return "text-present";
    if (percentage >= 60) return "text-college-leave";
    return "text-absent";
  };

  const getPercentageVariant = (
    percentage: number
  ): "success" | "warning" | "danger" => {
    if (percentage >= 75) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading students...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-absent mb-4">{error}</p>
        <Button onClick={fetchStudents} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h4 className="font-semibold mb-1">No Students Found</h4>
        <p className="text-sm text-muted-foreground">
          {lowAttendanceOnly
            ? `No students found with attendance below ${attendanceThreshold}%`
            : semester
            ? `No students found for semester ${semester}`
            : "No students found in the system"}
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold font-display flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Students Attendance Overview
          {semester && (
            <span className="text-muted-foreground">- Semester {semester}</span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click on any student to view detailed attendance calendar
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16">Roll No</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="text-center">Semester</TableHead>
              <TableHead className="text-center">Attendance %</TableHead>
              <TableHead className="text-center hidden md:table-cell">
                Present Days
              </TableHead>
              <TableHead className="text-center hidden md:table-cell">
                Absent Days
              </TableHead>
              <TableHead className="text-center hidden md:table-cell">
                Total Days
              </TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student, index) => (
              <TableRow
                key={`${student.id}-${student.semester}`}
                className={cn(
                  "animate-fade-in cursor-pointer hover:bg-muted/50 transition-colors",
                  index % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => onStudentSelect(student.id, student.name)}
              >
                <TableCell className="font-mono text-sm">
                  {student.rollNumber}
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-center">
                  {student.semester}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        "text-lg font-bold",
                        getPercentageColor(student.attendancePercentage)
                      )}
                    >
                      {student.attendancePercentage.toFixed(1)}%
                    </span>
                    <div className="w-full max-w-[100px] hidden sm:block">
                      <ProgressBar
                        value={student.attendancePercentage}
                        variant={getPercentageVariant(
                          student.attendancePercentage
                        )}
                        size="sm"
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4 text-present" />
                    <span className="font-medium">{student.presentDays}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingDown className="w-4 h-4 text-absent" />
                    <span className="font-medium">{student.absentDays}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell font-medium">
                  {student.totalDays}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStudentSelect(student.id, student.name);
                    }}
                  >
                    View Calendar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t bg-muted/30 text-sm text-muted-foreground">
        Showing {filteredStudents.length} student
        {filteredStudents.length !== 1 ? "s" : ""}
        {lowAttendanceOnly && (
          <span className="ml-2">
            • Attendance below {attendanceThreshold}%
          </span>
        )}
      </div>
    </div>
  );
}
