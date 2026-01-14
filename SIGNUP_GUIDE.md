# How to Sign Up as Student or Teacher

## Overview

The attendance management system now supports self-registration for both students and teachers. You can create an account directly from the signup page.

## Sign Up Process

### Step 1: Access Signup Page

1. Navigate to the application URL (e.g., `http://localhost:8080`)
2. Click on **"Sign up"** link on the login page
3. Or go directly to `/signup` route

### Step 2: Fill in Registration Form

#### For Students:

1. **Full Name**: Enter your full name
2. **Email**: Enter your email address (must be unique)
3. **Password**: Create a password (minimum 6 characters)
4. **Confirm Password**: Re-enter your password
5. **Role**: Select "Student"
6. **Department**: Choose your department (e.g., Computer Science, Electronics, etc.)
7. **Semester**: Select your current semester (1-8)

#### For Teachers:

1. **Full Name**: Enter your full name
2. **Email**: Enter your email address (must be unique)
3. **Password**: Create a password (minimum 6 characters)
4. **Confirm Password**: Re-enter your password
5. **Role**: Select "Teacher"
6. **Department**: Choose your department
7. **Assigned Semesters**: Enter comma-separated semester numbers (e.g., "1,2,3")
8. **Assigned Periods**: Enter comma-separated period numbers (e.g., "1,2,3,4,5")

### Step 3: Submit

Click **"Create Account"** button. You will be automatically logged in after successful registration.

## Example Signup Data

### Student Example:
```
Name: John Doe
Email: john.doe@example.com
Password: student123
Role: Student
Department: Computer Science
Semester: 3
```

### Teacher Example:
```
Name: Dr. Jane Smith
Email: jane.smith@example.com
Password: teacher123
Role: Teacher
Department: Computer Science
Assigned Semesters: 1,2,3
Assigned Periods: 1,2,3
```

## API Endpoint

The signup endpoint is available at:
```
POST /auth/signup
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student", // or "teacher"
  "department": "Computer Science",
  "semester": 3, // for students only
  "assignedSemesters": [1, 2, 3], // for teachers only
  "assignedPeriods": [1, 2, 3] // for teachers only
}
```

## Important Notes

1. **Email Uniqueness**: Each email can only be used once. If you try to sign up with an existing email, you'll get an error.

2. **Password Requirements**: 
   - Minimum 6 characters
   - Passwords are hashed securely using bcrypt

3. **Role Assignment**:
   - Students: Can view their own attendance
   - Teachers: Can mark attendance for assigned semesters and periods
   - HOD: Must be created by admin (hod@gmail.com / 123456)

4. **Department**: Make sure to select the correct department as it affects which classes you can access.

5. **Teacher Assignments**: 
   - Teachers must specify which semesters and periods they teach
   - These can be updated later by HOD if needed

## Troubleshooting

### "User with this email already exists"
- The email is already registered
- Try logging in instead, or use a different email

### "Department is required"
- Make sure you select a department from the dropdown

### "Password must be at least 6 characters"
- Your password is too short
- Use at least 6 characters

### "Passwords do not match"
- The password and confirm password fields don't match
- Re-enter them carefully

## After Signup

Once you successfully sign up:
1. You'll be automatically logged in
2. You'll be redirected to your dashboard based on your role:
   - Students → `/student`
   - Teachers → `/teacher`
3. You can start using the system immediately

## Need Help?

If you encounter any issues:
1. Check that all required fields are filled
2. Verify your email format is correct
3. Ensure passwords match and meet requirements
4. Contact your HOD if you need role changes or department updates
