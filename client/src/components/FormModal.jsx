import { useState } from "react";
import { Modal } from "../ui.jsx";
import { PRIORITIES, STAGES, STATUSES, dateFromInput, inputDate } from "../utils.js";

const inDays = (n) => inputDate(new Date(Date.now() + n * 864e5));

export const FORMS = {
  contacts: {
    noun: "contact",
    fields: [
      { k: "name", l: "Name", req: 1 }, { k: "company", l: "Company" }, { k: "title", l: "Job title" },
      { k: "email", l: "Email", t: "email" }, { k: "phone", l: "Phone", t: "tel" }, { k: "city", l: "City" },
      { k: "status", l: "Status", opts: STATUSES },
      { k: "value", l: "Lifetime value ($)", t: "number" },
      { k: "note", l: "Note", t: "textarea", wide: 1 },
    ],
  },
  deals: {
    noun: "deal",
    fields: [
      { k: "title", l: "Deal name", req: 1, wide: 1 }, { k: "owner", l: "Contact", list: 1 }, { k: "value", l: "Value ($)", t: "number" },
      { k: "stage", l: "Stage", opts: STAGES }, { k: "closeDate", l: "Expected close", t: "date", fresh: () => inDays(30) },
    ],
  },
  tasks: {
    noun: "task",
    fields: [
      { k: "text", l: "What needs doing?", req: 1, wide: 1 },
      { k: "due", l: "Due date", t: "date", fresh: () => inDays(0) },
      { k: "priority", l: "Priority", opts: PRIORITIES, fresh: () => "Medium" },
    ],
  },
};

export default function FormModal({ kind, initial, contacts = [], onSave, onDelete, onClose }) {
  const { noun, fields } = FORMS[kind];
  const editing = !!initial;

  const start = () =>
    Object.fromEntries(fields.map((f) => {
      const cur = initial?.[f.k];
      if (f.t === "date") return [f.k, cur ? inputDate(cur) : f.fresh?.() ?? ""];
      if (cur !== undefined && cur !== null) return [f.k, String(cur)];
      return [f.k, f.opts ? f.fresh?.() ?? f.opts[0] : ""];
    }));

  const [v, setV] = useState(start);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, val) => setV((x) => ({ ...x, [k]: val }));

  const submit = async (e) => {
    e.preventDefault();
    const body = {};
    fields.forEach((f) => {
      const raw = typeof v[f.k] === "string" ? v[f.k].trim() : v[f.k];
      if (raw === "" && !editing) return; // new records fall back to the server defaults
      if (f.t === "number") body[f.k] = raw === "" ? 0 : Number(raw);
      else if (f.t === "date") { if (raw) body[f.k] = dateFromInput(raw); }
      else body[f.k] = raw;
    });
    setBusy(true);
    try { await onSave(kind, body, initial?._id); }
    catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <Modal title={`${editing ? "Edit" : "New"} ${noun}`} onClose={onClose}>
      <form onSubmit={submit} className="form">
        {fields.map((f, i) => (
          <label className={"field" + (f.wide ? " wide" : "")} key={f.k}>
            <span>{f.l}{f.req ? <abbr title="required"> *</abbr> : null}</span>
            {f.opts ? (
              <select value={v[f.k]} onChange={(e) => set(f.k, e.target.value)}>{f.opts.map((o) => <option key={o}>{o}</option>)}</select>
            ) : f.t === "textarea" ? (
              <textarea rows="3" value={v[f.k]} onChange={(e) => set(f.k, e.target.value)} />
            ) : (
              <input
                type={f.t || "text"} required={!!f.req} min={f.t === "number" ? 0 : undefined} step={f.t === "number" ? "any" : undefined}
                list={f.list ? "contact-names" : undefined} value={v[f.k]} onChange={(e) => set(f.k, e.target.value)} autoFocus={i === 0}
              />
            )}
          </label>
        ))}
        {kind === "deals" && <datalist id="contact-names">{contacts.map((c) => <option key={c._id} value={c.name} />)}</datalist>}
        {err && <p className="err" role="alert">{err}</p>}
        <div className="actions">
          {editing && onDelete && <button type="button" className="btn danger left" onClick={() => onDelete(initial)}>Delete {noun}</button>}
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn pri" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : `Add ${noun}`}</button>
        </div>
      </form>
    </Modal>
  );
}
