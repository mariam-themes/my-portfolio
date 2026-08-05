import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = await User.create({
      email: "admin@example.com",
      passwordHash: hashedPassword,
      name: "Admin User",
      role: "admin",
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      user: {
        email: adminUser.email,
        name: adminUser.name,
        password: "admin123"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
