import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/ui/status-badge";
import { periods } from "@/data/mockData";
import { format } from "date-fns";
import { Clock, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeriodBreakdownProps {
  studentId: string;
  date: Date;
}

export function PeriodBreakdown({ studentId, date }: PeriodBreakdownProps) {
  const { attendanceRecords, isCollegeLeave } = useApp();

  const dateStr = format(date, "yyyy-MM-dd");

  const periodRecords = attendanceRecords.filter(
    (r) => r.studentId === studentId && r.date === dateStr
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <Check className="w-4 h-4" />;
      case "absent":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {isCollegeLeave(dateStr) ? (
        <div className="text-center py-8 sm:py-12 card-elevated">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-college-leave-light flex items-center justify-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-college-leave" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold font-display mb-2">
            College Leave
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            This day is marked as a college leave.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {periods.map((period) => {
            const record = periodRecords.find((r) => r.period === period);
            const status = record?.status || "not-marked";

            return (
              <div
                key={period}
                className={cn(
                  "card-elevated p-3 sm:p-4 text-center transition-all",
                  status === "present" && "border-present bg-present-light",
                  status === "absent" && "border-absent bg-absent-light"
                )}
              >
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  Period {period}
                </p>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
