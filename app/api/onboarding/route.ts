import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user.model";

export async function POST(req: NextRequest) {
  const data: Partial<User> & { email: string } = await req.json();
  const { email, ...rest } = data;

  if (!email) {
    return NextResponse.json({ error: "Email missing" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection<User>("users").updateOne(
      { email },
      { $set: { ...rest, onboarded: true } },
      { upsert: true }
    );

    // Optional: fetch the updated document to return
    const updatedUser = await db.collection<User>("users").findOne({ email });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error onboarding user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
