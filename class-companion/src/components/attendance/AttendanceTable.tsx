import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Student, AttendanceStatus } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AttendanceTableProps {
  students: Student[];
  date: string;
  period: number;
  semester: number;
  department: string;
  editable?: boolean;
}

export function AttendanceTable({
  students,
  date,
  period,
  semester,
  department,
  editable = true,
}: AttendanceTableProps) {
  const {
    attendanceRecords,
    markAttendance,
    updateAttendance,
    isCollegeLeave,
  } = useApp();
  const { user } = useAuth();

  const [localRecords, setLocalRecords] = useState<
    Map<string, AttendanceStatus>
  >(new Map());

  // Get existing records for this date and period
  // Only sync when date/period/semester changes, not when backend data updates
  useEffect(() => {
    const records = new Map<string, AttendanceStatus>();

    students.forEach((student) => {
      const record = attendanceRecords.find(
        (r) =>
          r.studentId === student.id && r.date === date && r.period === period
      );
      if (record) {
        records.set(student.id, record.status);
      }
    });

    setLocalRecords(records);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, date, period]); // Removed attendanceRecords to prevent overwriting optimistic updates

  const handleStatusChange = async (
    studentId: string,
    status: AttendanceStatus
  ) => {
    const recordId = `${studentId}-${date}-${period}`;
    const existingRecord = attendanceRecords.find((r) => r.id === recordId);

    // Store previous state for rollback on error
    const previousStatus = localRecords.get(studentId);

    // OPTIMISTIC UPDATE: Update UI immediately for instant feedback
    setLocalRecords((prev) => new Map(prev).set(studentId, status));

    if (existingRecord && existingRecord.backendId) {
      // Update existing attendance record - teachers have unlimited edit access

      // Get all students for this period to update the full record
      const allRecords = students.map((s) => {
        const existing = attendanceRecords.find(
          (r) => r.studentId === s.id && r.date === date && r.period === period
        );
        const studentStatus =
          s.id === studentId ? status : existing?.status || "absent";
        return {
          studentId: s.id,
          status:
            studentStatus === "not-marked"
              ? "absent"
              : (studentStatus as "present" | "absent"),
        };
      });

      try {
        await updateAttendance(existingRecord.backendId, allRecords);
        // Success - UI already updated optimistically!
      } catch (error) {
        // Rollback UI on error
        if (previousStatus) {
          setLocalRecords((prev) =>
            new Map(prev).set(studentId, previousStatus)
          );
        } else {
          setLocalRecords((prev) => {
            const reverted = new Map(prev);
            reverted.delete(studentId);
            return reverted;
          });
        }
        // Error already handled in updateAttendance (toast shown)
      }
    } else {
      // Create new - mark attendance for all students in this period
      const allRecords = students.map((s) => {
        const studentStatus = s.id === studentId ? status : "absent";
        return {
          studentId: s.id,
          status:
            studentStatus === "not-marked"
              ? "absent"
              : (studentStatus as "present" | "absent"),
        };
      });

      try {
        await markAttendance({
          department,
          semester,
          date,
          period,
          records: allRecords,
        });
        // Success - UI already updated optimistically!
      } catch (error) {
        // Rollback UI on error
        if (previousStatus) {
          setLocalRecords((prev) =>
            new Map(prev).set(studentId, previousStatus)
          );
        } else {
          setLocalRecords((prev) => {
            const reverted = new Map(prev);
            reverted.delete(studentId);
            return reverted;
          });
        }
        // Error already handled in markAttendance (toast shown)
      }
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <Check className="w-4 h-4" />;
      case "absent":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isCollegeLeave(date)) {
    return (
      <div className="text-center py-12 card-elevated">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-college-leave-light flex items-center justify-center">
          <Clock className="w-8 h-8 text-college-leave" />
        </div>
        <h3 className="text-lg font-semibold font-display mb-2">
          College Leave
        </h3>
        <p className="text-muted-foreground">
          This day is marked as a college leave. No attendance is required.
        </p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 card-elevated">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold font-display mb-2">
          No Students Found
        </h3>
        <p className="text-muted-foreground">
          There are no students in this class.
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16 sm:w-20 text-xs sm:text-sm">
                Roll No
              </TableHead>
              <TableHead className="text-xs sm:text-sm">Student Name</TableHead>
              <TableHead className="text-center text-xs sm:text-sm">
                Status
              </TableHead>
              {editable && (
                <TableHead className="text-center text-xs sm:text-sm">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => {
              const status = localRecords.get(student.id) || "not-marked";

              return (
                <TableRow
                  key={student.id}
                  className={cn(
                    "animate-fade-in",
                    index % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCell className="font-mono text-xs sm:text-sm py-2 sm:py-3">
                    {student.rollNumber}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-3">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-center py-2 sm:py-3">
                    <StatusBadge
                      variant={status as any}
                      icon={getStatusIcon(status)}
                      size="sm"
                    >
                      <span className="hidden xs:inline">
                        {status === "present"
                          ? "Present"
                          : status === "absent"
                          ? "Absent"
                          : "Not Marked"}
                      </span>
                      <span className="xs:hidden">
                        {status === "present"
                          ? "P"
                          : status === "absent"
                          ? "A"
                          : "?"}
                      </span>
                    </StatusBadge>
                  </TableCell>
                  {editable && (
                    <TableCell className="text-center py-2 sm:py-3">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        <Button
                          size="sm"
                          variant={status === "present" ? "default" : "outline"}
                          className={cn(
                            "h-7 w-7 sm:h-8 sm:w-8 p-0",
                            status === "present" &&
                              "bg-present hover:bg-present/90"
                          )}
                          onClick={() =>
                            handleStatusChange(student.id, "present")
                          }
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={status === "absent" ? "default" : "outline"}
                          className={cn(
                            "h-7 w-7 sm:h-8 sm:w-8 p-0",
                            status === "absent" &&
                              "bg-absent hover:bg-absent/90"
                          )}
                          onClick={() =>
                            handleStatusChange(student.id, "absent")
                          }
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
