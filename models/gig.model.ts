// models/gig.model.ts
import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },
  weight: { type: Number, default: 1 }, // importance for matching
});

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true }, // e.g., "Frontend"
  filledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  count: { type: Number, default: 1 },
  mustHaveSkills: [{ type: String }],
});

const availabilitySchema = new mongoose.Schema({
  days: [{ type: String }], // e.g., ["Mon", "Wed"]
  hoursPerWeek: { type: Number, default: 5 },
  timeZone: { type: String },
});

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
});

const hackathonSchema = new mongoose.Schema({
  name: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  location: { type: String },
});

const gigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],

    skillsRequired: [skillSchema],
    rolesRequired: [roleSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // current members
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // users who applied

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

    status: { type: String, enum: ["Open", "In Progress", "Completed", "Archived"], default: "Open" },
  },
  { timestamps: true }
);

const Gig = mongoose.models.Gig || mongoose.model("Gig", gigSchema);
export default Gig;
