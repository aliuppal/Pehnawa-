import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StoreProvider, useStore } from './src/store';
import { color, font } from './src/theme';
import TodayScreen from './src/screens/TodayScreen';
import ClosetScreen from './src/screens/ClosetScreen';
import TryOnScreen from './src/screens/TryOnScreen';
import BrandsScreen from './src/screens/BrandsScreen';
import MeScreen from './src/screens/MeScreen';

const TABS = [
  { key: 'today', label: 'Today', icon: 'sun', Screen: TodayScreen },
  { key: 'closet', label: 'Closet', icon: 'grid', Screen: ClosetScreen },
  { key: 'tryon', label: 'Try On', icon: 'eye', Screen: TryOnScreen },
  { key: 'brands', label: 'Brands', icon: 'shopping-bag', Screen: BrandsScreen },
  { key: 'me', label: 'Me', icon: 'user', Screen: MeScreen },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Shell() {
  const { state } = useStore();
  const [tab, setTab] = useState('today');
  const insets = useSafeAreaInsets();

  if (!state.hydrated) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={color.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.body}>
        {/* Screens stay mounted so a half-finished try-on or form survives a tab switch. */}
        {TABS.map(({ key, Screen }) => (
          <View key={key} style={[styles.page, tab !== key && styles.hidden]}>
            <Screen goTo={setTab} />
          </View>
        ))}
      </View>
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t.label}
            >
              <Feather name={t.icon} size={21} color={on ? color.accent : color.faint} />
              <Text style={[styles.tabText, on && { color: color.accent, fontWeight: '700' }]}>{t.label}</Text>
              <View style={[styles.tabDot, on && { backgroundColor: color.accent }]} />
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  body: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  page: { ...StyleSheet.absoluteFillObject },
  hidden: { display: 'none' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: color.line, backgroundColor: color.surface, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3, minHeight: 48 },
  tabText: { fontFamily: font.body, fontSize: 11, color: color.faint },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
});
