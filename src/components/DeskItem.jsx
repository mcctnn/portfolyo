import { useEffect, useRef } from "react";
import { clamp } from "../lib/util";

let zTop = 40;
const isNarrow = () => matchMedia("(max-width: 760px)").matches;

/**
 * Masadaki tıklanabilir ve sürüklenebilir nesne.
 * Kısa dokunuş → onActivate, 6px'den fazla hareket → sürükleme.
 */
export default function DeskItem({
  id, className = "", inId, inClass = "", open, action, label, tag, extra,
  pos, onActivate, onDrag, resetSignal, elRef, children,
}) {
  const el = useRef(null);
  const st = useRef({ pid: null, sx: 0, sy: 0, ox: 0, oy: 0, dragging: false, just: false });

  const setEl = (node) => {
    el.current = node;
    if (elRef) elRef.current = node;
  };

  // "Masayı topla": nesneyi yerine geri götür
  useEffect(() => {
    if (!resetSignal) return;
    const n = el.current;
    n.classList.add("tidy");
    n.style.removeProperty("--dx");
    n.style.removeProperty("--dy");
    const t = setTimeout(() => n.classList.remove("tidy"), 700);
    return () => clearTimeout(t);
  }, [resetSignal]);

  const readVar = (name) => parseFloat(el.current.style.getPropertyValue(name)) || 0;

  const onPointerDown = (e) => {
    if (e.button !== 0 || isNarrow()) return;
    const s = st.current;
    s.pid = e.pointerId;
    s.sx = e.clientX; s.sy = e.clientY;
    s.ox = readVar("--dx"); s.oy = readVar("--dy");
    s.dragging = false;
    el.current.classList.remove("tidy");
    el.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const s = st.current, n = el.current;
    if (e.pointerId !== s.pid) return;
    const dx = e.clientX - s.sx, dy = e.clientY - s.sy;
    if (!s.dragging) {
      if (Math.hypot(dx, dy) < 6) return;
      s.dragging = true;
      n.classList.add("dragging");
      n.style.zIndex = ++zTop > 90 ? (zTop = 41) : zTop;
    }
    let nx = s.ox + dx, ny = s.oy + dy;

    // Nesnenin merkezi sahnenin dışına çıkmasın
    const r = n.getBoundingClientRect();
    const sr = n.closest(".scene").getBoundingClientRect();
    const cx = r.left + r.width / 2 + (nx - readVar("--dx"));
    const cy = r.top + r.height / 2 + (ny - readVar("--dy"));
    nx += clamp(cx, sr.left + 30, sr.right - 30) - cx;
    ny += clamp(cy, sr.top + 60, sr.bottom - 30) - cy;

    n.style.setProperty("--dx", `${nx}px`);
    n.style.setProperty("--dy", `${ny}px`);
    onDrag?.();
  };

  const endDrag = (e) => {
    const s = st.current;
    if (e.pointerId !== s.pid) return;
    s.pid = null;
    if (s.dragging) {
      el.current.classList.remove("dragging");
      s.just = true;
      setTimeout(() => { s.just = false; }, 0);
    }
  };

  return (
    <button
      ref={setEl}
      id={id}
      type="button"
      className={`item${extra ? " extra" : ""} ${className}`.trim()}
      data-open={open}
      data-action={action}
      aria-label={label}
      style={{ "--x": pos.x, "--y": pos.y, "--w": pos.w, "--r": pos.r, "--z": pos.z }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={() => { if (!st.current.just) onActivate(); }}
    >
      <span className={`item-in ${inClass}`.trim()} id={inId}>
        {children}
        <span className="tag">{tag}</span>
      </span>
    </button>
  );
}
