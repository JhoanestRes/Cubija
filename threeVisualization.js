// threeVisualization.js
let scene, camera, renderer;
let boxesGroup, palletMesh;

function initThree(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.set(200, 200, 200);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 200, 100);
  scene.add(directionalLight);

  boxesGroup = new THREE.Group();
  scene.add(boxesGroup);

  const palletGeometry = new THREE.BoxGeometry(120, 10, 80);
  const palletMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  palletMesh = new THREE.Mesh(palletGeometry, palletMaterial);
  palletMesh.position.set(0, 5, 0);
  scene.add(palletMesh);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function drawBoxes3D(boxesData) {
  if (!boxesGroup) return;

  while (boxesGroup.children.length > 0) {
    const child = boxesGroup.children[0];
    boxesGroup.remove(child);
    child.geometry.dispose();
    child.material.dispose();
  }

  const { xCount, yCount, layers, boxDims } = boxesData;

  const boxGeometry = new THREE.BoxGeometry(boxDims.x, boxDims.z, boxDims.y);
  const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x3b82f6, opacity: 0.7, transparent: true });

  for (let layer = 0; layer < layers; layer++) {
    for (let x = 0; x < xCount; x++) {
      for (let y = 0; y < yCount; y++) {
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(
          x * boxDims.x - (xCount * boxDims.x) / 2 + boxDims.x / 2,
          10 + layer * boxDims.z + boxDims.z / 2,
          y * boxDims.y - (yCount * boxDims.y) / 2 + boxDims.y / 2
        );
        boxesGroup.add(boxMesh);
      }
    }
  }
}

window.ThreeVis = {
  initThree,
  drawBoxes3D
};