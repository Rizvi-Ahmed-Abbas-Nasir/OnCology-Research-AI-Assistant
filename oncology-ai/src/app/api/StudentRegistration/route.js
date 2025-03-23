import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import connectMongoDB from "@/lib/db";
import { isApiValid } from "@/lib/function";
import RegisterModel from "@/models/register"; 
import Student from "@/models/student";  

export async function POST(req) {
    try {
        const apiKey = req.headers.get( "Authorization");
        if (!isApiValid(apiKey)) {
            return NextResponse.json( { message: "Unauthorized access" }, { status: 401 });
        }

        // Connect to MongoDB
        await connectMongoDB();

        // Parse request data
        const data = await req.json();
        const { StudentName, StudentEmail, StudentPassword } = data;

        // Input validation
        if (!StudentName || !StudentEmail || !StudentPassword) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Check if email is already in use
        const existingUser = await RegisterModel.findOne({ StudentEmail });
        if (existingUser) {
            return NextResponse.json({ message: "Email already in use" }, { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(StudentPassword, 10);

        // Create a new user record
        const newUser = await RegisterModel.create({
            StudentName,
            StudentEmail,
            StudentPassword: hashedPassword
        });

        // Now that the user is created, create the student record
        const userId = newUser._id; // Get the newly created user's ID

        await Student.create({
            userId, // Assign the new user's ID
        });

        return NextResponse.json({ message: "Student Record Added Successfully" }, { status: 200 });

    } catch (error) {
        console.error("Server Error:", error.message);
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}
