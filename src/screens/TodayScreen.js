import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { color, font, radius, space } from '../theme';
import { todayKey, useStore, sampleWardrobe } from '../store';
import { OCCASIONS, WEATHER, categoryLabel, defaultOccasion, defaultWeather } from '../data/catalog';
import { generateOutfits } from '../outfitEngine';
import { suggestOutfits } from '../ai';
import { Button, Chip, ChipRow, EmptyState, GarmentArt, Notice, ScreenHeader } from '../components/ui';

export default function TodayScreen({ goTo }) {
  const { state, wear, sendToTryOn, addItems } = useStore();
  const { wardrobe, profile, wornLog, settings } = state;
  const [occasion, setOccasion] = useState(defaultOccasion);
  const [weather, setWeather] = useState(defaultWeather);
  const [seed, setSeed] = useState(1);
  const [aiOutfits, setAiOutfits] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState('');

  const today = todayKey();
  const wornToday = wornLog.find((w) => w.date === today);

  const { outfits: quick, missing } = useMemo(
    () => generateOutfits({ wardrobe, gender: profile.gender, occasion, weather, wornLog, today, seed }),
    [wardrobe, profile.gender, occasion, weather, wornLog, today, seed]
  );
  const outfits = aiOutfits ?? quick;

  const changeContext = (fn) => (value) => {
    fn(value);
    setAiOutfits(null);
  };

  const askAi = async () => {
    setError('');
    setAiBusy(true);
    try {
      const recentIds = wornLog.filter((w) => w.date !== today).slice(0, 2).flatMap((w) => w.itemIds);
      const result = await suggestOutfits(settings.anthropicKey, {
        wardrobe, gender: profile.gender, occasion, weather, recentIds, name: profile.name,
      });
      if (!result.length) throw new Error('The stylist could not build a look from this closet. Add a few more pieces.');
      setAiOutfits(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setAiBusy(false);
    }
  };

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const greeting = profile.name ? `Salaam, ${profile.name.split(' ')[0]}` : 'What to wear today';

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
      <ScreenHeader
        eyebrow={dateLabel}
        title={greeting}
        right={
          <Pressable onPress={() => goTo('me')} accessibilityRole="button" accessibilityLabel="Your profile" hitSlop={8}>
            {profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={st.avatar} />
            ) : (
              <View style={[st.avatar, st.avatarEmpty]}>
                <Feather name="camera" size={18} color={color.accent} />
              </View>
            )}
          </Pressable>
        }
      />

      {!wardrobe.length ? (
        <EmptyState
          icon="grid"
          title="Your closet is empty"
          body="Photograph a few pieces you wear often, or load a sample closet to see how daily picks work."
          action={
            <View style={{ gap: space.sm }}>
              <Button label="Add my clothes" icon="plus" onPress={() => goTo('closet')} />
              <Button label="Load sample closet" variant="secondary" onPress={() => addItems(sampleWardrobe(profile.gender))} />
            </View>
          }
        />
      ) : (
        <>
          <Text style={st.groupLabel}>Where are you headed?</Text>
          <ChipRow>
            {OCCASIONS.map((o) => (
              <Chip key={o.key} label={o.label} selected={occasion === o.key} onPress={() => changeContext(setOccasion)(o.key)} />
            ))}
          </ChipRow>
          <Text style={st.groupLabel}>Weather</Text>
          <ChipRow>
            {WEATHER.map((w) => (
              <Chip key={w.key} label={w.label} icon={w.icon} selected={weather === w.key} onPress={() => changeContext(setWeather)(w.key)} />
            ))}
          </ChipRow>

          <View style={st.actionsRow}>
            <Button
              label={aiOutfits ? 'Ask again' : 'Ask AI stylist'}
              icon="message-circle"
              onPress={askAi}
              loading={aiBusy}
              small
              style={{ flex: 1 }}
            />
            <Button
              label="Shuffle"
              icon="shuffle"
              variant="secondary"
              small
              onPress={() => {
                setAiOutfits(null);
                setSeed((n) => n + 1);
              }}
            />
          </View>
          {!settings.anthropicKey && !error ? (
            <Text style={st.hint}>Quick picks run on your phone. Add a Claude key on the Me tab for the AI stylist.</Text>
          ) : null}
          {error ? <Notice tone="error" text={error} onClose={() => setError('')} /> : null}
          {aiOutfits ? <Notice text="Styled by Claude from your closet." onClose={() => setAiOutfits(null)} /> : null}

          {missing.length ? (
            <EmptyState
              icon="alert-triangle"
              title="A few pieces short"
              body={`Add at least one ${missing.map((m) => categoryLabel(m, profile.gender).toLowerCase()).join(' and one ')}, or a full suit, to build outfits.`}
              action={<Button label="Add clothes" icon="plus" onPress={() => goTo('closet')} />}
            />
          ) : (
            outfits.map((o, idx) => (
              <OutfitCard
                key={o.id}
                outfit={o}
                hero={idx === 0}
                gender={profile.gender}
                worn={wornToday?.itemIds.join('-') === o.items.map((i) => i.id).join('-')}
                onWear={() => wear(o.items.map((i) => i.id))}
                onTry={() => {
                  sendToTryOn(o.items);
                  goTo('tryon');
                }}
              />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

function OutfitCard({ outfit, hero, gender, worn, onWear, onTry }) {
  const size = hero ? 104 : 72;
  return (
    <View style={[st.card, hero && st.heroCard]}>
      {hero ? <Text style={st.heroTag}>{outfit.ai ? 'AI pick' : 'Top pick'}</Text> : null}
      <Text style={[st.cardTitle, hero && { fontSize: 26 }]}>{outfit.title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingVertical: space.md }}>
        {outfit.items.map((i) => (
          <View key={i.id} style={{ width: size }}>
            <GarmentArt item={i} size={size} />
            <Text style={st.itemName} numberOfLines={2}>{i.name}</Text>
            <Text style={st.itemCat} numberOfLines={1}>{categoryLabel(i.category, gender)}</Text>
          </View>
        ))}
      </ScrollView>
      {outfit.reasons.map((r) => (
        <Text key={r} style={st.reason}>{r}</Text>
      ))}
      <View style={[st.actionsRow, { paddingHorizontal: 0, marginTop: space.md }]}>
        <Button
          label={worn ? 'Wearing today' : 'Wear this today'}
          icon={worn ? 'check' : undefined}
          variant={worn ? 'secondary' : hero ? 'primary' : 'secondary'}
          small
          onPress={onWear}
          style={{ flex: 1 }}
        />
        <Button label="Try on" icon="eye" variant="ghost" small onPress={onTry} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarEmpty: { backgroundColor: color.accentSoft, alignItems: 'center', justifyContent: 'center' },
  groupLabel: { fontFamily: font.body, fontSize: 13, fontWeight: '600', color: color.muted, paddingHorizontal: space.lg, marginTop: space.md, marginBottom: space.sm },
  actionsRow: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, marginTop: space.lg, marginBottom: space.sm, alignItems: 'center' },
  hint: { fontFamily: font.body, fontSize: 13, color: color.faint, paddingHorizontal: space.lg, marginBottom: space.md },
  card: { marginHorizontal: space.lg, marginTop: space.md, padding: space.lg, backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line },
  heroCard: { paddingVertical: space.xl, borderColor: color.ink },
  heroTag: { alignSelf: 'flex-start', fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: color.gold, marginBottom: space.xs },
  cardTitle: { fontFamily: font.display, fontSize: 20, color: color.ink },
  itemName: { fontFamily: font.body, fontSize: 12, color: color.ink, marginTop: 6 },
  itemCat: { fontFamily: font.body, fontSize: 11, color: color.faint },
  reason: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.muted },
});
