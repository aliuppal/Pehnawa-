import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { color, font, radius, space } from '../theme';
import { newId, useStore } from '../store';
import { colorInfo } from '../data/catalog';
import { persistImage, pickImage } from '../media';
import { aiTryOn, canAiTryOn } from '../tryon';
import { Button, EmptyState, GarmentArt, Notice, ScreenHeader } from '../components/ui';

// Draw order on the photo: shoes at the bottom of the stack, layers on top.
const Z = { shoes: 0, bottom: 1, full: 2, top: 3, layer: 4, extra: 5 };
// Where each kind of garment starts on the photo, as fractions of the stage.
const START = { top: [0.2, 0.22], full: [0.2, 0.2], layer: [0.18, 0.2], bottom: [0.22, 0.5], shoes: [0.3, 0.8], extra: [0.25, 0.15] };

const toLayer = (item) => ({ key: newId(), item, scale: item.category === 'shoes' ? 0.5 : 1, opacity: 1 });

export default function TryOnScreen({ goTo }) {
  const { state, setProfile, addItem, sendToTryOn } = useStore();
  const { profile, wardrobe, settings, tryOnQueue } = state;
  const { width } = useWindowDimensions();
  const stageW = Math.min(width - space.lg * 2, 440);
  const stageH = stageW * (4 / 3);

  const [mode, setMode] = useState('quick');
  const [layers, setLayers] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [extras, setExtras] = useState([]); // imported pieces not (yet) in the closet
  const [dragging, setDragging] = useState(false);
  const [aiPick, setAiPick] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [showBefore, setShowBefore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Pieces sent from Today, Closet or Brands arrive through the store queue.
  useEffect(() => {
    if (!tryOnQueue.length) return;
    const fresh = tryOnQueue.map(toLayer).sort((a, b) => Z[a.item.category] - Z[b.item.category]);
    setLayers(fresh);
    setActiveKey(fresh[fresh.length - 1]?.key ?? null);
    const imported = tryOnQueue.filter((i) => i.temp);
    if (imported.length) setExtras((x) => [...imported, ...x.filter((e) => !imported.some((i) => i.id === e.id))]);
    const eligible = tryOnQueue.find(canAiTryOn);
    if (eligible) setAiPick(eligible);
    setAiResult(null);
    sendToTryOn([]);
  }, [tryOnQueue, sendToTryOn]);

  const pool = [...extras, ...wardrobe];
  const active = layers.find((l) => l.key === activeKey);

  const toggleLayer = (item) => {
    const existing = layers.find((l) => l.item.id === item.id);
    if (existing) {
      setLayers((ls) => ls.filter((l) => l.key !== existing.key));
      if (activeKey === existing.key) setActiveKey(null);
      return;
    }
    const layer = toLayer(item);
    setLayers((ls) => [...ls, layer].sort((a, b) => Z[a.item.category] - Z[b.item.category]));
    setActiveKey(layer.key);
  };

  const patchActive = (fn) => setLayers((ls) => ls.map((l) => (l.key === activeKey ? fn(l) : l)));

  const takeSelfie = async (source) => {
    setError('');
    try {
      const picked = await pickImage({ source, aspect: [3, 4], front: true });
      if (picked) setProfile({ photoUri: persistImage(picked) });
    } catch (e) {
      setError(e.message);
    }
  };

  const importPiece = async () => {
    setError('');
    try {
      const picked = await pickImage({ source: 'library', aspect: [3, 4] });
      if (!picked) return;
      const item = {
        id: newId(), uri: persistImage(picked), name: 'Imported piece', temp: true,
        category: profile.gender === 'female' ? 'full' : 'top', color: 'print', style: 'eastern', warmth: 'mid',
        createdAt: new Date().toISOString(),
      };
      setExtras((x) => [item, ...x]);
      if (mode === 'quick') toggleLayer(item);
      else setAiPick(item);
    } catch (e) {
      setError(e.message);
    }
  };

  const keepImported = (item) => {
    const { temp, ...rest } = item;
    addItem(rest);
    setExtras((x) => x.filter((e) => e.id !== item.id));
    setLayers((ls) => ls.map((l) => (l.item.id === item.id ? { ...l, item: rest } : l)));
  };

  const runAi = async () => {
    setError('');
    setBusy(true);
    setShowBefore(false);
    try {
      setAiResult(await aiTryOn(settings.falKey, { personUri: profile.photoUri, garment: aiPick }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!profile.photoUri) {
    return (
      <ScrollView>
        <ScreenHeader eyebrow="See it on you" title="Try on" />
        {error ? <Notice tone="error" text={error} onClose={() => setError('')} /> : null}
        <EmptyState
          icon="user"
          title="First, a photo of you"
          body="Stand against a plain wall, full body or waist up, arms slightly away from your sides. Good light helps the AI try-on most."
          action={
            <View style={{ gap: space.sm }}>
              <Button label="Take my photo" icon="camera" onPress={() => takeSelfie('camera')} />
              <Button label="Choose from gallery" icon="image" variant="secondary" onPress={() => takeSelfie('library')} />
            </View>
          }
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollEnabled={!dragging} contentContainerStyle={{ paddingBottom: space.xxl * 2 }}>
      <ScreenHeader
        eyebrow="See it on you"
        title="Try on"
        right={
          <View style={st.modeSwitch} accessibilityRole="radiogroup">
            {[
              ['quick', 'Quick'],
              ['ai', 'AI'],
            ].map(([k, label]) => (
              <Pressable
                key={k}
                onPress={() => setMode(k)}
                accessibilityRole="radio"
                accessibilityState={{ checked: mode === k }}
                style={[st.modeItem, mode === k && st.modeOn]}
              >
                <Text style={[st.modeText, mode === k && { color: color.accentInk }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        }
      />
      {error ? <Notice tone="error" text={error} onClose={() => setError('')} /> : null}

      <View style={[st.stage, { width: stageW, height: stageH }]}>
        <Image
          source={{ uri: mode === 'ai' && aiResult && !showBefore ? aiResult : profile.photoUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {mode === 'quick'
          ? layers.map((l) => (
              <DraggableLayer
                key={l.key}
                layer={l}
                stageW={stageW}
                stageH={stageH}
                active={l.key === activeKey}
                onSelect={() => setActiveKey(l.key)}
                onDrag={setDragging}
              />
            ))
          : null}
        {mode === 'ai' && busy ? (
          <View style={st.busy}>
            <Text style={st.busyText}>Dressing you… this usually takes 10–30 seconds.</Text>
          </View>
        ) : null}
      </View>

      {mode === 'quick' ? (
        <View style={st.controls}>
          {active ? (
            <>
              <Text style={st.activeName} numberOfLines={1}>{active.item.name}</Text>
              <View style={st.controlRow}>
                <IconBtn icon="minus" label="Smaller" onPress={() => patchActive((l) => ({ ...l, scale: Math.max(0.3, l.scale - 0.1) }))} />
                <IconBtn icon="plus" label="Bigger" onPress={() => patchActive((l) => ({ ...l, scale: Math.min(2, l.scale + 0.1) }))} />
                <IconBtn
                  icon="eye-off"
                  label={active.opacity < 1 ? 'Solid' : 'See-through'}
                  onPress={() => patchActive((l) => ({ ...l, opacity: l.opacity < 1 ? 1 : 0.6 }))}
                />
                <IconBtn icon="x" label="Take off" onPress={() => toggleLayer(active.item)} />
              </View>
              {active.item.temp ? (
                <Button label="Save to my closet" icon="download" variant="secondary" small onPress={() => keepImported(active.item)} />
              ) : null}
            </>
          ) : (
            <Text style={st.help}>
              {layers.length ? 'Tap a piece on the photo to adjust it.' : 'Pick pieces below, then drag them into place on your photo.'}
            </Text>
          )}
          <Text style={st.help}>Quick preview is a rough guide. Garments photographed flat on a plain background look best.</Text>
        </View>
      ) : (
        <View style={st.controls}>
          {aiResult ? (
            <View style={st.controlRow}>
              <Button label={showBefore ? 'Show result' : 'Show original'} variant="secondary" small onPress={() => setShowBefore((b) => !b)} />
              <Button label="Clear" variant="ghost" small onPress={() => setAiResult(null)} />
            </View>
          ) : null}
          <Button
            label={aiPick ? `Try on: ${aiPick.name}` : 'Pick a photographed piece below'}
            icon="zap"
            onPress={runAi}
            loading={busy}
            disabled={!aiPick}
          />
          {!settings.falKey ? (
            <Text style={st.help}>AI try-on uses fal.ai. Add your fal key on the Me tab.</Text>
          ) : (
            <Text style={st.help}>Works with photographed tops, bottoms, layers and full suits.</Text>
          )}
        </View>
      )}

      <Text style={st.stripLabel}>{mode === 'quick' ? 'Your pieces' : 'Choose one piece'}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.strip}>
        <Pressable onPress={importPiece} style={st.importTile} accessibilityRole="button" accessibilityLabel="Import a piece from your gallery">
          <Feather name="upload" size={20} color={color.accent} />
          <Text style={st.importText}>Import{'\n'}brand photo</Text>
        </Pressable>
        {pool.map((item) => {
          const on = mode === 'quick' ? layers.some((l) => l.item.id === item.id) : aiPick?.id === item.id;
          const blocked = mode === 'ai' && !canAiTryOn(item);
          return (
            <Pressable
              key={item.id}
              disabled={blocked}
              onPress={() => (mode === 'quick' ? toggleLayer(item) : (setAiPick(item), setAiResult(null)))}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: blocked }}
              accessibilityLabel={item.name}
              style={[st.stripItem, on && st.stripOn, blocked && { opacity: 0.35 }]}
            >
              <GarmentArt item={item} size={64} rounded={radius.sm} />
            </Pressable>
          );
        })}
      </ScrollView>
      {!pool.length ? (
        <View style={{ paddingHorizontal: space.lg }}>
          <Button label="Add clothes to your closet" variant="ghost" onPress={() => goTo('closet')} />
        </View>
      ) : null}
      <View style={{ paddingHorizontal: space.lg, marginTop: space.lg }}>
        <Button label="Retake my photo" icon="camera" variant="ghost" small onPress={() => takeSelfie('camera')} />
      </View>
    </ScrollView>
  );
}

function IconBtn({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={st.iconBtn} accessibilityRole="button" accessibilityLabel={label}>
      <Feather name={icon} size={18} color={color.ink} />
      <Text style={st.iconLabel}>{label}</Text>
    </Pressable>
  );
}

function DraggableLayer({ layer, stageW, stageH, active, onSelect, onDrag }) {
  const [fx, fy] = START[layer.item.category] ?? [0.2, 0.25];
  const pan = useRef(new Animated.ValueXY({ x: fx * stageW, y: fy * stageH })).current;
  const cb = useRef({ onSelect, onDrag });
  cb.current = { onSelect, onDrag };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          cb.current.onSelect();
          cb.current.onDrag(true);
          pan.extractOffset();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => {
          pan.flattenOffset();
          cb.current.onDrag(false);
        },
        onPanResponderTerminate: () => {
          pan.flattenOffset();
          cb.current.onDrag(false);
        },
      }),
    [pan]
  );

  const w = stageW * 0.6 * layer.scale;
  const h = w * 1.25;
  const body = layer.item.uri ? (
    <Image source={{ uri: layer.item.uri }} style={{ width: w, height: h }} resizeMode="contain" />
  ) : (
    <View style={{ width: w, height: h, borderRadius: radius.md, backgroundColor: colorInfo(layer.item.color).hex }} />
  );

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        st.layer,
        { transform: pan.getTranslateTransform(), opacity: layer.opacity },
        active && st.layerActive,
      ]}
    >
      {body}
    </Animated.View>
  );
}

const st = StyleSheet.create({
  modeSwitch: { flexDirection: 'row', borderRadius: radius.pill, borderWidth: 1, borderColor: color.line, backgroundColor: color.surface, padding: 3 },
  modeItem: { paddingHorizontal: 14, minHeight: 34, justifyContent: 'center', borderRadius: radius.pill },
  modeOn: { backgroundColor: color.ink },
  modeText: { fontFamily: font.body, fontSize: 14, fontWeight: '600', color: color.muted },
  stage: { alignSelf: 'center', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.sunk },
  layer: { position: 'absolute', left: 0, top: 0, borderWidth: 1.5, borderColor: 'transparent', borderRadius: radius.sm },
  layerActive: { borderColor: color.gold, borderStyle: 'dashed' },
  busy: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(29,26,22,0.55)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  busyText: { fontFamily: font.body, fontSize: 15, color: '#fff', textAlign: 'center', lineHeight: 22 },
  controls: { paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.md },
  controlRow: { flexDirection: 'row', gap: space.sm, justifyContent: 'space-between' },
  activeName: { fontFamily: font.display, fontSize: 18, color: color.ink },
  iconBtn: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: space.sm, borderRadius: radius.md, backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
  iconLabel: { fontFamily: font.body, fontSize: 11, color: color.muted },
  help: { fontFamily: font.body, fontSize: 13, lineHeight: 19, color: color.faint },
  stripLabel: { fontFamily: font.body, fontSize: 13, fontWeight: '600', color: color.muted, paddingHorizontal: space.lg, marginTop: space.xl, marginBottom: space.sm },
  strip: { gap: space.sm, paddingHorizontal: space.lg },
  stripItem: { borderRadius: radius.sm + 3, borderWidth: 2, borderColor: 'transparent', padding: 1 },
  stripOn: { borderColor: color.accent },
  importTile: { width: 68, height: 84, borderRadius: radius.sm, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.accent, alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2 },
  importText: { fontFamily: font.body, fontSize: 10, color: color.accent, textAlign: 'center' },
});
