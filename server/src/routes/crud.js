import { Router } from "express";

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

/**
 * Generic REST router for a Mongoose model.
 *   GET    /        ?q=text &status=Lead &stage=Won &done=true
 *   GET    /:id
 *   POST   /
 *   PATCH  /:id
 *   DELETE /:id
 */
export default function crud(Model, { search = [], sort = "-createdAt" } = {}) {
  const r = Router();

  r.get("/", wrap(async (req, res) => {
    const { q, ...rest } = req.query;
    const filter = {};
    for (const k of ["status", "stage", "done"]) if (rest[k] && rest[k] !== "All") filter[k] = rest[k];
    if (q && search.length)
      filter.$or = search.map((f) => ({ [f]: new RegExp(escapeRx(String(q)), "i") }));
    res.json(await Model.find(filter).sort(sort));
  }));

  r.get("/:id", wrap(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    doc ? res.json(doc) : res.status(404).json({ error: "Not found" });
  }));

  r.post("/", wrap(async (req, res) => res.status(201).json(await Model.create(req.body))));

  r.patch("/:id", wrap(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    doc ? res.json(doc) : res.status(404).json({ error: "Not found" });
  }));

  r.delete("/:id", wrap(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    doc ? res.status(204).end() : res.status(404).json({ error: "Not found" });
  }));

  return r;
}
