// English curriculum: what each island teaches (pure data + helpers)
// Letter islands (1-6): unit = a lowercase letter, taught by its sound and a keyword picture.
// Island 7 (cvc): unit = a 3-letter word to blend. Island 8 (word): unit = a family/greeting word.
// pic = picture path under assets/, concrete = a thing that can be drawn
export const WORDS = {
  sun: { pic: 'pic/sun.webp', concrete: true }, apple: { pic: 'pic/apple.webp', concrete: true },
  tomato: { pic: 'pic/tomato.webp', concrete: true }, pig: { pic: 'theme/1/friend-pig.webp', concrete: true },
  cow: { pic: 'pic/so.webp', concrete: true }, duck: { pic: 'pic/ori.webp', concrete: true }, hen: { pic: 'pic/hen.webp', concrete: true },
  igloo: { pic: 'pic/igloo.webp', concrete: true }, nose: { pic: 'pic/ko.webp', concrete: true },
  moon: { pic: 'pic/dal.webp', concrete: true }, dog: { pic: 'pic/gae.webp', concrete: true },
  bee: { pic: 'theme/2/bee.webp', concrete: true }, ant: { pic: 'pic/ant.webp', concrete: true },
  butterfly: { pic: 'pic/nabi.webp', concrete: true }, spider: { pic: 'pic/geomi.webp', concrete: true },
  octopus: { pic: 'theme/3/friend-octopus.webp', concrete: true }, cat: { pic: 'pic/cat.webp', concrete: true },
  kiwi: { pic: 'pic/kiwi.webp', concrete: true }, egg: { pic: 'theme/1/egg.webp', concrete: true },
  crab: { pic: 'pic/ge.webp', concrete: true }, whale: { pic: 'pic/gorae.webp', concrete: true },
  fish: { pic: 'pic/fish.webp', concrete: true }, boat: { pic: 'pic/boteu.webp', concrete: true },
  hat: { pic: 'pic/moja.webp', concrete: true }, rabbit: { pic: 'pic/friend-rabbit.webp', concrete: true },
  umbrella: { pic: 'pic/umbrella.webp', concrete: true }, lemon: { pic: 'pic/lemon.webp', concrete: true },
  banana: { pic: 'pic/banana.webp', concrete: true }, cherry: { pic: 'pic/cheri.webp', concrete: true },
  grapes: { pic: 'pic/podo.webp', concrete: true }, melon: { pic: 'theme/4/melon.webp', concrete: true },
  gift: { pic: 'pic/giftbox.webp', concrete: true }, ball: { pic: 'pic/gong.webp', concrete: true },
  fox: { pic: 'pic/yeou.webp', concrete: true }, juice: { pic: 'pic/juseu.webp', concrete: true },
  zebra: { pic: 'pic/zebra.webp', concrete: true }, dinosaur: { pic: 'theme/5/dino-friend-1.webp', concrete: true },
  leaf: { pic: 'theme/5/leaf.webp', concrete: true },
  web: { pic: 'pic/web.webp', concrete: true }, van: { pic: 'pic/van.webp', concrete: true },
  yoyo: { pic: 'pic/yoyo.webp', concrete: true }, box: { pic: 'pic/box.webp', concrete: true },
  queen: { pic: 'pic/queen.webp', concrete: true }, bus: { pic: 'pic/beoseu.webp', concrete: true },
  car: { pic: 'theme/6/car.webp', concrete: true }, train: { pic: 'pic/gicha.webp', concrete: true },
  star: { pic: 'pic/byeol.webp', concrete: true }, owl: { pic: 'theme/7/friend-owl.webp', concrete: true },
  mom: { pic: 'pic/mom.webp', concrete: true }, dad: { pic: 'pic/dad.webp', concrete: true },
  baby: { pic: 'pic/agi.webp', concrete: true }, grandma: { pic: 'pic/grandma.webp', concrete: true },
  grandpa: { pic: 'pic/grandpa.webp', concrete: true }, hello: { pic: 'pic/hello.webp', concrete: false },
  king: { pic: 'theme/8/friend-king-bear.webp', concrete: true },
};

// Letter: sound (IPA, shown to parents) and keyword picture word
export const LETTERS = {
  s: { ipa: '/s/', keyword: 'sun' }, a: { ipa: '/æ/', keyword: 'apple' }, t: { ipa: '/t/', keyword: 'tomato' }, p: { ipa: '/p/', keyword: 'pig' },
  i: { ipa: '/ɪ/', keyword: 'igloo' }, n: { ipa: '/n/', keyword: 'nose' }, m: { ipa: '/m/', keyword: 'moon' }, d: { ipa: '/d/', keyword: 'dog' },
  o: { ipa: '/ɑ/', keyword: 'octopus' }, c: { ipa: '/k/', keyword: 'cat' }, k: { ipa: '/k/', keyword: 'kiwi' }, e: { ipa: '/ɛ/', keyword: 'egg' },
  h: { ipa: '/h/', keyword: 'hat' }, r: { ipa: '/r/', keyword: 'rabbit' }, u: { ipa: '/ʌ/', keyword: 'umbrella' }, l: { ipa: '/l/', keyword: 'lemon' },
  g: { ipa: '/g/', keyword: 'gift' }, b: { ipa: '/b/', keyword: 'ball' }, f: { ipa: '/f/', keyword: 'fox' }, j: { ipa: '/dʒ/', keyword: 'juice' }, z: { ipa: '/z/', keyword: 'zebra' },
  w: { ipa: '/w/', keyword: 'web' }, v: { ipa: '/v/', keyword: 'van' }, y: { ipa: '/j/', keyword: 'yoyo' }, x: { ipa: '/ks/', keyword: 'box' }, q: { ipa: '/kw/', keyword: 'queen' },
};

const L = l => ({ key: l, kind: 'letter', word: LETTERS[l].keyword, pic: WORDS[LETTERS[l].keyword].pic });
const W = (w, kind) => ({ key: w, kind, word: w, letters: [...w], pic: WORDS[w].pic });

export const ISLANDS = {
  1: { title: '농장 섬', kind: 'letter', units: ['s', 'a', 't', 'p'].map(L),
    words: ['sun', 'apple', 'tomato', 'pig', 'cow', 'duck', 'hen'], trace: ['s', 'a', 't', 'p'] },
  2: { title: '곤충 섬', kind: 'letter', units: ['i', 'n', 'm', 'd'].map(L),
    words: ['igloo', 'nose', 'moon', 'dog', 'bee', 'ant', 'butterfly', 'spider'], trace: ['i', 'n', 'm', 'd'] },
  3: { title: '바다 섬', kind: 'letter', units: ['o', 'c', 'k', 'e'].map(L),
    words: ['octopus', 'cat', 'kiwi', 'egg', 'crab', 'whale', 'fish', 'boat'], trace: ['o', 'c', 'k', 'e'] },
  4: { title: '과일 섬', kind: 'letter', units: ['h', 'r', 'u', 'l'].map(L),
    words: ['hat', 'rabbit', 'umbrella', 'lemon', 'banana', 'cherry', 'grapes', 'melon'], trace: ['h', 'r', 'u', 'l'] },
  5: { title: '공룡 섬', kind: 'letter', units: ['g', 'b', 'f', 'j', 'z'].map(L),
    words: ['gift', 'ball', 'fox', 'juice', 'zebra', 'dinosaur', 'leaf'], trace: ['g', 'b', 'f', 'j', 'z'] },
  6: { title: '탈것 섬', kind: 'letter', units: ['w', 'v', 'y', 'x', 'q'].map(L),
    words: ['web', 'van', 'yoyo', 'box', 'queen', 'bus', 'car', 'train', 'boat'], trace: ['w', 'v', 'y', 'x', 'q'] },
  7: { title: '소리 합치기 섬', kind: 'cvc', units: ['cat', 'dog', 'sun', 'pig', 'hat', 'bus'].map(w => W(w, 'cvc')),
    words: ['cat', 'dog', 'sun', 'pig', 'hat', 'bus', 'moon', 'star', 'owl'], trace: ['cat', 'dog', 'sun'] },
  8: { title: '가족 성', kind: 'word', units: ['mom', 'dad', 'baby', 'grandma', 'grandpa', 'hello'].map(w => W(w, 'word')),
    words: ['mom', 'dad', 'baby', 'grandma', 'grandpa', 'hello', 'queen', 'king'], trace: ['mom', 'dad'], build: ['mom', 'dad'] },
};

// Letters that look alike (tricky decoys, at most one per board)
export const LOOKALIKE = {
  b: ['d', 'p'], d: ['b', 'q'], p: ['q', 'b'], q: ['p', 'g'], m: ['n', 'w'], n: ['m', 'h'], h: ['n', 'b'], u: ['n', 'v'], i: ['l', 'j'], l: ['i', 't'], j: ['i', 'g'],
  a: ['o', 'e'], o: ['a', 'c'], e: ['c', 'a'], c: ['o', 'e'], v: ['w', 'y'], w: ['v', 'm'], y: ['v', 'g'], f: ['t', 'l'], t: ['f', 'l'], g: ['q', 'y'],
  s: ['z', 'c'], z: ['s', 'x'], x: ['k', 'z'], k: ['h', 'x'], r: ['n', 'h'],
};
// Letters with the same sound: never offered together, never asked by ear alone
export const SAME_SOUND = { c: ['k'], k: ['c'] };
// Two-letter starts that are not the single letter's sound (no letter credit)
export const DIGRAPHS = ['wh', 'sh', 'ch', 'th', 'ph', 'ck', 'ng'];

export function islandItems(n) {
  const isl = ISLANDS[n];
  return isl && isl.units ? isl.units.map(u => u.key) : [];
}

// Units of earlier islands of the same kind (review)
export function earlierKeys(n) {
  const kind = ISLANDS[n]?.kind;
  const out = [];
  for (let i = 1; i < n; i++) if (ISLANDS[i].kind === kind) out.push(...ISLANDS[i].units.map(u => u.key));
  return [...new Set(out)];
}

// Which island a unit belongs to: the current one if it has the unit, otherwise the island of the same kind that has it
export function homeIsland(key, n) {
  if (ISLANDS[n]?.units.some(u => u.key === key)) return Number(n);
  for (const [i, isl] of Object.entries(ISLANDS)) if (isl.kind === ISLANDS[n]?.kind && isl.units.some(u => u.key === key)) return Number(i);
  return null;
}

export function unitOf(key, kind) {
  for (const isl of Object.values(ISLANDS)) {
    if (kind && isl.kind !== kind) continue;
    const u = isl.units.find(x => x.key === key);
    if (u) return u;
  }
  return null;
}

// First letter that earns letter credit: digraph start = none, qu = q, keyword box = x
export function initialOf(word) {
  const w = String(word ?? '').toLowerCase();
  if (!w) return null;
  if (w === LETTERS.x.keyword) return 'x';
  if (w.startsWith('qu')) return 'q';
  if (DIGRAPHS.some(d => w.startsWith(d))) return null;
  return /^[a-z]/.test(w) ? w[0] : null;
}

// The keyword starts with exactly this one letter, so the bridge can blank it out (not x = box, not q = qu)
export function initialBlankOk(l) {
  const kw = LETTERS[l]?.keyword;
  if (!kw) return false;
  return initialOf(kw) === l && kw[0] === l && !kw.startsWith('qu');
}

// Spoken line for a unit (array of speech tokens, see speech.js)
export function unitLine(u, settings = {}, soundMode = {}) {
  if (!u) return [];
  if (u.kind === 'letter') {
    const kw = 'en:' + u.word;
    if (soundMode[u.key] === 'word') return [kw, kw];
    return [settings.letterNames ? 'en:name:' + u.key : 'en:sound:' + u.key, 'en:sound:' + u.key, kw];
  }
  if (u.kind === 'cvc') return [...u.letters.map(l => 'en:sound:' + l), 'en:' + u.word];
  return ['en:' + u.word];
}
