import { useMemo, useState } from "react";
import Icon from "../icons.jsx";
import { useDialog } from "../ui.jsx";

/** Ctrl/Cmd+K: jump to a page, create something, or find a record. */
export default function CommandPalette({ items, onClose }) {
  const ref = useDialog(onClose);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hit = items.filter((x) => !needle || (x.label + " " + (x.hint || "")).toLowerCase().includes(needle));
    return hit.slice(0, 10);
  }, [q, items]);

  const run = (x) => { onClose(); x.run(); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setI((n) => Math.min(n + 1, shown.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setI((n) => Math.max(n - 1, 0)); }
    if (e.key === "Enter" && shown[i]) { e.preventDefault(); run(shown[i]); }
  };

  return (
    <>
      <div className="shade" onClick={onClose} />
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search and commands" ref={ref}>
        <label className="palette-input">
          <Icon name="search" size={18} />
          <input
            autoFocus placeholder="Search contacts, deals and tasks, or type a command" value={q}
            onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={onKey}
            role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={shown[i] ? "pal-" + i : undefined}
          />
        </label>
        <ul id="palette-list" role="listbox">
          {shown.map((x, n) => (
            <li key={x.id} id={"pal-" + n} role="option" aria-selected={n === i} className={n === i ? "on" : ""} onMouseMove={() => setI(n)} onClick={() => run(x)}>
              <Icon name={x.icon} size={16} />
              <span>{x.label}</span>
              {x.hint && <small>{x.hint}</small>}
              <em>{x.group}</em>
            </li>
          ))}
          {!shown.length && <li className="none">Nothing matches “{q}”.</li>}
        </ul>
      </div>
    </>
  );
}
