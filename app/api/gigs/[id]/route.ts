// app/api/gigs/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";
import Gig from "@/models/gig.model";
import { authOptions } from "../../auth/[...nextauth]/route";

let isConnected = false;

// Connect Mongoose using clientPromise
async function connectMongoose() {
  if (isConnected) return;
  await clientPromise; // ensures the MongoClient is initialized
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
  console.log("✅ Mongoose connected using clientPromise");
}

// --- Update a gig ---
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongoose();
  const { id } = params;
  const body = await req.json();

  const gig = await Gig.findById(id);
  if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  if (gig.createdBy.toString() !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  Object.assign(gig, body, { updatedAt: new Date() });
  await gig.save();

  return NextResponse.json({ success: true, gig });
}

// --- Delete a gig ---
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongoose();
  const { id } = params;

  const gig = await Gig.findById(id);
  if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  if (gig.createdBy.toString() !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await gig.deleteOne();
  return NextResponse.json({ success: true });
}

// --- Apply to a gig ---
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongoose();
  const { id } = params;

  const gig = await Gig.findById(id);
  if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });

  // Avoid duplicate application
  if (gig.applicants.includes(session.user.id)) {
    return NextResponse.json({ error: "Already applied" }, { status: 400 });
  }

  gig.applicants.push(session.user.id);
  await gig.save();

  return NextResponse.json({ success: true, gig });
}
