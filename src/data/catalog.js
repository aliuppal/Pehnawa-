// Shared vocabulary for garments. Keys are what gets stored and sent to the AI.

export const CATEGORIES = [
  { key: 'top', icon: 'square', label: { male: 'Shirt / Kurta', female: 'Top / Kameez' } },
  { key: 'bottom', icon: 'columns', label: { male: 'Trousers / Shalwar', female: 'Trousers / Shalwar' } },
  { key: 'full', icon: 'user', label: { male: 'Full suit / Set', female: 'Dress / 3-piece' } },
  { key: 'layer', icon: 'layers', label: { male: 'Jacket / Waistcoat', female: 'Jacket / Shawl' } },
  { key: 'shoes', icon: 'anchor', label: { male: 'Shoes / Khussa', female: 'Shoes / Khussa' } },
  { key: 'extra', icon: 'star', label: { male: 'Watch / Cap', female: 'Dupatta / Bag' } },
];

export const categoryLabel = (key, gender) =>
  CATEGORIES.find((c) => c.key === key)?.label[gender] ?? key;

// family: neutral colors pair with anything; hue drives the harmony math.
export const COLORS = [
  { key: 'black', hex: '#1C1C1C', family: 'neutral' },
  { key: 'white', hex: '#F7F7F2', family: 'neutral' },
  { key: 'grey', hex: '#8F8F8F', family: 'neutral' },
  { key: 'navy', hex: '#1F2E4D', family: 'neutral' },
  { key: 'beige', hex: '#D8C3A0', family: 'neutral' },
  { key: 'brown', hex: '#6B4A32', family: 'neutral' },
  { key: 'olive', hex: '#6B6B34', hue: 60 },
  { key: 'maroon', hex: '#6E1F2A', hue: 350 },
  { key: 'red', hex: '#C2332F', hue: 0 },
  { key: 'pink', hex: '#E59AB0', hue: 340 },
  { key: 'orange', hex: '#E07B39', hue: 25 },
  { key: 'mustard', hex: '#C99A2E', hue: 45 },
  { key: 'yellow', hex: '#EBCB4B', hue: 55 },
  { key: 'green', hex: '#2F7D4F', hue: 140 },
  { key: 'teal', hex: '#1F7A7A', hue: 180 },
  { key: 'blue', hex: '#2F6BC2', hue: 215 },
  { key: 'sky', hex: '#9CC3E6', hue: 205 },
  { key: 'purple', hex: '#6A3F8F', hue: 280 },
  { key: 'lavender', hex: '#B9A7D9', hue: 265 },
  { key: 'print', hex: '#C9A27A', family: 'print' },
];

export const colorInfo = (key) => COLORS.find((c) => c.key === key) ?? COLORS[2];

export const STYLES = [
  { key: 'casual', label: 'Casual' },
  { key: 'formal', label: 'Office / Formal' },
  { key: 'eastern', label: 'Eastern' },
  { key: 'party', label: 'Party / Wedding' },
  { key: 'sport', label: 'Sport' },
];

export const WARMTH = [
  { key: 'light', label: 'Light (lawn, cotton)' },
  { key: 'mid', label: 'Mid (linen, denim)' },
  { key: 'warm', label: 'Warm (khaddar, wool)' },
];

export const OCCASIONS = [
  { key: 'casual', label: 'Casual' },
  { key: 'formal', label: 'Office' },
  { key: 'eastern', label: 'Jummah / Eastern' },
  { key: 'party', label: 'Dawat / Party' },
];

export const WEATHER = [
  { key: 'hot', label: 'Hot', icon: 'sun' },
  { key: 'mild', label: 'Mild', icon: 'cloud' },
  { key: 'cold', label: 'Cold', icon: 'cloud-snow' },
];

// Pakistani seasons: May–Sep hot, Dec–Feb cold, the rest mild.
export function defaultWeather(date = new Date()) {
  const m = date.getMonth();
  if (m >= 4 && m <= 8) return 'hot';
  if (m === 11 || m <= 1) return 'cold';
  return 'mild';
}

// Friday leans eastern for Jummah; weekends casual; weekdays office.
export function defaultOccasion(date = new Date()) {
  const d = date.getDay();
  if (d === 5) return 'eastern';
  if (d === 0 || d === 6) return 'casual';
  return 'formal';
}
