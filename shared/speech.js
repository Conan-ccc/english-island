// Speech: prepared free AI voice clips (assets/voice/<hash>.mp3) through Web Audio.
// speak() takes one token or an array of tokens and plays them in order, e.g. ['en:sound:s', '열매를 따볼까?'].
// Each piece falls back on its own to the iPad's built-in voice in its language (English pieces in English).
import { voiceHash, LINES, SUFFIXES } from './voice-keys.js';
import { VOICE_FILES } from './voice-index.js';
import { audioContext, outputNode } from './fx.js';
import { parseToken } from './english.js';
import { LETTERS } from './curriculum.js';
import { SOUND_MODE } from './en-voice.js';

export const PHRASES = { ...SUFFIXES, tryAgain: LINES.tryAgain, great: LINES.great, soon: LINES.soon, cleared: LINES.cleared };
export function phrase(key) { return PHRASES[key] || ''; }

// Parent's choice per letter on tools/voice-check.html: 1..3 = sound candidate, 'word' = say the keyword instead
export const CHOICE_KEY = 'english-island-sound-choice';
let choices = null;
export function soundChoices() {
  if (choices) return choices;
  try { choices = JSON.parse(globalThis.localStorage?.getItem(CHOICE_KEY) || '{}') || {}; } catch { choices = {}; }
  return choices;
}
export function setSoundChoice(letter, value) {
  const c = { ...soundChoices() };
  if (value === 1 || value === '1' || value == null) delete c[letter]; else c[letter] = value === 'word' ? 'word' : Number(value);
  choices = c;
  try { globalThis.localStorage?.setItem(CHOICE_KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

// The clip token actually played for a piece (sound tokens follow SOUND_MODE and the parent's choice)
export function resolvePiece(piece, ch = soundChoices()) {
  const p = parseToken(piece);
  if (p.kind !== 'sound') return String(piece).trim();
  const c = ch[p.value];
  if (c === 'word' || (SOUND_MODE[p.value] === 'word' && !c)) return 'en:' + LETTERS[p.value].keyword;
  if (c === 2 || c === 3) return `en:soundcand:${p.value}:${c}`;
  return String(piece).trim();
}

// Text for the built-in voice. A letter sound is never read as a letter (the iPad would say "ess"): the keyword is said instead.
export function ttsText(piece) {
  const p = parseToken(piece);
  if (p.kind === 'sound' || p.kind === 'soundcand') return { lang: 'en', text: LETTERS[p.value]?.keyword || '' };
  if (p.kind === 'name') return { lang: 'en', text: p.value };
  return { lang: p.lang, text: p.value };
}

export const pieces = x => (Array.isArray(x) ? x : [x]).map(t => String(t ?? '').trim()).filter(Boolean);

let volume = 0.8;
export function setSpeechVolume(v) { volume = Math.max(0, Math.min(1, Number(v))); }

const base = (() => { try { return new URL('../assets/voice/', import.meta.url).href; } catch { return 'assets/voice/'; } })();
export const hasClip = token => VOICE_FILES.has(voiceHash(token));

const buffers = new Map();
function loadClip(token) {
  const h = voiceHash(token);
  if (!buffers.has(h)) {
    const ctx = audioContext();
    const p = ctx ? fetch(base + h + '.mp3').then(r => { if (!r.ok) throw new Error('nofile'); return r.arrayBuffer(); }).then(b => ctx.decodeAudioData(b)) : Promise.reject(new Error('noaudio'));
    buffers.set(h, p);
    p.catch(() => buffers.delete(h));
  }
  return buffers.get(h);
}
export function preloadSpeech(list) { for (const t of list.flatMap(pieces)) { const r = resolvePiece(t); if (hasClip(r)) loadClip(r).catch(() => {}); } }

let current = null;
let token = 0;
function stopCurrent() {
  token++;
  if (current) { try { current.stop(); } catch { /* ignore */ } current = null; }
  try { globalThis.speechSynthesis?.cancel(); } catch { /* ignore */ }
}
export function stopSpeech() { stopCurrent(); }

async function playClip(piece, my) {
  const ctx = audioContext();
  if (!ctx) return false;
  // resume() can stay pending forever without a user gesture: never wait on it for long
  if (ctx.state === 'suspended') { try { await Promise.race([ctx.resume(), new Promise(r => setTimeout(r, 300))]); } catch { /* ignore */ } }
  if (ctx.state !== 'running') return false;
  let buf;
  try { buf = await loadClip(piece); } catch { return false; }
  if (my !== token) return true;
  await new Promise(res => {
    const src = ctx.createBufferSource(); const g = ctx.createGain();
    g.gain.value = Math.max(0.0001, volume * 1.25);
    src.buffer = buf; src.connect(g); g.connect(outputNode() || ctx.destination);
    src.onended = res; current = src; src.start();
    setTimeout(res, buf.duration * 1000 + 400);
  });
  return true;
}

function synth() { return globalThis.speechSynthesis || null; }
const voices = { ko: null, en: null };
function pickVoice(lang) {
  const s = synth(); if (!s || !s.getVoices) return null;
  const all = s.getVoices();
  if (lang === 'en') {
    const us = all.filter(v => /^en[-_]US/i.test(v.lang)), en = all.filter(v => /^en/i.test(v.lang));
    return us.find(v => /enhanced|premium/i.test(v.name)) || us.find(v => v.default) || us[0] || en[0] || null;
  }
  const vs = all.filter(v => /^ko/i.test(v.lang));
  return vs.find(v => /enhanced|premium|고품질/i.test(v.name)) || vs.find(v => v.default) || vs.find(v => v.localService) || vs[0] || null;
}
export function unlockSpeech() {
  const s = synth(); if (!s || typeof SpeechSynthesisUtterance === 'undefined') return;
  try {
    const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'ko-KR'; s.speak(u);
    voices.ko = pickVoice('ko'); voices.en = pickVoice('en');
    s.addEventListener?.('voiceschanged', () => { voices.ko = pickVoice('ko'); voices.en = pickVoice('en'); });
  } catch { /* ignore */ }
}
function tts({ lang, text }, opts, my) {
  const s = synth();
  if (!text || !s || typeof SpeechSynthesisUtterance === 'undefined') return Promise.resolve(false);
  return new Promise(resolve => {
    let done = false;
    const finish = ok => { if (!done) { done = true; clearTimeout(timer); resolve(ok); } };
    const timer = setTimeout(() => finish(false), Math.max(3000, String(text).length * 400));
    try {
      const u = new SpeechSynthesisUtterance(String(text));
      if (lang === 'en') { u.lang = 'en-US'; u.rate = 0.8; u.pitch = 1; } else { u.lang = 'ko-KR'; u.rate = opts.rate ?? 0.85; u.pitch = opts.pitch ?? 1.1; }
      u.volume = volume;
      if (!voices[lang]) voices[lang] = pickVoice(lang);
      if (voices[lang]) u.voice = voices[lang];
      u.onend = () => finish(my === token); u.onerror = () => finish(false);
      s.speak(u);
    } catch { finish(false); }
  });
}

// Resolves true when every piece was spoken, false when some piece could not be played at all.
export async function speak(x, opts = {}) {
  const list = pieces(x);
  if (!list.length) return false;
  stopCurrent();
  const my = token;
  let all = true;
  for (let i = 0; i < list.length; i++) {
    const piece = resolvePiece(list[i]);
    let ok = hasClip(piece) && await playClip(piece, my);
    if (my !== token) return true;
    if (!ok) ok = await tts(ttsText(piece), opts, my);
    if (my !== token) return true;
    if (!ok) all = false;
    if (i < list.length - 1) await new Promise(r => setTimeout(r, 90));
  }
  return all;
}
