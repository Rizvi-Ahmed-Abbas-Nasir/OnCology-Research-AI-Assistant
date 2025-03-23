import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import connectMongoDB from "@/lib/db";
import RegisterModel from "@/models/register";  // Ensure this path is correct

export async function POST(req) {
    try {
        // Connect to MongoDB
        try {
            await connectMongoDB();
        } catch (dbError) {
            console.error("Database connection failed:", dbError.message);
            return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
        }

        // Parse request data
        const data = await req.json();
        const { StudentEmail, StudentPassword } = data;

        // Input validation
        if (!StudentEmail || !StudentPassword) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        if (typeof StudentEmail !== 'string' || StudentEmail.trim() === '') {
            return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
        }

        // Find user by email
        const user = await RegisterModel.findOne({ StudentEmail: StudentEmail });

        if (!user) {
            console.log("No user found with this email:", StudentEmail);
            return NextResponse.json({ message: "No user found with this email" }, { status: 404 });
        }

        // Check if the password is valid
        const isValidPassword = await bcrypt.compare(StudentPassword, user.StudentPassword);

        if (!isValidPassword) {
            console.log("Invalid password attempt for email:", StudentEmail);
            return NextResponse.json({ message: "Invalid password" }, { status: 401 });
        }

        // Successful login
        return NextResponse.json({ message: "Login successful", user: { email: user.StudentEmail } }, { status: 200 });
        
    } catch (error) {
        console.error("Server Error:", error.message);
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}
