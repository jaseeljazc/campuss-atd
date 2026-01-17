import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Check, X, Clock, Calendar } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isWeekend,
  isSameDay,
} from "date-fns";

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "college-leave";
  periods: Array<{
    period: number;
    status: "present" | "absent";
  }>;
}

interface AttendanceCalendarProps {
  studentId: string;
  semester: number;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  attendanceRecords?: AttendanceRecord[];
  classLeaveDays?: Array<{ date: string; semester: number; reason: string }>;
  collegeLeaveDays?: Array<{ date: string; reason: string }>;
}

export function AttendanceCalendar({
  studentId,
  semester,
  selectedDate,
  onDateSelect,
  attendanceRecords: propsAttendanceRecords,
  classLeaveDays: propsClassLeaveDays,
  collegeLeaveDays: propsCollegeLeaveDays,
}: AttendanceCalendarProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >(propsAttendanceRecords || []);
  const [classLeaveDays, setClassLeaveDays] = useState<
    Array<{ date: string; semester: number; reason: string }>
  >(propsClassLeaveDays || []);
  const [collegeLeaveDays, setCollegeLeaveDays] = useState<
    Array<{ date: string; reason: string }>
  >(propsCollegeLeaveDays || []);
  const [isLoading, setIsLoading] = useState(!propsAttendanceRecords);

  // Update state when props change - always update even if empty arrays
  useEffect(() => {
    if (propsAttendanceRecords !== undefined) {
      setAttendanceRecords(propsAttendanceRecords);
      console.log(
        "Calendar: Updated attendance records from props:",
        propsAttendanceRecords.length,
      );
    }
    if (propsCollegeLeaveDays !== undefined) {
      setCollegeLeaveDays(propsCollegeLeaveDays);
      console.log(
        "Calendar: Updated college leave days from props:",
        propsCollegeLeaveDays.length,
      );
    }
    if (propsAttendanceRecords !== undefined) {
      setIsLoading(false);
    }
  }, [propsAttendanceRecords, propsCollegeLeaveDays]);

  // Only fetch if data not provided via props
  useEffect(() => {
    if (!propsAttendanceRecords) {
      fetchAttendanceCalendar();
    }
  }, [studentId, semester, propsAttendanceRecords]);

  const fetchAttendanceCalendar = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getStudentAttendanceCalendar(
        studentId,
        semester ? { semester } : {},
      );
      setAttendanceRecords(data.attendanceRecords || []);
      setCollegeLeaveDays(data.collegeLeaveDays || []);
    } catch (err: any) {
      console.error("Failed to load attendance calendar:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fill in blank days at the start of the month
  const startPadding = monthStart.getDay();
  const paddedDays = Array(startPadding).fill(null).concat(days);

  const getDayStatus = (
    date: Date,
  ): "present" | "absent" | "college-leave" | "class-leave" | null => {
    // Don't show status for future dates or weekends
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly > today) return null;
    if (isWeekend(date)) return null;

    const dateStr = format(date, "yyyy-MM-dd");

    // Priority: College Leave > Class Leave > Attendance

    // Check for College Leave (global)
    if (collegeLeaveDays.some((cl) => cl.date === dateStr)) {
      return "college-leave";
    }

    // Check for Class Leave (semester-specific)
    if (
      classLeaveDays.some(
        (cl) => cl.date === dateStr && cl.semester === semester,
      )
    ) {
      return "class-leave";
    }

    const record = attendanceRecords.find((r) => r.date === dateStr);
    if (!record) {
      return null;
    }

    // Return the status
    return record.status;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Debug: Log calendar state
  useEffect(() => {
    console.log("Calendar render state:", {
      isLoading,
      recordsCount: attendanceRecords.length,
      collegeLeavesCount: collegeLeaveDays.length,
      selectedMonth: format(selectedDate, "MMMM yyyy"),
      sampleRecords: attendanceRecords.slice(0, 3),
    });
  }, [attendanceRecords, collegeLeaveDays, selectedDate, isLoading]);

  if (isLoading) {
    return (
      <div className="card-elevated p-6">
        <div className="text-center py-8 text-muted-foreground">
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {format(selectedDate, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-present" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-absent" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Leave</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const status = getDayStatus(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          // Debug: Log status for days in current month with records
          if (isCurrentMonth && status) {
            const dateStr = format(day, "yyyy-MM-dd");
            const record = attendanceRecords.find((r) => r.date === dateStr);
            if (record) {
              console.log(
                `Calendar day ${dateStr}: status=${status}, record=`,
                record,
              );
            }
          }

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              disabled={!isCurrentMonth || isWeekend(day) || day > new Date()}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative",
                isCurrentMonth ? "hover:bg-muted" : "opacity-30",
                isSelected && "ring-2 ring-primary ring-offset-2",
                isToday && "font-bold",
                isWeekend(day) && "text-muted-foreground/50",
                status === "present" && "bg-present-light text-present",
                status === "absent" && "bg-absent-light text-absent",
                status === "college-leave" &&
                  "bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400",
              )}
            >
              <span>{format(day, "d")}</span>
              {status === "present" && (
                <Check className="w-3 h-3 absolute bottom-0.5" />
              )}
              {status === "absent" && (
                <X className="w-3 h-3 absolute bottom-0.5" />
              )}
              {status === "college-leave" && (
                <Clock className="w-3 h-3 absolute bottom-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
