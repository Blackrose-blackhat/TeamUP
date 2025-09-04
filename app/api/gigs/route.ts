// app/api/gigs/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb"; // your existing clientPromise
import mongoose from "mongoose";
import Gig from "@/models/gig.model";
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
export async function GET(req: Request) {
  await connectMongoose();

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const skills = url.searchParams.get("skills")?.split(",") || [];
  const projectType = url.searchParams.get("projectType");
  const status = url.searchParams.get("status");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  const query: any = {};
  if (search) query.title = { $regex: search, $options: "i" };
  if (skills.length) query["skillsRequired.name"] = { $in: skills };
  if (projectType) query.projectType = projectType;
  if (status) query.status = status;

  const total = await Gig.countDocuments(query);
  const gigs = await Gig.find(query)
    .populate("createdBy", "name email github skills")
    .populate("applicants", "name email github skills")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({ success: true, gigs, total, page, pages: Math.ceil(total / limit) });
}

// --- Create a new gig ---
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, skillsRequired, rolesRequired, projectType, availability, tags } = body;

  await connectMongoose();

  const gig = await Gig.create({
    title,
    description,
    skillsRequired,
    rolesRequired,
    projectType,
    availability,
    tags,
    createdBy: session.user.id,
  });

  return NextResponse.json({ success: true, gig });
}
