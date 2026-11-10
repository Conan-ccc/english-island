// 쓱쓱 문지르기: rub the sparkly fog off a card to see the hidden picture, hear its word,
// then tap its letter (letter islands) or its written word (word islands)
import { scene, el, glow, unglow, wiggle, cheer, buddy, wait, ask, board, praise, progress, asset, center, tokenSay } from './common.js';
import { isLetter } from '../english.js';

const GRID = 8;        // the card is watched as GRID x GRID cells
const CLEAR_AT = 0.55; // this share of the cells rubbed = the picture is out
const SIZE = 400;      // canvas pixels

function paintFog(g, rng) {
  const grad = g.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, '#FFC2D9'); grad.addColorStop(0.5, '#C9B8FF'); grad.addColorStop(1, '#A8E3FF');
  g.fillStyle = grad; g.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 46; i++) {
    const x = rng() * SIZE, y = rng() * SIZE, r = 3 + rng() * 9;
    g.fillStyle = `rgba(255,255,255,${0.35 + rng() * 0.5})`;
    g.beginPath();
    for (let k = 0; k < 8; k++) { const a = (Math.PI * k) / 4, rr = k % 2 ? r * 0.35 : r; g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
    g.closePath(); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.92)'; g.font = '800 200px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('?', SIZE / 2, SIZE / 2 + 10);
}

export async function run(ctx, { rounds }) {
  scene(ctx, 'beach');
  buddy(ctx);
  const results = [];
  const tick = progress(ctx, rounds.length);
  for (const r of rounds) {
    ctx.stage.querySelector('.board')?.remove();
    ctx.boardLine = r.line;
    const card = el('div', 'position:absolute;left:50%;top:47%;translate:-50% -50%;width:min(42vh,38vw);aspect-ratio:1;border-radius:34px;background:#fff;border:6px solid #fff;box-shadow:0 12px 26px rgba(80,50,80,.28);z-index:3;overflow:hidden;display:flex;align-items:center;justify-content:center;transition:top .45s, width .45s', `<img src="${asset(r.pic)}" alt="" style="width:80%;height:80%;object-fit:contain;pointer-events:none">`, 'scratch-card');
    const cv = document.createElement('canvas');
    cv.className = 'fog'; cv.width = cv.height = SIZE;
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:pointer;transition:opacity .45s';
    card.appendChild(cv);
    ctx.stage.appendChild(card);
    const g = cv.getContext('2d');
    paintFog(g, ctx.rng);
    g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 96;
    const seen = new Set();
    ask(ctx, ctx.speakLines.scratch, null);
    await new Promise(done => {
      let lastPt = null, finished = false, lastSfx = 0;
      const pt = e => { const b = cv.getBoundingClientRect(); return [((e.clientX - b.left) / b.width) * SIZE, ((e.clientY - b.top) / b.height) * SIZE]; };
      const mark = (x, y) => {
        for (const [dx, dy] of [[0, 0], [-30, 0], [30, 0], [0, -30], [0, 30]]) {
          const cx = Math.floor(((x + dx) / SIZE) * GRID), cy = Math.floor(((y + dy) / SIZE) * GRID);
          if (cx >= 0 && cy >= 0 && cx < GRID && cy < GRID) seen.add(cy * GRID + cx);
        }
      };
      const rub = e => {
        if (finished) return;
        const p = pt(e);
        g.beginPath(); g.moveTo(...(lastPt || p)); g.lineTo(p[0] + 0.01, p[1] + 0.01); g.stroke();
        // long quick strokes skip cells: walk the line
        const from = lastPt || p, steps = Math.max(1, Math.ceil(Math.hypot(p[0] - from[0], p[1] - from[1]) / 30));
        for (let i = 1; i <= steps; i++) mark(from[0] + ((p[0] - from[0]) * i) / steps, from[1] + ((p[1] - from[1]) * i) / steps);
        lastPt = p;
        const now = performance.now();
        if (now - lastSfx > 260) { lastSfx = now; ctx.sfx('tap'); }
        if (seen.size >= GRID * GRID * CLEAR_AT) { finished = true; done(); }
      };
      cv.addEventListener('pointerdown', e => { try { cv.setPointerCapture(e.pointerId); } catch { /* ignore */ } lastPt = null; rub(e); e.preventDefault(); });
      cv.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || e.buttons) rub(e); });
      for (const ev of ['pointerup', 'pointercancel']) cv.addEventListener(ev, () => { lastPt = null; });
    });
    cv.style.opacity = '0'; cv.style.pointerEvents = 'none';
    cheer(ctx, card);
    await ctx.speak(['en:' + r.word]);
    // which one is it?
    const letters = r.options.every(isLetter);
    const tray = el('div', 'position:absolute;left:50%;bottom:4%;translate:-50% 0;display:flex;gap:min(3vw,28px);z-index:4', '', 'scratch-tray');
    const btns = r.options.map(t => {
      const b = el('button', `border:none;min-width:${letters ? 'min(15vw,19vh)' : 'min(22vw,26vh)'};height:min(15vw,19vh);padding:0 18px;border-radius:26px;background:#fff;box-shadow:0 8px 0 #F3C4D8,0 14px 18px rgba(80,50,80,.2);color:#4A3A48;display:flex;align-items:center;justify-content:center;cursor:pointer;transform:scale(.3);opacity:0;transition:transform .35s cubic-bezier(.3,1.6,.5,1), opacity .35s`, `<span class="tok-letter" style="font-size:${letters ? 'min(10vw,12vh)' : t.length > 5 ? 'min(4.6vw,5.6vh)' : 'min(6.4vw,7.8vh)'}">${t.replace(/[<>&]/g, '')}</span>`, 'choice');
      b.dataset.text = t;
      tray.appendChild(b);
      return b;
    });
    ctx.stage.appendChild(tray);
    requestAnimationFrame(() => btns.forEach(b => { b.style.transform = 'scale(1)'; b.style.opacity = '1'; }));
    const target = btns.find(b => b.dataset.text === r.target);
    ask(ctx, r.prompt, target);
    let wrong = 0, solved = false;
    await new Promise(done => {
      for (const b of btns) b.addEventListener('click', () => {
        if (solved) return;
        if (b === target) { solved = true; done(); return; }
        wiggle(b); ctx.sfx('boing'); ctx.speak(tokenSay(b.dataset.text));
        wrong += 1;
        if (wrong >= 2) glow(target);
      });
    });
    unglow(ctx.stage);
    const [x, y] = center(target); ctx.burst(x, y, 'stars'); ctx.sfx('success');
    btns.forEach(b => { if (b !== target) b.style.opacity = '.25'; });
    ctx.onSuccess(r.target, 'scratch'); results.push({ item: r.target, type: 'scratch' }); tick();
    board(ctx, r.reveal);
    card.style.top = '52%'; card.style.width = 'min(34vh,30vw)';
    await ctx.speak(r.line);
    await praise(ctx);
    card.remove(); tray.remove();
    await wait(150);
  }
  ctx.stage.querySelector('.board')?.remove();
  return results;
}
