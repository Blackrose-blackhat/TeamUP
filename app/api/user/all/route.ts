// app/api/user/all/route.ts
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Return only safe public fields
    const users = await usersCollection
      .find(
        {},
        {
          projection: {
            _id: 1,
            name: 1,
            email: 1,
            image: 1,
            bio: 1,
            gender: 1,
            institutionName: 1,
            institutionAddress: 1,
            github: 1,
            linkedin: 1,
            instagram: 1,
            skills: 1,
            projects: 1,
            year: 1,
          },
        }
      )
      .toArray();

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error("❌ Error fetching all users:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
