import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const gigId = segments[segments.length - 2]; // [id]/evaluate-skills

    if (!gigId)
      return NextResponse.json({ error: "Gig ID missing" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();
    const gigsCollection = db.collection("gigs");
    const usersCollection = db.collection("users");

    const gig = await gigsCollection.findOne({ _id: new ObjectId(gigId) });
    if (!gig)
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });

    // Extract required skill names
    const requiredSkills: string[] = (gig.skillsRequired || []).map(
      (skill: any) => skill.name.trim().toLowerCase()
    );
    console.log("requiredSKills",requiredSkills)
    // Prepare applicant IDs
    const applicantIds = (gig.applicants || []).map((a: any) =>
      typeof a === "string" ? new ObjectId(a) : a._id ? new ObjectId(a._id) : a
    );

    const applicants = await usersCollection
      .find({ _id: { $in: applicantIds } })
      .toArray();

    const evaluated = applicants.map((applicant) => {
      const applicantSkills: string[] = Array.isArray(applicant.skills)
        ? applicant.skills.map((s: string) => s.trim().toLowerCase())
        : applicant.skills
        ? [applicant.skills.trim().toLowerCase()]
        : [];

      const matchedSkills = applicantSkills.filter((skill) =>
        requiredSkills.includes(skill)
      );
      console.log(matchedSkills);
      const matchScore = requiredSkills.length
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;
      return {
        _id: applicant._id,
        username: applicant.username,
        email: applicant.email,
        skills: applicantSkills,
        matchScore,
      };
    });

    return NextResponse.json({ success: true, data: evaluated });
  } catch (err) {
    console.error("Error evaluating skills:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
