// 받기: things fall from the sky; slide the basket under the ones that match what you heard
import { scene, el, buddy, wait, ask, board, praise, progress, asset, picUrl, center, wiggle, glow, tokenHtml, tokenSay } from './common.js';
import { isLetter } from '../english.js';

const LANES = [12, 30, 48, 66, 84];
const COLORS = ['#FFB8D9', '#B8E0FF', '#FFE7A8', '#CFF2C4'];

export async function run(ctx, { rounds }) {
  scene(ctx, 'tree');
  buddy(ctx);
  const skin = ctx.skin || {};
  const results = [];
  const tick = progress(ctx, rounds.reduce((a, r) => a + r.need, 0));
  const field = el('div', 'position:absolute;inset:0;overflow:hidden;z-index:3;touch-action:none;cursor:pointer', '', 'field');
  ctx.stage.appendChild(field);
  const basket = el('div', 'position:absolute;left:50%;bottom:2%;width:min(24vw,32vh);translate:-50% 0;z-index:6;pointer-events:none;transition:left .12s linear', `<img class="picimg" src="${skin.target ? asset(skin.target) : picUrl('basket')}" alt="">`, 'catcher');
  ctx.stage.appendChild(basket);
  // the basket follows the finger anywhere on the screen (touch, hold or slide)
  const follow = e => {
    const r = field.getBoundingClientRect();
    basket.style.left = Math.max(10, Math.min(90, ((e.clientX - r.left) / r.width) * 100)) + '%';
  };
  field.addEventListener('pointerdown', follow);
  field.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || e.buttons) follow(e); });

  for (const r of rounds) {
    board(ctx, r.show);
    ctx.boardLine = r.line;
    ask(ctx, r.prompt, null);
    let got = 0, misses = 0, sinceTarget = 0, lastLane = -1, alive = true;
    const items = [];
    const spawn = () => {
      if (!alive) return;
      // never a long wait for the right one: after two others the next is always a match
      const isTarget = sinceTarget >= 2 || ctx.rng() < 0.5;
      sinceTarget = isTarget ? 0 : sinceTarget + 1;
      const text = isTarget ? r.target : r.decoys[Math.floor(ctx.rng() * r.decoys.length)];
      const letter = isLetter(text);
      const size = letter ? 120 : 136;
      let lane = Math.floor(ctx.rng() * LANES.length);
      if (lane === lastLane) lane = (lane + 1 + Math.floor(ctx.rng() * (LANES.length - 1))) % LANES.length;
      lastLane = lane;
      const art = skin.item && letter ? `background:url(${asset(skin.item)}) center/contain no-repeat;` : `background:radial-gradient(circle at 35% 30%,#fff 0,${COLORS[Math.floor(ctx.rng() * COLORS.length)]} 45%,rgba(255,255,255,.4) 100%);border-radius:50%;box-shadow:inset -8px -10px 0 rgba(0,0,0,.06);`;
      const node = el('div', `position:absolute;left:${LANES[lane]}%;top:0;margin-left:${-size / 2}px;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;${art}color:#4A3A48;text-shadow:0 0 6px #fff,0 0 12px #fff;pointer-events:none;filter:drop-shadow(0 8px 8px rgba(0,0,0,.18));will-change:transform`, tokenHtml(text, 60), 'faller');
      node.dataset.text = text;
      field.appendChild(node);
      const h = field.getBoundingClientRect().height || window.innerHeight;
      const it = { node, text, size, y: -size - 20, vy: (h + size) / (5200 + ctx.rng() * 1600), isTarget, done: false };
      if (isTarget && misses >= 2) glow(node);
      node.style.transform = `translateY(${it.y}px)`;
      items.push(it);
    };
    let last = performance.now();
    const frame = now => {
      if (!alive || !field.isConnected) return;
      const dt = Math.min(50, now - last); last = now;
      const fr = field.getBoundingClientRect();
      const br = basket.getBoundingClientRect();
      for (const it of items) {
        if (it.done) continue;
        it.y += it.vy * dt;
        it.node.style.transform = `translateY(${it.y}px)`;
        const ir = it.node.getBoundingClientRect();
        const cx = ir.left + ir.width / 2, bottom = ir.bottom;
        const inX = cx > br.left - 6 && cx < br.right + 6;
        const inY = bottom > br.top + br.height * 0.25 && ir.top < br.top + br.height * 0.6;
        if (inX && inY) {
          it.done = true;
          if (it.text === r.target) {
            const [x, y] = center(it.node); ctx.burst(x, y, 'stars'); ctx.sfx('sparkle');
            it.node.style.transition = 'transform .3s, opacity .3s'; it.node.style.transform = `translateY(${it.y + 40}px) scale(.4)`; it.node.style.opacity = '0';
            setTimeout(() => it.node.remove(), 320);
            if (got < r.need) { ctx.onSuccess(r.target, 'catch'); results.push({ item: r.target, type: 'catch' }); tick(); }
            got += 1; misses = 0;
          } else {
            // not this one: it bounces off the basket and flies away
            ctx.sfx('boing'); wiggle(basket); ctx.speak(tokenSay(it.text));
            misses += 1;
            const dir = cx < fr.left + fr.width / 2 ? 1 : -1;
            it.node.style.transition = 'transform .7s ease-out, opacity .7s'; it.node.style.transform = `translate(${dir * 180}px, ${it.y - 220}px) rotate(${dir * 120}deg)`; it.node.style.opacity = '0';
            setTimeout(() => it.node.remove(), 720);
            if (misses >= 2) items.filter(o => !o.done && o.isTarget).forEach(o => glow(o.node));
          }
        } else if (ir.top > fr.bottom + 20) { it.done = true; it.node.remove(); }
      }
      requestAnimationFrame(frame);
    };
    spawn();
    const timer = setInterval(spawn, 1500);
    requestAnimationFrame(frame);
    while (got < r.need && ctx.stage.isConnected) await wait(120);
    alive = false; clearInterval(timer);
    for (const it of items) if (!it.done) { it.node.style.transition = 'opacity .3s'; it.node.style.opacity = '0'; }
    if (r.listenOnly) board(ctx, r.reveal);
    await ctx.speak(r.line);
    await praise(ctx);
    field.querySelectorAll('.faller').forEach(n => n.remove());
  }
  return results;
}
