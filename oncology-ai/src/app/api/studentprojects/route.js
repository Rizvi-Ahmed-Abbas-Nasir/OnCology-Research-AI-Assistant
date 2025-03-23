


import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { isApiValid } from "@/lib/function";
import Student from "@/models/student";
import StudentProject from "@/models/studentprojects"
import streamifier from "streamifier";
import  cloudinary  from "@/lib/cloudinary";


const MAX_STALE_TIME = 60 * 60 * 1000; // 1 hour in milliseconds


export async function POST(req) {
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
    const eventName = formData.get("eventName");
    const eventDescription = formData.get("eventDescription");
    const collegename = formData.get("collegename");
    const organization = formData.get("organization");
    const locationOfSpeaker = formData.get("locationOfSpeaker");
    const eventNotice = formData.get("eventNotice");
    const date = new Date(formData.get("date"));
    const eventDate = new Date(formData.get("eventDate"));
    const category = formData.get("category");
    const time = formData.get("time");
    const department = formData.getAll("department"); // Get all selected departments
    const eligible_degree_year = formData.getAll("eligible_degree_year"); // Get all eligible degree years
    const isPaid = formData.get("isPaid") === 'true'; // Assuming it's a checkbox
    const cost = Number(formData.get("cost"));
    const ismoney = formData.get("ismoney") === 'true'; // Assuming it's a checkbox
    const money = formData.get("money");
    const imageFile = formData.get("image");
    const certificateFile = formData.get("certificate");

    // Validate required fields
    if (!userId || !eventName || !collegename || !date || !eventDate || !category || !time || !department.length || !eligible_degree_year.length) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    let imageUrl, certificateUrl;

    // Upload the event banner image to Cloudinary
    if (imageFile && imageFile instanceof Blob) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const stream = streamifier.createReadStream(buffer);

      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "events" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result.secure_url);
          }
        );

        stream.pipe(uploadStream);
      });
    }

    // Upload the certificate image to Cloudinary
    if (certificateFile && certificateFile instanceof Blob) {
      const buffer = Buffer.from(await certificateFile.arrayBuffer());
      const stream = streamifier.createReadStream(buffer);

      certificateUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "certificates" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result.secure_url);
          }
        );

        stream.pipe(uploadStream);
      });
    }

    // Create a new event document
    const newEvent = new StudentProject({
      userId,
      eventName,
      eventDescription,
      collegename,
      organization,
      locationOfSpeaker,
      eventNotice,
      date,
      eventDate,
      category,
      time,
      department,
      eligible_degree_year,
      isPaid,
      cost,
      ismoney,
      money,
      image: imageUrl || undefined,
      certificate: certificateUrl || undefined,
    });

    const savedEvent = await newEvent.save();

    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ message: "Error creating event", error: error.message }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    const apiKey = req.headers.get("Authorization");

    if (!isApiValid(apiKey)) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "userId is required." }, { status: 400 });
    }

    const StudentProjects = await StudentProject.find({ userId }).exec();

    if (StudentProjects.length > 0) {
      return NextResponse.json(StudentProjects, { status: 200 });
    } else {
      return NextResponse.json({ message: "No events found for the given userId." }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
