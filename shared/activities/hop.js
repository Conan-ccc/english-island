// 징검다리: three stepping stones at a time; tap the one that matches what you heard and the friend hops onto it,
// stone by stone, all the way to the star on the other side
import { scene, shuffle, at, el, glow, unglow, wiggle, wait, ask, board, praise, progress, center, tokenHtml, tokenSay } from './common.js';
import { isLetter } from '../english.js';

const ROWS = [43, 63, 83];
const GOAL = '<svg viewBox="-12 -12 24 24" width="100%" height="100%"><path d="M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3Z" fill="#FFD84D" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';

export async function run(ctx, { rounds }) {
  scene(ctx, 'river');
  const results = [];
  const tick = progress(ctx, rounds.length);
  const n = rounds.length;
  const colX = i => 25 + i * (54 / Math.max(1, n - 1));
  const goal = at(el('div', 'position:absolute;width:min(13vw,17vh);aspect-ratio:1;z-index:3;filter:drop-shadow(0 8px 10px rgba(120,90,20,.35))', GOAL, 'hop-goal'), 93, 60);
  const beat = goal.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 1200, iterations: Infinity });
  ctx.stage.appendChild(goal);
  const hero = el('div', 'position:absolute;left:8%;top:63%;width:min(13vw,18vh);translate:-50% -82%;z-index:6;cursor:pointer;transition:left .5s ease-in-out, top .5s ease-in-out', ctx.characterHtml, 'hero buddy');
  hero.addEventListener('click', () => { wiggle(hero); if (ctx.prompt) ask(ctx, ctx.prompt, ctx.promptTarget); });
  ctx.stage.appendChild(hero);
  const jumpTo = async (x, y) => {
    hero.classList.add('walking'); ctx.sfx('pop');
    hero.style.left = x + '%'; hero.style.top = y + '%';
    await wait(520);
    hero.classList.remove('walking');
  };

  for (let i = 0; i < n; i++) {
    const r = rounds[i];
    board(ctx, r.show);
    ctx.boardLine = r.line;
    const rows = shuffle(ROWS, ctx.rng);
    const stones = r.options.map((t, k) => {
      const letter = isLetter(t);
      const s = at(el('div', `position:absolute;width:min(15vw,19vh);aspect-ratio:${letter ? '1.12' : '1'};z-index:4;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#4A3A48;transition:transform .45s, opacity .45s;transform:scale(.2);opacity:0`, tokenHtml(t, 62), 'stone' + (letter ? '' : ' pic')), colX(i), rows[k]);
      s.dataset.text = t;
      ctx.stage.appendChild(s);
      requestAnimationFrame(() => { s.style.transform = 'scale(1)'; s.style.opacity = '1'; });
      return s;
    });
    const target = stones.find(x => x.dataset.text === r.target);
    ask(ctx, r.prompt, target);
    let wrong = 0, solved = false;
    await new Promise(done => {
      for (const s of stones) s.addEventListener('click', () => {
        if (solved || s.dataset.out) return;
        if (s === target) {
          solved = true;
          unglow(ctx.stage);
          stones.forEach(o => { if (o !== s) { o.dataset.out = '1'; o.style.transform = 'translateY(30px) scale(.7)'; o.style.opacity = '0'; } });
          done();
        } else {
          s.dataset.out = '1';
          wiggle(s); ctx.sfx('boing'); ctx.speak(tokenSay(s.dataset.text));
          setTimeout(() => { s.style.transform = 'translateY(18px) scale(.85)'; s.style.opacity = '.35'; }, 420);
          wrong += 1;
          if (wrong >= 2) glow(target);
        }
      });
    });
    await jumpTo(colX(i), parseFloat(target.style.top));
    const [x, y] = center(target); ctx.burst(x, y, 'stars'); ctx.sfx('sparkle');
    ctx.onSuccess(r.target, 'hop'); results.push({ item: r.target, type: 'hop' }); tick();
    if (r.listenOnly) board(ctx, r.reveal);
    await ctx.speak(r.line);
    stones.forEach(o => { if (o !== target) o.remove(); });
    target.style.opacity = '.55';
  }
  // the last hop: over to the star
  ctx.stage.querySelector('.board')?.remove();
  await jumpTo(90, 63);
  const [gx, gy] = center(goal); ctx.burst(gx, gy, 'stars'); ctx.sfx('fanfare');
  beat.cancel();
  goal.animate([{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.5) rotate(180deg)' }, { transform: 'scale(1) rotate(360deg)' }], { duration: 900 });
  hero.classList.add('boing');
  await praise(ctx);
  await wait(300);
  return results;
}
