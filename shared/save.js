// Save state (pure; storage is injected so tests can use a fake).
// The hangul game lives on the same origin: every key here starts with 'english-island-' and nothing clears the whole storage.
export const SAVE_KEY = 'english-island-save';
export const SAVE_VERSION = 2;
export const CODE_PREFIX = 'EI1:';
const HANGUL_PREFIX = 'HG1:';

export function newIsland() {
  return { cleared: false, visited: [], days: [], mastery: {} };
}

export function defaultState() {
  return {
    version: SAVE_VERSION,
    settings: { volume: 0.8, music: true, letterNames: true, showUpper: true, excludeCharacter: null },
    usedCharacters: [],
    subjects: {
      english: { characterId: null, stage: 0, decorations: [], wearing: null, lastRewardDay: null, today: null, islands: {} },
    },
    friends: [],
    saveError: false,
  };
}

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);

function merge(base, raw) {
  if (!isObj(raw)) return base;
  const out = { ...base };
  for (const k of Object.keys(raw)) {
    if (isObj(base[k]) && isObj(raw[k])) out[k] = merge(base[k], raw[k]);
    else if (raw[k] !== undefined) out[k] = raw[k];
  }
  return out;
}

export function migrate(raw) {
  if (!isObj(raw)) throw new Error('bad-save');
  const v = Number(raw.version || 0);
  if (v > SAVE_VERSION) throw new Error('newer-save');
  const { profile, ...rest } = raw; // this game never keeps names
  const st = merge(defaultState(), rest);
  delete st.profile;
  if (st.subjects.hangul) delete st.subjects.hangul;
  // v2: letter names (A = "ay", C = "see") are on by default; turn them on once for older saves
  if (v < 2) st.settings.letterNames = true;
  st.version = SAVE_VERSION;
  for (const [n, isl] of Object.entries(st.subjects.english.islands || {})) {
    st.subjects.english.islands[n] = merge(newIsland(), isl);
  }
  return st;
}

function defaultStorage() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function loadState(storage) {
  if (storage === undefined) storage = defaultStorage();
  let txt = null;
  try { txt = storage ? storage.getItem(SAVE_KEY) : null; } catch { txt = null; }
  if (!txt) return defaultState();
  try {
    return migrate(JSON.parse(txt));
  } catch (e) {
    try { storage.setItem(SAVE_KEY + '-corrupt-' + Date.now(), txt); } catch { /* ignore */ }
    return defaultState();
  }
}

export function saveState(state, storage) {
  if (storage === undefined) storage = defaultStorage();
  try {
    const { saveError, ...rest } = state;
    storage.setItem(SAVE_KEY, JSON.stringify({ ...rest, saveError: false }));
    state.saveError = false;
    return true;
  } catch {
    state.saveError = true;
    return false;
  }
}

// "Start over": removes only this game's save key
export function clearSave(storage) {
  if (storage === undefined) storage = defaultStorage();
  try { storage.removeItem(SAVE_KEY); } catch { /* ignore */ }
}

function toB64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function fromB64(b64) {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function exportCode(state) {
  const { saveError, ...rest } = state;
  return CODE_PREFIX + toB64(JSON.stringify(rest));
}

export function importCode(code) {
  const c = String(code ?? '').trim();
  if (c.startsWith(HANGUL_PREFIX)) throw new Error('hangul-code');
  if (!c.startsWith(CODE_PREFIX)) throw new Error('bad-code');
  let obj;
  try { obj = JSON.parse(fromB64(c.slice(CODE_PREFIX.length).replace(/\s+/g, ''))); } catch { throw new Error('bad-code'); }
  try { return migrate(obj); } catch (e) { if (e.message === 'newer-save') throw e; throw new Error('bad-code'); }
}
