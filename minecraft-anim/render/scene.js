// Headless scene used by render.mjs. Exposes window.setupScene() and window.renderFrame().
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadBBModel } from './bbmodel.js';

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
};

let renderer, scene, camera, composer, models = {};

window.setupScene = async ({ width, height, style = 'dark', models: list }) => {
  const s = STYLES[style];
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = s.exposure;
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(s.background);
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

  for (const { id, url, position = [0, 0, 0], rotationY = 0 } of list) {
    const json = await (await fetch(url)).json();
    const m = await loadBBModel(json);
    m.root.position.set(...position);
    m.root.rotation.y = THREE.MathUtils.degToRad(rotationY);
    scene.add(m.root);
    models[id] = m;
  }
  return true;
};

// frame = { camera: {pos:[x,y,z], target:[x,y,z], fov}, models: { id: { rootRotY, rootPos, bones: { name: [rx,ry,rz] (deg) } } } }
window.renderFrame = (frame) => {
  const c = frame.camera;
  camera.position.set(...c.pos);
  if (c.fov) { camera.fov = c.fov; camera.updateProjectionMatrix(); }
  camera.lookAt(new THREE.Vector3(...c.target));
  for (const [id, st] of Object.entries(frame.models || {})) {
    const m = models[id];
    if (st.rootRotY !== undefined) m.root.rotation.y = THREE.MathUtils.degToRad(st.rootRotY);
    if (st.rootPos) m.root.position.set(...st.rootPos);
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
