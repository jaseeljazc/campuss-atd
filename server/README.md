# Class Companion - Backend API

Production-ready REST API backend for attendance management system.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication (Access + Refresh tokens)
- **bcrypt** - Password hashing
- **Zod** - Input validation
- **node-cron** - Scheduled jobs
- **Winston** - Logging
- **dotenv** - Environment variables

## Features

- ✅ Role-based access control (Teacher, Student, HOD)
- ✅ JWT authentication with refresh token rotation
- ✅ Attendance marking with automatic locking (1 hour)
- ✅ College leave management
- ✅ Analytics and reporting
- ✅ Automated cron jobs
- ✅ Input validation
- ✅ Rate limiting
- ✅ Centralized error handling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB connection string
   - JWT secrets (use strong random strings)
   - CORS origin (your frontend URL)

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

### Users
- `GET /users` - Get all users (authenticated)
- `PATCH /users/:id/role` - Update user role (HOD only)

### Attendance
- `POST /attendance/mark` - Mark attendance (Teacher)
- `PUT /attendance/:id` - Update attendance (Teacher/HOD)
- `DELETE /attendance/:id` - Delete attendance (HOD only)
- `GET /attendance/student/:studentId` - Get student attendance
- `GET /attendance/department/:department` - Get department attendance (Teacher/HOD)

### College Leave
- `POST /college-leave` - Create college leave (HOD)
- `GET /college-leave` - Get college leaves

### Analytics
- `GET /analytics/low-attendance` - Get students with low attendance (HOD)
- `GET /analytics/semester-summary` - Get semester summary (HOD)

## User Roles

### Teacher
- Mark attendance for assigned department/semester/period
- Edit attendance within 1 hour of creation
- View attendance for assigned classes

### HOD (Head of Department)
- All teacher permissions
- Override attendance at any time
- Add/delete attendance records
- Mark college leave days
- Change user roles
- Access analytics

### Student
- Read-only access
- View own attendance (day-wise, period-wise, semester-wise)

## Business Rules

1. **Daily Attendance**: Student is present for the day if present in ≥4 out of 5 periods
2. **College Leave**: If no attendance exists for any period on a date, it's automatically marked as college leave
3. **Attendance Locking**: Attendance locks 1 hour after creation (teachers cannot edit after lock, HOD can override)
4. **Attendance Percentage**: Calculated semester-wise, excluding college leave days

## Cron Jobs

- **Daily College Leave Check**: Runs at 23:55 daily to mark college leave for dates with no attendance
- **Attendance Locking**: Runs hourly to lock attendance records older than 1 hour

## Project Structure

```
server/
├── config/          # Configuration files (env, db, logger)
├── controllers/     # Request handlers
├── cron/            # Scheduled jobs
├── middlewares/     # Express middlewares
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Zod validation schemas
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT token rotation
- Password hashing with bcrypt
- Input validation on all endpoints
- Role-based access control

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets (generate with: `openssl rand -base64 32`)
3. Configure MongoDB Atlas connection string
4. Set appropriate CORS origin
5. Use process manager (PM2) for production
6. Enable HTTPS
7. Set up proper logging and monitoring

## License

MIT
