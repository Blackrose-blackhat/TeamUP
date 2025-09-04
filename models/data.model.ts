// models/data.model.ts
import mongoose from "mongoose";

const DataSchema = new mongoose.Schema({
  skills: { type: [String], default: [] },
  years: { type: [String], default: [] },
  institutions: { type: [String], default: [] },
  genders: { type: [String], default: ["Male", "Female", "Other"] },
});

const Data = mongoose.models.Data || mongoose.model("Data", DataSchema);
export default Data;
