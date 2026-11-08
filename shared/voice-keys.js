// Shared between the game and tools/voice-list.mjs: which lines have prepared voice files.
// FNV-1a 32-bit over UTF-8 bytes; the python generator uses the same function.
// Korean lines hash the same as in the hangul game, so those clips are reused unchanged.
export function voiceHash(text) {
  const bytes = new TextEncoder().encode(String(text).trim());
  let h = 0x811c9dc5;
  for (const b of bytes) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

// Fixed Korean sentences (full clips)
export const LINES = {
  hello: '안녕! 오늘은 어디로 가볼까?',
  great: '와, 잘했어!', great2: '최고야!', great3: '멋지다!',
  tryAgain: '다시 해볼까?', showWay: '이렇게 해볼까?', traceDoor: '반짝이는 선을 따라 그려볼까?',
  soon: '곧 열려!', cleared: '섬을 다 깼어! 우리 친구가 자란대!',
  giftBox: '선물상자를 톡톡 눌러볼까?', present: '선물이야!', love: '사랑해!',
  bagEmpty: '놀이를 하면 선물을 받을 수 있어!', roomEmpty: '다 자란 친구들이 여기서 쉬어요',
  welcome: '영어 섬에 왔어! 반짝이는 곳을 눌러볼까?', allDone: '이 섬은 다 했어! 다른 섬에도 가볼까?',
  pairs: '같은 짝을 찾아볼까?', sameSound: '같은 소리를 찾아볼까?',
  firstSound: '첫소리를 찾아줄래?', blend: '소리를 합쳐 볼까?', listen: '잘 듣고 골라볼까?', giftWant: '친구가 뭘 갖고 싶대?',
};

// Endings spoken after an English item: "sss" + "열매를 따볼까?"
export const SUFFIXES = { pickFruit: '열매를 따볼까?', findAll: '모두 찾아볼까?', giveCard: '카드를 줄래?' };
