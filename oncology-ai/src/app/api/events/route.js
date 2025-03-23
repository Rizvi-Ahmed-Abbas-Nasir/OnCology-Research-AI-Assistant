import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { isApiValid } from "@/lib/function";
import CompletedEvent from "@/models/events";
import streamifier from "streamifier";
import cloudinary from "@/lib/cloudinary";


export async function POST(req) {
  try {
    const apiKey = req.headers.get("Authorization");

    // Validate the API key
    if (!isApiValid(apiKey)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const formData = await req.formData();
  
    const eventTitle = formData.get("eventTitle");
    const associateName = formData.get("associateName");
    const location = formData.get("location");
    const eventType = formData.get("eventType");
    const description = formData.get("eventType"); 
    const aboutEvent = formData.get("aboutEvent");
    const eventDescription = formData.get("description");
    const websiteLink = formData.get("websiteLink");
    const date = new Date(formData.get("date"));
    const time = new Date(formData.get("time"));

    const selectedCategories = JSON.parse(formData.get("selectedCategories") || "[]");

    const uploadedScreenshots = [];
    const screenshots = formData.getAll("screenshots");

    // Validate required fields
    if (
      !eventTitle ||
      !associateName ||
      !location ||
      !eventType ||
      !description ||
      !aboutEvent ||
      !eventDescription ||
      !date ||
      !time ||
      !Array.isArray(screenshots)
    ) {
      return NextResponse.json(
        { message: "Missing or invalid fields" },
        { status: 400 }
      );
    }

  

    // Directly store screenshots (already in Base64 or URL format)
    if (screenshots.length === 0) {
      return NextResponse.json(
        { message: "No images uploaded. Please check your input." },
        { status: 400 }
      );
    }



    for (const screenshot of screenshots) {
      if (screenshot instanceof Blob) {
        const buffer = Buffer.from(await screenshot.arrayBuffer());
        const stream = streamifier.createReadStream(buffer);

        try {
          const uploadedImageUrl = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "events/screenshots" },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload error:", error);
                  return reject(error);
                }
                resolve(result.secure_url);
              }
            );
            stream.pipe(uploadStream);
          });

          console.log("Uploaded image:", uploadedImageUrl); // Log the uploaded URL
          uploadedScreenshots.push(uploadedImageUrl);
        } catch (imageUploadError) {
          return NextResponse.json(
            { message: "Error uploading screenshot", error: imageUploadError.message },
            { status: 500 }
          );
        }
      }
    }
    // Create a new event
    const newEvent = new CompletedEvent({
      eventTitle,
      associateName,
      location,
      eventType,
      description,
      aboutEvent,
      eventDescription,
      websiteLink: websiteLink || "",
      date: new Date(date),
      time,
      screenshots: uploadedScreenshots,
      selectedCategories,
    });

    // Save the new event to the database
    const savedEvent = await newEvent.save();

    return NextResponse.json(
      { message: "Event created successfully!", event: savedEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Error creating event", error: error.message },
      { status: 500 }
    );
  }
}


export async function GET(req) {
  try {
    const apiKey = req.headers.get("Authorization");
    console.log("API Key:", apiKey);  // Debugging: Log the API key to see if it’s being passed correctly.

    if (!isApiValid(apiKey)) {
      console.log("Invalid API Key"); // Log invalid API key case
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    await connectMongoDB();
    console.log("Connected to MongoDB"); // Debugging: Log MongoDB connection

    // Fetch the events
    const completedEvent = await CompletedEvent.find().sort({ _id: -1 }).exec();
    console.log("Retrieved Events:", completedEvent); // Debugging: Log the events to see if data is fetched.

    if (completedEvent.length > 0) {
      return NextResponse.json(completedEvent, { status: 200 });
    } else {
      console.log("No events found"); // Log the case when no events are found
      return NextResponse.json({ message: "No events found." }, { status: 404 });
    }
  } catch (error) {
    console.error("Error:", error); // Log the error details for further debugging
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}