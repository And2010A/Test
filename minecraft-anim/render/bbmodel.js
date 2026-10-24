// Minimal .bbmodel loader for three.js: cubes, per-face UVs, inflate and the group (bone) hierarchy.
import * as THREE from 'three';

// Same orientation table as tools/make_bbmodel.py:
// face -> [normal axis, sign, texture-x axis, sign, texture-y axis, sign]
const FACE_AXES = {
  north: [2, -1, 0, -1, 1, -1],
  south: [2, +1, 0, +1, 1, -1],
  east: [0, +1, 2, -1, 1, -1],
  west: [0, -1, 2, +1, 1, -1],
  up: [1, +1, 0, +1, 2, +1],
  down: [1, -1, 0, +1, 2, -1],
};

function cubeGeometry(el, resW, resH) {
  const infl = el.inflate || 0;
  const lo = el.from.map((v) => v - infl);
  const hi = el.to.map((v) => v + infl);
  const pos = [], nrm = [], uv = [], idx = [];
  for (const [face, f] of Object.entries(el.faces)) {
    if (!f || !f.uv || f.texture === null) continue;
    const [nAx, nS, xAx, xS, yAx, yS] = FACE_AXES[face];
    const [u1, v1, u2, v2] = f.uv;
    const base = pos.length / 3;
    const corner = (s, t) => {
      const p = [0, 0, 0];
      p[nAx] = nS > 0 ? hi[nAx] : lo[nAx];
      const xa = xS > 0 ? lo[xAx] : hi[xAx], xb = xS > 0 ? hi[xAx] : lo[xAx];
      const ya = yS > 0 ? lo[yAx] : hi[yAx], yb = yS > 0 ? hi[yAx] : lo[yAx];
      p[xAx] = xa + (xb - xa) * s;
      p[yAx] = ya + (yb - ya) * t;
      return p;
    };
    const n = [0, 0, 0]; n[nAx] = nS;
    for (const [s, t] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
      pos.push(...corner(s, t));
      nrm.push(...n);
      uv.push((u1 + (u2 - u1) * s) / resW, (v1 + (v2 - v1) * t) / resH);
    }
    // Pick the winding whose geometric normal points outward.
    const a = new THREE.Vector3(...corner(0, 0)), b = new THREE.Vector3(...corner(1, 0)), c = new THREE.Vector3(...corner(1, 1));
    const geomN = b.clone().sub(a).cross(c.clone().sub(a));
    if (geomN.dot(new THREE.Vector3(...n)) >= 0) idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    else idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

function collectPivots(nodes, out = []) {
  for (const n of nodes) {
    if (typeof n === 'string') continue;
    out.push([n.name, n.origin]);
    collectPivots(n.children, out);
  }
  return out;
}

export async function loadBBModel(json, { materialFactory } = {}) {
  const tex = await new THREE.TextureLoader().loadAsync(json.textures[0].source);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = materialFactory ? materialFactory(tex) :
    new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, roughness: 0.9, metalness: 0 });

  const { width: resW, height: resH } = json.resolution;
  const byId = new Map(json.elements.map((e) => [e.uuid, e]));
  const bones = {};

  function build(node, parentPivot) {
    if (typeof node === 'string') {
      const el = byId.get(node);
      const mesh = new THREE.Mesh(cubeGeometry(el, resW, resH), mat);
      mesh.position.set(-parentPivot[0], -parentPivot[1], -parentPivot[2]);
      mesh.name = el.name;
      return mesh;
    }
    const bone = new THREE.Group();
    bone.name = node.name;
    bone.position.set(node.origin[0] - parentPivot[0], node.origin[1] - parentPivot[1], node.origin[2] - parentPivot[2]);
    if (node.rotation) bone.rotation.set(...node.rotation.map(THREE.MathUtils.degToRad), 'ZYX');
    bone.userData.rest = { position: bone.position.clone(), rotation: bone.rotation.clone() };
    bones[node.name] = bone;
    for (const child of node.children) bone.add(build(child, node.origin));
    return bone;
  }

  const root = new THREE.Group();
  for (const node of json.outliner) root.add(build(node, [0, 0, 0]));
  return { root, bones, texture: tex, material: mat, pivots: Object.fromEntries(json.outliner ? collectPivots(json.outliner) : []) };
}
