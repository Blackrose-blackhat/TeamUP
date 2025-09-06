// app/api/data/options/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import Data from "@/models/data.model";

let isConnected = false;

async function connectMongoose() {
  if (isConnected) return;
  await clientPromise;
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
}

export async function GET() {
  try {
    await connectMongoose();

    // Only fetch the `skills` field
    const dataDoc = await Data.findOne().select("skills -_id").lean();

    return NextResponse.json(dataDoc?.skills || []);
  } catch (err: any) {
    console.error("❌ Error fetching skills:", err);
    return NextResponse.json({ skills: [] }, { status: 500 });
  }
}
