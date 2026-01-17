import { useApp } from "@/context/AppContext";
import { UserRole } from "@/data/mockData";
import { GraduationCap, User, Users, ArrowRight, BookOpen, Shield, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  onClick: () => void;
}

function RoleCard({ role, title, description, icon, features, color, onClick }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300",
        "bg-card border-2 border-border hover:border-primary/50",
        "hover:shadow-elevated hover:-translate-y-1",
        "animate-slide-up"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
        color
      )} />
      
      <div className="relative">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
          color === "bg-primary" && "bg-primary text-primary-foreground",
          color === "bg-present" && "bg-present text-present-foreground",
          color === "bg-college-leave" && "bg-college-leave text-college-leave-foreground",
        )}>
          {icon}
        </div>

        <h3 className="text-xl font-bold font-display mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
          Continue as {title}
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}

export function RoleSelection() {
  const { setCurrentRole, setCurrentUserId, teachers, students } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    switch (role) {
      case 'teacher':
        setCurrentUserId(teachers[0]?.id || 't1');
        break;
      case 'student':
        setCurrentUserId(students[0]?.id || 's1');
        break;
      case 'hod':
        setCurrentUserId('hod1');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-present/5 py-16 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--present)/0.1),transparent_50%)]" />
        
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              College Attendance Management
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-present bg-clip-text text-transparent">
                AttendEase
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline attendance tracking for your college. Mark, monitor, and manage student attendance with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="container py-12 lg:py-16 flex-1">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold font-display mb-2">Select Your Role</h2>
          <p className="text-muted-foreground">Choose how you want to access the system</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <RoleCard
            role="teacher"
            title="Teacher"
            description="Mark and manage attendance for your assigned classes"
            icon={<User className="w-6 h-6" />}
            features={[
              "Mark attendance per period",
              "View assigned class records",
              "Edit within 1-hour window",
            ]}
            color="bg-primary"
            onClick={() => handleRoleSelect('teacher')}
          />

          <RoleCard
            role="hod"
            title="Head of Department"
            description="Full oversight and control of department attendance"
            icon={<Shield className="w-6 h-6" />}
            features={[
              "Override any attendance",
              "Mark college leave days",
              "View analytics & reports",
              "Manage user roles",
            ]}
            color="bg-college-leave"
            onClick={() => handleRoleSelect('hod')}
          />

          <RoleCard
            role="student"
            title="Student"
            description="View your attendance records and statistics"
            icon={<GraduationCap className="w-6 h-6" />}
            features={[
              "View daily attendance",
              "Track semester percentage",
              "Period-wise breakdown",
            ]}
            color="bg-present"
            onClick={() => handleRoleSelect('student')}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>AttendEase — College Attendance Management System</p>
        </div>
      </footer>
    </div>
  );
}
