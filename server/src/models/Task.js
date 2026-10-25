import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    text: { type: String, required: [true, "Task text is required"], trim: true },
    due: { type: Date, default: () => new Date() },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
