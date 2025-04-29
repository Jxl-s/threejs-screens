import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { Text } from "troika-three-text";

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
screenGroup.add(screenMesh);

// top left button
const buttonGeometry = new THREE.PlaneGeometry(0.5, 0.2);
const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
buttonMesh.position.set(-1.25, 1.9, 0.001); // z-index offset
buttonMesh.userData.isPointer = true;

const myText = new Text();
buttonMesh.userData.onEnter = () => {
  buttonMesh.material.color.set(0x00ff00);
  myText.text = "ermmm";
};

buttonMesh.userData.onLeave = () => {
  buttonMesh.material.color.set(0xff0000);
  myText.text = "Hello world!";
};

buttonMesh.add(myText);

// Set properties to configure:
myText.text = "Hello world!";
myText.fontSize = 0.1;
myText.position.z = 0.001;
myText.color = 0x9966ff;
myText.anchorX = "center";
myText.anchorY = "middle";
myText.color = 0x000000;
myText.raycast = () => {};

// Update the rendering:
myText.sync();
screenGroup.add(buttonMesh);

scene.add(screenGroup);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("pointermove", onPointerMove);

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
let prev = null;
function animate() {
  requestAnimationFrame(animate);

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(screenGroup.children);
  if (intersects.length > 0) {
    const item = intersects[0].object;

    prev?.userData?.onLeave?.();
    prev = item;
    item?.userData?.onEnter?.();

    if (item.userData.isPointer) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "auto";
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
