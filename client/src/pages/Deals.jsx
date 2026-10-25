import { useState } from "react";
import Icon from "../icons.jsx";
import { Av, Empty } from "../ui.jsx";
import { PROB, STAGES, STAGE_VAR, dayDiff, fmtDate, money, moneyShort } from "../utils.js";

function CloseChip({ deal }) {
  if (deal.stage === "Won") return <span className="chip ok">Closed {fmtDate(deal.closeDate)}</span>;
  const n = dayDiff(deal.closeDate);
  if (n < 0) return <span className="chip bad">Overdue {fmtDate(deal.closeDate)}</span>;
  return <span className={"chip" + (n <= 7 ? " warn" : "")}>{n === 0 ? "Closes today" : `Closes ${fmtDate(deal.closeDate)}`}</span>;
}

export default function Deals({ deals, move, onEdit, onNew }) {
  const [drag, setDrag] = useState(null); // id of the card being dragged
  const [over, setOver] = useState(null); // stage name being hovered

  const open = deals.filter((d) => d.stage !== "Won");
  const openTotal = open.reduce((a, d) => a + d.value, 0);
  const weighted = open.reduce((a, d) => a + d.value * PROB[d.stage], 0);
  const wonTotal = deals.filter((d) => d.stage === "Won").reduce((a, d) => a + d.value, 0);

  if (!deals.length) return <div className="card"><Empty title="No deals yet" action={<button className="btn pri" onClick={onNew}>Add your first deal</button>}>Track each opportunity from first call to signed contract.</Empty></div>;

  return (
    <>
      <div className="summary">
        <div><span>Open</span><b>{money(openTotal)}</b></div>
        <div><span>Weighted forecast</span><b>{money(weighted)}</b></div>
        <div><span>Closed won</span><b className="gold">{money(wonTotal)}</b></div>
        <p>Drag a card to another column, or use the arrows. Click a card to edit it.</p>
      </div>

      <div className="board">
        {STAGES.map((s, i) => {
          const ds = deals.filter((d) => d.stage === s);
          return (
            <section
              key={s}
              className={"col" + (over === s ? " over" : "")}
              style={{ "--stage": STAGE_VAR[s] }}
              aria-label={`${s}, ${ds.length} deals`}
              onDragOver={(e) => { if (drag) { e.preventDefault(); setOver(s); } }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null); }}
              onDrop={(e) => {
                e.preventDefault();
                const d = deals.find((x) => x._id === drag);
                setOver(null); setDrag(null);
                if (d && d.stage !== s) move(d, s);
              }}
            >
              <h4><span>{s}</span><small>{ds.length}</small><em>{moneyShort(ds.reduce((a, d) => a + d.value, 0))}</em></h4>
              {ds.map((d) => (
                <article
                  className={"deal" + (drag === d._id ? " dragging" : "")}
                  key={d._id}
                  draggable
                  onDragStart={(e) => { setDrag(d._id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", d._id); }}
                  onDragEnd={() => { setDrag(null); setOver(null); }}
                >
                  <button className="deal-title" onClick={() => onEdit(d)}>{d.title}</button>
                  <div className="deal-who">{d.owner && <><Av name={d.owner} size={20} /><span>{d.owner}</span></>}</div>
                  <div className="deal-val">{money(d.value)}</div>
                  <div className="deal-foot">
                    <CloseChip deal={d} />
                    <div className="mv">
                      <button disabled={i === 0} onClick={() => move(d, STAGES[i - 1])} aria-label={`Move ${d.title} back to ${STAGES[i - 1]}`}><Icon name="left" size={14} /></button>
                      <button disabled={i === STAGES.length - 1} onClick={() => move(d, STAGES[i + 1])} aria-label={`Move ${d.title} forward to ${STAGES[i + 1]}`}><Icon name="right" size={14} /></button>
                    </div>
                  </div>
                </article>
              ))}
              {!ds.length && <p className="col-empty">{drag ? "Drop here" : "No deals"}</p>}
            </section>
          );
        })}
      </div>
    </>
  );
}
