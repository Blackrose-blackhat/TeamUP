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

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(session.user.id),
    });

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount > 0,
    });
  } catch (err: any) {
    console.error("❌ Error deleting user:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
