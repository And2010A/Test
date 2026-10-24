// Headless scene used by render.mjs. Exposes window.setupScene() and window.renderFrame().
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadBBModel } from './bbmodel.js';
import { buildFaceRig } from './facerig.js';

const STYLES = {
  // Dark room with violet light, like the reference video.
  dark: {
    background: 0x07060d,
    ambient: [0x2a2640, 0.7],
    hemi: [0x5a4c8c, 0x08060f, 0.45],
    key: [0x9a70ff, 2.2, [-30, 28, -18]],
    rim: [0xe2d6ff, 3.0, [22, 30, 26]],
    fill: [0xffe8f4, 0.55, [12, 20, -34]],
    bloom: [0.3, 0.5, 0.6],
    exposure: 1.0,
  },
  // Neutral studio light for checking the model itself.
  studio: {
    background: 0x2a2833,
    ambient: [0xffffff, 1.0],
    hemi: [0xffffff, 0x444444, 0.8],
    key: [0xffffff, 2.2, [-14, 30, -26]],
    rim: [0xffffff, 0.8, [18, 26, 22]],
    fill: [0xffffff, 0.6, [10, 18, -30]],
    bloom: [0.0, 0.0, 1.0],
    exposure: 1.0,
  },
  // Soft white backdrop like the "Best Duo" reference: bright, low-contrast, slightly dreamy.
  white: {
    background: ['#ededf1', '#ffffff', '#f4f4f7'], // top, middle, bottom of a vertical gradient
    ambient: [0xffffff, 1.15],
    hemi: [0xffffff, 0xd8d4e4, 0.9],
    key: [0xfff4ec, 1.5, [-24, 34, -30]],
    rim: [0xe6dcff, 1.6, [20, 30, 24]],
    fill: [0xeef2ff, 0.45, [22, 14, -26]],
    bloom: [0.22, 0.6, 0.86],
    exposure: 1.0,
    toneMapping: 'none', // keep the backdrop pure white
  },
};

function gradientTexture(stops) {
  const c = document.createElement('canvas');
  c.width = 2; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  stops.forEach((col, i) => grad.addColorStop(i / (stops.length - 1), col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 2, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let renderer, scene, camera, composer, models = {};

window.setupScene = async ({ width, height, style = 'dark', models: list }) => {
  const s = STYLES[style];
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1);
  renderer.toneMapping = s.toneMapping === 'none' ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = s.exposure;
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = Array.isArray(s.background) ? gradientTexture(s.background) : new THREE.Color(s.background);
  scene.add(new THREE.AmbientLight(...s.ambient));
  scene.add(new THREE.HemisphereLight(...s.hemi));
  for (const k of ['key', 'rim', 'fill']) {
    const [c, i, p] = s[k];
    const l = new THREE.DirectionalLight(c, i);
    l.position.set(...p);
    l.target.position.set(0, 16, 0);
    scene.add(l, l.target);
  }

  camera = new THREE.PerspectiveCamera(30, width / height, 0.5, 500);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (s.bloom[0] > 0) composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), ...s.bloom));
  composer.addPass(new OutputPass());

  for (const { id, url, face, position = [0, 0, 0], rotationY = 0 } of list) {
    const json = await (await fetch(url)).json();
    const m = await loadBBModel(json);
    if (face) m.rig = buildFaceRig(m.bones.head, m.pivots.head, m.material, await (await fetch(face)).json());
    m.root.position.set(...position);
    m.root.rotation.y = THREE.MathUtils.degToRad(rotationY);
    scene.add(m.root);
    models[id] = m;
  }
  return true;
};

// frame = { camera: {pos:[x,y,z], target:[x,y,z], fov, roll}, models: { id: { rootRotY, rootPos, bones: { name: [rx,ry,rz] (deg) }, face: {...} } } }
window.renderFrame = (frame) => {
  const c = frame.camera;
  camera.position.set(...c.pos);
  if (c.fov) { camera.fov = c.fov; camera.updateProjectionMatrix(); }
  camera.lookAt(new THREE.Vector3(...c.target));
  if (c.roll) camera.rotateZ(THREE.MathUtils.degToRad(c.roll));
  for (const [id, st] of Object.entries(frame.models || {})) {
    const m = models[id];
    if (st.rootRotY !== undefined) m.root.rotation.y = THREE.MathUtils.degToRad(st.rootRotY);
    if (st.rootPos) m.root.position.set(...st.rootPos);
    if (m.rig) m.rig.update(st.face || {});
    for (const [name, b] of Object.entries(m.bones)) {
      const r = b.userData.rest.rotation;
      const d = (st.bones && st.bones[name]) || [0, 0, 0];
      b.rotation.set(r.x + THREE.MathUtils.degToRad(d[0]), r.y + THREE.MathUtils.degToRad(d[1]), r.z + THREE.MathUtils.degToRad(d[2]), 'ZYX');
    }
  }
  composer.render();
  return renderer.domElement.toDataURL('image/png');
};

window.sceneReady = true;
