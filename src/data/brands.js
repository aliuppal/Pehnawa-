// Pakistani clothing brands, grouped by who they dress.
// price: 1 = budget, 2 = mid, 3 = premium, 4 = luxury.
// Store URLs were correct at time of writing; brands do move domains, so check before release.

export const BRAND_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'eastern', label: 'Eastern' },
  { key: 'western', label: 'Western' },
  { key: 'formal', label: 'Formal' },
  { key: 'luxury', label: 'Luxury' },
];

export const BRANDS = [
  // ── Women ──────────────────────────────────────────
  { id: 'khaadi-w', name: 'Khaadi', gender: 'female', types: ['eastern'], price: 2, url: 'https://pk.khaadi.com',
    note: 'Hand-woven roots; known for ready-to-wear kurtas and seasonal unstitched lawn.',
    looks: ['Printed lawn kurta + cigarette pants', 'Khaddar 3-piece for winter'] },
  { id: 'gulahmed-w', name: 'Gul Ahmed', gender: 'female', types: ['eastern'], price: 2, url: 'https://www.gulahmedshop.com',
    note: 'One of the oldest textile houses; huge unstitched lawn and chiffon range.',
    looks: ['Summer lawn 3-piece', 'Embroidered chiffon for dawat'] },
  { id: 'sapphire-w', name: 'Sapphire', gender: 'female', types: ['eastern', 'western'], price: 2, url: 'https://pk.sapphireonline.pk',
    note: 'Clean prints, strong pret line and a western capsule.',
    looks: ['Pret kurta with straight trousers', 'Linen co-ord set'] },
  { id: 'alkaram-w', name: 'Alkaram Studio', gender: 'female', types: ['eastern'], price: 2, url: 'https://www.alkaramstudio.com',
    note: 'Reliable everyday lawn and karandi with frequent sales.',
    looks: ['Two-piece printed lawn', 'Karandi suit for winter'] },
  { id: 'limelight-w', name: 'Limelight', gender: 'female', types: ['eastern', 'western'], price: 1, url: 'https://www.limelight.pk',
    note: 'Budget-friendly pret and accessories for daily wear.',
    looks: ['Short kurti + jeans', 'Printed shirt with culottes'] },
  { id: 'nishat-w', name: 'Nishat Linen', gender: 'female', types: ['eastern'], price: 2, url: 'https://nishatlinen.com',
    note: 'Classic cuts and fabrics, from lawn to festive.',
    looks: ['Embroidered lawn 3-piece', 'Festive raw silk'] },
  { id: 'sanasafinaz-w', name: 'Sana Safinaz', gender: 'female', types: ['eastern', 'luxury'], price: 3, url: 'https://www.sanasafinaz.com',
    note: 'Premium pret and luxury lawn with editorial prints.',
    looks: ['Luxury lawn with silk dupatta', 'Muzlin festive set'] },
  { id: 'mariab-w', name: 'Maria.B', gender: 'female', types: ['eastern', 'formal', 'luxury'], price: 3, url: 'https://www.mariab.pk',
    note: 'Statement embroidery; popular for weddings and Eid.',
    looks: ['Embroidered formal for mehndi', 'M.Prints everyday kurta'] },
  { id: 'agha-noor-w', name: 'Agha Noor', gender: 'female', types: ['eastern', 'formal'], price: 3, url: 'https://www.aghanoorofficial.com',
    note: 'Lahore label loved for its festive pret.',
    looks: ['Chikankari-style kurta', 'Festive gharara set'] },
  { id: 'asimjofa-w', name: 'Asim Jofa', gender: 'female', types: ['formal', 'luxury'], price: 4, url: 'https://www.asimjofa.com',
    note: 'Couture and luxury formals for big occasions.',
    looks: ['Luxury chiffon formal', 'Bridal-adjacent lehenga'] },
  { id: 'beechtree-w', name: 'Beechtree', gender: 'female', types: ['eastern', 'western'], price: 2, url: 'https://beechtree.pk',
    note: 'Trend-led pret plus western basics.',
    looks: ['Printed co-ord', 'Basic tee + wide-leg trousers'] },
  { id: 'generation-w', name: 'Generation', gender: 'female', types: ['eastern'], price: 2, url: 'https://generation.com.pk',
    note: 'Quirky, colourful prints with a desi heart.',
    looks: ['Block-print kurta', 'Printed shalwar kameez'] },
  { id: 'bonanza-w', name: 'Bonanza Satrangi', gender: 'female', types: ['eastern'], price: 2, url: 'https://bonanzasatrangi.com',
    note: 'Wide range across pret, unstitched and winter wear.',
    looks: ['Two-piece pret', 'Woolen shawl look'] },
  { id: 'outfitters-w', name: 'Outfitters', gender: 'female', types: ['western'], price: 2, url: 'https://outfitters.com.pk',
    note: 'Go-to for western casual: denim, tees, knitwear.',
    looks: ['Mom jeans + oversized tee', 'Knit cardigan layer'] },
  { id: 'jdot-w', name: 'J.', gender: 'female', types: ['eastern'], price: 2, url: 'https://www.junaidjamshed.com',
    note: 'Modest, family-friendly eastern wear and fragrances.',
    looks: ['Printed lawn suit', 'Embroidered kurta for Eid'] },

  // ── Men ────────────────────────────────────────────
  { id: 'jdot-m', name: 'J.', gender: 'male', types: ['eastern'], price: 2, url: 'https://www.junaidjamshed.com',
    note: 'Staple for kurta shalwar, waistcoats and Eid wear.',
    looks: ['Wash-n-wear kameez shalwar', 'Kurta + waistcoat for Jummah'] },
  { id: 'bonanza-m', name: 'Bonanza Satrangi', gender: 'male', types: ['eastern', 'western'], price: 2, url: 'https://bonanzasatrangi.com',
    note: 'Eastern suits plus winter jackets and sweaters.',
    looks: ['Cotton kameez shalwar', 'Sweater over collared shirt'] },
  { id: 'edenrobe-m', name: 'Edenrobe', gender: 'male', types: ['eastern', 'western'], price: 2, url: 'https://edenrobe.com',
    note: 'Smart casual and eastern pieces at fair prices.',
    looks: ['Kurta with straight pajama', 'Polo + chinos'] },
  { id: 'diners-m', name: 'Diners', gender: 'male', types: ['formal', 'western'], price: 2, url: 'https://diners.com.pk',
    note: 'Formal shirts, suits and a solid eastern line.',
    looks: ['Two-piece suit for office', 'Dress shirt + trousers'] },
  { id: 'charcoal-m', name: 'Charcoal', gender: 'male', types: ['formal', 'western'], price: 3, url: 'https://charcoal.com.pk',
    note: 'Sharp tailoring and smart-casual separates.',
    looks: ['Blazer + tee smart casual', 'Slim-fit formal shirt'] },
  { id: 'outfitters-m', name: 'Outfitters', gender: 'male', types: ['western'], price: 2, url: 'https://outfitters.com.pk',
    note: 'Denim, graphic tees, hoodies and sneakers.',
    looks: ['Jeans + graphic tee', 'Hoodie layer for winter'] },
  { id: 'cougar-m', name: 'Cougar', gender: 'male', types: ['western'], price: 2, url: 'https://www.cougar.com.pk',
    note: 'Casual western wear with a denim focus.',
    looks: ['Denim jacket + chinos', 'Henley + jeans'] },
  { id: 'breakout-m', name: 'Breakout', gender: 'male', types: ['western'], price: 2, url: 'https://www.breakout.com.pk',
    note: 'Youthful western casual and seasonal drops.',
    looks: ['Oversized tee + cargo', 'Bomber jacket look'] },
  { id: 'engine-m', name: 'Engine', gender: 'male', types: ['western'], price: 1, url: 'https://engine.com.pk',
    note: 'Affordable basics and casual wear.',
    looks: ['Basic polo + jeans', 'Printed shirt'] },
  { id: 'uniworth-m', name: 'Uniworth', gender: 'male', types: ['formal'], price: 2, url: 'https://uniworthshop.com',
    note: 'Long-standing name for formal shirts and ties.',
    looks: ['White formal shirt + tie', 'Dress trousers'] },
  { id: 'gulahmed-m', name: 'Gul Ahmed Ideas Man', gender: 'male', types: ['eastern', 'western'], price: 2, url: 'https://www.gulahmedshop.com',
    note: 'Unstitched fabric and ready-made kurtas.',
    looks: ['Unstitched wash-n-wear suit', 'Kurta for Eid'] },
  { id: 'amiradnan-m', name: 'Amir Adnan', gender: 'male', types: ['formal', 'luxury'], price: 4, url: 'https://amiradnan.com',
    note: 'Sherwanis, prince coats and wedding formals.',
    looks: ['Sherwani for barat', 'Prince coat for walima'] },
];

export const brandsFor = (gender) => BRANDS.filter((b) => b.gender === gender);

// ── Sample pieces ────────────────────────────────────
// Illustrative pieces in the spirit of each brand's range, not real catalogue items.
// They use the same fields as closet items, so they can be tried on and added as-is.
const GOLD = '#C9A24A';
const p = (name, category, color, style, warmth, extra = {}) => ({ name, category, color, style, warmth, ...extra });

const PIECES = {
  'khaadi-w': [
    p('Printed lawn kurta', 'top', 'mustard', 'eastern', 'light', { shape: 'kameez', print: true }),
    p('Straight cotton trousers', 'bottom', 'white', 'eastern', 'light', { shape: 'trousers' }),
    p('Khaddar 3-piece', 'full', 'maroon', 'eastern', 'warm', { shape: 'threepiece' }),
  ],
  'gulahmed-w': [
    p('Summer lawn 3-piece', 'full', 'sky', 'eastern', 'light', { shape: 'threepiece', print: true }),
    p('Embroidered chiffon suit', 'full', 'teal', 'party', 'mid', { shape: 'threepiece', accent: GOLD }),
    p('Printed lawn dupatta', 'extra', 'print', 'eastern', 'light', { shape: 'dupatta' }),
  ],
  'sapphire-w': [
    p('Pret kurta', 'top', 'green', 'eastern', 'light', { shape: 'kameez' }),
    p('Linen co-ord set', 'full', 'beige', 'casual', 'mid', { shape: 'twopiece' }),
    p('Straight trousers', 'bottom', 'black', 'formal', 'mid', { shape: 'trousers' }),
  ],
  'alkaram-w': [
    p('Printed lawn two-piece', 'full', 'pink', 'eastern', 'light', { shape: 'twopiece', print: true }),
    p('Karandi 3-piece', 'full', 'brown', 'eastern', 'warm', { shape: 'threepiece' }),
    p('Cambric shalwar', 'bottom', 'white', 'eastern', 'light', { shape: 'shalwar' }),
  ],
  'limelight-w': [
    p('Printed short kurti', 'top', 'orange', 'casual', 'light', { shape: 'kameez', print: true }),
    p('Relaxed shirt', 'top', 'lavender', 'casual', 'light', { shape: 'shirt' }),
    p('Culottes', 'bottom', 'beige', 'casual', 'light', { shape: 'palazzo' }),
  ],
  'nishat-w': [
    p('Embroidered lawn 3-piece', 'full', 'lavender', 'eastern', 'light', { shape: 'threepiece', accent: GOLD }),
    p('Raw silk festive suit', 'full', 'mustard', 'party', 'mid', { shape: 'threepiece', accent: GOLD }),
    p('Velvet shawl', 'layer', 'maroon', 'party', 'warm', { shape: 'shawl', accent: GOLD }),
  ],
  'sanasafinaz-w': [
    p('Luxury lawn 3-piece', 'full', 'teal', 'eastern', 'light', { shape: 'threepiece', print: true }),
    p('Silk dupatta', 'extra', 'pink', 'party', 'light', { shape: 'dupatta', accent: GOLD }),
    p('Muzlin festive kurta', 'top', 'purple', 'party', 'mid', { shape: 'kameez', accent: GOLD }),
  ],
  'mariab-w': [
    p('Embroidered mehndi formal', 'full', 'yellow', 'party', 'mid', { shape: 'threepiece', accent: '#2F7D4F' }),
    p('Festive gharara set', 'full', 'green', 'party', 'mid', { shape: 'dress', accent: GOLD }),
    p('Printed everyday kurta', 'top', 'print', 'casual', 'light', { shape: 'kameez' }),
  ],
  'agha-noor-w': [
    p('Chikankari kurta', 'top', 'white', 'eastern', 'light', { shape: 'kameez', accent: '#B9A7D9' }),
    p('Festive gharara', 'full', 'pink', 'party', 'mid', { shape: 'dress', accent: GOLD }),
    p('Organza dupatta', 'extra', 'mustard', 'party', 'light', { shape: 'dupatta' }),
  ],
  'asimjofa-w': [
    p('Luxury chiffon formal', 'full', 'maroon', 'party', 'mid', { shape: 'threepiece', accent: GOLD }),
    p('Embellished lehenga', 'full', 'red', 'party', 'mid', { shape: 'dress', accent: GOLD }),
    p('Embellished khussa', 'shoes', 'mustard', 'party', 'mid', { shape: 'khussa', accent: '#F7F7F2' }),
  ],
  'beechtree-w': [
    p('Printed co-ord set', 'full', 'print', 'casual', 'light', { shape: 'twopiece' }),
    p('Basic tee', 'top', 'white', 'casual', 'light', { shape: 'tee' }),
    p('Wide-leg trousers', 'bottom', 'olive', 'casual', 'mid', { shape: 'palazzo' }),
  ],
  'generation-w': [
    p('Block-print kurta', 'top', 'blue', 'eastern', 'light', { shape: 'kameez', print: true }),
    p('Printed shalwar', 'bottom', 'print', 'eastern', 'light', { shape: 'shalwar' }),
    p('Cotton dupatta', 'extra', 'red', 'eastern', 'light', { shape: 'dupatta' }),
  ],
  'bonanza-w': [
    p('Two-piece pret', 'full', 'sky', 'eastern', 'light', { shape: 'twopiece' }),
    p('Woolen shawl', 'layer', 'grey', 'eastern', 'warm', { shape: 'shawl' }),
    p('Khaddar kurta', 'top', 'olive', 'eastern', 'warm', { shape: 'kameez' }),
  ],
  'outfitters-w': [
    p('Mom jeans', 'bottom', 'blue', 'casual', 'mid', { shape: 'jeans' }),
    p('Oversized tee', 'top', 'black', 'casual', 'light', { shape: 'tee' }),
    p('Knit cardigan', 'layer', 'beige', 'casual', 'warm', { shape: 'jacket' }),
  ],
  'jdot-w': [
    p('Printed lawn 3-piece', 'full', 'green', 'eastern', 'light', { shape: 'threepiece', print: true }),
    p('Embroidered Eid kurta', 'top', 'white', 'eastern', 'light', { shape: 'kameez', accent: GOLD }),
    p('Classic khussa', 'shoes', 'mustard', 'eastern', 'mid', { shape: 'khussa' }),
  ],
  'jdot-m': [
    p('Wash-n-wear kameez shalwar', 'full', 'white', 'eastern', 'light', { shape: 'suit' }),
    p('Jummah kurta', 'top', 'sky', 'eastern', 'light', { shape: 'kurta' }),
    p('Black waistcoat', 'layer', 'black', 'eastern', 'mid', { shape: 'waistcoat' }),
  ],
  'bonanza-m': [
    p('Cotton kameez shalwar', 'full', 'beige', 'eastern', 'light', { shape: 'suit' }),
    p('V-neck sweater', 'layer', 'navy', 'casual', 'warm', { shape: 'sweater' }),
    p('Collared shirt', 'top', 'sky', 'formal', 'light', { shape: 'shirt' }),
  ],
  'edenrobe-m': [
    p('Cotton kurta', 'top', 'maroon', 'eastern', 'light', { shape: 'kurta' }),
    p('Straight pajama', 'bottom', 'white', 'eastern', 'light', { shape: 'trousers' }),
    p('Pique polo', 'top', 'olive', 'casual', 'light', { shape: 'polo' }),
  ],
  'diners-m': [
    p('Suit blazer', 'layer', 'navy', 'formal', 'mid', { shape: 'jacket' }),
    p('Dress shirt', 'top', 'white', 'formal', 'light', { shape: 'shirt' }),
    p('Formal trousers', 'bottom', 'grey', 'formal', 'mid', { shape: 'trousers' }),
  ],
  'charcoal-m': [
    p('Textured blazer', 'layer', 'grey', 'formal', 'mid', { shape: 'jacket' }),
    p('Slim formal shirt', 'top', 'sky', 'formal', 'light', { shape: 'shirt' }),
    p('Chinos', 'bottom', 'beige', 'casual', 'mid', { shape: 'trousers' }),
  ],
  'outfitters-m': [
    p('Slim jeans', 'bottom', 'navy', 'casual', 'mid', { shape: 'jeans' }),
    p('Graphic tee', 'top', 'white', 'casual', 'light', { shape: 'tee', print: true }),
    p('Pullover hoodie', 'layer', 'grey', 'casual', 'warm', { shape: 'sweater' }),
  ],
  'cougar-m': [
    p('Denim jacket', 'layer', 'blue', 'casual', 'warm', { shape: 'jacket' }),
    p('Henley tee', 'top', 'olive', 'casual', 'light', { shape: 'tee' }),
    p('Brown chinos', 'bottom', 'brown', 'casual', 'mid', { shape: 'trousers' }),
  ],
  'breakout-m': [
    p('Oversized tee', 'top', 'black', 'casual', 'light', { shape: 'tee' }),
    p('Cargo pants', 'bottom', 'olive', 'casual', 'mid', { shape: 'trousers' }),
    p('Bomber jacket', 'layer', 'navy', 'casual', 'warm', { shape: 'jacket' }),
  ],
  'engine-m': [
    p('Basic polo', 'top', 'red', 'casual', 'light', { shape: 'polo' }),
    p('Printed shirt', 'top', 'print', 'casual', 'light', { shape: 'shirt' }),
    p('Canvas sneakers', 'shoes', 'white', 'casual', 'mid', { shape: 'sneaker' }),
  ],
  'uniworth-m': [
    p('White formal shirt', 'top', 'white', 'formal', 'light', { shape: 'shirt' }),
    p('Dress trousers', 'bottom', 'navy', 'formal', 'mid', { shape: 'trousers' }),
    p('Leather oxfords', 'shoes', 'brown', 'formal', 'mid', { shape: 'oxford' }),
  ],
  'gulahmed-m': [
    p('Wash-n-wear suit', 'full', 'grey', 'eastern', 'light', { shape: 'suit' }),
    p('Cream Eid kurta', 'top', 'beige', 'eastern', 'light', { shape: 'kurta', accent: GOLD }),
    p('Peshawari chappal', 'shoes', 'brown', 'eastern', 'mid', { shape: 'chappal' }),
  ],
  'amiradnan-m': [
    p('Embroidered sherwani', 'full', 'beige', 'party', 'warm', { shape: 'sherwani', accent: GOLD }),
    p('Prince coat', 'layer', 'black', 'party', 'warm', { shape: 'sherwani', accent: GOLD }),
    p('Wedding khussa', 'shoes', 'mustard', 'party', 'mid', { shape: 'khussa', accent: '#F7F7F2' }),
  ],
};

/** Sample pieces for a brand, ready to try on or add to the closet. */
export const piecesFor = (brand) =>
  (PIECES[brand.id] ?? []).map((piece, i) => ({
    ...piece,
    id: `${brand.id}-${i}`,
    sourceId: `${brand.id}-${i}`,
    brand: brand.name,
    gender: brand.gender,
    uri: null,
  }));
