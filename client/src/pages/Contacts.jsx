import { useEffect, useState } from "react";
import { api } from "../api.js";
import Icon from "../icons.jsx";
import { Av, Empty, Tag } from "../ui.jsx";
import { STATUSES, ago, dayDiff, downloadCsv, money } from "../utils.js";

const CSV_COLUMNS = [
  { label: "Name", get: (c) => c.name }, { label: "Company", get: (c) => c.company }, { label: "Title", get: (c) => c.title },
  { label: "Email", get: (c) => c.email }, { label: "Phone", get: (c) => c.phone }, { label: "City", get: (c) => c.city },
  { label: "Status", get: (c) => c.status }, { label: "Lifetime value", get: (c) => c.value },
  { label: "Last contact", get: (c) => (c.lastContact ? new Date(c.lastContact).toISOString().slice(0, 10) : "") }, { label: "Note", get: (c) => c.note },
];

// A contact who is still in play and has not been spoken to for two weeks needs a nudge.
const needsFollowUp = (c) => c.status !== "Churned" && dayDiff(c.lastContact) <= -14;

export default function Contacts({ reloadKey, counts, onOpen, onError, onNew }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const [sort, setSort] = useState(["name", 1]);
  const [rows, setRows] = useState(null);

  // Search and status filter are handled by the API; the page waits a moment after typing stops.
  useEffect(() => {
    const t = setTimeout(() => {
      api.list("contacts", { q, status: f }).then(setRows).catch((e) => onError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [q, f, reloadKey]);

  const sorted = rows && [...rows].sort((a, b) => {
    const [k, dir] = sort;
    const x = a[k] ?? "", y = b[k] ?? "";
    const r = typeof x === "number" ? x - y : String(x).localeCompare(String(y), undefined, { sensitivity: "base" });
    return r * dir;
  });

  const th = (k, l, right) => (
    <th aria-sort={sort[0] === k ? (sort[1] > 0 ? "ascending" : "descending") : "none"} className={right ? "num" : ""}>
      <button onClick={() => setSort([k, sort[0] === k ? -sort[1] : 1])}>
        {l}{sort[0] === k && <Icon name={sort[1] > 0 ? "up" : "down"} size={12} />}
      </button>
    </th>
  );
  const total = STATUSES.reduce((a, s) => a + (counts[s] || 0), 0);

  return (
    <>
      <div className="tools">
        <label className="search">
          <Icon name="search" size={16} />
          <input placeholder="Search name, company or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search contacts" />
        </label>
        <div className="pills" role="group" aria-label="Filter by status">
          {["All", ...STATUSES].map((s) => (
            <button key={s} className={"pill" + (f === s ? " on" : "")} aria-pressed={f === s} onClick={() => setF(s)}>
              {s}<small>{s === "All" ? total : counts[s] || 0}</small>
            </button>
          ))}
        </div>
        <button className="btn" disabled={!sorted?.length} onClick={() => downloadCsv("contacts.csv", sorted, CSV_COLUMNS)}>
          <Icon name="download" size={16} />Export CSV
        </button>
      </div>

      <div className="card tbl">
        <table>
          <thead>
            <tr>{th("name", "Contact")}{th("company", "Company")}{th("status", "Status")}{th("value", "Lifetime value", true)}{th("city", "Location")}{th("lastContact", "Last contact")}</tr>
          </thead>
          <tbody>
            {sorted?.map((c) => (
              <tr key={c._id} tabIndex={0} onClick={() => onOpen(c)} onKeyDown={(e) => e.key === "Enter" && onOpen(c)}>
                <td><div className="who"><Av name={c.name} size={34} /><div><b>{c.name}</b><small>{c.title}</small></div></div></td>
                <td>{c.company}</td>
                <td><Tag s={c.status} /></td>
                <td className="num">{c.value ? money(c.value) : "–"}</td>
                <td>{c.city}</td>
                <td className={needsFollowUp(c) ? "stale" : "muted"}>
                  {ago(c.lastContact)}{needsFollowUp(c) && <small>Follow up</small>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows && <Empty title="Loading contacts…" />}
        {rows && !rows.length && (
          q || f !== "All"
            ? <Empty title="No contacts match">Clear the search or choose another status.</Empty>
            : <Empty title="No contacts yet" action={<button className="btn pri" onClick={onNew}>Add your first contact</button>}>Everyone you talk to will be listed here.</Empty>
        )}
      </div>
    </>
  );
}
