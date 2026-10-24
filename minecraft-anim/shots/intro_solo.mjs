// Opening: hero alone on the white backdrop, chorus lines 1-2 ("Моя голова винтом" / "Когда я перед собой вижу тебя наяву").
// Rendered at the size of the middle band; tools/compose.py adds the blurred bands, flashes and subtitles.
import fs from 'node:fs';

const edit = JSON.parse(fs.readFileSync(new URL('../edit/intro.json', import.meta.url)));
const [W, H] = edit.band;
const CUT = edit.cuts[0];
const BAR = 60 / 117.45 * 4;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));
const lerp = (a, b, k) => a + (b - a) * k;
const orbit = (deg, dist, y) => {
  const a = deg * Math.PI / 180; // 0 = straight in front of the character (-Z), + = toward its right (+X)
  return [Math.sin(a) * dist, y, -Math.cos(a) * dist];
};

function idle(T) {
  const br = Math.sin(T * Math.PI * 2 / 3.2);
  return {
    body: [br * 0.8, 0, Math.sin(T * Math.PI * 2 / BAR) * 1.2],
    right_arm: [br * -1.5, 0, 3 + br * 1.2],
    left_arm: [br * 1.5, 0, -3 - br * 1.2],
    right_leg: [0, 0, 0],
    left_leg: [0, 0, 0],
  };
}

function shotA(T) {
  // Line 1: slow push-in; the head drifts in a small circle, one turn per bar ("голова винтом").
  const k = (T - edit.start) / (CUT - edit.start);
  const bones = idle(T);
  const amp = lerp(1.5, 5, ease(k * 1.5));
  const ph = (T - edit.lines[0].start) / BAR * Math.PI * 2;
  bones.head = [Math.sin(ph) * amp - 2, lerp(18, 4, ease(k)), Math.cos(ph) * amp];
  return {
    camera: { pos: orbit(lerp(16, 5, ease(k)), lerp(46, 37, ease(k)), lerp(25.5, 27, ease(k))), target: [0, lerp(24.5, 26, ease(k)), 0], fov: 30 },
    bones,
  };
}

function shotB(T) {
  // Line 2: low close-up; looks down and away, then up into the camera on "вижу тебя", hand to chest.
  const k = (T - CUT) / (edit.end - CUT);
  const bones = idle(T);
  const look = ease((T - (CUT + 1.45)) / 0.6);
  bones.head = [lerp(-14, 5, look), lerp(-24, -6, look), lerp(-4, 11, look)];
  const hand = ease((T - (CUT + 1.7)) / 0.7);
  bones.right_arm = [lerp(bones.right_arm[0], 52, hand), lerp(0, -12, hand), lerp(bones.right_arm[2], -24, hand)];
  bones.body[0] += lerp(0, 3, hand);
  const push = ease(k);
  return {
    camera: { pos: orbit(lerp(-12, -7, push), lerp(33, 28.5, push), 23.5), target: [0, 25.5, 0], fov: 30 },
    bones,
  };
}

export default {
  width: W, height: H, style: 'white', fps: edit.fps,
  models: [{ id: 'hero', url: '/models/hero_3d.bbmodel' }],
  frameCount: Math.round((edit.end - edit.start) * edit.fps),
  frame(i, t) {
    const T = edit.start + t;
    const s = T < CUT ? shotA(T) : shotB(T);
    return { camera: s.camera, models: { hero: { bones: s.bones } } };
  },
};
