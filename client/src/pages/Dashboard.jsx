import { PipelineStrip, RevenueChart, StatusMix } from "../charts.jsx";
import { Av, Empty } from "../ui.jsx";
import { ago, dayDiff, dueLabel, money } from "../utils.js";

function Stat({ label, value, note, tone }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <b className={tone}>{value}</b>
      <small>{note}</small>
    </div>
  );
}

export default function Dashboard({ stats, tasks, contacts, toggleTask, onStage, go }) {
  if (!stats) return <Empty title="Loading dashboard…" />;

  const open = stats.stages.filter((s) => s.stage !== "Won");
  const won = stats.stages.find((s) => s.stage === "Won") || { total: 0, count: 0 };
  const openCount = open.reduce((a, s) => a + s.count, 0);
  const change = stats.wonPrevMonth
    ? Math.round(((stats.wonThisMonth - stats.wonPrevMonth) / stats.wonPrevMonth) * 100)
    : null;
  const due = tasks
    .filter((t) => !t.done && dayDiff(t.due) <= 0)
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 5);
  // People still in play who have not heard from us for two weeks, longest wait first
  const stale = contacts
    .filter((c) => c.status !== "Churned" && dayDiff(c.lastContact) <= -14)
    .sort((a, b) => new Date(a.lastContact) - new Date(b.lastContact))
    .slice(0, 3);

  return (
    <div className="dash">
      <section className="card hero" aria-labelledby="pipe-h">
        <div className="hero-top">
          <div>
            <h2 id="pipe-h">Open pipeline</h2>
            <p className="big">{money(stats.openPipeline)}<span> across {openCount} {openCount === 1 ? "deal" : "deals"}</span></p>
          </div>
          <p className="hero-side">
            <b>{money(stats.weighted)}</b> weighted forecast<br />
            <b>{money(won.total)}</b> closed won, {won.count} {won.count === 1 ? "deal" : "deals"}
          </p>
        </div>
        <PipelineStrip stages={stats.stages} onPick={onStage} />
      </section>

      <section className="card stats" aria-label="Key numbers">
        <Stat label="Won this month" value={money(stats.wonThisMonth)}
          note={change === null ? "No wins last month" : `${change >= 0 ? "Up" : "Down"} ${Math.abs(change)}% on last month`}
          tone={change === null ? "" : change >= 0 ? "good" : "bad"} />
        <Stat label="Win rate" value={`${stats.winRate}%`} note={`${won.count} of ${stats.totalDeals} deals won`} />
        <Stat label="Average open deal" value={money(stats.avgDeal)} note={`${openCount} in play`} />
        <Stat label="Overdue tasks" value={stats.tasksOverdue} note={`${stats.tasksToday} due today or earlier`} tone={stats.tasksOverdue ? "bad" : ""} />
      </section>

      <div className="split">
        <section className="card" aria-labelledby="rev-h">
          <h3 id="rev-h">Revenue closed, last 6 months ($k)</h3>
          <RevenueChart data={stats.revenue} />
        </section>

        <section className="card" aria-labelledby="due-h">
          <div className="card-head">
            <h3 id="due-h">Due today and overdue</h3>
            <button className="link" onClick={() => go("Tasks")}>All tasks</button>
          </div>
          {due.length ? (
            <ul className="mini-tasks">
              {due.map((t) => (
                <li key={t._id}>
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} aria-label={`Mark done: ${t.text}`} />
                  <span>{t.text}</span>
                  <em className={dayDiff(t.due) < 0 ? "late" : ""}>{dueLabel(t.due)}</em>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">You are clear for today. Upcoming tasks are on the Tasks page.</p>
          )}
        </section>
      </div>

      <div className="split even">
        <section className="card" aria-labelledby="act-h">
          <h3 id="act-h">Recent deal activity</h3>
          {stats.activity.length ? stats.activity.map((a) => (
            <div className="act" key={a.id}>
              <Av name={a.name} size={30} />
              <div>
                <p><b>{a.name}</b> · {a.text}</p>
                <small>{ago(a.at)}</small>
              </div>
            </div>
          )) : <p className="muted">Deal updates will show up here.</p>}
        </section>

        <section className="card" aria-labelledby="mix-h">
          <div className="card-head">
            <h3 id="mix-h">Contacts by status</h3>
            <button className="link" onClick={() => go("Contacts")}>All contacts</button>
          </div>
          <StatusMix counts={stats.contactsByStatus} />
          <div className="follow">
            <h4>Needs a follow-up</h4>
            {stale.length ? (
              <ul>
                {stale.map((c) => (
                  <li key={c._id}>
                    <Av name={c.name} size={30} />
                    <div><b>{c.name}</b><small>{c.company}</small></div>
                    <em>{ago(c.lastContact)}</em>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">Everyone still in play was contacted in the last two weeks.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
