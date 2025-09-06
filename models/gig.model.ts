import mongoose, { Schema } from "mongoose";
import User from "./user.model"; // ✅ Ensure User is imported & registered before Gig

// --- Subschemas ---
const skillSchema = new Schema({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },
  weight: { type: Number, default: 1 },
});

const roleSchema = new Schema({
  roleName: { type: String, required: true },
  filledBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  count: { type: Number, default: 1 },
  mustHaveSkills: [{ type: String }],
});

const availabilitySchema = new Schema({
  days: [{ type: String }],
  hoursPerWeek: { type: Number, default: 5 },
  timeZone: { type: String },
});

const ratingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
});

const hackathonSchema = new Schema({
  name: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  location: { type: String },
});

// --- Main Gig Schema ---
const gigSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],

    skillsRequired: [skillSchema],
    rolesRequired: [roleSchema],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    applicants: [{ type: Schema.Types.ObjectId, ref: "User" }],

    maxTeamSize: { type: Number },
    minTeamSize: { type: Number },

    hackathon: hackathonSchema,
    projectType: { type: String, enum: ["Hackathon", "Side Project", "Research"] },

    availability: availabilitySchema,

    github: { type: String },
    figma: { type: String },
    liveDemo: { type: String },

    pastSuccessScore: { type: Number, default: 0 },
    ratings: [ratingSchema],

    status: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "Archived"],
      default: "Open",
    },
  },
  { timestamps: true }
);

// ✅ Prevent recompilation issues in Next.js
const Gig = mongoose.models.Gig || mongoose.model("Gig", gigSchema);
export default Gig;
