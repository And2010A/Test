// Expression sheet for the face rig.
const faces = {
  neutral: {},
  blink: { eyeOpen: 0 },
  happy: { happy: 1, smile: 1, mouthW: 1.6, blush: 0.5 },
  surprised: { wide: 1, sparkle: 1, browRaise: 0.25, mouthW: 0.9, mouthH: 0.9 },
  flustered: { eyeOpen: 0.55, browTilt: 22, blush: 1, mouthW: 1.4, mouthH: 0.26, look: [1, -0.5] },
  love: { sparkle: 1, wide: 0.4, blush: 0.8, smile: 1, mouthW: 1.4 },
  laugh: { happy: 1, mouthW: 1.7, mouthH: 1.1, tongue: 1, blush: 0.4 },
  angry: { eyeOpen: 0.7, browTilt: -25, mouthW: 1.4, mouthH: 0.3 },
};
const names = Object.keys(faces);
export default {
  width: 360, height: 360, style: 'white', fps: 1,
  models: [{ id: 'hero', url: '/models/partner_3d.bbmodel', face: '/faces/partner.json' }],
  frameCount: names.length,
  frame(i) {
    return { camera: { pos: [3, 27.5, -21], target: [0, 26.8, 0], fov: 30 }, models: { hero: { face: faces[names[i]] } } };
  },
};
