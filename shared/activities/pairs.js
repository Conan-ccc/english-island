// 짝 맞추기: flip two cards; a picture and its first letter (letter islands) or its word make a pair (memory game)
import { scene, shuffle, el, buddy, wait, praise, progress, asset, center } from './common.js';

export async function run(ctx, { kind = 'pic-letter', prompt, pairs }) {
  scene(ctx, 'workshop');
  buddy(ctx);
  ctx.boardLine = prompt;
  ctx.prompt = prompt;
  const results = [];
  const tick = progress(ctx, pairs.length);
  const back = ctx.skin?.back ? `background:url(${asset(ctx.skin.back)}) center/contain no-repeat;` : 'background:linear-gradient(160deg,#FFC2D9,#C9B8FF);border-radius:22px;';
  const cards = shuffle(pairs.flatMap((p, i) => [{ i, side: 'pic', p }, { i, side: 'face', p }]), ctx.rng);
  const cols = cards.length <= 6 ? 3 : 4;
  const grid = el('div', `position:absolute;left:50%;top:54%;translate:-50% -50%;display:grid;grid-template-columns:repeat(${cols},min(17vw,21vh));gap:min(2vw,2.4vh);z-index:3`, '', 'pairs-grid');
  ctx.stage.appendChild(grid);
  const faces = cards.map(c => {
    const card = el('div', 'position:relative;aspect-ratio:1;cursor:pointer;perspective:800px', '', 'pair-card');
    const inner = el('div', 'position:absolute;inset:0;transition:transform .45s;transform-style:preserve-3d');
    const b = el('div', `position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;${back}filter:drop-shadow(0 8px 8px rgba(0,0,0,.18))`);
    const f = el('div', 'position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);background:#fff;border-radius:22px;border:4px solid #FFC2D9;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 12px rgba(0,0,0,.15)');
    if (c.side === 'pic') f.innerHTML = `<img src="${asset(c.p.pic)}" alt="" style="width:80%;height:80%;object-fit:contain">`;
    else f.innerHTML = `<span class="tok-letter" style="font-size:${kind === 'pic-letter' ? 'min(10vw,12vh)' : c.p.face.length > 4 ? 'min(4.5vw,5.5vh)' : 'min(6vw,7.5vh)'};color:#4A3A48">${c.p.face.replace(/[<>&]/g, '')}</span>`;
    inner.append(b, f); card.appendChild(inner); grid.appendChild(card);
    return { c, card, inner, open: false, done: false };
  });
  ctx.speak(prompt);
  // peek: show everything for a moment so the child knows where things are
  await wait(400);
  faces.forEach(x => { x.inner.style.transform = 'rotateY(180deg)'; });
  await wait(2200);
  faces.forEach(x => { x.inner.style.transform = ''; });
  await wait(500);
  let first = null, busy = false, left = pairs.length;
  await new Promise(done => {
    for (const x of faces) x.card.addEventListener('click', async () => {
      if (busy || x.open || x.done) return;
      x.open = true; x.inner.style.transform = 'rotateY(180deg)'; ctx.sfx('tap');
      ctx.speak(x.c.side === 'pic' ? ['en:' + x.c.p.word] : x.c.p.say);
      if (!first) { first = x; return; }
      const a = first; first = null; busy = true;
      await wait(650);
      if (a.c.i === x.c.i) {
        a.done = x.done = true;
        [a, x].forEach(y => { y.card.style.transition = 'transform .4s'; y.card.style.transform = 'scale(1.08)'; });
        const [cx, cy] = center(x.card); ctx.burst(cx, cy, 'stars'); ctx.sfx('success');
        for (const it of new Set(x.c.p.credit || [])) { ctx.onSuccess(it, 'pairs'); results.push({ item: it, type: 'pairs' }); }
        tick();
        await ctx.speak(kind === 'pic-letter' ? [...x.c.p.say, 'en:' + x.c.p.word] : ['en:' + x.c.p.word]);
        left -= 1;
        if (left === 0) setTimeout(done, 400);
      } else {
        ctx.sfx('boing');
        a.open = x.open = false; a.inner.style.transform = ''; x.inner.style.transform = '';
      }
      busy = false;
    });
  });
  await praise(ctx);
  return results;
}
