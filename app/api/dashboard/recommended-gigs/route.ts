// app/api/dashboard/recommended-gigs/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User, Gig } from "@/models";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";

let isConnected = false;
async function connectMongoose() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
  console.log("✅ Mongoose connected");
}

export async function GET() {
  await connectMongoose();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await User.findById(session.user.id);
    if (!user) throw new Error("User not found");

    // Recommend gigs based on matching skills
    const gigs = await Gig.find({ status: "Open" });
    const recommended = gigs
      .map((gig) => {
        const matchCount = gig.skills?.filter((s: string) => user.skills.includes(s)).length || 0;
        return { ...gig.toObject(), matchScore: matchCount };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // top 5 recommended gigs

    return NextResponse.json({ success: true, gigs: recommended });
  } catch (err: any) {
    console.error("❌ Recommended gigs error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
