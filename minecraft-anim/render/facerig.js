// Expression rig for a Minecraft head: hides the skin's painted eyes/mouth and replaces them with
// small planes on the face that can blink, squint into "^ ^", sparkle, frown, blush and change mouth shape.
import * as THREE from 'three';
import { NEUTRAL } from './face_presets.js';

const Z = { patch: -4.006, base: -4.01, top: -4.014 };

export function buildFaceRig(headBone, pivot, material, cfg) {
  // 1. Paint the skin's own eyes and mouth over with skin colour.
  const img = material.map.image;
  const canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  const g = canvas.getContext('2d');
  g.drawImage(img, 0, 0);
  g.fillStyle = cfg.skin;
  for (const [i, j] of cfg.erase) g.fillRect(8 + i, 8 + j, 1, 1);
  const tex = new THREE.CanvasTexture(canvas);
  for (const k of ['magFilter', 'minFilter', 'generateMipmaps', 'flipY', 'colorSpace']) tex[k] = material.map[k];
  material.map = tex;
  material.needsUpdate = true;

  // 2. Planes in head-bone space. Face pixel (i, j) -> x = 4 - i, y = 32 - j (minus the bone pivot).
  const rig = new THREE.Group();
  rig.position.set(-pivot[0], -pivot[1], -pivot[2]);
  headBone.add(rig);
  const px = (i, j) => [4 - i, 32 - j];

  const quad = (color, opacity = 1) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({ color, roughness: 0.9, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }),
    );
    m.rotation.y = Math.PI; // face -Z, the front of the head
    const holder = new THREE.Group();
    holder.add(m);
    rig.add(holder);
    return { holder, mesh: m };
  };

  const eyes = cfg.eyes.map(([i, j]) => {
    const [cx, cy] = px(i + 0.5, j + 0.5);
    return {
      cx, cy, side: Math.sign(cx),
      ball: quad(cfg.eyeColor),
      shine: quad('#ffffff'),
      caretL: quad(cfg.eyeColor),
      caretR: quad(cfg.eyeColor),
      brow: quad(cfg.browColor),
      blush: quad(cfg.blushColor, 0.7),
      lines: [0, 1, 2].map(() => quad('#d8546c', 0.8)),
    };
  });
  const [mx, my] = px(cfg.mouth[0], cfg.mouth[1]);
  const mouth = { main: quad(cfg.mouthColor), tongue: quad(cfg.tongueColor), cornerL: quad(cfg.mouthColor), cornerR: quad(cfg.mouthColor) };

  const place = (q, x, y, z, w, h, rot = 0, visible = true) => {
    q.holder.visible = visible && w > 0.01 && h > 0.01;
    q.holder.position.set(x, y, z);
    q.holder.rotation.z = rot;
    q.holder.scale.set(w, h, 1);
  };

  function update(face) {
    const f = { ...NEUTRAL, ...face };
    for (const e of eyes) {
      const lx = -f.look[0] * 0.35, ly = f.look[1] * 0.3;
      const happy = f.happy > 0.5;
      const h = Math.max(0.12, f.eyeOpen) * (1 + 0.45 * f.wide);
      const w = 1 + 0.25 * (1 - f.eyeOpen);
      const bottom = e.cy - 0.5;
      place(e.ball, e.cx + lx, bottom + h / 2 + ly, Z.base, w, h, 0, !happy);
      const shine = f.sparkle * (f.eyeOpen > 0.6 ? 1 : 0);
      place(e.shine, e.cx + lx + 0.22 * e.side, bottom + h - 0.24 + ly, Z.top, 0.34 * shine, 0.34 * shine, 0, !happy);
      // "^": two short bars leaning together.
      place(e.caretL, e.cx + 0.27, e.cy - 0.05, Z.base, 0.72, 0.24, -0.75, happy);
      place(e.caretR, e.cx - 0.27, e.cy - 0.05, Z.base, 0.72, 0.24, 0.75, happy);
      const browY = e.cy + 0.5 + 0.38 + f.browRaise + (f.wide * 0.18);
      place(e.brow, e.cx - 0.05 * e.side, browY, Z.base, 1.25, 0.22, -THREE.MathUtils.degToRad(f.browTilt) * e.side);
      // Cheeks: soft patch plus "///" when flustered.
      e.blush.mesh.material.opacity = 0.65 * f.blush;
      place(e.blush, e.cx + 0.2 * e.side, e.cy - 1.05, Z.patch, 1.55, 0.6, 0, f.blush > 0.02);
      e.lines.forEach((l, k) => {
        l.mesh.material.opacity = Math.max(0, (f.blush - 0.55) / 0.45) * 0.85;
        place(l, e.cx + 0.2 * e.side + (k - 1) * 0.42, e.cy - 1.05, Z.base, 0.11, 0.5, -0.5, f.blush > 0.55);
      });
    }
    // Mouth: a box that can open, or a "U" when smiling.
    const smiling = f.smile > 0.3;
    if (smiling) {
      const s = f.smile;
      place(mouth.main, mx, my - 0.15, Z.base, f.mouthW, 0.26);
      place(mouth.cornerL, mx + f.mouthW / 2 - 0.12, my - 0.02 + 0.12 * s, Z.base, 0.24, 0.26 + 0.28 * s);
      place(mouth.cornerR, mx - f.mouthW / 2 + 0.12, my - 0.02 + 0.12 * s, Z.base, 0.24, 0.26 + 0.28 * s);
      place(mouth.tongue, mx, my, Z.top, 0, 0, 0, false);
    } else {
      place(mouth.main, mx, my, Z.base, f.mouthW, f.mouthH);
      place(mouth.cornerL, 0, 0, Z.base, 0, 0, 0, false);
      place(mouth.cornerR, 0, 0, Z.base, 0, 0, 0, false);
      const tw = f.mouthW * 0.7, th = f.mouthH * 0.4 * f.tongue;
      place(mouth.tongue, mx, my - f.mouthH / 2 + th / 2 + 0.08, Z.top, tw, th, 0, f.tongue > 0.05 && f.mouthH > 0.5);
    }
  }

  update({});
  return { update };
}
