// Expression parameters shared by the face rig (browser) and the shot timelines (node).

export const NEUTRAL = {
  eyeOpen: 1,      // 0 closed line .. 1 open
  happy: 0,        // > 0.5 shows "^ ^" eyes
  wide: 0,         // 0..1 taller eyes for surprise
  sparkle: 0,      // 0..1 white catch-light in the eyes
  look: [0, 0],    // eye offset in skin pixels (+x = screen right, +y = up)
  browRaise: 0,    // skin pixels
  browTilt: 0,     // degrees, + = worried (inner ends up), - = angry
  blush: 0,        // 0..1
  mouthW: 2, mouthH: 1, smile: 0, tongue: 0,
};

export const FACES = {
  neutral: {},
  calm: { eyeOpen: 0.85, mouthW: 1.4, mouthH: 0.3 },
  dreamy: { eyeOpen: 0.45, mouthW: 1.2, mouthH: 0.3, blush: 0.3, browTilt: 8 },
  blink: { eyeOpen: 0 },
  happy: { happy: 1, smile: 1, mouthW: 1.6, blush: 0.5 },
  dizzy: { happy: 1, browTilt: 18, mouthW: 1.4, mouthH: 0.9, tongue: 1, blush: 0.6 },
  surprised: { wide: 1, sparkle: 1, browRaise: 0.25, mouthW: 0.9, mouthH: 0.9 },
  flustered: { eyeOpen: 0.55, browTilt: 22, blush: 1, mouthW: 1.4, mouthH: 0.26, look: [1, -0.5] },
  shy: { eyeOpen: 0.6, browTilt: 16, blush: 0.9, mouthW: 1.0, mouthH: 0.45, look: [-1, -0.6] },
  love: { sparkle: 1, wide: 0.4, blush: 1, smile: 1, mouthW: 1.4 },
  laugh: { happy: 1, mouthW: 1.7, mouthH: 1.1, tongue: 1, blush: 0.4 },
  stubborn: { eyeOpen: 0.08, browTilt: -24, mouthW: 1.5, mouthH: 0.26 },
  angry: { eyeOpen: 0.7, browTilt: -25, mouthW: 1.4, mouthH: 0.3 },
  worried: { eyeOpen: 0.85, browTilt: 24, mouthW: 1.0, mouthH: 0.4, look: [0, -0.8] },
};
