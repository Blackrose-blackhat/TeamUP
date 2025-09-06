import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Gig } from "@/models";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";
let isConnected = false;

async function connectMongoose() {
  if (isConnected) return;

  const client = await clientPromise; // use the existing clientPromise
  const dbName = client.db().databaseName;

  await mongoose.connect(process.env.MONGODB_URI!); // Mongoose needs URI, but connection shares client under the hood
  isConnected = true;
  console.log(`✅ Mongoose connected to ${dbName}`);
}
export async function GET() {
  await connectMongoose();

  const session = await getServerSession(authOptions);
 
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const gigs = await Gig.find({ createdBy: session.user.id })
      .populate("createdBy", "name email github skills")
      .populate("applicants", "name email github skills")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      gigs,
      total: gigs.length,
    });
  } catch (err: any) {
    console.error("❌ Error fetching your gigs:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
