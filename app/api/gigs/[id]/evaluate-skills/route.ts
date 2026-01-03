import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// --- Normalization & Matching Utils ---

function normalize(skill: string) {
  return skill.toLowerCase().replace(/[\s\.\-\_]/g, ""); // remove spaces, dots, dashes, underscores
}

// Common synonyms for dev skills
const synonyms: Record<string, string[]> = {
  javascript: ["js", "nodejs", "node"],
  typescript: ["ts"],
  nextjs: ["next", "next.js"],
  react: ["reactjs", "react.js"],
  node: ["node.js", "nodejs"],
  mongodb: ["mongo", "mongoose"],
  postgresql: ["postgres"],
  git: ["github", "gitlab"],
  docker: ["containers"],
  solidity: ["smartcontracts", "evm"],
  sql: ["mysql", "postgres", "sqlite"],
  css: ["tailwind", "tailwindcss", "scss"],
  aws: ["amazonwebservices", "ec2", "s3", "lambda"],
};

function areSynonyms(a: string, b: string): boolean {
  const normA = normalize(a);
  const normB = normalize(b);

  if (normA === normB) return true;

  for (const [key, values] of Object.entries(synonyms)) {
    const normVals = values.map(normalize);
    if (
      normA === key ||
      normVals.includes(normA)
    ) {
      if (normB === key || normVals.includes(normB)) {
        return true;
      }
    }
  }
  return false;
}

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}

function isSimilar(skillA: string, skillB: string): boolean {
  const a = normalize(skillA);
  const b = normalize(skillB);

  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  if (areSynonyms(a, b)) return true;

  const distance = levenshtein(a, b);
  const threshold = Math.floor(Math.max(a.length, b.length) * 0.3); // allow 30% edits
  return distance <= threshold;
}

// --- API Route ---

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
      (skill: any) => normalize(skill.name)
    );

    // Prepare applicant IDs
    const applicantIds = (gig.applicants || []).map((a: any) =>
      typeof a === "string" ? new ObjectId(a) : a._id ? new ObjectId(a._id) : a
    );

    const applicants = await usersCollection
      .find({ _id: { $in: applicantIds } })
      .toArray();

    const evaluated = applicants.map((applicant) => {
      const applicantSkills: string[] = Array.isArray(applicant.skills)
        ? applicant.skills.map((s: string) => normalize(s))
        : [];

      const matchedSkills = applicantSkills.filter((aSkill) =>
        requiredSkills.some((rSkill) => isSimilar(aSkill, rSkill))
      );

      const matchScore =
        requiredSkills.length > 0
          ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
          : 0;

      return {
        _id: applicant._id,
        username: applicant.username,
        email: applicant.email,
        skills: applicant.skills || [],
        matchedSkills,
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
