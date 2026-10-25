import { STAGE_INK, STAGE_VAR, STATUSES, money, moneyShort } from "./utils.js";

/** One bar split by stage value. The memorable part of the dashboard. */
export function PipelineStrip({ stages, onPick }) {
  const total = stages.reduce((a, s) => a + s.total, 0);
  if (!total) return <div className="strip-empty">No deals yet. Add one to see your pipeline take shape.</div>;
  return (
    <div>
      <div className="strip" role="list">
        {stages.map((s) => (
          <button
            key={s.stage}
            role="listitem"
            className="seg"
            style={{ flexGrow: Math.max(s.total, total * 0.04), background: STAGE_VAR[s.stage], color: STAGE_INK[s.stage] }}
            onClick={() => onPick(s.stage)}
            title={`${s.stage}: ${s.count} deal${s.count === 1 ? "" : "s"}, ${money(s.total)}`}
            aria-label={`${s.stage}: ${s.count} deals worth ${money(s.total)}`}
          >
            {s.total / total > 0.07 && <span>{moneyShort(s.total)}</span>}
          </button>
        ))}
      </div>
      <ul className="strip-key">
        {stages.map((s) => (
          <li key={s.stage}>
            <i style={{ background: STAGE_VAR[s.stage] }} />
            <b>{s.stage}</b>
            <em>{moneyShort(s.total)}</em>
            <span>{s.count} {s.count === 1 ? "deal" : "deals"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Revenue closed per month, drawn as plain SVG so there is no chart library to install. */
export function RevenueChart({ data }) {
  const W = 560, H = 220, padL = 40, padB = 28, padT = 16;
  const max = Math.max(...data.map((d) => d.total), 1000);
  const top = Math.ceil(max / 1000 / 4) * 4 * 1000 || 4000; // round the axis up to a tidy value
  const bw = (W - padL) / data.length;
  const y = (v) => padT + (H - padT - padB) * (1 - v / top);
  const ticks = [0, 0.5, 1].map((f) => f * top);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={"Revenue closed per month: " + data.map((d) => `${d.month} ${money(d.total)}`).join(", ")}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W} y1={y(t)} y2={y(t)} className="grid" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="axis">{t === 0 ? "0" : moneyShort(t).replace("$", "")}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = padL + i * bw + bw * 0.18, w = bw * 0.64, h = Math.max(H - padB - y(d.total), d.total ? 3 : 0);
        const last = i === data.length - 1;
        return (
          <g key={d.month + i}>
            <rect x={x} y={H - padB - h} width={w} height={h} rx="5" className={last ? "bar now" : "bar"}>
              <title>{`${d.month}: ${money(d.total)}`}</title>
            </rect>
            {d.total > 0 && <text x={x + w / 2} y={H - padB - h - 6} textAnchor="middle" className="val">{moneyShort(d.total).replace("$", "")}</text>}
            <text x={x + w / 2} y={H - 8} textAnchor="middle" className="axis">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Contacts split by relationship status. */
export function StatusMix({ counts }) {
  const total = STATUSES.reduce((a, s) => a + (counts[s] || 0), 0);
  if (!total) return <p className="muted">No contacts yet.</p>;
  return (
    <div>
      <div className="mix" role="img" aria-label={STATUSES.map((s) => `${counts[s] || 0} ${s}`).join(", ")}>
        {STATUSES.filter((s) => counts[s]).map((s) => (
          <span key={s} className={"mix-" + s} style={{ flexGrow: counts[s] }} title={`${s}: ${counts[s]}`} />
        ))}
      </div>
      <ul className="mix-key">
        {STATUSES.map((s) => (
          <li key={s}><i className={"mix-" + s} /><span>{s}</span><b>{counts[s] || 0}</b></li>
        ))}
      </ul>
    </div>
  );
}
