require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const env = require("../config/env");
const logger = require("../config/logger");

// Computer Science Students - All 6 Semesters
const csStudents = [
  // Semester 1
  { name: "Aarav Sharma", email: "aarav.sharma@student.com", semester: 1 },
  { name: "Priya Patel", email: "priya.patel@student.com", semester: 1 },
  { name: "Rohit Kumar", email: "rohit.kumar@student.com", semester: 1 },
  { name: "Ananya Reddy", email: "ananya.reddy@student.com", semester: 1 },
  { name: "Vikram Singh", email: "vikram.singh@student.com", semester: 1 },

  // Semester 2
  { name: "Sneha Gupta", email: "sneha.gupta@student.com", semester: 2 },
  { name: "Arjun Nair", email: "arjun.nair@student.com", semester: 2 },
  { name: "Kavya Iyer", email: "kavya.iyer@student.com", semester: 2 },
  {
    name: "Siddharth Mehta",
    email: "siddharth.mehta@student.com",
    semester: 2,
  },
  { name: "Riya Agarwal", email: "riya.agarwal@student.com", semester: 2 },

  // Semester 3
  { name: "Rahul Verma", email: "rahul.verma@student.com", semester: 3 },
  { name: "Meera Joshi", email: "meera.joshi@student.com", semester: 3 },
  { name: "Aditya Rao", email: "aditya.rao@student.com", semester: 3 },
  {
    name: "Ishita Malhotra",
    email: "ishita.malhotra@student.com",
    semester: 3,
  },
  { name: "Varun Kapoor", email: "varun.kapoor@student.com", semester: 3 },
  {
    name: "Anjali Deshmukh",
    email: "anjali.deshmukh@student.com",
    semester: 3,
  },

  // Semester 4
  { name: "Karan Thakur", email: "karan.thakur@student.com", semester: 4 },
  { name: "Pooja Shah", email: "pooja.shah@student.com", semester: 4 },
  { name: "Rohan Bhatia", email: "rohan.bhatia@student.com", semester: 4 },
  { name: "Divya Menon", email: "divya.menon@student.com", semester: 4 },
  { name: "Sanjay Pillai", email: "sanjay.pillai@student.com", semester: 4 },

  // Semester 5
  { name: "Neha Krishnan", email: "neha.krishnan@student.com", semester: 5 },
  { name: "Amitabh Nair", email: "amitabh.nair@student.com", semester: 5 },
  { name: "Shreya Iyer", email: "shreya.iyer@student.com", semester: 5 },
  { name: "Vivek Menon", email: "vivek.menon@student.com", semester: 5 },
  { name: "Rajesh Nair", email: "rajesh.nair@student.com", semester: 5 },
  { name: "Lakshmi Devi", email: "lakshmi.devi@student.com", semester: 5 },

  // Semester 6
  { name: "Suresh Kumar", email: "suresh.kumar@student.com", semester: 6 },
  { name: "Ramesh Pillai", email: "ramesh.pillai@student.com", semester: 6 },
  { name: "Geetha Nair", email: "geetha.nair@student.com", semester: 6 },
  { name: "Manoj Reddy", email: "manoj.reddy@student.com", semester: 6 },
  { name: "Priya Yadav", email: "priya.yadav@student.com", semester: 6 },
];

// Computer Science Teachers - No assignments, can manage all semesters/periods
const csTeachers = [
  {
    name: "Dr. Ramesh Kumar",
    email: "ramesh.kumar@teacher.com",
  },
  {
    name: "Prof. Lakshmi Devi",
    email: "lakshmi.devi@teacher.com",
  },
  {
    name: "Dr. Suresh Menon",
    email: "suresh.menon@teacher.com",
  },
  {
    name: "Prof. Anjali Sharma",
    email: "anjali.sharma.cs@teacher.com",
  },
  {
    name: "Dr. Vikram Rao",
    email: "vikram.rao.cs@teacher.com",
  },
  {
    name: "Prof. Kavita Singh",
    email: "kavita.singh@teacher.com",
  },
];

const defaultPassword = "123456";

async function seedUsers() {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info("Connected to MongoDB");

    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Seed Students
    console.log("\n📚 Seeding Computer Science students...\n");
    let studentsCreated = 0;
    let studentsSkipped = 0;

    for (const studentData of csStudents) {
      try {
        const existingStudent = await User.findOne({
          email: studentData.email,
        });

        if (existingStudent) {
          logger.info(`Student already exists: ${studentData.email}`);
          studentsSkipped++;
          continue;
        }

        const student = new User({
          name: studentData.name,
          email: studentData.email,
          passwordHash,
          role: "student",
          department: "Computer Science",
          semester: studentData.semester,
        });

        await student.save();
        studentsCreated++;
        console.log(
          `✅ Created student: ${studentData.name} (Semester ${studentData.semester})`
        );
      } catch (error) {
        logger.error(
          `Error creating student ${studentData.email}: ${error.message}`
        );
      }
    }

    // Seed Teachers
    console.log("\n👨‍🏫 Seeding Computer Science teachers...\n");
    let teachersCreated = 0;
    let teachersSkipped = 0;

    for (const teacherData of csTeachers) {
      try {
        const existingTeacher = await User.findOne({
          email: teacherData.email,
        });

        if (existingTeacher) {
          logger.info(`Teacher already exists: ${teacherData.email}`);
          teachersSkipped++;
          continue;
        }

        const teacher = new User({
          name: teacherData.name,
          email: teacherData.email,
          passwordHash,
          role: "teacher",
          department: "Computer Science",
        });

        await teacher.save();
        teachersCreated++;
        console.log(`✅ Created teacher: ${teacherData.name}`);
      } catch (error) {
        logger.error(
          `Error creating teacher ${teacherData.email}: ${error.message}`
        );
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 SEEDING SUMMARY");
    console.log("=".repeat(50));
    console.log(`\n🎓 Students:`);
    console.log(`   Total in seed data: ${csStudents.length}`);
    console.log(`   Created: ${studentsCreated}`);
    console.log(`   Skipped (already exist): ${studentsSkipped}`);
    console.log(`\n👨‍🏫 Teachers:`);
    console.log(`   Total in seed data: ${csTeachers.length}`);
    console.log(`   Created: ${teachersCreated}`);
    console.log(`   Skipped (already exist): ${teachersSkipped}`);
    console.log(`\n🔑 Default password for all users: ${defaultPassword}`);
    console.log(`\n🏫 Department: Computer Science (All users)`);
    console.log("\n✅ Seeding completed successfully!\n");

    process.exit(0);
  } catch (error) {
    logger.error("Error seeding users:", error);
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedUsers();
