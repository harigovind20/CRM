import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    company: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Lead", "Prospect", "Customer", "Churned"], default: "Lead" },
    value: { type: Number, min: 0, default: 0 },
    note: { type: String, default: "" },
    lastContact: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
