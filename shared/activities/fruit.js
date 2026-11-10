// 열매 따기: hear a sound (or word), drag the matching letter (or picture) fruit into the basket
import { makeDraggable, lockAll } from '../drag.js';
import { scene, shuffle, at, el, glow, unglow, cheer, buddy, wait, ask, board, picUrl, praise, progress, asset, tokenHtml, tokenSay } from './common.js';
import { isLetter } from '../english.js';

const SPOTS = [[24, 40], [38, 30], [52, 38], [33, 52], [47, 55], [60, 47]];
const WORD_SPOTS = [[18, 36], [34, 56], [50, 34], [65, 53]];

export async function run(ctx, { rounds }) {
  scene(ctx, 'tree');
  buddy(ctx);
  const skin = ctx.skin || {};
  const basket = at(el('div', 'position:absolute;width:min(20vw,27vh);z-index:3', `<img class="picimg" src="${skin.target ? asset(skin.target) : picUrl('basket')}" alt="">`, 'basket'), 82, 76);
  ctx.stage.appendChild(basket);
  const results = [];
  const tick = progress(ctx, rounds.length);
  for (const r of rounds) {
    board(ctx, r.show);
    ctx.boardLine = r.line;
    const spots = shuffle(r.options.every(isLetter) || r.options.length > WORD_SPOTS.length ? SPOTS : WORD_SPOTS, ctx.rng);
    const fruits = r.options.map((t, i) => {
      const letter = isLetter(t);
      const size = letter ? 112 : 150;
      const f = skin.item && letter
        ? at(el('div', `position:absolute;width:${size + 40}px;height:${size + 50}px;display:flex;align-items:center;justify-content:center;background:url(${asset(skin.item)}) center/contain no-repeat;filter:drop-shadow(0 8px 8px rgba(80,40,30,.25));color:#4A3A48;text-shadow:0 0 6px #fff,0 0 12px #fff,0 0 16px #fff;z-index:3`, tokenHtml(t, 64), 'fruit'), spots[i][0], spots[i][1] + 4)
        : at(el('div', `position:absolute;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.15);background:radial-gradient(circle at 35% 30%,${letter ? '#FFC1CC 0,#FF7F96 55%,#E85A75 100%' : '#fff 0,#FFF3F6 60%,#FFD3DF 100%'});box-shadow:inset 0 -8px 0 rgba(0,0,0,.1),0 8px 14px rgba(120,40,60,.3);z-index:3`, tokenHtml(t, 66), 'fruit'), spots[i][0], spots[i][1] + 4);
      f.dataset.text = t;
      if (!skin.item || !letter) f.insertAdjacentHTML('beforeend', '<span style="position:absolute;top:-10px;left:50%;width:16px;height:22px;background:#5DBB6A;border-radius:0 80% 0 80%;transform:translateX(-50%) rotate(-20deg)"></span>');
      ctx.stage.appendChild(f);
      f.addEventListener('pointerdown', () => ctx.speak(tokenSay(t)));
      return f;
    });
    ask(ctx, r.prompt, fruits.find(x => x.dataset.text === r.target));
    let wrong = 0;
    await new Promise(done => {
      for (const f of fruits) makeDraggable(f, {
        targets: () => [basket],
        onDrop: tg => {
          if (!tg) return false;
          if (f.dataset.text === r.target) {
            lockAll(fruits);
            f.style.transition = 'left .4s, top .4s, transform .4s'; f.style.left = '82%'; f.style.top = '72%'; f.style.transform = 'scale(.5)';
            cheer(ctx, basket);
            ctx.onSuccess(r.target, 'fruit'); results.push({ item: r.target, type: 'fruit' }); tick();
            setTimeout(done, 500);
            return true;
          }
          wrong += 1;
          if (wrong >= 2) glow(fruits.find(x => x.dataset.text === r.target));
          ctx.speak(ctx.phrase('tryAgain'));
          return false;
        },
      });
    });
    if (r.listenOnly) board(ctx, r.reveal);
    await ctx.speak(r.line);
    await praise(ctx);
    unglow(ctx.stage);
    fruits.forEach(f => f.remove());
    await wait(150);
  }
  return results;
}
