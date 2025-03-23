import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { isApiValid } from "@/lib/function";
import gallery from "@/models/gallery";
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
    const eventType = formData.get("eventType");
    const eventDescription = formData.get("description");
    const date = new Date(formData.get("date"));
    const selectedCategories = JSON.parse(formData.get("selectedCategories") || "[]");

    if (!eventTitle || !associateName || !eventType || !eventDescription || !date) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const uploadedScreenshots = [];
    const screenshots = formData.getAll("screenshots");

    // Ensure screenshots are correctly processed as files
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

    console.log("Server side img URLs:", uploadedScreenshots);

    if (!uploadedScreenshots.length) {
      return NextResponse.json(
        { message: "No images uploaded. Please check your input." },
        { status: 400 }
      );
    }

    const newEvent = new gallery({
      eventTitle,
      associateName,
      eventType,
      description: eventDescription,
      date,
      screenshots: uploadedScreenshots,
      selectedCategories,
    });

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
    const gallerys = await gallery.find().sort({ _id: -1 }).exec();
    console.log("Retrieved Events:", gallerys); // Debugging: Log the events to see if data is fetched.

    if (gallerys.length > 0) {
      return NextResponse.json(gallerys, { status: 200 });
    } else {
      console.log("No events found"); // Log the case when no events are found
      return NextResponse.json({ message: "No events found." }, { status: 404 });
    }
  } catch (error) {
    console.error("Error:", error); // Log the error details for further debugging
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}