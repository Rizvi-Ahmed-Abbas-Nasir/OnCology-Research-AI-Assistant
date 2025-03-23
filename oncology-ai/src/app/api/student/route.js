


import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { isApiValid } from "@/lib/function";
import Student from "@/models/student";
import streamifier from "streamifier";
import  cloudinary  from "@/lib/cloudinary";


const MAX_STALE_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export async function PUT(req) {
  try {
    const apiKey = req.headers.get("Authorization");

    // Validate the API key
    if (!isApiValid(apiKey)) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    await connectMongoDB();
    
    // Get the form data
    const formData = await req.formData(); 

    // Extract fields from form data
    const userId = formData.get("userId");
    const name = formData.get("name");
    const vid = formData.get("vid");
    const className = formData.get("class");
    const batch = formData.get("batch");
    const div = formData.get("div");
    const sem = formData.get("sem");
    const imageFile = formData.get("image");
    const requestTime = new Date(formData.get('X-Request-Time')); // Get request time

    // Check if the request time is stale
    const currentTime = new Date();
    if (currentTime - requestTime > MAX_STALE_TIME) {
      return NextResponse.json(
        { message: "Stale request. Please try again." },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!userId || !name || !vid || !className || !batch || !div || !sem) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    let imageUrl;

    // Check if the imageFile is provided and is a Blob
    if (imageFile && imageFile instanceof Blob) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      // Create a readable stream from the buffer
      const stream = streamifier.createReadStream(buffer);

      // Upload to Cloudinary
      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "students" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result.secure_url);
          }
        );

        stream.pipe(uploadStream); // Pipe the stream to the upload function
      });
    }

    // Find and update the student document
    const updatedStudent = await Student.findOneAndUpdate(
      { userId },
      {
        name,
        vid,
        class: className,
        batch,
        div,
        sem,
        image: imageUrl || undefined, // Update the image URL if available
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error("Error updating student with userId:", error);
    return NextResponse.json({ message: "Error Updating Document", error: error.message }, { status: 500 });
  }
}




export async function GET(req) {
  try {
    const apiKey = req.headers.get("Authorization"); // Extract API key from header

    if (!isApiValid(apiKey)) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    await connectMongoDB();

    // Extract userId from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // Get userId from query parameters

    if (!userId) {
      return NextResponse.json({ message: "userId is required." }, { status: 400 }); // Bad Request
    }

    const StudentDetails = await Student.findOne({ userId });

    // Check if StudentDetails is null
    if (StudentDetails) {
      return NextResponse.json(StudentDetails, { status: 200 });
    } else {
      return NextResponse.json({ message: "No data found for the given userId." }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching student details:", error); // Log the error for debugging
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 }); // Return 500 status code
  }
}