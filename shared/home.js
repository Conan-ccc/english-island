// Home: start, character birth (no names asked), illustrated sea map, decorations, friend room
import { AVAILABLE_ISLANDS, ISLAND_COUNT } from './config.js';
import { loadState, saveState } from './save.js';
import { charHtml, pickCharacter } from './characters.js';
import { unlockSpeech, speak, setSpeechVolume } from './speech.js';
import { playSfx, burst, unlockAudio, setVolume, setMusic, playMusic, preloadSfx } from './fx.js';
import { attachPetting } from './pet.js';
import { installParentGate, openParentPanel } from './parent.js';
import { playEvolution } from './evolve.js';
import { LINES } from './voice-keys.js';
import { HOME_MUSIC } from './themes.js';
import { islandUnits } from './island-content.js';
import { isMastered } from './mastery.js';

const state = loadState();
const app = document.getElementById('app');
const H = () => state.subjects.english;
const save = () => saveState(state);
const wait = ms => new Promise(r => setTimeout(r, ms));
const ASSETS = new URL('../assets/', import.meta.url).href;
const applySound = () => { setVolume(state.settings.volume); setSpeechVolume(state.settings.volume); setMusic(state.settings.music !== false); };
applySound();

let ISL = [[18, 77], [35, 63], [46, 49], [66, 44], [57, 26], [80, 31], [76, 17], [89, 12]];
const mapReady = fetch(ASSETS + 'bg/home.json').then(r => r.json()).then(j => { if (j.islands?.length === 8) ISL = j.islands; }).catch(() => {});

// every island is open from the start (user decision 2026-10-30); clearing still grows the character
function islandOpen() { return true; }
function islandDone(n) {
  const isl = H().islands[String(n)];
  const units = islandUnits(n);
  const done = isl ? units.filter(u => isMastered(isl, u)).length : 0;
  return { done, total: units.length, cleared: !!isl?.cleared };
}

const PLAY_ICON = '<svg viewBox="0 0 100 100" width="160" height="160"><defs><radialGradient id="pg" cx="35%" cy="30%"><stop offset="0" stop-color="#FFC9DE"/><stop offset="1" stop-color="#FF6FA5"/></radialGradient></defs><circle cx="50" cy="52" r="44" fill="#E05A8C"/><circle cx="50" cy="48" r="44" fill="url(#pg)"/><circle cx="50" cy="48" r="44" fill="none" stroke="#fff" stroke-width="4"/><path d="M41 30 L71 48 L41 66Z" fill="#fff"/></svg>';
const BAG_ICON = '<svg viewBox="0 0 60 60" width="56" height="56"><path d="M14 22 h32 l4 30 h-40Z" fill="#FFB8D9" stroke="#F58FB4" stroke-width="2"/><path d="M22 22 q0-12 8-12 q8 0 8 12" fill="none" stroke="#F58FB4" stroke-width="3"/><circle cx="30" cy="36" r="5" fill="#FFE27A"/></svg>';
const ROOM_ICON = '<svg viewBox="0 0 60 60" width="56" height="56"><path d="M8 28 L30 10 L52 28 V52 H8Z" fill="#FFE7B8" stroke="#E8B04A" stroke-width="2"/><path d="M24 52 V38 h12 v14" fill="#FFB27A"/><path d="M30 24 c-3-4-9-1-6 4 l6 5 l6-5 c3-5-3-8-6-4Z" fill="#FF6FA5"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 40 40" width="44" height="44"><circle cx="20" cy="20" r="18" fill="#fff"/><path d="M13 13 L27 27 M27 13 L13 27" stroke="#C98AA8" stroke-width="4" stroke-linecap="round"/></svg>';
const LOCK = '<svg viewBox="0 0 40 40" width="44" height="44"><rect x="8" y="18" width="24" height="18" rx="5" fill="#fff" opacity=".92"/><path d="M13 18 v-5 a7 7 0 0 1 14 0 v5" stroke="#fff" stroke-width="4" fill="none" opacity=".92"/><circle cx="20" cy="27" r="3" fill="#C9B8D6"/></svg>';
const FLAG = '<svg viewBox="0 0 40 40" width="46" height="46"><path d="M10 36 V6" stroke="#8a6" stroke-width="3"/><path d="M11 6 L34 12 L11 18Z" fill="#FF6FA5"/></svg>';

const myChar = () => charHtml(H().characterId, H().stage, { decoration: H().wearing });

function renderHome() {
  const nums = [...Array(ISLAND_COUNT)].map((_, i) => i + 1);
  app.innerHTML = `<div class="hmap" style="position:absolute;left:50%;top:50%;width:max(100vw,160vh);height:max(62.5vw,100vh);translate:-50% -50%;overflow:hidden">
      <div class="scene-bg" style="background-image:url(${ASSETS}bg/home.jpg);animation-duration:40s"></div>
      <div class="cloudshade" style="top:10%"></div><div class="cloudshade" style="top:55%;animation-delay:-14s;animation-duration:42s"></div>
      ${nums.map(n => { const [x, y] = ISL[n - 1]; const prog = islandDone(n), done = prog.cleared;
        return `<div class="island" data-n="${n}" style="position:absolute;left:${x}%;top:${y}%;width:11%;aspect-ratio:1;translate:-50% -50%;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center">
          ${done ? FLAG : ''}
          <div style="position:absolute;left:50%;bottom:-14%;translate:-50% 0;width:62px;height:62px;border-radius:50%;background:conic-gradient(${done ? '#FFC93C' : '#FF8FB1'} ${Math.round(prog.done / Math.max(1, prog.total) * 360)}deg,rgba(255,255,255,.75) 0);box-shadow:0 4px 10px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center"><div style="width:46px;height:46px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#FF6FA5">${n}</div></div></div>`; }).join('')}
    </div>
    <div class="home-char" style="position:absolute;left:47%;bottom:1%;width:min(15vw,22vh);z-index:5">${myChar()}</div>
    <div style="position:absolute;right:16px;bottom:16px;display:flex;gap:14px;z-index:6">
      <button class="btn-pic bag-btn" aria-label="장식">${BAG_ICON}</button>
      <button class="btn-pic room-btn" aria-label="친구 방">${ROOM_ICON}</button>
    </div>`;
  const map = app.querySelector('.hmap');
  for (let i = 0; i < 18; i++) map.insertAdjacentHTML('beforeend', `<div class="glint" style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${-Math.random() * 2.4}s"></div>`);
  const ch = app.querySelector('.home-char');
  const bounce = cls => { ch.classList.remove('boing', 'hug', 'wiggle'); void ch.offsetWidth; ch.classList.add(cls); };
  attachPetting(ch, {
    onTap: () => { bounce('boing'); playSfx('giggle'); },
    onRub: p => { burst(p.x, p.y, 'hearts'); playSfx('sparkle'); },
    onHold: () => { bounce('hug'); playSfx('giggle'); speak(LINES.love); },
  });
  app.querySelectorAll('.island').forEach(g => g.addEventListener('click', () => {
    const n = Number(g.dataset.n);
    if (!islandOpen(n) || !AVAILABLE_ISLANDS.includes(n)) { bounce('wiggle'); speak(LINES.soon); return; }
    playSfx('whoosh');
    ch.classList.add('walking');
    setTimeout(() => { location.href = `english/island${n}.html`; }, 350);
  }));
  app.querySelector('.bag-btn').addEventListener('click', openBag);
  app.querySelector('.room-btn').addEventListener('click', openRoom);
}

function overlay(inner, bg = 'rgba(255,245,250,.96)') {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.style.cssText = `background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px`;
  ov.innerHTML = `<button class="btn-pic ov-close" style="position:absolute;top:16px;left:16px;background:none;box-shadow:none">${CLOSE_ICON}</button>${inner}`;
  ov.querySelector('.ov-close').addEventListener('click', () => { ov.remove(); renderHome(); });
  document.body.appendChild(ov);
  return ov;
}

function openBag() {
  playSfx('pop');
  const owned = H().decorations;
  const items = owned.length ? owned.map(id => `<button class="btn-pic deco-btn" data-id="${String(id).replace(/[^a-z-]/g, '')}" style="width:150px;height:170px;${H().wearing === id ? 'outline:4px solid #FFD84D' : ''}"><div style="width:130px">${charHtml(H().characterId, H().stage, { decoration: id })}</div></button>`).join('')
    : `<div style="width:220px;opacity:.6">${myChar()}</div>`;
  const ov = overlay(`<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:90vw">${items}</div>`);
  if (!owned.length) speak(LINES.bagEmpty);
  ov.addEventListener('click', e => {
    const b = e.target.closest('.deco-btn'); if (!b) return;
    H().wearing = H().wearing === b.dataset.id ? null : b.dataset.id;
    save(); playSfx('sparkle');
    ov.querySelectorAll('.deco-btn').forEach(x => { x.style.outline = H().wearing === x.dataset.id ? '4px solid #FFD84D' : 'none'; });
  });
}

function openRoom() {
  playSfx('pop'); playMusic('music/calm.mp3');
  const fr = state.friends;
  const cushion = inner => `<div style="width:180px;text-align:center"><div class="room-friend" style="width:160px;margin:0 auto;min-height:160px">${inner}</div><svg viewBox="0 0 160 40" width="180"><ellipse cx="80" cy="20" rx="76" ry="16" fill="#FFB8D9"/><ellipse cx="80" cy="16" rx="66" ry="10" fill="#FFD3E8"/></svg></div>`;
  const list = fr.length ? fr.map(f => cushion(charHtml(f.characterId, 7))).join('') : cushion('') + cushion('') + cushion('');
  const ov = overlay(`<div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:center;align-items:end">${list}</div>`, 'linear-gradient(#FFF0F7,#FFE3F0)');
  ov.querySelector('.ov-close').addEventListener('click', () => playMusic(HOME_MUSIC));
  if (!fr.length) speak(LINES.roomEmpty);
  ov.querySelectorAll('.room-friend').forEach(el => { if (el.innerHTML) attachPetting(el, { onTap: () => { el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing'); playSfx('giggle'); } }); });
}

async function birth() {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.style.cssText = 'background:radial-gradient(circle,#FFF8D6,#FFE3F0);display:flex;align-items:center;justify-content:center';
  ov.innerHTML = `<div class="gift" style="width:min(36vw,44vh);cursor:pointer"><img src="${ASSETS}pic/giftbox.webp" alt="" style="width:100%;display:block;pointer-events:none"></div>`;
  document.body.appendChild(ov);
  speak(LINES.giftBox);
  const gift = ov.querySelector('.gift');
  let taps = 0;
  await new Promise(res => gift.addEventListener('click', () => {
    taps += 1; playSfx('pop');
    gift.classList.remove('wiggle'); void gift.offsetWidth; gift.classList.add('wiggle');
    if (taps >= 3) res();
  }));
  // the parent can name the hangul-island friend so this game hatches a different one
  const skip = [...state.usedCharacters, state.settings.excludeCharacter].filter(Boolean);
  const id = pickCharacter(skip);
  H().characterId = id; H().stage = 0;
  if (!state.usedCharacters.includes(id)) state.usedCharacters.push(id);
  save();
  gift.style.transition = 'transform .5s, opacity .5s'; gift.style.transform = 'scale(1.4)'; gift.style.opacity = '0';
  playSfx('sparkle');
  await wait(500);
  ov.innerHTML = `<div class="born" style="width:min(34vw,46vh)">${charHtml(id, 0)}</div>`;
  const r = ov.firstElementChild.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 'stars'); playSfx('fanfare');
  await speak(LINES.hello);
  await wait(600);
  ov.remove();
}

async function afterStart() {
  if (!H().characterId) await birth();
  await mapReady;
  playMusic(HOME_MUSIC);
  renderHome();
  const m = /evolve=(\d)-(\d)/.exec(location.search);
  if (m) {
    history.replaceState(null, '', location.pathname);
    await playEvolution(document.body, H().characterId, Number(m[1]), Number(m[2]));
    renderHome();
  }
}

function start() {
  app.innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;background:url(${ASSETS}bg/home.jpg) center/cover">
    ${H().characterId ? `<div style="width:min(26vw,34vh)">${myChar()}</div>` : ''}
    <button class="start-btn" style="border:none;background:none;padding:0" aria-label="시작">${PLAY_ICON}</button></div>`;
  app.querySelector('.start-btn').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 1400, iterations: Infinity });
  app.querySelector('.start-btn').addEventListener('click', () => {
    unlockSpeech(); unlockAudio(); preloadSfx(); playSfx('pop');
    navigator.storage?.persist?.().catch(() => {});
    if (window.__swUpdateReady) { location.reload(); return; }
    afterStart();
  }, { once: true });
}

installParentGate(() => openParentPanel(state, () => { save(); applySound(); if (!H().characterId) birth().then(renderHome); else renderHome(); }));
window.__home = { state };
start();
