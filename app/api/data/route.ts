// app/api/data/options/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import Data from "@/models/data.model";

let isConnected = false;
async function connectMongoose() {
  if (isConnected) return;
  await clientPromise;
  await mongoose.connect(process.env.MONGODB_URI!);
  isConnected = true;
}

export async function GET() {
  await connectMongoose();
  const dataDoc = await Data.findOne();
  return NextResponse.json(dataDoc || { skills: [], years: [], institutions: [], genders: [] });
}
