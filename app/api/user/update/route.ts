// app/api/user/update/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      bio,
      gender,
      institutionName,
      institutionAddress,
      github,
      linkedin,
      instagram,
      skills,
      projects,
      year,
    } = body;

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Update user profile by _id
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          bio,
          gender,
          institutionName,
          institutionAddress,
          github,
          linkedin,
          instagram,
          skills,
          projects,
          year,
          onboarded: true, // ✅ mark as onboarded
        },
      }
    );

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount > 0,
    });
  } catch (err: any) {
    console.error("❌ Error updating profile:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
