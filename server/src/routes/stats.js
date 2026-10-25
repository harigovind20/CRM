import { Router } from "express";
import Contact from "../models/Contact.js";
import Deal, { STAGES } from "../models/Deal.js";
import Task from "../models/Task.js";

const r = Router();

// Chance that a deal in each stage is won, used for the weighted forecast.
const PROB = { Lead: 0.1, Qualified: 0.25, Proposal: 0.5, Negotiation: 0.75, Won: 1 };

r.get("/", async (_req, res, next) => {
  try {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sum = { $group: { _id: null, total: { $sum: "$value" } } };

    const [byStage, wonThisMonth, wonPrevMonth, monthly, tasksOpen, tasksToday, tasksOverdue, byStatus, recent] = await Promise.all([
      Deal.aggregate([{ $group: { _id: "$stage", count: { $sum: 1 }, total: { $sum: "$value" } } }]),
      Deal.aggregate([{ $match: { stage: "Won", closeDate: { $gte: monthStart } } }, sum]),
      Deal.aggregate([{ $match: { stage: "Won", closeDate: { $gte: prevMonthStart, $lt: monthStart } } }, sum]),
      Deal.aggregate([
        { $match: { stage: "Won", closeDate: { $gte: since } } },
        { $group: { _id: { y: { $year: "$closeDate" }, m: { $month: "$closeDate" } }, total: { $sum: "$value" } } },
      ]),
      Task.countDocuments({ done: false }),
      Task.countDocuments({ done: false, due: { $lte: endOfToday } }),
      Task.countDocuments({ done: false, due: { $lt: startOfToday } }),
      Contact.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Deal.find().sort("-updatedAt").limit(5),
    ]);

    // One entry per stage, in pipeline order, even when a stage has no deals
    const stages = STAGES.map((stage) => {
      const hit = byStage.find((x) => x._id === stage);
      return { stage, count: hit?.count || 0, total: hit?.total || 0 };
    });
    const open = stages.filter((s) => s.stage !== "Won");
    const won = stages.find((s) => s.stage === "Won");
    const openCount = open.reduce((a, s) => a + s.count, 0);
    const openPipeline = open.reduce((a, s) => a + s.total, 0);
    const totalDeals = stages.reduce((a, s) => a + s.count, 0);

    // Always return 6 month buckets, zero-filled
    const revenue = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
      const hit = monthly.find((x) => x._id.y === d.getFullYear() && x._id.m === d.getMonth() + 1);
      return { month: d.toLocaleString("en-US", { month: "short" }), total: hit ? hit.total : 0 };
    });

    res.json({
      stages,
      openPipeline,
      weighted: Math.round(open.reduce((a, s) => a + s.total * PROB[s.stage], 0)),
      avgDeal: openCount ? Math.round(openPipeline / openCount) : 0,
      totalDeals,
      wonThisMonth: wonThisMonth[0]?.total || 0,
      wonPrevMonth: wonPrevMonth[0]?.total || 0,
      winRate: totalDeals ? Math.round((won.count / totalDeals) * 100) : 0,
      tasksOpen,
      tasksToday,
      tasksOverdue,
      contactsByStatus: Object.fromEntries(byStatus.map((x) => [x._id, x.count])),
      revenue,
      activity: recent.map((d) => ({ id: d._id, name: d.owner || "Someone", text: `${d.title} is in ${d.stage}`, at: d.updatedAt })),
    });
  } catch (e) {
    next(e);
  }
});

export default r;
