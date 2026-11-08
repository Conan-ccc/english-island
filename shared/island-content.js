// Builds activity parameters for any island and mechanic (pure; rng injected)
import { ISLANDS, WORDS, LOOKALIKE, SAME_SOUND, earlierKeys, unitLine, unitOf, homeIsland, initialOf, initialBlankOk } from './curriculum.js';
import { isMastered, MASTERY_COUNT } from './mastery.js';
import { themeOf, MECH_TYPE } from './themes.js';
import { strokesFor } from './strokes.js';
import { SOUND_MODE } from './en-voice.js';
import { LINES, SUFFIXES } from './voice-keys.js';

const uniq = a => [...new Set(a)];
function shuffle(a, rng) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const sameSound = (a, b) => (SAME_SOUND[a] || []).includes(b);
const noRecord = { mastery: {} };

export function islandUnits(n) { return ISLANDS[n] ? ISLANDS[n].units.map(u => u.key) : []; }

// Units this activity type would help most come first: missing this type, then too few successes, then the rest.
// With 4 or more questions, one in four is a review unit (oldest success first); the returned array carries .review.
export function pickFor(island, keys, n, rng, type, review = []) {
  const m = k => island.mastery[k] || { count: 0, types: [] };
  const need = k => !isMastered(island, k) && (!m(k).types.includes(type) ? 2 : m(k).count < MASTERY_COUNT ? 1 : 0.5);
  const r = n >= 4 ? Math.min(Math.floor(n / 4), review.length) : 0;
  const rev = review.slice(0, r);
  const groups = [2, 1, 0.5, false].map(g => shuffle(keys.filter(k => !rev.includes(k) && need(k) === g), rng));
  const out = uniq(groups.flat()).slice(0, n - rev.length);
  for (const k of rev) out.splice(Math.floor(rng() * (out.length + 1)), 0, k);
  out.review = rev;
  return out;
}

// Review candidates of the same kind: earlier letter islands' letters (letter islands only) + units already mastered here,
// the one whose last success is oldest first (never practised = oldest, then curriculum order)
export function reviewCandidates(n, islands = {}) {
  const isl = ISLANDS[n];
  const here = islands[String(n)] || noRecord;
  const own = isl.units.map(u => u.key).filter(k => isMastered(here, k));
  const earlier = isl.kind === 'letter' ? earlierKeys(n) : [];
  const lastOf = k => islands[String(homeIsland(k, n))]?.mastery?.[k]?.lastAt || 0;
  return uniq([...earlier, ...own]).map((k, i) => ({ k, t: lastOf(k), i })).sort((a, b) => a.t - b.t || a.i - b.i).map(x => x.k);
}

// Whether a unit may appear in this mechanic (the same rules hold for review questions)
export function eligible(n, mech, key) {
  const isl = ISLANDS[n];
  const home = ISLANDS[homeIsland(key, n)];
  if (!home) return false;
  if (mech === 'bridge') return isl.kind === 'letter' ? initialBlankOk(key) : (isl.build || isl.units.map(u => u.key)).includes(key);
  if (mech === 'door') return home.trace.includes(key);
  return true;
}

// Decoy letters: at most one look-alike, never a letter with the same sound as the target or as another decoy
export function decoysFor(key, pool, rng, n) {
  const look = LOOKALIKE[key] || [];
  const out = [];
  const ok = x => x !== key && !sameSound(key, x) && !out.some(y => y === x || sameSound(y, x));
  for (const x of shuffle(look, rng)) { if (ok(x)) { out.push(x); break; } }
  for (const x of shuffle(pool, rng)) { if (out.length >= n) break; if (!look.includes(x) && ok(x)) out.push(x); }
  return out.slice(0, n);
}

function wordDecoys(word, words, rng, n) { return shuffle(words.filter(w => w !== word && WORDS[w]), rng).slice(0, n); }

// What the child hears as the question. c/k always add the keyword ("kuh, cat!") because they sound the same.
export function soundPart(u) {
  if (u.kind !== 'letter') return ['en:' + u.word];
  if (SOUND_MODE[u.key] === 'word') return ['en:' + u.word];
  if (SAME_SOUND[u.key]) return ['en:sound:' + u.key, 'en:' + u.word];
  return ['en:sound:' + u.key];
}
function askLine(u, suffix, listenOnly) { return listenOnly ? [LINES.listen, ...soundPart(u)] : [...soundPart(u), suffix]; }
function show(u) { return u.kind === 'letter' ? { letter: u.key, word: u.word, pic: u.pic } : { word: u.word, pic: u.pic }; }

// Which units a mechanic can give credit to on this island (map markers, tests, parent report)
export function creditable(n, mech) {
  const isl = ISLANDS[n];
  const keys = islandUnits(n);
  if (mech === 'door') return keys.filter(k => isl.trace.includes(k));
  if (mech === 'bridge') return keys.filter(k => eligible(n, 'bridge', k));
  if (mech === 'gift') return uniq(isl.words.flatMap(w => giftCredit(n, w)));
  return keys;
}

function giftCredit(n, w) {
  const keys = islandUnits(n);
  return uniq([w, initialOf(w)].filter(k => k && keys.includes(k)));
}

export function traceKeys(word) { return strokesFor(word) ? [word] : []; }

export function buildMechs(n, island, settings = {}, rng = Math.random, islands = {}) {
  const isl = ISLANDS[n];
  const kind = isl.kind;
  const keys = isl.units.map(u => u.key);
  const U = k => unitOf(k, kind);
  const pool = kind === 'letter' ? uniq([...keys, ...earlierKeys(n)]) : [];
  const picWords = isl.words.filter(w => WORDS[w]);
  const T = MECH_TYPE;
  const review = mech => reviewCandidates(n, islands).filter(k => eligible(n, mech, k));
  const recOf = k => islands[String(homeIsland(k, n))] || (homeIsland(k, n) === n ? island : noRecord);
  // revisit of something already mastered: ask by ear only, except c/k (same sound, the picture is needed)
  const earOnly = (k, isReview) => (isReview || isMastered(recOf(k), k)) && !SAME_SOUND[k];
  const line = k => unitLine(U(k), settings, SOUND_MODE);
  const optionsFor = k => kind === 'letter' ? shuffle([k, ...decoysFor(k, pool, rng, 3)], rng) : shuffle([k, ...wordDecoys(k, picWords, rng, 3)], rng);

  return {
    fruit: () => {
      const picks = pickFor(island, keys, 4, rng, T.fruit, review('fruit'));
      return { rounds: picks.map(k => {
        const listenOnly = earOnly(k, picks.review.includes(k));
        return { target: k, show: listenOnly ? null : show(U(k)), reveal: show(U(k)), line: line(k), prompt: askLine(U(k), SUFFIXES.pickFruit, listenOnly), options: optionsFor(k), listenOnly };
      }) };
    },
    bridge: () => {
      if (kind === 'letter') {
        const ok = keys.filter(k => eligible(n, 'bridge', k));
        return { mode: 'initial', rounds: pickFor(island, ok, 3, rng, T.bridge).map(k => {
          const u = U(k);
          return { target: k, word: u.word, pic: u.pic, letters: [...u.word], blank: 0, choices: shuffle([k, ...decoysFor(k, pool.filter(x => !u.word.includes(x)), rng, 2)], rng), line: line(k), prompt: ['en:' + u.word, LINES.firstSound] };
        }) };
      }
      const ok = keys.filter(k => eligible(n, 'bridge', k));
      const letterPool = uniq(isl.units.flatMap(u => u.letters));
      return { mode: 'cvc', rounds: pickFor(island, ok, 2, rng, T.bridge).map(w => {
        const u = U(w);
        return { target: w, word: w, pic: u.pic, letters: u.letters, extra: shuffle(letterPool.filter(l => !u.letters.includes(l)), rng).slice(0, 1), line: line(w), prompt: ['en:' + w, LINES.blend] };
      }) };
    },
    gift: () => {
      const want = pickFor(island, keys, keys.length, rng, T.gift);
      const scored = picWords.map(w => ({ w, s: Math.min(...giftCredit(n, w).map(k => want.indexOf(k)).filter(i => i >= 0).concat(99)) }));
      const words = shuffle(scored, rng).sort((a, b) => a.s - b.s).slice(0, 3).map(x => x.w);
      return { rounds: words.map(w => ({ answer: w, pic: WORDS[w].pic, credit: giftCredit(n, w), options: shuffle([w, ...wordDecoys(w, picWords, rng, 2)], rng), prompt: [LINES.giftWant, 'en:' + w], line: ['en:' + w] })) };
    },
    door: () => {
      const want = pickFor(island, keys, keys.length, rng, T.door);
      const unitOfKey = Object.fromEntries(isl.trace.filter(t => keys.includes(t)).map(t => [t, t]));
      const ks = [...isl.trace].sort((a, b) => want.indexOf(a) - want.indexOf(b)).slice(0, 3);
      return { keys: ks, unitOf: unitOfKey, lines: Object.fromEntries(ks.map(k => [k, line(k)])), guideOpacity: Math.max(0.25, 0.6 - (n - 1) * 0.05) };
    },
    find: () => {
      const t = pickFor(island, keys, 1, rng, T.find)[0];
      const listenOnly = earOnly(t, false);
      const decoys = kind === 'letter' ? decoysFor(t, pool, rng, 3) : wordDecoys(t, picWords, rng, 3);
      return { target: t, decoys, count: 5, show: listenOnly ? null : show(U(t)), reveal: show(U(t)), line: line(t), prompt: askLine(U(t), SUFFIXES.findAll, listenOnly), listenOnly };
    },
    rise: () => ({ rounds: pickFor(island, keys, 2, rng, T.rise).map(k => {
      const listenOnly = earOnly(k, false);
      const decoys = kind === 'letter' ? decoysFor(k, pool, rng, 3) : wordDecoys(k, picWords, rng, 3);
      return { target: k, decoys, need: 4, show: listenOnly ? null : show(U(k)), reveal: show(U(k)), line: line(k), prompt: askLine(U(k), SUFFIXES.findAll, listenOnly), listenOnly };
    }) }),
    pairs: () => {
      const picks = pickFor(island, keys, 4, rng, T.pairs, review('pairs'));
      return {
        kind: kind === 'letter' ? 'pic-letter' : 'pic-word',
        prompt: kind === 'letter' ? LINES.sameSound : LINES.pairs,
        pairs: picks.map(k => { const u = U(k); return { key: k, word: u.word, pic: u.pic, face: k, say: kind === 'letter' ? soundPart(u) : ['en:' + u.word], credit: [k] }; }),
      };
    },
  };
}

// Places of an island with their params builder (theme decides which mechanic each place runs)
export function buildPlaces(n, island, settings, rng = Math.random, islands = {}) {
  const mechs = buildMechs(n, island, settings, rng, islands);
  return Object.fromEntries(themeOf(n).places.map(p => [p.id, () => mechs[p.mech]()]));
}
export const placeIdsOf = n => themeOf(n).places.map(p => p.id);
