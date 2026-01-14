# Database Seeding Scripts

This directory contains scripts to seed the database with initial data for testing and development.

## Available Scripts

### 1. Seed HOD User
Creates/updates the default HOD (Head of Department) user.

```bash
npm run seed:hod
```

**Credentials:**
- Email: `hod@gmail.com`
- Password: `123456`
- Role: `hod`
- Department: `Computer Science`

### 2. Seed Users (Students & Teachers)
Creates multiple students and teachers with mock data.

```bash
npm run seed:users
```

**Default Password:** `123456` (for all users)

**Students Created:**
- 8 Computer Science students (Semester 3)
- 4 Computer Science students (Semester 5)
- 4 Electronics students (Semester 3)
- 2 Electronics students (Semester 5)
- 3 Mechanical students (Semester 3)
- 2 Civil students (Semester 3)

**Teachers Created:**
- 3 Computer Science teachers
- 2 Electronics teachers
- 1 Mechanical teacher
- 1 Civil teacher

### 3. Seed All
Runs both HOD and users seeding scripts.

```bash
npm run seed:all
```

## User Credentials

### HOD
- **Email:** `hod@gmail.com`
- **Password:** `123456`

### Teachers
All teachers use password: `123456`

- `ramesh.kumar@teacher.com` - Computer Science (Semesters: 3,5 | Periods: 1,3)
- `lakshmi.devi@teacher.com` - Computer Science (Semesters: 3,5 | Periods: 2,4)
- `suresh.menon@teacher.com` - Computer Science (Semesters: 3,5 | Periods: 4,5)
- `anjali.sharma@teacher.com` - Electronics (Semesters: 3 | Periods: 1,2,3)
- `vikram.rao@teacher.com` - Electronics (Semesters: 5 | Periods: 1,2)
- `meera.nair@teacher.com` - Mechanical (Semesters: 3 | Periods: 1,2,3,4)
- `rajesh.iyer@teacher.com` - Civil (Semesters: 3 | Periods: 1,2,3)

### Students
All students use password: `123456`

**Computer Science - Semester 3:**
- `aarav.sharma@student.com`
- `priya.patel@student.com`
- `rohit.kumar@student.com`
- `ananya.reddy@student.com`
- `vikram.singh@student.com`
- `sneha.gupta@student.com`
- `arjun.nair@student.com`
- `kavya.iyer@student.com`

**Computer Science - Semester 5:**
- `rahul.verma@student.com`
- `meera.joshi@student.com`
- `aditya.rao@student.com`
- `ishita.malhotra@student.com`

**Electronics - Semester 3:**
- `karan.desai@student.com`
- `divya.menon@student.com`
- `sanjay.pillai@student.com`
- `neha.krishnan@student.com`

**Electronics - Semester 5:**
- `rajesh.nair@student.com`
- `pooja.iyer@student.com`

**Mechanical - Semester 3:**
- `amit.kumar@student.com`
- `sunita.devi@student.com`
- `manoj.reddy@student.com`

**Civil - Semester 3:**
- `deepak.sharma@student.com`
- `rekha.patel@student.com`

## Usage

### First Time Setup
```bash
# Seed HOD user
npm run seed:hod

# Seed all users (students and teachers)
npm run seed:users

# Or seed everything at once
npm run seed:all
```

### Re-running Scripts
The scripts are idempotent - they will skip users that already exist. You can safely run them multiple times.

### Customization
Edit `scripts/seedUsers.js` to modify:
- Number of users
- User details (names, emails, departments)
- Teacher assignments (semesters and periods)
- Default password

## Notes

- All passwords are hashed using bcrypt
- Email addresses must be unique
- Teachers must have assigned semesters and periods to mark attendance
- Students are assigned to departments and semesters
- The scripts will skip existing users (based on email)
