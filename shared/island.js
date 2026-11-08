// Island engine: theme map, mission bar (what is left), "go here next" markers, varied activities
import { loadState, saveState, newIsland } from './save.js';
import { recordSuccess, markVisit, islandProgress, isMastered, MASTERY_COUNT, MASTERY_TYPES } from './mastery.js';
import { charHtml, DECORATIONS } from './characters.js';
import { speak, phrase, unlockSpeech, setSpeechVolume, stopSpeech, preloadSpeech } from './speech.js';
import { playSfx, burst, unlockAudio, setVolume, setMusic, playMusic, preloadSfx } from './fx.js';
import { attachPetting } from './pet.js';
import { LINES } from './voice-keys.js';
import { ISLANDS, unitOf, unitLine, homeIsland } from './curriculum.js';
import { SOUND_MODE, EN_LINES } from './en-voice.js';
import { buildMechs, islandUnits, creditable } from './island-content.js';
import { themeOf, MECH_TYPE } from './themes.js';
import { el, wait, asset, tokenHtml } from './activities/common.js';
import * as fruit from './activities/fruit.js';
import * as bridge from './activities/bridge.js';
import * as gift from './activities/gift.js';
import * as door from './activities/door.js';
import * as find from './activities/find.js';
import * as rise from './activities/rise.js';
import * as pairs from './activities/pairs.js';

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const RUNNERS = { fruit, bridge, gift, door, find, rise, pairs };
const FALLBACK_SPOTS = [[22, 25], [50, 15], [82, 32], [80, 72], [30, 70], [62, 60]];
const HOME_ICON = '<svg viewBox="0 0 60 60" width="48" height="48"><path d="M8 30 L30 10 L52 30 V52 H8Z" fill="#DCEBFF" stroke="#8EC5FF" stroke-width="3"/><rect x="24" y="36" width="12" height="16" fill="#8EC5FF"/></svg>';
const BACK_ICON = '<svg viewBox="0 0 60 60" width="52" height="52"><circle cx="30" cy="30" r="26" fill="#fff"/><path d="M34 18 L20 30 L34 42" stroke="#C98AA8" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW = '<svg viewBox="0 0 60 70" width="64" height="74"><path d="M30 66 L6 34 H20 V4 H40 V34 H54Z" fill="#FF6FA5" stroke="#fff" stroke-width="5" stroke-linejoin="round"/></svg>';
const CHECK = '<svg viewBox="0 0 40 40" width="46" height="46"><circle cx="20" cy="20" r="18" fill="#5DBB6A" stroke="#fff" stroke-width="3"/><path d="M11 21 L18 28 L30 13" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SPARK = '<svg viewBox="0 0 40 40" width="46" height="46"><circle cx="20" cy="20" r="18" fill="#FFD84D" stroke="#fff" stroke-width="3"/><path d="M20 8 L23 17 L32 20 L23 23 L20 32 L17 23 L8 20 L17 17Z" fill="#fff"/></svg>';
const CROWN = '<svg viewBox="0 0 40 30" width="30" height="22"><path d="M3 26 L6 8 L14 16 L20 4 L26 16 L34 8 L37 26Z" fill="#FFC93C" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg>';

// 0..1 progress of one letter: successes count, but a second kind of play is needed to finish
export function unitScore(island, key) {
  const m = island.mastery[key];
  if (!m) return 0;
  if (isMastered(island, key)) return 1;
  const c = Math.min(m.count, MASTERY_COUNT) / MASTERY_COUNT;
  return Math.min(0.9, c * (m.types.length >= MASTERY_TYPES ? 1 : 0.75));
}

// How many unfinished letters a place can still help with (0 = nothing left there)
export function placeNeed(island, units, creditableUnits, type) {
  let need = 0;
  for (const u of units) {
    if (isMastered(island, u) || !creditableUnits.includes(u)) continue;
    const m = island.mastery[u] || { count: 0, types: [] };
    if (!m.types.includes(type)) need += 2; else if (m.count < MASTERY_COUNT) need += 1;
  }
  return need;
}

export async function startIsland(n) {
  const state = loadState();
  const H = state.subjects.english;
  if (!H.characterId) { location.href = '../index.html'; return; }
  const key = String(n);
  if (!H.islands[key]) H.islands[key] = newIsland();
  const island = H.islands[key];
  if (!H.today || H.today.day !== today()) H.today = { day: today(), places: [] };
  saveState(state);
  setVolume(state.settings.volume); setSpeechVolume(state.settings.volume); setMusic(state.settings.music !== false);
  const theme = themeOf(n);
  const app = document.getElementById('app');
  let spots = {};
  // never wait long for positions (weak network): fall back after 2.5 s
  try { spots = await Promise.race([fetch(asset(theme.spots)).then(r => r.json()), new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 2500))]); } catch { /* fallback below */ }
  theme.places.forEach((p, i) => { if (!spots[p.id]) spots[p.id] = FALLBACK_SPOTS[i % FALLBACK_SPOTS.length]; });
  if (!spots.start) spots.start = [52, 48];
  const units = islandUnits(n);
  const kind = ISLANDS[n].kind;
  const lineOf = u => unitLine(unitOf(u, kind), state.settings, SOUND_MODE);
  const mechs = buildMechs(n, island, state.settings, Math.random, H.islands);
  const credit = Object.fromEntries(theme.places.map(p => [p.id, creditable(n, p.mech)]));
  let busy = false, unlocked = false;
  preloadSfx();
  preloadSpeech([...Object.values(LINES), ...EN_LINES.good, EN_LINES.hello, EN_LINES.bye, ...units.map(lineOf)]);

  const ensureUnlocked = () => {
    if (unlocked) return;
    unlocked = true; unlockSpeech(); unlockAudio(); playMusic(theme.music);
    speak([EN_LINES.hello, island.cleared ? LINES.allDone : LINES.welcome]);
  };

  const needOf = p => placeNeed(island, units, credit[p.id], MECH_TYPE[p.mech]);

  function missionBar() {
    const done = units.filter(u => isMastered(island, u)).length;
    return `<div class="mission" style="position:absolute;top:12px;left:50%;translate:-50% 0;z-index:7;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.88);padding:8px 16px;border-radius:26px;box-shadow:0 8px 18px rgba(60,40,80,.18);max-width:80vw;flex-wrap:wrap;justify-content:center">
      ${units.map(u => {
        const s = unitScore(island, u), full = s >= 1;
        return `<button class="unit" data-u="${u.replace(/"/g, '')}" style="position:relative;border:none;min-width:58px;height:58px;padding:0 8px;border-radius:29px;font-size:34px;font-weight:800;color:${full ? '#7A4A00' : '#4A3A48'};background:${full ? 'radial-gradient(circle at 35% 30%,#FFF6C2,#FFC93C)' : `conic-gradient(#FF8FB1 ${Math.round(s * 360)}deg,#EEE6F2 0)`};box-shadow:inset 0 0 0 5px #fff">${full ? `<span style="position:absolute;top:-14px;left:50%;translate:-50% 0">${CROWN}</span>` : ''}<span style="position:relative">${kind === 'letter' ? tokenHtml(u, 34) : `<img src="${asset(unitOf(u, kind).pic)}" alt="" style="height:42px;width:42px;object-fit:contain;display:block">`}</span></button>`;
      }).join('')}
      <span style="font-size:15px;color:#8a7a88;white-space:nowrap">${done} / ${units.length}</span>
    </div>`;
  }

  function renderMap() {
    const needs = Object.fromEntries(theme.places.map(p => [p.id, needOf(p)]));
    const notToday = theme.places.filter(p => !H.today.places.includes(p.id));
    const best = [...theme.places].sort((a, b) => (needs[b.id] - needs[a.id]) || ((notToday.includes(b) ? 1 : 0) - (notToday.includes(a) ? 1 : 0)))[0];
    const showBest = best && needs[best.id] > 0;
    app.innerHTML = `<div class="imap" style="position:absolute;left:50%;top:50%;width:max(100vw,160vh);height:max(62.5vw,100vh);translate:-50% -50%;overflow:hidden">
        <div class="scene-bg" style="background-image:url(${asset(theme.map)});animation-duration:40s"></div>
        <div class="cloudshade" style="top:6%"></div><div class="cloudshade" style="top:50%;animation-delay:-15s;animation-duration:40s"></div>
        ${theme.places.map(p => {
          const [x, y] = spots[p.id];
          const need = needs[p.id];
          return `<div class="place" data-id="${p.id}" style="position:absolute;left:${x}%;top:${y}%;width:15%;aspect-ratio:1;translate:-50% -50%;border-radius:50%;cursor:pointer">
            ${need > 0 ? '<div class="ring"></div>' : ''}
            <div style="position:absolute;right:4%;top:2%;pointer-events:none" class="${need > 0 ? 'tw' : ''}">${need > 0 ? SPARK : CHECK}</div>
            ${showBest && p.id === best.id ? (y < 30
              ? `<div class="arrow" style="position:absolute;left:50%;bottom:-48%;translate:-50% 0;pointer-events:none"><div style="rotate:180deg">${ARROW}</div></div>`
              : `<div class="arrow" style="position:absolute;left:50%;top:-38%;translate:-50% 0;pointer-events:none">${ARROW}</div>`) : ''}</div>`;
        }).join('')}
        <div class="walker" style="position:absolute;width:9%;left:${spots.start[0]}%;top:${spots.start[1]}%;translate:-50% -88%;z-index:5">${charHtml(H.characterId, H.stage, { decoration: H.wearing })}</div>
      </div>
      ${missionBar()}
      ${island.cleared ? `<div style="position:absolute;bottom:16px;left:50%;translate:-50% 0;z-index:7;background:rgba(255,246,194,.95);border-radius:24px;padding:8px 18px;font-size:20px;font-weight:700;color:#7A4A00;display:flex;align-items:center;gap:8px">${CROWN} 다 했어요!</div>` : ''}
      <button class="btn-pic home-btn" style="position:absolute;top:14px;left:14px;z-index:8" aria-label="집">${HOME_ICON}</button>`;
    const map = app.querySelector('.imap'), walker = app.querySelector('.walker');
    for (let i = 0; i < 14; i++) map.appendChild(el('div', `left:${Math.random() * 100}%;top:${Math.random() < .5 ? Math.random() * 18 : 78 + Math.random() * 20}%;animation-delay:${-Math.random() * 2.4}s`, '', 'glint'));
    app.querySelector('.arrow')?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-16px)' }, { transform: 'translateY(0)' }], { duration: 900, iterations: Infinity });
    attachPetting(walker, {
      onTap: () => { ensureUnlocked(); walker.classList.remove('boing'); void walker.offsetWidth; walker.classList.add('boing'); playSfx('giggle'); },
      onRub: p => { burst(p.x, p.y, 'hearts'); playSfx('sparkle'); },
      onHold: () => { walker.classList.add('hug'); playSfx('giggle'); speak(LINES.love); setTimeout(() => walker.classList.remove('hug'), 900); },
    });
    app.querySelectorAll('.unit').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); ensureUnlocked(); speak(lineOf(b.dataset.u)); }));
    app.querySelector('.home-btn').addEventListener('click', () => { speak(EN_LINES.bye); setTimeout(() => { location.href = '../index.html'; }, 700); });
    map.addEventListener('click', async e => {
      ensureUnlocked();
      if (busy || walker.contains(e.target)) return;
      const r = map.getBoundingClientRect();
      const g = e.target.closest('.place');
      const tx = g ? spots[g.dataset.id][0] : ((e.clientX - r.left) / r.width) * 100;
      const ty = g ? spots[g.dataset.id][1] + 4 : ((e.clientY - r.top) / r.height) * 100;
      const cx = parseFloat(walker.style.left), cy = parseFloat(walker.style.top);
      const ms = Math.max(350, Math.hypot((tx - cx) * r.width / 100, (ty - cy) * r.height / 100) * 4);
      busy = true;
      walker.style.transition = `left ${ms}ms linear, top ${ms}ms linear`;
      walker.style.left = tx + '%'; walker.style.top = ty + '%';
      walker.classList.add('walking'); playSfx('pop');
      await wait(ms);
      walker.classList.remove('walking');
      busy = false;
      if (g) openPlace(g.dataset.id);
    });
  }

  // review questions from earlier islands count on the island the unit belongs to
  function onSuccess(item, type) {
    const home = homeIsland(item, n);
    if (home === null) return;
    const key = String(home);
    if (!H.islands[key]) H.islands[key] = newIsland();
    const rec = H.islands[key];
    const newly = recordSuccess(rec, item, type);
    rec.mastery[item].lastAt = Date.now();
    saveState(state);
    if (newly) playSfx('fanfare');
  }

  async function giveReward() {
    if (H.lastRewardDay === today()) return;
    const left = DECORATIONS.filter(d => !H.decorations.includes(d.id));
    H.lastRewardDay = today();
    if (!left.length) { saveState(state); return; }
    const d = left[Math.floor(Math.random() * left.length)];
    H.decorations.push(d.id); H.wearing = d.id;
    saveState(state);
    const ov = el('div', 'background:radial-gradient(circle,#FFF8D6,#FFE3F0);display:flex;align-items:center;justify-content:center', `<div style="width:min(36vw,52vh)">${charHtml(H.characterId, H.stage, { decoration: d.id })}</div>`, 'overlay reward');
    document.body.appendChild(ov);
    const r = ov.firstElementChild.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 3, 'stars'); playSfx('fanfare');
    await speak(LINES.present);
    await wait(1200);
    ov.remove();
  }

  async function openPlace(id) {
    const place = theme.places.find(p => p.id === id);
    if (!place || !RUNNERS[place.mech]) return;
    markVisit(island, id, today());
    if (!H.today.places.includes(id)) H.today.places.push(id);
    saveState(state);
    const stage = el('div', 'background:#fff;overflow:hidden', '', 'overlay stage');
    document.body.appendChild(stage);
    const inner = el('div', 'position:absolute;inset:0');
    stage.appendChild(inner);
    const back = el('button', 'position:absolute;top:14px;left:14px;z-index:20;background:none;box-shadow:none', BACK_ICON, 'btn-pic back-btn');
    stage.appendChild(back);
    let closed = false;
    const closedP = new Promise(res => back.addEventListener('click', () => { closed = true; res('closed'); }));
    const ctx = {
      stage: inner, phrase, sfx: playSfx, burst, rng: Math.random, speakLines: LINES, skin: place.skin || {}, settings: state.settings,
      speak: t => (closed ? Promise.resolve(true) : speak(t)),
      characterHtml: charHtml(H.characterId, H.stage, { decoration: H.wearing }), onSuccess,
    };
    const outcome = await Promise.race([RUNNERS[place.mech].run(ctx, mechs[place.mech]()).then(() => 'done').catch(err => { console.error(err); return 'error'; }), closedP]);
    stopSpeech();
    stage.remove();
    if (outcome === 'done') await giveReward();
    const pr = islandProgress(island, units, []);
    if (pr.cleared && !island.cleared) return clearIsland();
    renderMap();
  }

  async function clearIsland() {
    const from = H.stage, to = Math.min(H.stage + 1, 7);
    island.cleared = true; H.stage = to;
    if (n === 8 && !state.friends.some(f => f.characterId === H.characterId && f.subject === 'english')) state.friends.push({ characterId: H.characterId, subject: 'english', finishedAt: today() });
    saveState(state);
    playSfx('fanfare');
    await speak(LINES.cleared);
    location.href = `../index.html?evolve=${from}-${to}`;
  }

  window.__island = { state, island, openPlace, units, theme, title: ISLANDS[n].title };
  renderMap();
}
