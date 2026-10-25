import { useState } from "react";
import Icon from "../icons.jsx";
import { Empty } from "../ui.jsx";
import { dayDiff, dueLabel } from "../utils.js";

const RANK = { High: 0, Medium: 1, Low: 2 };

const VIEWS = [
  ["Open", (t) => !t.done],
  ["Today", (t) => !t.done && dayDiff(t.due) <= 0],
  ["Overdue", (t) => !t.done && dayDiff(t.due) < 0],
  ["Done", (t) => t.done],
];

export default function Tasks({ tasks, toggle, remove, onEdit, onNew }) {
  const [view, setView] = useState("Open");
  const pick = VIEWS.find((v) => v[0] === view)[1];
  const list = tasks
    .filter(pick)
    .sort((a, b) => new Date(a.due) - new Date(b.due) || RANK[a.priority || "Medium"] - RANK[b.priority || "Medium"]);

  return (
    <>
      <div className="tools">
        <div className="pills" role="group" aria-label="Task view">
          {VIEWS.map(([name, fn]) => (
            <button key={name} className={"pill" + (view === name ? " on" : "")} aria-pressed={view === name} onClick={() => setView(name)}>
              {name}<small className={name === "Overdue" && tasks.some(fn) ? "alert" : ""}>{tasks.filter(fn).length}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="card tasks">
        {list.map((t) => {
          const n = dayDiff(t.due);
          const p = t.priority || "Medium";
          return (
            <div className={"task" + (t.done ? " done" : "")} key={t._id}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t)} aria-label={`Mark done: ${t.text}`} />
              <button className="task-text" onClick={() => onEdit(t)}>{t.text}</button>
              <span className={"prio p-" + p}>{p}</span>
              <em className={!t.done && n < 0 ? "late" : n === 0 && !t.done ? "today" : ""}>{dueLabel(t.due, t.done)}</em>
              <button className="icon-btn" onClick={() => remove(t)} aria-label={`Delete task: ${t.text}`}><Icon name="trash" size={16} /></button>
            </div>
          );
        })}
        {!list.length && (
          tasks.length
            ? <Empty title={view === "Done" ? "Nothing completed yet" : view === "Open" ? "All caught up" : `No ${view.toLowerCase()} tasks`}>{view === "Done" ? "Finished tasks will appear here." : "Nothing here needs your attention."}</Empty>
            : <Empty title="No tasks yet" action={<button className="btn pri" onClick={onNew}>Add your first task</button>}>Write down the next follow-up so it does not slip.</Empty>
        )}
      </div>
    </>
  );
}
