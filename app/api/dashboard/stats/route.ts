// app/api/dashboard/stats/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Gig from "@/models/gig.model";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";

let isConnected = false;
async function connectMongoose() {
  if (isConnected) return;
  await clientPromise;
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
}

export async function GET() {
  await connectMongoose();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
  }

  const userId = session.user.id;

  const postedGigs = await Gig.countDocuments({ createdBy: userId });
  const applications = await Gig.countDocuments({ applicants: userId });
  const completed = await Gig.countDocuments({ team: userId, status: "Completed" });

  return new Response(JSON.stringify({ success: true, postedGigs, applications, completed }));
}
