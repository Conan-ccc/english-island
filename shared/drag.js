// Drag and drop with Pointer Events (first finger only)
import { playSfx } from './fx.js';

export const HIT_PAD = 24;
let activePointer = null; // one drag at a time across the whole page
let activeEl = null;

function hit(rect, x, y) {
  return x >= rect.left - HIT_PAD && x <= rect.right + HIT_PAD && y >= rect.top - HIT_PAD && y <= rect.bottom + HIT_PAD;
}

export function makeDraggable(el, opts) {
  let pid = null, sx = 0, sy = 0;
  el.classList.add('draggable');
  el.style.touchAction = 'none';

  const down = e => {
    // a piece removed mid-drag never gets pointerup: drop the stale lock
    if (activePointer !== null && !(activeEl && activeEl.isConnected)) { activePointer = null; activeEl = null; }
    if (activePointer !== null || el.dataset.locked === '1') return;
    activePointer = pid = e.pointerId;
    activeEl = el;
    sx = e.clientX; sy = e.clientY;
    try { el.setPointerCapture(pid); } catch { /* ignore */ }
    el.style.transition = 'none';
    el.style.zIndex = '50';
    el.classList.add('dragging');
    el.style.transform = 'translate(0px,0px) scale(1.1)';
    playSfx('pop');
    e.preventDefault();
  };
  const move = e => {
    if (e.pointerId !== pid) return;
    el.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px) scale(1.1)`;
  };
  const back = () => {
    el.style.transition = 'transform .3s ease-out';
    el.style.transform = 'translate(0px,0px) scale(1)';
    setTimeout(() => { el.style.zIndex = ''; }, 300);
  };
  const up = e => {
    if (e.pointerId !== pid) return;
    pid = null; activePointer = null; activeEl = null;
    el.classList.remove('dragging');
    const target = (opts.targets() || []).find(t => hit(t.getBoundingClientRect(), e.clientX, e.clientY)) || null;
    let ok = false;
    try { ok = target ? !!opts.onDrop(target, el) : (opts.onDrop(null, el), false); } catch { ok = false; }
    if (!ok) { playSfx('boing'); back(); }
    else { el.style.transition = 'none'; el.style.zIndex = ''; }
  };
  const cancel = e => {
    if (e.pointerId !== pid) return;
    pid = null; activePointer = null; activeEl = null; el.classList.remove('dragging'); back();
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('lostpointercapture', cancel);
  return () => {
    if (pid !== null) { activePointer = null; activeEl = null; }
    el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', cancel);
  };
}

// Freeze every piece in a list (after a round is solved)
export function lockAll(els) { for (const e of els) if (e) e.dataset.locked = '1'; }

// Put an element into a slot: the caller re-parents it; this resets drag transforms.
export function settle(el) {
  el.style.transition = 'none';
  el.style.transform = '';
  el.style.zIndex = '';
}
