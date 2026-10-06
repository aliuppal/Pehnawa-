import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { color, font, radius, space } from '../theme';
import { newId, sampleWardrobe, useStore } from '../store';
import { CATEGORIES, COLORS, STYLES, WARMTH, categoryLabel } from '../data/catalog';
import { persistImage, pickImage } from '../media';
import { tagGarment } from '../ai';
import { Button, Chip, ChipRow, EmptyState, GarmentArt, Label, Notice, ScreenHeader, Sheet } from '../components/ui';

const BLANK = { name: '', category: 'top', color: 'white', style: 'casual', warmth: 'mid', brand: '' };

export default function ClosetScreen({ goTo }) {
  const { state, addItem, addItems, updateItem, removeItem, sendToTryOn } = useStore();
  const { wardrobe, profile, settings } = state;
  const gender = profile.gender;
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState(null); // { item, picked, isNew }
  const [chooser, setChooser] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const tile = Math.floor((Math.min(width, 520) - space.lg * 2 - space.md * 2) / 3);

  const shown = filter === 'all' ? wardrobe : wardrobe.filter((i) => i.category === filter);

  const startAdd = async (source) => {
    const fromSheet = chooser;
    setChooser(false);
    setError('');
    // iOS will not present the picker while the chooser sheet is still animating out.
    if (fromSheet && source !== 'none') await new Promise((r) => setTimeout(r, 400));
    if (source === 'none') {
      setDraft({ isNew: true, picked: null, item: { ...BLANK } });
      return;
    }
    try {
      const picked = await pickImage({ source });
      if (!picked) return;
      setDraft({ isNew: true, picked, item: { ...BLANK } });
      if (settings.anthropicKey && picked.base64) {
        setTagging(true);
        try {
          const tags = await tagGarment(settings.anthropicKey, picked, gender);
          setDraft((d) => (d ? { ...d, item: { ...d.item, ...tags }, tagged: true } : d));
        } catch (e) {
          setDraft((d) => (d ? { ...d, tagError: e.message } : d));
        } finally {
          setTagging(false);
        }
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const save = () => {
    const { item, picked, isNew } = draft;
    const name = item.name.trim() || `${item.color} ${categoryLabel(item.category, gender).split(' / ')[0]}`.toLowerCase();
    const clean = { ...item, name: name.charAt(0).toUpperCase() + name.slice(1), brand: item.brand?.trim() || undefined };
    if (isNew) {
      let uri = null;
      try {
        uri = picked ? persistImage(picked) : null;
      } catch {
        setError('Could not save that photo. The piece was added without it.');
      }
      addItem({ ...clean, id: newId(), uri, createdAt: new Date().toISOString() });
    } else {
      updateItem(clean);
    }
    setDraft(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl * 2 }}>
        <ScreenHeader
          eyebrow={`${wardrobe.length} piece${wardrobe.length === 1 ? '' : 's'}`}
          title="My closet"
          right={<Button label="Add" icon="plus" small onPress={() => setChooser(true)} />}
        />
        {error ? <Notice tone="error" text={error} onClose={() => setError('')} /> : null}

        {wardrobe.length ? (
          <>
            <ChipRow>
              <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
              {CATEGORIES.map((c) => (
                <Chip key={c.key} label={c.label[gender]} selected={filter === c.key} onPress={() => setFilter(c.key)} />
              ))}
            </ChipRow>
            <View style={st.grid}>
              {shown.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setDraft({ isNew: false, item: { ...BLANK, ...item } })}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, edit`}
                  style={{ width: tile }}
                >
                  <GarmentArt item={item} size={tile} />
                  <Text style={st.tileName} numberOfLines={1}>{item.name}</Text>
                </Pressable>
              ))}
            </View>
            {!shown.length ? <Text style={st.none}>Nothing in this category yet.</Text> : null}
          </>
        ) : (
          <EmptyState
            icon="camera"
            title="Start with what you wear most"
            body="Lay a piece flat or hang it against a plain wall, then snap it. With a Claude key, the app names and tags it for you."
            action={
              <View style={{ gap: space.sm }}>
                <Button label="Photograph a piece" icon="camera" onPress={() => startAdd('camera')} />
                <Button label="Load sample closet" variant="secondary" onPress={() => addItems(sampleWardrobe(gender))} />
              </View>
            }
          />
        )}
      </ScrollView>

      <Sheet visible={chooser} onClose={() => setChooser(false)} title="Add a piece">
        <View style={{ gap: space.sm }}>
          <Button label="Take a photo" icon="camera" onPress={() => startAdd('camera')} />
          <Button label="Choose from gallery" icon="image" variant="secondary" onPress={() => startAdd('library')} />
          <Button label="Add without a photo" icon="droplet" variant="ghost" onPress={() => startAdd('none')} />
        </View>
      </Sheet>

      <Sheet visible={!!draft} onClose={() => setDraft(null)} title={draft?.isNew ? 'New piece' : 'Edit piece'}>
        {draft ? (
          <GarmentForm
            draft={draft}
            gender={gender}
            tagging={tagging}
            onChange={(patch) => setDraft((d) => ({ ...d, item: { ...d.item, ...patch } }))}
            onSave={save}
            onDelete={
              draft.isNew
                ? null
                : () => {
                    removeItem(draft.item);
                    setDraft(null);
                  }
            }
            onTryOn={
              draft.isNew
                ? null
                : () => {
                    sendToTryOn([draft.item]);
                    setDraft(null);
                    goTo('tryon');
                  }
            }
          />
        ) : null}
      </Sheet>
    </View>
  );
}

function GarmentForm({ draft, gender, tagging, onChange, onSave, onDelete, onTryOn }) {
  const { item, picked } = draft;
  const preview = picked?.uri ?? item.uri;
  return (
    <View>
      <View style={st.previewRow}>
        {preview ? (
          <Image source={{ uri: preview }} style={st.preview} />
        ) : (
          <GarmentArt item={item} size={96} />
        )}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {tagging ? <Text style={st.tagNote}>Reading the photo…</Text> : null}
          {draft.tagged ? <Text style={st.tagNote}>Tagged by AI. Adjust anything that looks off.</Text> : null}
          {draft.tagError ? <Text style={[st.tagNote, { color: color.danger }]}>{draft.tagError} Fill it in by hand.</Text> : null}
          {!tagging && !draft.tagged && !draft.tagError ? <Text style={st.tagNote}>Tell the stylist what this is.</Text> : null}
        </View>
      </View>

      <Label>Name</Label>
      <TextInput
        value={item.name}
        onChangeText={(name) => onChange({ name })}
        placeholder="e.g. Mustard lawn kameez"
        placeholderTextColor={color.faint}
        style={st.input}
        accessibilityLabel="Name"
      />

      <Label>Type</Label>
      <View style={st.wrap}>
        {CATEGORIES.map((c) => (
          <Chip key={c.key} label={c.label[gender]} icon={c.icon} selected={item.category === c.key} onPress={() => onChange({ category: c.key })} />
        ))}
      </View>

      <Label>Main colour</Label>
      <View style={st.wrap}>
        {COLORS.map((c) => (
          <Pressable
            key={c.key}
            onPress={() => onChange({ color: c.key })}
            accessibilityRole="button"
            accessibilityLabel={c.key}
            accessibilityState={{ selected: item.color === c.key }}
            style={[st.swatch, { backgroundColor: c.hex }, item.color === c.key && st.swatchOn]}
          />
        ))}
      </View>
      <Text style={st.colorName}>{item.color}</Text>

      <Label>Best for</Label>
      <View style={st.wrap}>
        {STYLES.map((x) => (
          <Chip key={x.key} label={x.label} selected={item.style === x.key} onPress={() => onChange({ style: x.key })} />
        ))}
      </View>

      <Label>Fabric weight</Label>
      <View style={st.wrap}>
        {WARMTH.map((x) => (
          <Chip key={x.key} label={x.label} selected={item.warmth === x.key} onPress={() => onChange({ warmth: x.key })} />
        ))}
      </View>

      <Label>Brand (optional)</Label>
      <TextInput
        value={item.brand ?? ''}
        onChangeText={(brand) => onChange({ brand })}
        placeholder="e.g. Khaadi"
        placeholderTextColor={color.faint}
        style={st.input}
        accessibilityLabel="Brand"
      />

      <View style={{ gap: space.sm, marginTop: space.xl }}>
        <Button label={draft.isNew ? 'Add to closet' : 'Save changes'} onPress={onSave} disabled={tagging} />
        {onTryOn ? <Button label="Try this on" icon="eye" variant="secondary" onPress={onTryOn} /> : null}
        {onDelete ? <Button label="Remove from closet" icon="trash-2" variant="danger" onPress={onDelete} /> : null}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.lg },
  tileName: { fontFamily: font.body, fontSize: 12, color: color.ink, marginTop: 6 },
  none: { fontFamily: font.body, fontSize: 14, color: color.muted, paddingHorizontal: space.lg, paddingTop: space.lg },
  previewRow: { flexDirection: 'row', gap: space.lg },
  preview: { width: 96, height: 120, borderRadius: radius.md, backgroundColor: color.sunk },
  tagNote: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.muted },
  input: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, backgroundColor: color.surface, paddingHorizontal: space.md, fontFamily: font.body, fontSize: 16, color: color.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)' },
  swatchOn: { borderWidth: 3, borderColor: color.ink },
  colorName: { fontFamily: font.body, fontSize: 13, color: color.muted, marginTop: space.sm, textTransform: 'capitalize' },
});
