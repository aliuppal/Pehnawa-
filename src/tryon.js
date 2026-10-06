// Photo-real virtual try-on through fal.ai's hosted FASHN model.
// Like the Claude key, the fal key lives on-device for testing only.
import { toDataUri } from './media';

const ENDPOINT = 'https://fal.run/fal-ai/fashn/tryon/v1.6';

const FAL_CATEGORY = { top: 'tops', layer: 'tops', bottom: 'bottoms', full: 'one-pieces' };

export const canAiTryOn = (item) => Boolean(item?.uri) && item.category in FAL_CATEGORY;

/** Returns the URL of a generated image showing the person wearing the garment. */
export async function aiTryOn(falKey, { personUri, garment }) {
  if (!falKey) throw new Error('Add a fal.ai key on the Me tab to use AI try-on.');
  if (!personUri) throw new Error('Take your photo on the Me tab first.');
  if (!canAiTryOn(garment)) throw new Error('AI try-on works with photographed tops, bottoms, layers and full suits.');

  const [model_image, garment_image] = await Promise.all([toDataUri(personUri), toDataUri(garment.uri)]);

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Key ${falKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_image,
        garment_image,
        category: FAL_CATEGORY[garment.category] ?? 'auto',
        mode: 'balanced',
        garment_photo_type: 'auto',
        output_format: 'jpeg',
      }),
    });
  } catch {
    throw new Error('Could not reach fal.ai. Check your internet connection.');
  }
  if (res.status === 401 || res.status === 403) throw new Error('fal.ai rejected that key. Check it on the Me tab.');
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Try-on failed (${res.status}). ${detail.slice(0, 160)}`);
  }
  const data = await res.json();
  const url = data?.images?.[0]?.url;
  if (!url) throw new Error('Try-on finished but returned no image.');
  return url;
}
