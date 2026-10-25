import { useEffect, useRef } from "react";
import Icon from "./icons.jsx";
import { hue, initials } from "./utils.js";

export const Av = ({ name = "", size = 32 }) => (
  <span className="av" style={{ "--h": hue(name), width: size, height: size, fontSize: Math.max(10, size * 0.36) }} aria-hidden="true">
    {initials(name)}
  </span>
);

export const Tag = ({ s }) => <span className={"tag t-" + s}>{s}</span>;

export const Empty = ({ title, children, action }) => (
  <div className="empty">
    <b>{title}</b>
    {children && <p>{children}</p>}
    {action}
  </div>
);

/** Closes on Escape, locks background scroll, and returns focus to whatever opened it. */
const openDialogs = []; // so that only the top-most dialog reacts to the keyboard

export function useDialog(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const opener = document.activeElement;
    const me = {};
    openDialogs.push(me);
    const onKey = (e) => {
      if (openDialogs[openDialogs.length - 1] !== me) return;
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll('button:not([disabled]),input:not([disabled]),select,textarea,a[href],[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.querySelector("[autofocus],input,select,button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      openDialogs.splice(openDialogs.indexOf(me), 1);
      if (!openDialogs.length) document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, []);
  return ref;
}

export function Modal({ title, onClose, children, label }) {
  const ref = useDialog(onClose);
  return (
    <>
      <div className="shade" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={label || title} ref={ref}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </>
  );
}

export function Toast({ toast, onUndo }) {
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <span>{toast.msg}</span>
      {toast.undo && <button onClick={onUndo}>Undo</button>}
    </div>
  );
}
