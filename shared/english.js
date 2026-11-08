// English letter/token helpers (pure, no DOM)
import { LETTERS } from './curriculum.js';

export const isLetter = t => typeof t === 'string' && /^[a-z]$/.test(t);
export const lettersOf = word => [...String(word ?? '')].filter(isLetter);
export const soundToken = l => 'en:sound:' + l;
export const nameToken = l => 'en:name:' + l;
export const wordToken = w => 'en:' + w;
export const keywordOf = l => LETTERS[l]?.keyword || null;

// 'en:sound:s' -> { lang: 'en', kind: 'sound', value: 's' }; '와, 잘했어!' -> { lang: 'ko', kind: 'text', value }
export function parseToken(t) {
  const s = String(t ?? '').trim();
  let m = /^en:sound:([a-z])$/.exec(s);
  if (m) return { lang: 'en', kind: 'sound', value: m[1] };
  m = /^en:soundcand:([a-z]):(\d)$/.exec(s);
  if (m) return { lang: 'en', kind: 'soundcand', value: m[1], cand: Number(m[2]) };
  m = /^en:name:([a-z])$/.exec(s);
  if (m) return { lang: 'en', kind: 'name', value: m[1] };
  if (s.startsWith('en:')) return { lang: 'en', kind: 'text', value: s.slice(3) };
  return { lang: 'ko', kind: 'text', value: s };
}
