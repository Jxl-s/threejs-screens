import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as ThreeMeshUI from "three-mesh-ui";
import gsap from "gsap";

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
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Main container
const container = new ThreeMeshUI.Block({
  width: 1.6,
  height: 2.5,
  padding: 0.03,
  fontFamily: "./assets/Roboto-msdf.json",
  fontTexture: "./assets/Roboto-msdf.png",
  justifyContent: "start",
  alignContent: "center",
  backgroundColor: new THREE.Color(0xf7f7f7),
  borderRadius: 0.05,
});
container.position.set(0, 0, 0);
scene.add(container);

// Title
const titleBlock = new ThreeMeshUI.Block({
  width: 1.4,
  height: 0.2,
  margin: 0.02,
  justifyContent: "center",
  alignContent: "center",
  backgroundOpacity: 0,
});
const titleText = new ThreeMeshUI.Text({
  content: "My TODOs",
  fontSize: 0.18,
  fontColor: new THREE.Color(0x111111),
});
titleBlock.add(titleText);
container.add(titleBlock);

// Proper task list block
const taskList = new ThreeMeshUI.Block({
  width: 1.4,
  height: 1.7,
  padding: 0.02,
  justifyContent: "start",
  contentDirection: "column",
  alignContent: "center",
  backgroundOpacity: 0,
});
container.add(taskList);

// Buttons
const buttonRow = new ThreeMeshUI.Block({
  width: 1.4,
  height: 0.3,
  margin: 0.02,
  justifyContent: "space-around",
  alignContent: "center",
  contentDirection: "row",
  backgroundOpacity: 0,
});
container.add(buttonRow);

const addButton = new ThreeMeshUI.Block({
  width: 0.6,
  height: 0.25,
  justifyContent: "center",
  alignContent: "center",
  backgroundColor: new THREE.Color(0x28a745),
  borderRadius: 0.04,
});
addButton.add(
  new ThreeMeshUI.Text({
    content: "Add",
    fontSize: 0.14,
    fontColor: new THREE.Color(0xffffff),
  }),
);
addButton.userData.type = "add";

const deleteButton = new ThreeMeshUI.Block({
  width: 0.6,
  height: 0.25,
  justifyContent: "center",
  alignContent: "center",
  backgroundColor: new THREE.Color(0xdc3545),
  borderRadius: 0.04,
});
deleteButton.add(
  new ThreeMeshUI.Text({
    content: "Delete",
    fontSize: 0.14,
    fontColor: new THREE.Color(0xffffff),
  }),
);
deleteButton.userData.type = "delete";

buttonRow.add(addButton);
buttonRow.add(deleteButton);

// HTML Input
const input = document.createElement("input");
input.style.position = "absolute";
input.style.top = "20px";
input.style.left = "50%";
input.style.transform = "translateX(-50%)";
input.style.fontSize = "18px";
input.placeholder = "New Task";
input.style.padding = "8px";
input.style.borderRadius = "6px";
input.style.border = "1px solid #ccc";
document.body.appendChild(input);

// State
const tasks = [];
let deleteMode = false;

function createTask(text) {
  const taskBlock = new ThreeMeshUI.Block({
    width: 1.3,
    height: 0.3,
    margin: 0.01,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: new THREE.Color(0xffffff),
    borderRadius: 0.03,
  });
  const taskText = new ThreeMeshUI.Text({
    content: text,
    fontSize: 0.14,
    fontColor: new THREE.Color(0x333333),
  });
  taskBlock.add(taskText);
  taskBlock.userData.type = "task";

  taskBlock.position.z = tasks.length * -0.01; // Separate Z to avoid Z-fighting

  taskList.add(taskBlock);
  taskList.updateLayout();
  tasks.push(taskBlock);

  gsap.fromTo(taskBlock.scale, { x: 0, y: 0 }, { x: 1, y: 1, duration: 0.5 });
}

function enterDeleteMode() {
  deleteMode = true;
  tasks.forEach((task) => {
    task.set({ backgroundColor: new THREE.Color(0xffdddd) });
  });
}

function exitDeleteMode() {
  deleteMode = false;
  tasks.forEach((task) => {
    task.set({ backgroundColor: new THREE.Color(0xffffff) });
  });
}

function deleteTask(targetTask) {
  const index = tasks.indexOf(targetTask);
  if (index === -1) return;

  gsap.to(targetTask.scale, {
    x: 0,
    y: 0,
    duration: 0.4,
    onComplete: () => {
      taskList.remove(targetTask);
      tasks.splice(index, 1);
      taskList.updateLayout();
      resetZOrder();
      exitDeleteMode();
    },
  });
}

function resetZOrder() {
  tasks.forEach((task, i) => {
    task.position.z = i * -0.01;
  });
}

function findType(object) {
  while (object) {
    if (object.userData?.type)
      return { type: object.userData.type, block: object };
    object = object.parent;
  }
  return { type: null, block: null };
}

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hovered = null;

window.addEventListener("pointermove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("click", () => {
  if (!hovered) return;

  const { type, block } = findType(hovered);

  if (deleteMode) {
    if (type === "task") {
      deleteTask(block);
    }
    return;
  }

  if (type === "add") {
    const value = input.value.trim();
    if (value) {
      createTask(value);
      input.value = "";
    }
  }

  if (type === "delete") {
    if (tasks.length > 0) enterDeleteMode();
  }
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

  ThreeMeshUI.update();

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    const { type } = findType(obj);

    if (type === "add" || type === "delete" || type === "task") {
      hovered = obj;
      document.body.style.cursor = "pointer";
    } else {
      hovered = null;
      document.body.style.cursor = "auto";
    }
  } else {
    hovered = null;
    document.body.style.cursor = "auto";
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
