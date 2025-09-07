// app/api/user/delete/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");
    const gigsCollection = db.collection("gigs"); // your gigs collection

    const userId = session.user.id;

    // 1️⃣ Soft-delete the user
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          deleted: true,
          deletedEmail: session.user.email, // keep original email
          name: "Deleted User",
          username: `deleted_${userId}`,
          image: null,
          email: null, // optional: hide email from frontend
        },
      }
    );

    // 2️⃣ Optional: update gigs to anonymize
    await gigsCollection.updateMany(
      { userId },
      {
        $set: {
          creatorName: "Deleted User",
          creatorId: null,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error deleting user:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
