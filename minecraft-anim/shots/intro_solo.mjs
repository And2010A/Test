// Opening: hero alone over the first chorus, one shot per line, every action keyed to a sung word.
// Rendered at the size of the middle band; tools/compose.py adds the blurred bands, flashes and subtitles.
import fs from 'node:fs';
import { track, faceTrack, beatPulse, blinks, add } from '../render/anim.js';
import { FACES } from '../render/face_presets.js';

const edit = JSON.parse(fs.readFileSync(new URL('../edit/intro.json', import.meta.url)));
const [W, H] = edit.band;
const [C1, C2, C3] = edit.cuts;
const BEAT = 60 / 117.45;
const BEATS = Array.from({ length: 24 }, (_, i) => 63.065 + (i - 1) * BEAT);
const w = (l, k) => edit.lines[l].words[k].start; // start of word k of line l

const orbit = (deg, dist, y) => {
  const a = deg * Math.PI / 180; // 0 = in front of the character (-Z), + = toward its right (+X)
  return [Math.sin(a) * dist, y, -Math.cos(a) * dist];
};

const REST = { right_arm: [0, 0, 3], left_arm: [0, 0, -3] };
const HEAD_HOLD = { right_arm: [168, 0, 14], left_arm: [168, 0, -14] };
const HAND_FACE = [100, -10, 30];
const HAND_HEART = [36, 0, -50];
const STOP = [88, 6, -6];

// ---------- line 1: "Моя голова винтом" ----------
const s1 = {
  head: track([[62.9, [-12, 16, -5]], [w(0, 0) - 0.05, [-12, 16, -5]], [w(0, 0) + 0.22, [4, 0, 0], 'back'], [w(0, 2), [0, 0, 6]], [w(0, 2) + 0.2, [-6, 0, 10], 'back']]),
  dizzy: track([[w(0, 1) - 0.08, 0], [w(0, 1) + 0.25, 1, 'out'], [C1 - 0.1, 1], [C1, 0.6]]),
  rArm: track([[w(0, 2) - 0.08, REST.right_arm], [w(0, 2) + 0.16, HEAD_HOLD.right_arm, 'back']]),
  lArm: track([[w(0, 2) - 0.04, REST.left_arm], [w(0, 2) + 0.2, HEAD_HOLD.left_arm, 'back']]),
  face: faceTrack([[62.9, 'dreamy'], [w(0, 0) - 0.04, 'dreamy'], [w(0, 0) + 0.16, 'love', 'back'], [w(0, 1) - 0.02, 'love'], [w(0, 1) + 0.16, 'dizzy', 'out']]),
  cam: track([[62.9, [14, 39, 26.5, 25.6]], [C1, [4, 33.5, 26.8, 25.9]]]),
};

// ---------- line 2: "Когда я перед собой вижу тебя наяву" ----------
const s2 = {
  head: track([[C1, [-2, 28, 5]], [w(1, 4) - 0.04, [-1, 24, 4]], [w(1, 4) + 0.16, [6, -3, -3], 'back'],
    [w(1, 5) + 0.02, [5, -4, 2]], [w(1, 5) + 0.2, [4, -6, 11], 'back'], [w(1, 6) + 0.25, [8, -8, 13], 'out']]),
  rArm: track([[C1, REST.right_arm], [w(1, 6) - 0.1, REST.right_arm], [w(1, 6) + 0.12, HAND_FACE, 'back']]),
  body: track([[w(1, 6) - 0.05, 0], [w(1, 6) + 0.25, 4, 'back']]),
  face: faceTrack([[C1, { ...FACES.calm, look: [1.2, 0] }], [w(1, 4) - 0.02, { ...FACES.calm, look: [1.2, 0] }], [w(1, 4) + 0.12, 'surprised', 'back'],
    [w(1, 5), 'surprised'], [w(1, 5) + 0.3, { ...FACES.surprised, blush: 1, wide: 0.8 }, 'out']]),
  blink: [66.12],
  cam: track([[C1, [-15, 29, 25.6, 27.2]], [w(1, 4) - 0.02, [-12, 28, 25.6, 27.2]], [w(1, 4) + 0.18, [-9, 25, 25.8, 27.4], 'back'], [C2, [-8, 24.5, 25.8, 27.4]]]),
};

// ---------- line 3: "Сердце моё полно веществом" ----------
const s3 = {
  head: track([[C2, [6, -6, 10]], [w(2, 0) + 0.2, [-6, 0, 10], 'back'],
    [68.06, [-6, 2, -9], 'back'], [68.57, [-6, -2, 9], 'back'], [69.08, [-5, 2, -9], 'back'], [69.59, [-2, 0, 4], 'back']]),
  rArm: track([[C2, HAND_FACE], [w(2, 0) - 0.06, HAND_FACE], [w(2, 0) + 0.16, HAND_HEART, 'back']]),
  face: faceTrack([[C2, { ...FACES.surprised, blush: 1, wide: 0.8 }], [w(2, 0) - 0.04, { ...FACES.surprised, blush: 1 }], [w(2, 0) + 0.14, { ...FACES.happy, blush: 0.9 }, 'out'],
    [69.2, { ...FACES.happy, blush: 0.9 }], [69.45, { ...FACES.dreamy, blush: 0.8 }]]),
  cam: track([[C2, [12, 34, 25, 25.2]], [C3, [6, 30.5, 25.2, 25.4]]]),
};

// ---------- line 4: "Я говорю: «Нет», а оно: «Люблю»" ----------
const NO = w(3, 2), LOVE = w(3, 5);
const s4 = {
  head: track([[C3, [0, 0, 0]], [w(3, 1) + 0.1, [-3, 0, 0], 'back'], [NO + 0.5, [-3, 0, 0]], [w(3, 4), [-15, 3, -4], 'out'],
    [LOVE - 0.03, [-15, 3, -4]], [LOVE + 0.18, [6, -4, 12], 'back']]),
  shake: track([[NO - 0.03, 0], [NO + 0.06, 1, 'out'], [NO + 0.42, 1], [NO + 0.55, 0]]),
  rArm: track([[C3, HAND_HEART], [C3 + 0.15, REST.right_arm], [NO - 0.06, REST.right_arm], [NO + 0.1, STOP, 'back'], [w(3, 3) + 0.05, STOP], [w(3, 4) + 0.08, HAND_HEART, 'out']]),
  lArm: track([[LOVE - 0.03, REST.left_arm], [LOVE + 0.18, [20, 0, -18], 'back']]),
  hop: track([[LOVE - 0.02, 0], [LOVE + 0.14, 1.3, 'out'], [LOVE + 0.38, 0, 'in'], [LOVE + 0.5, 0.15, 'out'], [LOVE + 0.6, 0, 'in']]),
  face: faceTrack([[C3, { ...FACES.angry, browTilt: -12, eyeOpen: 0.9 }], [NO - 0.02, { ...FACES.angry, browTilt: -12 }], [NO + 0.06, 'stubborn', 'out'],
    [w(3, 3), 'stubborn'], [w(3, 3) + 0.15, 'worried', 'out'], [LOVE - 0.02, 'worried'], [LOVE + 0.12, 'love', 'back']]),
  blink: [71.62],
  cam: track([[C3, [-2, 30, 26, 26.2]], [LOVE - 0.05, [-4, 28, 26, 26.4]], [LOVE + 0.25, [-5, 26, 26.6, 27.4], 'back'], [72.0, [-6, 25, 26.6, 27.4]]]),
};

export function frameAt(T) {
  const pulse = beatPulse(T, BEATS);
  const br = Math.sin(T * Math.PI * 2 / 3.2);
  const bones = {
    body: [br * 0.6 - pulse * 1.5, 0, 0],
    head: [0, 0, 0],
    right_arm: [br * -1.2, 0, 3 + br], left_arm: [br * 1.2, 0, -3 - br],
    right_leg: [0, 0, 0], left_leg: [0, 0, 0],
  };
  let face, cam, roll = 0, fovPunch = 0, rootY = 0, blinkTimes = [63.25, 64.2];

  if (T < C1) {
    const d = s1.dizzy(T);
    const ph = (T - w(0, 1)) / BEAT * Math.PI * 2; // one head turn per beat: "винтом"
    bones.head = add(s1.head(T), [d * 9 * Math.sin(ph), d * 4 * Math.sin(ph / 2), d * 11 * Math.cos(ph)]);
    bones.body[2] = -d * 4 * Math.cos(ph);
    bones.right_arm = s1.rArm(T);
    bones.left_arm = s1.lArm(T);
    face = s1.face(T);
    cam = s1.cam(T);
    roll = d * 3 * Math.sin(ph / 2);
  } else if (T < C2) {
    bones.head = s2.head(T);
    bones.right_arm = s2.rArm(T);
    bones.body[0] += s2.body(T);
    face = s2.face(T);
    cam = s2.cam(T);
    blinkTimes = s2.blink;
  } else if (T < C3) {
    bones.head = s3.head(T);
    bones.right_arm = s3.rArm(T);
    bones.body[0] -= pulse * 2.5; // heartbeat
    face = s3.face(T);
    cam = s3.cam(T);
    roll = -4;
    fovPunch = pulse * 1.6;
  } else {
    const sh = s4.shake(T);
    bones.head = add(s4.head(T), [0, sh * 26 * Math.sin((T - NO) * Math.PI * 2 / 0.24), 0]);
    bones.right_arm = s4.rArm(T);
    bones.left_arm = s4.lArm(T);
    rootY = s4.hop(T);
    face = s4.face(T);
    cam = s4.cam(T);
    blinkTimes = s4.blink;
  }
  if (!face.happy || face.happy < 0.5) face.eyeOpen *= 1 - blinks(T, blinkTimes);

  const [ang, dist, cy, ty] = cam;
  return {
    camera: { pos: orbit(ang, dist, cy), target: [0, ty, 0], fov: 30 - fovPunch, roll },
    models: { hero: { bones, face, rootPos: [0, rootY, 0] } },
  };
}

export default {
  width: W, height: H, style: 'white', fps: edit.fps,
  models: [{ id: 'hero', url: '/models/hero_3d.bbmodel', face: '/faces/hero.json' }],
  frameCount: Math.round((edit.end - edit.start) * edit.fps),
  frame: (i, t) => frameAt(edit.start + t),
};
