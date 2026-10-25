// Small hand-held props, drawn as pixel art on a canvas and attached to a bone.
import * as THREE from 'three';

function pixelTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Love letter: cream envelope with a flap and a red heart, 20x14 px.
function letter() {
  const face = pixelTexture(20, 14, (g) => {
    g.fillStyle = '#fff6ea'; g.fillRect(0, 0, 20, 14);
    g.fillStyle = '#dcc7ad';
    g.fillRect(0, 0, 20, 1); g.fillRect(0, 13, 20, 1); g.fillRect(0, 0, 1, 14); g.fillRect(19, 0, 1, 14);
    for (let x = 1; x < 10; x++) { const y = Math.round(x * 0.62); g.fillRect(x, y, 1, 1); g.fillRect(19 - x, y, 1, 1); }
    g.fillStyle = '#e8394f';
    const heart = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
    heart.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'X') g.fillRect(6 + x, 6 + y, 1, 1); }));
    g.fillStyle = '#ff8a9a'; g.fillRect(7, 7, 1, 1);
  });
  const edge = new THREE.MeshStandardMaterial({ color: '#efe2cf', roughness: 0.9 });
  const front = new THREE.MeshStandardMaterial({ map: face, roughness: 0.9 });
  // Box axes: x = width, y = thickness (points along the arm), z = height. The -Y face shows the art.
  return new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 3.5), [edge, edge, edge, front, edge, edge]);
}

const KINDS = { letter };

// spec: { id, kind, bone, pos: [x,y,z] in bone space, rot: [deg,deg,deg] }
export function buildProps(model, specs) {
  const out = {};
  for (const s of specs) {
    const holder = new THREE.Group();
    const mesh = KINDS[s.kind]();
    holder.add(mesh);
    holder.position.set(...s.pos);
    holder.rotation.set(...(s.rot || [0, 0, 0]).map(THREE.MathUtils.degToRad));
    holder.visible = false;
    model.bones[s.bone].add(holder);
    out[s.id] = holder;
  }
  return out;
}

// state: { id: scale 0..1 } — 0 hides the prop.
export function updateProps(props, state = {}) {
  for (const [id, holder] of Object.entries(props)) {
    const k = state[id] || 0;
    holder.visible = k > 0.01;
    holder.scale.setScalar(Math.max(0.01, k));
  }
}
