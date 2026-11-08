// Sound effects (Kenney CC0 samples), background music (CC0) and particle bursts.
let ctx = null, master = null, sfxGain = null, musicGain = null;
let vol = 0.8, musicOn = true;

export function audioContext() {
  if (ctx) return ctx;
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = vol; master.connect(ctx.destination);
  sfxGain = ctx.createGain(); sfxGain.gain.value = 0.7; sfxGain.connect(master);
  musicGain = ctx.createGain(); musicGain.gain.value = musicOn ? 0.16 : 0; musicGain.connect(master);
  // iPad suspends audio when the app goes to the background; resume on the next touch
  globalThis.document?.addEventListener('visibilitychange', () => { if (!document.hidden && ctx.state !== 'running') ctx.resume().catch(() => {}); });
  globalThis.document?.addEventListener('pointerdown', () => { if (ctx.state !== 'running') ctx.resume().catch(() => {}); }, { capture: true });
  return ctx;
}
export function outputNode() { return master; }

export function unlockAudio() {
  const c = audioContext(); if (c && c.state !== 'running') c.resume().catch(() => {});
  if (c) { const b = c.createBuffer(1, 1, 22050); const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(); }
}

export function setVolume(v) { vol = Math.max(0, Math.min(1, Number(v))); if (master) master.gain.value = vol; }
export function setMusic(on) { musicOn = !!on; if (musicGain) musicGain.gain.value = musicOn ? 0.16 : 0; }

const base = (() => { try { return new URL('../assets/', import.meta.url).href; } catch { return 'assets/'; } })();
const cache = new Map();
function load(path) {
  const c = audioContext(); if (!c) return Promise.reject(new Error('noaudio'));
  if (!cache.has(path)) {
    const p = fetch(base + path).then(r => { if (!r.ok) throw new Error('nofile'); return r.arrayBuffer(); }).then(b => c.decodeAudioData(b));
    cache.set(path, p); p.catch(() => cache.delete(path));
  }
  return cache.get(path);
}
export const SFX_NAMES = ['pop', 'boing', 'sparkle', 'whoosh', 'fanfare', 'giggle', 'snap', 'success', 'tap'];
export function preloadSfx() { for (const n of SFX_NAMES) load(`sfx/${n}.mp3`).catch(() => {}); }

export function playSfx(name) {
  const c = audioContext(); if (!c) return;
  load(`sfx/${name}.mp3`).then(buf => {
    const s = c.createBufferSource(); s.buffer = buf;
    if (name === 'giggle') s.playbackRate.value = 1.25;
    s.connect(sfxGain); s.start();
  }).catch(() => {});
}

let musicSrc = null, musicName = null;
export function playMusic(name = 'music/home.mp3') {
  const c = audioContext(); if (!c || musicName === name) return;
  musicName = name;
  load(name.includes('/') ? name : `music/${name}.mp3`).then(buf => {
    if (musicName !== name) return;
    if (musicSrc) { try { musicSrc.stop(); } catch { /* ignore */ } }
    const s = c.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(musicGain); s.start(); musicSrc = s;
  }).catch(() => {});
}
export function stopMusic() { musicName = null; if (musicSrc) { try { musicSrc.stop(); } catch { /* ignore */ } musicSrc = null; } }

const HEART = '<svg viewBox="-10 -2 20 18" width="30" height="28"><path d="M0 4 C-6 -2 -12 2 -8 8 L0 15 L8 8 C12 2 6 -2 0 4Z" fill="#FF8FB1"/></svg>';
const STAR = '<svg viewBox="-12 -12 24 24" width="28" height="28"><path d="M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3Z" fill="#FFD84D"/></svg>';

export function burst(x, y, kind = 'hearts') {
  const doc = globalThis.document; if (!doc) return;
  const n = 12;
  for (let i = 0; i < n; i++) {
    const el = doc.createElement('div');
    el.className = 'fx-particle';
    el.innerHTML = kind === 'stars' ? STAR : HEART;
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const d = 60 + Math.random() * 60;
    el.style.cssText = `position:fixed;left:${x - 14}px;top:${y - 14}px;pointer-events:none;z-index:9999;transition:transform .9s cubic-bezier(.2,.8,.3,1),opacity .9s ease-out;`;
    doc.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(${Math.cos(a) * d}px,${Math.sin(a) * d - 30}px) scale(${0.6 + Math.random() * 0.7}) rotate(${Math.random() * 180}deg)`;
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 950);
  }
}
