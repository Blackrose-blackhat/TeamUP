// app/api/user/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";
import { User } from "@/models/user.model";
import Data from "@/models/data.model";

let isConnected = false;

async function connectMongoose() {
  if (isConnected) return;
  await clientPromise;
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const data: Partial<User> & { skills?: string; year?: string; institutionName?: string; gender?: string } = await req.json();
    const { skills, year, institutionName, gender, ...rest } = data;

    await connectMongoose();
    const db = mongoose.connection;

    // 1️⃣ Update User
await db.collection<User>("users").updateOne(
  { email },
  {
    $set: {
      ...rest,
      onboarded: true,
      ...(skills && { skills }),
      ...(year && { year }),
      ...(institutionName && { institutionName }),
      ...(gender && { gender }),
    },
  },
  { upsert: true }
);


    // 2️⃣ Update Data document
    const dataDoc = await Data.findOne() || new Data();

    if (skills && skills.length) {
      dataDoc.skills = Array.from(new Set([...dataDoc.skills, ...skills.split(",").map(s => s.trim())]));
    }
    if (year) dataDoc.years = Array.from(new Set([...dataDoc.years, year]));
    if (institutionName) dataDoc.institutions = Array.from(new Set([...dataDoc.institutions, institutionName]));
    if (gender) dataDoc.genders = Array.from(new Set([...dataDoc.genders, gender]));

    await dataDoc.save();

    // Optional: fetch the updated user
    const updatedUser = await db.collection<User>("users").findOne({ email });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error onboarding user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
