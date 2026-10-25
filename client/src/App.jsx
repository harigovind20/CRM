import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import { api } from "./api.js";
import Icon from "./icons.jsx";
import { Av, Toast } from "./ui.jsx";
import { greeting } from "./utils.js";
import Dashboard from "./pages/Dashboard.jsx";
import Contacts from "./pages/Contacts.jsx";
import Deals from "./pages/Deals.jsx";
import Tasks from "./pages/Tasks.jsx";
import Drawer from "./components/Drawer.jsx";
import FormModal, { FORMS } from "./components/FormModal.jsx";
import CommandPalette from "./components/CommandPalette.jsx";

const PAGES = [
  ["Dashboard", "dashboard"],
  ["Contacts", "contacts"],
  ["Deals", "deals"],
  ["Tasks", "tasks"],
];
const KIND = { Dashboard: "deals", Contacts: "contacts", Deals: "deals", Tasks: "tasks" };
const SUB = {
  Contacts: "Everyone you are talking to. Select a row for details.",
  Deals: "Move deals through the pipeline as they progress.",
  Tasks: "Your follow-ups, earliest first.",
};
const USER = "Harigovind";

// Fields the database adds itself. They are dropped when a deleted record is restored.
const strip = ({ _id, createdAt, updatedAt, __v, ...rest }) => rest;

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [cKey, setCKey] = useState(0);
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null); // { kind, initial? }
  const [palette, setPalette] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  const timer = useRef();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("crm-theme", theme); } catch { /* private mode: the choice just will not persist */ }
  }, [theme]);

  const say = (msg, undo) => {
    clearTimeout(timer.current);
    setToast({ msg, undo });
    timer.current = setTimeout(() => setToast(null), undo ? 6000 : 2400);
  };

  const refreshStats = () => api.stats().then(setStats).catch((e) => setError(e.message));
  const refreshContacts = () => api.list("contacts").then(setContacts).catch((e) => setError(e.message));
  const bumpContacts = () => { setCKey((k) => k + 1); refreshContacts(); };

  const load = useCallback(async () => {
    try {
      setError("");
      const [d, t, s, c] = await Promise.all([api.list("deals"), api.list("tasks"), api.stats(), api.list("contacts")]);
      setDeals(d); setTasks(t); setStats(s); setContacts(c);
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // Ctrl/Cmd+K opens the command palette from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const setters = { deals: setDeals, tasks: setTasks };
  const run = async (fn, msg) => {
    try { await fn(); if (msg) say(msg); refreshStats(); } catch (e) { say(e.message); }
  };

  /* ---- create and edit ---- */
  const save = async (kind, body, id) => {
    const doc = id ? await api.update(kind, id, body) : await api.create(kind, body);
    if (kind === "contacts") {
      bumpContacts();
      if (sel && sel._id === doc._id) setSel(doc);
    } else {
      setters[kind]((x) => (id ? x.map((y) => (y._id === id ? doc : y)) : [...x, doc]));
    }
    setModal(null);
    say(`${FORMS[kind].noun[0].toUpperCase() + FORMS[kind].noun.slice(1)} ${id ? "updated" : "added"}`);
    refreshStats();
  };

  /* ---- delete, with a short window to undo ---- */
  const remove = (kind, doc) => run(async () => {
    await api.remove(kind, doc._id);
    if (kind === "contacts") { setSel(null); bumpContacts(); } else setters[kind]((x) => x.filter((y) => y._id !== doc._id));
    setModal(null);
    const noun = FORMS[kind].noun;
    say(`${noun[0].toUpperCase() + noun.slice(1)} deleted`, async () => {
      try {
        const back = await api.create(kind, strip(doc));
        if (kind === "contacts") bumpContacts(); else setters[kind]((x) => [...x, back]);
        say(`${noun[0].toUpperCase() + noun.slice(1)} restored`);
        refreshStats();
      } catch (e) { say(e.message); }
    });
  });

  /* ---- deals, tasks, contacts ---- */
  const moveDeal = async (d, stage) => {
    const before = deals;
    setDeals((x) => x.map((y) => (y._id === d._id ? { ...y, stage } : y))); // show the move straight away
    try {
      const doc = await api.update("deals", d._id, { stage });
      setDeals((x) => x.map((y) => (y._id === d._id ? doc : y)));
      say(`Moved to ${stage}`);
      refreshStats();
    } catch (e) { setDeals(before); say(e.message); }
  };
  const toggleTask = (t) => run(async () => {
    const doc = await api.update("tasks", t._id, { done: !t.done });
    setTasks((x) => x.map((y) => (y._id === t._id ? doc : y)));
  });
  const logContact = (c) => run(async () => {
    const doc = await api.update("contacts", c._id, { lastContact: new Date().toISOString() });
    setSel(doc); bumpContacts();
  }, "Contact logged for today");

  /* ---- command palette ---- */
  const items = useMemo(() => [
    ...PAGES.map(([n, icon]) => ({ id: "p" + n, label: `Go to ${n}`, group: "Page", icon, run: () => setPage(n) })),
    { id: "a1", label: "New contact", group: "Action", icon: "plus", run: () => setModal({ kind: "contacts" }) },
    { id: "a2", label: "New deal", group: "Action", icon: "plus", run: () => setModal({ kind: "deals" }) },
    { id: "a3", label: "New task", group: "Action", icon: "plus", run: () => setModal({ kind: "tasks" }) },
    { id: "a4", label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme", group: "Action", icon: theme === "dark" ? "sun" : "moon", run: () => setTheme((t) => (t === "dark" ? "light" : "dark")) },
    ...contacts.map((c) => ({ id: "c" + c._id, label: c.name, hint: c.company, group: "Contact", icon: "contacts", run: () => { setPage("Contacts"); setSel(c); } })),
    ...deals.map((d) => ({ id: "d" + d._id, label: d.title, hint: d.stage, group: "Deal", icon: "deals", run: () => { setPage("Deals"); setModal({ kind: "deals", initial: d }); } })),
    ...tasks.filter((t) => !t.done).map((t) => ({ id: "t" + t._id, label: t.text, group: "Task", icon: "tasks", run: () => { setPage("Tasks"); setModal({ kind: "tasks", initial: t }); } })),
  ], [contacts, deals, tasks, theme]);

  const counts = { Contacts: contacts.length, Deals: deals.filter((d) => d.stage !== "Won").length, Tasks: tasks.filter((t) => !t.done).length };
  const statusCounts = contacts.reduce((a, c) => ({ ...a, [c.status]: (a[c.status] || 0) + 1 }), {});
  const kind = KIND[page];
  const sub = page === "Dashboard" ? `${greeting()}, ${USER}. Here is where sales stand today.` : SUB[page];
  const goDeals = () => setPage("Deals");

  return (
    <div className="app">
      <nav className="side" aria-label="Main">
        <div className="logo"><i aria-hidden="true">C</i><span>CRM</span></div>
        {PAGES.map(([n, icon]) => (
          <button key={n} className={"nav" + (page === n ? " on" : "")} aria-current={page === n ? "page" : undefined} onClick={() => setPage(n)}>
            <Icon name={icon} /><span>{n}</span>{counts[n] != null && <small>{counts[n]}</small>}
          </button>
        ))}
        <div className="me"><Av name={USER} size={32} /><div><b>{USER}</b><span>Sales lead</span></div></div>
      </nav>

      <main>
        <header className="top">
          <div>
            <h1>{page}</h1>
            <p className="sub">{sub}</p>
          </div>
          <div className="top-actions">
            <button className="btn search-btn" onClick={() => setPalette(true)} aria-label="Search and commands">
              <Icon name="search" size={16} /><span>Search</span><kbd>Ctrl K</kbd>
            </button>
            <button className="icon-btn boxed" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <button className="btn pri" onClick={() => setModal({ kind })}><Icon name="plus" size={16} />New {FORMS[kind].noun}</button>
          </div>
        </header>

        {error && <div className="banner" role="alert">{error}<button className="btn" onClick={load}>Retry</button></div>}

        {page === "Dashboard" && <Dashboard stats={stats} tasks={tasks} contacts={contacts} toggleTask={toggleTask} onStage={goDeals} go={setPage} />}
        {page === "Contacts" && <Contacts reloadKey={cKey} counts={statusCounts} onOpen={setSel} onError={setError} onNew={() => setModal({ kind: "contacts" })} />}
        {page === "Deals" && <Deals deals={deals} move={moveDeal} onEdit={(d) => setModal({ kind: "deals", initial: d })} onNew={() => setModal({ kind: "deals" })} />}
        {page === "Tasks" && <Tasks tasks={tasks} toggle={toggleTask} remove={(t) => remove("tasks", t)} onEdit={(t) => setModal({ kind: "tasks", initial: t })} onNew={() => setModal({ kind: "tasks" })} />}
      </main>

      {sel && (
        <Drawer
          c={sel} deals={deals} onClose={() => setSel(null)} onEdit={(c) => setModal({ kind: "contacts", initial: c })}
          onDelete={(c) => remove("contacts", c)} onContacted={logContact}
          onOpenDeal={(d) => setModal({ kind: "deals", initial: d })}
        />
      )}
      {modal && (
        <FormModal
          key={modal.kind + (modal.initial?._id || "new")} kind={modal.kind} initial={modal.initial} contacts={contacts}
          onSave={save} onDelete={(doc) => remove(modal.kind, doc)} onClose={() => setModal(null)}
        />
      )}
      {palette && <CommandPalette items={items} onClose={() => setPalette(false)} />}
      <Toast toast={toast} onUndo={() => { const undo = toast.undo; setToast(null); undo(); }} />
    </div>
  );
}
