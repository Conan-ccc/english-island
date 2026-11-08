// 동물 친구 선물: a friend says an English word (the bubble only shows "?"); give the matching picture card
import { makeDraggable, lockAll } from '../drag.js';
import { scene, shuffle, at, el, glow, unglow, cheer, buddy, wait, ask, picUrl, praise, progress, asset, tokenHtml } from './common.js';

const FRIENDS = ['friend-rabbit', 'friend-bear', 'friend-duck', 'friend-bird'];

export async function run(ctx, { rounds }) {
  scene(ctx, 'village');
  buddy(ctx);
  const results = [];
  const tick = progress(ctx, rounds.length);
  const friendSrc = i => ctx.skin?.friends ? asset(ctx.skin.friends[i % ctx.skin.friends.length]) : picUrl(FRIENDS[i % FRIENDS.length]);
  for (let i = 0; i < rounds.length; i++) {
    const r = rounds[i];
    const friend = at(el('div', 'position:absolute;width:min(22vw,32vh);z-index:3', `<img class="picimg" src="${friendSrc(i)}" alt="">`, 'animal'), 64, 62);
    const bubble = at(el('div', 'position:absolute;background:#fff;border-radius:30px;padding:10px 26px;box-shadow:0 8px 18px rgba(80,60,100,.18);z-index:4;min-width:110px;text-align:center;font-size:64px;font-weight:800;color:#FF6FA5;cursor:pointer', '?', 'bubble'), 64, 22);
    ctx.stage.append(friend, bubble);
    const cards = shuffle(r.options, ctx.rng).map((t, k) => {
      const c = at(el('div', 'position:absolute;width:min(17vw,22vh);padding:8px;border-radius:22px;background:#fff;border:4px solid #FFC2D9;text-align:center;box-shadow:0 6px 0 rgba(0,0,0,.08);z-index:5', tokenHtml(t), 'card pic-card'), 28 + (k % 2) * 16, 28 + k * 23);
      c.dataset.text = t;
      ctx.stage.appendChild(c);
      c.addEventListener('pointerdown', () => ctx.speak('en:' + t));
      return c;
    });
    const answerCard = cards.find(x => x.dataset.text === r.answer);
    ctx.boardLine = r.prompt;
    ask(ctx, r.prompt, answerCard);
    bubble.addEventListener('click', () => ask(ctx, r.line, answerCard));
    friend.addEventListener('click', () => ask(ctx, r.line, answerCard));
    let wrong = 0;
    await new Promise(done => {
      for (const c of cards) makeDraggable(c, {
        targets: () => [friend, bubble],
        onDrop: tg => {
          if (!tg) return false;
          if (c.dataset.text === r.answer) {
            lockAll(cards);
            c.style.transition = 'left .4s, top .4s, transform .4s, opacity .4s'; c.style.left = '64%'; c.style.top = '55%'; c.style.transform = 'scale(.3)'; c.style.opacity = '0';
            bubble.innerHTML = tokenHtml(r.answer);
            friend.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-30px)' }, { transform: 'translateY(0)' }], { duration: 500, iterations: 2 });
            cheer(ctx, friend);
            for (const it of new Set(r.credit || [])) { ctx.onSuccess(it, 'gift'); results.push({ item: it, type: 'gift' }); }
            tick(); setTimeout(done, 900);
            return true;
          }
          wrong += 1;
          if (wrong >= 2) glow(answerCard);
          ctx.speak(ctx.phrase('tryAgain'));
          return false;
        },
      });
    });
    await ctx.speak(r.line);
    await praise(ctx);
    unglow(ctx.stage);
    [friend, bubble, ...cards].forEach(x => x.remove());
    await wait(150);
  }
  return results;
}
