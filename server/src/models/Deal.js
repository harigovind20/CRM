import mongoose from "mongoose";

export const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Won"];

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    owner: { type: String, trim: true, default: "" },
    value: { type: Number, min: [0, "Value cannot be negative"], default: 0 },
    stage: { type: String, enum: STAGES, default: "Lead" },
    closeDate: { type: Date, default: () => new Date(Date.now() + 30 * 864e5) },
  },
  { timestamps: true }
);

// When a deal is moved to Won, record today as the close date so the
// "Won this month" and revenue figures on the dashboard include it.
dealSchema.pre("findOneAndUpdate", function () {
  const u = this.getUpdate() || {};
  const stage = u.stage ?? u.$set?.stage;
  const closeDate = u.closeDate ?? u.$set?.closeDate;
  if (stage === "Won" && !closeDate) this.set({ closeDate: new Date() });
});

export default mongoose.model("Deal", dealSchema);
