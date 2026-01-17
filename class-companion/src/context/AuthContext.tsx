import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiService } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "student" | "hod";
  department: string;
  semester?: number; // Student's semester (1-8)
  rollNumber?: string; // Student's roll number
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await apiService.login(email, password);
        const { accessToken: token, refreshToken, user: userData } = response;

        // Store tokens and user data
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setAccessToken(token);

        // Redirect based on role
        switch (userData.role) {
          case "hod":
            navigate("/hod");
            break;
          case "teacher":
            navigate("/teacher");
            break;
          case "student":
            navigate("/student");
            break;
          default:
            navigate("/");
        }
      } catch (error: any) {
        const message =
          error.response?.data?.error ||
          "Login failed. Please check your credentials.";
        throw new Error(message);
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await apiService.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      setAccessToken(null);
      navigate("/login");
    }
  }, [navigate]);

  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const response = await apiService.refreshToken(refreshToken);
      const { accessToken: token, refreshToken: newRefreshToken } = response;

      localStorage.setItem("accessToken", token);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      setAccessToken(token);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
