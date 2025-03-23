import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import Admin from "@/models/admin";

export async function POST(req) {
    try {
        await connectMongoDB();

        const formData = await req.formData();
        const AdminID = formData.get("AdminID");
        const Adminpassword = formData.get("Adminpassword");

        if (!AdminID || !Adminpassword) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const user = await Admin.findOne({ AdminID: AdminID });
        console.log("Queried user:", user);

        if (!user) {
            console.log("No user found with AdminID:", AdminID);
            return NextResponse.json({ message: "No user found with this AdminID" }, { status: 404 });
        }

        console.log("Adminpassword in user:", user.Adminpassword);
        console.log("Type of user.Adminpassword:", typeof user.Adminpassword);

        // Compare plaintext passwords
        if (String(Adminpassword).trim() === String(user.Adminpassword).trim()) {
            console.log("Password is correct");
            return NextResponse.json({ message: "Login successful", user: { AdminID: user.AdminID } }, { status: 200 });
        } else {
            console.log("Invalid password");
            return NextResponse.json({ message: "Invalid password" }, { status: 401 });
        }
    } catch (error) {
        console.error("Server Error:", error.message);
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}
