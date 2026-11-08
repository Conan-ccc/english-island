// 다리/공방: mode 'initial' = put the first sound into the blank (_un + s -> sun),
// mode 'cvc' = place the letters in order, hearing each sound, then blend them into the word (c-a-t, cat)
import { makeDraggable, lockAll, settle } from '../drag.js';
import { scene, shuffle, el, glow, unglow, buddy, wait, ask, praise, jblock, center, progress, asset } from './common.js';

function wordBoard(ctx, r) {
  ctx.stage.querySelector('.board')?.remove();
  const b = el('div', '', `<img src="${asset(r.pic)}" alt="">`, 'board');
  b.addEventListener('click', () => { if (ctx.boardLine) ctx.speak(ctx.boardLine); });
  ctx.stage.appendChild(b);
}

export async function run(ctx, { mode, rounds }) {
  scene(ctx, mode === 'cvc' ? 'workshop' : 'river');
  const pal = buddy(ctx);
  const results = [];
  const tick = progress(ctx, rounds.length);
  for (const r of rounds) {
    wordBoard(ctx, r);
    ctx.boardLine = r.line;
    const letters = r.letters;
    const open = mode === 'initial' ? [r.blank] : letters.map((_, i) => i);
    const S = Math.min(130, Math.floor((window.innerWidth * 0.8) / Math.max(3, letters.length)) - 12);
    const row = el('div', `position:absolute;left:50%;top:56%;translate:-50% -50%;display:flex;gap:12px;z-index:3`);
    const slots = letters.map((l, i) => {
      const s = el('div', `width:${S}px;height:${S}px`, '', 'slot2');
      if (!open.includes(i)) { const fixed = jblock(l, S); fixed.style.position = 'static'; fixed.classList.add('fixed'); s.appendChild(fixed); s.style.borderStyle = 'solid'; }
      row.appendChild(s); return s;
    });
    ctx.stage.appendChild(row);
    const tray = el('div', 'position:absolute;left:50%;bottom:4%;translate:-50% 0;display:flex;gap:22px;z-index:4');
    ctx.stage.appendChild(tray);
    const pieces = mode === 'initial' ? r.choices : shuffle([...letters, ...(r.extra || [])], ctx.rng);
    const blocks = pieces.map(t => {
      const hold = el('div', `position:relative;width:${S}px;height:${S}px`);
      const b = jblock(t, S); hold.appendChild(b); tray.appendChild(hold);
      b.addEventListener('pointerdown', () => ctx.speak('en:sound:' + t));
      return b;
    });
    let step = 0, wrong = 0;
    const want = () => letters[open[step]];
    const markNext = () => slots.forEach((s, i) => s.classList.toggle('next', i === open[step]));
    markNext();
    ask(ctx, r.prompt, blocks.find(x => x.dataset.text === want()));
    await new Promise(done => {
      for (const b of blocks) makeDraggable(b, {
        targets: () => slots.filter(s => !s.firstChild),
        onDrop: tg => {
          if (!tg) return false;
          const i = slots.indexOf(tg);
          if (i === open[step] && b.dataset.text === want()) {
            settle(b); b.dataset.locked = '1'; b.style.position = 'static'; tg.appendChild(b);
            ctx.sfx('snap');
            ctx.speak('en:sound:' + b.dataset.text);
            step += 1; wrong = 0; unglow(ctx.stage); markNext();
            if (step >= open.length) { lockAll(blocks); setTimeout(done, 500); }
            return true;
          }
          wrong += 1;
          if (wrong >= 2) glow(blocks.find(x => x.dataset.locked !== '1' && x.dataset.text === want()));
          return false;
        },
      });
    });
    // merge into one word card
    await wait(500);
    const merged = el('div', `position:absolute;left:50%;top:56%;translate:-50% -50%;font-size:${Math.round(Math.min(S * 1.3, 900 / letters.length))}px;color:#FF6FA5;text-shadow:0 6px 0 #fff,0 10px 18px rgba(255,111,165,.45);z-index:6;transform:scale(.3);opacity:0;transition:all .5s cubic-bezier(.3,1.6,.5,1)`, '', 'tok-letter merged');
    merged.textContent = r.word;
    ctx.stage.appendChild(merged);
    row.style.transition = 'opacity .3s'; row.style.opacity = '0';
    requestAnimationFrame(() => { merged.style.transform = 'scale(1)'; merged.style.opacity = '1'; });
    ctx.sfx('success');
    const [x, y] = center(row); ctx.burst(x, y, 'stars');
    ctx.onSuccess(r.target, 'bridge'); results.push({ item: r.target, type: 'bridge' }); tick();
    await ctx.speak(r.line);
    if (mode === 'initial') { pal.style.transition = 'left 2s ease-in-out'; pal.style.left = '78%'; await wait(1200); }
    await praise(ctx);
    row.remove(); tray.remove(); merged.remove();
    pal.style.transition = 'none'; pal.style.left = '1%';
  }
  return results;
}
