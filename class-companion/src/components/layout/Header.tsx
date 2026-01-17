import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, GraduationCap, User, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export function Header() {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    switch (user?.role) {
      case "teacher":
        return <User className="w-4 h-4" />;
      case "student":
        return <GraduationCap className="w-4 h-4" />;
      case "hod":
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleLabel = () => {
    return user?.name || "";
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold font-display tracking-tight">
                AttendEase
              </h1>
              <p className="text-xs text-muted-foreground hidden xs:block">
                College Attendance System
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <StatusBadge variant="info" icon={getRoleIcon()}>
              <span className="hidden xs:inline">
                {user.role.toUpperCase()}
              </span>
              <span className="xs:hidden">
                {user.role.charAt(0).toUpperCase()}
              </span>
            </StatusBadge>
            <span className="text-sm font-medium hidden sm:inline">
              {getRoleLabel()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 h-8 sm:h-9"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
