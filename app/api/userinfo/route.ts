import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { User } from "@/models/user.model"; // make sure you have the type/interface

export  async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection<User>("users").findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
