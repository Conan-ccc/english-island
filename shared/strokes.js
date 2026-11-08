// Stroke data for lowercase letters (0..100 box) and stroke matching (pure).
// Writing lines: ascender y=10, x-height y=45, baseline y=80, descender y=98. One-storey a and g (same as the letter font).
const r2 = v => +v.toFixed(2);
// Points on an ellipse arc; angles in degrees on screen (0 = right, 90 = down). from > to runs counter-clockwise on screen.
const arc = (cx, cy, rx, ry, from, to, n = 18) => {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = ((from + (to - from) * i / n) * Math.PI) / 180; pts.push([r2(cx + rx * Math.cos(a)), r2(cy + ry * Math.sin(a))]); }
  return pts;
};
const line = (...pts) => pts;
const CY = 62.5, RY = 17.5; // x-height body: y 45..80

// round body that a, d, g, q start with: from the top right, counter-clockwise all the way round
const bowlLeft = arc(52, CY, 16, RY, -30, -350, 22);
// bowl that b, p end with: from the stem, clockwise round to the stem again
const bowlRight = arc(50, CY, 16, RY, -160, 160, 20);
const hump = (x0, x1) => line([x0, 58], [x0 + (x1 - x0) * 0.18, 49], [x0 + (x1 - x0) * 0.5, 45], [x0 + (x1 - x0) * 0.82, 47.5], [x1, 54], [x1, 80]);

export const STROKES = {
  a: [bowlLeft, line([68, 45], [68, 80])],
  b: [line([34, 10], [34, 80]), bowlRight],
  c: [arc(54, CY, 18, RY, -40, -320, 20)],
  d: [bowlLeft, line([68, 10], [68, 80])],
  e: [[[33, 63], [69, 63], ...arc(51, CY, 18, RY, -5, -320, 20).slice(1)]],
  f: [line([66, 15], [60, 10.5], [53, 10], [48, 13], [46, 20], [46, 80]), line([34, 45], [62, 45])],
  g: [bowlLeft, line([68, 45], [68, 90], [64, 96], [56, 98.5], [46, 97.5], [38, 93])],
  h: [line([34, 10], [34, 80]), hump(34, 66)],
  i: [line([50, 45], [50, 80]), line([50, 27], [50, 35])],
  j: [line([56, 45], [56, 91], [52, 97], [45, 98.5], [37, 95]), line([56, 27], [56, 35])],
  k: [line([36, 10], [36, 80]), line([66, 45], [37, 66]), line([46, 59], [68, 80])],
  l: [line([50, 10], [50, 80])],
  m: [line([24, 45], [24, 80]), hump(24, 50), hump(50, 76)],
  n: [line([34, 45], [34, 80]), hump(34, 66)],
  o: [arc(50, CY, 18, RY, -90, -450, 24)],
  p: [line([34, 45], [34, 98]), bowlRight],
  q: [bowlLeft, line([68, 45], [68, 98])],
  r: [line([38, 45], [38, 80]), line([38, 60], [43, 50], [52, 45.5], [63, 47])],
  s: [line([64, 50], [59, 46], [50, 45], [41, 47], [37, 52], [41, 58], [50, 62], [59, 66], [63, 72], [59, 78], [50, 80], [40, 79], [35, 75])],
  t: [line([48, 18], [48, 73], [51, 79], [57, 80.5], [63, 78]), line([35, 45], [62, 45])],
  u: [line([34, 45], [34, 68], [37, 76], [44, 80], [53, 80], [61, 75], [66, 66]), line([66, 45], [66, 80])],
  v: [line([32, 45], [50, 80], [68, 45])],
  w: [line([24, 45], [34, 80], [50, 52], [66, 80], [76, 45])],
  x: [line([34, 45], [66, 80]), line([66, 45], [34, 80])],
  y: [line([33, 45], [51, 79]), line([67, 45], [42, 98])],
  z: [line([34, 45], [66, 45], [34, 80], [66, 80])],
};

// A short word written left to right: every letter shrunk around the middle of its own cell
export function wordStrokes(word) {
  const ls = [...String(word ?? '')];
  if (ls.length < 2 || ls.length > 4 || ls.some(l => !STROKES[l])) return null;
  const n = ls.length, s = Math.min(1, 1.9 / n), cell = 100 / n;
  return ls.flatMap((l, i) => {
    const cx = cell * (i + 0.5);
    return STROKES[l].map(st => st.map(([x, y]) => [r2(cx + (x - 50) * s), r2(50 + (y - 50) * s)]));
  });
}

// Strokes for any trace key: a single letter or a short word
export function strokesFor(key) { return STROKES[key] || wordStrokes(key); }

export const RESAMPLE_N = 32;

function len(pts) {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return d;
}

export function resample(pts, n = RESAMPLE_N) {
  if (pts.length === 0) return [];
  if (pts.length === 1) return Array.from({ length: n }, () => [...pts[0]]);
  const total = len(pts);
  if (total === 0) return Array.from({ length: n }, () => [...pts[0]]);
  const step = total / (n - 1);
  const out = [[...pts[0]]];
  let acc = 0;
  for (let i = 1; i < pts.length && out.length < n; i++) {
    let [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    let seg = Math.hypot(x1 - x0, y1 - y0);
    while (acc + seg >= step && out.length < n) {
      const t = (step - acc) / seg;
      x0 = x0 + (x1 - x0) * t; y0 = y0 + (y1 - y0) * t;
      out.push([x0, y0]);
      seg = Math.hypot(x1 - x0, y1 - y0);
      acc = 0;
    }
    acc += seg;
  }
  while (out.length < n) out.push([...pts[pts.length - 1]]);
  return out;
}

function distToSeg(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
function distToPolyline(p, line) {
  let m = Infinity;
  for (let i = 1; i < line.length; i++) m = Math.min(m, distToSeg(p, line[i - 1], line[i]));
  return line.length === 1 ? Math.hypot(p[0] - line[0][0], p[1] - line[0][1]) : m;
}

export function matchStroke(user, expected, tol = 14) {
  if (!user || user.length < 2) return { ok: false, reason: 'too-short' };
  const s = user[0], e0 = expected[0];
  if (Math.hypot(s[0] - e0[0], s[1] - e0[1]) > tol * 1.5) return { ok: false, reason: 'wrong-start' };
  if (len(user) < len(expected) * 0.6) return { ok: false, reason: 'too-short' };
  const u = resample(user), x = resample(expected);
  const meanPath = u.reduce((a, p) => a + distToPolyline(p, expected), 0) / u.length;
  if (meanPath > tol) return { ok: false, reason: 'off-path' };
  // ordered correspondence catches wrong direction on closed shapes (e.g. clockwise o)
  const meanOrdered = u.reduce((a, p, i) => a + Math.hypot(p[0] - x[i][0], p[1] - x[i][1]), 0) / u.length;
  if (meanOrdered > tol * 2) return { ok: false, reason: 'off-path' };
  // round shapes (o, the bowls of a/d/g/q/b/p, c, e): small letters need an explicit turning-direction check
  const area = a => a.reduce((s, p, i) => { const q = a[(i + 1) % a.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
  const ex = area(x);
  if (Math.abs(ex) > 150 && Math.sign(area(u)) !== Math.sign(ex)) return { ok: false, reason: 'wrong-way' };
  return { ok: true, reason: 'ok' };
}
