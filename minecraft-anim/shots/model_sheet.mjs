// Studio-lit views of both model variants, for checking the texture mapping.
const views = [
  ['hero', 0, 18, [0, 18, -70]],      // flat, front
  ['hero3d', 0, 18, [0, 18, -70]],    // 3d, front
  ['hero3d', 0, 18, [48, 26, -48]],   // 3d, 3/4 from character's right
  ['hero3d', 0, 18, [-70, 18, 0]],    // 3d, left side
  ['hero3d', 0, 18, [0, 18, 70]],     // 3d, back
  ['hero3d', 0, 24, [0, 60, -30]],    // 3d, from above
];

export default {
  width: 400, height: 640, style: 'studio', fps: 1,
  models: [
    { id: 'hero', url: '/models/hero.bbmodel' },
    { id: 'hero3d', url: '/models/hero_3d.bbmodel' },
  ],
  frameCount: views.length,
  frame(i) {
    const [id, , ty, pos] = views[i];
    const hide = id === 'hero' ? 'hero3d' : 'hero';
    return {
      camera: { pos, target: [0, ty, 0], fov: 32 },
      models: { [id]: { rootPos: [0, 0, 0] }, [hide]: { rootPos: [0, -1000, 0] } },
    };
  },
};
