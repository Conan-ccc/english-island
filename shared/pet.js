// Petting gestures: tap / rub / hold
export const TAP_MS = 250, HOLD_MS = 700, STILL_PX = 10, RUB_PX = 120;

function pathLen(samples) {
  let d = 0;
  for (let i = 1; i < samples.length; i++) d += Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y);
  return d;
}
function maxDisp(samples) {
  const a = samples[0];
  return samples.reduce((m, p) => Math.max(m, Math.hypot(p.x - a.x, p.y - a.y)), 0);
}

export function classifyGesture(samples) {
  if (!samples || samples.length === 0) return null;
  const dur = samples[samples.length - 1].t - samples[0].t;
  const disp = maxDisp(samples);
  if (pathLen(samples) >= RUB_PX) return 'rub';
  if (disp < STILL_PX && dur < TAP_MS) return 'tap';
  if (disp < STILL_PX && dur >= HOLD_MS) return 'hold';
  return null;
}

export function attachPetting(el, handlers = {}) {
  let samples = null, pid = null, rubbed = false, holdTimer = null;
  const pt = e => ({ t: performance.now(), x: e.clientX, y: e.clientY });
  const down = e => {
    if (pid !== null) return;
    pid = e.pointerId; samples = [pt(e)]; rubbed = false;
    try { el.setPointerCapture(pid); } catch { /* ignore */ }
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      if (samples && maxDisp(samples) < STILL_PX && !rubbed) { rubbed = true; handlers.onHold?.(samples[0]); }
    }, HOLD_MS);
  };
  const move = e => {
    if (e.pointerId !== pid || !samples) return;
    samples.push(pt(e));
    if (!rubbed && pathLen(samples) >= RUB_PX) { rubbed = true; clearTimeout(holdTimer); handlers.onRub?.(samples[samples.length - 1]); }
  };
  const up = e => {
    if (e.pointerId !== pid) return;
    clearTimeout(holdTimer);
    if (samples && !rubbed) {
      samples.push(pt(e));
      if (classifyGesture(samples) === 'tap') handlers.onTap?.(samples[0]);
    }
    samples = null; pid = null;
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.style.touchAction = 'none';
  return () => {
    clearTimeout(holdTimer);
    el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
  };
}
