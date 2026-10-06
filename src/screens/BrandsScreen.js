import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { color, font, radius, space } from '../theme';
import { newId, useStore } from '../store';
import { BRAND_TYPES, brandsFor, piecesFor } from '../data/brands';
import { STYLES, WARMTH, categoryLabel } from '../data/catalog';
import { persistImage, pickImage } from '../media';
import { Button, Chip, ChipRow, EmptyState, GarmentArt, GenderSwitch, Notice, ScreenHeader, Sheet } from '../components/ui';
import GarmentIllustration from '../components/GarmentIllustration';

const PRICE = ['', 'Budget', 'Mid-range', 'Premium', 'High-end'];

export default function BrandsScreen({ goTo }) {
  const { state, setProfile, sendToTryOn, addItem } = useStore();
  const gender = state.profile.gender;
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [piece, setPiece] = useState(null);

  const owned = (pc) => state.wardrobe.some((i) => i.sourceId === pc.sourceId);
  const addPiece = (pc) => {
    if (!owned(pc)) addItem({ ...pc, id: newId(), createdAt: new Date().toISOString() });
  };
  const tryOnPiece = (pc) => {
    sendToTryOn([{ ...pc, id: newId(), temp: true }]);
    setPiece(null);
    goTo('tryon');
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return brandsFor(gender).filter(
      (b) =>
        (type === 'all' || b.types.includes(type)) &&
        (!q ||
          b.name.toLowerCase().includes(q) ||
          b.note.toLowerCase().includes(q) ||
          b.looks.some((l) => l.toLowerCase().includes(q)) ||
          piecesFor(b).some((pc) => pc.name.toLowerCase().includes(q)))
    );
  }, [gender, type, query]);

  const visit = async (brand) => {
    setError('');
    try {
      await Linking.openURL(brand.url);
    } catch {
      setError(`Could not open ${brand.url}.`);
    }
  };

  const tryPiece = async (brand) => {
    setError('');
    try {
      const picked = await pickImage({ source: 'library', aspect: [3, 4] });
      if (!picked) return;
      sendToTryOn([
        {
          id: newId(),
          uri: persistImage(picked),
          name: `${brand.name} piece`,
          brand: brand.name,
          temp: true,
          category: gender === 'female' ? 'full' : 'top',
          color: 'print',
          style: brand.types.includes('western') && !brand.types.includes('eastern') ? 'casual' : 'eastern',
          warmth: 'mid',
          createdAt: new Date().toISOString(),
        },
      ]);
      goTo('tryon');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: space.xxl * 2 }} keyboardShouldPersistTaps="handled">
      <ScreenHeader
        eyebrow="Made in Pakistan"
        title="Brands"
        right={<GenderSwitch value={gender} onChange={(g) => setProfile({ gender: g })} />}
      />

      <View style={st.searchBox}>
        <Feather name="search" size={16} color={color.faint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search brands or looks, e.g. lawn"
          placeholderTextColor={color.faint}
          style={st.search}
          accessibilityLabel="Search brands"
          returnKeyType="search"
        />
      </View>

      <ChipRow>
        {BRAND_TYPES.map((t) => (
          <Chip key={t.key} label={t.label} selected={type === t.key} onPress={() => setType(t.key)} />
        ))}
      </ChipRow>

      <Text style={st.tip}>
        Tap a sample piece to try it on or add it to your closet. Spotted something real on a brand's site? Screenshot it and
        tap <Text style={{ fontWeight: '700' }}>Try my screenshot</Text>.
      </Text>
      {error ? <Notice tone="error" text={error} onClose={() => setError('')} /> : null}

      {list.length ? (
        list.map((b) => (
          <View key={b.id} style={st.card}>
            <View style={st.cardHead}>
              <View style={st.monogram}>
                <Text style={st.monoText}>{b.name.replace(/[^A-Za-z ]/g, '').split(' ').map((w) => w[0]).join('').slice(0, 2) || b.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{b.name}</Text>
                <Text style={st.meta}>
                  {b.types.map((t) => BRAND_TYPES.find((x) => x.key === t)?.label).join(' · ')}  ·  {PRICE[b.price]}
                </Text>
              </View>
            </View>
            <Text style={st.note}>{b.note}</Text>

            <Text style={st.piecesLabel}>Sample pieces</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.pieces}>
              {piecesFor(b).map((pc) => (
                <Pressable
                  key={pc.id}
                  onPress={() => setPiece(pc)}
                  style={st.piece}
                  accessibilityRole="button"
                  accessibilityLabel={`${pc.name}, sample from ${b.name}`}
                >
                  <GarmentArt item={pc} size={84} />
                  <Text style={st.pieceName} numberOfLines={2}>{pc.name}</Text>
                  {owned(pc) ? (
                    <View style={st.ownedBadge}>
                      <Feather name="check" size={11} color={color.accentInk} />
                    </View>
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>

            <View style={st.actions}>
              <Button label="Visit store" icon="external-link" variant="secondary" small onPress={() => visit(b)} style={{ flex: 1 }} />
              <Button label="Try my screenshot" icon="upload" variant="ghost" small onPress={() => tryPiece(b)} style={{ flex: 1 }} />
            </View>
          </View>
        ))
      ) : (
        <EmptyState icon="search" title="No brands match" body="Try a different word or clear the filter." />
      )}

      <Sheet visible={!!piece} onClose={() => setPiece(null)} title={piece?.brand ?? ''}>
        {piece ? (
          <View>
            <View style={st.hero}>
              <GarmentIllustration item={piece} gender={piece.gender} width={180} />
            </View>
            <Text style={st.pieceTitle}>{piece.name}</Text>
            <Text style={st.pieceMeta}>
              {[
                categoryLabel(piece.category, piece.gender),
                piece.color,
                STYLES.find((x) => x.key === piece.style)?.label,
                WARMTH.find((x) => x.key === piece.warmth)?.label,
              ].join('  ·  ')}
            </Text>
            <Text style={st.disclaimer}>
              A sample in the spirit of {piece.brand}'s range, not a listed product. Check their store for current collections and prices.
            </Text>
            <View style={{ gap: space.sm, marginTop: space.xl }}>
              <Button label="Try it on" icon="eye" onPress={() => tryOnPiece(piece)} />
              <Button
                label={owned(piece) ? 'In your closet' : 'Add to my closet'}
                icon={owned(piece) ? 'check' : 'plus'}
                variant="secondary"
                disabled={owned(piece)}
                onPress={() => addPiece(piece)}
              />
            </View>
          </View>
        ) : null}
      </Sheet>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: space.lg, marginBottom: space.md, paddingHorizontal: space.md, minHeight: 46, borderRadius: radius.pill, backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
  search: { flex: 1, fontFamily: font.body, fontSize: 15, color: color.ink, paddingVertical: space.sm },
  tip: { fontFamily: font.body, fontSize: 13, lineHeight: 19, color: color.muted, paddingHorizontal: space.lg, marginTop: space.md, marginBottom: space.sm },
  card: { marginHorizontal: space.lg, marginTop: space.md, padding: space.lg, backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  monogram: { width: 46, height: 46, borderRadius: 23, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  monoText: { fontFamily: font.display, fontSize: 18, color: color.bg },
  name: { fontFamily: font.display, fontSize: 20, color: color.ink },
  meta: { fontFamily: font.body, fontSize: 12, color: color.muted, marginTop: 2 },
  note: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.ink, marginTop: space.md },
  piecesLabel: { fontFamily: font.body, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: color.muted, marginTop: space.lg, marginBottom: space.sm },
  pieces: { gap: space.md },
  piece: { width: 84 },
  pieceName: { fontFamily: font.body, fontSize: 12, lineHeight: 16, color: color.ink, marginTop: 6 },
  ownedBadge: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: color.accent, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingVertical: space.lg, backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line },
  pieceTitle: { fontFamily: font.display, fontSize: 24, color: color.ink, marginTop: space.lg },
  pieceMeta: { fontFamily: font.body, fontSize: 13, color: color.muted, marginTop: space.xs, textTransform: 'capitalize' },
  disclaimer: { fontFamily: font.body, fontSize: 13, lineHeight: 19, color: color.faint, marginTop: space.md },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
});
