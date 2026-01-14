# Frontend-Backend Integration Guide

## ✅ Integration Complete

The frontend and backend are now fully connected with authentication, role-based routing, and API integration.

## Setup Instructions

### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Set your MongoDB URI and JWT secrets

# Seed HOD user
npm run seed:hod

# Start backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd class-companion

# Install dependencies (if not already done)
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:5000" > .env

# Start frontend
npm run dev
```

The frontend will run on `http://localhost:8080`

## HOD Login Credentials

- **Email**: `hod@gmail.com`
- **Password**: `123456`

This user is automatically created/updated when you run `npm run seed:hod` in the server directory.

## Features Implemented

### ✅ Authentication
- Login page with email/password
- JWT access and refresh tokens
- Token refresh on expiry
- Logout functionality
- Session persistence (localStorage)

### ✅ Role-Based Routing
- `/login` - Public login page
- `/teacher/*` - Teacher dashboard (protected)
- `/student/*` - Student dashboard (protected)
- `/hod/*` - HOD dashboard (protected)
- Automatic redirects based on role

### ✅ API Integration
- Centralized API service with Axios
- Automatic token attachment to requests
- Error handling and token refresh
- All endpoints connected:
  - Authentication (login, logout, refresh)
  - Users (get users, update role)
  - Attendance (mark, update, delete, get)
  - College Leave (create, get)
  - Analytics (low attendance, semester summary)

### ✅ State Management
- AuthContext for user authentication state
- AppContext for application data (students, attendance, etc.)
- Real-time data fetching from backend
- Loading and error states

### ✅ Components Updated
- Login page
- Protected routes component
- Header with logout
- Teacher Dashboard
- Student Dashboard
- HOD Dashboard
- Attendance Table

## API Endpoints

All endpoints are prefixed with the base URL from `VITE_API_BASE_URL`:

- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /users` - Get all users
- `PATCH /users/:id/role` - Update user role (HOD only)
- `POST /attendance/mark` - Mark attendance (Teacher)
- `PUT /attendance/:id` - Update attendance
- `DELETE /attendance/:id` - Delete attendance (HOD only)
- `GET /attendance/student/:studentId` - Get student attendance
- `GET /attendance/department/:department` - Get department attendance
- `POST /college-leave` - Create college leave (HOD)
- `GET /college-leave` - Get college leaves
- `GET /analytics/low-attendance` - Get low attendance students (HOD)
- `GET /analytics/semester-summary` - Get semester summary (HOD)

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance-management
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_ORIGIN=http://localhost:8080
LOG_LEVEL=info
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
```

## Testing the Integration

1. Start the backend server
2. Start the frontend server
3. Navigate to `http://localhost:8080`
4. You'll be redirected to `/login`
5. Login with HOD credentials: `hod@gmail.com` / `123456`
6. You'll be redirected to `/hod` dashboard
7. Test marking attendance, viewing analytics, etc.

## Troubleshooting

### CORS Errors
- Ensure `CLIENT_ORIGIN` in backend `.env` matches your frontend URL
- Default is `http://localhost:8080`

### Authentication Errors
- Check that JWT secrets are set in backend `.env`
- Verify tokens are being stored in localStorage
- Check browser console for API errors

### Data Not Loading
- Verify backend is running and MongoDB is connected
- Check network tab for API call errors
- Ensure user has proper role assignments

### HOD User Not Found
- Run `npm run seed:hod` in server directory
- Check MongoDB connection
- Verify email is exactly `hod@gmail.com`

## Next Steps

1. Create additional users (teachers, students) via API or database
2. Assign semesters and periods to teachers
3. Start marking attendance
4. Test all role-based features

## Notes

- The frontend automatically refreshes tokens when they expire
- Attendance records are locked after 1 hour (teachers can't edit)
- HOD can override any attendance at any time
- College leave days are automatically created by cron job if no attendance exists
- All API calls include proper error handling and user feedback
