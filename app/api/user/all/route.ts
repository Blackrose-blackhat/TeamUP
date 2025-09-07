// app/api/user/all/route.ts
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = parseInt(url.searchParams.get("perPage") || "6", 10);

    // ✅ Get current user from session
    const session = await getServerSession(authOptions);
    const currentUserEmail = session?.user?.email;

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const query: any = {};
    if (currentUserEmail) {
      query.email = { $ne: currentUserEmail }; // exclude logged-in user
    }

    const total = await usersCollection.countDocuments(query);

    const users = await usersCollection
      .find(query, {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          image: 1,
          bio: 1,
          institutionName: 1,
          institutionAddress: 1,
          github: 1,
          linkedin: 1,
          instagram: 1,
          skills: 1,
          projects: 1,
          year: 1,
          username:1
        },
      })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (err: any) {
    console.error("❌ Error fetching users:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
