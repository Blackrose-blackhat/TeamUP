// app/api/gigs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb"; // your existing clientPromise
import mongoose from "mongoose";
import { Gig, User } from "@/models";
import { authOptions } from "../auth/[...nextauth]/route";

let isConnected = false;

// Helper to connect Mongoose using the existing clientPromise
async function connectMongoose() {
  if (isConnected) return;

  const client = await clientPromise; // use the existing clientPromise
  const dbName = client.db().databaseName;

  await mongoose.connect(process.env.MONGODB_URI!); // Mongoose needs URI, but connection shares client under the hood
  isConnected = true;
  console.log(`✅ Mongoose connected to ${dbName}`);
}

// --- List Gigs with filtering, pagination ---

export async function GET(request: NextRequest) {
  try {
    await connectMongoose();

    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const skills = searchParams.get("skills")?.split(",").filter(Boolean) || [];
    const years = searchParams.get("years")?.split(",").filter(Boolean) || [];
    const institutions =
      searchParams.get("institutions")?.split(",").filter(Boolean) || [];
    const genders =
      searchParams.get("genders")?.split(",").filter(Boolean) || [];
    const limit = 10;

    // Build Mongo query
    const query: any = {};
    if (skills.length) query["skillsRequired.name"] = { $in: skills };
    if (years.length) query.years = { $in: years };
    if (institutions.length) query.institutions = { $in: institutions };
    if (genders.length) query.genders = { $in: genders };

    // Exclude gigs created by current user
    if (currentUserId) {
      query.createdBy = { $ne: new mongoose.Types.ObjectId(currentUserId) };
    }

    const total = await Gig.countDocuments(query);
    const gigsFromDb = await Gig.find(query)
      .populate("createdBy", "name email github skills image")
      .populate("applicants", "name email github skills image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log(`Found ${gigsFromDb.length} gigs before user filtering`);

    // Additional client-side filtering if MongoDB query didn't work
    const filteredGigs = currentUserId
      ? gigsFromDb.filter((gig) => {
          const gigCreatorId =
            gig.createdBy?._id?.toString() || gig.createdBy?.toString();
          const sessionUserId = currentUserId.toString();
          console.log(
            `Comparing gig creator ${gigCreatorId} with session user ${sessionUserId}`
          );
          return gigCreatorId !== sessionUserId;
        })
      : gigsFromDb;

    console.log(`Showing ${filteredGigs.length} gigs after user filtering`);

    // Convert Mongoose documents to plain objects based on your actual data structure
    const gigs = filteredGigs.map((gig) => ({
      _id: gig._id.toString(),
      title: gig.title,
      description: gig.description,
      tags: gig.tags || [],
      skillsRequired: gig.skillsRequired || [],
      rolesRequired: gig.rolesRequired || [],
      team: gig.team || [],
      applicants:
        gig.applicants?.map((applicant: any) => ({
          _id: applicant._id?.toString(),
          name: applicant.name,
          email: applicant.email,
          github: applicant.github,
          skills: applicant.skills,
        })) || [],
      maxTeamSize: gig.maxTeamSize,
      minTeamSize: gig.minTeamSize,
      hackathon: gig.hackathon,
      projectType: gig.projectType,
      availability: gig.availability,
      github: gig.github,
      figma: gig.figma,
      liveDemo: gig.liveDemo,
      pastSuccessScore: gig.pastSuccessScore,
      status: gig.status,
      ratings: gig.ratings || [],
      createdAt: gig.createdAt.toISOString(),
      updatedAt: gig.updatedAt.toISOString(),
      createdBy: gig.createdBy
        ? {
            _id: gig.createdBy._id?.toString(),
            name: gig.createdBy.name,
            email: gig.createdBy.email,
            github: gig.createdBy.github,
            skills: gig.createdBy.skills,
            image:gig.createdBy.image
          }
        : null,
      // Remove fields that don't exist in your schema
      // budget: gig.budget,
      // deadline: gig.deadline?.toISOString(),
      // years: gig.years,
      // institutions: gig.institutions,
      // genders: gig.genders,
    }));

    return NextResponse.json({
      gigs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return NextResponse.json(
      { error: "Failed to fetch gigs" },
      { status: 500 }
    );
  }
}

// --- Create a new gig ---
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await connectMongoose();

  const gig = await Gig.create({
    ...body,
    createdBy: session.user.id,
  });

  return NextResponse.json({ success: true, gig });
}
