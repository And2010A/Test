// 6 s preview: camera orbits the 3D-layer model, then a front shot with an idle head tilt.
const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
const lerp = (a, b, k) => a + (b - a) * k;

export default {
  width: 576, height: 1024, style: 'dark', fps: 30,
  models: [{ id: 'hero', url: '/models/hero_3d.bbmodel' }],
  frameCount: 180,
  frame(i, t) {
    const breathe = Math.sin(t * Math.PI * 2 / 3);
    const bones = {
      body: [breathe * 1.0, 0, 0],
      right_arm: [breathe * -2, 0, 3 + breathe * 1.5],
      left_arm: [breathe * 2, 0, -3 - breathe * 1.5],
      head: [Math.sin(t * 1.3) * 3, Math.sin(t * 0.9) * 6, Math.sin(t * 1.1) * 2],
    };
    let camera;
    if (t < 4) {
      const a = Math.PI * 2 * ease(t / 4) + Math.PI; // start in front of the character (-Z)
      camera = { pos: [Math.sin(a) * 68, 20, Math.cos(a) * 68], target: [0, 17, 0], fov: 32 };
    } else {
      // Push in to a portrait shot while the head tilts toward the camera.
      const k = ease((t - 4) / 1.2);
      camera = { pos: [lerp(0, 5, k), lerp(20, 24, k), lerp(-68, -50, k)], target: [0, lerp(17, 21, k), 0], fov: 32 };
      const tilt = ease((t - 4.3) / 0.8);
      bones.head = [lerp(bones.head[0], 8, tilt), lerp(bones.head[1], -10, tilt), lerp(bones.head[2], 14, tilt)];
    }
    return { camera, models: { hero: { bones } } };
  },
};
