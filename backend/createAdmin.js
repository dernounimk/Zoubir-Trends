// backend/createAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: "admin@store.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      name: "Admin",
      email: "admin@store.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    console.log("✅ Admin created successfully!");
    console.log("Email: admin@store.com");
    console.log("Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
