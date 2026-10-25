import Icon from "../icons.jsx";
import { Av, Tag, useDialog } from "../ui.jsx";
import { ago, fmtDate, money } from "../utils.js";

export default function Drawer({ c, deals, onClose, onEdit, onDelete, onContacted, onOpenDeal }) {
  const ref = useDialog(onClose);
  const related = deals.filter((d) => d.owner && d.owner.toLowerCase() === c.name.toLowerCase());

  return (
    <>
      <div className="shade" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`${c.name}, contact details`} ref={ref}>
        <div className="drawer-top">
          <Av name={c.name} size={52} />
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <h2>{c.name}</h2>
        <p className="muted">{[c.title, c.company].filter(Boolean).join(" at ") || "No role listed"}</p>
        <div className="drawer-tags"><Tag s={c.status} /></div>

        <div className="quick">
          {c.email ? <a className="btn" href={"mailto:" + c.email}><Icon name="mail" size={16} />Email</a> : <button className="btn" disabled><Icon name="mail" size={16} />Email</button>}
          {c.phone ? <a className="btn" href={"tel:" + c.phone}><Icon name="phone" size={16} />Call</a> : <button className="btn" disabled><Icon name="phone" size={16} />Call</button>}
          <button className="btn" onClick={() => onContacted(c)}><Icon name="check" size={16} />Log contact today</button>
        </div>

        <dl>
          <dt>Email</dt><dd>{c.email || "–"}</dd>
          <dt>Phone</dt><dd>{c.phone || "–"}</dd>
          <dt>Location</dt><dd>{c.city || "–"}</dd>
          <dt>Lifetime value</dt><dd>{c.value ? money(c.value) : "No revenue yet"}</dd>
          <dt>Last contact</dt><dd>{ago(c.lastContact)}</dd>
        </dl>

        <h3>Deals</h3>
        {related.length ? (
          <ul className="rel">
            {related.map((d) => (
              <li key={d._id}>
                <button onClick={() => onOpenDeal(d)}>
                  <span>{d.title}<small>{money(d.value)} · {fmtDate(d.closeDate)}</small></span>
                  <Tag s={d.stage} />
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="muted">No deals linked to {c.name.split(" ")[0]}. A deal is linked when its contact matches this name.</p>}

        <h3>Latest note</h3>
        <div className="note">{c.note || "No notes yet."}</div>

        <div className="actions spread">
          <button className="btn danger" onClick={() => onDelete(c)}><Icon name="trash" size={16} />Delete</button>
          <button className="btn pri" onClick={() => onEdit(c)}><Icon name="edit" size={16} />Edit contact</button>
        </div>
      </aside>
    </>
  );
}
