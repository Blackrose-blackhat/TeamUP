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

  const gigs = await Gig.find({
    $or: [
      { team: session.user.id },
      { "applicants.user": session.user.id }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(10);

  const formattedGigs = gigs.map(gig => {
    let status = "Not Applied";
    if (gig.team?.includes(session.user.id)) status = "Accepted";
    else if (gig.applicants?.some((a: any) => a.user === session.user.id)) status = "In Progress";

    return {
      _id: gig._id,
      title: gig.title,
      description: gig.description,
      status
    };
  });

  return new Response(JSON.stringify({ success: true, gigs: formattedGigs }), { status: 200 });
}
