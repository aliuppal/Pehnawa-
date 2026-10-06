import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { color, font, radius, space } from '../theme';
import { sampleWardrobe, useStore } from '../store';
import { persistImage, pickImage, deleteImage } from '../media';
import { Button, GenderSwitch, Label, Notice, ScreenHeader } from '../components/ui';

function confirm(title, message, onYes) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Yes', style: 'destructive', onPress: onYes },
  ]);
}

export default function MeScreen() {
  const { state, setProfile, setSettings, addItems, reset } = useStore();
  const { profile, settings, wardrobe, wornLog } = state;
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const takePhoto = async (source) => {
    setError('');
    try {
      const picked = await pickImage({ source, aspect: [3, 4], front: true });
      if (!picked) return;
      const old = profile.photoUri;
      setProfile({ photoUri: persistImage(picked) });
      if (old) deleteImage(old);
    } catch (e) {
      setError(e.message);
    }
  };

  const hasSamples = wardrobe.some((i) => i.sample);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const wornThisMonth = wornLog.filter((w) => w.date.startsWith(thisMonth)).length;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: space.xxl * 2 }} keyboardShouldPersistTaps="handled">
      <ScreenHeader eyebrow="Profile & settings" title="Me" />
      {error ? <Notice tone="error" text={error} onClose={() => setError('')} /> : null}

      <View style={st.photoRow}>
        {profile.photoUri ? (
          <Image source={{ uri: profile.photoUri }} style={st.photo} />
        ) : (
          <View style={[st.photo, st.photoEmpty]}>
            <Feather name="user" size={40} color={color.faint} />
          </View>
        )}
        <View style={{ flex: 1, gap: space.sm }}>
          <Text style={st.photoHint}>
            {profile.photoUri ? 'This photo is used for try-on.' : 'Add a photo of yourself to try clothes on.'}
          </Text>
          <Button label={profile.photoUri ? 'Retake' : 'Take photo'} icon="camera" small onPress={() => takePhoto('camera')} />
          <Button label="From gallery" icon="image" variant="secondary" small onPress={() => takePhoto('library')} />
        </View>
      </View>

      <View style={st.section}>
        <Label>Your name</Label>
        <TextInput
          value={profile.name}
          onChangeText={(name) => setProfile({ name })}
          placeholder="Optional"
          placeholderTextColor={color.faint}
          style={st.input}
          accessibilityLabel="Your name"
        />

        <Label>Dress me as</Label>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <GenderSwitch value={profile.gender} onChange={(gender) => setProfile({ gender })} />
          <Text style={st.small}>Switch any time while testing.</Text>
        </View>
        <Text style={st.small}>Changes garment names, outfit rules and which brands you see.</Text>
      </View>

      <View style={st.stats}>
        <Stat value={wardrobe.length} label="pieces in closet" />
        <Stat value={wornThisMonth} label="outfits logged this month" />
      </View>

      <View style={st.section}>
        <Text style={st.sectionTitle}>AI keys</Text>
        <Text style={st.small}>
          Keys stay on this device and are sent only to Claude and fal.ai. Fine for personal testing; a public release should
          route these calls through your own server.
        </Text>

        <Label>Claude API key (stylist + auto-tagging)</Label>
        <TextInput
          value={settings.anthropicKey}
          onChangeText={(anthropicKey) => setSettings({ anthropicKey: anthropicKey.trim() })}
          placeholder="sk-ant-…"
          placeholderTextColor={color.faint}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={st.input}
          accessibilityLabel="Claude API key"
          onEndEditing={() => settings.anthropicKey && setSaved('Claude key saved.')}
        />

        <Label>fal.ai key (photo-real try-on)</Label>
        <TextInput
          value={settings.falKey}
          onChangeText={(falKey) => setSettings({ falKey: falKey.trim() })}
          placeholder="fal key"
          placeholderTextColor={color.faint}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={st.input}
          accessibilityLabel="fal.ai key"
          onEndEditing={() => settings.falKey && setSaved('fal key saved.')}
        />
        {saved ? <Text style={[st.small, { color: color.accent }]}>{saved}</Text> : null}
      </View>

      <View style={[st.section, { gap: space.sm }]}>
        <Text style={st.sectionTitle}>Testing</Text>
        <Button
          label={`Load sample ${profile.gender === 'male' ? "men's" : "women's"} closet`}
          icon="package"
          variant="secondary"
          onPress={() => addItems(sampleWardrobe(profile.gender))}
        />
        {hasSamples ? <Text style={st.small}>Sample pieces show as colour swatches until you add real photos.</Text> : null}
        <Button
          label="Clear closet & profile"
          icon="trash-2"
          variant="danger"
          onPress={() =>
            confirm('Start over?', 'This removes your closet, photo and outfit history. Your AI keys are kept.', () => {
              wardrobe.forEach((i) => deleteImage(i.uri));
              deleteImage(profile.photoUri);
              reset();
            })
          }
        />
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }) {
  return (
    <View style={st.stat}>
      <Text style={st.statValue}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  photoRow: { flexDirection: 'row', gap: space.lg, paddingHorizontal: space.lg, marginTop: space.sm },
  photo: { width: 120, height: 160, borderRadius: radius.lg, backgroundColor: color.sunk },
  photoEmpty: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.line, borderStyle: 'dashed' },
  photoHint: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.muted },
  section: { paddingHorizontal: space.lg, marginTop: space.xl },
  sectionTitle: { fontFamily: font.display, fontSize: 22, color: color.ink, marginBottom: space.xs },
  small: { fontFamily: font.body, fontSize: 13, lineHeight: 19, color: color.muted, marginTop: space.xs, flexShrink: 1 },
  input: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, backgroundColor: color.surface, paddingHorizontal: space.md, fontFamily: font.body, fontSize: 16, color: color.ink },
  stats: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, marginTop: space.xl },
  stat: { flex: 1, paddingVertical: space.lg, paddingHorizontal: space.md, borderTopWidth: 2, borderTopColor: color.ink },
  statValue: { fontFamily: font.display, fontSize: 34, color: color.ink },
  statLabel: { fontFamily: font.body, fontSize: 13, color: color.muted },
});
