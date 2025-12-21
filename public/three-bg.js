import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function getDebugEl() {
  return document.getElementById("three-debug");
}

function debug(msg) {
  const el = getDebugEl();
  if (el) {
    el.textContent = msg;
    console.log("THREE-BG DEBUG:", msg);
  } else {
    console.warn("three-debug element not found");
  }
}

// Set initial message immediately
setTimeout(() => {
  debug("Three background: module loaded, waiting for DOM...");
}, 100);

function initThreeBackground() {
  console.log("initThreeBackground called");
  // GLTF assets won't load from file:// due to browser security.
  if (window.location?.protocol === "file:") {
    debug(
      "Three background: file:// detected\nOpen via a local server (http://...) so assets can load."
    );
    return;
  }

  const container = document.getElementById("three-bg");
  if (!container) {
    debug("Three background: missing #three-bg");
    return;
  }

  if (container.dataset.threeInitialized === "true") {
    return;
  }
  container.dataset.threeInitialized = "true";

  debug(`Three background: init\nurl: ${window.location.href}`);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(90, 1, 0.01, 5000); // Wider FOV for more zoom
  // Default view suitable for the crown model
  camera.position.set(0, 1.2, 3.2);
  camera.lookAt(0, 0.8, 0);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    debug(`Three background: WebGL unavailable\n${String(e)}`);
    return;
  }

  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "none";
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 0.9));

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  let model = null;
  let mixer = null;
  let glitterParticles = [];

  // Create star shape geometry
  function createStarGeometry() {
    const shape = new THREE.Shape();
    const outerRadius = 0.08;
    const innerRadius = 0.03;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }

  // Create golden glitter rain particles
  const particleCount = 500;
  const starGeometry = createStarGeometry();
  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xb8860b,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  for (let i = 0; i < particleCount; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 15 + 5,
      (Math.random() - 0.5) * 20
    );
    star.rotation.z = Math.random() * Math.PI * 2;
    star.userData.velocity = Math.random() * 0.02 + 0.01;
    star.userData.rotationSpeed = (Math.random() - 0.5) * 0.05;
    scene.add(star);
    glitterParticles.push(star);
  }

  const loader = new GLTFLoader();
  const modelPath = "assets/crown/scene.gltf";
  debug(`Three background: loading\n${modelPath}`);

  // Add a test cube so we know three.js is working even if GLTF fails
  const testGeo = new THREE.BoxGeometry(1, 1, 1);
  const testMat = new THREE.MeshStandardMaterial({
    color: 0x4f7cff,
    emissive: 0x2a4fd0,
    emissiveIntensity: 0.5,
  });
  const testCube = new THREE.Mesh(testGeo, testMat);
  testCube.position.set(0, 0, 0);
  scene.add(testCube);
  debug(`Three background: test cube added\nLoading GLTF: ${modelPath}`);

  loader.load(
    modelPath,
    (gltf) => {
      // Remove test cube since GLTF loaded
      scene.remove(testCube);

      model = gltf.scene;

      model.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = false;
          if (c.material) {
            const mats = Array.isArray(c.material) ? c.material : [c.material];
            mats.forEach((m) => {
              if (m) {
                // Make crown golden and shiny
                m.color = new THREE.Color(0xffd700); // Gold color
                m.metalness = 0.9;
                m.roughness = 0.2;
                m.emissive = new THREE.Color(0xffaa00); // Golden glow
                m.emissiveIntensity = 0.6;
                m.needsUpdate = true;
              }
            });
          }
        }
      });

      // Fit model to fill screen - make it much larger
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      // Scale crown to a reasonable on-screen size
      const targetSize = 2.2;
      const scale = targetSize / maxDim;
      model.scale.setScalar(scale);

      scene.add(model);

      // Don't play built-in animations - we'll control rotation manually
      // if (Array.isArray(gltf.animations) && gltf.animations.length > 0) {
      //   mixer = new THREE.AnimationMixer(model);
      //   gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
      // }

      // Frame the crown
      camera.position.set(0, 1.2, 3.2);
      camera.lookAt(0, 0.8, 0);
      camera.updateProjectionMatrix();

      debug(
        `Three background: loaded\nanimations: ${
          gltf.animations?.length || 0
        }\nscale: ${scale.toFixed(5)}`
      );
    },
    (progressEvent) => {
      if (!progressEvent || !progressEvent.total) return;
      const pct = Math.round(
        (progressEvent.loaded / progressEvent.total) * 100
      );
      debug(`Three background: loading ${pct}%\n${modelPath}`);
    },
    (err) => {
      debug(
        `Three background: FAILED to load\n${modelPath}\n${
          err?.message ? err.message : String(err)
        }`
      );
    }
  );

  function resize() {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();

  function animate(t) {
    requestAnimationFrame(animate);
    const time = t * 0.05;

    // Rotate crown slowly
    if (model) {
      model.rotation.y = time * 0.001;
    } else if (testCube) {
      testCube.rotation.y = time * 0.5;
      testCube.rotation.x = time * 0.3;
    }

    // Animate glitter rain
    glitterParticles.forEach((star) => {
      star.position.y -= star.userData.velocity;
      star.rotation.z += star.userData.rotationSpeed;

      // Reset particle when it falls below screen
      if (star.position.y < -5) {
        star.position.y = 15 + Math.random() * 5;
        star.position.x = (Math.random() - 0.5) * 20;
        star.position.z = (Math.random() - 0.5) * 20;
      }
    });

    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}

window.addEventListener("DOMContentLoaded", initThreeBackground);
window.addEventListener("load", initThreeBackground);
