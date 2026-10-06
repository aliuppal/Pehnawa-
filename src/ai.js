// Claude-powered stylist and garment tagger.
// The API key is entered on the Me screen and kept on-device. That is fine for personal
// testing; a production build must proxy these calls through your own server instead.
import Anthropic from '@anthropic-ai/sdk';
import { CATEGORIES, COLORS, STYLES, WARMTH } from './data/catalog';

const MODEL = 'claude-opus-5-5';

function client(apiKey) {
  if (!apiKey) throw new Error('Add your Claude API key on the Me tab to use the AI stylist.');
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1, timeout: 90_000 });
}

async function askJson(apiKey, { system, content, schema }) {
  let response;
  try {
    response = await client(apiKey).beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema } },
      system,
      messages: [{ role: 'user', content }],
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) throw new Error('That Claude API key was rejected. Check it on the Me tab.');
    if (error instanceof Anthropic.RateLimitError) throw new Error('Too many requests right now. Try again in a minute.');
    if (error instanceof Anthropic.APIConnectionError) throw new Error('Could not reach Claude. Check your internet connection.');
    if (error instanceof Anthropic.APIError) throw new Error(`Claude returned an error (${error.status}). ${error.message}`);
    throw error;
  }
  if (response.stop_reason === 'refusal') throw new Error('The stylist could not help with that one.');
  if (response.stop_reason === 'max_tokens') throw new Error('The stylist ran out of room. Try again.');
  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('The stylist returned an empty answer.');
  return JSON.parse(text);
}

const keys = (list) => list.map((x) => x.key);

/** Look at one garment photo and fill in the closet form. */
export async function tagGarment(apiKey, { base64, mimeType }, gender) {
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'category', 'color', 'style', 'warmth'],
    properties: {
      name: { type: 'string', description: 'Short everyday name, e.g. "Mustard lawn kameez" or "Navy chinos".' },
      category: { type: 'string', enum: keys(CATEGORIES) },
      color: { type: 'string', enum: keys(COLORS) },
      style: { type: 'string', enum: keys(STYLES) },
      warmth: { type: 'string', enum: keys(WARMTH) },
    },
  };
  return askJson(apiKey, {
    system:
      'You catalogue clothes for a Pakistani wardrobe app. Use local garment names where they fit ' +
      '(kameez, kurta, shalwar, dupatta, khussa, waistcoat). Categories: top, bottom, full (a complete suit, ' +
      'dress or 3-piece), layer (jacket, waistcoat, shawl), shoes, extra (dupatta, bag, watch, cap). ' +
      'Use "print" as the colour when a pattern dominates. Warmth: light = lawn/cotton, mid = linen/denim, warm = khaddar/wool.',
    content: [
      { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
      { type: 'text', text: `Tag this garment. The wearer is ${gender}.` },
    ],
    schema,
  });
}

/**
 * Ask Claude for today's outfits. Only garment metadata is sent, never photos.
 * Returns [{ items, title, reasons }] with ids validated against the closet.
 */
export async function suggestOutfits(apiKey, { wardrobe, gender, occasion, weather, recentIds, name }) {
  const closet = wardrobe.map(({ id, name: n, category, color, style, warmth }) => ({ id, name: n, category, color, style, warmth }));
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['outfits'],
    properties: {
      outfits: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['item_ids', 'title', 'why'],
          properties: {
            item_ids: { type: 'array', items: { type: 'string' } },
            title: { type: 'string', description: 'A short, evocative name for the look (max 4 words).' },
            why: { type: 'string', description: 'One or two sentences on why it works today.' },
          },
        },
      },
    },
  };
  const data = await askJson(apiKey, {
    system:
      'You are a warm, practical personal stylist who knows Pakistani dressing: shalwar kameez, kurta, lawn in summer, ' +
      'khaddar and shawls in winter, eastern wear for Jummah and dawats. Build outfits only from the closet given. ' +
      'Each outfit is either one "full" piece or a top plus a bottom, then shoes if any exist, then a layer only if the ' +
      'weather calls for it, and a dupatta-style extra when it suits a woman\'s eastern look. Avoid recently worn items ' +
      'when there is an alternative. Return 3 to 5 varied outfits, best first.',
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          wearer: { name: name || undefined, gender },
          today: { occasion, weather, date: new Date().toDateString() },
          recently_worn_ids: recentIds,
          closet,
        }),
      },
    ],
    schema,
  });

  const byId = new Map(wardrobe.map((i) => [i.id, i]));
  return (data.outfits ?? [])
    .map((o, idx) => {
      const items = [...new Set(o.item_ids)].map((id) => byId.get(id)).filter(Boolean);
      return { id: `ai-${idx}-${items.map((i) => i.id).join('-')}`, items, title: o.title, reasons: [o.why], ai: true };
    })
    .filter((o) => o.items.length >= 1);
}
