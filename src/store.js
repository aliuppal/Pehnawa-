import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteImage } from './media';

const STORAGE_KEY = 'pehnawa:v1';

const initialState = {
  hydrated: false,
  profile: { name: '', gender: 'female', photoUri: null },
  wardrobe: [],
  wornLog: [], // [{ date: 'YYYY-MM-DD', itemIds: [] }]
  settings: { anthropicKey: '', falKey: '' },
  // Not persisted: pieces handed to the Try On screen from elsewhere.
  tryOnQueue: [],
};

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.payload, hydrated: true };
    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'addItem':
      return { ...state, wardrobe: [action.item, ...state.wardrobe] };
    case 'updateItem':
      return { ...state, wardrobe: state.wardrobe.map((i) => (i.id === action.item.id ? action.item : i)) };
    case 'removeItem':
      return {
        ...state,
        wardrobe: state.wardrobe.filter((i) => i.id !== action.id),
        tryOnQueue: state.tryOnQueue.filter((i) => i.id !== action.id),
      };
    case 'addItems':
      return { ...state, wardrobe: [...action.items, ...state.wardrobe] };
    case 'wear': {
      const date = todayKey();
      const rest = state.wornLog.filter((w) => w.date !== date);
      return { ...state, wornLog: [{ date, itemIds: action.itemIds }, ...rest].slice(0, 60) };
    }
    case 'tryOn':
      return { ...state, tryOnQueue: action.items };
    case 'reset':
      return { ...initialState, hydrated: true, settings: state.settings };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        dispatch({ type: 'hydrate', payload: raw ? JSON.parse(raw) : {} });
      } catch {
        dispatch({ type: 'hydrate', payload: {} });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const { profile, wardrobe, wornLog, settings } = state;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, wardrobe, wornLog, settings })).catch(() => {});
    }, 250);
  }, [state]);

  const actions = useMemo(
    () => ({
      setProfile: (patch) => dispatch({ type: 'profile', patch }),
      setSettings: (patch) => dispatch({ type: 'settings', patch }),
      addItem: (item) => dispatch({ type: 'addItem', item }),
      addItems: (items) => dispatch({ type: 'addItems', items }),
      updateItem: (item) => dispatch({ type: 'updateItem', item }),
      removeItem: (item) => {
        if (item.uri) deleteImage(item.uri);
        dispatch({ type: 'removeItem', id: item.id });
      },
      wear: (itemIds) => dispatch({ type: 'wear', itemIds }),
      sendToTryOn: (items) => dispatch({ type: 'tryOn', items }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    []
  );

  return <StoreContext.Provider value={{ state, ...actions }}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);

// Swatch-only starter closets so every screen can be tested before taking photos.
export function sampleWardrobe(gender) {
  const now = new Date().toISOString();
  const mk = (name, category, color, style, warmth = 'mid') => ({
    id: newId(), uri: null, name, category, color, style, warmth, createdAt: now, sample: true,
  });
  if (gender === 'male') {
    return [
      mk('White kurta', 'top', 'white', 'eastern', 'light'),
      mk('Navy kameez shalwar', 'full', 'navy', 'eastern', 'light'),
      mk('Sky blue oxford shirt', 'top', 'sky', 'formal', 'light'),
      mk('Olive polo', 'top', 'olive', 'casual', 'light'),
      mk('Black tee', 'top', 'black', 'casual', 'light'),
      mk('Charcoal trousers', 'bottom', 'grey', 'formal'),
      mk('Beige chinos', 'bottom', 'beige', 'casual'),
      mk('Dark jeans', 'bottom', 'navy', 'casual'),
      mk('White shalwar', 'bottom', 'white', 'eastern', 'light'),
      mk('Maroon waistcoat', 'layer', 'maroon', 'eastern', 'warm'),
      mk('Brown leather jacket', 'layer', 'brown', 'casual', 'warm'),
      mk('Brown peshawari chappal', 'shoes', 'brown', 'eastern'),
      mk('White sneakers', 'shoes', 'white', 'casual'),
      mk('Black oxfords', 'shoes', 'black', 'formal'),
    ];
  }
  return [
    mk('Mustard lawn kameez', 'top', 'mustard', 'eastern', 'light'),
    mk('Pink printed kurti', 'top', 'pink', 'casual', 'light'),
    mk('White linen shirt', 'top', 'white', 'formal', 'light'),
    mk('Teal embroidered 3-piece', 'full', 'teal', 'party', 'mid'),
    mk('Maroon khaddar suit', 'full', 'maroon', 'eastern', 'warm'),
    mk('White cigarette pants', 'bottom', 'white', 'eastern', 'light'),
    mk('Beige palazzo', 'bottom', 'beige', 'casual', 'light'),
    mk('Black straight trousers', 'bottom', 'black', 'formal'),
    mk('Blue jeans', 'bottom', 'blue', 'casual'),
    mk('Printed chiffon dupatta', 'extra', 'print', 'eastern', 'light'),
    mk('Beige pashmina shawl', 'layer', 'beige', 'eastern', 'warm'),
    mk('Denim jacket', 'layer', 'blue', 'casual', 'warm'),
    mk('Gold khussa', 'shoes', 'mustard', 'eastern'),
    mk('Nude block heels', 'shoes', 'beige', 'party'),
    mk('White sneakers', 'shoes', 'white', 'casual'),
  ];
}
