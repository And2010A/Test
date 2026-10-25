// Arm poses for the duo edit, checked from the card camera.
const poses = [
  ['crossed C', { right_arm: [62, -24, -70], left_arm: [54, 24, 72] }, { eyeOpen: 0.85, look: [1, 0], blush: 0.7, mouthW: 0.9, mouthH: 0.35, browTilt: -8 }],
  ['crossed B', { right_arm: [58, -20, -62], left_arm: [52, 20, 62] }, { eyeOpen: 0.85, look: [1, 0], blush: 0.7, mouthW: 0.9, mouthH: 0.35, browTilt: -8 }],
  ['clasped C', { right_arm: [68, 0, -44], left_arm: [68, 0, 44] }, { eyeOpen: 0.5, look: [0, -0.8], blush: 0.8, browTilt: 14, mouthW: 0.9, mouthH: 0.4 }],
  ['clasped D', { right_arm: [86, 0, -40], left_arm: [86, 0, 40] }, { sparkle: 1, blush: 1, smile: 1, mouthW: 1.2 }],
];
export default {
  width: 540, height: 398, style: 'white', fps: 1,
  models: [{ id: 'hero', url: '/models/hero_3d.bbmodel', face: '/faces/hero.json' }],
  frameCount: poses.length,
  frame(i) {
    const [, bones, face] = poses[i];
    return { camera: { pos: [0, 25.5, -40], target: [0, 23, 0], fov: 30 }, models: { hero: { bones, face } } };
  },
};
