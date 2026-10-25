export const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Won"];
export const STATUSES = ["Lead", "Prospect", "Customer", "Churned"];
export const PRIORITIES = ["High", "Medium", "Low"];

// Chance a deal in each stage is won. Used for the weighted forecast.
export const PROB = { Lead: 0.1, Qualified: 0.25, Proposal: 0.5, Negotiation: 0.75, Won: 1 };
export const STAGE_VAR = { Lead: "var(--s1)", Qualified: "var(--s2)", Proposal: "var(--s3)", Negotiation: "var(--s4)", Won: "var(--s5)" };
// Text colour that stays readable on each stage colour, in both themes.
export const STAGE_INK = { Lead: "var(--s1i)", Qualified: "var(--s2i)", Proposal: "var(--s3i)", Negotiation: "var(--s4i)", Won: "var(--s5i)" };

export const money = (n) => "$" + Math.round(n || 0).toLocaleString("en-US");
export const moneyShort = (n) => {
  n = n || 0;
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) {
    const k = n / 1e3;
    return "$" + (k < 100 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)) + "k";
  }
  return "$" + Math.round(n);
};

const startOfDay = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));
/** Whole days from today to d. Negative means the date is in the past. */
export const dayDiff = (d) => Math.round((startOfDay(d) - startOfDay(new Date())) / 864e5);

export const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const ago = (d) => {
  const n = -dayDiff(d);
  return n <= 0 ? "Today" : n === 1 ? "Yesterday" : n < 14 ? `${n} days ago` : n < 60 ? `${Math.round(n / 7)} weeks ago` : `${Math.round(n / 30)} months ago`;
};
export const dueLabel = (d, done = false) => {
  const n = dayDiff(d);
  if (!done && n < -1 && n > -60) return `${-n} days late`;
  return n === 0 ? "Today" : n === 1 ? "Tomorrow" : n === -1 ? "Yesterday" : fmtDate(d);
};

// Dates are shown and edited in the user's own time zone. Saving at local noon
// keeps the calendar day the same wherever the server or the browser is.
export const inputDate = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
export const dateFromInput = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12).toISOString();
};

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export const hue = (name = "") => {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
};

export const initials = (name = "") =>
  name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

export function downloadCsv(filename, rows, columns) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [columns.map((c) => esc(c.label)).join(",")];
  rows.forEach((r) => lines.push(columns.map((c) => esc(c.get(r))).join(",")));
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
