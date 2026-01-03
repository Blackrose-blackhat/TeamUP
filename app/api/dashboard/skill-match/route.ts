// app/api/dashboard/skill-match/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User, Gig } from "@/models";
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
    const user = await User.findById(session.user.id).lean();
    if (!user) throw new Error("User not found");

    // 🔥 Normalize skills (string → array)
    const rawSkills = user.skills;
    const userSkills: string[] = Array.isArray(rawSkills)
      ? rawSkills
      : rawSkills
      ? [rawSkills]
      : [];

    const allGigs = await Gig.find({ status: "Open" }).lean();
    const totalSkills = allGigs.reduce(
      (acc, gig) => acc.concat(gig.skills || []),
      [] as string[]
    );

    const matchedSkills = userSkills.filter((skill: string) =>
      totalSkills.includes(skill)
    );

    const percentage =
      totalSkills.length > 0
        ? Math.round((matchedSkills.length / totalSkills.length) * 100)
        : 0;

    return NextResponse.json({ success: true, percentage });
  } catch (err: any) {
    console.error("❌ Skill match error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
