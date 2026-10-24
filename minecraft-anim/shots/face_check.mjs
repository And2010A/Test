// Close-ups for checking the face and the joints of the 3D-layer model.
const views = [
  { pos: [5, 24, -50], target: [0, 21, 0], head: [8, -10, 14], style: 'dark' },  // same angle as the turntable ending
  { pos: [0, 26, -34], target: [0, 26, 0], head: [0, 0, 0] },                     // face, straight on
  { pos: [-20, 20, -30], target: [0, 24, 0], head: [-10, 0, 0] },                 // from below-left, chin/neck
  { pos: [26, 20, -36], target: [0, 10, 0], head: [0, 0, 0] },                    // legs and arms from the side
];

export default {
  width: 540, height: 720, style: 'studio', fps: 1,
  models: [{ id: 'hero', url: '/models/hero_3d.bbmodel' }],
  frameCount: views.length,
  frame(i) {
    const v = views[i];
    return { camera: { pos: v.pos, target: v.target, fov: 32 }, models: { hero: { bones: { head: v.head } } } };
  },
};
