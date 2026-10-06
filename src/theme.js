import { Platform } from 'react-native';

// Warm ivory + emerald: a nod to Pakistani textiles without leaning on flag clichés.
export const color = {
  bg: '#F5F0E8',
  surface: '#FFFDF9',
  sunk: '#EDE6DA',
  ink: '#1D1A16',
  muted: '#6E665C',
  faint: '#A39A8E',
  line: '#E2D9CB',
  accent: '#0E5A47',
  accentInk: '#FFFFFF',
  accentSoft: '#DCEBE4',
  gold: '#B8892E',
  danger: '#A63A2B',
  dangerSoft: '#F6E1DC',
};

export const font = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui, -apple-system, "Segoe UI", sans-serif' }),
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };
