// Island themes (reused from the hangul game): map art, music, and which play (mechanic) each place runs with which skin.
// Mechanics: fruit (drag the matching item to a target), bridge (first sound / blend letters into a word),
// gift (give the picture card the friend asks for), door (trace), find (tap all matching),
// rise (tap the matching items while they float/fall), pairs (memory: picture <-> letter or word).
// Second plays that take turns with the first one at the same place (same background and skin), so a place is not
// the same game every time: catch (slide the basket under falling items) with fruit, hop (stepping stones) with bridge,
// scratch (rub the fog off a picture, then pick its letter or word) with find.
export const MECH_TYPE = { fruit: 'fruit', bridge: 'bridge', gift: 'gift', door: 'trace', find: 'find', rise: 'rise', pairs: 'pairs', catch: 'catch', hop: 'hop', scratch: 'scratch' };
export const ALT_MECH = { fruit: 'catch', bridge: 'hop', find: 'scratch' };
// The plays of a place in the order they come up (the new one first), and the one for the n-th visit
export const mechsOf = place => (ALT_MECH[place.mech] ? [ALT_MECH[place.mech], place.mech] : [place.mech]);
export const mechAt = (place, visits = 0) => { const seq = mechsOf(place); return seq[Math.max(0, Math.floor(visits) || 0) % seq.length]; };

export const THEMES = {
  1: {
    n: 1, name: '농장 섬', music: 'music/island1.mp3', map: 'theme/1/map.jpg', spots: 'theme/1/map.json',
    places: [
      { id: 'henhouse', mech: 'fruit', skin: { bg: 'theme/1/act-henhouse.jpg', item: 'theme/1/egg.webp', target: 'theme/1/basket.webp' } },
      { id: 'pond', mech: 'rise', skin: { bg: 'theme/1/act-pond.jpg', dir: 'rise' } },
      { id: 'barn', mech: 'gift', skin: { bg: 'theme/1/act-barn.jpg', friends: ['theme/1/friend-cow.webp', 'theme/1/friend-pig.webp', 'theme/1/friend-lamb.webp'] } },
      { id: 'field', mech: 'find', skin: { bg: 'theme/1/act-field.jpg', item: 'theme/1/sprout.webp', open: 'theme/1/carrot.webp' } },
      { id: 'gate', mech: 'door', skin: { bg: 'theme/1/act-gate.jpg' } },
      { id: 'windmill', mech: 'bridge', skin: { bg: 'theme/1/act-windmill.jpg' } },
    ],
  },
  2: {
    n: 2, name: '곤충 섬', music: 'music/island2.mp3', map: 'theme/2/map.jpg', spots: 'theme/2/map.json',
    places: [
      { id: 'flowers', mech: 'rise', skin: { bg: 'theme/2/act-flowers.jpg', item: 'theme/2/butterfly.webp', dir: 'rise' } },
      { id: 'bud', mech: 'find', skin: { bg: 'theme/2/act-bud.jpg', item: 'theme/2/bud.webp', open: 'theme/2/bloom.webp', reveal: ['theme/2/ladybug.webp', 'theme/2/bee.webp', 'theme/2/caterpillar.webp'] } },
      { id: 'hive', mech: 'fruit', skin: { bg: 'theme/2/act-hive.jpg', item: 'theme/2/honey.webp', target: 'theme/2/honeypot.webp' } },
      { id: 'web', mech: 'pairs', skin: { bg: 'theme/2/act-web.jpg', back: 'theme/2/leaf-card.webp' } },
      { id: 'log', mech: 'door', skin: { bg: 'theme/2/act-log.jpg' } },
      { id: 'pond', mech: 'bridge', skin: { bg: 'theme/2/act-pond.jpg' } },
    ],
  },
  3: {
    n: 3, name: '바다 섬', music: 'music/island3.mp3', map: 'theme/3/map.jpg', spots: 'theme/3/map.json',
    places: [
      { id: 'shore', mech: 'fruit', skin: { bg: 'theme/3/act-shore.jpg', item: 'theme/3/shell.webp', target: 'theme/3/bucket.webp' } },
      { id: 'reef', mech: 'rise', skin: { bg: 'theme/3/act-reef.jpg', dir: 'rise' } },
      { id: 'clams', mech: 'find', skin: { bg: 'theme/3/act-clams.jpg', item: 'theme/3/clam.webp', open: 'theme/3/clam-open.webp' } },
      { id: 'dock', mech: 'gift', skin: { bg: 'theme/3/act-dock.jpg', friends: ['theme/3/friend-crab.webp', 'theme/3/friend-octopus.webp', 'theme/3/friend-turtle.webp'] } },
      { id: 'lighthouse', mech: 'door', skin: { bg: 'theme/3/act-lighthouse.jpg' } },
      { id: 'boat', mech: 'bridge', skin: { bg: 'theme/3/act-boat.jpg' } },
    ],
  },
  4: {
    n: 4, name: '과일 섬', music: 'music/island4.mp3', map: 'theme/4/map.jpg', spots: 'theme/4/map.json',
    places: [
      { id: 'tree', mech: 'fruit', skin: { bg: 'theme/4/act-tree.jpg', item: 'theme/4/peach.webp', target: 'theme/4/fruitbasket.webp' } },
      { id: 'vines', mech: 'rise', skin: { bg: 'theme/4/act-vines.jpg', item: 'theme/4/berry.webp', dir: 'fall' } },
      { id: 'patch', mech: 'find', skin: { bg: 'theme/4/act-patch.jpg', item: 'theme/4/melon.webp', open: 'theme/4/melon-open.webp' } },
      { id: 'market', mech: 'gift', skin: { bg: 'theme/4/act-market.jpg', friends: ['theme/4/friend-squirrel.webp', 'theme/4/friend-raccoon.webp', 'theme/4/friend-hedgehog.webp'] } },
      { id: 'juice', mech: 'bridge', skin: { bg: 'theme/4/act-juice.jpg' } },
      { id: 'cellar', mech: 'door', skin: { bg: 'theme/4/act-cellar.jpg' } },
    ],
  },
  5: {
    n: 5, name: '공룡 섬', music: 'music/island5.mp3', map: 'theme/5/map.jpg', spots: 'theme/5/map.json',
    places: [
      { id: 'nest', mech: 'find', skin: { bg: 'theme/5/act-nest.jpg', item: 'theme/5/egg.webp', open: 'theme/5/egg-crack.webp', reveal: ['theme/5/baby-1.webp', 'theme/5/baby-2.webp', 'theme/5/baby-3.webp'] } },
      { id: 'tree', mech: 'rise', skin: { bg: 'theme/5/act-tree.jpg', item: 'theme/5/leaf.webp', dir: 'fall' } },
      { id: 'lake', mech: 'bridge', skin: { bg: 'theme/5/act-lake.jpg' } },
      { id: 'cave', mech: 'door', skin: { bg: 'theme/5/act-cave.jpg' } },
      { id: 'meadow', mech: 'gift', skin: { bg: 'theme/5/act-meadow.jpg', friends: ['theme/5/dino-friend-1.webp', 'theme/5/dino-friend-2.webp', 'theme/5/dino-friend-3.webp'] } },
      { id: 'fossil', mech: 'pairs', skin: { bg: 'theme/5/act-fossil.jpg', back: 'theme/5/fossil-card.webp' } },
    ],
  },
  6: {
    n: 6, name: '탈것 섬', music: 'music/island6.mp3', map: 'theme/6/map.jpg', spots: 'theme/6/map.json',
    places: [
      { id: 'station', mech: 'bridge', skin: { bg: 'theme/6/act-station.jpg' } },
      { id: 'road', mech: 'rise', skin: { bg: 'theme/6/act-road.jpg', dir: 'rise' } },
      { id: 'harbor', mech: 'gift', skin: { bg: 'theme/6/act-harbor.jpg', friends: ['theme/6/friend-bear-driver.webp', 'theme/6/friend-bunny-pilot.webp', 'theme/6/friend-dog-captain.webp'] } },
      { id: 'parking', mech: 'find', skin: { bg: 'theme/6/act-parking.jpg', item: 'theme/6/car.webp', open: 'theme/6/car-open.webp' } },
      { id: 'airport', mech: 'pairs', skin: { bg: 'theme/6/act-airport.jpg', back: 'theme/6/ticket.webp' } },
      { id: 'tunnel', mech: 'door', skin: { bg: 'theme/6/act-tunnel.jpg' } },
    ],
  },
  7: {
    n: 7, name: '소리 합치기 섬', music: 'music/island7.mp3', map: 'theme/7/map.jpg', spots: 'theme/7/map.json',
    places: [
      { id: 'tent', mech: 'bridge', skin: { bg: 'theme/7/act-tent.jpg' } },
      { id: 'fireflies', mech: 'rise', skin: { bg: 'theme/7/act-fireflies.jpg', item: 'theme/7/firefly.webp', dir: 'rise' } },
      { id: 'hill', mech: 'find', skin: { bg: 'theme/7/act-hill.jpg', item: 'theme/7/star-dim.webp', open: 'theme/7/star-bright.webp' } },
      { id: 'owl', mech: 'gift', skin: { bg: 'theme/7/act-owl.jpg', friends: ['theme/7/friend-owl.webp', 'theme/7/friend-hedgehog-night.webp', 'theme/7/friend-bunny-moon.webp'] } },
      { id: 'lake', mech: 'pairs', skin: { bg: 'theme/7/act-lake.jpg', back: 'theme/7/moon-card.webp' } },
      { id: 'gate', mech: 'door', skin: { bg: 'theme/7/act-gate.jpg' } },
    ],
  },
  8: {
    n: 8, name: '가족 성', music: 'music/island8.mp3', map: 'theme/8/map.jpg', spots: 'theme/8/map.json',
    places: [
      { id: 'garden', mech: 'fruit', skin: { bg: 'theme/8/act-garden.jpg', item: 'theme/8/rose.webp', target: 'theme/8/vase.webp' } },
      { id: 'hall', mech: 'bridge', skin: { bg: 'theme/8/act-hall.jpg' } },
      { id: 'throne', mech: 'gift', skin: { bg: 'theme/8/act-throne.jpg', friends: ['theme/8/friend-king-bear.webp', 'theme/8/friend-queen-cat.webp', 'theme/8/friend-knight-pup.webp'] } },
      { id: 'tower', mech: 'rise', skin: { bg: 'theme/8/act-tower.jpg', dir: 'rise' } },
      { id: 'gallery', mech: 'find', skin: { bg: 'theme/8/act-gallery.jpg', item: 'theme/8/frame.webp', open: 'theme/8/frame-open.webp' } },
      { id: 'gate', mech: 'door', skin: { bg: 'theme/8/act-gate.jpg' } },
    ],
  },
};

export const HOME_MUSIC = 'music/home.mp3';
export function themeOf(n) { const t = THEMES[n]; if (!t) throw new Error('no-theme:' + n); return t; }
