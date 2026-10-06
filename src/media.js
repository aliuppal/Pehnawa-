import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

const isWeb = Platform.OS === 'web';

/**
 * Open the camera or the gallery. Returns { uri, base64, mimeType } or null if cancelled.
 * Throws an Error with a user-facing message when permission is denied.
 */
export async function pickImage({ source = 'library', aspect = [3, 4], front = false } = {}) {
  if (source === 'camera' && !isWeb) {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('Camera permission is off. Enable it in Settings to take photos.');
  }
  const options = {
    mediaTypes: 'images',
    allowsEditing: true,
    aspect,
    quality: 0.6,
    base64: true,
    cameraType: front ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
  };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.length) return null;
  const a = result.assets[0];
  return { uri: a.uri, base64: a.base64 ?? null, mimeType: a.mimeType || 'image/jpeg' };
}

/** Copy a picked image somewhere that survives app restarts. Returns the stored uri. */
export function persistImage(picked) {
  if (isWeb) {
    // Blob URLs die on reload, so the web build keeps a data URI instead.
    return picked.base64 ? `data:${picked.mimeType};base64,${picked.base64}` : picked.uri;
  }
  const dir = new Directory(Paths.document, 'pehnawa');
  dir.create({ idempotent: true });
  const ext = picked.mimeType?.includes('png') ? 'png' : 'jpg';
  const dest = new File(dir, `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`);
  new File(picked.uri).copy(dest);
  return dest.uri;
}

export function deleteImage(uri) {
  if (isWeb || !uri || uri.startsWith('data:')) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // Already gone; nothing to clean up.
  }
}

/** Returns { base64, mimeType } for any uri the app produces (file://, data:, blob:, https:). */
export async function readBase64(uri) {
  if (uri.startsWith('data:')) {
    const [head, data] = uri.split(',');
    return { base64: data, mimeType: head.slice(5, head.indexOf(';')) || 'image/jpeg' };
  }
  if (!isWeb && uri.startsWith('file:')) {
    const base64 = await new File(uri).base64();
    return { base64, mimeType: uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg' };
  }
  const blob = await (await fetch(uri)).blob();
  const dataUri = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return readBase64(dataUri);
}

export async function toDataUri(uri) {
  const { base64, mimeType } = await readBase64(uri);
  return `data:${mimeType};base64,${base64}`;
}
