// Keyframe helpers for shot timelines (runs in node).
import { NEUTRAL, FACES } from './face_presets.js';

export const EASE = {
  linear: (x) => x,
  inOut: (x) => 0.5 - 0.5 * Math.cos(Math.PI * x),
  out: (x) => 1 - (1 - x) ** 3,
  in: (x) => x ** 3,
  // Overshoots a little and settles: snappy, alive pose changes.
  back: (x) => { const c = 1.9; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; },
  hold: (x) => (x < 1 ? 0 : 1),
};

const mix = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => mix(v, b[i], k)) : a + (b - a) * k);

// keys: [[time, value, ease?], ...] sorted by time. The ease belongs to the segment arriving at that key.
export function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e = 'inOut'] = keys[i];
      if (t < t1) {
        const [t0, v0] = keys[i - 1];
        return mix(v0, v1, EASE[e]((t - t0) / (t1 - t0)));
      }
    }
    return keys[keys.length - 1][1];
  };
}

// Face keys use preset names or objects: [[t, 'surprised', 'back'], [t, {...FACES.happy, blush: 1}]]
export function faceTrack(keys) {
  const full = keys.map(([t, f, e]) => [t, { ...NEUTRAL, ...(typeof f === 'string' ? FACES[f] : f) }, e]);
  const names = Object.keys(NEUTRAL);
  const tracks = Object.fromEntries(names.map((n) => [n, track(full.map(([t, f, e]) => [t, f[n], e]))]));
  return (t) => Object.fromEntries(names.map((n) => [n, tracks[n](t)]));
}

// Small decaying kick after each beat (0 at rest, 1 right on the beat).
export function beatPulse(T, beats, decay = 0.18) {
  let v = 0;
  for (const b of beats) {
    const d = T - b;
    if (d >= 0 && d < decay * 4) v = Math.max(v, Math.exp(-d / decay));
  }
  return v;
}

// Quick blink: returns 0..1 eye closure around the given times.
export function blinks(T, times, dur = 0.16) {
  let c = 0;
  for (const b of times) {
    const d = Math.abs(T - b) / (dur / 2);
    if (d < 1) c = Math.max(c, 1 - d * d);
  }
  return c;
}

export const add = (a, b) => a.map((v, i) => v + b[i]);
