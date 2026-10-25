// "Best Duo" card, like the reference: one locked-off shot. First chorus the hero acts alone; on the
// second chorus the partner is suddenly there in the left foreground, side-on, looking back over the
// shoulder at the camera, while the hero plays the same shy routine again.
import fs from 'node:fs';
import { track, faceTrack, beatPulse, blinks, add } from '../render/anim.js';

const edit = JSON.parse(fs.readFileSync(new URL('../edit/duo.json', import.meta.url)));
const [W, H] = edit.size;
const IN = edit.partner_in;
const BEAT = 60 / 117.45;
const BEATS = Array.from({ length: 40 }, (_, i) => 63.065 + (i - 1) * BEAT);

const CROSSED = { r: [62, -24, -70], l: [54, 24, 72] };
const CLASPED = { r: [68, 0, -44], l: [68, 0, 44] };
const REST = { r: [0, 0, 3], l: [0, 0, -3] };

const HERO_AT = [[0, 0, 0], [-4.5, 0, 3]];   // alone / with partner
const PARTNER_AT = [7.5, 0, -4.5];
const PARTNER_YAW = -95;                    // side-on, facing screen left

// The hero's routine for chorus c (0 or 1). `side` is where the "hmph" glance goes:
// away from the camera alone, toward the partner once they are there.
function heroRole(c) {
  const w = (l, k) => edit.lines[4 * c + l].words[k].start;
  const S = c === 0 ? edit.start : IN;
  const side = c === 0 ? 1 : -1;
  const shy = { eyeOpen: 0.45, blush: 0.5, mouthW: 0.9, mouthH: 0.35, look: [0, -0.6] };
  return {
    head: track([[S, [-6, 6, -3]], [w(0, 0) + 0.6, [-8, 3, 3]], [w(0, 2), [-9, 2, 4]], [w(0, 2) + 0.45, [-13, 0, 6]],
      [w(1, 0) - 0.03, [-13, 0, 6]], [w(1, 0) + 0.22, [3, 0, 0], 'back'],
      [w(1, 4) - 0.03, [3, 0, 0]], [w(1, 4) + 0.26, [0, 15 * side, -5 * side], 'back'],
      [w(2, 0) - 0.05, [0, 13 * side, -4 * side]], [w(2, 0) + 0.45, [-10, 2, 8]], [w(2, 3) + 0.4, [-12, 0, 10]],
      [w(3, 0) - 0.05, [-12, 0, 10]], [w(3, 0) + 0.3, [-14, 0, 2]],
      [w(3, 3) - 0.03, [-14, 0, 2]], [w(3, 3) + 0.24, [4, c === 0 ? 0 : -8, 0], 'back'],
      [w(3, 5) - 0.03, [4, c === 0 ? 0 : -8, 0]], [w(3, 5) + 0.22, [6, c === 0 ? -4 : -10, 10], 'back']]),
    sway: track([[w(0, 0), 0], [w(0, 0) + 0.5, 1], [w(1, 0) - 0.1, 1], [w(1, 0), 0]]),
    no: w(3, 2),
    arms: c === 0
      ? track([[S, [CROSSED.r, CROSSED.l]], [w(3, 0), [CROSSED.r, CROSSED.l]], [w(3, 2) + 0.05, [CLASPED.r, CLASPED.l]]])
      : track([[S, [REST.r, REST.l]], [w(1, 4) - 0.04, [REST.r, REST.l]], [w(1, 4) + 0.24, [CROSSED.r, CROSSED.l], 'back'],
        [w(3, 0), [CROSSED.r, CROSSED.l]], [w(3, 2) + 0.05, [CLASPED.r, CLASPED.l]]]),
    lean: track([[w(3, 0), 1.5], [w(3, 2), -2.5], [w(3, 5), -2.5], [w(3, 5) + 0.2, -4, 'back']]),
    face: faceTrack([[S, shy], [w(0, 2), shy], [w(0, 2) + 0.3, { ...shy, eyeOpen: 0, blush: 0.7 }],
      [w(1, 0) - 0.03, { ...shy, eyeOpen: 0, blush: 0.7 }],
      [w(1, 0) + 0.15, { eyeOpen: 1, wide: 0.4, sparkle: 0.6, blush: 0.7, mouthW: 0.8, mouthH: 0.7 }, 'back'],
      [w(1, 4) - 0.02, { eyeOpen: 1, wide: 0.3, sparkle: 0.6, blush: 0.7, mouthW: 0.8, mouthH: 0.6 }],
      [w(1, 4) + 0.2, { eyeOpen: 0.8, look: [side, 0], browTilt: -9, blush: 1, mouthW: 0.8, mouthH: 0.32 }, 'out'],
      [w(2, 0) - 0.03, { eyeOpen: 0.8, look: [side, 0], browTilt: -9, blush: 1, mouthW: 0.8, mouthH: 0.32 }],
      [w(2, 0) + 0.3, { eyeOpen: 0, browTilt: 6, blush: 0.8, mouthW: 1, mouthH: 0.3 }],
      [w(3, 0) - 0.03, { eyeOpen: 0, browTilt: 6, blush: 0.8, mouthW: 1, mouthH: 0.3 }],
      [w(3, 0) + 0.25, { eyeOpen: 0.5, look: [0, -1], browTilt: 14, blush: 0.8, mouthW: 0.9, mouthH: 0.4 }],
      [w(3, 3) - 0.03, { eyeOpen: 0.5, look: [0, -1], browTilt: 14, blush: 0.8, mouthW: 0.9, mouthH: 0.4 }],
      [w(3, 3) + 0.18, { eyeOpen: 1, wide: 0.3, sparkle: 1, look: [c === 0 ? 0 : -0.8, 0], blush: 0.9, mouthW: 0.8, mouthH: 0.5 }, 'back'],
      [w(3, 5) - 0.02, { eyeOpen: 1, wide: 0.3, sparkle: 1, look: [c === 0 ? 0 : -0.8, 0], blush: 0.9, mouthW: 0.8, mouthH: 0.5 }],
      [w(3, 5) + 0.16, { eyeOpen: 1, wide: 0.2, sparkle: 1, look: [c === 0 ? 0 : -0.5, 0], blush: 1, smile: 1, mouthW: 1.2 }, 'back']]),
    blinks: [w(1, 0) + 0.85, w(1, 6) + 0.1, w(3, 4) + 0.5],
  };
}

const roles = [heroRole(0), heroRole(1)];

// Partner: looks back over the shoulder at the camera with a soft smile, glances at the hero on
// "вижу тебя", laughs on "Нет", melts on "Люблю".
const pw = (l, k) => edit.lines[4 + l].words[k].start;
const soft = { eyeOpen: 0.7, smile: 0.7, mouthW: 1.3, blush: 0.4 };
const partner = {
  head: track([[IN, [4, 80, -8]], [pw(1, 4) - 0.05, [4, 82, -8]], [pw(1, 4) + 0.3, [2, 96, -4], 'back'],
    [pw(2, 0), [2, 94, -4]], [pw(2, 0) + 0.5, [5, 80, -10]], [pw(3, 2) + 0.05, [8, 80, -6], 'back'],
    [pw(3, 5) - 0.03, [6, 80, -8]], [pw(3, 5) + 0.3, [3, 88, -12], 'back']]),
  face: faceTrack([[IN, soft], [pw(1, 4) - 0.03, soft], [pw(1, 4) + 0.2, { ...soft, look: [1, 0], eyeOpen: 0.85 }, 'out'],
    [pw(2, 0) + 0.1, { ...soft, look: [1, 0], eyeOpen: 0.85 }], [pw(2, 0) + 0.5, { ...soft, eyeOpen: 0.5 }],
    [pw(3, 2) - 0.02, { ...soft, eyeOpen: 0.5 }], [pw(3, 2) + 0.12, { happy: 1, mouthW: 1.4, mouthH: 0.9, tongue: 1, blush: 0.5 }, 'back'],
    [pw(3, 3) + 0.2, { happy: 1, mouthW: 1.4, mouthH: 0.9, tongue: 1, blush: 0.5 }], [pw(3, 4), soft],
    [pw(3, 5) + 0.05, soft], [pw(3, 5) + 0.25, { happy: 1, smile: 1, mouthW: 1.3, blush: 1 }, 'back']]),
  blinks: [72.9, 75.4, 77.2],
};

function idle(T, phase = 0) {
  const br = Math.sin((T + phase) * Math.PI * 2 / 3.4);
  return {
    body: [br * 0.6, 0, Math.sin((T + phase) * Math.PI * 2 / (4 * BEAT)) * 0.8], head: [0, 0, 0],
    right_arm: [br * -1, 0, 3 + br * 0.8], left_arm: [br * 1, 0, -3 - br * 0.8],
    right_leg: [0, 0, 0], left_leg: [0, 0, 0],
  };
}

const cam = [
  track([[edit.start, [0, 26, -38.5, 0, 24.6, 0]], [IN, [0, 26, -35, 0, 25, 0]]]),
  track([[IN, [0.8, 26.5, -45, 0.8, 24.6, 0]], [edit.end, [0.8, 26.5, -42.5, 0.6, 24.8, 0]]]),
];

function frameAt(T) {
  const c = T < IN ? 0 : 1;
  const r = roles[c];
  const pulse = beatPulse(T, BEATS);

  const hb = idle(T);
  const ph = T * Math.PI * 2 / (4 * BEAT); // one slow sway per bar while the head "spins"
  hb.head = add(r.head(T), [0, 0, r.sway(T) * 5 * Math.sin(ph)]);
  if (r.no < T && T < r.no + 0.42) hb.head[1] += 7 * Math.sin((T - r.no) * Math.PI * 2 / 0.21);
  const [ra, la] = r.arms(T);
  hb.right_arm = add(ra, hb.right_arm.map((v, i) => (i === 2 ? v - 3 : v)));
  hb.left_arm = add(la, hb.left_arm.map((v, i) => (i === 2 ? v + 3 : v)));
  hb.body[0] += r.lean(T) - pulse * 0.8;
  const hf = r.face(T);
  if (hf.happy < 0.5) hf.eyeOpen *= 1 - blinks(T, r.blinks);

  const models = {
    hero: { rootPos: HERO_AT[c], rootRotY: c === 0 ? 0 : -8, bones: hb, face: hf },
    partner: { rootPos: [0, -1000, 0] },
  };
  if (c === 1) {
    const pb = idle(T, 1.3);
    pb.head = partner.head(T);
    pb.body[0] -= pulse * 0.6;
    const pf = partner.face(T);
    if (pf.happy < 0.5) pf.eyeOpen *= 1 - blinks(T, partner.blinks);
    models.partner = { rootPos: PARTNER_AT, rootRotY: PARTNER_YAW, bones: pb, face: pf };
  }
  const k = cam[c](T);
  return { camera: { pos: k.slice(0, 3), target: k.slice(3), fov: 30 }, models };
}

export default {
  width: W, height: H, style: 'card', fps: edit.fps,
  models: [
    { id: 'hero', url: '/models/hero_3d.bbmodel', face: '/faces/hero.json' },
    { id: 'partner', url: '/models/partner_3d.bbmodel', face: '/faces/partner.json' },
  ],
  frameCount: Math.round((edit.end - edit.start) * edit.fps),
  frame: (i, t) => frameAt(edit.start + t),
};
