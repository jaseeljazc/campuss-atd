import { useApp } from "@/context/AppContext";
import { RoleSelection } from "./RoleSelection";
import { TeacherDashboard } from "./TeacherDashboard";
import { StudentDashboard } from "./StudentDashboard";
import { HODDashboard } from "./HODDashboard";

const Index = () => {
  const { currentRole } = useApp();

  if (!currentRole) {
    return <RoleSelection />;
  }

  switch (currentRole) {
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'hod':
      return <HODDashboard />;
    default:
      return <RoleSelection />;
  }
};

export default Index;
