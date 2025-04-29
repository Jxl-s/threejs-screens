import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Text } from "troika-three-text";
import gsap from "gsap";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Screen background
const screenMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 4),
  new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
);
screenMesh.position.z = -0.01;
scene.add(screenMesh);

// Groups
const todoGroup = new THREE.Group();
scene.add(todoGroup);

const taskGroup = new THREE.Group();
todoGroup.add(taskGroup);

// Frame
const frame = new THREE.Mesh(
  new THREE.PlaneGeometry(2.5, 3.5),
  new THREE.MeshBasicMaterial({ color: 0xf0f0f0 }),
);
frame.position.set(0, 0, 0);
todoGroup.add(frame);

// Title
const title = new Text();
title.text = "TODO List";
title.fontSize = 0.2;
title.anchorX = "center";
title.anchorY = "top";
title.color = 0x111111;
title.position.set(0, 1.6, 0.01);
title.sync();
todoGroup.add(title);

// State
const tasks = [];
const raycastables = [];

// Helpers
function createTask(text) {
  const index = tasks.length;
  const offsetY = 1.2 - index * 0.6;

  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 0.4),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    }),
  );
  background.position.set(0, offsetY, 0.02 + index * 0.001);
  taskGroup.add(background);

  const checkbox = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    }),
  );
  checkbox.position.set(-0.85, offsetY, 0.03 + index * 0.001);
  taskGroup.add(checkbox);

  const label = new Text();
  label.text = text;
  label.fontSize = 0.12;
  label.anchorX = "left";
  label.anchorY = "middle";
  label.color = 0x000000;
  label.position.set(-0.6, offsetY, 0.04 + index * 0.001);
  label.sync();
  taskGroup.add(label);

  const task = { background, checkbox, label, done: false };
  tasks.push(task);

  checkbox.userData = {
    hoverCursor: true,
    onClick: () => {
      task.done = !task.done;
      checkbox.material.color.set(task.done ? 0x00ff00 : 0xffffff);
    },
    onHover: (hovered) => {
      if (!task.done)
        checkbox.material.color.set(hovered ? 0xdddddd : 0xffffff);
    },
  };
  raycastables.push(checkbox);

  gsap.to(background.material, { opacity: 1, duration: 0.5 });
  gsap.to(checkbox.material, { opacity: 1, duration: 0.5 });
}

function deleteTask() {
  if (tasks.length === 0) return;
  const task = tasks.pop();

  raycastables.splice(raycastables.indexOf(task.checkbox), 1);

  gsap.to(task.background.material, {
    opacity: 0,
    duration: 0.4,
    onComplete: () => {
      taskGroup.remove(task.background, task.checkbox, task.label);
    },
  });
  gsap.to(task.checkbox.material, { opacity: 0, duration: 0.4 });
}

function updateTasks() {
  tasks.forEach((task, i) => {
    const offsetY = 1.2 - i * 0.6;
    task.background.position.y = offsetY;
    task.checkbox.position.y = offsetY;
    task.label.position.y = offsetY;
  });
}

// Buttons
const buttonGroup = new THREE.Group();
todoGroup.add(buttonGroup);

const addButton = new THREE.Mesh(
  new THREE.PlaneGeometry(0.7, 0.3),
  new THREE.MeshBasicMaterial({ color: 0x00cc00 }),
);
addButton.position.set(-0.6, -1.4, 0.02);
buttonGroup.add(addButton);

const addLabel = new Text();
addLabel.text = "Add";
addLabel.fontSize = 0.1;
addLabel.anchorX = "center";
addLabel.anchorY = "middle";
addLabel.color = 0xffffff;
addLabel.position.set(-0.6, -1.4, 0.03);
addLabel.sync();
buttonGroup.add(addLabel);

const deleteButton = new THREE.Mesh(
  new THREE.PlaneGeometry(0.7, 0.3),
  new THREE.MeshBasicMaterial({ color: 0xcc0000 }),
);
deleteButton.position.set(0.6, -1.4, 0.02);
buttonGroup.add(deleteButton);

const deleteLabel = new Text();
deleteLabel.text = "Delete";
deleteLabel.fontSize = 0.1;
deleteLabel.anchorX = "center";
deleteLabel.anchorY = "middle";
deleteLabel.color = 0xffffff;
deleteLabel.position.set(0.6, -1.4, 0.03);
deleteLabel.sync();
buttonGroup.add(deleteLabel);

addButton.userData = {
  hoverCursor: true,
  onClick: () => {
    const value = input.value.trim();
    if (value) {
      createTask(value);
      input.value = "";
      updateTasks();
    }
  },
};

deleteButton.userData = {
  hoverCursor: true,
  onClick: () => {
    deleteTask();
    updateTasks();
  },
};

raycastables.push(addButton, deleteButton);

// HTML input
const input = document.createElement("input");
input.style.position = "absolute";
input.style.top = "20px";
input.style.left = "50%";
input.style.transform = "translateX(-50%)";
input.style.fontSize = "16px";
input.placeholder = "New Task";
document.body.appendChild(input);

// Raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;

window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("click", () => {
  if (hovered?.userData?.onClick) hovered.userData.onClick();
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animate
function animate() {
  requestAnimationFrame(animate);

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(raycastables);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    if (hovered !== hit) {
      if (hovered?.userData?.onHover) hovered.userData.onHover(false);
      if (hit.userData?.onHover) hit.userData.onHover(true);
      hovered = hit;
    }
  } else {
    if (hovered?.userData?.onHover) hovered.userData.onHover(false);
    hovered = null;
  }

  document.body.style.cursor =
    hovered && hovered.userData.hoverCursor ? "pointer" : "auto";

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Create initial tasks
createTask("Finish homework");
createTask("Buy groceries");
createTask("Clean room");
createTask("Call mom");
updateTasks();
