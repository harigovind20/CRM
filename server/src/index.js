import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crud from "./routes/crud.js";
import stats from "./routes/stats.js";
import Contact from "./models/Contact.js";
import Deal from "./models/Deal.js";
import Task from "./models/Task.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/contacts", crud(Contact, { search: ["name", "company", "email"], sort: "name" }));
app.use("/api/deals", crud(Deal, { search: ["title", "owner"], sort: "closeDate" }));
app.use("/api/tasks", crud(Task, { search: ["text"], sort: "done due" }));
app.use("/api/stats", stats);

app.use("/api", (_req, res) => res.status(404).json({ error: "Route not found" }));

// Central error handler: turns Mongoose errors into clean 4xx responses
app.use((err, _req, res, _next) => {
  if (err.name === "ValidationError")
    return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(", ") });
  if (err.name === "CastError") return res.status(400).json({ error: `Invalid ${err.path}` });
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((e) => { console.error("MongoDB connection failed:", e.message); process.exit(1); });
