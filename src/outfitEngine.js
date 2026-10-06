// Offline stylist: builds outfits from the closet using colour harmony, occasion fit,
// weather and what was worn recently. Works with no network and no API key.
import { colorInfo } from './data/catalog';

const STYLE_FIT = {
  casual: { casual: 1, sport: 0.7, eastern: 0.6, formal: 0.5, party: 0.2 },
  formal: { formal: 1, casual: 0.55, eastern: 0.5, party: 0.3, sport: 0 },
  eastern: { eastern: 1, party: 0.6, casual: 0.35, formal: 0.3, sport: 0 },
  party: { party: 1, eastern: 0.75, formal: 0.6, casual: 0.2, sport: 0 },
};

const WEATHER_FIT = {
  hot: { light: 1, mid: 0.7, warm: 0.15 },
  mild: { light: 0.8, mid: 1, warm: 0.6 },
  cold: { light: 0.5, mid: 0.85, warm: 1 },
};

// Pairings people actually reach for, with the reason in plain words.
const CLASSICS = {
  'maroon+mustard': 'Maroon and mustard is a festive desi favourite.',
  'mustard+teal': 'Teal and mustard is a rich, jewel-tone pairing.',
  'green+pink': 'Pink and green is the classic mehndi combination.',
  'olive+mustard': 'Olive and mustard give an earthy, autumn feel.',
  'lavender+white': 'Lavender on white reads soft and fresh.',
  'sky+white': 'Sky blue and white stay crisp in the heat.',
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pairKey = (a, b) => [a, b].sort().join('+');

export function colorHarmony(aKey, bKey) {
  const a = colorInfo(aKey);
  const b = colorInfo(bKey);
  const classic = CLASSICS[pairKey(a.key, b.key)];
  if (classic) return { score: 0.92, reason: classic };

  if (a.family === 'print' || b.family === 'print') {
    if (a.family === 'print' && b.family === 'print') return { score: 0.15, reason: 'Two prints compete with each other.' };
    return { score: 0.88, reason: 'One print, everything else quiet: the right balance.' };
  }
  if (a.key === b.key) {
    return a.family === 'neutral'
      ? { score: 0.75, reason: `All ${a.key} looks sleek and deliberate.` }
      : { score: 0.55, reason: `Tonal ${a.key} head to toe is a bold choice.` };
  }
  const neutralA = a.family === 'neutral';
  const neutralB = b.family === 'neutral';
  if (neutralA && neutralB) {
    const k = pairKey(a.key, b.key);
    if (k === 'black+navy' || k === 'black+brown') return { score: 0.5, reason: `${cap(a.key)} and ${b.key} are too close to tell apart.` };
    return { score: 0.85, reason: `${cap(a.key)} and ${b.key} are easy neutrals: clean and safe.` };
  }
  if (neutralA || neutralB) {
    const [n, c] = neutralA ? [a, b] : [b, a];
    return { score: 0.9, reason: `${cap(n.key)} lets the ${c.key} do the talking.` };
  }
  let d = Math.abs(a.hue - b.hue);
  if (d > 180) d = 360 - d;
  if (d <= 40) return { score: 0.75, reason: `${cap(a.key)} and ${b.key} are colour-wheel neighbours: calm and cohesive.` };
  if (d >= 150) return { score: 0.82, reason: `${cap(a.key)} and ${b.key} sit opposite each other: confident contrast.` };
  if (d >= 100) return { score: 0.6, reason: `${cap(a.key)} with ${b.key} is playful; keep accessories simple.` };
  return { score: 0.4, reason: `${cap(a.key)} and ${b.key} may clash.` };
}

// Small deterministic RNG so "shuffle" gives new but repeatable picks.
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

function recentlyWorn(wornLog, today) {
  const ids = new Set();
  wornLog
    .filter((w) => w.date !== today)
    .slice(0, 2)
    .forEach((w) => w.itemIds.forEach((id) => ids.add(id)));
  return ids;
}

const byCat = (wardrobe, cat) => wardrobe.filter((i) => i.category === cat);

/**
 * @returns {{ outfits: Array<{id, items, score, title, reasons}>, missing: string[] }}
 */
export function generateOutfits({ wardrobe, gender, occasion, weather, wornLog = [], today = '', seed = 1, limit = 6 }) {
  const fit = STYLE_FIT[occasion] ?? STYLE_FIT.casual;
  const wfit = WEATHER_FIT[weather] ?? WEATHER_FIT.mild;
  const worn = recentlyWorn(wornLog, today);
  const rand = rng(seed);

  const tops = byCat(wardrobe, 'top');
  const bottoms = byCat(wardrobe, 'bottom');
  const fulls = byCat(wardrobe, 'full');
  const shoes = byCat(wardrobe, 'shoes');
  const layers = byCat(wardrobe, 'layer');
  const extras = byCat(wardrobe, 'extra');

  const missing = [];
  if (!fulls.length && (!tops.length || !bottoms.length)) {
    if (!tops.length) missing.push('top');
    if (!bottoms.length) missing.push('bottom');
  }
  if (missing.length) return { outfits: [], missing };

  const bases = [...fulls.map((f) => [f])];
  tops.forEach((t) => bottoms.forEach((b) => bases.push([t, b])));

  const candidates = bases.map((base) => {
    const anchor = base[base.length - 1]; // bottom or full suit: what shoes must match
    const pick = (pool, against) => {
      let best = null;
      pool.forEach((p) => {
        const s = (fit[p.style] ?? 0.3) * 0.5 + (wfit[p.warmth] ?? 0.7) * 0.2 + colorHarmony(p.color, against.color).score * 0.3;
        if (!best || s > best.s) best = { item: p, s };
      });
      return best?.item ?? null;
    };

    const items = [...base];
    const shoe = pick(shoes, anchor);
    if (shoe) items.push(shoe);

    const wantsLayer = weather === 'cold' || (weather === 'mild' && rand() > 0.55);
    if (wantsLayer && layers.length) {
      const layer = pick(layers, base[0]);
      if (layer && (weather === 'cold' || (wfit[layer.warmth] ?? 0.7) >= 0.6)) items.push(layer);
    }

    // Dupatta / shawl-style extras finish an eastern two-piece; men skip extras by default.
    const easternish = occasion === 'eastern' || occasion === 'party';
    if (gender === 'female' && easternish && base.length === 2 && extras.length) {
      const extra = pick(extras, base[0]);
      if (extra) items.push(extra);
    }

    const main = items.filter((i) => i.category !== 'shoes');
    const pairs = [];
    for (let i = 0; i < main.length; i++) for (let j = i + 1; j < main.length; j++) pairs.push(colorHarmony(main[i].color, main[j].color));
    if (shoe) pairs.push({ ...colorHarmony(shoe.color, anchor.color), shoe: true });
    const scores = pairs.map((p) => p.score);
    const colorScore = scores.length ? 0.5 * Math.min(...scores) + 0.5 * (scores.reduce((a, b) => a + b, 0) / scores.length) : 0.7;

    const styleScore = items.reduce((a, i) => a + (fit[i.style] ?? 0.3), 0) / items.length;
    const weatherScore = main.reduce((a, i) => a + (wfit[i.warmth] ?? 0.7), 0) / main.length;
    const wornCount = items.filter((i) => worn.has(i.id)).length;

    const score = styleScore * 0.45 + colorScore * 0.35 + weatherScore * 0.2 - Math.min(wornCount * 0.08, 0.24) + rand() * 0.06;

    const reasons = [];
    const lead = pairs.filter((p) => !p.shoe).sort((a, b) => b.score - a.score)[0];
    if (lead) reasons.push(lead.reason);
    if (weather === 'hot' && main.every((i) => i.warmth !== 'warm')) reasons.push('Breathable pieces for the heat.');
    if (weather === 'cold' && items.some((i) => i.category === 'layer')) reasons.push('Layered up for the cold.');
    if (wornCount === 0 && worn.size) reasons.push('Nothing you wore in the last two days.');
    if (!shoe) reasons.push('Add shoes to your closet to complete this look.');

    const colorsInOrder = [...new Set(main.map((i) => i.color))].slice(0, 2).map(cap);
    return { id: items.map((i) => i.id).join('-'), items, score, reasons, title: colorsInOrder.join(' & ') };
  });

  candidates.sort((a, b) => b.score - a.score);

  // Keep the list varied: no single main piece in more than two suggestions.
  const usage = new Map();
  const picked = [];
  for (const c of candidates) {
    const mainIds = c.items.filter((i) => ['top', 'full', 'bottom'].includes(i.category)).map((i) => i.id);
    if (mainIds.some((id) => (usage.get(id) ?? 0) >= 2)) continue;
    mainIds.forEach((id) => usage.set(id, (usage.get(id) ?? 0) + 1));
    picked.push(c);
    if (picked.length >= limit) break;
  }
  return { outfits: picked, missing: [] };
}
