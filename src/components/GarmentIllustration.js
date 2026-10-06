// Flat garment drawings for pieces without a photo (samples, brand looks, swatch items).
// Transparent background, so they also work as overlays on the Try On photo.
import React, { useId } from 'react';
import Svg, { Circle, Defs, G, Line, Path, Pattern, Rect } from 'react-native-svg';
import { colorInfo } from '../data/catalog';

const OUTLINE = 'rgba(0,0,0,0.28)';

// Name keywords win over category, so "Peshawari chappal" draws a chappal, not a generic shoe.
const KEYWORDS = [
  ['sherwani', 'sherwani'], ['prince coat', 'sherwani'],
  ['kameez shalwar', 'suit'], ['wash-n-wear suit', 'suit'],
  ['3-piece', 'threepiece'], ['three-piece', 'threepiece'],
  ['2-piece', 'twopiece'], ['two-piece', 'twopiece'], ['co-ord', 'twopiece'],
  ['gharara', 'dress'], ['lehenga', 'dress'], ['dress', 'dress'],
  ['waistcoat', 'waistcoat'], ['blazer', 'jacket'], ['jacket', 'jacket'], ['cardigan', 'jacket'],
  ['hoodie', 'sweater'], ['sweater', 'sweater'],
  ['shawl', 'shawl'], ['dupatta', 'dupatta'],
  ['kurti', 'kameez'], ['kameez', 'kameez'], ['kurta', 'kurta'],
  ['polo', 'polo'], ['tee', 'tee'], ['henley', 'tee'], ['shirt', 'shirt'],
  ['shalwar', 'shalwar'], ['pajama', 'trousers'], ['palazzo', 'palazzo'], ['culottes', 'palazzo'], ['wide-leg', 'palazzo'],
  ['jeans', 'jeans'], ['trousers', 'trousers'], ['pants', 'trousers'], ['chinos', 'trousers'], ['cargo', 'trousers'],
  ['khussa', 'khussa'], ['chappal', 'chappal'], ['sneaker', 'sneaker'], ['heel', 'heels'], ['oxford', 'oxford'],
  ['bag', 'bag'], ['cap', 'cap'], ['watch', 'watch'],
];

const BY_CATEGORY = { top: 'shirt', bottom: 'trousers', full: 'suit', layer: 'jacket', shoes: 'khussa', extra: 'dupatta' };

export function shapeFor(item, gender) {
  if (item.shape) return item.shape;
  const name = (item.name ?? '').toLowerCase();
  const hit = KEYWORDS.find(([k]) => name.includes(k));
  if (hit) return hit[1];
  if (item.category === 'full') return gender === 'male' ? 'suit' : 'threepiece';
  if (item.category === 'top' && gender === 'female') return 'kameez';
  return BY_CATEGORY[item.category] ?? 'shirt';
}

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 + amount))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const P = {
  tee: 'M30 18 L42 14 Q50 21 58 14 L70 18 L86 32 L77 42 L70 37 L70 84 L30 84 L30 37 L23 42 L14 32 Z',
  sweater: 'M31 16 L43 12 Q50 19 57 12 L69 16 L84 26 L90 78 L80 80 L71 40 L71 88 L29 88 L29 40 L20 80 L10 78 L16 26 Z',
  shirt: 'M32 16 L44 12 L50 20 L56 12 L68 16 L84 26 L90 74 L80 76 L72 38 L72 88 L28 88 L28 38 L20 76 L10 74 L16 26 Z',
  kurta: 'M33 14 L44 10 Q50 16 56 10 L67 14 L84 24 L90 66 L80 68 L72 36 L74 116 L26 116 L28 36 L20 68 L10 66 L16 24 Z',
  kurtaShort: 'M33 14 L44 10 Q50 16 56 10 L67 14 L84 24 L90 62 L80 64 L72 36 L73 90 L27 90 L28 36 L20 64 L10 62 L16 24 Z',
  kameez: 'M34 14 L44 10 Q50 18 56 10 L66 14 L82 24 L88 62 L78 64 L70 36 L80 116 L20 116 L30 36 L22 64 L12 62 L18 24 Z',
  kameezShort: 'M34 14 L44 10 Q50 18 56 10 L66 14 L82 24 L88 60 L78 62 L70 36 L76 92 L24 92 L30 36 L22 62 L12 60 L18 24 Z',
  waistcoat: 'M30 14 L44 12 L50 46 L56 12 L70 14 L74 30 L72 90 L54 94 L50 88 L46 94 L28 90 L26 30 Z',
  jacketL: 'M30 16 L44 12 L48 30 L48 92 L28 92 L28 40 L20 82 L10 80 L16 26 Z',
  jacketR: 'M70 16 L56 12 L52 30 L52 92 L72 92 L72 40 L80 82 L90 80 L84 26 Z',
  sherwani: 'M36 12 L64 12 L68 18 L84 26 L90 72 L80 74 L72 40 L76 120 L24 120 L28 40 L20 74 L10 72 L16 26 L32 18 Z',
  trousers: 'M30 10 L70 10 L72 118 L56 118 L50 40 L44 118 L28 118 Z',
  shalwar: 'M24 10 L76 10 Q88 62 70 112 L58 116 Q54 70 50 50 Q46 70 42 116 L30 112 Q12 62 24 10 Z',
  palazzo: 'M28 10 L72 10 L86 118 L54 118 L50 44 L46 118 L14 118 Z',
  legsShalwar: 'M30 84 L70 84 Q78 104 66 122 L56 122 L50 98 L44 122 L34 122 Q22 104 30 84 Z',
  legsStraight: 'M32 86 L68 86 L68 122 L54 122 L50 100 L46 122 L32 122 Z',
  dupatta: 'M20 8 Q50 30 80 8 L84 20 Q60 44 70 118 L54 118 Q46 50 16 20 Z',
  sash: 'M30 14 Q56 40 80 104 L71 108 Q50 52 25 20 Z',
  shawl: 'M10 22 L90 22 L82 102 L18 102 Z',
  dress: 'M36 12 L46 10 Q50 16 54 10 L64 12 L66 40 L90 118 L10 118 L34 40 Z',
  khussa: 'M8 34 Q12 18 32 18 L48 16 Q66 8 80 18 Q94 26 96 36 L96 42 L8 42 Z',
  chappal: 'M8 36 Q10 20 30 20 L70 20 Q90 22 94 36 L94 42 L8 42 Z',
  sneaker: 'M6 38 L10 18 L38 16 Q52 6 66 12 L90 26 Q96 32 94 42 L6 42 Z',
  oxford: 'M6 36 Q8 22 30 20 L56 18 Q78 18 92 30 Q96 34 94 42 L6 42 Z',
  heels: 'M12 42 L18 16 Q38 20 58 32 L86 34 Q92 36 90 42 L80 42 L78 38 L60 38 Z',
  bag: 'M22 50 L78 50 L84 110 L16 110 Z',
  cap: 'M16 74 Q20 40 50 38 Q80 40 84 74 Z',
};

const SHOES = ['khussa', 'chappal', 'sneaker', 'oxford', 'heels'];

export default function GarmentIllustration({ item, gender, width = 100 }) {
  const rawId = useId();
  const pid = `p${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const info = colorInfo(item.color);
  const base = info.hex;
  const printed = item.print || info.family === 'print';
  const dark = shade(base, -0.35);
  const light = shade(base, 0.25);
  const accent = item.accent ?? null;
  const fill = printed ? `url(#${pid})` : base;
  const shape = shapeFor(item, gender);

  const body = (d, extra) => <Path d={d} fill={fill} stroke={OUTLINE} strokeWidth={1.2} strokeLinejoin="round" {...extra} />;
  const plain = (d, color, extra) => <Path d={d} fill={color} stroke={OUTLINE} strokeWidth={1.2} strokeLinejoin="round" {...extra} />;
  const neckTrim = accent ? <Path d="M42 12 Q50 24 58 12 M50 18 L50 44" stroke={accent} strokeWidth={2.2} fill="none" /> : null;

  let art;
  switch (shape) {
    case 'tee':
      art = body(P.tee);
      break;
    case 'polo':
      art = (
        <G>
          {body(P.tee)}
          <Path d="M42 14 L50 26 L58 14" fill={light} stroke={OUTLINE} strokeWidth={1} />
          <Line x1={50} y1={26} x2={50} y2={38} stroke={dark} strokeWidth={1.2} />
        </G>
      );
      break;
    case 'sweater':
      art = (
        <G>
          {body(P.sweater)}
          <Path d="M29 84 L71 84" stroke={dark} strokeWidth={3} />
          <Path d="M43 12 Q50 22 57 12" stroke={dark} strokeWidth={2} fill="none" />
        </G>
      );
      break;
    case 'shirt':
      art = (
        <G>
          {body(P.shirt)}
          <Path d="M44 12 L50 24 L42 26 Z M56 12 L50 24 L58 26 Z" fill={light} stroke={OUTLINE} strokeWidth={1} />
          <Line x1={50} y1={24} x2={50} y2={88} stroke={dark} strokeWidth={1} />
          {[36, 50, 64, 78].map((y) => <Circle key={y} cx={50} cy={y} r={1.3} fill={dark} />)}
        </G>
      );
      break;
    case 'kurta':
      art = (
        <G>
          {body(P.kurta)}
          <Line x1={50} y1={14} x2={50} y2={42} stroke={dark} strokeWidth={1.2} />
          <Path d="M28 100 L26 116 M72 100 L74 116" stroke={dark} strokeWidth={1} />
          {neckTrim}
        </G>
      );
      break;
    case 'kameez':
      art = (
        <G>
          {body(P.kameez)}
          {accent ? <Path d="M40 12 Q50 30 60 12 M22 108 L78 108" stroke={accent} strokeWidth={2.4} fill="none" /> : null}
        </G>
      );
      break;
    case 'suit':
      art = (
        <G>
          {plain(P.legsShalwar, printed ? light : base)}
          {body(P.kurtaShort)}
          <Line x1={50} y1={14} x2={50} y2={40} stroke={dark} strokeWidth={1.2} />
          {neckTrim}
        </G>
      );
      break;
    case 'twopiece':
      art = (
        <G>
          {plain(P.legsStraight, printed ? light : shade(base, 0.12))}
          {body(P.kameezShort)}
          {accent ? <Path d="M40 12 Q50 30 60 12" stroke={accent} strokeWidth={2.4} fill="none" /> : null}
        </G>
      );
      break;
    case 'threepiece':
      art = (
        <G>
          {plain(P.legsStraight, printed ? light : shade(base, 0.12))}
          {body(P.kameezShort)}
          {accent ? <Path d="M40 12 Q50 30 60 12 M26 86 L74 86" stroke={accent} strokeWidth={2.4} fill="none" /> : null}
          {plain(P.sash, accent ? shade(base, 0.35) : light, { opacity: 0.92 })}
        </G>
      );
      break;
    case 'waistcoat':
      art = (
        <G>
          {body(P.waistcoat)}
          {[56, 66, 76].map((y) => <Circle key={y} cx={50} cy={y} r={1.6} fill={accent ?? dark} />)}
          <Path d="M32 62 L42 62 M58 62 L68 62" stroke={dark} strokeWidth={1.4} />
        </G>
      );
      break;
    case 'jacket':
      art = (
        <G>
          <Rect x={42} y={20} width={16} height={70} fill="rgba(0,0,0,0.12)" />
          {body(P.jacketL)}
          {body(P.jacketR)}
          <Path d="M44 12 L40 40 L48 34 M56 12 L60 40 L52 34" stroke={dark} strokeWidth={1.2} fill="none" />
        </G>
      );
      break;
    case 'sherwani':
      art = (
        <G>
          {body(P.sherwani)}
          <Rect x={36} y={8} width={28} height={8} rx={2} fill={accent ?? dark} />
          <Line x1={50} y1={16} x2={50} y2={120} stroke={dark} strokeWidth={1.2} />
          {[28, 40, 52, 64, 76].map((y) => <Circle key={y} cx={50} cy={y} r={1.8} fill={accent ?? dark} />)}
        </G>
      );
      break;
    case 'trousers':
    case 'jeans':
      art = (
        <G>
          {body(P.trousers)}
          <Rect x={30} y={10} width={40} height={6} fill={dark} />
          {shape === 'jeans' ? <Path d="M34 22 Q40 30 46 22 M54 22 Q60 30 66 22" stroke="#C99A2E" strokeWidth={1} fill="none" /> : null}
        </G>
      );
      break;
    case 'shalwar':
      art = (
        <G>
          {body(P.shalwar)}
          <Rect x={24} y={10} width={52} height={5} fill={dark} />
        </G>
      );
      break;
    case 'palazzo':
      art = (
        <G>
          {body(P.palazzo)}
          <Rect x={28} y={10} width={44} height={6} fill={dark} />
        </G>
      );
      break;
    case 'dupatta':
      art = (
        <G>
          {body(P.dupatta)}
          {[56, 60, 64, 68].map((x) => <Line key={x} x1={x} y1={118} x2={x} y2={123} stroke={accent ?? dark} strokeWidth={1} />)}
        </G>
      );
      break;
    case 'shawl':
      art = (
        <G>
          {body(P.shawl)}
          <Path d="M14 36 L86 36" stroke={accent ?? dark} strokeWidth={2} />
          {Array.from({ length: 16 }, (_, i) => 20 + i * 4).map((x) => <Line key={x} x1={x} y1={102} x2={x} y2={110} stroke={dark} strokeWidth={1} />)}
        </G>
      );
      break;
    case 'dress':
      art = (
        <G>
          {body(P.dress)}
          <Rect x={34} y={38} width={32} height={5} fill={accent ?? dark} />
          {accent ? <Path d="M18 106 L82 106" stroke={accent} strokeWidth={2.4} /> : null}
        </G>
      );
      break;
    case 'bag':
      art = (
        <G>
          <Path d="M34 50 Q34 26 50 26 Q66 26 66 50" stroke={dark} strokeWidth={3} fill="none" />
          {body(P.bag)}
        </G>
      );
      break;
    case 'cap':
      art = (
        <G>
          {body(P.cap)}
          {plain('M10 74 L90 74 L96 82 L4 82 Z', dark)}
        </G>
      );
      break;
    case 'watch':
      art = (
        <G>
          <Rect x={42} y={20} width={16} height={86} rx={4} fill={dark} />
          <Circle cx={50} cy={62} r={18} fill={fill} stroke={OUTLINE} strokeWidth={1.5} />
          <Circle cx={50} cy={62} r={13} fill="#F7F7F2" />
          <Path d="M50 62 L50 54 M50 62 L56 64" stroke="#1C1C1C" strokeWidth={1.5} />
        </G>
      );
      break;
    default:
      if (SHOES.includes(shape)) {
        const d = P[shape];
        const sole = shape === 'sneaker' ? '#F7F7F2' : dark;
        const one = (dy) => (
          <G key={dy} transform={`translate(0 ${dy})`}>
            {body(d)}
            <Rect x={8} y={40} width={86} height={3} fill={sole} />
            {accent ? <Path d="M30 26 Q50 18 70 24" stroke={accent} strokeWidth={2.4} fill="none" /> : null}
            {shape === 'sneaker' ? <Path d="M40 22 L60 34" stroke="#F7F7F2" strokeWidth={2.5} /> : null}
          </G>
        );
        art = <G>{[40, 72].map(one)}</G>;
      } else {
        art = body(P.shirt);
      }
  }

  return (
    <Svg width={width} height={width * 1.25} viewBox="0 0 100 125">
      {printed ? (
        <Defs>
          <Pattern id={pid} patternUnits="userSpaceOnUse" width={10} height={10}>
            <Rect width={10} height={10} fill={info.family === 'print' ? '#E8D3B4' : base} />
            <Circle cx={3} cy={3} r={1.8} fill={info.family === 'print' ? '#6E1F2A' : light} />
            <Circle cx={8} cy={8} r={1.4} fill={info.family === 'print' ? '#1F7A7A' : dark} />
          </Pattern>
        </Defs>
      ) : null}
      {art}
    </Svg>
  );
}
