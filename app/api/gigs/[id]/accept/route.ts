import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Gig from "@/models/gig.model";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
let isConnected = false;
async function connectMongoose() {
  if (isConnected) return;
  await clientPromise;
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
}
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoose();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { applicantId, roleId } = await req.json();
    if (!applicantId) {
      return NextResponse.json({ success: false, error: "Applicant ID required" }, { status: 400 });
    }

    const gig = await Gig.findById(params.id);
    if (!gig) {
      return NextResponse.json({ success: false, error: "Gig not found" }, { status: 404 });
    }

    // ✅ Ensure only the creator can accept applicants
    if (!gig.createdBy.equals(new mongoose.Types.ObjectId(session.user.id))) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // ✅ Ensure applicant exists in gig
    if (!gig.applicants.includes(applicantId)) {
      return NextResponse.json({ success: false, error: "Applicant not found in gig" }, { status: 400 });
    }

    // ✅ Move from applicants → team
    gig.applicants.pull(applicantId);
    gig.team.addToSet(applicantId);

    // ✅ Assign role if provided
    if (roleId) {
      const role = gig.rolesRequired.id(roleId);
      if (role) {
        role.filledBy = new mongoose.Types.ObjectId(applicantId);
      }
    }

    await gig.save();

    return NextResponse.json({ success: true, gig });
  } catch (err: any) {
    console.error("❌ Error accepting applicant:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
