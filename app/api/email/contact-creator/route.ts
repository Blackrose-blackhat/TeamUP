import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { gigId, message, applicantName, applicantEmail, creatorEmail } =
      await req.json();

    // Validate required fields
    if (
      !gigId ||
      !message ||
      !applicantName ||
      !applicantEmail ||
      !creatorEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email to the creator
    await sendEmail("contact_creator", creatorEmail, {
      applicantName,
      applicantEmail,
      creatorEmail,
      gigId,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent to creator!",
    });
  } catch (err) {
    console.error("Error sending email to creator:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
