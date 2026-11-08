// Helpers shared by the activities
import { isLetter } from '../english.js';
import { WORDS } from '../curriculum.js';
import { EN_LINES } from '../en-voice.js';

const ASSETS = (() => { try { return new URL('../../assets/', import.meta.url).href; } catch { return 'assets/'; } })();
export const asset = p => ASSETS + p;
export const picUrl = name => asset(`pic/${name}.webp`);
export const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function el(tag, style = '', html = '', cls = '') {
  const e = document.createElement(tag);
  if (style) e.style.cssText = style;
  if (html) e.innerHTML = html;
  if (cls) e.className = cls;
  return e;
}
export function at(e, xPct, yPct) { e.style.left = xPct + '%'; e.style.top = yPct + '%'; e.style.translate = '-50% -50%'; return e; }
export function glow(e) { if (e) e.classList.add('glow'); }
export function unglow(root) { root.querySelectorAll('.glow').forEach(x => x.classList.remove('glow')); }
export function wiggle(e) { e.classList.remove('wiggle'); void e.offsetWidth; e.classList.add('wiggle'); }
export function center(e) { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }

// What a play token looks like: a letter is a big lowercase letter, a word is its picture with the word small underneath
export function tokenHtml(t, px = 56) {
  if (isLetter(t)) return `<span class="tok-letter" style="font-size:${px}px">${esc(t)}</span>`;
  const w = WORDS[t];
  return `<span class="tok-word"><img src="${w ? asset(w.pic) : ''}" alt=""><small>${esc(t)}</small></span>`;
}
// What tapping a token says
export const tokenSay = t => (isLetter(t) ? 'en:sound:' + t : 'en:' + t);

// Scene background (illustration) with a slow drift
export function scene(ctx, name) {
  ctx.stage.innerHTML = '';
  const bg = ctx.skin?.bg ? asset(ctx.skin.bg) : asset('bg/act-' + name + '.jpg');
  ctx.stage.appendChild(el('div', `background-image:url(${bg})`, '', 'scene-bg'));
}

// Round progress: a row of dots at the top right that fill as rounds finish (the child sees how much is left)
export function progress(ctx, total) {
  ctx.stage.querySelector('.rounds')?.remove();
  const box = el('div', 'position:absolute;top:18px;right:18px;display:flex;gap:10px;z-index:8;background:rgba(255,255,255,.75);padding:8px 12px;border-radius:20px', '', 'rounds');
  const dots = Array.from({ length: total }, () => { const d = el('div', 'width:26px;height:26px;border-radius:50%;background:#E9DDF0;box-shadow:inset 0 2px 0 rgba(0,0,0,.08);transition:all .4s'); box.appendChild(d); return d; });
  ctx.stage.appendChild(box);
  let i = 0;
  return () => { const d = dots[i++]; if (d) { d.style.background = 'radial-gradient(circle at 35% 30%,#FFF3A8,#FFC93C)'; d.style.transform = 'scale(1.25)'; setTimeout(() => { d.style.transform = 'scale(1)'; }, 300); } };
}

// The child's character in the corner. Tapping it repeats the current prompt.
export function buddy(ctx, style = 'left:1%;bottom:1%;width:min(17vw,24vh)') {
  const b = el('div', `position:absolute;${style};z-index:5;cursor:pointer`, ctx.characterHtml, 'buddy');
  b.addEventListener('click', () => { wiggle(b); if (ctx.prompt) ask(ctx, ctx.prompt, ctx.promptTarget); });
  ctx.stage.appendChild(b);
  return b;
}

// Top board: "S s" + keyword picture + keyword with its first letter highlighted, or a word picture, or (listen-only) an ear
export function board(ctx, spec) {
  ctx.stage.querySelector('.board')?.remove();
  let inner = '';
  if (!spec) {
    inner = '<svg viewBox="0 0 60 60" width="90" height="90"><path d="M20 40 C8 26 16 8 32 8 C46 8 52 20 46 30 C42 36 36 36 36 44 C36 52 26 54 22 48" fill="#FFE3EC" stroke="#FF8FB1" stroke-width="4" stroke-linecap="round"/><path d="M28 28 C28 22 36 20 38 26" fill="none" stroke="#FF8FB1" stroke-width="4" stroke-linecap="round"/></svg>';
  } else {
    if (spec.letter) inner += `<div class="bbig tok-letter">${ctx.settings?.showUpper === false ? '' : `<span class="bup">${esc(spec.letter.toUpperCase())}</span>`}${esc(spec.letter)}</div>`;
    if (spec.pic) inner += `<img src="${asset(spec.pic)}" alt="">`;
    if (spec.word) {
      const w = spec.word, l = spec.letter;
      inner += `<div class="bword tok-letter">${l && w.startsWith(l) ? `<b>${esc(l)}</b>${esc(w.slice(1))}` : `<b>${esc(w)}</b>`}</div>`;
    }
  }
  const b = el('div', '', inner, 'board');
  b.addEventListener('click', () => { if (ctx.boardLine) ctx.speak(ctx.boardLine); });
  ctx.stage.appendChild(b);
  return b;
}

// Say a prompt; if speech is unavailable or fails, show the answer right away instead.
export function ask(ctx, text, target) {
  ctx.prompt = text;
  ctx.promptTarget = target;
  return Promise.resolve(ctx.speak(text)).then(ok => { if (ok === false && target && target.isConnected) glow(target); return ok; });
}

export function cheer(ctx, e) { const [x, y] = center(e); ctx.burst(x, y, 'stars'); ctx.sfx('sparkle'); }
const PRAISE = ['와, 잘했어!', '최고야!', '멋지다!', ...EN_LINES.good];
export function praise(ctx) { return ctx.speak(PRAISE[Math.floor(ctx.rng() * PRAISE.length)]); }

// A letter block (lowercase letter in the letter font)
export function jblock(text, size = 110) {
  const b = el('div', `position:absolute;left:0;top:0;width:${size}px;height:${size}px;font-size:${Math.round(size * 0.66)}px`, '', 'jblock tok-letter' + (/[aeiou]/.test(text) ? ' v' : ''));
  b.textContent = text; b.dataset.text = text;
  return b;
}
