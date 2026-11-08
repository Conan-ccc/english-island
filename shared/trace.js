// Finger tracing widget
import { STROKES, matchStroke, strokesFor } from './strokes.js';
import { playSfx } from './fx.js';
import { speak } from './speech.js';

const NS = 'http://www.w3.org/2000/svg';
const d = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

export function createTracer(container, key, opts = {}) {
  const strokes = strokesFor(key);
  const tol = opts.tol ?? (STROKES[key] ? 14 : 9);
  if (!strokes) throw new Error('no-strokes:' + key);
  const W = opts.width ?? 12; // guide width in the 0..100 box (thinner for small letters in a word)
  const svg = mk('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'xMidYMid meet', class: 'tracer' });
  svg.style.cssText = 'width:100%;height:100%;touch-action:none;display:block';
  const guide = mk('g', { opacity: String(opts.guideOpacity ?? 0.5) });
  for (const s of strokes) guide.appendChild(mk('path', { d: d(s), stroke: '#C9B8D6', 'stroke-width': String(W), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }));
  const doneG = mk('g', {});
  const ink = mk('path', { d: '', stroke: '#FF8FB1', 'stroke-width': String(Math.max(4, W * 0.6)), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none', opacity: '.85' });
  const dot = mk('circle', { r: '6', fill: '#FFD84D', stroke: '#fff', 'stroke-width': '2', class: 'trace-dot' });
  const pulse = mk('animate', { attributeName: 'r', values: '5;9;5', dur: '1s', repeatCount: 'indefinite' });
  dot.appendChild(pulse);
  svg.append(guide, doneG, ink, dot);
  container.appendChild(svg);

  let idx = 0, pts = null, pid = null, finished = false;
  const place = () => {
    if (idx >= strokes.length) { dot.style.display = 'none'; return; }
    const [x, y] = strokes[idx][0];
    dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.style.display = '';
  };
  place();

  // Demo: a star travels along the stroke from its start, showing where and which way to go
  const showWay = stroke => {
    svg.querySelectorAll('.trace-demo').forEach(n => n.remove());
    const g = mk('g', { class: 'trace-demo' });
    const star = mk('circle', { r: '5', fill: '#FF6FA5', stroke: '#fff', 'stroke-width': '2' });
    const mot = mk('animateMotion', { dur: '1.4s', repeatCount: '2', fill: 'freeze', path: d(stroke) });
    star.appendChild(mot); g.appendChild(star); svg.appendChild(g);
    try { mot.beginElement(); } catch { /* older engines start automatically */ }
    setTimeout(() => g.remove(), 3000);
  };

  const toLocal = e => {
    const m = svg.getScreenCTM();
    if (!m) return [0, 0];
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  };
  const down = e => {
    if (finished || pid !== null) return;
    pid = e.pointerId; pts = [toLocal(e)];
    try { svg.setPointerCapture(pid); } catch { /* ignore */ }
    ink.setAttribute('d', d(pts));
    e.preventDefault();
  };
  const move = e => {
    if (e.pointerId !== pid) return;
    pts.push(toLocal(e));
    ink.setAttribute('d', d(pts));
  };
  const up = e => {
    if (e.pointerId !== pid) return;
    pid = null;
    const res = matchStroke(pts, strokes[idx], tol);
    ink.setAttribute('d', '');
    if (res.ok) {
      doneG.appendChild(mk('path', { d: d(strokes[idx]), stroke: '#FF8FB1', 'stroke-width': String(W), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }));
      playSfx('sparkle');
      opts.onStroke?.(idx, true);
      idx += 1;
      place();
      if (idx >= strokes.length) { finished = true; opts.onComplete?.(); }
    } else {
      opts.onStroke?.(idx, false);
      showWay(strokes[idx]);
      speak('이렇게 해볼까?');
    }
    pts = null;
  };
  svg.addEventListener('pointerdown', down);
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', () => { pid = null; pts = null; ink.setAttribute('d', ''); });
  return { destroy() { svg.remove(); } };
}
