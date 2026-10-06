import React from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { color, font, radius, space } from '../theme';
import { CATEGORIES, colorInfo } from '../data/catalog';

export function ScreenHeader({ eyebrow, title, right }) {
  return (
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
        <Text style={s.title} accessibilityRole="header">{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function Button({ label, onPress, icon, variant = 'primary', loading, disabled, small, style }) {
  const v = VARIANTS[variant];
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: !!loading }}
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && { transform: [{ translateY: 1 }], opacity: 0.9 },
        off && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : icon ? (
        <Feather name={icon} size={small ? 15 : 17} color={v.fg} />
      ) : null}
      {label ? <Text style={[s.btnText, small && { fontSize: 14 }, { color: v.fg }]}>{label}</Text> : null}
    </Pressable>
  );
}

const VARIANTS = {
  primary: { bg: color.accent, fg: color.accentInk, border: color.accent },
  secondary: { bg: color.surface, fg: color.ink, border: color.line },
  ghost: { bg: 'transparent', fg: color.accent, border: 'transparent' },
  danger: { bg: color.surface, fg: color.danger, border: color.line },
};

export function Chip({ label, selected, onPress, icon, swatch }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[s.chip, selected && s.chipOn]}
      hitSlop={4}
    >
      {swatch ? <View style={[s.swatchDot, { backgroundColor: swatch }]} /> : null}
      {icon ? <Feather name={icon} size={14} color={selected ? color.accentInk : color.muted} /> : null}
      <Text style={[s.chipText, selected && { color: color.accentInk }]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
      {children}
    </ScrollView>
  );
}

export function GenderSwitch({ value, onChange }) {
  return (
    <View style={s.seg} accessibilityRole="radiogroup" accessibilityLabel="Gender">
      {[
        ['female', 'Women'],
        ['male', 'Men'],
      ].map(([key, label]) => (
        <Pressable
          key={key}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === key }}
          onPress={() => onChange(key)}
          style={[s.segItem, value === key && s.segOn]}
        >
          <Text style={[s.segText, value === key && { color: color.ink }]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Photo of a garment, or a colour swatch with its category icon when there is no photo. */
export function GarmentArt({ item, size = 96, rounded = radius.md }) {
  const box = { width: size, height: size * 1.25, borderRadius: rounded };
  if (item.uri) return <Image source={{ uri: item.uri }} style={[box, { backgroundColor: color.sunk }]} resizeMode="cover" />;
  const c = colorInfo(item.color);
  const light = ['white', 'beige', 'sky', 'yellow', 'pink', 'lavender', 'print'].includes(c.key);
  const icon = CATEGORIES.find((x) => x.key === item.category)?.icon ?? 'square';
  return (
    <View style={[box, { backgroundColor: c.hex, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.line }]}>
      <Feather name={icon} size={size * 0.28} color={light ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.8)'} />
    </View>
  );
}

export function EmptyState({ icon, title, body, action }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Feather name={icon} size={26} color={color.accent} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {body ? <Text style={s.emptyBody}>{body}</Text> : null}
      {action ? <View style={{ marginTop: space.lg, alignSelf: 'stretch' }}>{action}</View> : null}
    </View>
  );
}

export function Notice({ tone = 'info', text, onClose }) {
  const danger = tone === 'error';
  return (
    <View style={[s.notice, danger && { backgroundColor: color.dangerSoft }]} accessibilityLiveRegion="polite">
      <Feather name={danger ? 'alert-circle' : 'info'} size={16} color={danger ? color.danger : color.accent} />
      <Text style={[s.noticeText, danger && { color: color.danger }]}>{text}</Text>
      {onClose ? (
        <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Dismiss">
          <Feather name="x" size={16} color={color.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Label({ children }) {
  return <Text style={s.label}>{children}</Text>;
}

export function Sheet({ visible, onClose, title, children }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={s.sheet}>
        <View style={s.sheetHead}>
          <Text style={s.sheetTitle}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Feather name="x" size={22} color={color.ink} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl * 2 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

export const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md, gap: space.md },
  eyebrow: { fontFamily: font.body, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: color.muted, marginBottom: 4 },
  title: { fontFamily: font.display, fontSize: 30, color: color.ink, letterSpacing: -0.3 },
  btn: { minHeight: 48, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: space.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  btnSmall: { minHeight: 38, paddingHorizontal: space.lg },
  btnText: { fontFamily: font.body, fontSize: 15, fontWeight: '600' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line, backgroundColor: color.surface },
  chipOn: { backgroundColor: color.ink, borderColor: color.ink },
  chipText: { fontFamily: font.body, fontSize: 14, color: color.ink },
  chipRow: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: 2 },
  swatchDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  seg: { flexDirection: 'row', backgroundColor: color.sunk, borderRadius: radius.pill, padding: 3 },
  segItem: { paddingHorizontal: 14, minHeight: 34, justifyContent: 'center', borderRadius: radius.pill },
  segOn: { backgroundColor: color.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segText: { fontFamily: font.body, fontSize: 14, fontWeight: '600', color: color.muted },
  empty: { alignItems: 'center', paddingHorizontal: space.xl, paddingVertical: space.xxl },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: color.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  emptyTitle: { fontFamily: font.display, fontSize: 22, color: color.ink, textAlign: 'center' },
  emptyBody: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.muted, textAlign: 'center', marginTop: space.sm, maxWidth: 320 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, backgroundColor: color.accentSoft, borderRadius: radius.md, padding: space.md, marginHorizontal: space.lg, marginBottom: space.md },
  noticeText: { flex: 1, fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.accent },
  label: { fontFamily: font.body, fontSize: 13, fontWeight: '600', color: color.muted, marginTop: space.lg, marginBottom: space.sm },
  backdrop: { flex: 1, backgroundColor: 'rgba(29,26,22,0.4)' },
  sheet: { maxHeight: '88%', backgroundColor: color.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm, borderBottomWidth: 1, borderBottomColor: color.line },
  sheetTitle: { fontFamily: font.display, fontSize: 22, color: color.ink },
});
