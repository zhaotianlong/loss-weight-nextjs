---
name: threejs-skills
description: Expert guidance for Three.js development. Invoke when creating 3D scenes, managing geometries, materials, or optimizing WebGL performance.
---

# Three.js Skills

A curated collection of Three.js knowledge for creating 3D elements and interactive experiences.

## Core Areas

### 1. Fundamentals
- **Scene Setup**: Proper renderer configuration, camera types (Perspective vs. Orthographic).
- **Coordinate Systems**: Understanding world space vs. local space.
- **Object3D Hierarchy**: Managing parent-child relationships for transformations.

### 2. Geometry & Materials
- **BufferGeometry**: Efficiently managing vertex data.
- **Instancing**: Using `InstancedMesh` for rendering thousands of objects.
- **PBR Materials**: `MeshStandardMaterial` and `MeshPhysicalMaterial` for realistic lighting.
- **Custom Shaders**: Using `ShaderMaterial` and GLSL for specialized effects.

### 3. Lighting & Environment
- **Light Types**: Ambient, Directional, Point, Spot, and RectArea lights.
- **Shadow Maps**: Enabling and optimizing shadows.
- **Environment Maps**: Using HDRI/EXR for realistic reflections and lighting.

### 4. Animation & Interactivity
- **Animation Loop**: Managing the `requestAnimationFrame` loop.
- **Keyframe Animation**: Using `AnimationMixer` and `AnimationClip`.
- **Raycasting**: Implementing mouse/touch interaction and object selection.

### 5. Performance Optimization
- **Object Disposal**: Properly disposing of geometries, materials, and textures to prevent memory leaks.
- **Texture Compression**: Using Basis, KTX2, or WebP.
- **LOD (Level of Detail)**: Switching geometries based on distance.

## Common Patterns

### Basic Scene Setup
```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

### Model Loading (GLTF)
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('model.gltf', (gltf) => {
  scene.add(gltf.scene);
}, undefined, (error) => {
  console.error(error);
});
```
