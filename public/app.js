import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(3, 3, 3);

// Renderer setup
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// BUG 1: Material transparency configuration error
// The material has transparent set to false but opacity less than 1
// This causes rendering issues
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshPhongMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.7,
    shininess: 100
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add wireframe for better visibility
const wireframe = new THREE.WireframeGeometry(geometry);
const line = new THREE.LineSegments(wireframe);
line.material.color.setHex(0x000000);
line.material.opacity = 0.3;
line.material.transparent = true;
cube.add(line);

// BUG 2: OrbitControls rotation direction is inverted
// The mouse drag direction is opposite to expected
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;

// Animation state
let isAnimating = true;
let rotationSpeed = 0.01;

// Store initial states for reset
const initialCameraPosition = camera.position.clone();
const initialCubeRotation = cube.rotation.clone();
const initialCubeScale = cube.scale.clone();

// BUG 3: Animation loop doesn't use deltaTime
// This causes inconsistent animation speed across different devices
let lastTime = 0;
function animate(time) {
    requestAnimationFrame(animate);

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if (isAnimating) {
        cube.rotation.x += rotationSpeed * deltaTime * 60;
        cube.rotation.y += rotationSpeed * deltaTime * 60;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate(0);

// BUG 4: Reset function is incomplete
// Only resets camera position, not cube rotation and scale
document.getElementById('resetBtn').addEventListener('click', () => {
    camera.position.copy(initialCameraPosition);
    cube.rotation.copy(initialCubeRotation);
    cube.scale.copy(initialCubeScale);
    controls.target.set(0, 0, 0);
    controls.update();
});

document.getElementById('animateBtn').addEventListener('click', () => {
    isAnimating = !isAnimating;
    const btn = document.getElementById('animateBtn');
    btn.textContent = isAnimating ? 'Pause Animation' : 'Resume Animation';
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
