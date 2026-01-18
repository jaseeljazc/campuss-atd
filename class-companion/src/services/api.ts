import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

class ApiService {
  private api: AxiosInstance;
  private activeRequestCount: number = 0;
  private loadingListener: ((isLoading: boolean) => void) | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        this.activeRequestCount++;
        this.notifyLoading();

        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        this.activeRequestCount--;
        this.notifyLoading();
        return Promise.reject(error);
      },
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => {
        this.activeRequestCount--;
        this.notifyLoading();
        return response;
      },
      async (error: AxiosError) => {
        // Only decrement if we are NOT retrying, otherwise the retry will increment it again (or keep it open)
        // Actually, the retry creates a NEW request which increments it.
        // So we should decrement for this failure.
        this.activeRequestCount--;
        this.notifyLoading();

        const originalRequest = error.config as any;

        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                {
                  refreshToken,
                },
              );

              const { accessToken, refreshToken: newRefreshToken } =
                response.data;
              localStorage.setItem("accessToken", accessToken);
              if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
              }

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  setLoadingListener(listener: (isLoading: boolean) => void) {
    this.loadingListener = listener;
  }

  private notifyLoading() {
    if (this.loadingListener) {
      // Use setTimeout to avoid flickering for very fast requests
      // But user requested "no artificial delay", so we will be direct.
      // However, to batch updates if multiple start at once, we can use a microtask or just call directly.
      // Calling directly is safest for "immediate" feedback.
      this.loadingListener(this.activeRequestCount > 0);
    }
  }

  // Auth endpoints
  async signup(data: {
    name: string;
    email: string;
    password: string;
    role?: "teacher" | "student";
    department: string;
    semester?: number;
    assignedSemesters?: number[];
    assignedPeriods?: number[];
  }) {
    const response = await this.api.post("/auth/signup", data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post("/auth/login", { email, password });
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.api.post("/auth/refresh", { refreshToken });
    return response.data;
  }

  async logout(refreshToken?: string) {
    const response = await this.api.post("/auth/logout", { refreshToken });
    return response.data;
  }

  // User endpoints
  async getUsers(filters?: { role?: string; semester?: number }) {
    const response = await this.api.get("/users", { params: filters });
    return response.data;
  }

  async updateUserRole(userId: string, role: string) {
    const response = await this.api.patch(`/users/${userId}/role`, { role });
    return response.data;
  }

  // Attendance endpoints
  async markAttendance(data: {
    semester: number;
    date: string;
    period: number;
    records: Array<{ studentId: string; status: "present" | "absent" }>;
  }) {
    const response = await this.api.post("/attendance/mark", data);
    return response.data;
  }

  async updateAttendance(
    attendanceId: string,
    records: Array<{ studentId: string; status: "present" | "absent" }>,
  ) {
    const response = await this.api.put(`/attendance/${attendanceId}`, {
      records,
    });
    return response.data;
  }

  async deleteAttendance(attendanceId: string) {
    const response = await this.api.delete(`/attendance/${attendanceId}`);
    return response.data;
  }

  async getStudentAttendance(
    studentId: string,
    filters?: { semester?: string; startDate?: string; endDate?: string },
  ) {
    const response = await this.api.get(`/attendance/student/${studentId}`, {
      params: filters,
    });
    return response.data;
  }

  async getDepartmentAttendance(filters?: {
    department?: string;
    semester?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const department = filters?.department || "Computer Science";
    const response = await this.api.get(
      `/attendance/department/${encodeURIComponent(department)}`,
      {
        params: {
          semester: filters?.semester,
          startDate: filters?.startDate,
          endDate: filters?.endDate,
        },
      },
    );
    return response.data;
  }

  // Leave endpoints

  // Class Leave (semester-specific)
  async markClassLeave(data: {
    semester: number;
    date: string;
    reason: string;
  }) {
    const response = await this.api.post("/class-leave", data);
    return response.data;
  }

  async getClassLeaves(filters?: {
    semester?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await this.api.get("/class-leave", { params: filters });
    return response.data;
  }

  // College Leave (global)
  async markCollegeLeave(data: { date: string; reason: string }) {
    const response = await this.api.post("/college-leave", data);
    return response.data;
  }

  async getCollegeLeaves(filters?: { startDate?: string; endDate?: string }) {
    const response = await this.api.get("/college-leave", { params: filters });
    return response.data;
  }

  async deleteCollegeLeave(date: string) {
    const response = await this.api.delete(`/college-leave/${date}`);
    return response.data;
  }

  async deleteClassLeave(semester: number, date: string) {
    const response = await this.api.delete(`/class-leave/${semester}/${date}`);
    return response.data;
  }

  // Analytics endpoints
  async getLowAttendanceStudents(filters?: {
    semester?: string;
    threshold?: string;
  }) {
    const response = await this.api.get("/analytics/low-attendance", {
      params: filters,
    });
    return response.data;
  }

  async getSemesterSummary(filters?: { semester?: string }) {
    const response = await this.api.get("/analytics/semester-summary", {
      params: filters,
    });
    return response.data;
  }

  // HOD Analytics endpoints
  async getStudentsAttendance(filters?: { semester?: number }) {
    const response = await this.api.get("/analytics/students-attendance", {
      params: filters,
    });
    return response.data;
  }

  async getStudentAttendanceCalendar(
    studentId: string,
    filters?: { semester?: number; startDate?: string; endDate?: string },
  ) {
    const response = await this.api.get(
      `/analytics/student-attendance-calendar/${studentId}`,
      { params: filters },
    );
    return response.data;
  }
}

export const apiService = new ApiService();
