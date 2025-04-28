import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 2, 4);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // <-- here
document.body.appendChild(renderer.domElement);

// Screen
const screenGroup = new THREE.Group();
const screenGeometry = new THREE.PlaneGeometry(3, 4);
const screenMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});

const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
screenMesh.rotation.x = 0;
screenGroup.add(screenMesh);
scene.add(screenGroup);

// the z-index offset will be 0.001, so that it looks like a real screen

// Simple block
//const geometry = new THREE.BoxGeometry();
//const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // and here too
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

animate();
