// Mastery tracking and island clear rule (pure)
export const MASTERY_COUNT = 5;
export const MASTERY_TYPES = 2;
export const MIN_DAYS = 0; // no waiting: an island clears as soon as everything is learned

function entry(island, item) {
  if (!island.mastery[item]) island.mastery[item] = { count: 0, types: [] };
  return island.mastery[item];
}

export function isMastered(island, item) {
  const m = island.mastery[item];
  return !!m && m.count >= MASTERY_COUNT && m.types.length >= MASTERY_TYPES;
}

export function recordSuccess(island, item, type) {
  const before = isMastered(island, item);
  const m = entry(island, item);
  m.count += 1;
  if (!m.types.includes(type)) m.types.push(type);
  return !before && isMastered(island, item);
}

export function markVisit(island, placeId, day) {
  if (!island.visited.includes(placeId)) island.visited.push(placeId);
  if (!island.days.includes(day)) island.days.push(day);
}

export function islandProgress(island, items, placeIds) {
  const mastered = items.filter(it => isMastered(island, it)).length;
  const allVisited = placeIds.every(p => island.visited.includes(p));
  const days = island.days.length;
  return { mastered, total: items.length, allVisited, days, cleared: items.length > 0 && mastered === items.length && days >= MIN_DAYS };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function pickItems(island, items, n, rng = Math.random) {
  const uniq = [...new Set(items)];
  const fresh = shuffle(uniq.filter(it => !isMastered(island, it)), rng);
  const review = shuffle(uniq.filter(it => isMastered(island, it)), rng);
  return [...fresh, ...review].slice(0, n);
}
