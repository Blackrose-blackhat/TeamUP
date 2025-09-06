// app/api/gigs/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";
import { Gig,User } from "@/models"; // ✅ ensure User schema is registered
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

// --- Get gig by ID ---
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoose();

    const gig = await Gig.findById(params.id)
      .populate("createdBy", "name email github skills profilePhoto")
      .populate("applicants", "name email github skills profilePhoto")
      .populate("team" , "name email skills profilePhoto")

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    return NextResponse.json(gig);
  } catch (err) {
    console.error("❌ Error fetching gig:", err);
    return NextResponse.json({ error: "Failed to fetch gig" }, { status: 500 });
  }
}

// --- Update a gig ---
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongoose();
  const { id } = params;
  const body = await req.json();

  const gig = await Gig.findById(id);
  if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  if (gig.createdBy.toString() !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  Object.assign(gig, body, { updatedAt: new Date() });
  await gig.save();

  return NextResponse.json({ success: true, gig });
}

// --- Delete a gig ---


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectMongoose()
    const { id } = params

    const gig = await Gig.findById(id)
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 })
    }

    // Compare the ObjectId of createdBy with the session user id
    if (gig.createdBy.toString() !== session.user.id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await gig.deleteOne()

    return NextResponse.json({ success: true, message: "Gig deleted successfully" })
  } catch (err: any) {
    console.error("DELETE /api/gigs/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


// --- Apply to a gig ---
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectMongoose();
  const { id } = params;

  const gig = await Gig.findById(id);
  if (!gig) return NextResponse.json({ message: "Gig not found" }, { status: 404 });

  if (gig.applicants.includes(session.user.id)) {
    return NextResponse.json({ message: "Already applied" }, { status: 400 });
  }

  gig.applicants.push(session.user.id);
  await gig.save();

  return NextResponse.json({ success: true, message: "Applied successfully", gig });
}
