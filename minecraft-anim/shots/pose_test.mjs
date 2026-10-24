// Arm/head poses used by the intro, checked from the camera angles they are shot at.
const poses = [
  ['head hold', { right_arm: [168, 0, 14], left_arm: [168, 0, -14], head: [-6, 0, 10] }, { happy: 1, browTilt: 18, blush: 0.6, mouthW: 1.4, mouthH: 0.9, tongue: 1 }],
  ['hand to mouth', { right_arm: [100, -10, 30], head: [4, -8, -6] }, { wide: 1, sparkle: 1, blush: 1, browRaise: 0.2, mouthW: 0.9, mouthH: 0.9 }],
  ['hands on heart', { right_arm: [36, 0, -50], left_arm: [8, 0, -4], head: [-4, 0, 8] }, { happy: 1, smile: 1, mouthW: 1.6, blush: 0.8 }],
  ['stop / no', { right_arm: [88, 6, -6], head: [0, 22, 0] }, { eyeOpen: 0.08, browTilt: -24, mouthW: 1.5, mouthH: 0.26 }],
];
export default {
  width: 540, height: 404, style: 'white', fps: 1,
  models: [{ id: 'hero', url: '/models/hero_3d.bbmodel', face: '/faces/hero.json' }],
  frameCount: poses.length,
  frame(i) {
    const [, bones, face] = poses[i];
    return { camera: { pos: [6, 26.5, -38], target: [0, 25.5, 0], fov: 30 }, models: { hero: { bones, face } } };
  },
};
