// 따라 쓰기 문: trace the letter (or short word) on the door to open it
import { createTracer } from '../trace.js';
import { scene, el, cheer, buddy, wait, board, praise, progress } from './common.js';

export async function run(ctx, { keys, unitOf = {}, lines = {}, guideOpacity = 0.5 }) {
  scene(ctx, 'door');
  buddy(ctx);
  const results = [];
  const tick = progress(ctx, keys.length);
  for (const key of keys) {
    board(ctx, key.length === 1 ? { letter: key } : { word: key });
    ctx.boardLine = lines[key] || ['en:' + key];
    const pad = el('div', 'position:absolute;left:50%;top:60%;translate:-50% -50%;width:min(44vh,40vw);height:min(44vh,40vw);background:rgba(255,250,240,.93);border-radius:28px;box-shadow:0 10px 24px rgba(80,50,30,.25);z-index:3;transition:transform .8s, opacity .8s', '', 'tracepad');
    // writing lines: x-height and baseline (letters sit on the baseline)
    const k = key.length === 1 ? 1 : Math.min(1, 1.9 / key.length);
    const y = v => 50 + (v - 50) * k;
    pad.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"><line x1="4" x2="96" y1="${y(45)}" y2="${y(45)}" stroke="#E7D8EE" stroke-width="1" stroke-dasharray="3 3"/><line x1="4" x2="96" y1="${y(80)}" y2="${y(80)}" stroke="#D9C2E4" stroke-width="1.4"/></svg>`);
    ctx.stage.appendChild(pad);
    ctx.prompt = ctx.speakLines.traceDoor;
    await ctx.speak(ctx.boardLine);
    ctx.speak(ctx.prompt);
    let tracer;
    await new Promise(done => { tracer = createTracer(pad, key, { guideOpacity, width: key.length === 1 ? 10 : 6, onComplete: done }); });
    cheer(ctx, pad); tick();
    if (unitOf[key]) { ctx.onSuccess(unitOf[key], 'trace'); results.push({ item: unitOf[key], type: 'trace' }); }
    await ctx.speak(ctx.boardLine);
    await praise(ctx);
    pad.style.transform = 'scale(.2) rotate(20deg)'; pad.style.opacity = '0';
    ctx.sfx('whoosh');
    await wait(800);
    tracer.destroy(); pad.remove();
  }
  return results;
}
