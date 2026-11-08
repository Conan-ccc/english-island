// 찾기: tap every card that shows the letter (or picture) you heard
import { scene, shuffle, at, el, glow, unglow, wiggle, buddy, wait, center, ask, board, praise, progress, asset, tokenHtml, tokenSay } from './common.js';
import { isLetter } from '../english.js';

export async function run(ctx, { target, decoys, count = 5, show, reveal, line, prompt, listenOnly }) {
  scene(ctx, 'beach');
  buddy(ctx);
  board(ctx, show);
  ctx.boardLine = line;
  const total = Math.max(count + 3, Math.min(10, count + decoys.length * 2));
  const texts = shuffle([...Array(count).fill(target), ...Array.from({ length: total - count }, (_, i) => decoys[i % decoys.length])], ctx.rng);
  const cols = 5, rows = Math.ceil(texts.length / cols);
  const cards = texts.map((t, i) => {
    const cx = 18 + (i % cols) * 16 + (ctx.rng() - 0.5) * 5;
    const cy = 50 + Math.floor(i / cols) * (36 / rows) + (ctx.rng() - 0.5) * 5;
    const skin = ctx.skin || {};
    const letter = isLetter(t);
    const c = skin.item && letter
      ? at(el('div', `position:absolute;width:150px;height:170px;display:flex;align-items:center;justify-content:center;background:url(${asset(skin.item)}) center/contain no-repeat;filter:drop-shadow(0 8px 6px rgba(80,50,30,.25));color:#4A3A48;text-shadow:0 0 6px #fff,0 0 10px #fff,0 0 14px #fff;cursor:pointer;transition:all .5s;z-index:3;padding-top:14px`, tokenHtml(t, 60), 'item'), cx, cy)
      : at(el('div', `position:absolute;width:${letter ? 110 : 128}px;height:${letter ? 110 : 140}px;display:flex;align-items:center;justify-content:center;border-radius:${letter ? '50% 50% 44% 44%' : '22px'};background:radial-gradient(circle at 40% 30%,#fff 0,#FFE3EC 60%,#F7C4D4 100%);box-shadow:0 8px 12px rgba(120,80,60,.25);color:#4A3A48;cursor:pointer;transition:all .5s;z-index:3`, tokenHtml(t, 54), 'card'), cx, cy);
    c.dataset.text = t;
    c.style.rotate = ((ctx.rng() - 0.5) * 16).toFixed(1) + 'deg';
    ctx.stage.appendChild(c);
    return c;
  });
  ask(ctx, prompt, cards.find(x => x.dataset.text === target));
  const results = [];
  const tick = progress(ctx, count);
  let left = count, wrong = 0;
  await new Promise(done => {
    for (const c of cards) c.addEventListener('click', () => {
      if (c.dataset.found) return;
      if (c.dataset.text === target) {
        c.dataset.found = '1';
        const [x, y] = center(c);
        ctx.burst(x, y, 'stars'); ctx.sfx('sparkle');
        if (ctx.skin?.open && c.classList.contains('item')) {
          // hatch: egg cracks open and a baby pops up
          c.style.backgroundImage = `url(${asset(ctx.skin.open)})`; c.innerHTML = '';
          const babies = ctx.skin.reveal || [];
          if (babies.length) {
            const b = el('div', `position:absolute;left:50%;bottom:30%;width:100px;translate:-50% 0;transition:transform .5s cubic-bezier(.3,1.6,.5,1);transform:scale(.2)`, `<img class="picimg" src="${asset(babies[Math.floor(ctx.rng() * babies.length)])}" alt="">`);
            c.appendChild(b); requestAnimationFrame(() => { b.style.transform = 'scale(1)'; });
          }
          ctx.sfx('giggle');
        } else { c.style.transform = 'translateY(-60px) scale(.6)'; c.style.opacity = '0'; }
        ctx.onSuccess(target, 'find'); results.push({ item: target, type: 'find' });
        left -= 1; wrong = 0; unglow(ctx.stage); tick();
        if (left === 0) setTimeout(done, 500);
      } else {
        wiggle(c); ctx.sfx('boing'); ctx.speak(tokenSay(c.dataset.text));
        wrong += 1;
        if (wrong >= 2) glow(cards.find(x => x.dataset.text === target && !x.dataset.found));
      }
    });
  });
  if (listenOnly) board(ctx, reveal);
  await ctx.speak(line);
  await praise(ctx);
  await wait(150);
  return results;
}
