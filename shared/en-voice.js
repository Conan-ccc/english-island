// What the voice generator reads for each English speech token. The token (and so the file name) never changes:
// edit the text here and run tools/make_voices.py again, or record a clip with the same file name.
import { LETTERS } from './curriculum.js';

// Sound candidates per letter: [0] is the default clip 'en:sound:x', [1] and [2] are 'en:soundcand:x:2' and ':3'.
// Nobody has checked these by ear yet: the parent can pick another one per letter on tools/voice-check.html.
export const SOUND_TEXT = {
  s: ['sss', 'sssss', 'ss'], m: ['mmm', 'mmmmm', 'mm'], n: ['nnn', 'nnnnn', 'nn'], f: ['fff', 'fffff', 'ff'],
  v: ['vvv', 'vvvvv', 'vv'], z: ['zzz', 'zzzzz', 'zz'], l: ['lll', 'lllll', 'll'], r: ['rrr', 'rrrrr', 'err'],
  t: ['tuh', 'tt', 'teh'], p: ['puh', 'pp', 'peh'], b: ['buh', 'bb', 'beh'], d: ['duh', 'dd', 'deh'],
  g: ['guh', 'gg', 'geh'], c: ['kuh', 'kk', 'keh'], k: ['kuh', 'kk', 'keh'], j: ['juh', 'jj', 'jeh'],
  w: ['wuh', 'ww', 'weh'], y: ['yuh', 'yy', 'yeh'], h: ['huh', 'hh', 'heh'], q: ['kwuh', 'kw', 'kweh'], x: ['ks', 'eks', 'ex'],
  a: ['aah', 'ae', 'a'], e: ['eh', 'ehh', 'e'], i: ['ih', 'ihh', 'i'], o: ['ah', 'aw', 'o'], u: ['uh', 'uhh', 'u'],
};
export const NAME_TEXT = Object.fromEntries(Object.keys(LETTERS).map(l => [l, l.toUpperCase()]));
// Letters whose sound clip could not be made at all: say the keyword instead ("sun, sun")
export const SOUND_MODE = {};
// Short fixed English lines
export const EN_LINES = { good: ['en:Good job!', 'en:Great!'], hello: 'en:Hello!', bye: 'en:Bye-bye!' };
