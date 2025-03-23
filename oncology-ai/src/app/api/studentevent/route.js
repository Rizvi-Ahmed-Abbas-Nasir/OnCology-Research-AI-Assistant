


import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/db";
import { isApiValid } from "@/lib/function";
import Student from "@/models/student";
import StudentEvent from "@/models/studentevent"
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
    const newEvent = new StudentEvent({
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

    const studentEvents = await StudentEvent.find({ userId }).exec();

    if (studentEvents.length > 0) {
      return NextResponse.json(studentEvents, { status: 200 });
    } else {
      return NextResponse.json({ message: "No events found for the given userId." }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}


export async function PUT(req) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Extract `_id` from the query parameters
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("_id");

    if (!eventId) {
      return NextResponse.json({ message: "Event ID is required for updating." }, { status: 400 });
    }

    // Get form data
    const formData = await req.formData();

    // Extract fields from form data
    const eventName = formData.get("eventName");
    const eventDescription = formData.get("eventDescription");
    const collegeName = formData.get("collegeName");
    const organization = formData.get("organization");
    const eventNotice = formData.get("eventNotice");
    const eventDate = formData.get("eventDate") ? new Date(formData.get("eventDate")) : null;
    const category = formData.get("category");
    const time = formData.get("time");
    const department = formData.getAll("department");
    const eligible_degree_year = formData.getAll("eligible_degree_year");
    const isMoney = formData.get("isMoney") === "true";
    const money = formData.get("money");
    const imageFile = formData.get("image");
    const certificateFile = formData.get("certificate");

    // Find the event by ID
    const existingEvent = await StudentEvent.findById(eventId);
    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    let imageUrl = existingEvent.image;
    let certificateUrl = existingEvent.certificate;

    // Upload new event banner image to Cloudinary, if provided
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

    // Upload new certificate file to Cloudinary, if provided
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

    // Update the event
    existingEvent.eventName = eventName || existingEvent.eventName;
    existingEvent.eventDescription = eventDescription || existingEvent.eventDescription;
    existingEvent.collegeName = collegeName || existingEvent.collegeName;
    existingEvent.organization = organization || existingEvent.organization;
    existingEvent.eventNotice = eventNotice || existingEvent.eventNotice;
    existingEvent.eventDate = eventDate || existingEvent.eventDate;
    existingEvent.category = category || existingEvent.category;
    existingEvent.time = time || existingEvent.time;
    existingEvent.department = department.length ? department : existingEvent.department;
    existingEvent.eligible_degree_year = eligible_degree_year.length
      ? eligible_degree_year
      : existingEvent.eligible_degree_year;
    existingEvent.isMoney = isMoney;
    existingEvent.money = isMoney ? money : undefined;
    existingEvent.image = imageUrl || existingEvent.image;
    existingEvent.certificate = certificateUrl || existingEvent.certificate;

    const updatedEvent = await existingEvent.save();

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ message: "Error updating event", error: error.message }, { status: 500 });
  }
}



export async function DELETE(req) {
  try {
    const apiKey = req.headers.get("Authorization");

    // Validate API key
    if (!isApiValid(apiKey)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const _id = searchParams.get("_id"); // Extract `_id` from query string

    // Validate `_id`
    if (!_id) {
      return NextResponse.json({ message: "_id is required." }, { status: 400 });
    }

    // Attempt to delete the document with the provided `_id`
    const deleteResult = await StudentEvent.deleteOne({ _id }).exec();

    if (deleteResult.deletedCount > 0) {
      return NextResponse.json(
        { message: `Event with _id ${_id} deleted successfully.` },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: `No event found with _id ${_id}.` },
        { status: 404 }
      );
    }
  } catch (error) {
    if (error.kind === "ObjectId") {
      // Handle invalid MongoDB ObjectId format
      return NextResponse.json(
        { message: "Invalid _id format.", error: error.message },
        { status: 400 }
      );
    }
    // Handle other errors
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
