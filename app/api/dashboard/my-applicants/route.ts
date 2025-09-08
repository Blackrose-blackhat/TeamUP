import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Gig from "@/models/gig.model";
import mongoose from "mongoose";

let isConnected = false;
async function connectMongoose() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
}

export async function GET() {
  await connectMongoose();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(session.user.id);

  // Find gigs where user is in team or applicants
  const gigs = await Gig.find({
    $or: [
      { team: userId },
      { applicants: userId }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const formattedGigs = gigs.map((gig) => {
    let status = "In Progress";

    // Check if user is in team
    if (gig.team?.some((id: any) => new mongoose.Types.ObjectId(id).equals(userId))) {
      status = "Accepted";
    }
    // Otherwise, check if user is in applicants
    else if (
      gig.applicants?.some(
        (a: any) => new mongoose.Types.ObjectId(a.user).equals(userId)
      )
    ) {
      status = "In Progress";
    }

    return {
      _id: gig._id,
      title: gig.title,
      description: gig.description,
      status
    };
  });

  return new Response(
    JSON.stringify({ success: true, gigs: formattedGigs }),
    { status: 200 }
  );
}
