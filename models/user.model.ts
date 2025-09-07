import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  username?: string;
  profilePhoto?: string;
  skills?: string[];
  academicYear?: "1" | "2" | "3" | "4" | "Passout"; // <-- string enum
  gender?: string;
  college?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  preferredRoles?: string[];
  interests?: string[];
  location?: string;
  availability?: string;
  onboarded: boolean;
}

// Define schema
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String },
    profilePhoto: { type: String },
    skills: [{ type: String }],
    academicYear: {                       // <-- renamed and string enum
      type: String,
      enum: ["1", "2", "3", "4", "Passout"],
    },
    gender: { type: String },
    college: { type: String },
    bio: { type: String },
    linkedin: { type: String },
    github: { type: String },
    preferredRoles: [{ type: String }],
    interests: [{ type: String }],
    location: { type: String },
    availability: { type: String },
    onboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Reuse model if already compiled (important in Next.js hot reload)
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
